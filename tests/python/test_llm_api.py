"""The tools Home Assistant hands to a model.

The mapping between a plan and a schedule is covered next door. What matters
here is the part a model touches: that a tool answers rather than raising, that
a refusal names the fix, and that "change one thing" really does leave
everything else where it was.

They run against a coordinator that only pretends, but through the real
validation the integration uses, so a payload that would be rejected in a live
Home Assistant is rejected here too.
"""
import asyncio
from types import SimpleNamespace

import pytest
import voluptuous as vol

from scheduler import const
from scheduler.llm_api import (
    API_ID,
    API_PROMPT,
    PLAN_GUIDE,
    TOOLS,
    AddExceptionTool,
    DeleteScheduleTool,
    DescribeAnchorsTool,
    ExplainTimeTool,
    GetPlanTool,
    ListDevicesTool,
    ListSchedulesTool,
    RemoveExceptionTool,
    SavePlanTool,
    ShabbatPlanAPI,
)
from scheduler.plan_model import PLAN_TAG, plan_from_dict, plan_to_payload

WORKED = {
    "name": "Shabbat",
    "groups": [
        {
            "name": "home",
            "devices": ["light.salon", "switch.plata"],
            "cubes": [
                {"name": "coming in", "from": "candle_lighting", "to": "candle_lighting@22:30",
                 "devices": [{"device": "light.salon", "state": "on"},
                             {"device": "switch.plata", "state": "on"}]},
                {"name": "night", "from": "candle_lighting@22:30", "to": "havdalah@06:30",
                 "devices": [{"device": "light.salon", "state": "off"},
                             {"device": "switch.plata", "state": "off"}]},
                {"name": "morning", "from": "havdalah@06:30", "to": "havdalah+1h",
                 "devices": [{"device": "light.salon", "state": "on"},
                             {"device": "switch.plata", "state": "on"}]},
            ],
        }
    ],
}


class FakeCoordinator:
    """Enough coordinator to answer the tools, and a record of the writes."""

    def __init__(self):
        self.schedules = []
        self.writes = []
        self.kinds = {}
        self.store = SimpleNamespace(
            async_set_device_kind=lambda entity_id, kind: self.kinds.__setitem__(entity_id, kind)
        )

    def async_get_schedules(self):
        return list(self.schedules)

    def async_create_schedule(self, data):
        self.writes.append(("create", data))
        stored = dict(data)
        stored[const.ATTR_SCHEDULE_ID] = "plan1"
        stored["entity_id"] = "switch.schedule_plan"
        stored.setdefault(const.ATTR_ENABLED, True)
        self.schedules.append(stored)

    def async_edit_schedule(self, schedule_id, data):
        self.writes.append(("edit", data))
        for index, existing in enumerate(self.schedules):
            if existing[const.ATTR_SCHEDULE_ID] == schedule_id:
                self.schedules[index] = {**existing, **data}
                break

    def async_delete_schedule(self, schedule_id):
        self.writes.append(("delete", schedule_id))
        self.schedules = [
            s for s in self.schedules if s[const.ATTR_SCHEDULE_ID] != schedule_id
        ]


@pytest.fixture
def coordinator(hass, states):
    for entity_id, name in [
        ("light.salon", "סלון"),
        ("switch.plata", "פלטה"),
        ("sensor.temperature", "טמפרטורה"),
    ]:
        states.set(entity_id, "on", {"friendly_name": name})
    states.set(
        "sensor.jewish_calendar_upcoming_candle_lighting", "2026-08-14T16:29:00+00:00"
    )
    states.set("sensor.jewish_calendar_upcoming_havdalah", "2026-08-15T17:12:00+00:00")

    stub = FakeCoordinator()
    hass.data[const.DOMAIN] = {"coordinator": stub, "schedules": {}}
    return stub


def call(tool_class, hass, **args):
    """Invoke a tool the way Home Assistant does."""
    from homeassistant.helpers import llm

    tool = tool_class()
    tool_input = llm.ToolInput(tool_name=tool.name, tool_args=args)
    context = llm.LLMContext(
        platform="test", context=None, language="he", assistant=None, device_id=None
    )
    return asyncio.run(tool.async_call(hass, tool_input, context))


