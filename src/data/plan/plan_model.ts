import { Action, Schedule, TConditionLogicType, TRepeatType, TWeekday, Timeslot } from "../../types";

/**
 * A plan is one schedule, not a pile of them.
 *
 * Everything that makes a plan a plan lives in the engine now: slots on
 * different tracks keep their own partition, so each group of devices has its
 * own row of stretches and a boundary drawn for one of them leaves the others
 * where they were. A device that needs its own hours gets a track of its own
 * with a higher priority - while that track is running it owns the device, and
 * the group leaves it alone until it ends.
 *
 * So there is nothing to compile. A plan reads back out of the schedule it was
 * saved as, which is why the editor can be opened on a plan somebody else (or
 * something else - a service call, a model over MCP) wrote.
 */

export const PLAN_TAG = 'shabbat-plan';
export const GROUP_PREFIX = 'group:';
export const DETACH_PREFIX = 'detach:';

/** the priority a detach needs to take a device off its group */
export const DETACH_PRIORITY = 1;

export const DEFAULT_START_ANCHOR = 'sensor.jewish_calendar_upcoming_candle_lighting';
export const DEFAULT_END_ANCHOR = 'sensor.jewish_calendar_upcoming_havdalah';

export interface PlanCube {
  id: string;
  name: string;
  start: string;
  stop: string;
  /**
   * The devices this stretch acts on, each with its own action.
   *
   * A stretch has no state of its own. A device missing from here is one the
   * stretch does not touch at all: not switched, not held to anything, not
   * retried. It keeps whatever it had, and any other schedule may drive it.
   */
  devices: Record<string, Action>;
  /** an explicit colour; without one the actions decide how it is drawn */
  color?: string;
  /** put these devices back if something else moves them during this stretch */
  enforce?: boolean;
  /**
   * What a newly added device should do here, until it is set by hand.
   *
   * Editor-only and never saved: a stretch is its devices, but a template has
   * no devices yet, and a group's members have to land somewhere sensible when
   * they are first picked.
   */
  suggestOn?: boolean;
}

export interface PlanGroup {
  track: string;
  name: string;
  entities: string[];
  cubes: PlanCube[];
}

export interface PlanDetach {
  track: string;
  name: string;
  entity: string;
  start: string;
  stop: string;
  action: Action;
  /** set on a one-off, so the exception stops coming back after its day */
  start_date?: string;
  end_date?: string;
}

export interface Plan {
  name: string;
  startAnchor: string;
  endAnchor: string;
  groups: PlanGroup[];
  detaches: PlanDetach[];
}

export const groupTrack = (name: string) => `${GROUP_PREFIX}${name}`;
export const detachTrack = (entity: string) => `${DETACH_PREFIX}${entity}`;

const emptyConditions = () => ({
  type: TConditionLogicType.Or,
  items: [],
  track_changes: false,
});

const targetsOf = (slot: Timeslot): string[] =>
  slot.actions
    .flatMap(action => [action.target?.entity_id || []].flat())
    .filter((e, i, arr) => e && arr.indexOf(e) === i);

const withTargets = (action: Action, entities: string[]): Action => ({
  ...action,
  target: { entity_id: entities },
});

/** what a stretch asks of a device, or undefined if it asks nothing */
export const cubeActionFor = (cube: PlanCube, device: string): Action | undefined =>
  cube.devices?.[device];

export const cubeTouches = (cube: PlanCube, device: string) =>
  Boolean(cube.devices && device in cube.devices);

/** the plain on/off action a device would get */
export const plainAction = (device: string, on: boolean): Action => ({
  service: `${device.split('.')[0]}.turn_${on ? 'on' : 'off'}`,
  service_data: {},
});

/** every device a stretch names, read out of its stored actions */
const devicesOf = (actions: Action[]): Record<string, Action> => {
  const out: Record<string, Action> = {};
  actions.forEach(action => {
    [action.target?.entity_id || []].flat().forEach(entity => {
      if (entity) out[entity] = { ...action, target: undefined };
    });
  });
  return out;
};

/** the anchor an anchored time is measured against, if it has one */
export const anchorEntityOf = (time?: string): string | undefined => {
  const match = (time || '').match(/^([a-z_]+\.[a-z0-9_]+)[-+@]/);
  return match ? match[1] : undefined;
};

