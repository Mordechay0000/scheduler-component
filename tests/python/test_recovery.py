"""When applying a slot does not take.

A service call can quietly do nothing: the device is unreachable, the power
came back a moment ago, the bulb is mid-reboot. Until now that stayed wrong
until the next boundary, which on a Shabbat plan can be the following morning.

The ladder is three quick attempts, then every quarter of an hour for an hour
and a half. Each attempt re-reads what the schedule says *at that moment*, so
a retry never replays a state the schedule has since moved on from - the air
conditioner that failed to come on at 12:30 is not switched on at 13:20 when
the plan has it off again.
"""
from types import SimpleNamespace

import pytest

from scheduler import const
from scheduler.switch import (
    RECOVERY_INTERVAL,
    RECOVERY_STEPS,
    RECOVERY_WINDOW,
    ScheduleEntity,
)
from test_tracks import slot


@pytest.fixture
def entity(hass, states, monkeypatch):
    """A schedule mid-band, with its timers and service calls recorded."""
    import scheduler.switch as switch_module

    scheduled = []
    calls = []

    monkeypatch.setattr(
        switch_module,
        "async_call_later",
        lambda _hass, delay, cb: scheduled.append((delay, cb)) or (lambda: None),
    )

    async def fake_call(_hass, config):
        calls.append(config)

    monkeypatch.setattr(switch_module, "async_call_from_config", fake_call)

    item = ScheduleEntity.__new__(ScheduleEntity)
    item.hass = hass
    item.schedule_id = "abc123"
    item.entity_id = "switch.schedule_test"
    item.coordinator = SimpleNamespace(state=const.STATE_READY, time_shutdown=None)
    item.schedule = {
        const.ATTR_TIMESLOTS: [
            slot("07:00:00", "22:00:00", track="group", entities=["switch.plata", "light.salon"]),
            slot("11:30:00", "13:00:00", track="plata", priority=1, entities=["switch.plata"]),
        ],
        const.ATTR_REPEAT_TYPE: const.REPEAT_TYPE_REPEAT,
        const.ATTR_END_DATE: None,
        const.ATTR_ENABLED: True,
    }
    item._state = "on"
    item._current_slots = {"group": 0, "plata": None}
    item._applied = {}
    item._recovery_timer = None
    item._recovery_attempt = 0

    item.scheduled = scheduled
    item.calls = calls
    return item


async def run_next(item):
    """Fire whatever the ladder scheduled."""
    (_delay, callback) = item.scheduled.pop()
    await callback(None)


# --- noticing --------------------------------------------------------------


def test_a_device_that_took_the_action_is_not_pending(entity, states):
    states.set("switch.plata", "on")
    states.set("light.salon", "on")

    assert entity.async_pending_actions() == []


def test_a_device_that_did_not_take_it_is(entity, states):
    states.set("switch.plata", "off")
    states.set("light.salon", "on")

    pending = entity.async_pending_actions()

    assert [a["entity_id"] for a in pending] == ["switch.plata"]


def test_a_device_is_only_chased_by_the_track_that_owns_it(entity, states):
    """The group must not fight the exception that is holding the device.

    The exception wants it on and it is off, so it is pending - once, from the
    exception. The group, which is not driving it just now, says nothing.
    """
    states.set("switch.plata", "off")
    states.set("light.salon", "on")
    entity._current_slots = {"group": 0, "plata": 1}

    chasing = [a["entity_id"] for a in entity.async_pending_actions()]

    assert chasing.count("switch.plata") == 1


def test_a_device_that_is_unreachable_is_not_reported_as_wrong(entity, states):
    """There is nothing to compare against, so nothing to put right yet."""
    states.set("switch.plata", "unavailable")
    states.set("light.salon", "on")

    assert entity.async_pending_actions() == []


# --- the ladder -------------------------------------------------------------


async def test_the_first_attempt_is_only_a_check(entity, states):
    """Applying just happened; the first wake-up asks whether it took."""
    states.set("switch.plata", "on")
    states.set("light.salon", "on")
    entity.async_start_recovery()

    assert entity.scheduled[0][0] == RECOVERY_STEPS[0]
    await run_next(entity)

    assert entity.calls == []
    assert entity.scheduled == []  # nothing wrong, so nothing more to do


