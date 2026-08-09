"""MCP server for Shabbat plans in Home Assistant.

Everything a caller needs is in the plan vocabulary: groups, stretches and
exceptions. Tracks and priorities are the engine's business and never appear in
a tool signature.
"""
from __future__ import annotations

import json
from typing import Any

try:  # SDK 2.x
    from mcp.server.mcpserver import MCPServer as _Server
except ImportError:  # SDK 1.x called the same thing FastMCP
    from mcp.server.fastmcp import FastMCP as _Server

from .ha import HomeAssistant, HomeAssistantError
from .plan import (
    PLAN_TAG,
    Exception_,
    PlanError,
    plan_from_dict,
    plan_from_schedule,
    plan_to_dict,
    plan_to_payload,
    warnings_for,
)
from .times import ANCHOR_NAMES, DEFAULT_ANCHORS, TimeError, parse_time

INSTRUCTIONS = """
Schedules devices in Home Assistant around Shabbat and Yom Tov.

WHAT A PLAN IS
A plan is one band of time, from candle lighting to havdalah, cut into named
stretches. It is not a weekly repeat: the two ends are read from the Jewish
calendar every week, so the plan follows the season on its own and covers a
festival - including one that runs two or three days - with no extra work.

A plan has:
  groups     - devices that move together. Each group has its own row of
               stretches; a boundary in one group does not move another's.
  exceptions - one device, running its own hours for a while. While an
               exception is running its group leaves that device alone; when it
               ends the group takes it back. Nothing else moves.

WRITING A TIME  (only these four shapes are accepted)
  candle_lighting        exactly when Shabbat comes in
  havdalah               exactly when it goes out
  havdalah-30m           30 minutes before it goes out  (also 1h, 1h30m)
  candle_lighting+1h     one hour after it comes in
  havdalah@06:30         06:30 on the DAY it goes out
  13:00                  13:00 EVERY day - almost never what you want inside a
                         plan, because it fires on Tuesday too

The one people get wrong: an ordinary clock time inside the band, like "turn
the lights off at 22:30 on Friday night", must be written
`candle_lighting@22:30` - 22:30 on the day the band opened. Writing plain
"22:30" makes it fire every night of the week. Use explain_time if unsure.

TYPICAL SEQUENCE
  1. list_devices                  - find the entity ids
  2. get_shabbat_plan              - see what is already set up
  3. save_shabbat_plan             - write the whole plan in one call
  4. add_exception / remove_exception - single-device changes afterwards

save_shabbat_plan replaces the plan entirely and in one write, so pass the
whole plan every time. To change one thing, call get_shabbat_plan first, edit
what came back, and send it back.

A WORKED PLAN
{
  "name": "Shabbat",
  "groups": [{
    "name": "home",
    "devices": ["light.salon", "light.hallway", "switch.boiler"],
    "cubes": [
      {"name": "coming in", "from": "candle_lighting",        "to": "candle_lighting@22:30", "state": "on"},
      {"name": "night",     "from": "candle_lighting@22:30",  "to": "havdalah@06:30",        "state": "off"},
      {"name": "morning",   "from": "havdalah@06:30",         "to": "havdalah@13:00",        "state": "on"},
      {"name": "afternoon", "from": "havdalah@13:00",         "to": "havdalah-30m",          "state": "off"},
      {"name": "going out", "from": "havdalah-30m",           "to": "havdalah+1h",           "state": "on"}
    ]
  }],
  "exceptions": [
    {"device": "switch.plata", "name": "hotplate", "from": "havdalah@11:30",
     "to": "havdalah@13:00", "state": "on"}
  ]
}

The device in an exception must also be in a group - an exception is a device
leaving its group for a while, so there has to be a group to leave.
Add "only_on": "2026-08-15" to an exception to make it happen once.
""".strip()

mcp = _Server("home-assistant-shabbat", instructions=INSTRUCTIONS)

_client: HomeAssistant | None = None


def _ha() -> HomeAssistant:
    global _client
    if _client is None:
        _client = HomeAssistant()
    return _client


def _fail(message: str) -> dict[str, Any]:
    """Errors are for the model to act on, so they say what to do next."""
    return {"ok": False, "error": message}


def _find_plan(schedules: list[dict[str, Any]]) -> dict[str, Any] | None:
    for schedule in schedules:
        if PLAN_TAG in (schedule.get("tags") or []):
            return schedule
    return None


