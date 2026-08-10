"""Initialization of Scheduler switch platform."""
import copy
import datetime
import logging
import voluptuous as vol


import homeassistant.util.dt as dt_util
from homeassistant.components.switch import DOMAIN as PLATFORM
from homeassistant.helpers import entity_platform, config_validation as cv
from homeassistant.const import (
    STATE_OFF,
    STATE_ON,
    STATE_UNAVAILABLE,
    STATE_UNKNOWN,
    ATTR_ENTITY_ID,
    ATTR_NAME,
    ATTR_TIME,
    CONF_SERVICE,
    ATTR_SERVICE_DATA,
    CONF_SERVICE_DATA,
    CONF_CONDITIONS,
)
from homeassistant.components.alarm_control_panel import AlarmControlPanelState
from homeassistant.core import callback
from homeassistant.helpers.entity import ToggleEntity, EntityCategory
from homeassistant.helpers.event import (
    async_call_later,
)
from homeassistant.util import slugify
from homeassistant.helpers.dispatcher import (
    async_dispatcher_connect,
)
from . import const
from .store import ScheduleEntry, async_get_registry
from .timer import TimerHandler
from .actions import (
    ActionHandler,
    async_call_from_config,
    parse_service_call,
    state_matches_action,
)

_LOGGER = logging.getLogger(__name__)

# Applying a slot can quietly fail: the device is unreachable, mid-reboot, or
# the power came back a moment ago. Three quick attempts catch nearly all of
# it; the quarter-hourly ones after that are for a device that is out for a
# while, and giving up after an hour and a half keeps a genuinely dead device
# from being called at forever.
RECOVERY_STEPS = [5, 15, 30]
RECOVERY_INTERVAL = 15 * 60
RECOVERY_WINDOW = 90 * 60


SERVICE_RUN_ACTION = "run_action"
RUN_ACTION_SCHEMA = cv.make_entity_service_schema(
    {vol.Required(ATTR_ENTITY_ID): cv.entity_ids, vol.Optional(ATTR_TIME): cv.time, vol.Optional(const.ATTR_SKIP_CONDITIONS): cv.boolean}
)


def entity_exists_in_hass(hass, entity_id):
    """Check that an entity exists."""
    return hass.states.get(entity_id) is not None


def date_in_future(date_string: str):
    now = dt_util.as_local(dt_util.utcnow())
    date = dt_util.parse_date(date_string)
    diff = date - now.date()
    return diff.days > 0


async def async_setup(hass, config):
    """Track states and offer events for binary sensors."""
    return True


async def async_setup_platform(hass, config, async_add_entities, discovery_info=None):
    """Set up the platform from config."""
    return True


async def async_setup_entry(hass, _config_entry, async_add_entities):
    """Set up the Scheduler switch devices."""

    coordinator = hass.data[const.DOMAIN]["coordinator"]

    @callback
    def async_add_entity(schedule: ScheduleEntry):
        """Add switch for Scheduler."""

        schedule_id = schedule.schedule_id
        name = schedule.name

        # Check if entity already exists to prevent duplicates
        if schedule_id in hass.data[const.DOMAIN]["schedules"]:
            _LOGGER.debug(f"Schedule entity {schedule_id} already exists, skipping creation")
            return

        if name and len(slugify(name)):
            entity_id = "{}.schedule_{}".format(PLATFORM, slugify(name))
        else:
            entity_id = "{}.schedule_{}".format(PLATFORM, schedule_id)

        entity = ScheduleEntity(coordinator, hass, schedule_id, entity_id)
        hass.data[const.DOMAIN]["schedules"][schedule_id] = entity
        async_add_entities([entity])

    for entry in coordinator.store.schedules.values():
        async_add_entity(entry)

    async_dispatcher_connect(hass, const.EVENT_ITEM_CREATED, async_add_entity)

    platform = entity_platform.current_platform.get()

    platform.async_register_entity_service(
        SERVICE_RUN_ACTION, RUN_ACTION_SCHEMA, "async_service_run_action"
    )


