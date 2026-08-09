import { Suite, buildPage, withPage } from './harness.mjs';

// The Shabbat plan editor.
//
// What matters here is not the drawing but what the plan turns into: one
// schedule whose slots sit on separate tracks, so a group keeps its stretches
// while a single device runs its own hours, and a detach outranks the group
// rather than fighting it. The assertions are therefore mostly about the
// payload that reaches the backend.

const JERUSALEM = { timezoneId: 'Asia/Jerusalem' };

const CANDLE = 'sensor.jewish_calendar_upcoming_candle_lighting';
const HAVDALAH = 'sensor.jewish_calendar_upcoming_havdalah';

const page = ({ anchors = true, schedule = null } = {}) => buildPage({
  body: `<div id="host" style="width:1000px"></div>`,
  script: `
    await customElements.whenDefined('dialog-scheduler-plan');
    Object.assign(window.__hass.states, {
      'light.salon': { entity_id: 'light.salon', state: 'on', attributes: { friendly_name: 'סלון' } },
      'light.hallway': { entity_id: 'light.hallway', state: 'on', attributes: { friendly_name: 'מסדרון' } },
      'switch.boiler': { entity_id: 'switch.boiler', state: 'off', attributes: { friendly_name: 'דוד' } },
      'switch.plata': { entity_id: 'switch.plata', state: 'off', attributes: { friendly_name: 'פלטה' } },
      ...(${anchors} ? {
        '${CANDLE}': { entity_id: '${CANDLE}', state: '2026-08-14T19:29:00+03:00', attributes: { friendly_name: 'הדלקת נרות' } },
        '${HAVDALAH}': { entity_id: '${HAVDALAH}', state: '2026-08-15T20:12:00+03:00', attributes: { friendly_name: 'צאת שבת' } },
      } : {}),
    });

    // the entity picker asks the backend which entities are already scheduled
    window.__hass.callWS = () => Promise.resolve([]);

    const dialog = document.createElement('dialog-scheduler-plan');
    dialog.hass = window.__hass;
    document.getElementById('host').appendChild(dialog);
    await dialog.showDialog({ schedule: ${JSON.stringify(schedule)} || undefined, cardConfig: {} });
    window.__dialog = dialog;
    await new Promise(r => setTimeout(r, 200));
    window.__done = true;`,
});

const q = (p, selector) => p.evaluate(
  s => [...window.__dialog.shadowRoot.querySelectorAll(s)].map(e => e.textContent.trim()), selector);

const count = (p, selector) => p.evaluate(
  s => window.__dialog.shadowRoot.querySelectorAll(s).length, selector);

/** Fill the group, press save, and hand back what was POSTed. */
const saveWith = (p, extra = '') => p.evaluate(async code => {
  const dialog = window.__dialog;
  dialog._setMembers(dialog._plan.groups[0], ['light.salon', 'light.hallway', 'switch.boiler', 'switch.plata']);
  // eslint-disable-next-line no-eval
  await eval(code);
  await dialog.updateComplete;
  await dialog._save();
  return (window.__apiCalls || []).slice(-1)[0];
}, extra);