def stored_plan():
    payload = plan_to_payload(plan_from_dict(WORKED))
    return {
        **payload,
        const.ATTR_SCHEDULE_ID: "plan1",
        "entity_id": "switch.schedule_plan",
        const.ATTR_ENABLED: True,
    }


# --- the API itself ---------------------------------------------------------


def test_the_api_is_one_home_assistant_can_serve(hass):
    api = ShabbatPlanAPI(hass)
    instance = asyncio.run(api.async_get_api_instance(None))

    assert api.id == API_ID
    assert len(instance.tools) == len(TOOLS)
    assert instance.api_prompt == API_PROMPT


def test_every_tool_is_named_and_described():
    for tool_class in TOOLS:
        tool = tool_class()
        assert tool.name.startswith(const.DOMAIN)
        assert tool.description and len(tool.description) > 40, tool.name


def test_the_prompt_teaches_the_one_thing_people_get_wrong():
    """Of everything a plan involves, this is what cannot be recovered from."""
    assert "candle_lighting@22:30" in API_PROMPT
    assert "every day of the week" in API_PROMPT


def test_the_prompt_stays_small_enough_to_sit_in_front_of_every_request():
    """These tools ride along with all of Home Assistant's own.

    Whatever model the household runs sees this before every request, about a
    lamp as much as about Shabbat - and it is often a small model, with little
    room to spare. The rules live behind a tool for that reason; this is only
    what a model cannot recover from getting wrong.
    """
    assert len(API_PROMPT) < 1400, len(API_PROMPT)
    assert len(PLAN_GUIDE) > 4000  # the detail is not lost, only moved
    assert "scheduler_how_to_write_a_plan" in API_PROMPT


def test_the_guide_is_one_call_away(hass, coordinator):
    from scheduler.llm_api import HowToWritePlanTool

    result = call(HowToWritePlanTool, hass)

    assert result["guide"] == PLAN_GUIDE
    assert "A WORKED PLAN" in result["guide"]


def test_a_stray_argument_to_a_reading_tool_is_not_worth_a_refusal(hass, coordinator):
    """Small models pass an argument that was never asked for. Let them."""
    result = call(DescribeAnchorsTool, hass, when="tonight")

    assert result["ok"] is True


def test_a_plan_that_will_not_do_says_where_the_rules_are(hass, coordinator):
    """A model that never called the guide finds out about it when it is stuck."""
    result = call(SavePlanTool, hass, plan={
        "name": "x",
        "groups": [{"name": "g", "devices": ["light.salon"], "cubes": [
            {"from": "candle_lighting", "to": "nonsense",
             "devices": [{"device": "light.salon", "state": "on"}]}]}],
    })

    assert result["ok"] is False
    assert "scheduler_how_to_write_a_plan" in result["error"]


def test_the_plan_argument_is_a_real_schema():
    """A model should be handed the shape, not have to infer it from prose."""
    schema = SavePlanTool.parameters
    with pytest.raises(vol.Invalid):
        schema({"plan": {"groups": [{"name": "g", "devices": ["light.a"], "cubes": [{"name": "x"}]}]}})
    # ... and a well-formed one passes, defaults filled in
    result = schema(
        {"plan": {"groups": [{"name": "g", "devices": ["light.a"], "cubes": [
            {"from": "candle_lighting", "to": "havdalah",
             "devices": [{"device": "light.a"}]}]}]}}
    )
    assert result["plan"]["groups"][0]["cubes"][0]["devices"][0]["state"] == "on"


def test_the_guide_says_when_to_override_and_when_to_detach():
    """The two are easy to confuse, and picking wrong duplicates a timeline."""
    assert "LEAVING A DEVICE OUT MEANS SOMETHING" in PLAN_GUIDE
    assert "its own *hours*" in PLAN_GUIDE
    assert "enforce" in PLAN_GUIDE


def test_the_schema_offers_overrides_and_light_parameters():
    schema = SavePlanTool.parameters
    result = schema({
        "plan": {"groups": [{"name": "g", "devices": ["light.a", "switch.b"], "cubes": [{
            "from": "candle_lighting", "to": "havdalah", "enforce": True,
            "devices": [
                {"device": "light.a", "state": "on", "brightness": 40, "kelvin": 2200},
                {"device": "switch.b", "state": "off"},
            ],
        }]}]}
    })
    cube = result["plan"]["groups"][0]["cubes"][0]
    assert cube["devices"][0]["brightness"] == 40
    assert cube["devices"][1]["state"] == "off"
    assert cube["enforce"] is True