class ScheduleEntity(ToggleEntity):
    """Defines a base schedule entity."""

    def __init__(self, coordinator, hass, schedule_id: str, entity_id: str) -> None:
        """Initialize the schedule entity."""
        self.coordinator = coordinator
        self.hass = hass
        self.schedule_id = schedule_id
        self.entity_id = entity_id
        self.schedule = None

        self._state = None
        self._timer = None
        self._timestamps = []
        self._next_entries = []
        self._current_slot = None
        # the slot each track is in, and what was last applied for it, so that
        # a track is only re-run when its slot or its ownership actually moved
        self._current_slots = {}
        self._applied = {}
        # the ladder that puts right an application that did not take
        self._recovery_timer = None
        self._recovery_attempt = 0
        self._init = True
        self._tags = []

        self._listeners = [
            async_dispatcher_connect(
                self.hass, const.EVENT_ITEM_UPDATED, self.async_item_updated
            ),
            async_dispatcher_connect(
                self.hass, const.EVENT_TIMER_UPDATED, self.async_timer_updated
            ),
            async_dispatcher_connect(
                self.hass, const.EVENT_TIMER_FINISHED, self.async_timer_finished
            ),
        ]

    @callback
    async def async_item_updated(self, id: str):
        """update internal properties when schedule config was changed"""
        if id != self.schedule_id:
            return

        store = await async_get_registry(self.hass)
        self.schedule = store.async_get_schedule(self.schedule_id)
        self._tags = self.coordinator.async_get_tags_for_schedule(self.schedule_id)

        if self.schedule[const.ATTR_ENABLED] and self._state in [
            STATE_OFF,
            const.STATE_COMPLETED,
        ]:
            self._state = STATE_ON
        elif not self.schedule[const.ATTR_ENABLED] and self._state not in [
            STATE_OFF,
            const.STATE_COMPLETED,
        ]:
            self._state = STATE_OFF

        self._init = True  # trigger actions of starting timeslot
        self._applied = {}  # the config changed, so nothing counts as applied

        if self.hass is None:
            return

        self.async_write_ha_state()
        self.hass.bus.async_fire(const.EVENT)

    @callback
    async def async_timer_updated(self, id: str):
        """update internal properties when schedule timer was changed"""
        if id != self.schedule_id:
            return

        self._next_entries = self._timer_handler.slot_queue
        self._timestamps = [
            datetime.datetime.isoformat(x) if x is not None else None
            for x in self._timer_handler.timestamps
        ]

        previous_slots = dict(self._current_slots)
        self._current_slots = dict(self._timer_handler.current_slots)
        self._current_slot = self._timer_handler.current_slot
        released = await self.async_release_tracks(previous_slots)

        if released and not any(x is not None for x in self._current_slots.values()):
            last_slot = len(self.schedule[const.ATTR_TIMESLOTS]) - 1
            if any(slot == last_slot for (_track, slot) in released) and (
                not self.schedule[const.ATTR_END_DATE]
                or not date_in_future(self.schedule[const.ATTR_END_DATE])
            ):
                # last timeslot has ended
                # in case period is assigned, the end date must have been reached as well

                if self.schedule[const.ATTR_REPEAT_TYPE] == const.REPEAT_TYPE_PAUSE:
                    _LOGGER.debug(
                        "Scheduler {} has finished the last timeslot, turning off".format(
                            self.schedule_id
                        )
                    )
                    await self.async_turn_off()
                    self._state = const.STATE_COMPLETED

                elif self.schedule[const.ATTR_REPEAT_TYPE] == const.REPEAT_TYPE_SINGLE:
                    _LOGGER.debug(
                        "Scheduler {} has finished the last timeslot, removing".format(
                            self.schedule_id
                        )
                    )
                    self.coordinator.async_delete_schedule(self.schedule_id)

        if self._state not in [STATE_OFF, AlarmControlPanelState.TRIGGERED]:
            if len(self._next_entries) < 1:
                self._state = STATE_UNAVAILABLE
            else:
                now = dt_util.as_local(dt_util.utcnow())
                if (self._timer_handler._next_trigger - now).total_seconds() < 0:
                    self._state = const.STATE_COMPLETED
                else:
                    self._state = (
                        STATE_ON if self.schedule[const.ATTR_ENABLED] else STATE_OFF
                    )

        # initial startpoint for timer calculated, fire actions if currently
        # overlapping with a timeslot. Afterwards this is a no-op unless a
        # track moved or another track took (or gave back) one of its entities.
        await self.async_sync_tracks(initial=self._init)
        self._init = False

        if self.hass is None:
            return

        self.async_write_ha_state()
        self.hass.bus.async_fire(const.EVENT)

    async def async_release_tracks(self, previous_slots: dict):
        """stop the actions of every track that just left its timeslot"""
        released = [
            (track, slot)
            for (track, slot) in previous_slots.items()
            if slot is not None and self._current_slots.get(track) is None
        ]
        for (track, _slot) in released:
            if (
                len(self.schedule[const.ATTR_TIMESLOTS]) == 1
                and self.schedule[const.ATTR_REPEAT_TYPE] == const.REPEAT_TYPE_REPEAT
            ):
                # allow unavailable entities to restore within 9 mins (+1 minute of triggered duration)
                await self._action_handler.async_empty_queue(
                    track=track, restore_time=9
                )
            else:
                await self._action_handler.async_empty_queue(track=track)
        return released

    def async_owned_entities(self, track: str, current_slots: dict = None):
        """the entities a stronger track is holding right now

        A device belongs to its group by default. While it is detached the
        detaching track owns it, and the group must leave it alone - including
        after a restart, when the group would otherwise re-apply its own state
        over the detached one.
        """
        if current_slots is None:
            current_slots = self._current_slots
        timeslots = self.schedule[const.ATTR_TIMESLOTS]

        slot = current_slots.get(track)
        own_priority = (
            timeslots[slot][const.ATTR_PRIORITY]
            if slot is not None
            else const.DEFAULT_PRIORITY
        )

        owned = set()
        for (other, index) in current_slots.items():
            if other == track or index is None:
                continue
            if timeslots[index][const.ATTR_PRIORITY] <= own_priority:
                continue
            for action in timeslots[index][const.ATTR_ACTIONS]:
                if action[ATTR_ENTITY_ID]:
                    owned.add(action[ATTR_ENTITY_ID])
        return owned

    def slot_already_executed(self, slot: int):
        """did this slot already start before the last shutdown?"""
        if (
            self.coordinator.state != const.STATE_INIT
            or not self.coordinator.time_shutdown
        ):
            return False
        # calculate the next start of timeslot since the time of shutdown,
        # execute only if this is in the past
        start_time = self.schedule[const.ATTR_TIMESLOTS][slot][const.ATTR_START]
        start_of_timeslot = self._timer_handler.calculate_timestamp(
            start_time,
            self.coordinator.time_shutdown,
            dates=self._timer_handler.slot_dates(slot),
        )
        if start_of_timeslot is None:
            return False
        return start_of_timeslot > dt_util.as_local(dt_util.utcnow())

    def async_pending_actions(self):
        """actions of the current slots whose entity is not doing them yet

        The devices are re-read from the slots that are current *now*, so a
        retry applies what the schedule says at the moment it runs rather than
        replaying what it said when the first attempt failed. A slot that has
        since ended simply contributes nothing.
        """
        timeslots = self.schedule[const.ATTR_TIMESLOTS]
        pending = []
        for (track, slot) in self._current_slots.items():
            if slot is None:
                continue
            owned = self.async_owned_entities(track)
            for action in timeslots[slot][const.ATTR_ACTIONS]:
                entity = action[ATTR_ENTITY_ID]
                if not entity or entity in owned:
                    continue
                for call in parse_service_call(action):
                    if not state_matches_action(self.hass, call):
                        pending.append(call)
        return pending

    def async_unreachable_entities(self):
        """entities of the current slots that are not answering at all"""
        timeslots = self.schedule[const.ATTR_TIMESLOTS]
        unreachable = set()
        for (track, index) in self._current_slots.items():
            if index is None:
                continue
            owned = self.async_owned_entities(track)
            for action in timeslots[index][const.ATTR_ACTIONS]:
                entity = action[ATTR_ENTITY_ID]
                if not entity or entity in owned:
                    continue
                state = self.hass.states.get(entity)
                if state is None or state.state in [STATE_UNAVAILABLE, STATE_UNKNOWN]:
                    unreachable.add(entity)
        return unreachable

    async def async_recover(self, _now=None):
        """put right anything that did not take

        A device can be unreachable, mid-reboot, or simply slow, and a service
        call that quietly did nothing used to stay that way until the next
        boundary hours later. This tries again on a ladder - three times
        quickly, then every quarter of an hour for an hour and a half - and
        stops the moment the devices are where the schedule wants them.
        """
        self._recovery_timer = None
        if self._state == STATE_OFF or not self.schedule:
            return

        pending = self.async_pending_actions()
        if not pending:
            # A device that is not answering is not the same as one that took
            # the action: after a power cut it will come back wrong, and the
            # ladder has to still be running when it does.
            if self.async_unreachable_entities():
                delay = self.async_recovery_delay()
                if delay is not None:
                    self._recovery_attempt += 1
                    self._recovery_timer = async_call_later(
                        self.hass, delay, self.async_recover
                    )
                    return
            self._recovery_attempt = 0
            return

        if self._recovery_attempt:
            _LOGGER.debug(
                "Schedule {}: {} did not take, trying again (attempt {})".format(
                    self.schedule_id,
                    ", ".join(sorted({a[ATTR_ENTITY_ID] for a in pending})),
                    self._recovery_attempt,
                )
            )
            for action in pending:
                await async_call_from_config(self.hass, action)

        delay = self.async_recovery_delay()
        if delay is None:
            _LOGGER.warning(
                "Schedule {} gave up on {} after {} minutes".format(
                    self.schedule_id,
                    ", ".join(sorted({a[ATTR_ENTITY_ID] for a in pending})),
                    RECOVERY_WINDOW // 60,
                )
            )
            self._recovery_attempt = 0
            return

        self._recovery_attempt += 1
        self._recovery_timer = async_call_later(self.hass, delay, self.async_recover)

    def async_recovery_delay(self):
        """how long until the next attempt, or None once it is time to stop"""
        attempt = self._recovery_attempt
        if attempt < len(RECOVERY_STEPS):
            return RECOVERY_STEPS[attempt]
        slow_attempts = attempt - len(RECOVERY_STEPS)
        if slow_attempts * RECOVERY_INTERVAL >= RECOVERY_WINDOW:
            return None
        return RECOVERY_INTERVAL

    def async_cancel_recovery(self):
        if self._recovery_timer:
            self._recovery_timer()
        self._recovery_timer = None
        self._recovery_attempt = 0

    def async_start_recovery(self):
        """watch whether what was just applied actually took"""
        self.async_cancel_recovery()
        self._recovery_timer = async_call_later(
            self.hass, RECOVERY_STEPS[0], self.async_recover
        )

    async def async_sync_tracks(self, initial: bool = False):
        """apply the timeslot every track is currently in"""
        if self._state == STATE_OFF:
            self.async_cancel_recovery()
            return

        timeslots = self.schedule[const.ATTR_TIMESLOTS]
        applied = False
        for (track, slot) in self._current_slots.items():
            if slot is None:
                self._applied.pop(track, None)
                continue

            excluded = frozenset(self.async_owned_entities(track))
            if self._applied.get(track) == (slot, excluded):
                # this track is already running exactly this
                continue
            self._applied[track] = (slot, excluded)

            skip = self.slot_already_executed(slot) if initial else False
            if skip:
                _LOGGER.debug(
                    "Schedule {} was already executed before shutdown, initial timeslot is skipped.".format(
                        self.schedule_id
                    )
                )
            else:
                _LOGGER.debug(
                    "Schedule {} is proceeding with the actions of slot {} on track '{}'".format(
                        self.schedule_id, slot, track
                    )
                )
            await self._action_handler.async_queue_actions(
                timeslots[slot],
                skip,
                track=track,
                exclude_entities=excluded,
            )
            applied = True

        if applied:
            self.async_start_recovery()

    @callback
    async def async_timer_finished(self, id: str):
        """fire actions when timer is finished"""
        if id != self.schedule_id:
            return

        if self._state not in [STATE_OFF, const.STATE_COMPLETED]:

            previous_slots = dict(self._current_slots)
            self._current_slots = dict(self._timer_handler.current_slots)
            self._current_slot = self._timer_handler.current_slot
            await self.async_release_tracks(previous_slots)

            _LOGGER.debug(
                "Schedule {} is triggered, proceed with actions".format(
                    self.schedule_id
                )
            )
            await self.async_sync_tracks()

        @callback
        async def async_trigger_finished(_now):
            """internal timer is finished, reset the schedule"""
            if self._state == AlarmControlPanelState.TRIGGERED:
                self._state = STATE_ON
            await self._timer_handler.async_start_timer()

        # keep the entity in triggered state for 1 minute, then restart the timer
        self._timer = async_call_later(self.hass, 60, async_trigger_finished)
        if self._state == STATE_ON:
            self._state = AlarmControlPanelState.TRIGGERED

        self.async_write_ha_state()
        self.hass.bus.async_fire(const.EVENT)

    async def async_cancel_timer(self):
        """cancel timer"""
        if self._timer:
            self._timer()
            self._timer = None

    @property
    def device_info(self) -> dict:
        """Return info for device registry."""
        device = self.coordinator.id
        return {
            "identifiers": {(const.DOMAIN, device)},
            "name": "Scheduler",
            "model": "Scheduler",
            "sw_version": const.VERSION,
            "manufacturer": "@nielsfaber",
        }

    @property
    def name(self) -> str:
        """Return the name of the entity."""
        if self.schedule and self.schedule[ATTR_NAME]:
            return self.schedule[ATTR_NAME]
        else:
            return "Schedule #{}".format(self.schedule_id)

    @property
    def should_poll(self) -> bool:
        """Return the polling requirement of the entity."""
        return False

    @property
    def state(self):
        """Return the state of the entity."""
        return self._state

    @property
    def icon(self):
        """Return icon."""
        return "mdi:calendar-clock"

    @property
    def entity_category(self):
        """Return EntityCategory."""
        return EntityCategory.CONFIG

    @property
    def weekdays(self):
        return self.schedule[const.ATTR_WEEKDAYS] if self.schedule else None

    @property
    def entities(self):
        entities = []
        if not self.schedule:
            return
        for timeslot in self.schedule[const.ATTR_TIMESLOTS]:
            for action in timeslot[const.ATTR_ACTIONS]:
                if action[ATTR_ENTITY_ID] and action[ATTR_ENTITY_ID] not in entities:
                    entities.append(action[ATTR_ENTITY_ID])

        return entities

    @property
    def actions(self):
        if not self.schedule:
            return
        return [
            {
                CONF_SERVICE: timeslot["actions"][0][CONF_SERVICE],
            }
            if not timeslot["actions"][0][ATTR_SERVICE_DATA]
            else {
                CONF_SERVICE: timeslot["actions"][0][CONF_SERVICE],
                CONF_SERVICE_DATA: timeslot["actions"][0][ATTR_SERVICE_DATA],
            }
            for timeslot in self.schedule[const.ATTR_TIMESLOTS]
        ]

    @property
    def timeslots(self):
        timeslots = []
        if not self.schedule:
            return
        for timeslot in self.schedule[const.ATTR_TIMESLOTS]:
            if timeslot[const.ATTR_STOP]:
                timeslots.append(
                    "{} - {}".format(
                        timeslot[const.ATTR_START], timeslot[const.ATTR_STOP]
                    )
                )
            else:
                timeslots.append(timeslot[const.ATTR_START])
        return timeslots

    @property
    def tags(self):
        return self._tags

    @property
    def state_attributes(self):
        """Return the data of the entity."""
        output = {
            "weekdays": self.weekdays,
            "timeslots": self.timeslots,
            "entities": self.entities,
            "actions": self.actions,
            "current_slot": self._current_slot,
            "current_slots": self._current_slots,
            "next_slot": self._next_entries[0] if len(self._next_entries) else None,
            "next_trigger": self._timestamps[self._next_entries[0]]
            if len(self._next_entries)
            else None,
            "tags": self.tags,
        }

        return output

    @property
    def available(self):
        """Return True if entity is available."""
        return True

    @property
    def unique_id(self):
        """Return a unique ID to use for this entity."""
        return f"{self.schedule_id}"

    @property
    def is_on(self):
        """Return true if entity is on."""
        return self._state not in [STATE_OFF, const.STATE_COMPLETED]

    @callback
    def async_get_entity_state(self):
        """fetch schedule data for websocket API"""
        data = copy.copy(self.schedule)
        if not data:
            data = {}
        data.update(
            {
                "next_entries": self._next_entries,
                "timestamps": self._timestamps,
                "name": self.schedule[ATTR_NAME] if self.schedule else "",
                "entity_id": self.entity_id,
                "tags": self.tags,
            }
        )
        return data

    async def async_added_to_hass(self):
        """Connect to dispatcher listening for entity data notifications."""
        store = await async_get_registry(self.hass)
        self.schedule = store.async_get_schedule(self.schedule_id)
        self._tags = self.coordinator.async_get_tags_for_schedule(self.schedule_id)

        self._timer_handler = TimerHandler(self.hass, self.schedule_id)
        self._action_handler = ActionHandler(self.hass, self.schedule_id)
        _LOGGER.debug("added to hass")

    async def async_turn_off(self):
        """turn off a schedule"""
        if self.schedule[const.ATTR_ENABLED]:
            await self._action_handler.async_empty_queue()
            self._applied = {}
            self.coordinator.async_edit_schedule(
                self.schedule_id, {const.ATTR_ENABLED: False}
            )

    async def async_turn_on(self):
        """turn on a schedule"""
        if not self.schedule[const.ATTR_ENABLED]:
            self.coordinator.async_edit_schedule(
                self.schedule_id, {const.ATTR_ENABLED: True}
            )

    async def async_will_remove_from_hass(self):
        """remove entity from hass."""
        _LOGGER.debug("Schedule {} is removed from hass".format(self.schedule_id))

        await self.async_cancel_timer()
        self.async_cancel_recovery()
        await self._action_handler.async_empty_queue()
        await self._timer_handler.async_unload()

        while len(self._listeners):
            self._listeners.pop()()

        await super().async_will_remove_from_hass()

    async def async_service_remove(self):
        """remove a schedule"""
        self._state = STATE_OFF

        await self.async_remove()

    async def async_service_edit(
        self, entries, actions, conditions=None, options=None, name=None
    ):
        """edit a schedule"""
        if self._timer:
            old_state = self._state
            self._state = STATE_OFF
            self._timer()
            self._timer = None
            self._state = old_state

        await self.async_cancel_timer()
        await self._action_handler.async_empty_queue()
        await self._timer_handler.async_unload()

        self.async_write_ha_state()

    async def async_service_run_action(self, time=None, skip_conditions=False):
        """Manually trigger the execution of the actions of a timeslot"""

        now = dt_util.as_local(dt_util.utcnow())
        if time is not None:
            now = now.replace(hour=time.hour, minute=time.minute, second=time.second)

        # every track can be inside a timeslot at the same moment, so a manual
        # run covers all of them rather than an arbitrary one
        active = {
            track: slot
            for (track, (slot, _ts)) in self._timer_handler.current_timeslots(
                now
            ).items()
        }

        if (
            not any(x is not None for x in active.values())
            and time is None
            and len(self.schedule[const.ATTR_TIMESLOTS]) == 1
        ):
            active = {
                self.schedule[const.ATTR_TIMESLOTS][0][const.ATTR_TRACK]: 0
            }

        if not any(x is not None for x in active.values()):
            _LOGGER.info(
                "Schedule {} has no active timeslot at {}".format(
                    self.entity_id, now.strftime("%H:%M:%S")
                )
            )
            return

        for (track, slot) in active.items():
            if slot is None:
                continue
            schedule = dict(self.schedule[const.ATTR_TIMESLOTS][slot])
            if skip_conditions:
                schedule[CONF_CONDITIONS] = []

            _LOGGER.debug(
                "Executing actions for {}, timeslot {}, skip_conditions {}".format(
                    self.entity_id, slot, skip_conditions
                )
            )

            await self._action_handler.async_queue_actions(
                schedule,
                track=track,
                exclude_entities=self.async_owned_entities(track, active),
            )
