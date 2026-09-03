"""Your own names and groupings for the devices a schedule drives.

Two of the three pieces already have a home in Home Assistant, and putting
them there rather than in a private list means they stay true when a device is
renamed and are usable outside the scheduler:

  groups  -> the label registry. Labels are exactly "a set of entities the
             household thinks of together", and they show up in Home Assistant's
             own filters and automations.
  names   -> the entity registry's aliases. An alias is a second name for an
             entity; it also improves voice control, so naming a device here
             makes "turn on the salon air conditioner" work in Assist too.

The third has nowhere native to live:

  kind    -> what the device really is. Plenty of devices are registered under
             the wrong domain - an air conditioner behind a switch, a boiler
             behind a light - and the domain then decides which parameters a
             schedule offers. Correcting that is scheduler-specific, so it is
             the one thing kept in the scheduler's own storage.
"""
from __future__ import annotations

import logging
from types import SimpleNamespace
from typing import Any

from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import (
    entity_registry as er,
    label_registry as lr,
)

from . import const

_LOGGER = logging.getLogger(__name__)

#: labels that belong to the device book carry this prefix, so a household's
#: other labels are left alone
GROUP_LABEL_PREFIX = "scheduler:"

#: what a device can be told to be, and what each kind can be asked to do
KINDS = {
    "light": ["on", "off", "brightness", "kelvin"],
    "switch": ["on", "off"],
    "climate": ["on", "off", "temperature"],
    "cover": ["open", "close"],
    "fan": ["on", "off"],
    "media_player": ["on", "off"],
    "other": ["on", "off"],
}

DEFAULT_KIND = "other"

#: the domains that can be switched at all - a temperature reading is not one
SCHEDULABLE_DOMAINS = ("light", "switch", "fan", "climate", "input_boolean", "media_player")


def is_schedulable(entity_id: str) -> bool:
    return entity_id.split(".")[0] in SCHEDULABLE_DOMAINS


def is_a_device_to_schedule(entity_id: str, entry: Any = None) -> bool:
    """Is this the device itself - the thing a person would name and switch?

    A single air conditioner brings a handful of entities with it: the unit, a
    child lock, a firmware version, a temperature reading. Only the first is a
    device as far as a household is concerned, and the rest only make the list
    of things to choose from harder to read. Home Assistant already marks the
    others - a category, or hidden - so that mark is what is followed here.
    """
    if not is_schedulable(entity_id):
        return False
    if entry is None:
        return True
    if getattr(entry, "entity_category", None) is not None:
        return False  # a control for the device, not the device
    if getattr(entry, "hidden_by", None) or getattr(entry, "disabled_by", None):
        return False
    if getattr(entry, "platform", None) == const.DOMAIN:
        return False  # the scheduler's own switches; scheduling those is a loop
    return True


@callback
def async_is_a_device_to_schedule(hass: HomeAssistant, entity_id: str) -> bool:
    """The same question, when only the entity id is in hand."""
    try:
        entry = er.async_get(hass).async_get(entity_id)
    except (KeyError, AttributeError, TypeError):
        entry = None
    return is_a_device_to_schedule(entity_id, entry)


@callback
def async_devices_to_schedule(hass: HomeAssistant) -> list[str]:
    """Every device worth offering, in the order a person would read them."""
    return sorted(
        state.entity_id
        for state in hass.states.async_all()
        if async_is_a_device_to_schedule(hass, state.entity_id)
    )


def kind_from_domain(entity_id: str) -> str:
    domain = entity_id.split(".")[0]
    return domain if domain in KINDS else DEFAULT_KIND


def group_label_name(group: str) -> str:
    return f"{GROUP_LABEL_PREFIX}{group}"


def group_from_label(label_name: str) -> str | None:
    if not label_name.startswith(GROUP_LABEL_PREFIX):
        return None
    return label_name[len(GROUP_LABEL_PREFIX):]


EMPTY_BOOK: dict[str, Any] = {"groups": [], "devices": []}


@callback
def async_get_book(hass: HomeAssistant) -> dict[str, Any]:
    """The whole book: every group, and every device with a name of its own.

    An empty book when the registries are not up yet: nothing is named, which
    is the truth at that point, and a schedule that uses entity ids carries on
    working regardless.
    """
    try:
        labels = lr.async_get(hass)
        entities = er.async_get(hass)
    except (KeyError, AttributeError, TypeError):
        return dict(EMPTY_BOOK)
    kinds = _kinds(hass)

    groups: dict[str, list[str]] = {}
    label_ids: dict[str, str] = {}
    for label in labels.async_list_labels():
        name = group_from_label(label.name)
        if name:  # a label of the bare prefix names no group; it is not one
            groups[name] = []
            label_ids[label.label_id] = name

    devices: dict[str, dict[str, Any]] = {}
    for entry in entities.entities.values():
        # aliases is meant to hold strings, but Home Assistant has been known to
        # leave a sentinel of its own in there; sorting the two together raises,
        # and a whole plan is not worth losing over one odd registry entry
        alias = next(iter(sorted(x for x in entry.aliases if isinstance(x, str))), None)
        member_of = [label_ids[x] for x in entry.labels if x in label_ids]
        if not alias and not member_of and entry.entity_id not in kinds:
            continue
        if not is_a_device_to_schedule(entry.entity_id, entry):
            # a label goes on the device, and Home Assistant carries it to every
            # entity that device has. Only the device belongs in the book: the
            # rest cannot be switched, and a plan that names one does nothing.
            continue
        for group in member_of:
            groups[group].append(entry.entity_id)
        devices[entry.entity_id] = {
            "entity_id": entry.entity_id,
            "name": alias or _display_name(hass, entry.entity_id),
            "alias": alias,
            "kind": kinds.get(entry.entity_id) or kind_from_domain(entry.entity_id),
            "groups": sorted(member_of),
        }

    return {
        "groups": [
            {"name": name, "devices": sorted(members)} for name, members in sorted(groups.items())
        ],
        "devices": [devices[key] for key in sorted(devices)],
    }


