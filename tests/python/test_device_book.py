"""Your own names and groupings for the devices a schedule drives.

Where each piece lives matters. Groups are Home Assistant labels and names are
its entity aliases, so both stay true when a device is renamed and are usable
outside the scheduler - a name given here also works when speaking to Assist.
Only the corrected kind is the scheduler's own, because Home Assistant has
nowhere to record that its own domain is wrong.
"""
from types import SimpleNamespace

import pytest

from scheduler import const
from scheduler.device_book import (
    DEFAULT_KIND,
    GROUP_LABEL_PREFIX,
    KINDS,
    async_can,
    async_get_book,
    async_kind_of,
    async_name_device,
    async_remove_group,
    async_resolve,
    async_set_group,
    async_set_kind,
    group_from_label,
    group_label_name,
    kind_from_domain,
)


class FakeLabel:
    def __init__(self, label_id, name):
        self.label_id = label_id
        self.name = name


class FakeLabelRegistry:
    def __init__(self):
        self.labels = {}
        self._next = 0

    def async_list_labels(self):
        return list(self.labels.values())

    def async_get_label_by_name(self, name):
        return next((x for x in self.labels.values() if x.name == name), None)

    def async_create(self, name):
        self._next += 1
        label = FakeLabel(f"l{self._next}", name)
        self.labels[label.label_id] = label
        return label

    def async_delete(self, label_id):
        self.labels.pop(label_id, None)


class FakeEntry:
    def __init__(self, entity_id, aliases=None, labels=None, entity_category=None,
                 hidden_by=None, platform=None):
        self.entity_id = entity_id
        self.aliases = set(aliases or [])
        self.labels = set(labels or [])
        self.entity_category = entity_category
        self.hidden_by = hidden_by
        self.disabled_by = None
        self.platform = platform


class FakeEntityRegistry:
    def __init__(self, entity_ids):
        self.entities = {e: FakeEntry(e) for e in entity_ids}

    def async_get(self, entity_id):
        return self.entities.get(entity_id)

    def async_update_entity(self, entity_id, **changes):
        entry = self.entities[entity_id]
        for key, value in changes.items():
            setattr(entry, key, value)
        return entry


@pytest.fixture
def book(hass, states, monkeypatch):
    import scheduler.device_book as module

    for entity_id, name in [
        ("switch.ac_salon", "מפסק סלון"),
        ("light.ac_bedroom", "תאורת חדר שינה"),
        ("light.salon", "סלון"),
    ]:
        states.set(entity_id, "off", {"friendly_name": name})

    labels = FakeLabelRegistry()
    entities = FakeEntityRegistry(list(states._states))
    monkeypatch.setattr(module.lr, "async_get", lambda _hass: labels)
    monkeypatch.setattr(module.er, "async_get", lambda _hass: entities)
    hass.data[const.DOMAIN] = {const.DATA_DEVICE_KINDS: {}}
    return SimpleNamespace(labels=labels, entities=entities, hass=hass)


# --- where each piece lives -------------------------------------------------


def test_a_group_is_a_home_assistant_label(book):
    import asyncio

    asyncio.run(async_set_group(book.hass, "מזגנים", ["switch.ac_salon"]))

    label = book.labels.async_get_label_by_name(group_label_name("מזגנים"))
    assert label is not None
    assert label.label_id in book.entities.entities["switch.ac_salon"].labels


def test_only_the_scheduler_s_own_labels_are_read_back(book):
    import asyncio

    book.labels.async_create("Downstairs")  # somebody else's label
    asyncio.run(async_set_group(book.hass, "מזגנים", ["switch.ac_salon"]))

    names = [g["name"] for g in async_get_book(book.hass)["groups"]]

    assert names == ["מזגנים"]  # the household's other labels are left alone


def test_the_prefix_round_trips():
    assert group_from_label(group_label_name("מזגנים")) == "מזגנים"
    assert group_from_label("Downstairs") is None


