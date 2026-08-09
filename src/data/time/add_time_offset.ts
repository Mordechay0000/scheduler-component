import { Time } from "../../types";
import { isClockMode } from "./time_modes";



export const addTimeOffset = (time: Time, offsetTime: { hours?: number, minutes?: number }) => {
  let offsetHours = offsetTime.hours || 0;
  let offsetMinutes = offsetTime.minutes || 0;
  if (offsetHours < 0 || offsetMinutes < 0) {
    offsetHours = -Math.abs(offsetHours);
    offsetMinutes = -Math.abs(offsetMinutes);
  }

  let hours = time.hours;
  let minutes = time.minutes;

  if (hours < 0 && minutes > 0) minutes = -minutes;

  hours += offsetHours;
  minutes += offsetMinutes;

  if (minutes >= 60 || (minutes > 0 && hours < 0 && !isClockMode(time.mode))) {
    hours = hours + 1;
    minutes -= 60;
  }
  else if (minutes <= -60) {
    hours = hours - 1;
    minutes += 60;
  }
  else if ((minutes < 0 && isClockMode(time.mode)) || (minutes < 0 && hours > 0 && !isClockMode(time.mode))) {
    hours = hours - 1;
    minutes += 60;
  }
  if (hours < 0 && isClockMode(time.mode)) {
    hours += 24;
  }
  else if (hours >= 24 && isClockMode(time.mode)) {
    hours -= 24;
  }

  return <Time>{
    mode: time.mode,
    hours: hours,
    minutes: minutes,
    entity_id: time.entity_id
  };
}