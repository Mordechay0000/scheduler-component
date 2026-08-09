"""Tracks: several independent timelines inside one schedule.

A schedule used to be a single partition of the day, so a boundary that only
mattered to one device still cut every other device's slot in two. That is the
thing that makes a shared Shabbat plan impossible to express: the moment the
hotplate needs its own times, every other device's slots have to be split
around it, and nothing records who the boundary belonged to.

Tracks give each group its own partition, and priority decides who owns a
device when two tracks reach for it at once - which is what "detach from the
group and come back afterwards" actually is.
"""
import asyncio
import datetime
from types import SimpleNamespace

import pytest
import homeassistant.util.dt as dt_util
from homeassistant.const import ATTR_NAME, CONF_CONDITIONS, STATE_ON

from conftest import make_timer
from scheduler import const
from scheduler.store import MigratableStore, TimeslotEntry, parse_schedule_data
from scheduler.switch import ScheduleEntity


def run(coro):
    """These helpers only await a recorder, so a private loop is enough."""
    return asyncio.run(coro)


def slot(
    start,
    stop=None,
    track=const.DEFAULT_TRACK,
    priority=const.DEFAULT_PRIORITY,
    entities=(),
    name=None,
    service="switch.turn_on",
):
    return {
        const.ATTR_START: start,
        const.ATTR_STOP: stop,
        ATTR_NAME: name,
        const.ATTR_TRACK: track,
        const.ATTR_PRIORITY: priority,
        const.ATTR_ACTIONS: [
            {"entity_id": entity, "service": service, "service_data": {}}
            for entity in entities
        ],
        CONF_CONDITIONS: [],
        const.ATTR_CONDITION_TYPE: None,
        const.ATTR_TRACK_CONDITIONS: False,
    }


class RecordingActionHandler:
    """Stands in for the action handler and remembers what it was told."""

    def __init__(self):
        self.queued = []
        self.emptied = []

    async def async_queue_actions(
        self, data, skip_initial_execution=False, track=None, exclude_entities=None
    ):
        self.queued.append(
            SimpleNamespace(
                slot=data,
                skip=skip_initial_execution,
                track=track,
                excluded=set(exclude_entities or []),
            )
        )

    async def async_empty_queue(self, track=None, **kwargs):
        self.emptied.append((track, kwargs))


def make_entity(timeslots, repeat_type=const.REPEAT_TYPE_REPEAT, end_date=None):
    """A ScheduleEntity with only the state the track logic reads."""
    entity = ScheduleEntity.__new__(ScheduleEntity)
    entity.hass = None
    entity.schedule_id = "abc123"
    entity.entity_id = "switch.schedule_test"
    entity.coordinator = SimpleNamespace(state=const.STATE_READY, time_shutdown=None)
    entity.schedule = {
        const.ATTR_TIMESLOTS: timeslots,
        const.ATTR_REPEAT_TYPE: repeat_type,
        const.ATTR_END_DATE: end_date,
        const.ATTR_ENABLED: True,
    }
    entity._state = STATE_ON
    entity._timer = None
    entity._timestamps = []
    entity._next_entries = []
    entity._current_slot = None
    entity._current_slots = {}
    entity._applied = {}
    entity._init = True
    entity._tags = []
    entity._action_handler = RecordingActionHandler()
    entity._timer_handler = None
    return entity


# --- splitting a schedule into tracks --------------------------------------


def test_slots_without_a_track_share_the_original_timeline(timer_factory):
    timer = timer_factory(
        [slot("07:00:00", "12:00:00"), slot("12:00:00", "22:00:00")]
    )

    assert timer._track_slots == {const.DEFAULT_TRACK: [0, 1]}


def test_each_track_keeps_its_own_partition(timer_factory):
    timer = timer_factory(
        [
            slot("07:00:00", "12:00:00", track="group"),
            slot("12:00:00", "22:00:00", track="group"),
            slot("11:30:00", "13:00:00", track="plata"),
        ]
    )

    assert timer._track_slots == {"group": [0, 1], "plata": [2]}