@pytest.mark.parametrize("field,value", [("brightness", 0), ("brightness", 150), ("kelvin", 100)])
def test_the_schema_keeps_a_parameter_in_range(field, value):
    with pytest.raises(vol.Invalid):
        SavePlanTool.parameters({
            "plan": {"groups": [{"name": "g", "devices": ["light.a"], "cubes": [
                {"from": "candle_lighting", "to": "havdalah",
                 "devices": [{"device": "light.a", field: value}]}]}]}
        })


def test_a_tool_says_so_when_the_integration_is_not_set_up(hass):
    result = call(ListSchedulesTool, hass)
    assert result["ok"] is False
    assert "Devices & services" in result["error"]


def test_a_tool_called_with_the_wrong_arguments_says_which_ones(hass, coordinator):
    """Over MCP nothing checks the arguments before they get here.

    A missing key used to come back as "something went wrong, check the log",
    which leaves whoever is calling - a model, usually - with nowhere to go.
    """
    result = call(ExplainTimeTool, hass, time="havdalah-30m")  # it takes 'expression'

    assert result["ok"] is False
    assert "expression" in result["error"]
    assert "scheduler_explain_time" in result["error"]


# --- finding things to schedule ---------------------------------------------


def test_list_devices_shows_only_what_can_be_scheduled(hass, coordinator):
    result = call(ListDevicesTool, hass)

    ids = [d["entity_id"] for d in result["devices"]]
    assert ids == ["light.salon", "switch.plata"]
    assert "sensor.temperature" not in ids  # a reading is not a device to switch


def test_list_devices_can_be_searched(hass, coordinator):
    result = call(ListDevicesTool, hass, search="פלטה")
    assert [d["entity_id"] for d in result["devices"]] == ["switch.plata"]


# --- checking a time before using it ----------------------------------------


def test_explain_time_puts_it_in_words(hass, coordinator):
    result = call(ExplainTimeTool, hass, expression="havdalah@06:30")

    assert result["means"] == "06:30 on the day of havdalah"
    assert result["stored_as"].endswith("@06:30:00")
    assert "warning" not in result


def test_explain_time_warns_about_the_common_mistake(hass, coordinator):
    result = call(ExplainTimeTool, hass, expression="22:30")

    assert "every day of the week" in result["warning"]
    assert "havdalah@22:30" in result["warning"]


def test_explain_time_refuses_with_advice(hass, coordinator):
    result = call(ExplainTimeTool, hass, expression="shkia")

    assert result["ok"] is False
    assert "candle_lighting" in result["error"]


def test_describe_anchors_notices_a_missing_calendar(hass, coordinator, states):
    states.remove("sensor.jewish_calendar_upcoming_havdalah")
    result = call(DescribeAnchorsTool, hass)

    assert "Jewish Calendar" in result["warning"]
    assert [a["available"] for a in result["anchors"]] == [True, False]


# --- reading and writing the plan -------------------------------------------


def test_get_says_plainly_when_there_is_no_plan(hass, coordinator):
    result = call(GetPlanTool, hass)

    assert result["exists"] is False
    assert "how_to_write_a_plan" in result["note"]  # where to find out how


def test_saving_a_plan_creates_it_in_one_write(hass, coordinator):
    result = call(SavePlanTool, hass, plan=WORKED)

    assert result["ok"] and result["action"] == "created"
    assert len(coordinator.writes) == 1
    (method, data) = coordinator.writes[0]
    assert method == "create"
    assert PLAN_TAG in data[const.ATTR_TAGS]
    assert len(data[const.ATTR_TIMESLOTS]) == 3
    # it went through the integration's own validation on the way
    assert data[const.ATTR_TIMESLOTS][0][const.ATTR_TRACK] == "group:home"


def test_saving_again_updates_rather_than_piling_up(hass, coordinator):
    call(SavePlanTool, hass, plan=WORKED)
    result = call(SavePlanTool, hass, plan={**WORKED, "name": "שבת ויום טוב"})

    assert result["action"] == "updated"
    assert coordinator.writes[-1][0] == "edit"
    assert len(coordinator.schedules) == 1


