import { HomeAssistant } from "../../lib/types";
import { TimeMode } from "../../types";
import { parseTimeString } from "../time/parse_time_string";

const stateAsDate = (raw?: string): Date | null => {
  if (!raw) return null;
  const ts = new Date(raw);
  return isNaN(ts.valueOf()) ? null : ts;
};

/**
 * The moment a plan boundary lands on, or null while its anchor has not
 * published anything yet.
 *
 * A plan is drawn against real dates, not a 24-hour clock: its band starts on
 * one evening and ends on another, and a boundary written as "06:30 on the day
 * the band ends" only has a position once that day is known. This resolves a
 * boundary the same way the engine does at trigger time, so what the editor
 * draws is what will actually happen.
 */
export const resolveBoundary = (
  time: string,
  hass: HomeAssistant,
  fallbackDay?: Date
): Date | null => {
  const parsed = parseTimeString(time);
  const offsetMs = (parsed.hours * 3600 + parsed.minutes * 60) * 1000;

  switch (parsed.mode) {
    case TimeMode.EntityDay: {
      const day = stateAsDate(parsed.entity_id ? hass.states[parsed.entity_id]?.state : undefined);
      if (!day) return null;
      const out = new Date(day);
      out.setHours(parsed.hours, parsed.minutes, 0, 0);
      return out;
    }
    case TimeMode.Entity: {
      const base = stateAsDate(parsed.entity_id ? hass.states[parsed.entity_id]?.state : undefined);
      return base ? new Date(base.getTime() + offsetMs) : null;
    }
    case TimeMode.Sunrise:
    case TimeMode.Sunset: {
      const attribute = parsed.mode == TimeMode.Sunrise ? 'next_rising' : 'next_setting';
      const base = stateAsDate(hass.states['sun.sun']?.attributes[attribute]);
      return base ? new Date(base.getTime() + offsetMs) : null;
    }
    default: {
      // a plain clock time carries no date; inside a band it means the first
      // time that clock reading comes round after the band opens
      if (!fallbackDay) return null;
      const out = new Date(fallbackDay);
      out.setHours(parsed.hours, parsed.minutes, 0, 0);
      if (out.getTime() < fallbackDay.getTime()) out.setDate(out.getDate() + 1);
      return out;
    }
  }
};