def test_a_blank_track_is_the_default_track(timer_factory):
    timer = timer_factory([{const.ATTR_START: "07:00:00", const.ATTR_STOP: None}])

    assert timer._track_slots == {const.DEFAULT_TRACK: [0]}


# --- two tracks can be inside a timeslot at the same moment ----------------


def test_tracks_overlap(timer_factory):
    """The whole point: the hotplate's boundary does not split the group."""
    timer = timer_factory(
        [
            slot("07:00:00", "22:00:00", track="group"),
            slot("11:30:00", "13:00:00", track="plata"),
        ]
    )
    noon = dt_util.now().replace(hour=12, minute=0, second=0, microsecond=0)

    active = timer.current_timeslots(noon)

    assert active["group"][0] == 0
    assert active["plata"][0] == 1


def test_a_single_track_schedule_still_has_one_current_slot(timer_factory):
    timer = timer_factory(
        [slot("07:00:00", "12:00:00"), slot("12:00:00", "22:00:00")]
    )
    now = dt_util.now().replace(hour=15, minute=0, second=0, microsecond=0)

    assert timer.current_timeslot(now)[0] == 1


def test_outside_every_track_nothing_is_current(timer_factory):
    timer = timer_factory(
        [
            slot("07:00:00", "12:00:00", track="group"),
            slot("11:30:00", "13:00:00", track="plata"),
        ]
    )
    night = dt_util.now().replace(hour=3, minute=0, second=0, microsecond=0)

    active = timer.current_timeslots(night)

    assert [x[0] for x in active.values()] == [None, None]


def test_next_timeslot_is_scoped_to_its_track(timer_factory):
    timer = timer_factory(
        [
            slot("07:00:00", "12:00:00", track="group"),
            slot("11:30:00", "13:00:00", track="plata"),
        ]
    )

    assert timer.next_timeslot(slots=[1])[0] == 1
    assert timer.next_timeslot(slots=[0])[0] == 0


# --- the ordering the frontend reads ---------------------------------------


def test_timestamps_stay_aligned_when_an_anchor_cannot_be_resolved(
    timer_factory, states
):
    """An unresolved anchor must not shift the other slots' timestamps.

    The card looks up timestamps[next_entries[0]] - if the list were compacted
    it would show one slot's index against another slot's moment.
    """
    states.set("sensor.shkia", "unavailable")
    timer = timer_factory(
        [
            slot("sensor.shkia-00:18:00", "22:00:00"),
            slot("07:00:00", "12:00:00"),
        ]
    )

    timer.next_timeslot()

    assert timer.timestamps[0] is None
    assert timer.timestamps[1] is not None
    assert timer.slot_queue == [1]
    assert timer.timestamps[timer.slot_queue[0]] == timer.timestamps[1]


def test_an_unresolvable_slot_is_left_out_of_the_ordering(timer_factory, states):
    states.set("sensor.shkia", "unavailable")
    timer = timer_factory([slot("sensor.shkia-00:18:00", "22:00:00")])

    assert timer.next_timeslot() == (None, None)
    assert timer.slot_queue == []


# --- which track owns a device right now -----------------------------------


def test_a_stronger_track_takes_the_device_from_its_group():
    entity = make_entity(
        [
            slot("07:00:00", "22:00:00", track="group", entities=["switch.plata", "light.salon"]),
            slot("11:30:00", "13:00:00", track="plata", priority=1, entities=["switch.plata"]),
        ]
    )
    entity._current_slots = {"group": 0, "plata": 1}

    assert entity.async_owned_entities("group") == {"switch.plata"}
    assert entity.async_owned_entities("plata") == set()


def test_equal_priority_tracks_do_not_take_each_other_s_devices():
    entity = make_entity(
        [
            slot("07:00:00", "22:00:00", track="group", entities=["switch.plata"]),
            slot("11:30:00", "13:00:00", track="other", entities=["switch.plata"]),
        ]
    )
    entity._current_slots = {"group": 0, "other": 1}

    assert entity.async_owned_entities("group") == set()


