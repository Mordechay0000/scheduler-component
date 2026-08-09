"""The tools themselves, against a Home Assistant that only pretends.

The mapping is covered elsewhere. What matters here is the part a model
actually touches: that a tool never raises, that a failure comes back as
something to act on, and that "change one thing" really does leave everything
else where it was.
"""
import os
import sys

import pytest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

pytest.importorskip("mcp", reason="the MCP SDK is only needed for the tool layer")

from scheduler_mcp import server  # noqa: E402
from scheduler_mcp.ha import HomeAssistantError  # noqa: E402
from scheduler_mcp.plan import PLAN_TAG, plan_from_dict, plan_to_payload  # noqa: E402

WORKED = {
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
    "exceptions": [],
}


class FakeHA:
    """Enough Home Assistant to answer the tools, and a record of the writes."""

    def __init__(self, schedules=None, states=None, fail=None):
        self._schedules = schedules if schedules is not None else []
        self._states = states or []
        self._fail = fail
        self.writes = []

    def _maybe_fail(self):
        if self._fail:
            raise HomeAssistantError(self._fail)

    async def states(self):
        self._maybe_fail()
        return self._states

    async def schedules(self):
        self._maybe_fail()
        return self._schedules

    async def add_schedule(self, payload):
        self._maybe_fail()
        self.writes.append(("add", payload))
        stored = dict(payload)
        stored["schedule_id"] = "plan1"
        self._schedules.append(stored)

    async def edit_schedule(self, payload):
        self._maybe_fail()
        self.writes.append(("edit", payload))
        for i, existing in enumerate(self._schedules):
            if existing.get("schedule_id") == payload.get("schedule_id"):
                self._schedules[i] = {**payload}
                break

    async def remove_schedule(self, schedule_id):
        self._maybe_fail()
        self.writes.append(("remove", schedule_id))
        self._schedules = [s for s in self._schedules if s.get("schedule_id") != schedule_id]


@pytest.fixture
def ha(monkeypatch):
    client = FakeHA(
        states=[
            {"entity_id": "light.salon", "state": "on", "attributes": {"friendly_name": "Salon"}},
            {"entity_id": "switch.plata", "state": "off", "attributes": {"friendly_name": "Hotplate"}},
            {"entity_id": "sensor.temperature", "state": "21", "attributes": {}},
        ]
    )
    monkeypatch.setattr(server, "_ha", lambda: client)
    return client


def stored_plan():
    payload = plan_to_payload(plan_from_dict(WORKED))
    return {**payload, "schedule_id": "plan1", "entity_id": "switch.schedule_plan"}


# --- finding things to schedule ---------------------------------------------


async def test_list_devices_shows_only_what_can_be_scheduled(ha):
    result = await server.list_devices()

    ids = [d["entity_id"] for d in result["devices"]]
    assert result["ok"]
    assert ids == ["light.salon", "switch.plata"]
    assert "sensor.temperature" not in ids  # a reading is not a device to switch


async def test_list_devices_can_be_searched_by_name(ha):
    result = await server.list_devices(search="hotplate")
    assert [d["entity_id"] for d in result["devices"]] == ["switch.plata"]


# --- checking a time before using it ----------------------------------------


async def test_explain_time_puts_it_in_words():
    result = await server.explain_time("havdalah@06:30")

    assert result["ok"]
    assert result["means"] == "06:30 on the day of havdalah"
    assert result["stored_as"].endswith("@06:30:00")
    assert "warning" not in result


async def test_explain_time_warns_about_the_common_mistake():
    result = await server.explain_time("22:30")

    assert result["ok"]
    assert "every day of the week" in result["warning"]
    assert "havdalah@22:30" in result["warning"]


async def test_explain_time_refuses_with_advice():
    result = await server.explain_time("shkia")

    assert result["ok"] is False
    assert "candle_lighting" in result["error"]


# --- reading and writing the plan -------------------------------------------


async def test_get_says_plainly_when_there_is_no_plan(ha):
    result = await server.get_shabbat_plan()

    assert result["ok"] and result["exists"] is False
    assert "save_shabbat_plan" in result["note"]


async def test_saving_a_plan_creates_it_in_one_write(ha):
    result = await server.save_shabbat_plan(WORKED)

    assert result["ok"] and result["action"] == "created"
    assert len(ha.writes) == 1
    (method, payload) = ha.writes[0]
    assert method == "add"
    assert PLAN_TAG in payload["tags"]
    assert len(payload["timeslots"]) == 3


async def test_saving_again_updates_rather_than_piling_up(ha):
    await server.save_shabbat_plan(WORKED)
    result = await server.save_shabbat_plan({**WORKED, "name": "Shabbat and Yom Tov"})

    assert result["action"] == "updated"
    assert ha.writes[-1][0] == "edit"
    assert ha.writes[-1][1]["schedule_id"] == "plan1"
    assert len(ha._schedules) == 1


async def test_a_plan_accepts_json_handed_over_as_a_string(ha):
    import json

    result = await server.save_shabbat_plan(json.dumps(WORKED))
    assert result["ok"]


async def test_a_bad_plan_is_refused_before_anything_is_written(ha):
    result = await server.save_shabbat_plan({"name": "x", "groups": []})

    assert result["ok"] is False
    assert "at least one group" in result["error"]
    assert ha.writes == []