def _display_name(hass: HomeAssistant, entity_id: str) -> str:
    state = hass.states.get(entity_id)
    return (state.attributes.get("friendly_name") if state else None) or entity_id


def _kinds(hass: HomeAssistant) -> dict[str, str]:
    return (hass.data.get(const.DOMAIN) or {}).get(const.DATA_DEVICE_KINDS, {})


@callback
def async_resolve(hass: HomeAssistant, names: list[str]) -> list[str]:
    """Turn a mixed list of entity ids, device names and group names into entities.

    A schedule can be handed "the air conditioners" or "salon air conditioner"
    instead of an entity id, which is the whole point of the book: the names in
    a plan are the ones the household uses.
    """
    book = async_get_book(hass)
    by_group = {group["name"]: group["devices"] for group in book["groups"]}
    by_name: dict[str, str] = {}
    for device in book["devices"]:
        by_name.setdefault(device["name"].lower(), device["entity_id"])
        if device["alias"]:
            by_name.setdefault(device["alias"].lower(), device["entity_id"])

    resolved: list[str] = []
    for name in names:
        if "." in name and hass.states.get(name) is not None:
            candidates = [name]
        elif name in by_group:
            # already only the devices themselves: the book leaves out what a
            # label picked up along the way
            candidates = list(by_group[name])
        elif name.lower() in by_name:
            candidates = [by_name[name.lower()]]
        else:
            # unknown, but an entity id shape is still worth passing through so
            # the schema's own error names it rather than this one
            candidates = [name]
        for entity_id in candidates:
            if entity_id not in resolved:
                resolved.append(entity_id)
    return resolved


async def async_set_group(hass: HomeAssistant, group: str, devices: list[str]) -> None:
    """Make a group hold exactly these devices."""
    labels = lr.async_get(hass)
    entities = er.async_get(hass)

    label = labels.async_get_label_by_name(group_label_name(group))
    if label is None:
        label = labels.async_create(group_label_name(group))

    # a group is for devices; labelling a reading or a child lock would only put
    # it back in the book by another door
    wanted = {
        entity_id
        for entity_id in devices
        if is_a_device_to_schedule(entity_id, entities.async_get(entity_id))
    }
    for entry in list(entities.entities.values()):
        has = label.label_id in entry.labels
        should = entry.entity_id in wanted
        if has == should:
            continue
        new_labels = set(entry.labels)
        new_labels.add(label.label_id) if should else new_labels.discard(label.label_id)
        entities.async_update_entity(entry.entity_id, labels=new_labels)


async def async_remove_group(hass: HomeAssistant, group: str) -> bool:
    labels = lr.async_get(hass)
    label = labels.async_get_label_by_name(group_label_name(group))
    if label is None:
        return False
    labels.async_delete(label.label_id)
    return True


async def async_name_device(hass: HomeAssistant, entity_id: str, name: str | None) -> None:
    """Give a device the name a schedule should call it by.

    Stored as an entity alias, which is Home Assistant's own field for exactly
    this - so the name also works when speaking to Assist.
    """
    entities = er.async_get(hass)
    entry = entities.async_get(entity_id)
    if entry is None:
        raise ValueError(
            f"'{entity_id}' is not a registered entity. Its id looks like 'light.salon'."
        )
    if name and not is_a_device_to_schedule(entity_id, entry):
        raise ValueError(
            f"'{entity_id}' cannot be switched on and off, so a schedule has nothing "
            "to tell it. Name the device itself instead - a temperature reading, a "
            "firmware version or a child lock is not one."
        )
    entities.async_update_entity(entity_id, aliases={name} if name else set())


async def async_forget_device(hass: HomeAssistant, entity_id: str) -> None:
    """Take a device out of the book entirely.

    A device is in the book because it has a name, a group, or a corrected
    kind. Removing it has to undo all three, or it comes straight back the next
    time the book is read - which is exactly what "remove" must not do.
    """
    entities = er.async_get(hass)
    entry = entities.async_get(entity_id)
    if entry is None:
        raise ValueError(
            f"'{entity_id}' is not a registered entity. Its id looks like 'light.salon'."
        )

    labels = lr.async_get(hass)
    keep = {
        label_id
        for label_id in entry.labels
        if group_from_label((labels.async_get_label(label_id) or _NO_LABEL).name) is None
    }
    entities.async_update_entity(entity_id, aliases=set(), labels=keep)
    async_set_kind(hass, entity_id, None)


#: stands in for a label that has gone while we were reading it
_NO_LABEL = SimpleNamespace(name="")


@callback
def async_set_kind(hass: HomeAssistant, entity_id: str, kind: str | None) -> None:
    """Record what a device really is, when Home Assistant has it wrong."""
    if kind is not None and kind not in KINDS:
        raise ValueError(
            f"'{kind}' is not a kind. Use one of: {', '.join(sorted(KINDS))}."
        )
    store = hass.data.setdefault(const.DOMAIN, {}).setdefault(const.DATA_DEVICE_KINDS, {})
    if kind is None or kind == kind_from_domain(entity_id):
        store.pop(entity_id, None)
    else:
        store[entity_id] = kind


@callback
def async_kind_of(hass: HomeAssistant, entity_id: str) -> str:
    return _kinds(hass).get(entity_id) or kind_from_domain(entity_id)


@callback
def async_can(hass: HomeAssistant, entity_id: str, capability: str) -> bool:
    """Whether a device takes a given parameter, after any correction."""
    return capability in KINDS[async_kind_of(hass, entity_id)]
