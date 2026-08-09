"""The words a model writes, and the schedule they become.

Two things are being pinned here. One is that the shorthand and the engine's
own format are the same language read two ways, so a plan survives being read
back and written again. The other is that every refusal tells the caller what
to write instead - a model that is told "invalid time" learns nothing, and this
whole module exists so that a weak one can correct itself.
"""
import pytest

from scheduler.plan_model import (
    PLAN_TAG,
    Cube,
    Group,
    Plan,
    PlanError,
    PlanException,
    plan_from_dict,
    plan_from_schedule,
    plan_to_dict,
    plan_to_payload,
    warnings_for,
)
from scheduler.plan_times import (
    DEFAULT_ANCHORS,
    TimeError,
    from_engine,
    parse_time,
    to_engine,
)

CANDLE = DEFAULT_ANCHORS["candle_lighting"]
HAVDALAH = DEFAULT_ANCHORS["havdalah"]


# --- the time vocabulary ----------------------------------------------------


@pytest.mark.parametrize(
    "shorthand,engine",
    [
        ("candle_lighting", f"{CANDLE}+00:00:00"),
        ("havdalah", f"{HAVDALAH}+00:00:00"),
        ("havdalah-30m", f"{HAVDALAH}-00:30:00"),
        ("havdalah+1h", f"{HAVDALAH}+01:00:00"),
        ("candle_lighting+1h30m", f"{CANDLE}+01:30:00"),
        ("havdalah-01:30", f"{HAVDALAH}-01:30:00"),
        ("havdalah@06:30", f"{HAVDALAH}@06:30:00"),
        ("candle_lighting@22:30", f"{CANDLE}@22:30:00"),
        ("13:00", "13:00:00"),
    ],
)
def test_shorthand_expands(shorthand, engine):
    assert to_engine(shorthand) == engine


@pytest.mark.parametrize(
    "shorthand",
    [
        "candle_lighting",
        "havdalah-30m",
        "havdalah+1h30m",
        "havdalah@06:30",
        "13:00",
    ],
)
def test_the_two_forms_are_one_language(shorthand):
    """Reading a plan and writing one must use the same words."""
    assert from_engine(to_engine(shorthand)) == shorthand


def test_an_entity_of_your_own_is_accepted():
    assert to_engine("sensor.my_zman@06:30") == "sensor.my_zman@06:30:00"
    assert from_engine("sensor.my_zman@06:30:00") == "sensor.my_zman@06:30"


def test_at_the_anchor_is_a_zero_offset_either_way():
    assert parse_time("havdalah").op == "+"
    assert parse_time("havdalah").hours == 0
    assert from_engine(f"{HAVDALAH}+00:00:00") == "havdalah"


@pytest.mark.parametrize(
    "expression,expected_words",
    [
        ("", "candle_lighting"),
        ("shkia", "not a time this plan understands"),
        ("havdalah@25:00", "hours are 0-23"),
        ("havdalah-90x", "not a duration"),
        ("havdalah+30h", "more than a day away"),
    ],
)
def test_a_refusal_says_what_to_write_instead(expression, expected_words):
    with pytest.raises(TimeError) as err:
        parse_time(expression)
    assert expected_words in str(err.value)


def test_the_mistake_people_actually_make_is_called_out():
    """A plain clock time inside a band fires every day of the week."""
    plan = Plan(
        name="x",
        groups=[Group("home", ["light.a"], [Cube("night", "candle_lighting", "22:30")])],
    )
    notes = warnings_for(plan)
    assert notes and "every day of the week" in notes[0]
    assert "havdalah@22:30" in notes[0]


def test_a_day_anchored_time_draws_no_warning():
    plan = Plan(
        name="x",
        groups=[Group("home", ["light.a"], [Cube("night", "candle_lighting", "havdalah@06:30")])],
    )
    assert warnings_for(plan) == []


def test_describe_reads_as_a_sentence():
    assert parse_time("havdalah@06:30").describe(DEFAULT_ANCHORS).startswith("06:30 on the day of")
    assert "before" in parse_time("havdalah-30m").describe(DEFAULT_ANCHORS)
    assert parse_time("candle_lighting").describe(DEFAULT_ANCHORS).startswith("exactly at")


# --- a plan becomes a schedule ---------------------------------------------


def worked_plan():
    return plan_from_dict(
        {
            "name": "Shabbat",
            "groups": [
                {
                    "name": "home",
                    "devices": ["light.salon", "switch.plata"],
                    "cubes": [
                        {"name": "coming in", "from": "candle_lighting", "to": "candle_lighting@22:30", "state": "on"},
                        {"name": "night", "from": "candle_lighting@22:30", "to": "havdalah@06:30", "state": "off"},
                        {"name": "morning", "from": "havdalah@06:30", "to": "havdalah+1h", "state": "on"},
                    ],
                }
            ],
            "exceptions": [
                {
                    "device": "switch.plata",
                    "name": "hotplate",
                    "from": "havdalah@11:30",
                    "to": "havdalah@13:00",
                    "state": "on",
                }
            ],
        }
    )


def test_a_group_is_one_track_and_acts_on_every_device():
    payload = plan_to_payload(worked_plan())
    group_slots = [s for s in payload["timeslots"] if not s["track"].startswith("detach:")]

    assert len(group_slots) == 3
    assert {s["track"] for s in group_slots} == {"group:home"}
    assert [a["entity_id"] for a in group_slots[0]["actions"]] == ["light.salon", "switch.plata"]
    assert group_slots[1]["actions"][0]["service"] == "light.turn_off"