def test_a_name_is_an_entity_alias(book):
    import asyncio

    asyncio.run(async_name_device(book.hass, "switch.ac_salon", "מזגן סלון"))

    assert book.entities.entities["switch.ac_salon"].aliases == {"מזגן סלון"}
    device = next(d for d in async_get_book(book.hass)["devices"]
                  if d["entity_id"] == "switch.ac_salon")
    assert device["name"] == "מזגן סלון"


def test_something_odd_in_the_aliases_does_not_take_the_book_down(book):
    """Home Assistant has left a sentinel of its own among the aliases before.

    Sorting that together with a real name raises, and the whole book - and with
    it every plan that names a device rather than an entity id - went down with
    it. One odd entry is worth skipping, not the household's names.
    """

    class Sentinel:  # neither a string nor comparable with one
        pass

    book.entities.entities["switch.ac_salon"].aliases = {Sentinel(), "מזגן סלון"}

    device = next(d for d in async_get_book(book.hass)["devices"]
                  if d["entity_id"] == "switch.ac_salon")

    assert device["name"] == "מזגן סלון"


def test_naming_something_that_is_not_registered_says_so(book):
    import asyncio

    with pytest.raises(ValueError) as err:
        asyncio.run(async_name_device(book.hass, "switch.nope", "x"))
    assert "light.salon" in str(err.value)  # shows the shape of an entity id


def test_a_group_can_be_taken_apart(book):
    import asyncio

    asyncio.run(async_set_group(book.hass, "מזגנים", ["switch.ac_salon"]))
    asyncio.run(async_set_group(book.hass, "מזגנים", ["light.ac_bedroom"]))

    group = async_get_book(book.hass)["groups"][0]
    assert group["devices"] == ["light.ac_bedroom"]


def test_removing_a_group_removes_its_label(book):
    import asyncio

    asyncio.run(async_set_group(book.hass, "מזגנים", ["switch.ac_salon"]))
    assert asyncio.run(async_remove_group(book.hass, "מזגנים")) is True
    assert async_get_book(book.hass)["groups"] == []
    assert asyncio.run(async_remove_group(book.hass, "מזגנים")) is False


# --- correcting what a device is --------------------------------------------


def test_the_kind_comes_from_the_domain_by_default(book):
    assert kind_from_domain("light.salon") == "light"
    assert kind_from_domain("sensor.x") == DEFAULT_KIND
    assert async_kind_of(book.hass, "light.salon") == "light"


def test_a_device_registered_under_the_wrong_domain_can_be_put_right(book):
    """An air conditioner behind a light entity is common, and the domain is
    what decides whether brightness can be asked of it."""
    assert async_can(book.hass, "light.ac_bedroom", "brightness") is True

    async_set_kind(book.hass, "light.ac_bedroom", "climate")

    assert async_kind_of(book.hass, "light.ac_bedroom") == "climate"
    assert async_can(book.hass, "light.ac_bedroom", "brightness") is False
    assert async_can(book.hass, "light.ac_bedroom", "temperature") is True


def test_setting_the_kind_back_to_its_domain_forgets_the_correction(book):
    async_set_kind(book.hass, "light.ac_bedroom", "climate")
    async_set_kind(book.hass, "light.ac_bedroom", "light")

    assert book.hass.data[const.DOMAIN][const.DATA_DEVICE_KINDS] == {}


def test_a_kind_that_is_not_one_says_which_are(book):
    with pytest.raises(ValueError) as err:
        async_set_kind(book.hass, "light.salon", "aircon")
    assert all(kind in str(err.value) for kind in ("climate", "light"))


# --- using the names --------------------------------------------------------


def test_a_group_name_stands_for_its_devices(book):
    import asyncio

    asyncio.run(async_set_group(book.hass, "מזגנים", ["switch.ac_salon", "light.ac_bedroom"]))

    assert async_resolve(book.hass, ["מזגנים"]) == ["light.ac_bedroom", "switch.ac_salon"]