async def test_a_plan_that_would_fire_every_day_still_saves_but_says_so(ha):
    plan = {
        "name": "x",
        "groups": [{"name": "home", "devices": ["light.salon"], "cubes": [
            {"name": "night", "from": "candle_lighting", "to": "22:30", "state": "off"}]}],
    }
    result = await server.save_shabbat_plan(plan)

    assert result["ok"]
    assert result["warnings"] and "every day of the week" in result["warnings"][0]


async def test_reading_a_plan_back_gives_what_save_accepts(ha):
    ha._schedules.append(stored_plan())
    result = await server.get_shabbat_plan()

    assert result["exists"] is True
    assert result["plan"]["groups"][0]["cubes"][1]["from"] == "candle_lighting@22:30"
    # and it can go straight back in
    again = await server.save_shabbat_plan(result["plan"])
    assert again["ok"]


# --- the single-device change -----------------------------------------------


async def test_an_exception_leaves_the_group_untouched(ha):
    ha._schedules.append(stored_plan())
    before = len(ha._schedules[0]["timeslots"])

    result = await server.add_exception(
        device="switch.plata", start="havdalah@11:30", stop="havdalah@13:00", name="hotplate"
    )

    assert result["ok"]
    payload = ha.writes[-1][1]
    group_slots = [s for s in payload["timeslots"] if not s["track"].startswith("detach:")]
    assert len(group_slots) == before  # every stretch still there, none split
    detach = next(s for s in payload["timeslots"] if s["track"].startswith("detach:"))
    assert detach["priority"] > 0


async def test_an_exception_for_a_device_outside_the_plan_is_refused(ha):
    ha._schedules.append(stored_plan())

    result = await server.add_exception(
        device="light.bedroom", start="havdalah@11:30", stop="havdalah@13:00"
    )

    assert result["ok"] is False
    assert "not in any group" in result["error"]


async def test_a_second_exception_replaces_the_first_for_that_device(ha):
    ha._schedules.append(stored_plan())
    await server.add_exception(device="switch.plata", start="havdalah@11:30", stop="havdalah@13:00")
    await server.add_exception(device="switch.plata", start="havdalah@15:00", stop="havdalah@16:00")

    payload = ha.writes[-1][1]
    detaches = [s for s in payload["timeslots"] if s["track"].startswith("detach:")]
    assert len(detaches) == 1
    assert detaches[0]["start"].endswith("@15:00:00")


async def test_removing_an_exception_puts_the_device_back(ha):
    ha._schedules.append(stored_plan())
    await server.add_exception(device="switch.plata", start="havdalah@11:30", stop="havdalah@13:00")

    result = await server.remove_exception("switch.plata")

    assert result["ok"]
    payload = ha.writes[-1][1]
    assert not any(s["track"].startswith("detach:") for s in payload["timeslots"])
    # the device was never taken out of the group, so it simply resumes
    assert all(
        any(a["entity_id"] == "switch.plata" for a in s["actions"]) for s in payload["timeslots"]
    )


async def test_removing_an_exception_that_is_not_there_says_so(ha):
    ha._schedules.append(stored_plan())
    result = await server.remove_exception("switch.plata")

    assert result["ok"] is False
    assert "get_shabbat_plan" in result["error"]


async def test_an_exception_needs_a_plan_first(ha):
    result = await server.add_exception(
        device="switch.plata", start="havdalah@11:30", stop="havdalah@13:00"
    )
    assert result["ok"] is False
    assert "save_shabbat_plan" in result["error"]


# --- the rest ---------------------------------------------------------------


async def test_list_schedules_marks_the_plan(ha):
    ha._schedules.extend([stored_plan(), {"schedule_id": "s2", "name": "lamp", "timeslots": []}])
    result = await server.list_schedules()

    marks = {s["schedule_id"]: s["is_shabbat_plan"] for s in result["schedules"]}
    assert marks == {"plan1": True, "s2": False}


async def test_delete_removes_it(ha):
    ha._schedules.append(stored_plan())
    result = await server.delete_schedule("plan1")

    assert result["ok"] and ha._schedules == []


async def test_describe_anchors_explains_where_the_times_come_from():
    result = await server.describe_anchors()

    names = [a["name"] for a in result["anchors"]]
    assert names == ["candle_lighting", "havdalah"]
    assert all(a["entity_id"].startswith("sensor.") for a in result["anchors"])


# --- a server that cannot be reached ----------------------------------------


async def test_every_tool_reports_a_dead_server_instead_of_raising(monkeypatch):
    broken = FakeHA(fail="Could not reach Home Assistant at http://x (nope). Check HA_URL")
    monkeypatch.setattr(server, "_ha", lambda: broken)

    for call in (
        server.list_devices(),
        server.get_shabbat_plan(),
        server.save_shabbat_plan(WORKED),
        server.add_exception(device="switch.plata", start="havdalah", stop="havdalah+1h"),
        server.remove_exception("switch.plata"),
        server.list_schedules(),
        server.delete_schedule("plan1"),
    ):
        result = await call
        assert result["ok"] is False
        assert "Check HA_URL" in result["error"]
