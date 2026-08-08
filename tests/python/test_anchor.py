"""Anchored times: sun keywords and entities that publish a time.

Halachic times are not a fixed offset from astronomical sunset, so they cannot
be expressed as "sunset-18:00". They have to be read from an entity at trigger
time, every day - which is what these tests pin down.
"""
import datetime
from types import SimpleNamespace

import pytest
import voluptuous as vol
import homeassistant.util.dt as dt_util

from scheduler import const
from scheduler.timer import TimerHandler, anchor_entity, parse_anchor


def make_timer(hass, timeslots=None, weekdays=None):
    """A TimerHandler with just enough state for the pure calculations.

    __init__ schedules a coroutine on the event loop, which these tests have
    no use for, so the object is built directly.
    """
    timer = TimerHandler.__new__(TimerHandler)
    timer.hass = hass
    timer.id = "test_schedule"
    timer._weekdays = weekdays if weekdays is not None else [const.DAY_TYPE_DAILY]
    timer._start_date = None
    timer._end_date = None
    timer._timeslots = timeslots or []
    timer._next_trigger = None
    timer._watched_times = []
    timer._anchor_tracker = None
    timer._tracked_anchors = []
    return timer


# --- the time format ------------------------------------------------------


@pytest.mark.parametrize(
    "value,expected",
    [
        ("sunset+00:40:00", ("sunset", "+", "00:40:00")),
        ("sunrise-01:00:00", ("sunrise", "-", "01:00:00")),
        ("sensor.jewish_calendar_shkia-00:18:00", ("sensor.jewish_calendar_shkia", "-", "00:18:00")),
        ("input_datetime.havdalah+00:00:00", ("input_datetime.havdalah", "+", "00:00:00")),
        ("22:30:00", None),
        ("00:00:00", None),
    ],
)
def test_parse_anchor(value, expected):
    assert parse_anchor(value) == expected


@pytest.mark.parametrize(
    "value,expected",
    [
        ("sunset+00:40:00", "sun.sun"),
        ("sunrise-00:10:00", "sun.sun"),
        ("sensor.shkia-00:18:00", "sensor.shkia"),
        ("22:30:00", None),
    ],
)
def test_anchor_entity(value, expected):
    assert anchor_entity(value) == expected


@pytest.mark.parametrize(
    "value",
    [
        "22:30:00",
        "sunset+00:40:00",
        "sunrise-01:00:00",
        "sensor.jewish_calendar_shkia-00:18:00",
        "binary_sensor.a_b_1+00:00:00",
    ],
)
def test_validate_time_accepts(value):
    assert const.validate_time(value) == value


@pytest.mark.parametrize(
    "value",
    [
        "moonset+00:10:00",          # not a sun event
        "sensor.shkia-99:99:99",     # offset is not a time
        "sensor.shkia",              # anchor without an offset
        "sensor..shkia+00:10:00",    # not an entity id
        "Sensor.Shkia+00:10:00",     # entity ids are lowercase
        "sensor.shkia*00:10:00",     # not an offset sign
        "not a time",
    ],
)
def test_validate_time_rejects(value):
    with pytest.raises(vol.Invalid):
        const.validate_time(value)


def test_sun_and_entity_patterns_are_disjoint():
    """A string must never be readable as both anchor kinds."""
    for value in ["sunset+00:40:00", "sensor.shkia-00:18:00"]:
        matches = [
            bool(const.OffsetTimePattern.match(value)),
            bool(const.EntityOffsetTimePattern.match(value)),
        ]
        assert matches.count(True) == 1, value


# --- resolving an anchor to a moment --------------------------------------


def test_resolve_sun_anchor(hass, states):
    states.set(
        "sun.sun",
        "above_horizon",
        {
            "next_rising": "2026-08-14T03:12:00+00:00",
            "next_setting": "2026-08-14T16:32:00+00:00",
        },
    )
    timer = make_timer(hass)
    now = dt_util.now()

    assert timer.resolve_anchor("sunset", now).hour == 19  # 16:32 UTC = 19:32 IDT
    assert timer.resolve_anchor("sunrise", now).hour == 6