def test_an_exception_outranks_its_group():
    payload = plan_to_payload(worked_plan())
    detach = next(s for s in payload["timeslots"] if s["track"].startswith("detach:"))

    assert detach["priority"] > 0
    assert detach["track"] == "detach:switch.plata"
    assert [a["entity_id"] for a in detach["actions"]] == ["switch.plata"]
    # the device stays in the group, so the group takes it back afterwards
    group_slots = [s for s in payload["timeslots"] if not s["track"].startswith("detach:")]
    assert all(
        any(a["entity_id"] == "switch.plata" for a in s["actions"]) for s in group_slots
    )


def test_the_payload_is_one_write_with_no_weekday_rule():
    payload = plan_to_payload(worked_plan())

    assert payload["weekdays"] == ["daily"]
    assert payload["repeat_type"] == "repeat"
    assert PLAN_TAG in payload["tags"]
    assert "schedule_id" not in payload


def test_names_survive():
    payload = plan_to_payload(worked_plan())
    assert [s["name"] for s in payload["timeslots"][:3]] == ["coming in", "night", "morning"]


def test_a_one_off_exception_carries_its_date():
    plan = worked_plan()
    plan.exceptions[0].only_on = "2026-08-15"
    detach = next(s for s in plan_to_payload(plan)["timeslots"] if s["track"].startswith("detach:"))

    assert detach["start_date"] == "2026-08-15"
    assert detach["end_date"] == "2026-08-15"


def test_two_exceptions_on_one_device_get_their_own_tracks():
    plan = worked_plan()
    plan.exceptions.append(
        PlanException(device="switch.plata", start="havdalah@15:00", stop="havdalah@16:00")
    )
    tracks = [s["track"] for s in plan_to_payload(plan)["timeslots"] if s["track"].startswith("detach:")]

    assert len(set(tracks)) == 2


# --- reading one back -------------------------------------------------------


def test_a_plan_round_trips_through_storage():
    original = worked_plan()
    payload = plan_to_payload(original)
    stored = {"name": payload["name"], "timeslots": payload["timeslots"], "tags": payload["tags"]}

    assert plan_to_dict(plan_from_schedule(stored)) == plan_to_dict(original)


def test_reading_back_speaks_the_shorthand_again():
    stored = {
        "name": "Shabbat",
        "timeslots": [
            {
                "start": f"{CANDLE}+00:00:00",
                "stop": f"{HAVDALAH}@06:30:00",
                "name": "night",
                "track": "group:home",
                "priority": 0,
                "actions": [{"service": "light.turn_on", "entity_id": "light.salon"}],
            }
        ],
    }
    cube = plan_to_dict(plan_from_schedule(stored))["groups"][0]["cubes"][0]

    assert cube["from"] == "candle_lighting"
    assert cube["to"] == "havdalah@06:30"


# --- what a bad plan is told ------------------------------------------------


@pytest.mark.parametrize(
    "plan,expected_words",
    [
        ({"name": "x", "groups": []}, "at least one group"),
        ({"name": "x", "groups": [{"name": "g", "devices": [], "cubes": []}]}, "no devices"),
        (
            {"name": "x", "groups": [{"name": "g", "devices": ["salon"], "cubes": []}]},
            "not an entity id",
        ),
        (
            {"name": "x", "groups": [{"name": "g", "devices": ["light.a"], "cubes": []}]},
            "no stretches",
        ),
        (
            {
                "name": "x",
                "groups": [{"name": "g", "devices": ["light.a"], "cubes": [
                    {"name": "n", "from": "candle_lighting", "to": "havdalah", "state": "dim"}]}],
            },
            "Use 'on' or 'off'",
        ),
        (
            {
                "name": "x",
                "groups": [{"name": "g", "devices": ["light.a"], "cubes": [
                    {"name": "n", "from": "candle_lighting", "to": "havdalah"}]}],
                "exceptions": [{"device": "switch.other", "from": "havdalah@11:30", "to": "havdalah@13:00"}],
            },
            "not in any group",
        ),
    ],
)
def test_a_bad_plan_is_told_how_to_be_a_good_one(plan, expected_words):
    with pytest.raises(PlanError) as err:
        plan_to_payload(plan_from_dict(plan))
    assert expected_words in str(err.value)


def test_a_stretch_missing_a_boundary_is_shown_the_shape():
    with pytest.raises(PlanError) as err:
        plan_from_dict(
            {"name": "x", "groups": [{"name": "g", "devices": ["light.a"], "cubes": [{"name": "n"}]}]}
        )
    message = str(err.value)
    assert "'from' and 'to'" in message
    assert "candle_lighting@22:30" in message


def test_a_bad_time_says_which_stretch_it_was_in():
    with pytest.raises(PlanError) as err:
        plan_to_payload(
            plan_from_dict(
                {
                    "name": "x",
                    "groups": [{"name": "home", "devices": ["light.a"], "cubes": [
                        {"name": "night", "from": "shkia", "to": "havdalah"}]}],
                }
            )
        )
    assert "group 'home', stretch 'night'" in str(err.value)
    assert "'from'" in str(err.value)
