import { HomeAssistant } from "../../lib/types";
import { Action } from "../../types";
import { isOffAction } from "../format/is_off_action";
import { Plan, PlanCube, cubeActionFor } from "./plan_model";
import { resolveBoundary } from "./resolve_boundary";

export type ReportDevice = {
  entity_id: string;
  name: string;
  /** 'untouched' means the stretch does not act on this device at all */
  state: 'on' | 'off' | 'untouched';
  brightness?: number;
  kelvin?: number;
  degrees?: number;
  /** whether the stretch says anything about this device at all */
  own: boolean;
  /** an exception that takes this device over for part of the stretch */
  takenOverBy?: string;
};

export type ReportStretch = {
  key: string;
  group: string;
  name: string;
  from: Date | null;
  to: Date | null;
  holds: boolean;
  devices: ReportDevice[];
};

export type PlanReport = {
  opens: Date | null;
  closes: Date | null;
  stretches: ReportStretch[];
  problems: string[];
};

const parameters = (action: Action) => {
  const data = action.service_data || {};
  const brightness = data.brightness_pct ?? (
    data.brightness !== undefined ? Math.round((data.brightness / 255) * 100) : undefined
  );
  return { brightness, kelvin: data.color_temp_kelvin, degrees: data.temperature };
};

/**
 * The plan read back as what it will actually do.
 *
 * Writing a plan is easy and checking one is not: what a device does at four in
 * the afternoon is spread across a group's stretch, an override inside it, and
 * possibly an exception on top of that. This walks all three and puts them in
 * one list, in the order they happen, so it can be read before Shabbat rather
 * than discovered during it.
 */
export const describePlan = (plan: Plan, hass: HomeAssistant): PlanReport => {
  const opens = resolveBoundary(`${plan.startAnchor}+00:00:00`, hass);
  const closes = resolveBoundary(`${plan.endAnchor}+01:30:00`, hass);
  const at = (value: string) => resolveBoundary(value, hass, opens || undefined);

  const problems: string[] = [];
  const stretches: ReportStretch[] = [];

  const nameOf = (entity: string) =>
    hass.states[entity]?.attributes.friendly_name || entity;

  plan.groups.forEach(group => {
    if (!group.entities.length) problems.push(group.name);

    group.cubes.forEach((cube: PlanCube, index) => {
      const from = at(cube.start);
      const to = at(cube.stop);

      stretches.push({
        key: cube.id,
        group: group.name,
        name: cube.name || `#${index + 1}`,
        from,
        to,
        holds: Boolean(cube.enforce),
        devices: group.entities.map(entity => {
          const action = cubeActionFor(cube, entity);
          if (!action) {
            // not named by this stretch: kept as it was, not held, not retried
            return {
              entity_id: entity,
              name: nameOf(entity),
              state: 'untouched',
              own: false,
            } as ReportDevice;
          }
          const { brightness, kelvin, degrees } = parameters(action);
          const covering = plan.detaches.find(detach => {
            if (detach.entity != entity) return false;
            const start = at(detach.start);
            return Boolean(start && from && to && start >= from && start < to);
          });
          return {
            entity_id: entity,
            name: nameOf(entity),
            state: isOffAction(action) ? 'off' : 'on',
            ...(entity.split('.')[0] == 'light' ? { brightness, kelvin } : {}),
            ...(entity.split('.')[0] == 'climate' ? { degrees } : {}),
            own: true,
            ...(covering ? { takenOverBy: covering.name } : {}),
          } as ReportDevice;
        }),
      });
    });
  });

  plan.detaches.forEach(detach => {
    const action = detach.action;
    const { brightness, kelvin, degrees } = parameters(action);
    stretches.push({
      key: detach.track,
      group: nameOf(detach.entity),
      name: detach.name,
      from: at(detach.start),
      to: at(detach.stop),
      holds: false,
      devices: [{
        entity_id: detach.entity,
        name: nameOf(detach.entity),
        state: isOffAction(action) ? 'off' : 'on',
        ...(detach.entity.split('.')[0] == 'light' ? { brightness, kelvin } : {}),
        ...(detach.entity.split('.')[0] == 'climate' ? { degrees } : {}),
        own: true,
      }],
    });
  });

  // in the order they happen, so the report reads as a day rather than as a
  // list of rows
  stretches.sort((a, b) => (a.from?.getTime() || 0) - (b.from?.getTime() || 0));

  return { opens, closes, stretches, problems };
};
