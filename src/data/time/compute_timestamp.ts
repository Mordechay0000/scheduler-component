import { Time, TimeMode } from "../../types";
import { parseTimeString } from "./parse_time_string";
import { addTimeOffset } from "./add_time_offset";
import { HomeAssistant } from "../../lib/types";


export const computeTimestamp = (time: Time | string, hass: HomeAssistant) => {
  if (typeof time == 'string') {
    time = parseTimeString(time);
  }

  if (time.mode == TimeMode.Fixed || time.mode == TimeMode.EntityDay) {
    // a day-anchored time keeps its own hours and minutes - only its date
    // comes from the entity, and the bar does not draw dates
    return time.hours * 3600 + time.minutes * 60;
  }
  else if (time.mode == TimeMode.Sunrise) {
    const ts_reference = parseTimeString(hass.states['sun.sun'].attributes['next_rising']);
    const ts = addTimeOffset(ts_reference, time);
    return ts.hours * 3600 + ts.minutes * 60;
  }
  else if (time.mode == TimeMode.Entity) {
    const state = time.entity_id ? hass.states[time.entity_id]?.state : undefined;
    if (!state || state == 'unavailable' || state == 'unknown') {
      // the anchor has not published a time yet; the engine will re-read it at
      // trigger time, so the bar only needs somewhere sane to draw the slot
      return Math.max(0, time.hours * 3600 + time.minutes * 60);
    }
    const ts = addTimeOffset(parseTimeString(state), time);
    return ts.hours * 3600 + ts.minutes * 60;
  }
  else {
    const ts_reference = parseTimeString(hass.states['sun.sun'].attributes['next_setting']);
    const ts = addTimeOffset(ts_reference, time);
    return ts.hours * 3600 + ts.minutes * 60;
  }
};
