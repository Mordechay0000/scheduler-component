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


# --- one device differing inside a stretch ----------------------------------
#
# The alternative would be duplicating the whole timeline for the one device
# that needs a different state, which is exactly what tracks exist to avoid.


def plan_with_override():
    return plan_from_dict(
        {
            "name": "Shabbat",
            "groups": [
                {
                    "name": "home",
                    "devices": ["light.salon", "light.hallway", "switch.plata"],
                    "cubes": [
                        {
                            "name": "night",
                            "from": "candle_lighting",
                            "to": "havdalah",
                            "state": "on",
                            "overrides": [{"device": "switch.plata", "state": "off"}],
                        }
                    ],
                }
            ],
        }
    )


def test_a_device_can_differ_without_a_row_of_its_own():
    slot = plan_to_payload(plan_with_override())["timeslots"][0]
    by_device = {a["entity_id"]: a["service"] for a in slot["actions"]}

    assert by_device["light.salon"] == "light.turn_on"
    assert by_device["light.hallway"] == "light.turn_on"
    assert by_device["switch.plata"] == "switch.turn_off"
    # one stretch, one track: nothing was duplicated for the odd one out
    assert len({s["track"] for s in plan_to_payload(plan_with_override())["timeslots"]}) == 1


def test_an_override_reads_back_as_an_override():
    payload = plan_to_payload(plan_with_override())
    stored = {"name": payload["name"], "timeslots": payload["timeslots"]}
    cube = plan_to_dict(plan_from_schedule(stored))["groups"][0]["cubes"][0]

    assert cube["state"] == "on"
    assert cube["overrides"] == [{"device": "switch.plata", "state": "off"}]


def test_the_majority_decides_which_way_round_it_is():
    """Two off and one on reads as an off stretch with one device on."""
    plan = plan_from_dict(
        {
            "name": "x",
            "groups": [{
                "name": "home",
                "devices": ["light.a", "light.b", "light.c"],
                "cubes": [{
                    "name": "n", "from": "candle_lighting", "to": "havdalah", "state": "off",
                    "overrides": [{"device": "light.c", "state": "on"}],
                }],
            }],
        }
    )
    payload = plan_to_payload(plan)
    read = plan_from_schedule({"name": "x", "timeslots": payload["timeslots"]})

    assert read.groups[0].cubes[0].state == "off"
    assert list(read.groups[0].cubes[0].overrides) == ["light.c"]


def test_an_override_for_a_device_outside_the_group_is_refused():
    with pytest.raises(PlanError) as err:
        plan_to_payload(
            plan_from_dict({
                "name": "x",
                "groups": [{
                    "name": "home", "devices": ["light.a"],
                    "cubes": [{
                        "name": "n", "from": "candle_lighting", "to": "havdalah",
                        "overrides": [{"device": "light.elsewhere", "state": "off"}],
                    }],
                }],
            })
        )
    assert "not in 'home'" in str(err.value)


# --- brightness and colour --------------------------------------------------


def test_brightness_and_colour_reach_the_service_call():
    plan = plan_from_dict({
        "name": "x",
        "groups": [{
            "name": "home", "devices": ["light.salon"],
            "cubes": [{
                "name": "evening", "from": "candle_lighting", "to": "havdalah",
                "state": "on", "brightness": 40, "kelvin": 2200,
            }],
        }],
    })
    data = plan_to_payload(plan)["timeslots"][0]["actions"][0]["service_data"]

    assert data == {"brightness_pct": 40, "color_temp_kelvin": 2200}


def test_brightness_is_left_off_an_action_that_turns_something_off():
    plan = plan_from_dict({
        "name": "x",
        "groups": [{
            "name": "home", "devices": ["light.salon"],
            "cubes": [{
                "name": "night", "from": "candle_lighting", "to": "havdalah",
                "state": "off", "brightness": 40,
            }],
        }],
    })
    assert plan_to_payload(plan)["timeslots"][0]["actions"][0]["service_data"] == {}


