"""The time vocabulary a model writes, and the one the engine stores.

A model should never have to know that "half past six on the morning Shabbat
ends" is spelled `sensor.jewish_calendar_upcoming_havdalah@06:30:00`. It writes
`havdalah@06:30`, and this module expands it - and, just as importantly,
contracts engine strings back into the readable form so that reading a plan and
writing one use the same words.

Every rejection here explains what to write instead. A model that gets "invalid
time" learns nothing; one that gets "'22:30' fires every day of the week - did
you mean 'havdalah@22:30'?" fixes itself on the next call.
"""
from __future__ import annotations

import re
from dataclasses import dataclass

# The two moments a Shabbat plan hangs off. The names are the ones a person
# would use; the entities are what the engine reads at trigger time.
CANDLE_LIGHTING = "candle_lighting"
HAVDALAH = "havdalah"

DEFAULT_ANCHORS = {
    CANDLE_LIGHTING: "sensor.jewish_calendar_upcoming_candle_lighting",
    HAVDALAH: "sensor.jewish_calendar_upcoming_havdalah",
}

ANCHOR_NAMES = {
    CANDLE_LIGHTING: "candle lighting (Shabbat or Yom Tov comes in)",
    HAVDALAH: "havdalah (it goes out)",
}

_ENTITY = r"[a-z_]+\.[a-z0-9_]+"
_CLOCK = re.compile(r"^(\d{1,2}):(\d{2})(?::(\d{2}))?$")
_DURATION = re.compile(r"^(?:(\d+)h)?(?:(\d+)m)?$|^(\d{1,2}):(\d{2})$")
_SHORTHAND = re.compile(
    rf"^(?P<anchor>{CANDLE_LIGHTING}|{HAVDALAH}|{_ENTITY})"
    r"(?:(?P<op>[-+@])(?P<operand>.+))?$"
)
_ENGINE = re.compile(rf"^(?P<entity>{_ENTITY})(?P<op>[-+@])(?P<operand>[0-9:]+)$")


class TimeError(ValueError):
    """A time expression that cannot be used, with advice attached."""


@dataclass(frozen=True)
class ParsedTime:
    """What a time expression means, before it is written down either way."""

    #: the anchor's entity id, or None for a plain clock time
    entity: str | None
    #: "-" or "+" for an offset, "@" for a clock time on the anchor's day,
    #: None for a plain clock time
    op: str | None
    hours: int
    minutes: int

    def describe(self, anchors: dict[str, str]) -> str:
        readable = {v: k for k, v in anchors.items()}
        if self.entity is None:
            return f"{self.hours:02d}:{self.minutes:02d} every day"
        name = readable.get(self.entity, self.entity)
        if self.op == "@":
            return f"{self.hours:02d}:{self.minutes:02d} on the day of {name}"
        if self.hours == 0 and self.minutes == 0:
            return f"exactly at {name}"
        parts = []
        if self.hours:
            parts.append(f"{self.hours}h")
        if self.minutes:
            parts.append(f"{self.minutes}m")
        return f"{' '.join(parts)} {'before' if self.op == '-' else 'after'} {name}"


def _parse_duration(text: str) -> tuple[int, int]:
    match = _DURATION.match(text.strip())
    if not match or not text.strip():
        raise TimeError(
            f"'{text}' is not a duration. Write it as '30m', '1h', '1h30m' or '01:30'."
        )
    if match.group(3) is not None:
        hours, minutes = int(match.group(3)), int(match.group(4))
    else:
        hours, minutes = int(match.group(1) or 0), int(match.group(2) or 0)
    if minutes > 59:
        hours, minutes = hours + minutes // 60, minutes % 60
    if hours > 23:
        raise TimeError(
            f"'{text}' is more than a day away from its anchor, which the engine "
            "cannot store. Anchor it to the other end of the band instead."
        )
    return hours, minutes


