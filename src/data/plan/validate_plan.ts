import { HomeAssistant } from "../../lib/types";
import { Action } from "../../types";
import { isDeviceToSchedule } from "../../lib/entity";
import { Plan } from "./plan_model";
import { resolveBoundary } from "./resolve_boundary";

/**
 * Everything the editor will not let you do, checked once more on the way out.
 *
 * The interface already prevents all of this: the picker offers only devices
 * that can be switched, a stretch is asked only where it ends so its start is
 * the one before it, and a parameter is a slider between two numbers. But a
 * plan can also arrive from somewhere else - a model over MCP, a hand-edited
 * storage file, an older version of this card, an undo that landed oddly - and
 * a plan that breaks one of these rules does not fail loudly on Shabbat. It
 * fails quietly, on one device, in the middle of the night.
 *
 * So the rules are written down once, here, and checked at the moment of
 * saving rather than trusted to the screen that was on display at the time.
 */

/** what to say, in a form the dialog can translate */
export interface PlanProblem {
  key: string;
  values?: Record<string, string>;
}

const RANGES: Record<string, [number, number]> = {
  brightness_pct: [1, 100],
  color_temp_kelvin: [1500, 8000],
  temperature: [5, 35],
  target_temp_low: [5, 35],
  target_temp_high: [5, 35],
};

const name = (hass: HomeAssistant, entity: string) =>
  hass.states[entity]?.attributes.friendly_name || entity;

const parameterProblems = (
  hass: HomeAssistant,
  where: string,
  entity: string,
  action: Action
): PlanProblem[] => {
  const data = action.service_data || {};
  const out: PlanProblem[] = [];
  Object.entries(RANGES).forEach(([field, [low, high]]) => {
    const value = (data as Record<string, any>)[field];
    if (value === undefined || value === null) return;
    if (typeof value != 'number' || Number.isNaN(value) || value < low || value > high) {
      out.push({
        key: 'check.parameter',
        values: {
          where,
          device: name(hass, entity),
          value: String(value),
          low: String(low),
          high: String(high),
        },
      });
    }
  });
  return out;
};

/**
 * Read a plan the way the engine will, and say what would not hold.
 *
 * Returns an empty list for a plan that is fine. Everything it reports is a
 * refusal, not a caution - the cautions (a clock time that may fall outside
 * the band one week in the year) belong to the wizard, and never stop a save.
 */
export const validatePlan = (plan: Plan, hass: HomeAssistant): PlanProblem[] => {
  const problems: PlanProblem[] = [];
  const seen = new Map<string, string>();
  const at = (value: string) => resolveBoundary(value, hass) || null;

  plan.groups.forEach(group => {
    if (!group.entities.length) {
      problems.push({ key: 'check.empty_group', values: { group: group.name } });
    }

    group.entities.forEach(entity => {
      if (!hass.states[entity]) {
        problems.push({ key: 'check.unknown_device', values: { device: entity } });
      } else if (!isDeviceToSchedule(entity, hass)) {
        // a temperature reading, a child lock, one of the scheduler's own
        // switches: the picker never offers these, and switching them either
        // does nothing or feeds the scheduler back into itself
        problems.push({ key: 'check.not_a_device', values: { device: name(hass, entity) } });
      }
      const already = seen.get(entity);
      if (already && already != group.name) {
        problems.push({
          key: 'check.two_groups',
          values: { device: name(hass, entity), a: already, b: group.name },
        });
      }
      seen.set(entity, group.name);
    });

    group.cubes.forEach((cube, index) => {
      const where = cube.name || `#${index + 1}`;

      Object.entries(cube.devices || {}).forEach(([entity, action]) => {
        if (!group.entities.includes(entity)) {
          problems.push({
            key: 'check.stranger',
            values: { where, device: name(hass, entity), group: group.name },
          });
        }
        if (!action?.service) {
          problems.push({ key: 'check.no_action', values: { where, device: name(hass, entity) } });
          return;
        }
        problems.push(...parameterProblems(hass, where, entity, action));
      });

      const next = group.cubes[index + 1];
      if (next && cube.stop != next.start) {
        // the editor moves the next start whenever an end moves, so these can
        // only disagree in a plan that did not come from it - and a gap means
        // nothing is set for that time at all
        problems.push({
          key: 'check.gap',
          values: { where, next: next.name || `#${index + 2}` },
        });
      }

      const from = at(cube.start);
      const to = at(cube.stop);
      if (from && to && to.getTime() <= from.getTime()) {
        problems.push({ key: 'check.backwards', values: { where } });
      }
    });
  });

  // a device with hours of its own need not be in a group: that is unusual and
  // the wizard never builds it, but it runs correctly and refusing it here
  // would lock somebody out of a plan they already have
  plan.detaches.forEach(detach => {
    const from = at(detach.start);
    const to = at(detach.stop);
    if (from && to && to.getTime() <= from.getTime()) {
      problems.push({
        key: 'check.backwards',
        values: { where: detach.name || name(hass, detach.entity) },
      });
    }
    if (detach.action) {
      problems.push(
        ...parameterProblems(
          hass,
          detach.name || name(hass, detach.entity),
          detach.entity,
          detach.action
        )
      );
    }
  });

  // the same thing said twice is still one thing to fix
  const unique: PlanProblem[] = [];
  problems.forEach(problem => {
    const signature = JSON.stringify(problem);
    if (!unique.some(other => JSON.stringify(other) == signature)) unique.push(problem);
  });
  return unique;
};
