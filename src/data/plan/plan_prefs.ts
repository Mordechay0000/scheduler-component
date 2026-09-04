/**
 * What the editor remembers between plans.
 *
 * None of this belongs to a plan: it is how one household likes to work. The
 * times in particular - "the meal runs until five minutes after sunset", "the
 * night ends at eight, on the clock" - are the same every week, and typing
 * them again for every new plan is the kind of chore that makes a wizard feel
 * like a form.
 *
 * Kept in the browser rather than on the server, because it is a preference of
 * whoever is sitting here, and because a plan built from these defaults carries
 * the times themselves - so nothing is lost if the preferences are.
 */

/**
 * How a stretch says where it ends.
 *
 * Only the end, never the start: a stretch begins the moment the one before it
 * finished, so there is only ever one time to think about.
 *
 *   clock  - a reading on the clock, on whichever day the stretch is running
 *   sunset - so long before or after sunset, which moves through the year
 *   end    - so long before or after havdalah, at the close of the band
 */
export type EndKind = 'clock' | 'sunset' | 'end';

/** an end, written the way a person says it */
export interface EndTime {
  when: EndKind;
  /** a clock reading for 'clock'; a length of time for the other two */
  time: string;
  /** for 'sunset' and 'end': on which side of the anchor it falls */
  before?: boolean;
}

/**
 * One of the parts the wizard offers, with the time this household uses.
 *
 * A time, and nothing else. What the devices do in that part is never a
 * household default: one house wants the salon air conditioner on during the
 * meal and the bedrooms off, the next wants the opposite, and guessing on
 * their behalf is how a plan ends up wrong in a way nobody notices.
 */
export interface MomentDefault extends EndTime {
  key: string;
}

export interface PlanPrefs {
  /** unmistakable green/grey for on and off, rather than shades of the action */
  plainColours: boolean;
  moments: MomentDefault[];
}

/**
 * The day most households actually keep, as a starting point.
 *
 * The meal ends a while after sunset because that is when it ends; bedtime and
 * the morning are clock readings because that is how people say them; going
 * out is measured back from havdalah because havdalah is what it is waiting
 * for.
 */
export const DEFAULT_MOMENTS: MomentDefault[] = [
  { key: 'meal_eve', when: 'sunset', time: '01:30', before: false },
  { key: 'sleep', when: 'clock', time: '23:00' },
  { key: 'morning', when: 'clock', time: '07:00' },
  { key: 'meal_day', when: 'clock', time: '12:00' },
  { key: 'nap', when: 'clock', time: '14:30' },
  { key: 'close', when: 'end', time: '00:30', before: true },
];

export const DEFAULT_PREFS: PlanPrefs = {
  plainColours: true,
  moments: DEFAULT_MOMENTS,
};

const STORAGE_KEY = 'scheduler-card.plan-prefs';

const cloneDefaults = (): PlanPrefs => ({
  plainColours: DEFAULT_PREFS.plainColours,
  moments: DEFAULT_MOMENTS.map(moment => ({ ...moment })),
});

/** a stored moment, kept only if it still looks like one */
const readMoment = (stored: any, fallback: MomentDefault): MomentDefault => {
  if (!stored || typeof stored != 'object') return { ...fallback };
  const when: EndKind = ['clock', 'sunset', 'end'].includes(stored.when) ? stored.when : fallback.when;
  return {
    key: fallback.key,
    when,
    time: /^\d{1,2}:\d{2}$/.test(stored.time) ? stored.time : fallback.time,
    before: typeof stored.before == 'boolean' ? stored.before : fallback.before,
  };
};

/**
 * Read the preferences, falling back to the defaults for anything missing.
 *
 * Never throws: a browser with storage turned off, or a stored value written
 * by an older version, simply gets the defaults.
 */
export const loadPrefs = (): PlanPrefs => {
  const prefs = cloneDefaults();
  try {
    const raw = window.localStorage?.getItem(STORAGE_KEY);
    if (!raw) return prefs;
    const stored = JSON.parse(raw);
    if (typeof stored?.plainColours == 'boolean') prefs.plainColours = stored.plainColours;
    const byKey = new Map<string, any>(
      (Array.isArray(stored?.moments) ? stored.moments : []).map((m: any) => [m?.key, m])
    );
    prefs.moments = DEFAULT_MOMENTS.map(fallback => readMoment(byKey.get(fallback.key), fallback));
  } catch (_err) {
    return cloneDefaults();
  }
  return prefs;
};

export const savePrefs = (prefs: PlanPrefs) => {
  try {
    window.localStorage?.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch (_err) {
    // a preference that cannot be remembered is still a preference for now
  }
};