def test_a_bad_plan_is_refused_before_anything_is_written(hass, coordinator):
    result = call(SavePlanTool, hass, plan={"name": "x", "groups": []})

    assert result["ok"] is False
    assert "at least one group" in result["error"]
    assert coordinator.writes == []


def test_a_plan_that_would_fire_every_day_saves_but_says_so(hass, coordinator):
    plan = {
        "name": "x",
        "groups": [{"name": "home", "devices": ["light.salon"], "cubes": [
            {"name": "night", "from": "candle_lighting", "to": "22:30",
             "devices": [{"device": "light.salon", "state": "off"}]}]}],
    }
    result = call(SavePlanTool, hass, plan=plan)

    assert result["ok"]
    assert result["warnings"] and "every day of the week" in result["warnings"][0]


def test_a_device_can_differ_inside_a_stretch_without_a_second_timeline(hass, coordinator):
    plan = {
        "name": "Shabbat",
        "groups": [{
            "name": "home",
            "devices": ["light.salon", "switch.plata"],
            "cubes": [{
                "name": "morning", "from": "havdalah@06:30", "to": "havdalah@13:00",
                "devices": [
                    {"device": "light.salon", "state": "on", "brightness": 60},
                    {"device": "switch.plata", "state": "off"},
                ],
            }],
        }],
    }
    result = call(SavePlanTool, hass, plan=plan)

    assert result["ok"]
    slots = coordinator.writes[-1][1][const.ATTR_TIMESLOTS]
    assert len(slots) == 1  # one stretch, not one per device
    by_device = {a["entity_id"]: a for a in slots[0][const.ATTR_ACTIONS]}
    assert by_device["light.salon"]["service"] == "light.turn_on"
    assert by_device["light.salon"]["service_data"]["brightness_pct"] == 60
    assert by_device["switch.plata"]["service"] == "switch.turn_off"


def test_a_plan_with_a_device_in_two_groups_is_refused(hass, coordinator):
    result = call(SavePlanTool, hass, plan={
        "name": "x",
        "groups": [
            {"name": "a", "devices": ["light.salon"], "cubes": [
                {"from": "candle_lighting", "to": "havdalah",
                 "devices": [{"device": "light.salon", "state": "on"}]}]},
            {"name": "b", "devices": ["light.salon"], "cubes": [
                {"from": "candle_lighting", "to": "havdalah",
                 "devices": [{"device": "light.salon", "state": "off"}]}]},
        ],
    })

    assert result["ok"] is False
    assert "in both" in result["error"] and "override" in result["error"]
    assert coordinator.writes == []


def test_holding_a_state_reaches_the_stored_slot(hass, coordinator):
    result = call(SavePlanTool, hass, plan={
        "name": "x",
        "groups": [{"name": "home", "devices": ["light.salon"], "cubes": [
            {"name": "n", "from": "candle_lighting", "to": "havdalah", "enforce": True,
             "devices": [{"device": "light.salon", "state": "on"}]}]}],
    })

    assert result["ok"]
    assert coordinator.writes[-1][1][const.ATTR_TIMESLOTS][0][const.ATTR_ENFORCE] is True


def test_reading_a_plan_back_gives_what_save_accepts(hass, coordinator):
    coordinator.schedules.append(stored_plan())
    result = call(GetPlanTool, hass)

    assert result["exists"] is True
    assert result["plan"]["groups"][0]["cubes"][1]["from"] == "candle_lighting@22:30"
    # and it can go straight back in
    assert call(SavePlanTool, hass, plan=result["plan"])["ok"]


# --- the single-device change -----------------------------------------------


def test_an_exception_leaves_the_group_untouched(hass, coordinator):
    coordinator.schedules.append(stored_plan())
    before = len(coordinator.schedules[0][const.ATTR_TIMESLOTS])

    result = call(
        AddExceptionTool,
        hass,
        device="switch.plata",
        **{"from": "havdalah@11:30", "to": "havdalah@13:00", "name": "פלטה"},
    )

    assert result["ok"]
    data = coordinator.writes[-1][1]
    slots = data[const.ATTR_TIMESLOTS]
    group_slots = [s for s in slots if not s[const.ATTR_TRACK].startswith("detach:")]
    assert len(group_slots) == before  # every stretch still there, none split
    detach = next(s for s in slots if s[const.ATTR_TRACK].startswith("detach:"))
    assert detach[const.ATTR_PRIORITY] > 0
    # the device stays in the group, which is how it comes back afterwards
    assert all(
        any(a["entity_id"] == "switch.plata" for a in s[const.ATTR_ACTIONS])
        for s in group_slots
    )


