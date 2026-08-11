"""Holding a device to what the schedule set.

On Shabbat somebody presses the wall switch out of habit, or another
integration decides the light should be off. The schedule said otherwise, and
this is the engine putting it back.

It has to be timid about it. If something else is pushing the other way, two
systems trading service calls several times a second is worse than the light
being wrong, so there is a cooldown, and anything that cannot be compared
counts as already correct rather than as a reason to shout.
"""
import datetime
from types import SimpleNamespace

import pytest
import homeassistant.util.dt as dt_util

from scheduler import const
from scheduler.actions import (
    ENFORCE_COOLDOWN,
    ActionQueue,
    state_matches_action,
)


def action(entity, service="switch.turn_on", **service_data):
    """A task shaped the way parse_service_call leaves it."""
    from homeassistant.const import CONF_ACTION, CONF_SERVICE_DATA

    return {
        CONF_ACTION: service,
        "entity_id": entity,
        CONF_SERVICE_DATA: service_data,
    }


def make_queue(hass, enforce=True, actions=()):
    queue = ActionQueue.__new__(ActionQueue)
    queue.hass = hass
    queue.id = "test_schedule"
    queue._timer = None
    queue._action_entities = [a["entity_id"] for a in actions]
    queue._condition_entities = []
    queue._listeners = []
    queue._state_update_listener = None
    queue._conditions = []
    queue._condition_type = None
    queue._queue = list(actions)
    queue.queue_busy = False
    queue._track_conditions = False
    queue._wait_for_available = False
    queue._enforce = enforce
    queue._enforced_actions = list(actions)
    queue._enforce_timer = None
    queue._last_enforced = None
    return queue


@pytest.fixture
def calls(monkeypatch):
    """Record the service calls instead of making them."""
    import scheduler.actions as actions_module

    made = []

    async def fake_call(_hass, config):
        made.append(config)

    monkeypatch.setattr(actions_module, "async_call_from_config", fake_call)
    return made


async def enforce(queue, entity="switch.plata"):
    await queue.async_enforce(entity)


# --- is the device already doing what was asked? ----------------------------


def test_a_switch_that_was_turned_off_does_not_match(hass, states):
    states.set("switch.plata", "off")
    assert state_matches_action(hass, action("switch.plata")) is False


def test_a_switch_already_on_matches(hass, states):
    states.set("switch.plata", "on")
    assert state_matches_action(hass, action("switch.plata")) is True


def test_turn_off_is_compared_the_other_way(hass, states):
    states.set("switch.plata", "on")
    assert state_matches_action(hass, action("switch.plata", "switch.turn_off")) is False
    states.set("switch.plata", "off")
    assert state_matches_action(hass, action("switch.plata", "switch.turn_off")) is True


def test_brightness_is_compared_as_a_percentage(hass, states):
    states.set("light.salon", "on", {"brightness": 128})  # about 50%
    assert state_matches_action(
        hass, action("light.salon", "light.turn_on", brightness_pct=50)
    ) is True
    assert state_matches_action(
        hass, action("light.salon", "light.turn_on", brightness_pct=20)
    ) is False


def test_colour_temperature_is_compared_with_room_to_breathe(hass, states):
    states.set("light.salon", "on", {"color_temp_kelvin": 2700})
    assert state_matches_action(
        hass, action("light.salon", "light.turn_on", color_temp_kelvin=2720)
    ) is True
    assert state_matches_action(
        hass, action("light.salon", "light.turn_on", color_temp_kelvin=5000)
    ) is False


@pytest.mark.parametrize("state", ["unavailable", "unknown"])
def test_an_unreachable_device_is_left_alone(hass, states, state):
    """Nothing to compare against, and nothing worth shouting at."""
    states.set("switch.plata", state)
    assert state_matches_action(hass, action("switch.plata")) is True


def test_a_device_that_does_not_exist_is_left_alone(hass, states):
    assert state_matches_action(hass, action("switch.nope")) is True