def test_an_inactive_track_owns_nothing():
    entity = make_entity(
        [
            slot("07:00:00", "22:00:00", track="group", entities=["switch.plata"]),
            slot("11:30:00", "13:00:00", track="plata", priority=1, entities=["switch.plata"]),
        ]
    )
    entity._current_slots = {"group": 0, "plata": None}

    assert entity.async_owned_entities("group") == set()


# --- applying the tracks ---------------------------------------------------


def test_a_detached_device_is_left_out_of_its_group_s_actions():
    entity = make_entity(
        [
            slot("07:00:00", "22:00:00", track="group", entities=["switch.plata", "light.salon"]),
            slot("11:30:00", "13:00:00", track="plata", priority=1, entities=["switch.plata"]),
        ]
    )
    entity._current_slots = {"group": 0, "plata": 1}

    run(entity.async_sync_tracks())

    queued = {x.track: x for x in entity._action_handler.queued}
    assert queued["group"].excluded == {"switch.plata"}
    assert queued["plata"].excluded == set()


def test_a_track_is_not_re_applied_while_nothing_moved():
    entity = make_entity([slot("07:00:00", "22:00:00", entities=["light.salon"])])
    entity._current_slots = {const.DEFAULT_TRACK: 0}

    run(entity.async_sync_tracks())
    run(entity.async_sync_tracks())

    assert len(entity._action_handler.queued) == 1


def test_the_device_returns_to_its_group_when_the_detach_ends():
    """The group is re-applied - without it the hotplate would keep the
    detached state until the group's next boundary, hours later."""
    entity = make_entity(
        [
            slot("07:00:00", "22:00:00", track="group", entities=["switch.plata", "light.salon"]),
            slot("11:30:00", "13:00:00", track="plata", priority=1, entities=["switch.plata"]),
        ]
    )
    entity._current_slots = {"group": 0, "plata": 1}
    run(entity.async_sync_tracks())
    entity._action_handler.queued.clear()

    # 13:00 - the detach is over, the group did not move
    previous = dict(entity._current_slots)
    entity._current_slots = {"group": 0, "plata": None}
    run(entity.async_release_tracks(previous))
    run(entity.async_sync_tracks())

    assert entity._action_handler.emptied == [("plata", {})]
    queued = entity._action_handler.queued
    assert [x.track for x in queued] == ["group"]
    assert queued[0].excluded == set()


def test_leaving_one_track_leaves_the_other_running():
    entity = make_entity(
        [
            slot("07:00:00", "22:00:00", track="group", entities=["light.salon"]),
            slot("11:30:00", "13:00:00", track="plata", priority=1, entities=["switch.plata"]),
        ]
    )
    entity._current_slots = {"group": 0, "plata": 1}
    run(entity.async_sync_tracks())

    previous = dict(entity._current_slots)
    entity._current_slots = {"group": 0, "plata": None}
    released = run(entity.async_release_tracks(previous))

    assert released == [("plata", 1)]
    # the group's queue was never touched
    assert [track for (track, _kwargs) in entity._action_handler.emptied] == ["plata"]


def test_a_restart_during_a_detach_does_not_hand_the_device_back():
    """The failure this guards against: on restart the group re-applies the
    slot it is inside, which would drive a device that is currently detached.
    """
    entity = make_entity(
        [
            slot("07:00:00", "22:00:00", track="group", entities=["switch.plata", "light.salon"]),
            slot("11:30:00", "13:00:00", track="plata", priority=1, entities=["switch.plata"]),
        ]
    )
    # a fresh start: nothing has been applied yet, both tracks are overlapping
    entity._current_slots = {"group": 0, "plata": 1}

    run(entity.async_sync_tracks(initial=True))

    queued = {x.track: x for x in entity._action_handler.queued}
    assert "switch.plata" in queued["group"].excluded
    assert queued["plata"].excluded == set()


def test_a_disabled_schedule_applies_nothing():
    entity = make_entity([slot("07:00:00", "22:00:00", entities=["light.salon"])])
    entity._state = "off"
    entity._current_slots = {const.DEFAULT_TRACK: 0}

    run(entity.async_sync_tracks())

    assert entity._action_handler.queued == []


