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

from .plan_times import (
    CANDLE_LIGHTING,
    DEFAULT_ANCHORS,
    HAVDALAH,
    TimeError,
    from_engine,
    parse_time,
    to_engine,
    warn_about,
)

PLAN_TAG = "shabbat-plan"
GROUP_PREFIX = "group:"
DETACH_PREFIX = "detach:"
DETACH_PRIORITY = 1

ON = "on"
OFF = "off"


class PlanError(ValueError):
    """A plan that cannot be applied, with advice attached."""


@dataclass
class DeviceState:
    """What one device is asked to do, and with what settings.

    `brightness` is a percentage and `kelvin` a colour temperature - warm at
    around 2200, daylight at around 6500 - and both only mean anything to a
    light. `degrees` is the target temperature of an air conditioner or a
    heater. Anything unset is simply left out of the service call, so a device
    is never told something it cannot do.
    """

    state: str = ON
    brightness: int | None = None
    kelvin: int | None = None
    degrees: float | None = None

    def as_dict(self) -> dict[str, Any]:
        out: dict[str, Any] = {"state": self.state}
        for key in ("brightness", "kelvin", "degrees"):
            value = getattr(self, key)
            if value is not None:
                out[key] = value
        return out


@dataclass
class Cube:
    """One stretch of the band: a name, two boundaries, and what devices do.

    `state` is what the group does. `overrides` is how one device differs
    without the whole timeline having to be duplicated for it - the group's
    lights on while its hotplate stays off, in the very same stretch.
    """

    name: str
    start: str
    stop: str
    state: str = ON
    color: str | None = None
    brightness: int | None = None
    kelvin: int | None = None
    degrees: float | None = None
    #: entity id -> what that one device does here, instead of the group's state
    overrides: dict[str, DeviceState] = field(default_factory=dict)
    #: put the devices back if something else moves them during this stretch
    enforce: bool = False

    def for_device(self, device: str) -> DeviceState:
        return self.overrides.get(
            device, DeviceState(self.state, self.brightness, self.kelvin, self.degrees)
        )


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
    brightness: int | None = None
    kelvin: int | None = None
    degrees: float | None = None
    only_on: str | None = None
    enforce: bool = False


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


def takes_light_parameters(device: str) -> bool:
    """Only a light has a brightness and a colour temperature.

    A group can carry them for its lights while also holding a switch; sending
    brightness_pct to switch.turn_on would just be rejected, so it is left off.
    """
    return device.split(".")[0] == "light"


def takes_degrees(device: str) -> bool:
    return device.split(".")[0] == "climate"


def _action_for(device: str, wanted: DeviceState) -> dict[str, Any]:
    """The service call one device gets for one stretch.

    Settings a device cannot take are dropped rather than sent, so one stretch
    can carry a brightness for its lights and a temperature for its air
    conditioner without either being told the other's business.
    """
    service_data: dict[str, Any] = {}
    service = _service(device, wanted.state)

    if wanted.state == ON:
        if takes_light_parameters(device):
            if wanted.brightness is not None:
                service_data["brightness_pct"] = wanted.brightness
            if wanted.kelvin is not None:
                service_data["color_temp_kelvin"] = wanted.kelvin
        elif takes_degrees(device) and wanted.degrees is not None:
            # setting a temperature is how a climate device is turned on to a
            # particular setting; turn_on alone would leave it wherever it was
            service = "climate.set_temperature"
            service_data["temperature"] = wanted.degrees

    return {
        "service": service,
        "entity_id": device,
        "service_data": service_data,
    }


def _device_state_of(action: dict[str, Any]) -> DeviceState:
    service_data = action.get("service_data") or {}
    service = action.get("service", "")
    kelvin = service_data.get("color_temp_kelvin")
    degrees = service_data.get("temperature")
    brightness = service_data.get("brightness_pct")
    if brightness is None and service_data.get("brightness") is not None:
        brightness = round(float(service_data["brightness"]) / 255 * 100)
    return DeviceState(
        # set_temperature is a way of being on, not a third state
        state=OFF if service.endswith("turn_off") else ON,
        brightness=int(brightness) if brightness is not None else None,
        kelvin=int(kelvin) if kelvin is not None else None,
        degrees=float(degrees) if degrees is not None else None,
    )


# --- reading a plan out of a stored schedule --------------------------------


def _key(wanted: DeviceState):
    return (wanted.state, wanted.brightness, wanted.kelvin, wanted.degrees)