def test_an_action_it_cannot_read_counts_as_correct(hass, states):
    """Never re-send something whose effect cannot be checked."""
    states.set("media_player.tv", "playing")
    assert state_matches_action(
        hass, action("media_player.tv", "media_player.play_media", media_id="x")
    ) is True


# --- putting it back --------------------------------------------------------


async def test_a_device_moved_by_something_else_is_put_back(hass, states, calls):
    states.set("switch.plata", "off")
    queue = make_queue(hass, actions=[action("switch.plata")])

    await enforce(queue)

    assert [c["entity_id"] for c in calls] == ["switch.plata"]
    assert calls[0]["action"] == "switch.turn_on"


async def test_a_device_already_correct_is_not_touched(hass, states, calls):
    states.set("switch.plata", "on")
    queue = make_queue(hass, actions=[action("switch.plata")])

    await enforce(queue)

    assert calls == []


async def test_the_brightness_is_restored_too(hass, states, calls):
    states.set("light.salon", "on", {"brightness": 25})
    queue = make_queue(
        hass, actions=[action("light.salon", "light.turn_on", brightness_pct=80)]
    )

    await enforce(queue, "light.salon")

    from homeassistant.const import CONF_SERVICE_DATA

    assert calls[0][CONF_SERVICE_DATA]["brightness_pct"] == 80


async def test_only_the_device_that_moved_is_acted_on(hass, states, calls):
    states.set("switch.plata", "off")
    states.set("light.salon", "off")
    queue = make_queue(
        hass, actions=[action("switch.plata"), action("light.salon", "light.turn_on")]
    )

    await enforce(queue, "switch.plata")

    assert [c["entity_id"] for c in calls] == ["switch.plata"]


async def test_a_queue_that_is_not_enforcing_holds_nothing(hass, states, calls):
    states.set("switch.plata", "off")
    queue = make_queue(hass, enforce=False, actions=[action("switch.plata")])
    queue._enforced_actions = []

    await enforce(queue)

    assert calls == []


# --- not getting into a fight -----------------------------------------------


async def test_it_will_not_act_twice_inside_the_cooldown(hass, states, calls, monkeypatch):
    """Something else pushing back must not become a service-call storm."""
    scheduled = []
    import scheduler.actions as actions_module

    monkeypatch.setattr(
        actions_module,
        "async_call_later",
        lambda _hass, delay, _cb: scheduled.append(delay) or (lambda: None),
    )

    states.set("switch.plata", "off")
    queue = make_queue(hass, actions=[action("switch.plata")])

    await enforce(queue)
    await enforce(queue)  # the other system pushed straight back

    assert len(calls) == 1
    assert scheduled and 0 < scheduled[0] <= ENFORCE_COOLDOWN


async def test_it_tries_again_once_the_cooldown_has_passed(hass, states, calls):
    states.set("switch.plata", "off")
    queue = make_queue(hass, actions=[action("switch.plata")])

    await enforce(queue)
    queue._last_enforced = dt_util.utcnow() - datetime.timedelta(
        seconds=ENFORCE_COOLDOWN + 1
    )
    await enforce(queue)

    assert len(calls) == 2


async def test_only_one_retry_is_queued_while_waiting(hass, states, calls, monkeypatch):
    scheduled = []
    import scheduler.actions as actions_module

    monkeypatch.setattr(
        actions_module,
        "async_call_later",
        lambda _hass, delay, _cb: scheduled.append(delay) or (lambda: None),
    )
    states.set("switch.plata", "off")
    queue = make_queue(hass, actions=[action("switch.plata")])

    await enforce(queue)
    await enforce(queue)
    await enforce(queue)

    assert len(scheduled) == 1


# --- the queue survives long enough to do it --------------------------------


def test_an_enforcing_queue_is_not_cleaned_up(hass, states):
    """Ordinary queues are dropped once they have run; this one has to stay."""
    queue = make_queue(hass, actions=[action("switch.plata")])
    queue._queue = []

    assert queue.is_finished() is True
    assert queue.is_enforcing() is True