def test_only_the_track_that_ended_is_considered_finished():
    """A schedule is done when no track is left, not when one of them ends."""
    entity = make_entity(
        [
            slot("07:00:00", "22:00:00", track="group", entities=["light.salon"]),
            slot("11:30:00", "13:00:00", track="plata", entities=["switch.plata"]),
        ],
        repeat_type=const.REPEAT_TYPE_SINGLE,
    )
    entity._current_slots = {"group": 0, "plata": 1}

    previous = dict(entity._current_slots)
    entity._current_slots = {"group": 0, "plata": None}
    released = run(entity.async_release_tracks(previous))

    assert released
    assert any(x is not None for x in entity._current_slots.values())


# --- what the timer wakes up for -------------------------------------------
#
# Saturday 2026-08-15, 12:00 in Jerusalem. Freezing it keeps the boundaries
# below at fixed distances from "now" instead of drifting with the clock.


@pytest.fixture
def frozen(monkeypatch):
    fixed = datetime.datetime(2026, 8, 15, 9, 0, tzinfo=datetime.timezone.utc)
    monkeypatch.setattr(dt_util, "utcnow", lambda: fixed)
    return dt_util.as_local(fixed)


def arm(timer, monkeypatch):
    """Start the timer with its side effects recorded instead of performed."""
    import scheduler.timer as timer_module

    async def noop(*args, **kwargs):
        return None

    sent = []
    monkeypatch.setattr(
        timer_module, "async_track_point_in_time", lambda hass, cb, ts: (lambda: None)
    )
    monkeypatch.setattr(
        timer_module,
        "async_dispatcher_send",
        lambda hass, signal, *rest: sent.append(signal),
    )
    timer.async_start_anchor_tracker = noop
    timer.async_start_workday_tracker = noop
    timer.async_stop_timer = noop
    run(timer.async_start_timer())
    return sent


def test_the_timer_wakes_for_the_soonest_boundary_of_any_track(
    timer_factory, monkeypatch, frozen
):
    timer = timer_factory(
        [
            slot("07:00:00", "22:00:00", track="group"),
            slot("11:30:00", "13:00:00", track="plata"),
        ]
    )

    arm(timer, monkeypatch)

    assert timer.current_slots == {"group": 0, "plata": 1}
    assert timer._next_trigger.hour == 13  # the detach ends first
    assert [(x.track, x.is_end) for x in timer._pending] == [("plata", True)]
    assert timer._timer_is_endpoint is True


def test_tracks_that_share_a_moment_are_both_pending(
    timer_factory, monkeypatch, frozen
):
    timer = timer_factory(
        [
            slot("07:00:00", "13:00:00", track="group"),
            slot("11:30:00", "13:00:00", track="plata"),
        ]
    )

    arm(timer, monkeypatch)

    assert sorted(x.track for x in timer._pending) == ["group", "plata"]


def test_a_start_and_an_end_at_the_same_moment_count_as_a_start(
    timer_factory, monkeypatch, frozen
):
    """One track handing over while another finishes must still fire actions."""
    timer = timer_factory(
        [
            slot("07:00:00", "13:00:00", track="group"),
            slot("13:00:00", "22:00:00", track="group"),
            slot("11:30:00", "13:00:00", track="plata"),
        ]
    )

    sent = arm(timer, monkeypatch)
    assert timer._timer_is_endpoint is False
    assert timer._next_slot == 1

    sent.clear()
    run(timer.async_timer_finished(timer._next_trigger))

    assert timer.current_slots == {"group": 1, "plata": None}
    assert const.EVENT_TIMER_FINISHED in sent


def test_an_ending_track_alone_just_restarts_the_timer(
    timer_factory, monkeypatch, frozen
):
    timer = timer_factory(
        [
            slot("07:00:00", "22:00:00", track="group"),
            slot("11:30:00", "13:00:00", track="plata"),
        ]
    )
    arm(timer, monkeypatch)

    restarted = []
    timer.async_start_timer = lambda: _record(restarted)
    run(timer.async_timer_finished(timer._next_trigger))

    assert timer.current_slots == {"group": 0, "plata": None}
    assert restarted == [True]


async def _record(bucket):
    bucket.append(True)


