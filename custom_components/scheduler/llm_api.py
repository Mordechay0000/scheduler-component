"""Shabbat plans, as an LLM API Home Assistant serves itself.

Registering an API here is worth more than shipping a separate MCP server: it
is served over Home Assistant's own MCP Server integration at
`/api/mcp/<api id>` without a second process or a long-lived token, and the
same tools become available to Assist and to whichever conversation agent the
household already uses.

The vocabulary is the plan's, never the engine's. A caller says "the hotplate
runs on its own from 11:30 to 13:00" and this turns it into a timeslot on its
own track at a higher priority - which is the mechanism that makes the group
leave the hotplate alone until the exception ends and take it back afterwards.
Nothing in a tool signature mentions a track.
"""
from __future__ import annotations

import logging
from typing import Any

import voluptuous as vol
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import config_validation as cv, llm
from homeassistant.util.json import JsonObjectType

from . import const
from .plan_model import (
    PLAN_TAG,
    PlanError,
    PlanException,
    plan_from_dict,
    plan_from_schedule,
    plan_to_dict,
    plan_to_payload,
    warnings_for,
)
from .plan_times import ANCHOR_NAMES, DEFAULT_ANCHORS, TimeError, parse_time

_LOGGER = logging.getLogger(__name__)

API_ID = f"{const.DOMAIN}_shabbat"
API_NAME = "Shabbat plans"

#: entity domains worth putting in a plan - a temperature reading is not one
SCHEDULABLE_DOMAINS = ("light", "switch", "fan", "climate", "input_boolean", "media_player")

API_PROMPT = """
You can read and write the household's Shabbat plan.

WHAT A PLAN IS
A plan is one band of time, from candle lighting to havdalah, cut into named
stretches. It is not a weekly repeat: both ends are read from the Jewish
calendar every week, so the plan follows the season by itself and covers a
festival - including one running two or three days - with no extra work.

  groups     - devices that move together. Each group has its own row of
               stretches; a boundary in one group never moves another's.
  exceptions - one device running its own hours for a while. While an exception
               runs, that device's group leaves it alone; when it ends the
               group takes it back. Nothing else moves.

WRITING A TIME - only these shapes are accepted
  candle_lighting        exactly when Shabbat comes in
  havdalah               exactly when it goes out
  havdalah-30m           30 minutes before it goes out (also 1h, 1h30m, 01:30)
  candle_lighting+1h     an hour after it comes in
  havdalah@06:30         06:30 on the DAY it goes out
  13:00                  13:00 EVERY day - almost never right inside a plan

The mistake to avoid: an ordinary clock time inside the band, such as "off at
22:30 on Friday night", must be written candle_lighting@22:30 - 22:30 on the
day the band opened. A plain "22:30" fires every night of the week. Call
scheduler_explain_time when unsure.

HOW TO WORK
  1. scheduler_list_devices     to find entity ids
  2. scheduler_get_plan         to see what exists
  3. scheduler_save_plan        to write the whole plan in one call
  4. scheduler_add_exception / scheduler_remove_exception for one device

scheduler_save_plan replaces the plan entirely, in a single write, so send the
whole plan every time. To change one thing: get the plan, edit what came back,
send it back.

A WORKED PLAN
{
  "name": "Shabbat",
  "groups": [{
    "name": "home",
    "devices": ["light.salon", "switch.boiler"],
    "cubes": [
      {"name": "coming in", "from": "candle_lighting",       "to": "candle_lighting@22:30", "state": "on"},
      {"name": "night",     "from": "candle_lighting@22:30", "to": "havdalah@06:30",        "state": "off"},
      {"name": "morning",   "from": "havdalah@06:30",        "to": "havdalah+1h",           "state": "on"}
    ]
  }],
  "exceptions": [
    {"device": "switch.plata", "name": "hotplate",
     "from": "havdalah@11:30", "to": "havdalah@13:00", "state": "on"}
  ]
}

A device named in an exception must also be in a group - an exception is a
device leaving its group for a while, so there has to be a group to leave. Add
"only_on": "2026-08-15" to make an exception happen once instead of weekly.
""".strip()


