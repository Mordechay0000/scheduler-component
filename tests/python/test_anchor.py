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

from conftest import make_timer
from scheduler import const
from scheduler.timer import anchor_entity, parse_anchor


# --- the time format ------------------------------------------------------


@pytest.mark.parametrize(
    "value,expected",
    [
        ("sunset+00:40:00", ("sunset", "+", "00:40:00")),
        ("sunrise-01:00:00", ("sunrise", "-", "01:00:00")),
        ("sensor.jewish_calendar_shkia-00:18:00", ("sensor.jewish_calendar_shkia", "-", "00:18:00")),
        ("input_datetime.havdalah+00:00:00", ("input_datetime.havdalah", "+", "00:00:00")),
        ("sensor.havdalah@06:30:00", ("sensor.havdalah", "@", "06:30:00")),
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
        "sensor.jewish_calendar_upcoming_havdalah@06:30:00",
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
        "sunset@22:30:00",           # a sun event names no date to borrow
        "sensor.shkia@24:30:00",     # not a time of day
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

    sunset = timer.resolve_anchor("sunset", now)
    assert sunset.timestamp.hour == 19  # 16:32 UTC = 19:32 IDT
    assert sunset.dated is False  # a sun event only fixes a time of day
    assert timer.resolve_anchor("sunrise", now).timestamp.hour == 6


def test_resolve_entity_anchor_from_timestamp(hass, states):
    """The Jewish Calendar integration publishes ISO timestamps."""
    states.set("sensor.jewish_calendar_shkia", "2026-08-14T16:26:00+00:00")
    timer = make_timer(hass)

    resolved = timer.resolve_anchor("sensor.jewish_calendar_shkia", dt_util.now())

    assert (resolved.timestamp.hour, resolved.timestamp.minute) == (19, 26)
    assert resolved.timestamp.date() == datetime.date(2026, 8, 14)
    assert resolved.dated is True  # the anchor names the day too


def test_resolve_entity_anchor_from_plain_time(hass, states):
    """Template sensors commonly publish a bare time instead."""
    states.set("sensor.shkia", "19:26")
    now = dt_util.now()
    timer = make_timer(hass)

    resolved = timer.resolve_anchor("sensor.shkia", now)

    assert (
        resolved.timestamp.hour,
        resolved.timestamp.minute,
        resolved.timestamp.second,
    ) == (19, 26, 0)
    assert resolved.timestamp.date() == now.date()
    assert resolved.dated is False  # no day information in a bare time


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


# --- anchors that name a day ----------------------------------------------
#
# A weekday rule cannot express Yom Tov, which is why this matters: the Jewish
# Calendar sensors publish the moment of the upcoming candle lighting/havdalah
# including festivals, so a schedule that keeps the date lands on the right day
# without any calendar condition attached to it.


def test_dated_anchor_keeps_its_day(hass, states):
    """A timestamp anchor fires on the day it names, not every day."""
    # a Thursday - Shavuot eve, not a Friday
    states.set(
        "sensor.jewish_calendar_upcoming_candle_lighting",
        "2026-05-21T16:29:00+00:00",
    )
    timer = make_timer(hass, weekdays=["friday"])
    now = dt_util.now().replace(hour=12, minute=0, second=0, microsecond=0)

    ts = timer.calculate_timestamp(
        "sensor.jewish_calendar_upcoming_candle_lighting+00:00:00", now
    )

    assert ts.date() == datetime.date(2026, 5, 21)
    assert ts.weekday() == 3  # Thursday: no weekday rule could have produced this
    assert (ts.hour, ts.minute) == (19, 29)


def test_dated_anchor_offset_crosses_midnight(hass, states):
    """The Shabbat band runs into the small hours - the offset must not clamp.

    A time-of-day anchor clamps to 23:59 here, because it has no day to carry
    the overflow into. A dated anchor does.
    """
    states.set("sensor.jewish_calendar_upcoming_havdalah", "2026-08-15T17:12:00+00:00")
    timer = make_timer(hass)
    now = dt_util.now().replace(hour=12, minute=0, second=0, microsecond=0)

    ts = timer.calculate_timestamp(
        "sensor.jewish_calendar_upcoming_havdalah+04:00:00", now
    )

    assert ts.date() == datetime.date(2026, 8, 16)  # rolled into the next day
    assert (ts.hour, ts.minute) == (0, 12)


def test_time_of_day_anchor_still_clamps(hass, states):
    """Unchanged for the existing forms, which have no day to roll into."""
    states.set("sensor.shkia", "20:12")
    timer = make_timer(hass)
    now = dt_util.now().replace(hour=12, minute=0, second=0, microsecond=0)

    ts = timer.calculate_timestamp("sensor.shkia+04:00:00", now)

    assert (ts.hour, ts.minute) == (23, 59)


def test_dated_anchor_respects_date_restrictions(hass, states):
    states.set("sensor.havdalah", "2026-08-15T17:12:00+00:00")
    timer = make_timer(hass)
    timer._start_date = "2026-09-01"
    now = dt_util.now().replace(hour=12, minute=0, second=0, microsecond=0)

    assert timer.calculate_timestamp("sensor.havdalah+00:00:00", now) is None


def test_dated_anchor_in_the_past_is_kept(hass, states):
    """During Shabbat the opening anchor points backwards, and it must.

    current_timeslot() decides whether a slot is overlapping now by comparing
    against its start - a start silently rolled forward a week would make the
    engine believe Shabbat had not begun.
    """
    states.set("sensor.candle_lighting", "2020-01-03T16:00:00+00:00")
    timer = make_timer(hass)
    now = dt_util.now()

    ts = timer.calculate_timestamp("sensor.candle_lighting+00:00:00", now)

    assert ts is not None
    assert ts < now
    assert ts.date() == datetime.date(2020, 1, 3)


# --- a clock time on the day an anchor names -------------------------------
#
# The stretches inside a Shabbat band are ordinary clock times - 22:30, 06:30,
# 13:00 - but they only apply on the days of that band. A weekday rule fires
# them every week whether or not it is a festival, and a plain time fires them
# every single day; "@" ties them to the day the anchor picked out.


def test_day_anchor_takes_the_date_from_the_anchor(hass, states):
    states.set("sensor.jewish_calendar_upcoming_havdalah", "2026-08-15T17:12:00+00:00")
    timer = make_timer(hass)
    now = dt_util.now().replace(hour=12, minute=0, second=0, microsecond=0)

    ts = timer.calculate_timestamp(
        "sensor.jewish_calendar_upcoming_havdalah@06:30:00", now
    )

    assert ts.date() == datetime.date(2026, 8, 15)  # the day Shabbat ends
    assert (ts.hour, ts.minute) == (6, 30)


def test_day_anchor_reaches_back_to_the_evening_it_started(hass, states):
    """22:30 on Friday night, taken from the candle lighting anchor."""
    states.set(
        "sensor.jewish_calendar_upcoming_candle_lighting",
        "2026-08-14T16:29:00+00:00",
    )
    timer = make_timer(hass, weekdays=["sunday"])
    now = dt_util.now().replace(hour=12, minute=0, second=0, microsecond=0)

    ts = timer.calculate_timestamp(
        "sensor.jewish_calendar_upcoming_candle_lighting@22:30:00", now
    )

    assert ts.date() == datetime.date(2026, 8, 14)
    assert ts.weekday() == 4  # Friday, though the schedule says Sunday
    assert (ts.hour, ts.minute) == (22, 30)


def test_day_anchor_needs_an_anchor_that_names_a_day(hass, states):
    states.set("sensor.shkia", "19:26")
    timer = make_timer(hass)

    assert timer.calculate_timestamp("sensor.shkia@06:30:00", dt_util.now()) is None


def test_day_anchor_respects_date_restrictions(hass, states):
    states.set("sensor.havdalah", "2026-08-15T17:12:00+00:00")
    timer = make_timer(hass)
    timer._start_date = "2026-09-01"

    assert timer.calculate_timestamp("sensor.havdalah@06:30:00", dt_util.now()) is None


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
