

export const computeEntity = (entityId: string): string => entityId.split(".")[1] || "";

export const computeDomain = (entityId: string): string => entityId.split(".")[0] || "";

export const friendlyName = (entityId: string, attributes?: { [key: string]: any }): string =>
  attributes?.friendly_name === undefined
    ? computeEntity(entityId).replace(/_/g, " ")
    : (attributes?.friendly_name ?? "").toString();

/** the domains a schedule can switch on and off */
export const SCHEDULABLE_DOMAINS = ['light', 'switch', 'fan', 'climate', 'input_boolean', 'media_player'];

/**
 * Is this the device itself - the thing a person would point at and switch?
 *
 * One air conditioner arrives with a crowd of entities: the unit, a child lock,
 * a firmware version, a temperature reading. Only the first is a device as far
 * as a household is concerned, and offering the rest only makes the real ones
 * harder to find. Home Assistant already marks the others, so that mark is what
 * is followed here.
 */
export const isDeviceToSchedule = (
  entityId: string,
  hass?: { entities?: { [id: string]: { entity_category?: string | null; hidden?: boolean; platform?: string } } }
): boolean => {
  if (!SCHEDULABLE_DOMAINS.includes(computeDomain(entityId))) return false;
  const entry = hass?.entities?.[entityId];
  if (!entry) return true;
  if (entry.entity_category) return false;
  if (entry.hidden) return false;
  if (entry.platform === 'scheduler') return false;
  return true;
};