# --- the shapes the tools accept -------------------------------------------
#
# Spelled out in voluptuous so the model is handed a real JSON schema with the
# field descriptions in it, rather than having to infer the shape from prose.

TIME_DESCRIPTION = (
    "candle_lighting, havdalah, havdalah-30m, candle_lighting+1h, "
    "havdalah@06:30 (06:30 on the day it goes out), or HH:MM for every day"
)

CUBE_SCHEMA = vol.Schema(
    {
        vol.Optional("name", description="what this stretch is called"): cv.string,
        vol.Required("from", description=f"when it starts: {TIME_DESCRIPTION}"): cv.string,
        vol.Required("to", description=f"when it ends: {TIME_DESCRIPTION}"): cv.string,
        vol.Optional(
            "state", description="'on' or 'off' for the whole stretch", default="on"
        ): vol.In(["on", "off"]),
        vol.Optional("color", description="hex colour for the editor, e.g. #43a047"): cv.string,
    }
)

GROUP_SCHEMA = vol.Schema(
    {
        vol.Required("name", description="what this group of devices is called"): cv.string,
        vol.Required(
            "devices", description="entity ids that move together, e.g. ['light.salon']"
        ): [cv.string],
        vol.Required(
            "cubes", description="the stretches of the band, in order"
        ): [CUBE_SCHEMA],
    }
)

EXCEPTION_SCHEMA = vol.Schema(
    {
        vol.Required(
            "device", description="entity id; it must already be in one of the groups"
        ): cv.string,
        vol.Optional("name", description="what to call this exception"): cv.string,
        vol.Required("from", description=f"when it starts: {TIME_DESCRIPTION}"): cv.string,
        vol.Required("to", description=f"when it ends: {TIME_DESCRIPTION}"): cv.string,
        vol.Optional("state", description="'on' or 'off' while it runs", default="on"): vol.In(
            ["on", "off"]
        ),
        vol.Optional(
            "only_on", description="YYYY-MM-DD to make it happen once instead of weekly"
        ): cv.string,
    }
)

PLAN_SCHEMA = vol.Schema(
    {
        vol.Optional("name", description="what the plan is called"): cv.string,
        vol.Required("groups", description="one entry per set of devices that move together"): [
            GROUP_SCHEMA
        ],
        vol.Optional(
            "exceptions", description="devices that leave their group for a while"
        ): [EXCEPTION_SCHEMA],
    }
)


def _fail(message: str) -> JsonObjectType:
    """Errors are for the caller to act on, so they say what to do next."""
    return {"ok": False, "error": message}


def _coordinator(hass: HomeAssistant):
    data = hass.data.get(const.DOMAIN) or {}
    return data.get("coordinator")


def _schedules(hass: HomeAssistant) -> list[dict[str, Any]]:
    coordinator = _coordinator(hass)
    return coordinator.async_get_schedules() if coordinator else []


def _find_plan(hass: HomeAssistant) -> dict[str, Any] | None:
    for schedule in _schedules(hass):
        if PLAN_TAG in (schedule.get(const.ATTR_TAGS) or []):
            return schedule
    return None


def _write(hass: HomeAssistant, payload: dict[str, Any], schedule_id: str | None) -> None:
    """One validated write - a plan is a single schedule, so it cannot half-apply."""
    coordinator = _coordinator(hass)
    if schedule_id:
        data = const.EDIT_SCHEDULE_SCHEMA(dict(payload))
        coordinator.async_edit_schedule(schedule_id, data)
    else:
        data = const.ADD_SCHEDULE_SCHEMA(dict(payload))
        coordinator.async_create_schedule(data)


