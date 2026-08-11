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
from .device_book import (
    KINDS,
    SCHEDULABLE_DOMAINS,
    async_get_book,
    async_name_device,
    async_remove_group,
    async_resolve,
    async_set_group,
    async_set_kind,
)
from .plan_model import (
    PLAN_TAG,
    PlanError,
    PlanException,
    describe_plan,
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

#: What every conversation carries, whether it is about Shabbat or about a lamp.
#:
#: It is deliberately short. These tools are offered alongside all of Home
#: Assistant's own, to whatever model the household runs - often a small one -
#: and a page of rules in front of every request crowds out the request. What is
#: here is only what a model cannot recover from getting wrong: the shape of a
#: plan, the time forms, that a stretch holds a state per device, and where the
#: rest is kept. The rest is one call away, and the tools point at it whenever
#: something does not add up.
API_PROMPT = """
SHABBAT PLANS
A plan covers one Shabbat or festival: a band from candle lighting to havdalah,
cut into named stretches, with a row of them per group of devices. Both ends are
read from the Jewish calendar every week, so a plan is written once.

Times: candle_lighting, havdalah, havdalah-30m, candle_lighting+1h,
candle_lighting@22:30 (22:30 on the day it came in), havdalah@06:30 (06:30 on
the day it goes out). A bare "22:30" means 22:30 every day of the week and is
almost always wrong inside a plan.

A stretch has no state of its own. It lists devices, each with its own state and
its own settings - this is how the salon air conditioner runs while the bedroom
ones are off. A device left out of that list is not touched at all. Each stretch
starts where the one before it ends.

Call scheduler_how_to_write_a_plan before writing or changing a plan: it holds
the rules, a worked example, and what to tell the person. Then check with
scheduler_preview_plan and read the report back before scheduler_save_plan.
""".strip()

#: The whole of it, handed over by a tool rather than by the prompt.
PLAN_GUIDE = """
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

STRETCHES MEET, AND WHAT A CLOCK TIME COSTS
A stretch begins where the one before it ends, so write each "from" as the
previous "to". A gap is legal and almost never meant: nothing is set in
between, and the devices keep whatever they had.

Only a clock reading - the @ form - is fixed while the band's own ends move
through the year, by more than an hour between winter and summer. So a
candle_lighting@22:30 that sits comfortably inside the band this week can fall
outside it on another Shabbat. Nothing breaks when that happens: the stretch
simply does not run, and the one before it carries on, the same devices in the
same state, until the next boundary that does land inside. Say this out loud
when you write one, and offer havdalah-2h or candle_lighting+3h instead when
the person only meant "a couple of hours in".

NAMES THE HOUSEHOLD USES
scheduler_get_device_book holds their own names and groupings - "the air
conditioners", "salon air conditioner". Anywhere a plan takes a device you may
use one of those names instead of an entity id, and it is resolved for you. Use
scheduler_set_device_group and scheduler_name_device to build the book when
somebody describes their devices in words.

The book also records what a device really is. Many are registered under the
wrong domain - an air conditioner behind a switch - and the kind is what decides
whether brightness or a temperature can be asked of it.

HOW TO WORK - in this order
  0. scheduler_get_device_book  if devices are being talked about by name
  1. scheduler_list_devices     to find entity ids
  2. scheduler_get_plan         to see what exists already
  3. scheduler_preview_plan     to check a plan WITHOUT saving it, and to show
                                the person what it will do
  4. scheduler_save_plan        to write the whole plan in one call
  5. scheduler_add_exception / scheduler_remove_exception for one device

Always preview before saving anything the person has not already seen, and
read the report back to them. Every write returns the same report, so say what
was saved rather than only that it was saved.

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
      {"name": "coming in", "from": "candle_lighting", "to": "candle_lighting@22:30",
       "devices": [{"device": "light.salon", "state": "on"},
                   {"device": "switch.boiler", "state": "on"}]},
      {"name": "night", "from": "candle_lighting@22:30", "to": "havdalah@06:30",
       "devices": [{"device": "light.salon", "state": "off"},
                   {"device": "switch.boiler", "state": "off"}]}
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

A STRETCH IS A LIST OF DEVICES  (read this - it is the point)
A stretch has no state of its own. It names devices, and each one carries its
own state and its own settings. This is what makes the common case work: a house
on a small generator cannot run the salon air conditioner and the bedroom ones at
the same time, so during the meal the salon is on and the bedrooms are off, and
later it is the other way round.

  {"name": "the meal", "from": "candle_lighting@20:00", "to": "candle_lighting@22:30",
   "devices": [
     {"device": "climate.salon",   "state": "on",  "degrees": 16},
     {"device": "climate.bedroom", "state": "off"},
     {"device": "light.salon",     "state": "on",  "brightness": 50},
     {"device": "light.corridor",  "state": "on",  "brightness": 10}
   ]}

  {"name": "night", "from": "candle_lighting@22:30", "to": "havdalah@06:30",
   "devices": [
     {"device": "climate.salon",   "state": "off"},
     {"device": "climate.bedroom", "state": "on", "degrees": 24},
     {"device": "light.salon",     "state": "off"}
   ]}

LEAVING A DEVICE OUT MEANS SOMETHING
A device missing from a stretch's "devices" is not switched, not held to
anything, and not retried if a call fails: the stretch does not touch it, it
keeps whatever it had, and any other schedule is free to drive it. Do that
deliberately - say so when you do - and never by forgetting.

Never copy a plan, and never make a second group, just because devices disagree
inside one stretch.

Use an exception instead only when a device needs its own *hours* - different
start and stop times from the group.

SETTINGS
"brightness" 1-100 percent and "kelvin" colour temperature (2200 warm, 4000
neutral, 6500 daylight) apply to lights. "degrees" is the target temperature of
an air conditioner or heater, 5-35 celsius. They go on the device that takes
them; a setting a device cannot take is simply left off, so one stretch safely
carries a brightness for its lights and degrees for its air conditioner at once.
All are ignored when that device's state is "off".

HOLDING A STATE (experimental)
"enforce": true on a stretch puts a device back if a wall switch or another
integration moves it while that stretch is running - for a switch pressed by
accident on Shabbat. It waits 30 seconds between attempts so it cannot end up
trading service calls with whatever moved it.
""".strip()


# --- the shapes the tools accept -------------------------------------------
#
# Spelled out in voluptuous so the model is handed a real JSON schema with the
# field descriptions in it, rather than having to infer the shape from prose.

TIME_DESCRIPTION = (
    "candle_lighting, havdalah, havdalah-30m, candle_lighting+1h, "
    "havdalah@06:30 (06:30 on the day it goes out), or HH:MM for every day"
)

BRIGHTNESS = vol.All(vol.Coerce(int), vol.Range(min=1, max=100))
KELVIN = vol.All(vol.Coerce(int), vol.Range(min=1500, max=8000))
DEGREES = vol.All(vol.Coerce(float), vol.Range(min=5, max=35))

DEVICE_STATE_SCHEMA = vol.Schema(
    {
        vol.Required(
            "device",
            description="entity id, or a name from the device book, that this stretch "
            "acts on",
        ): cv.string,
        vol.Optional("state", description="'on' or 'off'", default="on"): vol.In(["on", "off"]),
        vol.Optional("brightness", description="1-100 percent, lights only"): BRIGHTNESS,
        vol.Optional(
            "kelvin", description="colour temperature: 2200 warm, 4000 neutral, 6500 daylight"
        ): KELVIN,
        vol.Optional(
            "degrees", description="target temperature in celsius, 5-35, air conditioners and heaters only"
        ): DEGREES,
    }
)

CUBE_SCHEMA = vol.Schema(
    {
        vol.Optional("name", description="what this stretch is called"): cv.string,
        vol.Required("from", description=f"when it starts: {TIME_DESCRIPTION}"): cv.string,
        vol.Required("to", description=f"when it ends: {TIME_DESCRIPTION}"): cv.string,
        vol.Required(
            "devices",
            description="the devices this stretch acts on, EACH WITH ITS OWN STATE and "
            "its own settings. A stretch has no single state of its own: this is how the "
            "salon air conditioner runs at 16 degrees while the bedroom ones are off, "
            "and one light sits at 50 percent while another is at 10. Leave a device out "
            "of this list entirely and the stretch does not touch it at all.",
        ): [DEVICE_STATE_SCHEMA],
        vol.Optional(
            "enforce",
            description="put these devices back if a wall switch or another integration "
            "moves them while this stretch is running (experimental)",
        ): cv.boolean,
        vol.Optional("color", description="hex colour for the editor, e.g. #43a047"): cv.string,
    }
)

GROUP_SCHEMA = vol.Schema(
    {
        vol.Required("name", description="what this group of devices is called"): cv.string,
        vol.Required(
            "devices",
            description="every entity id, or device-book name, that belongs to this "
            "group. A stretch can only act on devices listed here.",
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
        vol.Optional("brightness", description="1-100 percent, lights only"): BRIGHTNESS,
        vol.Optional(
            "kelvin", description="colour temperature: 2200 warm, 4000 neutral, 6500 daylight"
        ): KELVIN,
        vol.Optional(
            "degrees", description="target temperature in celsius, 5-35, air conditioners and heaters only"
        ): DEGREES,
        vol.Optional(
            "enforce", description="put the device back if something else moves it (experimental)"
        ): cv.boolean,
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


_GUIDE_HINT = f"Call {const.DOMAIN}_how_to_write_a_plan for the rules and a worked example."


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


def _resolve_plan_devices(hass: HomeAssistant, plan: dict[str, Any]) -> dict[str, Any]:
    """Let a plan name devices and groups the way the household does.

    "the air conditioners" or "salon air conditioner" is turned into entity ids
    here, so a caller never has to look one up when the book already knows it.
    """
    out = dict(plan)
    out["groups"] = [
        {**group, "devices": async_resolve(hass, list(group.get("devices") or []))}
        for group in (plan.get("groups") or [])
    ]
    out["exceptions"] = [
        {
            **exception,
            **(
                {"device": async_resolve(hass, [exception["device"]])[0]}
                if exception.get("device")
                else {}
            ),
        }
        for exception in (plan.get("exceptions") or [])
    ]
    for group in out["groups"]:
        cubes = []
        for cube in group.get("cubes") or []:
            cube = dict(cube)
            if cube.get("devices"):
                # a stretch names its devices too, and in the household's words:
                # a book name becomes its entity, and a group name becomes every
                # entity in it, each keeping the settings that were asked for
                cube["devices"] = [
                    {**device, "device": entity_id}
                    for device in cube["devices"]
                    if device.get("device")
                    for entity_id in async_resolve(hass, [device["device"]])
                ]
            if cube.get("overrides"):
                cube["overrides"] = [
                    {**override, "device": async_resolve(hass, [override["device"]])[0]}
                    for override in cube["overrides"]
                    if override.get("device")
                ]
            cubes.append(cube)
        group["cubes"] = cubes
    return out


class _SchedulerTool(llm.Tool):
    """Shared plumbing: a tool never raises, it explains."""

    #: what a tool that takes nothing accepts. A small model hands a stray
    #: argument to a read-only tool now and then; refusing costs it a turn and
    #: teaches it nothing, so those are dropped. Tools that write declare a
    #: schema of their own, and those stay strict - there a wrong key is a wrong
    #: plan, and saying so is the whole point.
    parameters = vol.Schema({}, extra=vol.REMOVE_EXTRA)

    async def async_call(
        self, hass: HomeAssistant, tool_input: llm.ToolInput, llm_context: llm.LLMContext
    ) -> JsonObjectType:
        if _coordinator(hass) is None:
            return _fail(
                "The Scheduler integration is not set up. Add it under Settings > "
                "Devices & services, then try again."
            )
        try:
            args = self.parameters(dict(tool_input.tool_args or {}))
        except vol.Invalid as err:
            # nothing between the model and here checks the arguments against the
            # schema the tool published, so a missing key used to surface as
            # "check the log" - which tells whoever is calling nothing at all
            takes = ", ".join(sorted(str(key) for key in getattr(self.parameters, "schema", {})))
            return _fail(
                f"Those arguments do not match what {self.name} takes: {err}."
                + (f" It takes: {takes}." if takes else "")
                + " The tool's own description says what each one should hold."
            )
        try:
            return await self.async_run(hass, args)
        except (PlanError, TimeError) as err:
            # the prompt is short on purpose, so a refusal is where a model that
            # never read the guide finds out that there is one
            return _fail(f"{str(err)} {_GUIDE_HINT}")
        except vol.Invalid as err:
            return _fail(f"The scheduler refused that: {err} {_GUIDE_HINT}")
        except Exception:  # noqa: BLE001 - a tool that raises is a tool that stops a conversation
            _LOGGER.exception("Shabbat plan tool %s failed", self.name)
            return _fail("Something went wrong. Check the Home Assistant log for details.")

    async def async_run(self, hass: HomeAssistant, args: dict[str, Any]) -> JsonObjectType:
        raise NotImplementedError


class HowToWritePlanTool(_SchedulerTool):
    name = f"{const.DOMAIN}_how_to_write_a_plan"
    description = (
        "Read this before writing or changing a Shabbat plan: the rules, the time "
        "forms, a worked example, and the mistakes that cost a household a Shabbat. "
        "Takes no arguments."
    )

    async def async_run(self, hass: HomeAssistant, args: dict[str, Any]) -> JsonObjectType:
        return {"ok": True, "guide": PLAN_GUIDE}


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


class PreviewPlanTool(_SchedulerTool):
    name = f"{const.DOMAIN}_preview_plan"
    description = (
        "Read a plan back as what it will actually do, without saving anything: every "
        "stretch, and what each device does in it, with the boundaries written out in "
        f"words. Call this before {const.DOMAIN}_save_plan to check a plan, and show "
        "the result to the person - it is far easier to spot a mistake here than on "
        "Shabbat."
    )
    parameters = vol.Schema({vol.Required("plan"): PLAN_SCHEMA})

    async def async_run(self, hass: HomeAssistant, args: dict[str, Any]) -> JsonObjectType:
        plan = plan_from_dict(_resolve_plan_devices(hass, args["plan"]))
        return {"ok": True, "saved": False, "report": describe_plan(plan)}


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
                "note": f"No Shabbat plan yet. {_GUIDE_HINT}",
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
        plan = plan_from_dict(_resolve_plan_devices(hass, args["plan"]))
        payload = plan_to_payload(plan)

        existing = _find_plan(hass)
        schedule_id = existing.get(const.ATTR_SCHEDULE_ID) if existing else None
        _write(hass, payload, schedule_id)

        return {
            "ok": True,
            "action": "updated" if schedule_id else "created",
            "stretches": len(payload[const.ATTR_TIMESLOTS]),
            "warnings": warnings_for(plan),
            # what was just saved, in words, so it can be read back to the person
            "report": describe_plan(plan),
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
        return {
            "ok": True,
            "plan": plan_to_dict(plan),
            "warnings": warnings_for(plan),
            "report": describe_plan(plan),
        }


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


class GetDeviceBookTool(_SchedulerTool):
    name = f"{const.DOMAIN}_get_device_book"
    description = (
        "The household's own names and groupings for its devices. Read this first when "
        "someone talks about devices by name - 'the air conditioners', 'salon air "
        "conditioner' - because a plan may then use those names directly instead of "
        "entity ids. It also says what each device really is, which decides whether "
        "brightness or a temperature can be asked of it."
    )

    async def async_run(self, hass: HomeAssistant, args: dict[str, Any]) -> JsonObjectType:
        book = async_get_book(hass)
        return {
            "ok": True,
            **book,
            "note": "Names and groups from here can be used anywhere a plan takes a "
                    "device, in place of an entity id.",
        }


class SetDeviceGroupTool(_SchedulerTool):
    name = f"{const.DOMAIN}_set_device_group"
    description = (
        "Create a group of devices, or change which devices are in one. The group is "
        "stored as a Home Assistant label, so it is visible and usable outside the "
        "scheduler too. Passing an empty list of devices removes the group."
    )
    parameters = vol.Schema(
        {
            vol.Required("group", description="what the group is called, e.g. 'air conditioners'"): cv.string,
            vol.Required(
                "devices",
                description="entity ids, or names already in the book; empty removes the group",
            ): [cv.string],
        }
    )

    async def async_run(self, hass: HomeAssistant, args: dict[str, Any]) -> JsonObjectType:
        group = args["group"].strip()
        if not group:
            return _fail("A group needs a name - what the household calls those devices.")
        devices = async_resolve(hass, list(args["devices"]))
        if not devices:
            removed = await async_remove_group(hass, group)
            if not removed:
                return _fail(
                    f"There is no group '{group}'. Call {const.DOMAIN}_get_device_book "
                    "to see the ones that exist."
                )
            return {"ok": True, "removed": group}

        missing = [d for d in devices if hass.states.get(d) is None]
        if missing:
            return _fail(
                f"{', '.join(missing)} - no such device. Call {const.DOMAIN}_list_devices "
                "to find the right entity ids."
            )
        await async_set_group(hass, group, devices)
        return {"ok": True, "group": group, "devices": devices}


class NameDeviceTool(_SchedulerTool):
    name = f"{const.DOMAIN}_name_device"
    description = (
        "Give a device the name the household calls it by, and optionally correct what "
        "kind of device it is. The name is stored as a Home Assistant alias, so it also "
        "works when speaking to Assist. Correcting the kind matters when a device is "
        "registered under the wrong domain - an air conditioner behind a switch - "
        "because the kind decides whether brightness or a temperature can be set."
    )
    parameters = vol.Schema(
        {
            vol.Required("device", description="entity id, e.g. 'switch.ac_salon'"): cv.string,
            vol.Optional(
                "name", description="what to call it; omit or leave empty to clear the name"
            ): cv.string,
            vol.Optional(
                "kind", description=f"what it really is: {', '.join(sorted(KINDS))}"
            ): vol.In(sorted(KINDS)),
        }
    )

    async def async_run(self, hass: HomeAssistant, args: dict[str, Any]) -> JsonObjectType:
        device = args["device"]
        if hass.states.get(device) is None:
            return _fail(
                f"'{device}' is not a device here. Call {const.DOMAIN}_list_devices to "
                "find the right entity id."
            )
        try:
            if "name" in args:
                await async_name_device(hass, device, args["name"].strip() or None)
            if "kind" in args:
                async_set_kind(hass, device, args["kind"])
                coordinator = _coordinator(hass)
                if coordinator:
                    coordinator.store.async_set_device_kind(device, args["kind"])
        except ValueError as err:
            return _fail(str(err))

        book = async_get_book(hass)
        entry = next((d for d in book["devices"] if d["entity_id"] == device), None)
        return {"ok": True, "device": entry}


TOOLS: list[type[_SchedulerTool]] = [
    HowToWritePlanTool,
    GetDeviceBookTool,
    SetDeviceGroupTool,
    NameDeviceTool,
    ListDevicesTool,
    ExplainTimeTool,
    DescribeAnchorsTool,
    GetPlanTool,
    PreviewPlanTool,
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
    """Register the API; returns the callback that unregisters it again.

    Registering twice raises, and a config entry can be reloaded - by HACS on
    an update, or by hand - so any stale registration is cleared first rather
    than being allowed to stop the whole integration from setting up.
    """
    existing = llm.async_get_apis(hass)
    if any(api.id == API_ID for api in existing):
        _LOGGER.debug("Replacing an existing registration of %s", API_ID)
        for api in existing:
            if api.id == API_ID:
                llm._async_get_apis(hass).pop(API_ID, None)
                break

    unregister = llm.async_register_api(hass, ShabbatPlanAPI(hass))
    _LOGGER.info(
        "Registered the '%s' LLM API (id %s). It is offered by the Model Context "
        "Protocol Server integration and in any conversation agent's options; over "
        "MCP it is served at /api/mcp/%s.",
        API_NAME,
        API_ID,
        API_ID,
    )
    return unregister