def test_current_slot_still_reports_the_plain_single_track_answer(
    timer_factory, monkeypatch, frozen
):
    timer = timer_factory(
        [slot("07:00:00", "13:00:00"), slot("13:00:00", "22:00:00")]
    )

    arm(timer, monkeypatch)

    assert timer.current_slot == 0
    assert timer.current_slots == {const.DEFAULT_TRACK: 0}


def test_a_track_with_an_unavailable_anchor_does_not_stop_the_others(
    timer_factory, monkeypatch, frozen, states
):
    states.set("sensor.shkia", "unavailable")
    timer = timer_factory(
        [
            slot("07:00:00", "22:00:00", track="group"),
            slot("sensor.shkia-00:18:00", "23:00:00", track="plata"),
        ]
    )

    arm(timer, monkeypatch)

    assert timer.current_slots == {"group": 0, "plata": None}
    assert timer._next_trigger is not None


def test_the_shabbat_band_and_a_detach_inside_it(
    timer_factory, monkeypatch, frozen, states
):
    """The plan itself: one band held by dated anchors, one device detached.

    The band runs from Friday's candle lighting to Saturday's havdalah, which
    no weekday rule can express - Yom Tov included - while the hotplate keeps
    its own hours inside it.
    """
    states.set(
        "sensor.jewish_calendar_upcoming_candle_lighting",
        "2026-08-14T16:29:00+00:00",  # Friday 19:29 local
    )
    states.set(
        "sensor.jewish_calendar_upcoming_havdalah",
        "2026-08-15T17:12:00+00:00",  # Saturday 20:12 local
    )
    timer = timer_factory(
        [
            slot(
                "sensor.jewish_calendar_upcoming_candle_lighting+00:00:00",
                "sensor.jewish_calendar_upcoming_havdalah+00:00:00",
                track="group",
                name="שבת",
            ),
            slot("11:30:00", "13:00:00", track="plata", priority=1, name="פלטה"),
        ]
    )

    arm(timer, monkeypatch)

    # 12:00 on Shabbat: the band is running and so is the hotplate's detach
    assert timer.current_slots == {"group": 0, "plata": 1}
    # the hotplate rejoins the group at 13:00, hours before havdalah
    assert timer._next_trigger.hour == 13
    assert [(x.track, x.is_end) for x in timer._pending] == [("plata", True)]


# --- a slot with a period of its own ---------------------------------------
#
# "A one-off exception" in the plan: the hotplate leaves the group once, and
# afterwards the detach is gone without the group ever being edited.


def test_a_slot_period_narrows_the_schedule_s(timer_factory):
    timer = timer_factory(
        [
            slot("07:00:00", "22:00:00"),
            dict(
                slot("11:30:00", "13:00:00"),
                start_date="2026-08-01",
                end_date="2026-08-31",
            ),
        ]
    )
    timer._start_date = "2026-08-10"
    timer._end_date = "2026-12-31"

    assert timer.slot_dates(0) == ("2026-08-10", "2026-12-31")
    # the later start and the earlier end win
    assert timer.slot_dates(1) == ("2026-08-10", "2026-08-31")


def test_a_slot_without_its_own_period_uses_the_schedule_s(timer_factory):
    timer = timer_factory([slot("07:00:00", "22:00:00")])

    assert timer.slot_dates(0) == (None, None)


def test_a_spent_one_off_detach_leaves_the_group_alone(
    timer_factory, monkeypatch, frozen
):
    timer = timer_factory(
        [
            slot("07:00:00", "22:00:00", track="group"),
            dict(
                slot("11:30:00", "13:00:00", track="plata"),
                end_date="2026-08-08",  # a week before "now"
            ),
        ]
    )

    arm(timer, monkeypatch)

    assert timer.current_slots == {"group": 0, "plata": None}


def test_a_one_off_detach_still_runs_on_its_own_day(
    timer_factory, monkeypatch, frozen
):
    timer = timer_factory(
        [
            slot("07:00:00", "22:00:00", track="group"),
            dict(
                slot("11:30:00", "13:00:00", track="plata"),
                start_date="2026-08-15",
                end_date="2026-08-15",
            ),
        ]
    )

    arm(timer, monkeypatch)

    assert timer.current_slots == {"group": 0, "plata": 1}


