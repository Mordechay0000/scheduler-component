import { TimeMode } from "../../types";

/**
 * Two questions get asked about a time mode, and they are not the same one.
 *
 * "Is it an offset?" decides whether the number the user types is a distance
 * from something else (which may be negative, and may exceed a day) or a
 * reading on the clock. Sunrise, sunset and an entity that publishes a time
 * all behave the same way here.
 *
 * "Does it name a moment on its own?" decides whether the card can place it on
 * the bar without asking Home Assistant for anything. A clock time can; so can
 * a day-anchored time, whose hours and minutes are literal - only its date
 * comes from elsewhere, and the bar does not draw dates.
 */

export const isOffsetMode = (mode: TimeMode) =>
  mode == TimeMode.Sunrise || mode == TimeMode.Sunset || mode == TimeMode.Entity;

export const isClockMode = (mode: TimeMode) =>
  mode == TimeMode.Fixed || mode == TimeMode.EntityDay;

export const isEntityMode = (mode: TimeMode) =>
  mode == TimeMode.Entity || mode == TimeMode.EntityDay;

/** the anchor half of a time, e.g. "sunset" or "sensor.havdalah" */
export const anchorOf = (mode: TimeMode, entity_id?: string) => {
  if (mode == TimeMode.Sunrise) return 'sunrise';
  if (mode == TimeMode.Sunset) return 'sunset';
  return entity_id;
};