def test_brightness_and_colour_survive_a_round_trip():
    plan = plan_from_dict({
        "name": "x",
        "groups": [{
            "name": "home", "devices": ["light.salon"],
            "cubes": [{
                "name": "evening", "from": "candle_lighting", "to": "havdalah",
                "state": "on", "brightness": 40, "kelvin": 2200,
            }],
        }],
    })
    payload = plan_to_payload(plan)
    cube = plan_to_dict(plan_from_schedule({"name": "x", "timeslots": payload["timeslots"]}))
    cube = cube["groups"][0]["cubes"][0]

    assert (cube["brightness"], cube["kelvin"]) == (40, 2200)


@pytest.mark.parametrize(
    "field,value,expected_words",
    [
        ("brightness", 0, "a percentage, 1 to 100"),
        ("brightness", 140, "a percentage, 1 to 100"),
        ("kelvin", 100, "colour temperature"),
        ("kelvin", 40000, "colour temperature"),
    ],
)
def test_a_parameter_out_of_range_is_told_the_range(field, value, expected_words):
    with pytest.raises(PlanError) as err:
        plan_to_payload(
            plan_from_dict({
                "name": "x",
                "groups": [{
                    "name": "home", "devices": ["light.a"],
                    "cubes": [{
                        "name": "n", "from": "candle_lighting", "to": "havdalah",
                        "state": "on", field: value,
                    }],
                }],
            })
        )
    assert expected_words in str(err.value)


# --- holding a device to what was set ---------------------------------------


def test_enforce_travels_with_the_stretch():
    plan = plan_from_dict({
        "name": "x",
        "groups": [{
            "name": "home", "devices": ["light.a"],
            "cubes": [{
                "name": "n", "from": "candle_lighting", "to": "havdalah", "enforce": True,
            }],
        }],
    })
    payload = plan_to_payload(plan)

    assert payload["timeslots"][0]["enforce"] is True
    read = plan_from_schedule({"name": "x", "timeslots": payload["timeslots"]})
    assert read.groups[0].cubes[0].enforce is True


def test_a_stretch_does_not_enforce_unless_asked():
    assert plan_to_payload(worked_plan())["timeslots"][0]["enforce"] is False


# --- conflicts --------------------------------------------------------------


def test_a_device_cannot_be_in_two_groups():
    with pytest.raises(PlanError) as err:
        plan_to_payload(
            plan_from_dict({
                "name": "x",
                "groups": [
                    {"name": "a", "devices": ["light.shared"], "cubes": [
                        {"name": "n", "from": "candle_lighting", "to": "havdalah"}]},
                    {"name": "b", "devices": ["light.shared"], "cubes": [
                        {"name": "n", "from": "candle_lighting", "to": "havdalah"}]},
                ],
            })
        )
    message = str(err.value)
    assert "in both 'a' and 'b'" in message
    assert "override" in message  # and what to do instead


def test_two_stretches_cannot_begin_together():
    with pytest.raises(PlanError) as err:
        plan_to_payload(
            plan_from_dict({
                "name": "x",
                "groups": [{"name": "home", "devices": ["light.a"], "cubes": [
                    {"name": "one", "from": "havdalah@06:30", "to": "havdalah@08:00"},
                    {"name": "two", "from": "havdalah@06:30", "to": "havdalah@09:00"},
                ]}],
            })
        )
    assert "both start at" in str(err.value)


def test_a_stretch_that_covers_nothing_is_refused():
    with pytest.raises(PlanError) as err:
        plan_to_payload(
            plan_from_dict({
                "name": "x",
                "groups": [{"name": "home", "devices": ["light.a"], "cubes": [
                    {"name": "n", "from": "havdalah@06:30", "to": "havdalah@06:30"}]}],
            })
        )
    assert "covers nothing" in str(err.value)


def test_a_gap_between_stretches_is_allowed_but_pointed_out():
    plan = plan_from_dict({
        "name": "x",
        "groups": [{"name": "home", "devices": ["light.a"], "cubes": [
            {"name": "one", "from": "candle_lighting", "to": "havdalah@06:30"},
            {"name": "two", "from": "havdalah@08:00", "to": "havdalah"},
        ]}],
    })
    plan_to_payload(plan)  # not an error

    notes = warnings_for(plan)
    assert any("Nothing is set in between" in note for note in notes)


