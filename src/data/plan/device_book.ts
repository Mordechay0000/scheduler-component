import { HomeAssistant } from "../../lib/types";

export type BookDevice = {
  entity_id: string;
  name: string;
  alias: string | null;
  kind: string;
  groups: string[];
};

export type DeviceBook = {
  groups: { name: string; devices: string[] }[];
  devices: BookDevice[];
  kinds: string[];
};

export const EMPTY_BOOK: DeviceBook = { groups: [], devices: [], kinds: [] };

/**
 * The household's own names and groupings.
 *
 * Groups are Home Assistant labels and names are its entity aliases, so both
 * are real everywhere in Home Assistant rather than only inside a schedule -
 * a name given here also works when speaking to Assist. Only the corrected
 * kind is the scheduler's own, because a device registered under the wrong
 * domain is a scheduler-specific problem.
 */
export const fetchDeviceBook = (hass: HomeAssistant): Promise<DeviceBook> =>
  hass.callWS({ type: 'scheduler/device_book' });

export const setDeviceGroup = (hass: HomeAssistant, group: string, devices: string[]): Promise<DeviceBook> =>
  hass.callWS({ type: 'scheduler/device_book/group', group, devices });

export const nameDevice = (
  hass: HomeAssistant,
  entity_id: string,
  changes: { name?: string | null; kind?: string | null }
): Promise<DeviceBook> =>
  hass.callWS({ type: 'scheduler/device_book/device', entity_id, ...changes });

/** the entities a name stands for: a group's members, or one device */
export const devicesFor = (book: DeviceBook, name: string): string[] => {
  const group = book.groups.find(g => g.name == name);
  if (group) return group.devices;
  const device = book.devices.find(d => d.name == name || d.entity_id == name);
  return device ? [device.entity_id] : [];
};