@mcp.tool()
async def list_devices(search: str = "") -> dict[str, Any]:
    """List the devices that can be put in a plan.

    Returns entity ids with their friendly names. Use this before writing a
    plan - a plan needs entity ids like "light.salon", never display names.

    Args:
        search: optional; keep only devices whose id or name contains this.
    """
    try:
        states = await _ha().states()
    except HomeAssistantError as err:
        return _fail(str(err))

    wanted = ("light", "switch", "fan", "climate", "input_boolean", "media_player")
    needle = search.lower().strip()
    devices = [
        {
            "entity_id": state["entity_id"],
            "name": state.get("attributes", {}).get("friendly_name") or state["entity_id"],
            "state": state.get("state"),
        }
        for state in states
        if state["entity_id"].split(".")[0] in wanted
    ]
    if needle:
        devices = [
            d for d in devices if needle in d["entity_id"].lower() or needle in d["name"].lower()
        ]
    return {"ok": True, "devices": sorted(devices, key=lambda d: d["entity_id"])}


@mcp.tool()
async def explain_time(expression: str) -> dict[str, Any]:
    """Check one time expression and say in words when it happens.

    Use this whenever unsure whether a time is written correctly - especially
    before writing a clock time inside the band, where a plain "22:30" fires
    every day of the week instead of only on Shabbat.

    Args:
        expression: e.g. "havdalah@06:30", "candle_lighting-18m", "22:30".
    """
    try:
        parsed = parse_time(expression)
    except TimeError as err:
        return _fail(str(err))

    result: dict[str, Any] = {
        "ok": True,
        "expression": expression,
        "means": parsed.describe(DEFAULT_ANCHORS),
        "stored_as": (
            f"{parsed.entity}{parsed.op}{parsed.hours:02d}:{parsed.minutes:02d}:00"
            if parsed.entity
            else f"{parsed.hours:02d}:{parsed.minutes:02d}:00"
        ),
    }
    if parsed.entity is None:
        result["warning"] = (
            "This is the same hour every day of the week, not only on Shabbat. "
            f"'havdalah@{parsed.hours:02d}:{parsed.minutes:02d}' is that hour on the "
            "day the band ends, festivals included."
        )
    return result


@mcp.tool()
async def get_shabbat_plan() -> dict[str, Any]:
    """Read the Shabbat plan that is currently set up.

    Returns it in the same shape save_shabbat_plan accepts, so the way to
    change one thing is: call this, edit the result, send it back.
    """
    try:
        schedules = await _ha().schedules()
    except HomeAssistantError as err:
        return _fail(str(err))

    schedule = _find_plan(schedules)
    if not schedule:
        return {
            "ok": True,
            "exists": False,
            "note": "No Shabbat plan yet. Call save_shabbat_plan to create one; the "
                    "instructions have a worked example to start from.",
        }

    plan = plan_from_schedule(schedule)
    return {
        "ok": True,
        "exists": True,
        "schedule_id": schedule.get("schedule_id"),
        "entity_id": schedule.get("entity_id"),
        "enabled": schedule.get("enabled", True),
        "plan": plan_to_dict(plan),
    }


@mcp.tool()
async def save_shabbat_plan(plan: dict[str, Any] | str) -> dict[str, Any]:
    """Create or replace the Shabbat plan, in a single write.

    Pass the whole plan: this replaces whatever was there. Applying it is one
    write, so a failure cannot leave half a Shabbat defined.

    Args:
        plan: {"name": ..., "groups": [{"name", "devices", "cubes"}],
               "exceptions": [...]}. See the server instructions for a worked
               example and the accepted time expressions.
    """
    if isinstance(plan, str):
        try:
            plan = json.loads(plan)
        except ValueError:
            return _fail("'plan' must be a JSON object, not a string that is not JSON.")

    try:
        parsed = plan_from_dict(plan)
        payload = plan_to_payload(parsed)
    except (PlanError, TimeError) as err:
        return _fail(str(err))

    try:
        client = _ha()
        existing = _find_plan(await client.schedules())
        if existing:
            payload["schedule_id"] = existing["schedule_id"]
            await client.edit_schedule(payload)
            action = "updated"
        else:
            await client.add_schedule(payload)
            action = "created"
    except HomeAssistantError as err:
        return _fail(str(err))

    return {
        "ok": True,
        "action": action,
        "stretches": len(payload["timeslots"]),
        "warnings": warnings_for(parsed),
        "plan": plan_to_dict(parsed),
    }