def test_a_plain_queue_is_finished_when_it_is_empty(hass, states):
    queue = make_queue(hass, enforce=False, actions=[action("switch.plata")])
    queue._queue = []
    queue._enforced_actions = []

    assert queue.is_enforcing() is False


# --- the field it comes from ------------------------------------------------


def test_the_slot_schema_carries_enforce():
    result = const.TIMESLOT_SCHEMA(
        {
            const.ATTR_START: "07:00:00",
            const.ATTR_ENFORCE: True,
            const.ATTR_ACTIONS: [{"service": "switch.turn_on"}],
        }
    )
    assert result[const.ATTR_ENFORCE] is True


def test_a_slot_does_not_enforce_unless_it_is_asked_to():
    result = const.TIMESLOT_SCHEMA(
        {const.ATTR_START: "07:00:00", const.ATTR_ACTIONS: [{"service": "switch.turn_on"}]}
    )
    assert result[const.ATTR_ENFORCE] is False


# --- settings are part of the state -----------------------------------------
#
# A device is not "correct" merely because it is on. An air conditioner nudged
# from 16 to 24 degrees, or a light dimmed from 80 to 25 percent, has been
# moved just as surely as one that was switched off - and holding a state has
# to mean holding what was set, not only whether it is running.


def test_an_air_conditioner_moved_off_its_temperature_does_not_match(hass, states):
    states.set("climate.salon", "cool", {"temperature": 24})

    assert state_matches_action(
        hass, action("climate.salon", "climate.set_temperature", temperature=16)
    ) is False
    states.set("climate.salon", "cool", {"temperature": 16})
    assert state_matches_action(
        hass, action("climate.salon", "climate.set_temperature", temperature=16)
    ) is True


async def test_a_temperature_that_was_changed_is_put_back(hass, states, calls):
    states.set("climate.salon", "cool", {"temperature": 24})
    queue = make_queue(
        hass, actions=[action("climate.salon", "climate.set_temperature", temperature=16)]
    )

    await enforce(queue, "climate.salon")

    from homeassistant.const import CONF_SERVICE_DATA
    assert calls[0][CONF_SERVICE_DATA]["temperature"] == 16


async def test_a_light_dimmed_by_somebody_is_put_back(hass, states, calls):
    states.set("light.salon", "on", {"brightness": 64})  # about 25%
    queue = make_queue(
        hass, actions=[action("light.salon", "light.turn_on", brightness_pct=80)]
    )

    await enforce(queue, "light.salon")

    assert calls, "a light left at the wrong brightness is still the wrong state"


async def test_a_colour_that_drifted_is_put_back(hass, states, calls):
    states.set("light.salon", "on", {"color_temp_kelvin": 5000})
    queue = make_queue(
        hass, actions=[action("light.salon", "light.turn_on", color_temp_kelvin=2700)]
    )

    await enforce(queue, "light.salon")

    assert calls


def test_a_device_at_its_settings_is_left_alone(hass, states):
    states.set("light.salon", "on", {"brightness": 204, "color_temp_kelvin": 2700})

    assert state_matches_action(
        hass,
        action("light.salon", "light.turn_on", brightness_pct=80, color_temp_kelvin=2700),
    ) is True


# --- and a device the stretch left out is not held either --------------------


async def test_a_device_left_out_of_a_stretch_is_not_held(hass, states, calls):
    """Holding holds what the stretch asked for, and nothing else.

    A stretch that names one device holds that one. The other is not its
    business: somebody switching it during the stretch is somebody switching
    their own light, not a state to be argued with.
    """
    states.set("light.salon", "off")
    states.set("switch.plata", "off")
    queue = make_queue(hass, actions=[action("light.salon", "light.turn_on")])

    await enforce(queue, "switch.plata")
    assert calls == []

    await enforce(queue, "light.salon")
    assert [c["entity_id"] for c in calls] == ["light.salon"]