def test_an_exception_for_a_device_outside_the_plan_is_refused(hass, coordinator):
    coordinator.schedules.append(stored_plan())

    result = call(
        AddExceptionTool,
        hass,
        device="light.bedroom",
        **{"from": "havdalah@11:30", "to": "havdalah@13:00"},
    )

    assert result["ok"] is False
    assert "not in any group" in result["error"]


def test_a_second_exception_replaces_the_first_for_that_device(hass, coordinator):
    coordinator.schedules.append(stored_plan())
    call(AddExceptionTool, hass, device="switch.plata",
         **{"from": "havdalah@11:30", "to": "havdalah@13:00"})
    call(AddExceptionTool, hass, device="switch.plata",
         **{"from": "havdalah@15:00", "to": "havdalah@16:00"})

    slots = coordinator.writes[-1][1][const.ATTR_TIMESLOTS]
    detaches = [s for s in slots if s[const.ATTR_TRACK].startswith("detach:")]
    assert len(detaches) == 1
    assert detaches[0][const.ATTR_START].endswith("@15:00:00")


def test_a_one_off_exception_carries_its_date(hass, coordinator):
    coordinator.schedules.append(stored_plan())
    call(AddExceptionTool, hass, device="switch.plata", only_on="2026-08-15",
         **{"from": "havdalah@11:30", "to": "havdalah@13:00"})

    detach = next(
        s for s in coordinator.writes[-1][1][const.ATTR_TIMESLOTS]
        if s[const.ATTR_TRACK].startswith("detach:")
    )
    assert detach[const.ATTR_END_DATE] == "2026-08-15"


def test_removing_an_exception_puts_the_device_back(hass, coordinator):
    coordinator.schedules.append(stored_plan())
    call(AddExceptionTool, hass, device="switch.plata",
         **{"from": "havdalah@11:30", "to": "havdalah@13:00"})

    result = call(RemoveExceptionTool, hass, device="switch.plata")

    assert result["ok"]
    slots = coordinator.writes[-1][1][const.ATTR_TIMESLOTS]
    assert not any(s[const.ATTR_TRACK].startswith("detach:") for s in slots)


def test_removing_an_exception_that_is_not_there_says_so(hass, coordinator):
    coordinator.schedules.append(stored_plan())
    result = call(RemoveExceptionTool, hass, device="switch.plata")

    assert result["ok"] is False
    assert "get_plan" in result["error"]


def test_an_exception_needs_a_plan_first(hass, coordinator):
    result = call(
        AddExceptionTool, hass, device="switch.plata",
        **{"from": "havdalah@11:30", "to": "havdalah@13:00"},
    )
    assert result["ok"] is False
    assert "save_plan" in result["error"]


# --- the rest ---------------------------------------------------------------


def test_list_schedules_marks_the_plan(hass, coordinator):
    coordinator.schedules.extend([
        stored_plan(),
        {const.ATTR_SCHEDULE_ID: "s2", "name": "מנורה", const.ATTR_TIMESLOTS: []},
    ])
    result = call(ListSchedulesTool, hass)

    marks = {s["schedule_id"]: s["is_shabbat_plan"] for s in result["schedules"]}
    assert marks == {"plan1": True, "s2": False}


def test_delete_removes_it(hass, coordinator):
    coordinator.schedules.append(stored_plan())
    result = call(DeleteScheduleTool, hass, schedule_id="plan1")

    assert result["ok"] and coordinator.schedules == []


def test_deleting_something_that_is_not_there_says_so(hass, coordinator):
    result = call(DeleteScheduleTool, hass, schedule_id="nope")

    assert result["ok"] is False
    assert "list_schedules" in result["error"]
    assert coordinator.writes == []


def test_a_tool_that_breaks_reports_instead_of_raising(hass, coordinator, monkeypatch):
    def explode(*_args, **_kwargs):
        raise RuntimeError("the disk fell off")

    monkeypatch.setattr(coordinator, "async_get_schedules", explode)
    result = call(ListSchedulesTool, hass)

    assert result["ok"] is False
    assert "Home Assistant log" in result["error"]


