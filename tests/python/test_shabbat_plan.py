"""The plan itself, walked through a whole weekend.

Everything else tests a piece. This drives the engine the way a real Shabbat
does: the band opens at candle lighting on Friday, hands over between its
stretches through the night and the morning, lets one device off the group in
the middle of it, takes that device back afterwards, and closes after havdalah -
with no weekday rule anywhere, because the days come from the anchors.

The times are 2026-08-14/15 in Jerusalem: candle lighting Friday 19:29,
havdalah Saturday 20:12.
"""
import datetime

import pytest
import homeassistant.util.dt as dt_util

from conftest import make_timer
from scheduler import const
from test_tracks import make_entity, run, slot

CANDLE = "sensor.jewish_calendar_upcoming_candle_lighting"
HAVDALAH = "sensor.jewish_calendar_upcoming_havdalah"

GROUP = "group:שבת"
DETACH = "detach:switch.plata"

MEMBERS = ["light.salon", "light.hallway", "switch.boiler", "switch.plata"]

# exactly what the plan editor writes
PLAN = [
    slot(f"{CANDLE}+00:00:00", f"{CANDLE}@22:30:00", track=GROUP, name="קבלת שבת", entities=MEMBERS),
    slot(f"{CANDLE}@22:30:00", f"{HAVDALAH}@06:30:00", track=GROUP, name="לילה", entities=MEMBERS, service="switch.turn_off"),
    slot(f"{HAVDALAH}@06:30:00", f"{HAVDALAH}@13:00:00", track=GROUP, name="בוקר", entities=MEMBERS),
    slot(f"{HAVDALAH}@13:00:00", f"{HAVDALAH}-00:30:00", track=GROUP, name="צהריים", entities=MEMBERS, service="switch.turn_off"),
    slot(f"{HAVDALAH}-00:30:00", f"{HAVDALAH}+01:30:00", track=GROUP, name="מוצ״ש", entities=MEMBERS),
    slot(f"{HAVDALAH}@11:30:00", f"{HAVDALAH}@13:00:00", track=DETACH, priority=1,
         name="חריג", entities=["switch.plata"]),
]


@pytest.fixture
def shabbat(hass, states, monkeypatch):
    """A plan under way, with a clock the test can move."""
    states.set(CANDLE, "2026-08-14T16:29:00+00:00")   # Friday 19:29 local
    states.set(HAVDALAH, "2026-08-15T17:12:00+00:00")  # Saturday 20:12 local

    timer = make_timer(hass, timeslots=PLAN)
    entity = make_entity(PLAN)
    entity._timer_handler = timer

    def at(day, hour, minute=0):
        """Move to a moment and let the schedule catch up with it."""
        moment = datetime.datetime(2026, 8, day, hour, minute, tzinfo=datetime.timezone.utc)
        monkeypatch.setattr(dt_util, "utcnow", lambda: moment)
        previous = dict(entity._current_slots)
        entity._current_slots = {
            track: found for (track, (found, _stop)) in timer.current_timeslots().items()
        }
        run(entity.async_release_tracks(previous))
        entity._action_handler.queued.clear()
        run(entity.async_sync_tracks())
        return entity._current_slots

    return (timer, entity, at)


def queued(entity):
    return {x.track: x for x in entity._action_handler.queued}


# local time is UTC+3 in August, so 09:00 UTC is noon in Jerusalem
def utc_for(hour_local):
    return hour_local - 3


def test_nothing_runs_before_the_band_opens(shabbat):
    (_timer, _entity, at) = shabbat

    assert at(13, utc_for(12)) == {GROUP: None, DETACH: None}  # Thursday noon


def test_the_band_opens_at_candle_lighting(shabbat):
    (_timer, entity, at) = shabbat

    assert at(14, utc_for(20)) == {GROUP: 0, DETACH: None}  # Friday 20:00
    assert queued(entity)[GROUP].slot[const.ATTR_NAME] == "קבלת שבת"


def test_the_band_hands_over_at_night(shabbat):
    (_timer, entity, at) = shabbat

    assert at(14, utc_for(23)) == {GROUP: 1, DETACH: None}  # Friday 23:00
    assert queued(entity)[GROUP].slot[const.ATTR_NAME] == "לילה"


def test_the_band_crosses_into_the_next_day(shabbat):
    """The night stretch starts on Friday and ends on Saturday morning."""
    (_timer, entity, at) = shabbat

    assert at(15, utc_for(4)) == {GROUP: 1, DETACH: None}  # Saturday 04:00
    assert at(15, utc_for(8)) == {GROUP: 2, DETACH: None}  # Saturday 08:00
    assert queued(entity)[GROUP].slot[const.ATTR_NAME] == "בוקר"


def test_the_device_leaves_the_group_for_its_exception(shabbat):
    (_timer, entity, at) = shabbat
    at(15, utc_for(8))

    assert at(15, utc_for(12)) == {GROUP: 2, DETACH: 5}  # Saturday noon

    applied = queued(entity)
    assert "switch.plata" in applied[GROUP].excluded
    assert applied[DETACH].excluded == set()
    assert applied[DETACH].slot[const.ATTR_NAME] == "חריג"


