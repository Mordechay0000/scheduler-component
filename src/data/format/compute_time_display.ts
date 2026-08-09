import { capitalizeFirstLetter } from "../../lib/capitalize_first_letter";
import { HomeAssistant } from "../../lib/types";
import { useAmPm } from "../../lib/use_am_pm";
import { hassLocalize } from "../../localize/hassLocalize";
import { localize } from "../../localize/localize";
import { Time, TimeMode } from "../../types";
import { parseTimeString } from "../time/parse_time_string";
import { isEntityMode } from "../time/time_modes";
import { timeToString } from "../time/time_to_string";

/** what the time is measured against: a sun event, or an entity's own name */
const anchorName = (input: Time, hass: HomeAssistant) => {
  if (isEntityMode(input.mode)) {
    const state = input.entity_id ? hass.states[input.entity_id] : undefined;
    return state?.attributes.friendly_name || input.entity_id || '';
  }
  let eventString =
    input.mode == TimeMode.Sunrise
      ? hassLocalize('ui.panel.config.automation.editor.conditions.type.sun.sunrise', hass)
      : hassLocalize('ui.panel.config.automation.editor.conditions.type.sun.sunset', hass);
  if (hass.language != 'de') eventString = eventString.toLowerCase();
  return eventString;
};

const formatRelativeTimeString = (input: Time, hass: HomeAssistant) => {
  const eventString = anchorName(input, hass);

  const offset = input.hours * 3600 + input.minutes * 60;
  if (Math.abs(offset) <= 60)
    return localize('ui.components.time.at_sun_event', hass, '{sunEvent}', eventString);

  let signString = offset < 0
    ? hassLocalize('ui.panel.config.automation.editor.conditions.type.sun.before', hass)
    : hassLocalize('ui.panel.config.automation.editor.conditions.type.sun.after', hass);
  signString = signString.replace(/[^a-z]/gi, '').toLowerCase();

  let timeString = timeToString(input, { seconds: false }).split(/\+|-/).pop();
  return `${timeString} ${signString} ${eventString}`;
};

/**
 * A day-anchored time reads as an ordinary clock time, because that is what it
 * is - the anchor only says which day it lands on.
 */
const formatDayAnchoredTimeString = (input: Time, hass: HomeAssistant, amPm: boolean) => {
  const timeString = timeToString(
    { ...input, mode: TimeMode.Fixed },
    { seconds: false, am_pm: amPm }
  );
  return localize(
    'ui.components.time.on_day_of',
    hass,
    ['{time}', '{anchor}'],
    [timeString, anchorName(input, hass)]
  );
};

const formatTime = (input: Time, hass: HomeAssistant, amPm: boolean) => {
  if (input.mode == TimeMode.Fixed) return timeToString(input, { am_pm: amPm });
  if (input.mode == TimeMode.EntityDay) return formatDayAnchoredTimeString(input, hass, amPm);
  return formatRelativeTimeString(input, hass);
};

export const computeTimeDisplay = (startTime: string, stopTime: string | undefined, hass: HomeAssistant) => {

  const amPmFormat = useAmPm(hass.locale);

  if (stopTime) {
    const startTimeString = formatTime(parseTimeString(startTime), hass, amPmFormat);
    const stopTimeString = formatTime(parseTimeString(stopTime), hass, amPmFormat);

    return capitalizeFirstLetter(localize('ui.components.time.interval', hass, ['{startTime}', '{endTime}'], [startTimeString, stopTimeString]));
  }
  else {
    const startTimeString = formatTime(parseTimeString(startTime), hass, amPmFormat);
    return capitalizeFirstLetter(localize('ui.components.time.absolute', hass, '{time}', startTimeString));
  }
}
