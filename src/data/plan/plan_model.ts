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
  /** what most of the group's devices do in this stretch */
  action: Action;
  /**
   * One device doing something else, here, without the timeline being copied
   * for it: the group's lights on while its hotplate stays off.
   */
  overrides?: Record<string, Action>;
  /** an explicit colour; without one the action decides how it is drawn */
  color?: string;
  /** put the devices back if something else moves them during this stretch */
  enforce?: boolean;
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

/** what one device is asked to do, so two of them can be compared */
const actionKey = (action?: Action) =>
  action ? `${action.service}|${JSON.stringify(action.service_data || {})}` : '';

/** the action a device gets in a stretch: its own if it has one, else the group's */
export const cubeActionFor = (cube: PlanCube, device: string): Action =>
  cube.overrides?.[device] || cube.action;

/**
 * Split a stretch's actions into "what the group does" and "who differs".
 *
 * Whatever most devices are doing is the stretch's own state; anything else is
 * that device's override. This is what lets one device differ inside a stretch
 * without the whole timeline being duplicated for it.
 */
const splitActions = (actions: Action[]) => {
  const perDevice = new Map<string, Action>();
  actions.forEach(action => {
    [action.target?.entity_id || []].flat().forEach(entity => {
      if (entity) perDevice.set(entity, { ...action, target: { entity_id: entity } });
    });
  });

  const tally = new Map<string, number>();
  perDevice.forEach(action => tally.set(actionKey(action), (tally.get(actionKey(action)) || 0) + 1));

  let winner = '';
  let best = -1;
  tally.forEach((count, key) => {
    if (count > best) {
      best = count;
      winner = key;
    }
  });

  const common = [...perDevice.values()].find(a => actionKey(a) == winner) || actions[0];
  const overrides: Record<string, Action> = {};
  perDevice.forEach((action, device) => {
    if (actionKey(action) != winner) overrides[device] = { ...action, target: undefined };
  });

  return { action: { ...common, target: undefined } as Action, overrides };
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
        ...splitActions(slot.actions),
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
        // one action per device, so a device can differ inside the stretch
        // without the stretch being copied for it
        actions: group.entities.map(device =>
          withTargets(cubeActionFor(cube, device), [device])
        ),
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

const onAction = (domain: string): Action => ({
  service: `${domain}.turn_on`,
  service_data: {},
});

const offAction = (domain: string): Action => ({
  service: `${domain}.turn_off`,
  service_data: {},
});

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
          { id: 'c0', name: cubeNames[0], start: `${start}+00:00:00`, stop: `${start}@22:30:00`, action: onAction('switch') },
          { id: 'c1', name: cubeNames[1], start: `${start}@22:30:00`, stop: `${end}@06:30:00`, action: offAction('switch') },
          { id: 'c2', name: cubeNames[2], start: `${end}@06:30:00`, stop: `${end}@13:00:00`, action: onAction('switch') },
          { id: 'c3', name: cubeNames[3], start: `${end}@13:00:00`, stop: `${end}-00:30:00`, action: offAction('switch') },
          { id: 'c4', name: cubeNames[4], start: `${end}-00:30:00`, stop: `${end}+01:30:00`, action: onAction('switch') },
        ],
      },
    ],
    detaches: [],
  };
};
