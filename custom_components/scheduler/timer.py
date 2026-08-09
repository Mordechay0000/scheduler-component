import logging
import datetime
from collections import namedtuple


import homeassistant.util.dt as dt_util
from homeassistant.const import (
    WEEKDAYS,
    STATE_ON,
    STATE_OFF,
    STATE_UNAVAILABLE,
    STATE_UNKNOWN,
)
from homeassistant.core import (
    HomeAssistant,
    callback,
)
from homeassistant.helpers.event import (
    async_track_point_in_time,
    async_track_state_change_event,
)
from homeassistant.helpers.dispatcher import (
    async_dispatcher_connect,
    async_dispatcher_send,
)


from . import const
from .store import async_get_registry

_LOGGER = logging.getLogger(__name__)

ATTR_NEXT_RISING = "next_rising"
ATTR_NEXT_SETTING = "next_setting"
ATTR_WORKDAYS = "workdays"

# `dated` marks an anchor that resolved to a specific day, not just a time of
# day - the difference between "every day at 19:08" and "this Friday at 19:08".
AnchorTime = namedtuple("AnchorTime", ["timestamp", "dated"])

# Something the timer has to wake up for: a slot on `track` either starting or
# ending. Several of them can share a moment, which is how independent tracks
# can change at the same instant without one of them being lost.
TimerEvent = namedtuple("TimerEvent", ["timestamp", "track", "slot", "is_end"])


def has_sun(time_str: str):
    return const.OffsetTimePattern.match(time_str)


def has_entity_anchor(time_str: str):
    """match a time that is anchored to an entity, e.g. sensor.shkia-00:18:00"""
    return const.EntityOffsetTimePattern.match(time_str)


def parse_anchor(time_str: str):
    """split an anchored time into (anchor, sign, offset), or None if fixed.

    The anchor is either a sun event keyword or the entity id that publishes
    the time. Both forms resolve to a moment that is only known at trigger
    time, which is what separates them from a plain clock time.
    """
    if time_str is None:
        return None
    res = has_sun(time_str) or has_entity_anchor(time_str)
    if not res:
        return None
    return (res.group(1), res.group(2), res.group(3))


def anchor_entity(time_str: str):
    """the entity whose changes should re-arm a timer using this time"""
    parsed = parse_anchor(time_str)
    if parsed is None:
        return None
    anchor = parsed[0]
    if anchor in [const.SUN_EVENT_SUNRISE, const.SUN_EVENT_SUNSET]:
        return const.SUN_ENTITY
    return anchor


def is_same_day(dateA: datetime.datetime, dateB: datetime.datetime):
    return dateA.date() == dateB.date()


def days_until_date(date_string: str, ts: datetime.datetime):
    date = dt_util.parse_date(date_string)
    diff = date - ts.date()
    return diff.days


def find_closest_from_now(date_arr: list):
    now = dt_util.as_local(dt_util.utcnow())
    minimum = None
    for item in date_arr:
        if item is not None:
            if minimum is None:
                minimum = item
            elif item > now:
                if item < minimum or minimum < now:
                    minimum = item
            else:
                if item < minimum and minimum < now:
                    minimum = item
    return minimum