def _parse_clock(text: str) -> tuple[int, int]:
    match = _CLOCK.match(text.strip())
    if not match:
        raise TimeError(f"'{text}' is not a time of day. Write it as 'HH:MM', e.g. '06:30'.")
    hours, minutes = int(match.group(1)), int(match.group(2))
    if hours > 23 or minutes > 59:
        raise TimeError(f"'{text}' is not a time of day - hours are 0-23 and minutes 0-59.")
    return hours, minutes


def parse_time(expression: str, anchors: dict[str, str] | None = None) -> ParsedTime:
    """Read either the shorthand or an engine string.

    Accepted, and these are the only four shapes:

      candle_lighting            exactly when Shabbat comes in
      havdalah-30m               30 minutes before it goes out
      havdalah@06:30             06:30 on the day it goes out
      13:00                      13:00 every single day (rarely what you want)

    `candle_lighting` and `havdalah` may be replaced by any entity id that
    publishes a timestamp, if the household uses a different source.
    """
    anchors = anchors or DEFAULT_ANCHORS
    expression = (expression or "").strip()
    if not expression:
        raise TimeError(
            "A time is required. Use 'candle_lighting', 'havdalah', "
            "'havdalah@06:30' or 'candle_lighting+1h'."
        )

    if _CLOCK.match(expression):
        hours, minutes = _parse_clock(expression)
        return ParsedTime(None, None, hours, minutes)

    match = _SHORTHAND.match(expression)
    if not match:
        raise TimeError(
            f"'{expression}' is not a time this plan understands. Use "
            "'candle_lighting', 'havdalah', 'havdalah-30m', 'havdalah@06:30' "
            "or a plain 'HH:MM'."
        )

    anchor = match.group("anchor")
    entity = anchors.get(anchor, anchor)
    op = match.group("op")
    operand = match.group("operand")

    if op is None:
        return ParsedTime(entity, "+", 0, 0)
    if op == "@":
        hours, minutes = _parse_clock(operand)
        return ParsedTime(entity, "@", hours, minutes)
    hours, minutes = _parse_duration(operand)
    return ParsedTime(entity, op, hours, minutes)


def to_engine(expression: str, anchors: dict[str, str] | None = None) -> str:
    """The string the scheduler integration stores."""
    parsed = parse_time(expression, anchors)
    if parsed.entity is None:
        return f"{parsed.hours:02d}:{parsed.minutes:02d}:00"
    return f"{parsed.entity}{parsed.op}{parsed.hours:02d}:{parsed.minutes:02d}:00"


def from_engine(value: str, anchors: dict[str, str] | None = None) -> str:
    """The shorthand for a stored string, so reading and writing use one language."""
    anchors = anchors or DEFAULT_ANCHORS
    readable = {v: k for k, v in anchors.items()}

    match = _ENGINE.match(value or "")
    if not match:
        clock = _CLOCK.match(value or "")
        return f"{int(clock.group(1)):02d}:{clock.group(2)}" if clock else (value or "")

    name = readable.get(match.group("entity"), match.group("entity"))
    op = match.group("op")
    hours, minutes = (int(x) for x in (match.group("operand").split(":") + ["0"])[:2])

    if op == "@":
        return f"{name}@{hours:02d}:{minutes:02d}"
    if hours == 0 and minutes == 0:
        return name
    duration = (f"{hours}h" if hours else "") + (f"{minutes}m" if minutes else "")
    return f"{name}{op}{duration}"


def warn_about(expression: str, anchors: dict[str, str] | None = None) -> str | None:
    """A caution for an expression that is legal but probably a mistake."""
    parsed = parse_time(expression, anchors)
    if parsed.entity is None:
        return (
            f"'{expression}' is the same hour every day of the week, not only on "
            "Shabbat. Inside a plan you almost always want it tied to a day: "
            f"'havdalah@{parsed.hours:02d}:{parsed.minutes:02d}' is that hour on "
            "the day the band ends, festivals included."
        )
    return None