def test_several_exceptions_on_one_device_are_ordered_rather_than_left_to_chance():
    plan = worked_plan()
    plan.exceptions.append(
        PlanException(device="switch.plata", start="havdalah@15:00", stop="havdalah@16:00")
    )
    detaches = [s for s in plan_to_payload(plan)["timeslots"] if s["track"].startswith("detach:")]

    assert len({s["track"] for s in detaches}) == 2
    # if two ever did overlap, the later one wins outright
    assert [s["priority"] for s in detaches] == [1, 2]


def test_the_shabbat_only_sensors_are_called_out():
    """They exist, they look right, and they miss every festival."""
    plan = worked_plan()
    plan.anchors = {
        "candle_lighting": "sensor.jewish_calendar_upcoming_shabbat_candle_lighting",
        "havdalah": "sensor.jewish_calendar_upcoming_shabbat_havdalah",
    }
    notes = warnings_for(plan)

    assert any("also cover Yom Tov" in note for note in notes)


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


# --- reading the day back before it happens ---------------------------------
#
# A plan is easy to write and hard to check: what a device does at four in the
# afternoon is spread over a stretch, an override inside it and possibly an
# exception on top. The report is what makes that answerable before Shabbat
# rather than during it.


def test_the_report_says_what_each_device_does_in_each_stretch():
    from scheduler.plan_model import describe_plan

    report = describe_plan(plan_with_override())
    stretch = report["groups"][0]["stretches"][0]

    by_device = {d["device"]: d for d in stretch["devices"]}
    assert by_device["light.salon"]["state"] == "on"
    assert by_device["light.salon"]["why"] == "group"
    assert by_device["switch.plata"]["state"] == "off"
    assert by_device["switch.plata"]["why"] == "override"


def test_the_report_puts_the_boundaries_in_words():
    from scheduler.plan_model import describe_plan

    stretch = describe_plan(worked_plan())["groups"][0]["stretches"][1]

    assert stretch["from_means"] == "22:30 on the day of candle_lighting"
    assert stretch["to_means"] == "06:30 on the day of havdalah"


def test_the_report_names_the_band_and_says_it_covers_yom_tov():
    from scheduler.plan_model import describe_plan

    band = describe_plan(worked_plan())["band"]

    assert band["opens"] == CANDLE
    assert "Yom Tov" in band["means"]


def test_the_report_flags_where_an_exception_takes_over():
    from scheduler.plan_model import describe_plan

    report = describe_plan(worked_plan())
    devices = report["groups"][0]["stretches"][2]["devices"]
    plata = next(d for d in devices if d["device"] == "switch.plata")

    assert "takes it over" in plata.get("but", "")
    assert report["exceptions"][0]["device"] == "switch.plata"


def test_the_report_carries_the_warnings_with_it():
    from scheduler.plan_model import describe_plan

    plan = plan_from_dict({
        "name": "x",
        "groups": [{"name": "home", "devices": ["light.a"], "cubes": [
            {"name": "n", "from": "candle_lighting", "to": "22:30", "state": "off"}]}],
    })
    assert any("every day of the week" in note for note in describe_plan(plan)["warnings"])


def test_the_report_refuses_a_plan_that_would_not_work():
    from scheduler.plan_model import describe_plan

    with pytest.raises(PlanError):
        describe_plan(plan_from_dict({"name": "x", "groups": []}))


def test_brightness_is_not_sent_to_something_that_is_not_a_light():
    """switch.turn_on with brightness_pct would simply be rejected."""
    plan = plan_from_dict({
        "name": "x",
        "groups": [{"name": "home", "devices": ["light.salon", "switch.boiler"], "cubes": [
            {"name": "n", "from": "candle_lighting", "to": "havdalah",
             "state": "on", "brightness": 60}]}],
    })
    by_device = {a["entity_id"]: a["service_data"] for a in
                 plan_to_payload(plan)["timeslots"][0]["actions"]}

    assert by_device["light.salon"] == {"brightness_pct": 60}
    assert by_device["switch.boiler"] == {}


# --- several device states in one stretch -----------------------------------
#
# The reason the whole thing exists: a house on a small generator cannot run
# the salon air conditioner and the bedroom ones at the same time. During the
# meal one is on and the others are off; later it is the other way round. That
# has to be one stretch, not two plans.