class TimerHandler:
    def __init__(self, hass: HomeAssistant, id: str):
        """init"""
        self.hass = hass
        self.id = id
        self._weekdays = []
        self._start_date = None
        self._end_date = None
        self._timeslots = []
        self._track_slots = {}
        self._timer = None
        self._timer_is_endpoint = False
        self._next_trigger = None
        self._next_slot = None
        self._pending = []
        self._anchor_tracker = None
        self._tracked_anchors = []
        self._workday_tracker = None
        self._watched_times = []

        self.slot_queue = []
        self.timestamps = []
        self.current_slot = None
        self.current_slots = {}

        self.hass.loop.create_task(self.async_reload_data())

        @callback
        async def async_item_updated(id: str):
            if id == self.id:
                await self.async_reload_data()

        self._update_listener = async_dispatcher_connect(
            self.hass, const.EVENT_ITEM_UPDATED, async_item_updated
        )

    async def async_reload_data(self):
        """load schedule data into timer class object and start timer"""
        store = await async_get_registry(self.hass)
        data = store.async_get_schedule(self.id)

        self._weekdays = data[const.ATTR_WEEKDAYS]
        self._start_date = data[const.ATTR_START_DATE]
        self._end_date = data[const.ATTR_END_DATE]
        self._timeslots = [
            dict(
                (k, slot[k])
                for k in [
                    const.ATTR_START,
                    const.ATTR_STOP,
                    const.ATTR_TRACK,
                    const.ATTR_START_DATE,
                    const.ATTR_END_DATE,
                ]
                if k in slot
            )
            for slot in data[const.ATTR_TIMESLOTS]
        ]
        self._track_slots = self.group_slots_by_track()
        await self.async_start_timer()

    def group_slots_by_track(self):
        """split the timeslots into the independent timelines they belong to

        A schedule used to be a single partition of the day, so a boundary that
        only mattered to one device still cut every other device's slot in two.
        Slots that name a track keep their own partition instead.
        """
        tracks = {}
        for (index, slot) in enumerate(self._timeslots):
            track = slot.get(const.ATTR_TRACK) or const.DEFAULT_TRACK
            tracks.setdefault(track, []).append(index)
        return tracks

    def slot_dates(self, index: int):
        """the period a slot may run in, narrowed by its own if it has one"""
        slot = self._timeslots[index]
        start = slot.get(const.ATTR_START_DATE)
        end = slot.get(const.ATTR_END_DATE)
        start = max(x for x in [start, self._start_date] if x) if (
            start or self._start_date
        ) else None
        end = min(x for x in [end, self._end_date] if x) if (
            end or self._end_date
        ) else None
        return (start, end)

    def primary_slot(self, current_slots: dict):
        """the one slot to report for schedules that only have one track"""
        if const.DEFAULT_TRACK in current_slots:
            slot = current_slots[const.DEFAULT_TRACK]
            if slot is not None:
                return slot
        return next((x for x in current_slots.values() if x is not None), None)

    async def async_unload(self):
        """unload a timer class object"""
        await self.async_stop_timer()
        self._update_listener()
        self._next_trigger = None

    async def async_start_timer(self):
        now = dt_util.as_local(dt_util.utcnow())
        starts = self.compute_slot_starts(now)
        # refresh the ordering and the moments the frontend reads
        self.next_timeslot(timestamps=starts)

        self._watched_times = []
        current_slots = {}
        events = []

        for (track, slots) in self._track_slots.items():
            [current_slot, timestamp_end] = self.current_timeslot(slots=slots)
            [next_slot, timestamp_next] = self.next_timeslot(
                slots=slots, timestamps=starts
            )
            current_slots[track] = current_slot
            if timestamp_next is not None:
                self._watched_times.append(self._timeslots[next_slot][const.ATTR_START])
                events.append(TimerEvent(timestamp_next, track, next_slot, False))
            if timestamp_end is not None:
                self._watched_times.append(self._timeslots[current_slot][const.ATTR_STOP])
                events.append(TimerEvent(timestamp_end, track, current_slot, True))

        # the next trigger time is the soonest boundary of any track - every
        # track that shares that moment is handled in the same wake-up
        timestamp = find_closest_from_now([x.timestamp for x in events])
        self._pending = (
            [x for x in events if x.timestamp == timestamp]
            if timestamp is not None
            else []
        )
        self._timer_is_endpoint = bool(self._pending) and all(
            x.is_end for x in self._pending
        )
        self._next_slot = next((x.slot for x in self._pending if not x.is_end), None)

        self.current_slots = current_slots
        self.current_slot = self.primary_slot(current_slots)
        self._next_trigger = timestamp

        await self.async_start_anchor_tracker()

        if timestamp is not None:
            if self._timer:
                self._timer()

            if (timestamp - now).total_seconds() < 0:
                self._timer = None
                _LOGGER.debug(
                    "Timer of {} is not set because it is in the past ({})".format(
                        self.id, timestamp
                    )
                )
            else:
                self._timer = async_track_point_in_time(
                    self.hass, self.async_timer_finished, timestamp
                )
                _LOGGER.debug("Timer of {} set for {}".format(self.id, timestamp))
                await self.async_start_workday_tracker()

        async_dispatcher_send(self.hass, const.EVENT_TIMER_UPDATED, self.id)

    async def async_stop_timer(self):
        """stop the timer"""
        if self._timer:
            self._timer()
            self._timer = None
        await self.async_stop_anchor_tracker()
        await self.async_stop_workday_tracker()

    def anchor_entities(self):
        """the entities the current timer depends on for its trigger time"""
        if self._next_trigger is not None:
            times = self._watched_times
        else:
            # nothing is armed yet - watch every anchor so an entity that is
            # still initializing can start the timer once it publishes a value
            times = [x[const.ATTR_START] for x in self._timeslots]
            if not times or not all(parse_anchor(x) for x in times):
                return []
        entities = [anchor_entity(x) for x in times]
        return sorted({e for e in entities if e is not None})

    async def async_start_anchor_tracker(self):
        """check for changes in the entities the trigger time is derived from"""
        entities = self.anchor_entities()
        if entities:
            # install tracker for updating the timer when an anchor moves.
            # initially the time calculation may fail because the anchor entity
            # is not available yet.

            if self._anchor_tracker is not None:
                if self._tracked_anchors == entities:
                    # the tracker is already running for these entities
                    return
                # the schedule now depends on a different set of anchors
                await self.async_stop_anchor_tracker()

            @callback
            async def async_anchor_updated(_event):
                """an anchor entity was updated"""
                if self._next_trigger is None:
                    # anchor entity has initialized
                    await self.async_start_timer()
                    return
                ts = find_closest_from_now(
                    self.calculate_timestamp(x) for x in self._watched_times
                )
                if not ts or not self._next_trigger:
                    # anchor entity became unavailable (or other corner case)
                    await self.async_start_timer()
                    return
                # we are re-scheduling an existing timer
                delta = (ts - self._next_trigger).total_seconds()
                if abs(delta) >= 60 and abs(delta) < 2000:
                    # only reschedule if the difference is at least a minute
                    # only reschedule if this doesnt cause the timer to shift to another day (+/- 24 hrs delta)
                    # only reschedule if this doesnt cause the timer to shift to another hour (due to DST change)
                    await self.async_start_timer()

            self._tracked_anchors = entities
            self._anchor_tracker = async_track_state_change_event(
                self.hass, entities, async_anchor_updated
            )
        else:
            # clear existing tracker
            await self.async_stop_anchor_tracker()

    async def async_stop_anchor_tracker(self):
        """stop checking for changes in the anchor entities"""
        if self._anchor_tracker:
            self._anchor_tracker()
            self._anchor_tracker = None
        self._tracked_anchors = []

    async def async_start_workday_tracker(self):
        """check for changes in the workday sensor"""
        if (
            const.DAY_TYPE_WORKDAY in self._weekdays
            or const.DAY_TYPE_WEEKEND in self._weekdays
        ):
            # install tracker for updating timer when workday sensor changes

            if self._workday_tracker is not None:
                # the tracker is already running
                return

            @callback
            async def async_workday_updated():
                """the workday sensor was updated"""
                [current_slot, timestamp_end] = self.current_timeslot()
                [next_slot, timestamp_next] = self.next_timeslot()
                ts_next = find_closest_from_now([timestamp_end, timestamp_next])

                # workday entity changed
                if not ts_next or not self._next_trigger:
                    # timer was not yet set
                    await self.async_start_timer()
                else:
                    # we are re-scheduling an existing timer
                    delta = (ts_next - self._next_trigger).total_seconds()
                    if abs(delta) >= 60:
                        # only reschedule if the difference is at least a minute
                        await self.async_start_timer()

            self._workday_tracker = async_dispatcher_connect(
                self.hass, const.EVENT_WORKDAY_SENSOR_UPDATED, async_workday_updated
            )
        else:
            # clear existing tracker
            await self.async_stop_workday_tracker()

    async def async_stop_workday_tracker(self):
        """stop checking for changes in the workday sensor"""
        if self._workday_tracker:
            self._workday_tracker()
            self._workday_tracker = None

    async def async_timer_finished(self, _time):
        """the timer is finished"""
        # a track whose slot ends exactly where the next one starts is handing
        # over, not falling idle, so the start wins over the end
        started = {x.track: x.slot for x in self._pending if not x.is_end}
        for event in self._pending:
            if event.track not in started:
                self.current_slots[event.track] = None
        for (track, slot) in started.items():
            self.current_slots[track] = slot
        self.current_slot = self.primary_slot(self.current_slots)

        if started:
            # timer marks the start of a new timeslot on at least one track
            _LOGGER.debug(
                "Timer {} has reached slot {}".format(self.id, self.current_slot)
            )
            async_dispatcher_send(self.hass, const.EVENT_TIMER_FINISHED, self.id)
            # don't automatically reset, wait for external reset after 1 minute
            # await self.async_start_timer()
            await self.async_stop_timer()
        else:
            # timer marks the end of a timeslot
            _LOGGER.debug(
                "Timer {} has reached end of timeslot, resetting..".format(self.id)
            )
            await self.async_start_timer()

    def day_in_weekdays(self, ts: datetime.datetime) -> bool:
        """check if the day of a datetime object is in the allowed list of days"""
        day = WEEKDAYS[ts.weekday()]
        workday_sensor = self.hass.states.get(const.WORKDAY_ENTITY)

        if (
            workday_sensor
            and workday_sensor.state in [STATE_ON, STATE_OFF]
            and is_same_day(ts, dt_util.as_local(dt_util.utcnow()))
        ):
            # state of workday sensor is used for evaluating workday vs weekend
            if const.DAY_TYPE_WORKDAY in self._weekdays:
                return workday_sensor.state == STATE_ON
            elif const.DAY_TYPE_WEEKEND in self._weekdays:
                return workday_sensor.state == STATE_OFF

        if workday_sensor and ATTR_WORKDAYS in workday_sensor.attributes:
            # workday sensor defines a list of workdays
            workday_list = workday_sensor.attributes[ATTR_WORKDAYS]
            weekend_list = [e for e in WEEKDAYS if e not in workday_list]
        else:
            # assume workdays are mon-fri
            workday_list = WEEKDAYS[0:5]
            weekend_list = WEEKDAYS[5:7]

        if const.DAY_TYPE_DAILY in self._weekdays or not len(self._weekdays):
            return True
        elif const.DAY_TYPE_WORKDAY in self._weekdays and day in workday_list:
            return True
        elif const.DAY_TYPE_WEEKEND in self._weekdays and day in weekend_list:
            return True
        return day in self._weekdays

    def calculate_timestamp(
        self,
        time_str,
        now: datetime.datetime = None,
        iteration: int = 0,
        reverse_direction: bool = False,
        dates: tuple = None,
    ) -> datetime.datetime:
        """calculate the next occurence of a time string

        `dates` is the (start, end) period the result must fall in; without it
        the schedule's own period is used.
        """
        if time_str is None:
            return None
        if now is None:
            now = dt_util.as_local(dt_util.utcnow())
        if dates is None:
            dates = (self._start_date, self._end_date)
        (start_date, end_date) = dates

        parsed = parse_anchor(time_str)
        if parsed is None:
            # fixed time
            time = dt_util.parse_time(time_str)
            ts = dt_util.find_next_time_expression_time(
                now, [time.second], [time.minute], [time.hour]
            )
        else:
            # relative to an anchor (sunrise/sunset, or an entity publishing a time)
            (anchor, sign, offset_str) = parsed
            resolved = self.resolve_anchor(anchor, now)
            if not resolved:
                return None
            ts = resolved.timestamp.replace(second=0, microsecond=0)
            operand = dt_util.parse_time(offset_str)

            if sign == const.DAY_ANCHOR:
                # the anchor decides the day, the operand decides the time of
                # day: 06:30 on the morning Shabbat ends, whichever day that is
                if not resolved.dated:
                    _LOGGER.warning(
                        "Anchor {} of schedule {} publishes a time of day, so it "
                        "cannot decide a date for '{}'".format(
                            anchor, self.id, time_str
                        )
                    )
                    return None
                ts = ts.replace(
                    hour=operand.hour,
                    minute=operand.minute,
                    second=operand.second,
                    microsecond=0,
                )
                return self.apply_date_restrictions(ts, dates)

            offset = datetime.timedelta(
                hours=operand.hour, minutes=operand.minute, seconds=operand.second
            )

            if resolved.dated:
                # the anchor names the day as well as the time, so the offset
                # may cross midnight - which is the whole point for a band that
                # runs from Friday evening into Saturday night.
                ts = ts - offset if sign == "-" else ts + offset
                return self.apply_date_restrictions(ts, dates)

            time_anchor = datetime.timedelta(
                hours=ts.hour, minutes=ts.minute, seconds=ts.second
            )
            if sign == "-":
                if (time_anchor - offset).total_seconds() >= 0:
                    ts = ts - offset
                else:
                    # prevent offset to shift the time past the extends of the day
                    ts = ts.replace(hour=0, minute=0, second=0)
            else:
                if (time_anchor + offset).total_seconds() <= 86340:
                    ts = ts + offset
                else:
                    # prevent offset to shift the time past the extends of the day
                    ts = ts.replace(hour=23, minute=59, second=0)
            ts = dt_util.find_next_time_expression_time(
                now, [ts.second], [ts.minute], [ts.hour]
            )

        time_delta = datetime.timedelta(seconds=1)

        if self.day_in_weekdays(ts) and (
            (ts - now).total_seconds() > 0 or iteration > 0
        ):

            if start_date and days_until_date(start_date, ts) > 0:
                # start date is in the future, jump to start date
                end_of_day = ts.replace(hour=0, minute=0, second=0, microsecond=0) + datetime.timedelta(days=1)
                days_delta = days_until_date(start_date, end_of_day)
                if days_delta:
                    time_delta = datetime.timedelta(days=days_delta)

            elif end_date and days_until_date(end_date, ts) < 0:
                # end date is in the past, jump to end date
                time_delta = datetime.timedelta(
                    days=days_until_date(end_date, ts)
                )
                reverse_direction = True

            else:
                # date restrictions are met
                return ts
        elif reverse_direction:
            time_delta = datetime.timedelta(days=-1)

        # calculate next timestamp
        next_day = dt_util.find_next_time_expression_time(
            now + time_delta, [0], [0], [0]
        )
        if iteration > 15:
            _LOGGER.warning(
                "failed to calculate next timeslot for schedule {}".format(self.id)
            )
            return None
        return self.calculate_timestamp(
            time_str, next_day, iteration + 1, reverse_direction, dates
        )

    def apply_date_restrictions(self, ts: datetime.datetime, dates: tuple = None):
        """drop a timestamp that falls outside the applicable date range"""
        if dates is None:
            dates = (self._start_date, self._end_date)
        (start_date, end_date) = dates
        if start_date and days_until_date(start_date, ts) > 0:
            return None
        if end_date and days_until_date(end_date, ts) < 0:
            return None
        return ts

    def resolve_anchor(self, anchor: str, now: datetime.datetime) -> AnchorTime:
        """resolve an anchor to a moment, or None if it is unavailable.

        `dated` says whether the anchor decided the day too. A sun event or a
        bare "HH:MM" only gives a time of day, and the caller has to find the
        next occurrence of it. A timestamp names an exact moment - which is how
        an anchor can land on Yom Tov, a day no weekday rule can express.
        """
        if anchor in [const.SUN_EVENT_SUNRISE, const.SUN_EVENT_SUNSET]:
            sun = self.hass.states.get(const.SUN_ENTITY)
            if not sun:
                return None
            attribute = (
                ATTR_NEXT_RISING
                if anchor == const.SUN_EVENT_SUNRISE
                else ATTR_NEXT_SETTING
            )
            if attribute not in sun.attributes:
                return None
            ts = dt_util.parse_datetime(sun.attributes[attribute])
            return AnchorTime(dt_util.as_local(ts), False) if ts else None

        state = self.hass.states.get(anchor)
        if not state or state.state in [STATE_UNKNOWN, STATE_UNAVAILABLE]:
            _LOGGER.debug(
                "Anchor entity {} of schedule {} is not available".format(
                    anchor, self.id
                )
            )
            return None

        # timestamp sensors (device_class: timestamp) publish an ISO datetime
        ts = dt_util.parse_datetime(state.state)
        if ts is not None:
            return AnchorTime(dt_util.as_local(ts), True)

        # template sensors commonly publish a bare time instead
        time = dt_util.parse_time(state.state)
        if time is not None:
            return AnchorTime(
                now.replace(
                    hour=time.hour,
                    minute=time.minute,
                    second=time.second,
                    microsecond=0,
                ),
                False,
            )

        _LOGGER.warning(
            "Anchor entity {} of schedule {} has state '{}', which is neither a "
            "timestamp nor a time".format(anchor, self.id, state.state)
        )
        return None

    def compute_slot_starts(self, now: datetime.datetime = None):
        """the next start of every timeslot, index-aligned with the timeslots"""
        if now is None:
            now = dt_util.as_local(dt_util.utcnow())
        return [
            self.calculate_timestamp(
                slot[const.ATTR_START], now, dates=self.slot_dates(index)
            )
            for (index, slot) in enumerate(self._timeslots)
        ]

    def next_timeslot(self, slots: list = None, timestamps: list = None):
        """calculate the closest timeslot from now

        `slots` narrows the search to one track's slots; without it the whole
        schedule is considered, which is also what refreshes the ordering the
        frontend reads.
        """
        now = dt_util.as_local(dt_util.utcnow())
        if timestamps is None:
            timestamps = self.compute_slot_starts(now)

        candidates = range(len(timestamps)) if slots is None else slots

        # timeslots that cannot be computed take no part in the ordering
        remaining = {
            i: abs((timestamps[i] - now).total_seconds())
            for i in candidates
            if timestamps[i] is not None
        }
        slot_order = sorted(remaining, key=lambda k: remaining[k])

        if slots is None:
            # timestamps stays index-aligned with the timeslots, so that
            # timestamps[slot_queue[0]] is that slot's own moment even when
            # another slot has an anchor that cannot be resolved yet
            self.slot_queue = slot_order
            self.timestamps = timestamps

        next_slot = slot_order[0] if len(slot_order) > 0 else None

        return (next_slot, timestamps[next_slot] if next_slot is not None else None)

    def current_timeslots(self, now: datetime.datetime = None):
        """the slot each track is overlapping at a moment, keyed by track"""
        return {
            track: self.current_timeslot(now, slots=slots)
            for (track, slots) in self._track_slots.items()
        }

    def current_timeslot(self, now: datetime.datetime = None, slots: list = None):
        """calculate the end of the timeslot that is overlapping now

        `slots` narrows the search to one track's slots. Tracks partition the
        day separately, so each of them can have a slot overlapping now.
        """
        if now is None:
            now = dt_util.as_local(dt_util.utcnow())

        def unwrap_end_of_day(time_str: str):
            if time_str == "00:00:00":
                return "23:59:59"
            else:
                return time_str

        candidates = (
            list(range(len(self._timeslots))) if slots is None else list(slots)
        )
        if not candidates:
            return (None, None)

        # calculate next stop of the timeslots under consideration
        timestamps = {}
        for i in candidates:
            slot = self._timeslots[i]
            dates = self.slot_dates(i)
            if slot[const.ATTR_STOP] is not None:
                timestamps[i] = self.calculate_timestamp(
                    unwrap_end_of_day(slot[const.ATTR_STOP]), now, dates=dates
                )
            else:
                ts = self.calculate_timestamp(
                    slot[const.ATTR_START], now, dates=dates
                )
                if ts is None:
                    timestamps[i] = None
                else:
                    ts = ts + datetime.timedelta(minutes=1)
                    timestamps[i] = self.calculate_timestamp(
                        ts.strftime("%H:%M:%S"), now, dates=dates
                    )

        # calculate timeslot that will end soonest
        remaining = [
            (
                i,
                (timestamps[i] - now).total_seconds()
                if timestamps[i] is not None
                else now.timestamp(),
            )
            for i in candidates
        ]
        (next_slot_end, val) = sorted(
            remaining, key=lambda i: (i[1] < 0, abs(i[1]))
        )[0]

        stop = timestamps[next_slot_end]
        if stop is not None:
            # calculate last start of timeslot that will end soonest
            if (stop - now).total_seconds() < 0:
                # end of timeslot is in the past
                return (None, None)

            start = self.calculate_timestamp(
                self._timeslots[next_slot_end][const.ATTR_START],
                stop - datetime.timedelta(days=1),
                dates=self.slot_dates(next_slot_end),
            )

            if start is not None:
                elapsed = (now - start).total_seconds()
                if elapsed > 0:
                    # timeslot is currently overlapping
                    return (
                        next_slot_end,
                        stop
                        if self._timeslots[next_slot_end][const.ATTR_STOP] is not None
                        else None,
                    )
        return (None, None)