class _SchedulerTool(llm.Tool):
    """Shared plumbing: a tool never raises, it explains."""

    async def async_call(
        self, hass: HomeAssistant, tool_input: llm.ToolInput, llm_context: llm.LLMContext
    ) -> JsonObjectType:
        if _coordinator(hass) is None:
            return _fail(
                "The Scheduler integration is not set up. Add it under Settings > "
                "Devices & services, then try again."
            )
        try:
            return await self.async_run(hass, dict(tool_input.tool_args or {}))
        except (PlanError, TimeError) as err:
            return _fail(str(err))
        except vol.Invalid as err:
            return _fail(f"The scheduler refused that: {err}")
        except Exception:  # noqa: BLE001 - a tool that raises is a tool that stops a conversation
            _LOGGER.exception("Shabbat plan tool %s failed", self.name)
            return _fail("Something went wrong. Check the Home Assistant log for details.")

    async def async_run(self, hass: HomeAssistant, args: dict[str, Any]) -> JsonObjectType:
        raise NotImplementedError


class ListDevicesTool(_SchedulerTool):
    name = f"{const.DOMAIN}_list_devices"
    description = (
        "List the devices that can be put in a Shabbat plan, with their entity ids. "
        "Use this before writing a plan: a plan needs entity ids like 'light.salon', "
        "never display names."
    )
    parameters = vol.Schema(
        {
            vol.Optional(
                "search", description="keep only devices whose id or name contains this"
            ): cv.string
        }
    )

    async def async_run(self, hass: HomeAssistant, args: dict[str, Any]) -> JsonObjectType:
        needle = (args.get("search") or "").lower().strip()
        devices = [
            {
                "entity_id": state.entity_id,
                "name": state.attributes.get("friendly_name") or state.entity_id,
                "state": state.state,
            }
            for state in hass.states.async_all()
            if state.domain in SCHEDULABLE_DOMAINS
        ]
        if needle:
            devices = [
                d for d in devices if needle in d["entity_id"].lower() or needle in d["name"].lower()
            ]
        return {"ok": True, "devices": sorted(devices, key=lambda d: d["entity_id"])}


class ExplainTimeTool(_SchedulerTool):
    name = f"{const.DOMAIN}_explain_time"
    description = (
        "Check one time expression and say in words when it happens. Use it whenever "
        "unsure how to write a time - especially a clock time inside the band, where "
        "a plain '22:30' fires every day of the week instead of only on Shabbat."
    )
    parameters = vol.Schema(
        {
            vol.Required(
                "expression", description="e.g. 'havdalah@06:30', 'candle_lighting-18m', '22:30'"
            ): cv.string
        }
    )

    async def async_run(self, hass: HomeAssistant, args: dict[str, Any]) -> JsonObjectType:
        parsed = parse_time(args["expression"])
        stored = (
            f"{parsed.entity}{parsed.op}{parsed.hours:02d}:{parsed.minutes:02d}:00"
            if parsed.entity
            else f"{parsed.hours:02d}:{parsed.minutes:02d}:00"
        )
        result: JsonObjectType = {
            "ok": True,
            "expression": args["expression"],
            "means": parsed.describe(DEFAULT_ANCHORS),
            "stored_as": stored,
        }
        if parsed.entity is None:
            result["warning"] = (
                "This is the same hour every day of the week, not only on Shabbat. "
                f"'havdalah@{parsed.hours:02d}:{parsed.minutes:02d}' is that hour on "
                "the day the band ends, festivals included."
            )
        return result