export default async function run() {
  const s = new Suite('shabbat plan');

  await withPage(page(), async (p, pageErrors) => {
    const fatal = pageErrors.filter(e => !/partial-panel-resolver/.test(e));
    s.ok(fatal.length === 0, `the editor renders without errors${fatal.length ? ': ' + fatal[0] : ''}`);

    const names = await q(p, '.cube-name');
    s.ok(names.length === 5, 'the band is cut into five stretches');
    s.ok(names.includes('קבלת שבת') && names.includes('מוצ״ש'),
      'the stretches carry their names, not just their indices');

    s.ok(await count(p, '.row') === 1, 'one row, because there is one group');
    s.ok(await count(p, '.ruler .tick') > 4, 'the band has an hour ruler');

    const firstCube = await p.evaluate(() =>
      window.__dialog.shadowRoot.querySelector('.cube').getAttribute('style'));
    s.ok(firstCube.startsWith('inset-inline-start:0.000%'),
      'the band opens exactly at candle lighting');
  }, JERUSALEM);

  // --- what actually gets saved -------------------------------------------

  await withPage(page(), async p => {
    const call = await saveWith(p);
    s.ok(call && call.endpoint === 'scheduler/add', 'a new plan is created in one write');

    const slots = call.data.timeslots;
    s.ok(slots.length === 5, 'every stretch is saved');
    s.ok(slots.every(e => e.track === slots[0].track), 'a group is one track');
    s.ok(slots[0].name === 'קבלת שבת', 'the name of a stretch is saved with it');
    s.ok(slots[0].start === CANDLE + '+00:00:00',
      'the band is anchored to the candle lighting entity, not to sunset');
    s.ok(slots[1].start === CANDLE + '@22:30:00',
      'an interior boundary is a clock time on the day of an anchor');
    s.ok(slots[2].start === HAVDALAH + '@06:30:00',
      'the morning belongs to the day the band ends on');
    s.ok(call.data.weekdays.join() === 'daily',
      'no weekday rule: the anchors decide the day, festivals included');
    s.ok((call.data.tags || []).includes('shabbat-plan'), 'the plan is tagged as one');

    const targets = [slots[0].actions.map(e => e.entity_id)].flat();
    s.ok(targets.includes('light.salon') && targets.includes('switch.plata'),
      'every device in the group is acted on together');
  }, JERUSALEM);

  // --- detaching a device --------------------------------------------------

  await withPage(page(), async p => {
    const call = await saveWith(p, `
      dialog._detachDevice(dialog._plan.groups[0], 'switch.plata');
      dialog._updateDetach(dialog._plan.detaches[0].track, {
        start: '${HAVDALAH}@11:30:00',
        stop: '${HAVDALAH}@13:00:00',
      });
    `);

    const slots = call.data.timeslots;
    const detach = slots.find(e => e.track.startsWith('detach:'));
    s.ok(!!detach, 'the detached device gets a track of its own');
    s.ok(detach.priority > 0, 'the detach outranks the group, so it owns the device while it runs');
    s.ok(detach.actions.length === 1 && detach.actions[0].entity_id === 'switch.plata',
      'the detach drives only the device it is for');
    s.ok(slots.filter(e => !e.track.startsWith('detach:')).length === 5,
      'the group still has all five stretches - a boundary for one device split nobody else');
    s.ok(slots.filter(e => !e.track.startsWith('detach:'))
      .every(e => [e.actions].flat().some(a => a.entity_id === 'switch.plata')),
      'the device stays in the group, so it comes back when the detach ends');
  }, JERUSALEM);

  await withPage(page(), async p => {
    await p.evaluate(() => {
      const dialog = window.__dialog;
      dialog._setMembers(dialog._plan.groups[0], ['switch.plata']);
      dialog._detachDevice(dialog._plan.groups[0], 'switch.plata');
    });
    await p.evaluate(() => window.__dialog.updateComplete);
    s.ok(await count(p, '.row.detached') === 1, 'a detached device gets its own row');
    s.ok((await q(p, '.row.detached .row-name'))[0] === 'פלטה',
      'the row is labelled with the device, not with an entity id');
  }, JERUSALEM);

  // --- reopening a saved plan ---------------------------------------------

  const savedPlan = {
    schedule_id: 'plan1',
    entity_id: 'switch.schedule_plan',
    enabled: true,
    next_entries: [],
    timestamps: [],
    repeat_type: 'repeat',
    name: 'שבת',
    tags: ['shabbat-plan'],
    entries: [{
      weekdays: ['daily'],
      slots: [
        {
          start: CANDLE + '+00:00:00', stop: HAVDALAH + '+00:00:00',
          name: 'שבת', track: 'group:קבוצת שבת', priority: 0,
          actions: [{ service: 'switch.turn_on', service_data: {}, target: { entity_id: ['switch.boiler'] } }],
          conditions: { type: 'or', items: [], track_changes: false },
        },
        {
          start: HAVDALAH + '@11:30:00', stop: HAVDALAH + '@13:00:00',
          name: 'חריג', track: 'detach:switch.plata', priority: 1,
          actions: [{ service: 'switch.turn_on', service_data: {}, target: { entity_id: ['switch.plata'] } }],
          conditions: { type: 'or', items: [], track_changes: false },
        },
      ],
    }],
  };

  await withPage(page({ schedule: savedPlan }), async p => {
    s.ok(await count(p, '.row') === 2, 'a saved plan reopens with its group and its exception');
    s.ok((await q(p, '.row:not(.detached) .row-name'))[0] === 'קבוצת שבת',
      'the group keeps the name it was saved with');
    s.ok((await q(p, '.cube-name')).includes('חריג'), 'the exception keeps its name too');

    const call = await p.evaluate(async () => {
      await window.__dialog._save();
      return (window.__apiCalls || []).slice(-1)[0];
    });
    s.ok(call.endpoint === 'scheduler/edit', 'saving an existing plan updates it rather than adding another');
    s.ok(call.data.timeslots.length === 2, 'a round trip through the editor loses nothing');
    s.ok(call.data.timeslots[1].track === 'detach:switch.plata',
      'the exception survives the round trip on its own track');
  }, JERUSALEM);

  // --- the anchors are the whole point ------------------------------------

  await withPage(page({ anchors: false }), async p => {
    s.ok(await count(p, '.empty') === 1,
      'without an entity publishing halachic times the editor says so rather than guessing');
    s.ok(await count(p, '.cube') === 0, 'and draws nothing it cannot place');
  }, JERUSALEM);

  return s;
}