async def test_it_tries_again_when_something_did_not_take(entity, states):
    states.set("switch.plata", "off")
    states.set("light.salon", "on")
    entity.async_start_recovery()

    await run_next(entity)  # first check: wrong, so schedule attempt 1
    await run_next(entity)  # attempt 1

    assert [c["entity_id"] for c in entity.calls] == ["switch.plata"]


async def test_it_stops_the_moment_it_works(entity, states):
    states.set("switch.plata", "off")
    states.set("light.salon", "on")
    entity.async_start_recovery()

    await run_next(entity)
    await run_next(entity)
    states.set("switch.plata", "on")  # the retry took
    await run_next(entity)

    assert entity.scheduled == []
    assert entity._recovery_attempt == 0


def test_the_quick_attempts_come_first_then_the_quarter_hours(entity):
    delays = []
    for attempt in range(12):
        entity._recovery_attempt = attempt
        delays.append(entity.async_recovery_delay())

    assert delays[: len(RECOVERY_STEPS)] == RECOVERY_STEPS
    assert delays[len(RECOVERY_STEPS)] == RECOVERY_INTERVAL


def test_it_gives_up_after_an_hour_and_a_half(entity):
    slow = RECOVERY_WINDOW // RECOVERY_INTERVAL
    entity._recovery_attempt = len(RECOVERY_STEPS) + slow - 1
    assert entity.async_recovery_delay() == RECOVERY_INTERVAL

    entity._recovery_attempt = len(RECOVERY_STEPS) + slow
    assert entity.async_recovery_delay() is None


async def test_giving_up_leaves_nothing_running(entity, states):
    states.set("switch.plata", "off")
    states.set("light.salon", "on")
    entity._recovery_attempt = len(RECOVERY_STEPS) + RECOVERY_WINDOW // RECOVERY_INTERVAL
    entity._recovery_timer = None

    await entity.async_recover()

    assert entity.scheduled == []
    assert entity._recovery_attempt == 0


# --- the part that matters most ---------------------------------------------


async def test_a_retry_applies_what_the_schedule_says_now(entity, states):
    """The air conditioner that failed to come on at 12:30.

    By the time a later attempt runs, the plan may have moved on. The retry
    must set what is scheduled at that moment - here, nothing, because the
    slot that wanted it on has ended.
    """
    states.set("switch.plata", "off")
    states.set("light.salon", "on")
    entity.async_start_recovery()
    await run_next(entity)

    # the band moved on: no track is inside a slot any more
    entity._current_slots = {"group": None, "plata": None}
    await run_next(entity)

    assert entity.calls == []
    assert entity.scheduled == []


async def test_a_retry_follows_the_schedule_into_the_next_slot(entity, states):
    """And when the plan has moved to a slot that wants something else, that
    is what gets applied - not the state the first attempt was chasing."""
    states.set("switch.plata", "off")
    states.set("light.salon", "on")
    entity.schedule[const.ATTR_TIMESLOTS].append(
        slot("13:00:00", "22:00:00", track="group", entities=["switch.plata"],
             service="switch.turn_off")
    )
    entity.async_start_recovery()
    await run_next(entity)

    entity._current_slots = {"group": 2, "plata": None}
    await run_next(entity)

    # the device is already off, which is what the current slot wants
    assert entity.calls == []


async def test_a_disabled_schedule_stops_trying(entity, states):
    states.set("switch.plata", "off")
    entity.async_start_recovery()
    entity._state = "off"

    await run_next(entity)

    assert entity.calls == []
    assert entity.scheduled == []


async def test_a_device_that_comes_back_is_caught_by_the_next_rung(entity, states):
    """A power cut: unreachable at first, then back and still wrong."""
    states.set("switch.plata", "unavailable")
    states.set("light.salon", "on")
    entity.async_start_recovery()

    await run_next(entity)  # nothing comparable yet, but keep the ladder going
    states.set("switch.plata", "off")  # it came back, in the wrong state
    await run_next(entity)

    assert [c["entity_id"] for c in entity.calls] == ["switch.plata"]