class DescribeAnchorsTool(_SchedulerTool):
    name = f"{const.DOMAIN}_describe_anchors"
    description = "What the plan's two ends are, and which entity each is read from."

    async def async_run(self, hass: HomeAssistant, args: dict[str, Any]) -> JsonObjectType:
        anchors = []
        for anchor_name, entity_id in DEFAULT_ANCHORS.items():
            state = hass.states.get(entity_id)
            anchors.append(
                {
                    "name": anchor_name,
                    "means": ANCHOR_NAMES[anchor_name],
                    "entity_id": entity_id,
                    "available": state is not None
                    and state.state not in ("unknown", "unavailable"),
                    "next": state.state if state else None,
                }
            )
        result: JsonObjectType = {"ok": True, "anchors": anchors}
        if not all(a["available"] for a in anchors):
            result["warning"] = (
                "One of the anchors is not publishing a time. Enable the Jewish Calendar "
                "integration - halachic times are not a fixed offset from sunset, so they "
                "have to be read from it rather than calculated."
            )
        return result


class GetPlanTool(_SchedulerTool):
    name = f"{const.DOMAIN}_get_plan"
    description = (
        "Read the Shabbat plan that is currently set up. It comes back in the same shape "
        f"{const.DOMAIN}_save_plan accepts, so to change one thing: read it, edit the "
        "result, send it back."
    )

    async def async_run(self, hass: HomeAssistant, args: dict[str, Any]) -> JsonObjectType:
        schedule = _find_plan(hass)
        if not schedule:
            return {
                "ok": True,
                "exists": False,
                "note": f"No Shabbat plan yet. Call {const.DOMAIN}_save_plan to create one.",
            }
        plan = plan_from_schedule(schedule)
        return {
            "ok": True,
            "exists": True,
            "schedule_id": schedule.get(const.ATTR_SCHEDULE_ID),
            "entity_id": schedule.get("entity_id"),
            "enabled": schedule.get(const.ATTR_ENABLED, True),
            "plan": plan_to_dict(plan),
        }


class SavePlanTool(_SchedulerTool):
    name = f"{const.DOMAIN}_save_plan"
    description = (
        "Create or replace the Shabbat plan in a single write. Pass the whole plan - this "
        "replaces whatever was there. Because it is one write, it cannot leave half a "
        "Shabbat defined."
    )
    parameters = vol.Schema({vol.Required("plan"): PLAN_SCHEMA})

    async def async_run(self, hass: HomeAssistant, args: dict[str, Any]) -> JsonObjectType:
        plan = plan_from_dict(args["plan"])
        payload = plan_to_payload(plan)

        existing = _find_plan(hass)
        schedule_id = existing.get(const.ATTR_SCHEDULE_ID) if existing else None
        _write(hass, payload, schedule_id)

        return {
            "ok": True,
            "action": "updated" if schedule_id else "created",
            "stretches": len(payload[const.ATTR_TIMESLOTS]),
            "warnings": warnings_for(plan),
            "plan": plan_to_dict(plan),
        }


class AddExceptionTool(_SchedulerTool):
    name = f"{const.DOMAIN}_add_exception"
    description = (
        "Give one device its own hours for a while, without moving anything else. While "
        "the exception runs its group leaves that device alone; when it ends the group "
        "takes it back on its own. The group itself is not changed."
    )
    parameters = EXCEPTION_SCHEMA

    async def async_run(self, hass: HomeAssistant, args: dict[str, Any]) -> JsonObjectType:
        schedule = _find_plan(hass)
        if not schedule:
            return _fail(
                "There is no Shabbat plan to add an exception to. Call "
                f"{const.DOMAIN}_save_plan first."
            )

        plan = plan_from_schedule(schedule)
        device = args["device"]
        plan.exceptions = [e for e in plan.exceptions if e.device != device]
        plan.exceptions.append(
            PlanException(
                device=device,
                name=args.get("name") or "exception",
                start=args["from"],
                stop=args["to"],
                state=args.get("state", "on"),
                only_on=args.get("only_on") or None,
            )
        )

        payload = plan_to_payload(plan)
        _write(hass, payload, schedule[const.ATTR_SCHEDULE_ID])
        return {"ok": True, "plan": plan_to_dict(plan), "warnings": warnings_for(plan)}