def test_the_group_keeps_its_other_devices_during_the_exception(shabbat):
    (_timer, entity, at) = shabbat
    at(15, utc_for(8))
    at(15, utc_for(12))

    group_slot = queued(entity)[GROUP].slot
    targets = [a["entity_id"] for a in group_slot[const.ATTR_ACTIONS]]
    # the group still names every device; the engine simply passes this one over
    assert set(targets) == set(MEMBERS)
    assert queued(entity)[GROUP].excluded == {"switch.plata"}


def test_the_device_comes_back_when_the_exception_ends(shabbat):
    (_timer, entity, at) = shabbat
    at(15, utc_for(12))

    assert at(15, utc_for(14)) == {GROUP: 3, DETACH: None}  # Saturday 14:00

    applied = queued(entity)
    assert applied[GROUP].excluded == set()
    assert applied[GROUP].slot[const.ATTR_NAME] == "צהריים"
    assert DETACH not in applied


def test_a_restart_in_the_middle_of_the_exception_leaves_it_alone(shabbat, hass):
    """The hazard this whole mechanism exists for.

    On restart a schedule re-applies the slot it is inside. Without ownership
    the group would drive the hotplate straight back to the group's state, in
    the middle of the stretch where it is supposed to be running its own.
    """
    (timer, _entity, _at) = shabbat
    fresh = make_entity(PLAN)
    fresh._timer_handler = timer

    moment = datetime.datetime(2026, 8, 15, utc_for(12), 0, tzinfo=datetime.timezone.utc)
    with pytest.MonkeyPatch.context() as patch:
        patch.setattr(dt_util, "utcnow", lambda: moment)
        fresh._current_slots = {
            track: found for (track, (found, _stop)) in timer.current_timeslots().items()
        }
        run(fresh.async_sync_tracks(initial=True))

    assert "switch.plata" in queued(fresh)[GROUP].excluded


def test_the_band_closes_after_havdalah(shabbat):
    (_timer, _entity, at) = shabbat

    assert at(15, utc_for(20)) == {GROUP: 4, DETACH: None}  # Saturday 20:00
    assert at(15, utc_for(22)) == {GROUP: None, DETACH: None}  # Saturday 22:00


def test_the_band_follows_the_anchors_to_the_next_week(shabbat, states):
    """Nothing is edited between one Shabbat and the next."""
    (_timer, _entity, at) = shabbat
    at(15, utc_for(22))

    # after havdalah the calendar rolls its sensors forward
    states.set(CANDLE, "2026-08-21T16:19:00+00:00")   # Friday 19:19
    states.set(HAVDALAH, "2026-08-22T17:02:00+00:00")  # Saturday 20:02

    assert at(16, utc_for(12)) == {GROUP: None, DETACH: None}  # Sunday: nothing
    assert at(21, utc_for(20)) == {GROUP: 0, DETACH: None}  # the next Friday


def test_a_festival_needs_no_weekday_rule(hass, states, monkeypatch):
    """Shavuot 2026 starts on a Thursday; the band opens on it all the same."""
    states.set(CANDLE, "2026-05-21T16:29:00+00:00")   # Thursday 19:29
    states.set(HAVDALAH, "2026-05-22T17:12:00+00:00")  # Friday 20:12

    timer = make_timer(hass, timeslots=PLAN, weekdays=["friday"])
    moment = datetime.datetime(2026, 5, 21, utc_for(20), 0, tzinfo=datetime.timezone.utc)
    monkeypatch.setattr(dt_util, "utcnow", lambda: moment)

    active = {track: found for (track, (found, _stop)) in timer.current_timeslots().items()}

    assert active[GROUP] == 0
    assert dt_util.as_local(moment).weekday() == 3  # Thursday


def test_the_plan_waits_when_its_anchors_are_not_ready(hass, states, monkeypatch):
    """A restart before the calendar has published anything must do nothing."""
    states.set(CANDLE, "unavailable")
    states.set(HAVDALAH, "unknown")

    timer = make_timer(hass, timeslots=PLAN)
    entity = make_entity(PLAN)
    entity._timer_handler = timer

    moment = datetime.datetime(2026, 8, 15, utc_for(12), 0, tzinfo=datetime.timezone.utc)
    monkeypatch.setattr(dt_util, "utcnow", lambda: moment)
    entity._current_slots = {
        track: found for (track, (found, _stop)) in timer.current_timeslots().items()
    }
    run(entity.async_sync_tracks(initial=True))

    assert entity._current_slots == {GROUP: None, DETACH: None}
    assert entity._action_handler.queued == []
    # and the timer watches both anchors, so it starts as soon as they publish
    assert timer.anchor_entities() == sorted([CANDLE, HAVDALAH])