export const planFromSchedule = (schedule?: Schedule): Plan => {
  const slots = (schedule?.entries?.[0]?.slots || []).filter(e => e.actions.length);

  const byTrack = new Map<string, Timeslot[]>();
  slots.forEach(slot => {
    const track = slot.track || groupTrack('');
    if (!byTrack.has(track)) byTrack.set(track, []);
    byTrack.get(track)!.push(slot);
  });

  const groups: PlanGroup[] = [];
  const detaches: PlanDetach[] = [];

  byTrack.forEach((trackSlots, track) => {
    if (track.startsWith(DETACH_PREFIX)) {
      const entity = track.slice(DETACH_PREFIX.length);
      trackSlots.forEach((slot, index) => {
        detaches.push({
          track,
          name: slot.name || '',
          entity,
          start: slot.start,
          stop: slot.stop || slot.start,
          action: slot.actions[0],
          start_date: slot.start_date,
          end_date: slot.end_date,
        });
        if (index) {
          // more than one stretch on the same device: each is its own row
          detaches[detaches.length - 1].track = `${track}#${index}`;
        }
      });
      return;
    }
    groups.push({
      track,
      name: track.startsWith(GROUP_PREFIX) ? track.slice(GROUP_PREFIX.length) : track,
      entities: [...new Set(trackSlots.flatMap(targetsOf))],
      cubes: trackSlots.map((slot, index) => ({
        id: `${track}#${index}`,
        name: slot.name || '',
        start: slot.start,
        stop: slot.stop || slot.start,
        color: slot.color,
        enforce: slot.enforce,
        devices: devicesOf(slot.actions),
      })),
    });
  });

  const firstCube = groups[0]?.cubes[0];
  const lastCube = groups[0]?.cubes[groups[0].cubes.length - 1];

  return {
    name: schedule?.name || '',
    startAnchor: anchorEntityOf(firstCube?.start) || DEFAULT_START_ANCHOR,
    endAnchor: anchorEntityOf(lastCube?.stop) || DEFAULT_END_ANCHOR,
    groups,
    detaches,
  };
};

export const planToSchedule = (plan: Plan, base: Schedule): Schedule => {
  const slots: Timeslot[] = [];

  plan.groups.forEach(group => {
    group.cubes.forEach(cube => {
      slots.push(<Timeslot>{
        start: cube.start,
        stop: cube.stop,
        name: cube.name || undefined,
        color: cube.color,
        enforce: cube.enforce,
        track: group.track,
        priority: 0,
        // one action per device the stretch names, and none at all for the
        // ones it deliberately leaves alone
        actions: group.entities
          .filter(device => cubeTouches(cube, device))
          .map(device => withTargets(cube.devices[device], [device])),
        conditions: emptyConditions(),
      });
    });
  });

  plan.detaches.forEach(detach => {
    slots.push(<Timeslot>{
      start: detach.start,
      stop: detach.stop,
      name: detach.name || undefined,
      // "#1", "#2" keep a second stretch on the same device on its own row in
      // the editor, but the engine only needs them to be different tracks
      track: detach.track,
      priority: DETACH_PRIORITY,
      start_date: detach.start_date,
      end_date: detach.end_date,
      actions: [withTargets(detach.action, [detach.entity])],
      conditions: emptyConditions(),
    });
  });

  return {
    ...base,
    name: plan.name,
    repeat_type: TRepeatType.Repeat,
    // the anchors decide the day, festivals included, which is exactly what no
    // weekday rule can do
    entries: [{ weekdays: [TWeekday.Daily], slots }],
    tags: [...new Set([...(base.tags || []), PLAN_TAG])],
  };
};

/** whether a schedule is a plan rather than an ordinary schedule */
export const isPlan = (schedule: { tags?: string[] }) =>
  (schedule.tags || []).includes(PLAN_TAG);

/**
 * A Shabbat plan holds its state by default.
 *
 * That is the whole point of one: a switch pressed out of habit, or an
 * automation that does not know it is Shabbat, should not leave a device wrong
 * until the morning. An ordinary schedule does not do this unless asked.
 */
export const HOLDS_BY_DEFAULT = true;

/**
 * The plan the artwork describes: one band from candle lighting to havdalah,
 * cut into named stretches. The interior boundaries are ordinary clock times
 * tied to the day of the anchor they sit next to, so they stay inside the band
 * on a festival as readily as on a Saturday.
 */
export const defaultPlan = (name: string, cubeNames: string[]): Plan => {
  const start = DEFAULT_START_ANCHOR;
  const end = DEFAULT_END_ANCHOR;

  return {
    name,
    startAnchor: start,
    endAnchor: end,
    groups: [
      {
        track: groupTrack(cubeNames[5] || 'group'),
        name: cubeNames[5] || 'group',
        entities: [],
        cubes: [
          { id: 'c0', name: cubeNames[0], start: `${start}+00:00:00`, stop: `${start}@22:30:00`, devices: {}, enforce: HOLDS_BY_DEFAULT, suggestOn: true },
          { id: 'c1', name: cubeNames[1], start: `${start}@22:30:00`, stop: `${end}@06:30:00`, devices: {}, enforce: HOLDS_BY_DEFAULT, suggestOn: false },
          { id: 'c2', name: cubeNames[2], start: `${end}@06:30:00`, stop: `${end}@13:00:00`, devices: {}, enforce: HOLDS_BY_DEFAULT, suggestOn: true },
          { id: 'c3', name: cubeNames[3], start: `${end}@13:00:00`, stop: `${end}-00:30:00`, devices: {}, enforce: HOLDS_BY_DEFAULT, suggestOn: false },
          { id: 'c4', name: cubeNames[4], start: `${end}-00:30:00`, stop: `${end}+01:30:00`, devices: {}, enforce: HOLDS_BY_DEFAULT, suggestOn: true },
        ],
      },
    ],
    detaches: [],
  };
};
