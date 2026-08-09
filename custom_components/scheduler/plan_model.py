"""A plan, in the words a person uses, and the schedule it is stored as.

The engine knows about tracks and priorities. A model should not have to: it
says "the hotplate runs 11:30 to 13:00 on its own" and this turns that into a
track with a higher priority, which is the thing that makes the group leave the
hotplate alone until the exception ends.

The mapping is the same one the card uses, so a plan written here opens in the
plan editor and a plan drawn there reads back out here.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from .plan_times import DEFAULT_ANCHORS, TimeError, from_engine, parse_time, to_engine, warn_about

PLAN_TAG = "shabbat-plan"
GROUP_PREFIX = "group:"
DETACH_PREFIX = "detach:"
DETACH_PRIORITY = 1

ON = "on"
OFF = "off"


class PlanError(ValueError):
    """A plan that cannot be applied, with advice attached."""


@dataclass
class Cube:
    """One stretch of the band: a name, two boundaries, and a state."""

    name: str
    start: str
    stop: str
    state: str = ON
    color: str | None = None


@dataclass
class Group:
    """Devices that move together."""

    name: str
    devices: list[str]
    cubes: list[Cube] = field(default_factory=list)


@dataclass
class PlanException:
    """One device, off on its own for a while, then back with its group."""

    device: str
    start: str
    stop: str
    name: str = "exception"
    state: str = ON
    only_on: str | None = None


@dataclass
class Plan:
    name: str
    groups: list[Group] = field(default_factory=list)
    exceptions: list[PlanException] = field(default_factory=list)
    anchors: dict[str, str] = field(default_factory=lambda: dict(DEFAULT_ANCHORS))


def _service(device: str, state: str) -> str:
    domain = device.split(".")[0] if "." in device else "homeassistant"
    if state not in (ON, OFF):
        raise PlanError(f"state must be '{ON}' or '{OFF}', not '{state}'.")
    return f"{domain}.turn_{state}"


def _state_of(service: str) -> str:
    return OFF if service.endswith("turn_off") else ON


# --- reading a plan out of a stored schedule --------------------------------


def plan_from_schedule(schedule: dict[str, Any], anchors: dict[str, str] | None = None) -> Plan:
    anchors = anchors or dict(DEFAULT_ANCHORS)
    slots = [s for s in schedule.get("timeslots", []) if s.get("actions")]

    tracks: dict[str, list[dict]] = {}
    for slot in slots:
        tracks.setdefault(slot.get("track") or "default", []).append(slot)

    groups: list[Group] = []
    exceptions: list[PlanException] = []

    for track, track_slots in tracks.items():
        if track.startswith(DETACH_PREFIX):
            device = track[len(DETACH_PREFIX):].split("#")[0]
            for slot in track_slots:
                exceptions.append(
                    PlanException(
                        device=device,
                        name=slot.get("name") or "exception",
                        start=from_engine(slot.get("start", ""), anchors),
                        stop=from_engine(slot.get("stop") or slot.get("start", ""), anchors),
                        state=_state_of(slot["actions"][0].get("service", "")),
                        only_on=slot.get("end_date"),
                    )
                )
            continue

        devices: list[str] = []
        for slot in track_slots:
            for action in slot["actions"]:
                entity = action.get("entity_id")
                if entity and entity not in devices:
                    devices.append(entity)

        groups.append(
            Group(
                name=track[len(GROUP_PREFIX):] if track.startswith(GROUP_PREFIX) else track,
                devices=devices,
                cubes=[
                    Cube(
                        name=slot.get("name") or "",
                        start=from_engine(slot.get("start", ""), anchors),
                        stop=from_engine(slot.get("stop") or slot.get("start", ""), anchors),
                        state=_state_of(slot["actions"][0].get("service", "")),
                        color=slot.get("color"),
                    )
                    for slot in track_slots
                ],
            )
        )

    return Plan(name=schedule.get("name") or "", groups=groups, exceptions=exceptions, anchors=anchors)


# --- writing one back -------------------------------------------------------


def _empty_conditions() -> dict[str, Any]:
    """A plan has no conditions, and the schema rejects an empty list of them.

    A stretch runs because the band reached it, not because something else is
    true, so the keys are left out entirely rather than sent empty.
    """
    return {}


def plan_to_timeslots(plan: Plan) -> list[dict[str, Any]]:
    """The slots a plan becomes. Raises PlanError with advice on a bad plan."""
    validate(plan)
    slots: list[dict[str, Any]] = []

    for group in plan.groups:
        track = f"{GROUP_PREFIX}{group.name}"
        for cube in group.cubes:
            slots.append(
                {
                    "start": to_engine(cube.start, plan.anchors),
                    "stop": to_engine(cube.stop, plan.anchors),
                    "name": cube.name or None,
                    "color": cube.color,
                    "track": track,
                    "priority": 0,
                    "actions": [
                        {
                            "service": _service(device, cube.state),
                            "entity_id": device,
                            "service_data": {},
                        }
                        for device in group.devices
                    ],
                    **_empty_conditions(),
                }
            )

    seen: dict[str, int] = {}
    for exception in plan.exceptions:
        index = seen.get(exception.device, 0)
        seen[exception.device] = index + 1
        # a track of its own, ranked above the group: that is what makes the
        # group leave this device alone until the exception ends
        track = f"{DETACH_PREFIX}{exception.device}" + (f"#{index}" if index else "")
        slots.append(
            {
                "start": to_engine(exception.start, plan.anchors),
                "stop": to_engine(exception.stop, plan.anchors),
                "name": exception.name or None,
                "track": track,
                "priority": DETACH_PRIORITY,
                "start_date": exception.only_on,
                "end_date": exception.only_on,
                "actions": [
                    {
                        "service": _service(exception.device, exception.state),
                        "entity_id": exception.device,
                        "service_data": {},
                    }
                ],
                **_empty_conditions(),
            }
        )

    return slots


def plan_to_payload(plan: Plan, schedule_id: str | None = None) -> dict[str, Any]:
    """The body for scheduler/add or scheduler/edit - one write, never several."""
    payload: dict[str, Any] = {
        "name": plan.name or "Shabbat plan",
        # the anchors decide the day, festivals included, so there is no
        # weekday rule to get wrong
        "weekdays": ["daily"],
        "repeat_type": "repeat",
        "timeslots": plan_to_timeslots(plan),
        "tags": [PLAN_TAG],
    }
    if schedule_id:
        payload["schedule_id"] = schedule_id
    return payload


# --- validation, which is where a weak model gets rescued -------------------


def validate(plan: Plan) -> None:
    if not plan.groups:
        raise PlanError(
            "A plan needs at least one group. A group is the devices that move "
            "together: {'name': 'home', 'devices': ['light.salon'], 'cubes': [...]}."
        )

    for group in plan.groups:
        if not group.devices:
            raise PlanError(
                f"Group '{group.name}' has no devices. Call list_devices to see what "
                "can be scheduled, then put their entity ids in 'devices'."
            )
        for device in group.devices:
            if "." not in device:
                raise PlanError(
                    f"'{device}' is not an entity id. They look like 'light.salon' "
                    "or 'switch.boiler' - call list_devices to find the right one."
                )
        if not group.cubes:
            raise PlanError(
                f"Group '{group.name}' has no stretches. A stretch is "
                "{'name': ..., 'from': 'candle_lighting', 'to': 'havdalah', 'state': 'on'}."
            )
        for cube in group.cubes:
            _check_boundary(cube.start, f"group '{group.name}', stretch '{cube.name}'", "from")
            _check_boundary(cube.stop, f"group '{group.name}', stretch '{cube.name}'", "to")
            if cube.state not in (ON, OFF):
                raise PlanError(
                    f"Stretch '{cube.name}' has state '{cube.state}'. Use '{ON}' or '{OFF}'."
                )

    known = {device for group in plan.groups for device in group.devices}
    for exception in plan.exceptions:
        _check_boundary(exception.start, f"exception for {exception.device}", "from")
        _check_boundary(exception.stop, f"exception for {exception.device}", "to")
        if exception.device not in known:
            raise PlanError(
                f"'{exception.device}' is not in any group, so there is nothing for it "
                "to be an exception to. Add it to a group's devices first - an "
                "exception takes a device off its group for a while and gives it back."
            )


def _check_boundary(expression: str, where: str, field_name: str) -> None:
    try:
        parse_time(expression)
    except TimeError as err:
        raise PlanError(f"{where}: '{field_name}' - {err}") from err


def warnings_for(plan: Plan) -> list[str]:
    """Things that are legal but usually a mistake, said plainly."""
    notes: list[str] = []
    for group in plan.groups:
        for cube in group.cubes:
            for expression in (cube.start, cube.stop):
                note = warn_about(expression, plan.anchors)
                if note and note not in notes:
                    notes.append(note)
    for exception in plan.exceptions:
        for expression in (exception.start, exception.stop):
            note = warn_about(expression, plan.anchors)
            if note and note not in notes:
                notes.append(note)
    return notes


# --- the shape the tools speak ----------------------------------------------


def plan_from_dict(data: dict[str, Any], anchors: dict[str, str] | None = None) -> Plan:
    """Build a Plan from the flat JSON the tools accept, with clear errors."""
    if not isinstance(data, dict):
        raise PlanError("A plan is an object with 'name', 'groups' and optionally 'exceptions'.")

    groups = []
    for raw in data.get("groups") or []:
        cubes = []
        for cube in raw.get("cubes") or []:
            missing = [k for k in ("from", "to") if not cube.get(k)]
            if missing:
                raise PlanError(
                    f"A stretch is missing {' and '.join(missing)}. Every stretch needs "
                    "'from' and 'to', e.g. {'name': 'night', 'from': 'candle_lighting@22:30', "
                    "'to': 'havdalah@06:30', 'state': 'off'}."
                )
            cubes.append(
                Cube(
                    name=cube.get("name") or "",
                    start=cube["from"],
                    stop=cube["to"],
                    state=cube.get("state", ON),
                    color=cube.get("color"),
                )
            )
        groups.append(
            Group(name=raw.get("name") or "group", devices=list(raw.get("devices") or []), cubes=cubes)
        )

    exceptions = []
    for raw in data.get("exceptions") or []:
        if not raw.get("device"):
            raise PlanError("An exception needs 'device' - the entity that leaves its group.")
        exceptions.append(
            PlanException(
                device=raw["device"],
                name=raw.get("name") or "exception",
                start=raw.get("from") or "",
                stop=raw.get("to") or "",
                state=raw.get("state", ON),
                only_on=raw.get("only_on"),
            )
        )

    return Plan(
        name=data.get("name") or "",
        groups=groups,
        exceptions=exceptions,
        anchors=anchors or dict(DEFAULT_ANCHORS),
    )


def plan_to_dict(plan: Plan) -> dict[str, Any]:
    return {
        "name": plan.name,
        "groups": [
            {
                "name": group.name,
                "devices": group.devices,
                "cubes": [
                    {
                        "name": cube.name,
                        "from": cube.start,
                        "to": cube.stop,
                        "state": cube.state,
                        **({"color": cube.color} if cube.color else {}),
                    }
                    for cube in group.cubes
                ],
            }
            for group in plan.groups
        ],
        "exceptions": [
            {
                "device": exception.device,
                "name": exception.name,
                "from": exception.start,
                "to": exception.stop,
                "state": exception.state,
                **({"only_on": exception.only_on} if exception.only_on else {}),
            }
            for exception in plan.exceptions
        ],
    }