# --- storage ---------------------------------------------------------------


def test_a_timeslot_carries_its_name():
    """The cubes of a plan are named, and the name has to survive a save."""
    entry = TimeslotEntry(start="19:08:00", name="קבלת שבת")

    assert entry.name == "קבלת שבת"
    assert entry.track == const.DEFAULT_TRACK
    assert entry.priority == const.DEFAULT_PRIORITY


def test_stored_slots_without_a_track_land_on_the_default_one():
    data = parse_schedule_data(
        {const.ATTR_TIMESLOTS: [{const.ATTR_START: "07:00:00", const.ATTR_TRACK: None}]}
    )

    assert data[const.ATTR_TIMESLOTS][0].track == const.DEFAULT_TRACK
    assert data[const.ATTR_TIMESLOTS][0].priority == const.DEFAULT_PRIORITY


def test_migration_puts_existing_schedules_on_the_default_track():
    store = MigratableStore.__new__(MigratableStore)
    data = {
        "schedules": [
            {
                const.ATTR_TIMESLOTS: [
                    {const.ATTR_START: "07:00:00", CONF_CONDITIONS: []}
                ]
            }
        ]
    }

    migrated = run(store._async_migrate_func(3, data))

    slot_data = migrated["schedules"][0][const.ATTR_TIMESLOTS][0]
    assert slot_data[const.ATTR_TRACK] == const.DEFAULT_TRACK
    assert slot_data[const.ATTR_PRIORITY] == const.DEFAULT_PRIORITY
    assert slot_data[ATTR_NAME] is None


def test_migration_keeps_a_track_that_is_already_set():
    store = MigratableStore.__new__(MigratableStore)
    data = {
        "schedules": [
            {
                const.ATTR_TIMESLOTS: [
                    {
                        const.ATTR_START: "07:00:00",
                        CONF_CONDITIONS: [],
                        const.ATTR_TRACK: "group",
                        const.ATTR_PRIORITY: 2,
                    }
                ]
            }
        ]
    }

    migrated = run(store._async_migrate_func(3, data))

    slot_data = migrated["schedules"][0][const.ATTR_TIMESLOTS][0]
    assert slot_data[const.ATTR_TRACK] == "group"
    assert slot_data[const.ATTR_PRIORITY] == 2


# --- the incoming schema ---------------------------------------------------


def test_schema_defaults_a_slot_onto_the_default_track():
    result = const.TIMESLOT_SCHEMA(
        {
            const.ATTR_START: "07:00:00",
            const.ATTR_ACTIONS: [{"service": "switch.turn_on"}],
        }
    )

    assert result[const.ATTR_TRACK] == const.DEFAULT_TRACK
    assert result[const.ATTR_PRIORITY] == const.DEFAULT_PRIORITY


def test_schema_accepts_a_named_cube_on_its_own_track():
    result = const.TIMESLOT_SCHEMA(
        {
            const.ATTR_START: "sensor.jewish_calendar_upcoming_candle_lighting+00:00:00",
            const.ATTR_STOP: "22:30:00",
            ATTR_NAME: "קבלת שבת",
            const.ATTR_TRACK: "group:shabbat",
            const.ATTR_PRIORITY: 1,
            const.ATTR_ACTIONS: [{"service": "switch.turn_on"}],
        }
    )

    assert result[ATTR_NAME] == "קבלת שבת"
    assert result[const.ATTR_TRACK] == "group:shabbat"
    assert result[const.ATTR_PRIORITY] == 1


@pytest.mark.parametrize("value", ["", "   ", None])
def test_schema_never_invents_a_nameless_track(value):
    result = const.TIMESLOT_SCHEMA(
        {
            const.ATTR_START: "07:00:00",
            const.ATTR_TRACK: value,
            const.ATTR_ACTIONS: [{"service": "switch.turn_on"}],
        }
    )

    assert result[const.ATTR_TRACK] == const.DEFAULT_TRACK