def generator_plan():
    return plan_from_dict({
        "name": "Shabbat",
        "groups": [{
            "name": "home",
            "devices": ["climate.salon", "climate.bedroom", "light.salon", "light.hallway"],
            "cubes": [
                {
                    "name": "the meal",
                    "from": "candle_lighting@20:00", "to": "candle_lighting@22:30",
                    "state": "off",
                    "overrides": [
                        {"device": "climate.salon", "state": "on", "degrees": 16},
                        {"device": "light.salon", "state": "on", "brightness": 50},
                        {"device": "light.hallway", "state": "on", "brightness": 10},
                    ],
                },
                {
                    "name": "night",
                    "from": "candle_lighting@22:30", "to": "havdalah@06:30",
                    "state": "off",
                    "overrides": [{"device": "climate.bedroom", "state": "on", "degrees": 24}],
                },
            ],
        }],
    })


def test_one_stretch_holds_a_different_state_for_every_device():
    slots = plan_to_payload(generator_plan())["timeslots"]
    meal = {a["entity_id"]: a for a in slots[0]["actions"]}

    assert len(slots) == 2  # two stretches, not two plans
    assert meal["climate.salon"]["service"] == "climate.set_temperature"
    assert meal["climate.salon"]["service_data"]["temperature"] == 16
    assert meal["climate.bedroom"]["service"] == "climate.turn_off"
    assert meal["light.salon"]["service_data"]["brightness_pct"] == 50
    assert meal["light.hallway"]["service_data"]["brightness_pct"] == 10


def test_the_other_way_round_later_in_the_night():
    slots = plan_to_payload(generator_plan())["timeslots"]
    night = {a["entity_id"]: a for a in slots[1]["actions"]}

    assert night["climate.bedroom"]["service_data"]["temperature"] == 24
    assert night["climate.salon"]["service"] == "climate.turn_off"


def test_it_is_still_one_track_and_one_row():
    payload = plan_to_payload(generator_plan())
    assert len({s["track"] for s in payload["timeslots"]}) == 1


def test_every_device_state_survives_a_round_trip():
    payload = plan_to_payload(generator_plan())
    read = plan_from_schedule({"name": "x", "timeslots": payload["timeslots"]})
    meal = read.groups[0].cubes[0]

    assert meal.overrides["climate.salon"].degrees == 16
    assert meal.overrides["light.salon"].brightness == 50
    assert meal.overrides["light.hallway"].brightness == 10


def test_a_setting_is_never_sent_to_something_that_cannot_take_it():
    """One stretch carries brightness for its lights and degrees for its air
    conditioner; neither is told the other's business."""
    plan = plan_from_dict({
        "name": "x",
        "groups": [{
            "name": "home", "devices": ["light.salon", "climate.salon", "switch.boiler"],
            "cubes": [{"name": "n", "from": "candle_lighting", "to": "havdalah",
                       "state": "on", "brightness": 60, "degrees": 22}],
        }],
    })
    by_device = {a["entity_id"]: a for a in plan_to_payload(plan)["timeslots"][0]["actions"]}

    assert by_device["light.salon"]["service_data"] == {"brightness_pct": 60}
    assert by_device["climate.salon"]["service_data"] == {"temperature": 22}
    assert by_device["switch.boiler"]["service_data"] == {}


def test_the_report_shows_each_device_with_its_own_setting():
    from scheduler.plan_model import describe_plan

    devices = describe_plan(generator_plan())["groups"][0]["stretches"][0]["devices"]
    by_device = {d["device"]: d for d in devices}

    assert by_device["climate.salon"]["degrees"] == 16
    assert by_device["climate.bedroom"]["state"] == "off"
    assert by_device["light.hallway"]["brightness"] == 10


@pytest.mark.parametrize("degrees", [0, 60])
def test_a_temperature_out_of_range_is_told_the_range(degrees):
    with pytest.raises(PlanError) as err:
        plan_to_payload(plan_from_dict({
            "name": "x",
            "groups": [{"name": "home", "devices": ["climate.a"], "cubes": [
                {"name": "n", "from": "candle_lighting", "to": "havdalah",
                 "state": "on", "degrees": degrees}]}],
        }))
    assert "5 to 35" in str(err.value)