@mcp.tool()
async def add_exception(
    device: str,
    start: str,
    stop: str,
    state: str = "on",
    name: str = "exception",
    only_on: str = "",
) -> dict[str, Any]:
    """Give one device its own hours for a while, without moving anything else.

    While the exception runs, the device's group leaves it alone; when it ends
    the group takes it back on its own. Nothing about the group changes.

    Args:
        device: entity id; it must already be in one of the plan's groups.
        start: when the exception begins, e.g. "havdalah@11:30".
        stop: when it ends, e.g. "havdalah@13:00".
        state: "on" or "off" while it runs.
        name: what to call it in the editor.
        only_on: optional date "YYYY-MM-DD" to make it happen once instead of
            every week.
    """
    try:
        client = _ha()
        schedule = _find_plan(await client.schedules())
    except HomeAssistantError as err:
        return _fail(str(err))

    if not schedule:
        return _fail(
            "There is no Shabbat plan to add an exception to. Call save_shabbat_plan first."
        )

    parsed = plan_from_schedule(schedule)
    parsed.exceptions = [e for e in parsed.exceptions if e.device != device]
    parsed.exceptions.append(
        Exception_(
            device=device,
            name=name,
            start=start,
            stop=stop,
            state=state,
            only_on=only_on or None,
        )
    )

    try:
        payload = plan_to_payload(parsed, schedule.get("schedule_id"))
    except (PlanError, TimeError) as err:
        return _fail(str(err))

    try:
        await client.edit_schedule(payload)
    except HomeAssistantError as err:
        return _fail(str(err))

    return {"ok": True, "plan": plan_to_dict(parsed), "warnings": warnings_for(parsed)}


@mcp.tool()
async def remove_exception(device: str) -> dict[str, Any]:
    """Put a device back on its group's hours by dropping its exception.

    Args:
        device: entity id of the device that should rejoin its group.
    """
    try:
        client = _ha()
        schedule = _find_plan(await client.schedules())
    except HomeAssistantError as err:
        return _fail(str(err))

    if not schedule:
        return _fail("There is no Shabbat plan.")

    parsed = plan_from_schedule(schedule)
    before = len(parsed.exceptions)
    parsed.exceptions = [e for e in parsed.exceptions if e.device != device]
    if len(parsed.exceptions) == before:
        return _fail(
            f"'{device}' has no exception. Call get_shabbat_plan to see which devices do."
        )

    try:
        await client.edit_schedule(plan_to_payload(parsed, schedule.get("schedule_id")))
    except (HomeAssistantError, PlanError, TimeError) as err:
        return _fail(str(err))

    return {"ok": True, "plan": plan_to_dict(parsed)}


@mcp.tool()
async def list_schedules() -> dict[str, Any]:
    """List every scheduler entry, marking which one is the Shabbat plan."""
    try:
        schedules = await _ha().schedules()
    except HomeAssistantError as err:
        return _fail(str(err))

    return {
        "ok": True,
        "schedules": [
            {
                "schedule_id": schedule.get("schedule_id"),
                "entity_id": schedule.get("entity_id"),
                "name": schedule.get("name"),
                "enabled": schedule.get("enabled", True),
                "is_shabbat_plan": PLAN_TAG in (schedule.get("tags") or []),
                "stretches": len(schedule.get("timeslots") or []),
            }
            for schedule in schedules
        ],
    }


@mcp.tool()
async def delete_schedule(schedule_id: str) -> dict[str, Any]:
    """Delete a schedule for good.

    Args:
        schedule_id: from list_schedules. This cannot be undone, so confirm
            with the person before calling it.
    """
    try:
        await _ha().remove_schedule(schedule_id)
    except HomeAssistantError as err:
        return _fail(str(err))
    return {"ok": True, "deleted": schedule_id}


@mcp.tool()
async def describe_anchors() -> dict[str, Any]:
    """What the plan's two ends are, and which entity each is read from."""
    return {
        "ok": True,
        "anchors": [
            {"name": name, "means": ANCHOR_NAMES[name], "entity_id": entity}
            for name, entity in DEFAULT_ANCHORS.items()
        ],
        "note": "These come from the Jewish Calendar integration and are read again "
                "at every trigger, which is why the plan follows the season and "
                "handles festivals without a weekday rule.",
    }


def main() -> None:
    mcp.run()


if __name__ == "__main__":
    main()