class RemoveExceptionTool(_SchedulerTool):
    name = f"{const.DOMAIN}_remove_exception"
    description = "Put a device back on its group's hours by dropping its exception."
    parameters = vol.Schema(
        {vol.Required("device", description="entity id that should rejoin its group"): cv.string}
    )

    async def async_run(self, hass: HomeAssistant, args: dict[str, Any]) -> JsonObjectType:
        schedule = _find_plan(hass)
        if not schedule:
            return _fail("There is no Shabbat plan.")

        plan = plan_from_schedule(schedule)
        remaining = [e for e in plan.exceptions if e.device != args["device"]]
        if len(remaining) == len(plan.exceptions):
            return _fail(
                f"'{args['device']}' has no exception. Call {const.DOMAIN}_get_plan to see "
                "which devices do."
            )
        plan.exceptions = remaining

        _write(hass, plan_to_payload(plan), schedule[const.ATTR_SCHEDULE_ID])
        return {"ok": True, "plan": plan_to_dict(plan)}


class ListSchedulesTool(_SchedulerTool):
    name = f"{const.DOMAIN}_list_schedules"
    description = "List every scheduler entry, marking which one is the Shabbat plan."

    async def async_run(self, hass: HomeAssistant, args: dict[str, Any]) -> JsonObjectType:
        return {
            "ok": True,
            "schedules": [
                {
                    "schedule_id": schedule.get(const.ATTR_SCHEDULE_ID),
                    "entity_id": schedule.get("entity_id"),
                    "name": schedule.get("name"),
                    "enabled": schedule.get(const.ATTR_ENABLED, True),
                    "is_shabbat_plan": PLAN_TAG in (schedule.get(const.ATTR_TAGS) or []),
                    "stretches": len(schedule.get(const.ATTR_TIMESLOTS) or []),
                }
                for schedule in _schedules(hass)
            ],
        }


class DeleteScheduleTool(_SchedulerTool):
    name = f"{const.DOMAIN}_delete_schedule"
    description = (
        "Delete a schedule for good. This cannot be undone, so confirm with the person "
        "before calling it."
    )
    parameters = vol.Schema(
        {vol.Required("schedule_id", description=f"from {const.DOMAIN}_list_schedules"): cv.string}
    )

    async def async_run(self, hass: HomeAssistant, args: dict[str, Any]) -> JsonObjectType:
        schedule_id = args["schedule_id"]
        if not any(s.get(const.ATTR_SCHEDULE_ID) == schedule_id for s in _schedules(hass)):
            return _fail(
                f"There is no schedule '{schedule_id}'. Call {const.DOMAIN}_list_schedules "
                "to see the ones that exist."
            )
        _coordinator(hass).async_delete_schedule(schedule_id)
        return {"ok": True, "deleted": schedule_id}


TOOLS: list[type[_SchedulerTool]] = [
    ListDevicesTool,
    ExplainTimeTool,
    DescribeAnchorsTool,
    GetPlanTool,
    SavePlanTool,
    AddExceptionTool,
    RemoveExceptionTool,
    ListSchedulesTool,
    DeleteScheduleTool,
]


class ShabbatPlanAPI(llm.API):
    """The API Home Assistant serves over its own MCP endpoint and to Assist."""

    def __init__(self, hass: HomeAssistant) -> None:
        super().__init__(hass=hass, id=API_ID, name=API_NAME)

    async def async_get_api_instance(self, llm_context: llm.LLMContext) -> llm.APIInstance:
        return llm.APIInstance(
            api=self,
            api_prompt=API_PROMPT,
            llm_context=llm_context,
            tools=[tool() for tool in TOOLS],
        )


@callback
def async_register_llm_api(hass: HomeAssistant):
    """Register the API; returns the callback that unregisters it again."""
    return llm.async_register_api(hass, ShabbatPlanAPI(hass))