# --- checking a plan before it is real --------------------------------------


def test_preview_says_what_a_plan_will_do_without_saving_it(hass, coordinator):
    from scheduler.llm_api import PreviewPlanTool

    result = call(PreviewPlanTool, hass, plan=WORKED)

    assert result["ok"] and result["saved"] is False
    assert coordinator.writes == []
    stretches = result["report"]["groups"][0]["stretches"]
    assert [s["name"] for s in stretches] == ["coming in", "night", "morning"]
    assert stretches[1]["from_means"] == "22:30 on the day of candle_lighting"


def test_preview_refuses_a_broken_plan_with_advice(hass, coordinator):
    from scheduler.llm_api import PreviewPlanTool

    result = call(PreviewPlanTool, hass, plan={"name": "x", "groups": []})

    assert result["ok"] is False
    assert "at least one group" in result["error"]


def test_saving_hands_back_the_same_report(hass, coordinator):
    result = call(SavePlanTool, hass, plan=WORKED)

    assert "report" in result
    assert result["report"]["groups"][0]["stretches"][0]["devices"]


def test_adding_an_exception_hands_back_the_report_too(hass, coordinator):
    coordinator.schedules.append(stored_plan())
    result = call(
        AddExceptionTool, hass, device="switch.plata",
        **{"from": "havdalah@11:30", "to": "havdalah@13:00"},
    )

    assert result["report"]["exceptions"][0]["device"] == "switch.plata"


def test_the_prompt_tells_the_model_to_preview_first():
    assert "scheduler_preview_plan" in API_PROMPT
    assert "read the report back" in API_PROMPT
    assert "preview before saving" in PLAN_GUIDE


# --- the household's own names ----------------------------------------------


@pytest.fixture
def with_book(hass, coordinator, monkeypatch):
    """A book with one group and one named device."""
    import asyncio

    import scheduler.device_book as book_module
    from test_device_book import FakeEntityRegistry, FakeLabelRegistry

    labels = FakeLabelRegistry()
    entities = FakeEntityRegistry(["light.salon", "switch.plata", "sensor.temperature"])
    monkeypatch.setattr(book_module.lr, "async_get", lambda _hass: labels)
    monkeypatch.setattr(book_module.er, "async_get", lambda _hass: entities)
    hass.data[const.DOMAIN][const.DATA_DEVICE_KINDS] = {}

    asyncio.run(book_module.async_set_group(hass, "מטבח", ["switch.plata"]))
    asyncio.run(book_module.async_name_device(hass, "switch.plata", "פלטה של שבת"))
    return SimpleNamespace(labels=labels, entities=entities)


def test_the_book_is_readable(hass, with_book):
    from scheduler.llm_api import GetDeviceBookTool

    result = call(GetDeviceBookTool, hass)

    assert result["groups"][0]["name"] == "מטבח"
    assert result["devices"][0]["name"] == "פלטה של שבת"
    assert "in place of an entity id" in result["note"]


def test_a_group_can_be_made_from_names(hass, with_book):
    from scheduler.llm_api import SetDeviceGroupTool

    result = call(SetDeviceGroupTool, hass, group="הכל", devices=["פלטה של שבת", "light.salon"])

    assert result["ok"]
    assert sorted(result["devices"]) == ["light.salon", "switch.plata"]


def test_a_group_of_something_that_does_not_exist_is_refused(hass, with_book):
    from scheduler.llm_api import SetDeviceGroupTool

    result = call(SetDeviceGroupTool, hass, group="x", devices=["light.nowhere"])

    assert result["ok"] is False
    assert "list_devices" in result["error"]


def test_a_plan_can_name_a_group_instead_of_entity_ids(hass, with_book):
    """The whole point of the book: a plan in the household's own words."""
    result = call(SavePlanTool, hass, plan={
        "name": "Shabbat",
        "groups": [{"name": "home", "devices": ["מטבח"], "cubes": [
            {"name": "n", "from": "candle_lighting", "to": "havdalah",
             "devices": [{"device": "מטבח", "state": "on"}]}]}],
    })

    assert result["ok"], result
    slots = hass.data[const.DOMAIN]["coordinator"].writes[-1][1][const.ATTR_TIMESLOTS]
    assert [a["entity_id"] for a in slots[0][const.ATTR_ACTIONS]] == ["switch.plata"]