def _cube_from_slot(slot: dict[str, Any], anchors: dict[str, str]) -> Cube:
    """Read a stretch back, telling the group's state from a device's own.

    The slot carries one action per device. Whatever most of them are doing is
    the stretch's state; a device doing something else is an override, which is
    how one device differs inside a stretch without the timeline being copied.
    """
    per_device = {
        action["entity_id"]: _device_state_of(action)
        for action in slot.get("actions", [])
        if action.get("entity_id")
    }

    common = DeviceState(_state_of(slot["actions"][0].get("service", "")))
    if per_device:
        settings = list(per_device.values())
        if all(_key(w) == _key(settings[0]) for w in settings):
            # everything agrees, so it is simply the stretch's own state
            common = settings[0]
        else:
            # They differ - which is the whole point of a stretch: the salon air
            # conditioner on at 16 while the bedrooms are off. There is no
            # sensible shared setting then, so the stretch keeps only the plainer
            # of on and off and every device carries its own.
            on_count = sum(1 for w in settings if w.state == ON)
            common = DeviceState(ON if on_count * 2 > len(settings) else OFF)

    return Cube(
        name=slot.get("name") or "",
        start=from_engine(slot.get("start", ""), anchors),
        stop=from_engine(slot.get("stop") or slot.get("start", ""), anchors),
        state=common.state,
        brightness=common.brightness,
        kelvin=common.kelvin,
        color=slot.get("color"),
        enforce=bool(slot.get("enforce")),
        overrides={
            device: wanted
            for device, wanted in per_device.items()
            if _key(wanted) != _key(common)
        },
    )


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
                cubes=[_cube_from_slot(slot, anchors) for slot in track_slots],
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
                    "enforce": cube.enforce,
                    # one action per device, so a device can differ inside the
                    # stretch without the stretch being copied for it
                    "actions": [
                        _action_for(device, cube.for_device(device))
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
        # group leave this device alone until the exception ends. A device may
        # have several exceptions at different times; ranking later ones higher
        # means that if two ever did overlap, the later one wins outright
        # instead of it depending on the order they were saved in.
        track = f"{DETACH_PREFIX}{exception.device}" + (f"#{index}" if index else "")
        slots.append(
            {
                "start": to_engine(exception.start, plan.anchors),
                "stop": to_engine(exception.stop, plan.anchors),
                "name": exception.name or None,
                "track": track,
                "priority": DETACH_PRIORITY + index,
                "start_date": exception.only_on,
                "end_date": exception.only_on,
                "enforce": exception.enforce,
                "actions": [
                    _action_for(
                        exception.device,
                        DeviceState(
                            exception.state,
                            exception.brightness,
                            exception.kelvin,
                            exception.degrees,
                        ),
                    )
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
            where = f"group '{group.name}', stretch '{cube.name}'"
            _check_boundary(cube.start, where, "from")
            _check_boundary(cube.stop, where, "to")
            _check_parameters(cube, where)
            if cube.state not in (ON, OFF):
                raise PlanError(
                    f"Stretch '{cube.name}' has state '{cube.state}'. Use '{ON}' or '{OFF}'."
                )
            for device, wanted in cube.overrides.items():
                if device not in group.devices:
                    raise PlanError(
                        f"{where}: there is an override for '{device}', but it is not in "
                        f"'{group.name}'. An override is one of the group's own devices "
                        "doing something different in this stretch."
                    )
                if wanted.state not in (ON, OFF):
                    raise PlanError(
                        f"{where}: the override for '{device}' has state "
                        f"'{wanted.state}'. Use '{ON}' or '{OFF}'."
                    )
                _check_parameters(wanted, f"{where}, override for '{device}'")
        _check_overlaps(group)

    _check_no_device_in_two_groups(plan)

    known = {device for group in plan.groups for device in group.devices}
    for exception in plan.exceptions:
        _check_boundary(exception.start, f"exception for {exception.device}", "from")
        _check_boundary(exception.stop, f"exception for {exception.device}", "to")
        _check_parameters(exception, f"exception for {exception.device}")
        if exception.device not in known:
            raise PlanError(
                f"'{exception.device}' is not in any group, so there is nothing for it "
                "to be an exception to. Add it to a group's devices first - an "
                "exception takes a device off its group for a while and gives it back."
            )


def _check_no_device_in_two_groups(plan: Plan) -> None:
    """Two groups both driving a device would each be setting it at once."""
    owner: dict[str, str] = {}
    for group in plan.groups:
        for device in group.devices:
            if device in owner and owner[device] != group.name:
                raise PlanError(
                    f"'{device}' is in both '{owner[device]}' and '{group.name}'. Two "
                    "groups would be setting it at the same time. Put it in one group "
                    "and, if it needs to differ in a stretch, give that stretch an "
                    "override for it."
                )
            owner[device] = group.name


def _check_overlaps(group: Group) -> None:
    """Stretches on one row share a timeline, so they must not collide.

    Only what can be told without a clock is an error here: two stretches
    starting at the same moment, or one that ends where it began. Whether a
    stretch actually overlaps the next depends on the anchors, which are not
    known until the plan runs - `warnings_for` raises the softer cases.
    """
    starts: dict[str, str] = {}
    for index, cube in enumerate(group.cubes):
        label = cube.name or f"#{index + 1}"
        if cube.start == cube.stop:
            raise PlanError(
                f"In group '{group.name}', '{label}' starts and ends at the same moment "
                f"('{cube.start}'), so it covers nothing."
            )
        if cube.start in starts:
            raise PlanError(
                f"In group '{group.name}', '{label}' and '{starts[cube.start]}' both "
                f"start at '{cube.start}'. Two stretches on one row cannot begin "
                "together - which of them applied would depend on the order they "
                "happened to be saved in."
            )
        starts[cube.start] = label


def _check_parameters(item: Cube | PlanException | DeviceState, where: str) -> None:
    brightness = getattr(item, "brightness", None)
    kelvin = getattr(item, "kelvin", None)
    degrees = getattr(item, "degrees", None)
    if brightness is not None and not 1 <= brightness <= 100:
        raise PlanError(f"{where}: brightness is a percentage, 1 to 100, not {brightness}.")
    if kelvin is not None and not 1500 <= kelvin <= 8000:
        raise PlanError(
            f"{where}: kelvin is a colour temperature, roughly 2200 (warm) to 6500 "
            f"(daylight), not {kelvin}."
        )
    if degrees is not None and not 5 <= degrees <= 35:
        raise PlanError(
            f"{where}: degrees is a target temperature in celsius, 5 to 35, not {degrees}."
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

    # a gap is legal - the devices simply hold what they had - but it is far
    # more often a stretch somebody meant to join up to the next one
    for group in plan.groups:
        for cube, following in zip(group.cubes, group.cubes[1:]):
            if cube.stop != following.start:
                notes.append(
                    f"In '{group.name}', '{cube.name or 'a stretch'}' ends at "
                    f"'{cube.stop}' and the next begins at '{following.start}'. "
                    "Nothing is set in between, so the devices stay as they were."
                )

    shabbat_only = [a for a in plan.anchors.values() if "upcoming_shabbat_" in a]
    if shabbat_only:
        notes.append(
            f"{', '.join(shabbat_only)} only covers Shabbat. Use "
            f"{DEFAULT_ANCHORS[CANDLE_LIGHTING]} and {DEFAULT_ANCHORS[HAVDALAH]}, which "
            "also cover Yom Tov - including a festival running into Shabbat."
        )
    return notes


# --- what the day will actually do ------------------------------------------
#
# A plan is easy to write and hard to read back: which device is on at four in
# the afternoon is spread across a group's stretches, an override inside one of
# them, and possibly an exception on top. This walks it and says so plainly, so
# it can be checked before saving rather than found out on Shabbat.


def _covers(exception: PlanException, cube: Cube) -> bool:
    """Whether an exception plausibly falls inside a stretch.

    Anchors are not resolved here - there is no clock - so this compares what
    was written: an exception written against the same anchor as a stretch, at
    a time between its ends.
    """
    def key(expression: str):
        parsed = parse_time(expression)
        if parsed.entity is None:
            return None
        # a day-anchored time sorts by its own clock reading; an offset sorts
        # around a nominal anchor time, which is enough to order one band
        base = 0 if parsed.op == "@" else NOMINAL_ANCHOR_MINUTES
        minutes = parsed.hours * 60 + parsed.minutes
        return (parsed.entity, base + (-minutes if parsed.op == "-" else minutes))

    start, stop, at = key(cube.start), key(cube.stop), key(exception.start)
    if not all((start, stop, at)):
        return False
    if at[0] == start[0] and at[1] >= start[1]:
        return at[0] != stop[0] or at[1] < stop[1]
    return at[0] == stop[0] and at[1] < stop[1]


#: a stand-in time of day for an anchor, used only to order one band's own
#: boundaries relative to each other
NOMINAL_ANCHOR_MINUTES = 19 * 60


def describe_plan(plan: Plan) -> dict[str, Any]:
    """A reading of the plan: every stretch, and what each device does in it."""
    validate(plan)

    groups = []
    for group in plan.groups:
        stretches = []
        for cube in group.cubes:
            devices = []
            for device in group.devices:
                wanted = cube.for_device(device)
                if not takes_light_parameters(device):
                    wanted = DeviceState(
                        wanted.state, degrees=wanted.degrees if takes_degrees(device) else None
                    )
                taken_over = [
                    exception
                    for exception in plan.exceptions
                    if exception.device == device and _covers(exception, cube)
                ]
                devices.append(
                    {
                        "device": device,
                        **wanted.as_dict(),
                        "why": "override" if device in cube.overrides else "group",
                        **(
                            {"but": f"'{taken_over[0].name}' takes it over for part of this"}
                            if taken_over
                            else {}
                        ),
                    }
                )
            stretches.append(
                {
                    "name": cube.name or "unnamed",
                    "from": cube.start,
                    "to": cube.stop,
                    "from_means": parse_time(cube.start).describe(plan.anchors),
                    "to_means": parse_time(cube.stop).describe(plan.anchors),
                    "holds_the_state": cube.enforce,
                    "devices": devices,
                }
            )
        groups.append({"group": group.name, "stretches": stretches})

    exceptions = [
        {
            "device": exception.device,
            "name": exception.name,
            "from": exception.start,
            "to": exception.stop,
            "from_means": parse_time(exception.start).describe(plan.anchors),
            "to_means": parse_time(exception.stop).describe(plan.anchors),
            "state": exception.state,
            **({"brightness": exception.brightness} if exception.brightness is not None else {}),
            **({"kelvin": exception.kelvin} if exception.kelvin is not None else {}),
            **({"only_on": exception.only_on} if exception.only_on else {}),
            "note": "while this runs its group leaves the device alone; afterwards "
                    "the group takes it back",
        }
        for exception in plan.exceptions
    ]

    return {
        "band": {
            "opens": plan.anchors.get(CANDLE_LIGHTING),
            "closes": plan.anchors.get(HAVDALAH),
            "means": "from candle lighting to havdalah, Shabbat or Yom Tov, "
                     "read from the calendar every week",
        },
        "groups": groups,
        "exceptions": exceptions,
        "warnings": warnings_for(plan),
    }


# --- the shape the tools speak ----------------------------------------------


def _require_device(override: dict[str, Any]) -> bool:
    if not override.get("device"):
        raise PlanError(
            "An override needs 'device' - the entity that differs from the rest of its "
            "group in this stretch, e.g. "
            "{'device': 'switch.plata', 'state': 'off'}."
        )
    return True


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
                    brightness=cube.get("brightness"),
                    kelvin=cube.get("kelvin"),
                    degrees=cube.get("degrees"),
                    color=cube.get("color"),
                    enforce=bool(cube.get("enforce")),
                    overrides={
                        override["device"]: DeviceState(
                            state=override.get("state", ON),
                            brightness=override.get("brightness"),
                            kelvin=override.get("kelvin"),
                            degrees=override.get("degrees"),
                        )
                        for override in (cube.get("overrides") or [])
                        if _require_device(override)
                    },
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
                brightness=raw.get("brightness"),
                kelvin=raw.get("kelvin"),
                degrees=raw.get("degrees"),
                only_on=raw.get("only_on"),
                enforce=bool(raw.get("enforce")),
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
                        **({"brightness": cube.brightness} if cube.brightness is not None else {}),
                        **({"kelvin": cube.kelvin} if cube.kelvin is not None else {}),
                        **({"degrees": cube.degrees} if cube.degrees is not None else {}),
                        **({"color": cube.color} if cube.color else {}),
                        **({"enforce": True} if cube.enforce else {}),
                        **(
                            {
                                "overrides": [
                                    {"device": device, **wanted.as_dict()}
                                    for device, wanted in cube.overrides.items()
                                ]
                            }
                            if cube.overrides
                            else {}
                        ),
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
                **({"brightness": exception.brightness} if exception.brightness is not None else {}),
                **({"kelvin": exception.kelvin} if exception.kelvin is not None else {}),
                **({"degrees": exception.degrees} if exception.degrees is not None else {}),
                **({"only_on": exception.only_on} if exception.only_on else {}),
                **({"enforce": True} if exception.enforce else {}),
            }
            for exception in plan.exceptions
        ],
    }