def test_a_group_brings_only_what_can_be_switched(book):
    """A label goes on the device, and Home Assistant puts it on every entity.

    Labelling an air conditioner labels its temperature reading with it. The
    reading cannot be turned on, so it has no business in a plan.
    """
    import asyncio

    book.hass.states.set("sensor.ac_salon_temperature", "24")
    book.entities.entities["sensor.ac_salon_temperature"] = type(
        book.entities.entities["switch.ac_salon"]
    )("sensor.ac_salon_temperature")
    asyncio.run(async_set_group(book.hass, "מזגנים", ["switch.ac_salon"]))
    label = book.labels.async_get_label_by_name(group_label_name("מזגנים"))
    book.entities.entities["sensor.ac_salon_temperature"].labels = {label.label_id}

    assert async_get_book(book.hass)["groups"][0]["devices"] == ["switch.ac_salon"]
    assert async_resolve(book.hass, ["מזגנים"]) == ["switch.ac_salon"]
    assert [d["entity_id"] for d in async_get_book(book.hass)["devices"]] == ["switch.ac_salon"]


def test_only_the_device_itself_gets_into_the_book(book):
    """One air conditioner arrives with a crowd: a child lock, a firmware
    version, a temperature reading. A household calls one of them the device,
    and only that one can be told to turn on."""
    import asyncio

    book.hass.states.set("switch.ac_salon_child_lock", "off")
    book.entities.entities["switch.ac_salon_child_lock"] = FakeEntry(
        "switch.ac_salon_child_lock", aliases={"נעילת הורים"}, entity_category="config"
    )
    book.hass.states.set("switch.schedule_abc123", "on")
    book.entities.entities["switch.schedule_abc123"] = FakeEntry(
        "switch.schedule_abc123", aliases={"תזמון"}, platform=const.DOMAIN
    )
    asyncio.run(async_set_group(book.hass, "מזגנים", ["switch.ac_salon"]))

    listed = [d["entity_id"] for d in async_get_book(book.hass)["devices"]]

    assert "switch.ac_salon" in listed
    assert "switch.ac_salon_child_lock" not in listed  # a control, not the device
    assert "switch.schedule_abc123" not in listed  # scheduling a schedule is a loop


def test_a_control_cannot_be_put_into_the_book_by_hand_either(book):
    import asyncio

    book.hass.states.set("switch.ac_salon_child_lock", "off")
    book.entities.entities["switch.ac_salon_child_lock"] = FakeEntry(
        "switch.ac_salon_child_lock", entity_category="config"
    )

    with pytest.raises(ValueError) as err:
        asyncio.run(async_name_device(book.hass, "switch.ac_salon_child_lock", "נעילה"))
    assert "cannot be switched" in str(err.value)

    asyncio.run(async_set_group(book.hass, "מזגנים", ["switch.ac_salon", "switch.ac_salon_child_lock"]))
    assert async_get_book(book.hass)["groups"][0]["devices"] == ["switch.ac_salon"]


def test_a_label_of_the_bare_prefix_is_not_a_group(book):
    """One turns up when a group is made with no name; it is noise, not a group."""
    book.labels.async_create(group_label_name(""))

    assert async_get_book(book.hass)["groups"] == []


def test_a_device_name_stands_for_the_device(book):
    import asyncio

    asyncio.run(async_name_device(book.hass, "switch.ac_salon", "מזגן סלון"))

    assert async_resolve(book.hass, ["מזגן סלון"]) == ["switch.ac_salon"]
    assert async_resolve(book.hass, ["מזגן סלון".upper()]) == ["switch.ac_salon"]


def test_entity_ids_still_work_and_nothing_is_listed_twice(book):
    import asyncio

    asyncio.run(async_set_group(book.hass, "מזגנים", ["switch.ac_salon"]))

    resolved = async_resolve(book.hass, ["מזגנים", "switch.ac_salon", "light.salon"])

    assert resolved == ["switch.ac_salon", "light.salon"]


def test_something_it_cannot_place_is_passed_through_to_be_complained_about(book):
    assert async_resolve(book.hass, ["nothing at all"]) == ["nothing at all"]


def test_a_device_with_neither_a_name_nor_a_group_is_not_in_the_book(book):
    assert async_get_book(book.hass)["devices"] == []


def test_every_kind_says_what_it_can_be_asked(book):
    for capabilities in KINDS.values():
        assert "on" in capabilities or "open" in capabilities