def test_a_stretch_can_name_its_devices_the_way_the_household_does(hass, with_book):
    """The names reach inside the stretch too, where the states actually live.

    A stretch says what each device does, so that is where a household name has
    to work; naming a whole group there gives every device in it the same state.
    """
    result = call(SavePlanTool, hass, plan={
        "name": "Shabbat",
        "groups": [{"name": "home", "devices": ["מטבח", "light.salon"], "cubes": [
            {"name": "n", "from": "candle_lighting", "to": "havdalah", "devices": [
                {"device": "מטבח", "state": "on"},
                {"device": "light.salon", "state": "on", "brightness": 50},
            ]}]}],
    })

    assert result["ok"], result
    slots = hass.data[const.DOMAIN]["coordinator"].writes[-1][1][const.ATTR_TIMESLOTS]
    actions = {a["entity_id"]: a for a in slots[0][const.ATTR_ACTIONS]}
    assert sorted(actions) == ["light.salon", "switch.plata"]
    assert actions["light.salon"]["service_data"]["brightness_pct"] == 50


def test_an_exception_can_name_a_device(hass, with_book):
    call(SavePlanTool, hass, plan={
        "name": "Shabbat",
        "groups": [{"name": "home", "devices": ["מטבח", "light.salon"], "cubes": [
            {"name": "n", "from": "candle_lighting", "to": "havdalah",
             "devices": [{"device": "מטבח", "state": "on"},
                         {"device": "light.salon", "state": "on"}]}]}],
        "exceptions": [{"device": "פלטה של שבת", "from": "havdalah@11:30", "to": "havdalah@13:00"}],
    })

    slots = hass.data[const.DOMAIN]["coordinator"].writes[-1][1][const.ATTR_TIMESLOTS]
    detach = next(s for s in slots if s[const.ATTR_TRACK].startswith("detach:"))
    assert detach[const.ATTR_ACTIONS][0]["entity_id"] == "switch.plata"


def test_a_device_can_be_named_and_put_right(hass, with_book):
    from scheduler.llm_api import NameDeviceTool

    result = call(NameDeviceTool, hass, device="light.salon", name="מזגן סלון", kind="climate")

    assert result["ok"]
    assert result["device"]["name"] == "מזגן סלון"
    assert result["device"]["kind"] == "climate"


def test_naming_a_device_that_is_not_here_says_so(hass, with_book):
    from scheduler.llm_api import NameDeviceTool

    result = call(NameDeviceTool, hass, device="light.nowhere", name="x")

    assert result["ok"] is False
    assert "list_devices" in result["error"]


def test_the_guide_points_at_the_book_first():
    assert "scheduler_get_device_book" in PLAN_GUIDE
    assert "instead of an entity id" in PLAN_GUIDE


# --- being registered at all ------------------------------------------------
#
# The API is only useful if Home Assistant can find it. Registering twice
# raises, and a config entry gets reloaded whenever the integration is updated,
# so this is the failure that would leave "Shabbat plans" missing from the list.


def test_registering_puts_it_where_home_assistant_looks(hass):
    from homeassistant.helpers import llm

    from scheduler.llm_api import async_register_llm_api

    unregister = async_register_llm_api(hass)

    assert any(api.id == API_ID for api in llm.async_get_apis(hass))
    unregister()
    assert not any(api.id == API_ID for api in llm.async_get_apis(hass))


def test_registering_again_replaces_rather_than_raising(hass):
    """A reload must not be able to leave the integration unable to set up."""
    from homeassistant.helpers import llm

    from scheduler.llm_api import async_register_llm_api

    async_register_llm_api(hass)
    async_register_llm_api(hass)  # as if the entry reloaded without unloading

    assert len([api for api in llm.async_get_apis(hass) if api.id == API_ID]) == 1


def test_the_api_instance_carries_every_tool(hass):
    from scheduler.llm_api import ShabbatPlanAPI

    instance = asyncio.run(ShabbatPlanAPI(hass).async_get_api_instance(None))

    assert {tool.name for tool in instance.tools} == {t.name for t in TOOLS}
    assert instance.api_prompt.strip()