def test_resolve_entity_anchor_from_timestamp(hass, states):
    """The Jewish Calendar integration publishes ISO timestamps."""
    states.set("sensor.jewish_calendar_shkia", "2026-08-14T16:26:00+00:00")
    timer = make_timer(hass)

    resolved = timer.resolve_anchor("sensor.jewish_calendar_shkia", dt_util.now())

    assert (resolved.hour, resolved.minute) == (19, 26)


def test_resolve_entity_anchor_from_plain_time(hass, states):
    """Template sensors commonly publish a bare time instead."""
    states.set("sensor.shkia", "19:26")
    now = dt_util.now()
    timer = make_timer(hass)

    resolved = timer.resolve_anchor("sensor.shkia", now)

    assert (resolved.hour, resolved.minute, resolved.second) == (19, 26, 0)
    assert resolved.date() == now.date()


@pytest.mark.parametrize("state", ["unavailable", "unknown", "", "not a time", "1"])
def test_resolve_entity_anchor_unusable(hass, states, state):
    """An unusable anchor must yield no timestamp rather than a wrong one."""
    states.set("sensor.shkia", state)
    timer = make_timer(hass)

    assert timer.resolve_anchor("sensor.shkia", dt_util.now()) is None


def test_resolve_missing_entities(hass, states):
    timer = make_timer(hass)
    assert timer.resolve_anchor("sensor.does_not_exist", dt_util.now()) is None
    assert timer.resolve_anchor("sunset", dt_util.now()) is None  # no sun.sun


def test_resolve_sun_without_attributes(hass, states):
    states.set("sun.sun", "above_horizon", {})
    timer = make_timer(hass)
    assert timer.resolve_anchor("sunset", dt_util.now()) is None


# --- applying the offset --------------------------------------------------


def test_calculate_timestamp_applies_offset_to_entity_anchor(hass, states):
    states.set("sensor.shkia", "19:26")
    timer = make_timer(hass)
    now = dt_util.now().replace(hour=12, minute=0, second=0, microsecond=0)

    candle_lighting = timer.calculate_timestamp("sensor.shkia-00:18:00", now)
    havdalah = timer.calculate_timestamp("sensor.shkia+00:40:00", now)

    assert (candle_lighting.hour, candle_lighting.minute) == (19, 8)
    assert (havdalah.hour, havdalah.minute) == (20, 6)


def test_calculate_timestamp_tracks_a_moving_anchor(hass, states):
    """The anchor is re-read, so a schedule follows it without being edited."""
    timer = make_timer(hass)
    now = dt_util.now().replace(hour=12, minute=0, second=0, microsecond=0)

    states.set("sensor.shkia", "19:26")
    week_one = timer.calculate_timestamp("sensor.shkia-00:18:00", now)
    states.set("sensor.shkia", "19:19")
    week_two = timer.calculate_timestamp("sensor.shkia-00:18:00", now)

    assert (week_two - week_one) == datetime.timedelta(minutes=-7)


def test_calculate_timestamp_unavailable_anchor_yields_none(hass, states):
    states.set("sensor.shkia", "unavailable")
    timer = make_timer(hass)

    assert timer.calculate_timestamp("sensor.shkia-00:18:00", dt_util.now()) is None


def test_fixed_times_are_unaffected(hass, states):
    timer = make_timer(hass)
    now = dt_util.now().replace(hour=12, minute=0, second=0, microsecond=0)

    ts = timer.calculate_timestamp("22:30:00", now)

    assert (ts.hour, ts.minute) == (22, 30)


# --- which entities the timer must watch ----------------------------------


def test_anchor_entities_watches_every_anchor_before_arming(hass, states):
    timer = make_timer(
        hass,
        timeslots=[
            {"start": "sensor.shkia-00:18:00", "stop": "22:30:00"},
            {"start": "sunset+00:40:00", "stop": None},
        ],
    )

    assert timer.anchor_entities() == ["sensor.shkia", "sun.sun"]


def test_anchor_entities_follows_the_armed_times(hass, states):
    timer = make_timer(hass)
    timer._next_trigger = dt_util.now()
    timer._watched_times = ["sensor.shkia-00:18:00", "22:30:00"]

    assert timer.anchor_entities() == ["sensor.shkia"]


def test_anchor_entities_empty_for_purely_fixed_schedules(hass, states):
    timer = make_timer(
        hass, timeslots=[{"start": "22:30:00", "stop": "06:30:00"}]
    )

    assert timer.anchor_entities() == []
