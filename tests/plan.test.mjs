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
      'climate.salon': { entity_id: 'climate.salon', state: 'off', attributes: { friendly_name: 'מזגן סלון' } },
      'climate.bedroom': { entity_id: 'climate.bedroom', state: 'off', attributes: { friendly_name: 'מזגן חדר' } },
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

/** same as count, spelled differently where a local `count` is in the way */
const count_ = count;

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

  // --- saying what a boundary means ---------------------------------------
  //
  // The three ways of writing a boundary look alike in a dropdown and are not
  // alike at all, so each one is pinned to the string it produces.

  await withPage(page(), async p => {
    const written = await p.evaluate(([candle, havdalah]) => {
      const dialog = window.__dialog;
      const parts = dialog._boundaryParts(candle + '@22:30:00');
      return {
        readBack: parts,
        exact: dialog._boundaryString({ ...parts, anchor: candle, mode: 'exact' }),
        offset: dialog._boundaryString({ anchor: havdalah, mode: 'offset', hours: 0, minutes: 30, before: true }),
        clock: dialog._boundaryString({ anchor: havdalah, mode: 'clock', hours: 6, minutes: 30, before: false }),
        daily: dialog._boundaryString({ anchor: '', mode: 'clock', hours: 13, minutes: 0, before: false }),
      };
    }, [CANDLE, HAVDALAH]);

    s.ok(written.readBack.mode === 'clock' && written.readBack.hours === 22,
      'a clock-on-that-day boundary reads back as one');
    s.ok(written.exact === CANDLE + '+00:00:00', '"at the anchor" is the anchor itself');
    s.ok(written.offset === HAVDALAH + '-00:30:00', '"before / after" is an offset');
    s.ok(written.clock === HAVDALAH + '@06:30:00', '"at a clock time that day" borrows only the date');
    s.ok(written.daily === '13:00:00', 'and with no anchor at all it is the same hour every day');
  }, JERUSALEM);

  await withPage(page(), async p => {
    // a boundary hanging off some other entity must not be quietly rewritten
    const labels = await p.evaluate(() => {
      const dialog = window.__dialog;
      return dialog._anchorOptions('sensor.my_own_zman').map(o => o.value);
    });
    s.ok(labels.includes('sensor.my_own_zman'),
      'an anchor the plan does not own is still offered, so editing cannot drop it');
    s.ok(labels[labels.length - 1] === '', 'the every-day option comes last, where it belongs');
  }, JERUSALEM);

  // --- adding, deleting and colouring a stretch ----------------------------

  await withPage(page(), async p => {
    const before = await count(p, '.cube');
    await p.evaluate(() => {
      const dialog = window.__dialog;
      dialog._selected = dialog._plan.groups[0].cubes[1].id;
      dialog._splitCube(dialog._plan.groups[0], dialog._plan.groups[0].cubes[1]);
    });
    await p.evaluate(() => window.__dialog.updateComplete);
    s.ok(await count(p, '.cube') === before + 1, 'splitting a stretch gives two');

    const opposite = await p.evaluate(() => {
      const cubes = window.__dialog._plan.groups[0].cubes;
      return [cubes[1].action.service, cubes[2].action.service];
    });
    s.ok(opposite[0] !== opposite[1],
      'the new stretch defaults to the opposite state, as a carved slot does on the ordinary bar');

    // Delete removes the selected stretch and the neighbour absorbs its time
    const span = await p.evaluate(() => {
      const dialog = window.__dialog;
      const cubes = dialog._plan.groups[0].cubes;
      const doomed = cubes[2];
      dialog._selected = doomed.id;
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Delete' }));
      return { stop: doomed.stop, after: window.__dialog._plan.groups[0].cubes[1].stop };
    });
    await p.evaluate(() => window.__dialog.updateComplete);
    s.ok(await count(p, '.cube') === before, 'the Delete key removes the selected stretch');
    s.ok(span.stop === span.after, 'and its neighbour takes over the time, so the band stays whole');
  }, JERUSALEM);

  await withPage(page(), async p => {
    const call = await saveWith(p, `
      dialog._updateCube(dialog._plan.groups[0].track, dialog._plan.groups[0].cubes[0].id, { color: '#8e24aa' });
    `);
    s.ok(call.data.timeslots[0].color === '#8e24aa', 'a colour chosen for a stretch is saved with it');
  }, JERUSALEM);

  // --- one device differing inside a stretch -------------------------------
  //
  // Without this, giving the hotplate a different state in one stretch means
  // duplicating the whole timeline for it, which is the thing tracks exist to
  // avoid in the first place.

  await withPage(page(), async p => {
    const call = await saveWith(p, `
      const group = dialog._plan.groups[0];
      dialog._toggleOverride(group, group.cubes[0], 'switch.plata');
    `);

    const slot = call.data.timeslots[0];
    const byDevice = Object.fromEntries(slot.actions.map(a => [a.entity_id, a.service]));
    s.ok(byDevice['light.salon'] === 'switch.turn_on', 'the group keeps doing what it did');
    s.ok(byDevice['switch.plata'] === 'switch.turn_off', 'and the one device does the opposite');
    s.ok(new Set(call.data.timeslots.map(e => e.track)).size === 1,
      'still one track: nothing was duplicated for the odd one out');
    s.ok(call.data.timeslots[1].actions.every(a => a.service === 'switch.turn_off'),
      'the other stretches are untouched by it');
  }, JERUSALEM);

  await withPage(page(), async p => {
    const flipped = await p.evaluate(() => {
      const dialog = window.__dialog;
      dialog._setMembers(dialog._plan.groups[0], ['light.salon', 'switch.plata']);
      const group = dialog._plan.groups[0];
      dialog._toggleOverride(group, group.cubes[0], 'switch.plata');
      const on = Object.keys(dialog._plan.groups[0].cubes[0].overrides || {});
      dialog._toggleOverride(dialog._plan.groups[0], dialog._plan.groups[0].cubes[0], 'switch.plata');
      return { on, off: Object.keys(dialog._plan.groups[0].cubes[0].overrides || {}) };
    });

    s.ok(flipped.on.length === 1, 'a device can be made to differ');
    s.ok(flipped.off.length === 0, 'and put back with its group in one click');
  }, JERUSALEM);

  await withPage(page({ schedule: null }), async p => {
    const read = await p.evaluate(async () => {
      const dialog = window.__dialog;
      dialog._setMembers(dialog._plan.groups[0], ['light.salon', 'light.hallway', 'switch.plata']);
      const group = dialog._plan.groups[0];
      dialog._toggleOverride(group, group.cubes[0], 'switch.plata');
      await dialog._save();
      const written = (window.__apiCalls || []).slice(-1)[0].data;
      // reopen on what was written
      const { planFromSchedule } = window.__planModel || {};
      return written.timeslots[0].actions.map(a => `${a.entity_id}=${a.service}`).sort();
    });

    s.ok(read.join() === 'light.hallway=switch.turn_on,light.salon=switch.turn_on,switch.plata=switch.turn_off',
      'every device is written out with its own action');
  }, JERUSALEM);

  // --- brightness and colour ----------------------------------------------

  await withPage(page(), async p => {
    const call = await saveWith(p, `
      const group = dialog._plan.groups[0];
      const cube = group.cubes[0];
      dialog._updateCube(group.track, cube.id, {
        action: { ...cube.action, service: 'light.turn_on',
                  service_data: { brightness_pct: 35, color_temp_kelvin: 2200 } },
      });
    `);

    const data = call.data.timeslots[0].actions[0].service_data;
    s.ok(data.brightness_pct === 35, 'brightness reaches the service call');
    s.ok(data.color_temp_kelvin === 2200, 'so does the colour temperature');
  }, JERUSALEM);

  await withPage(page(), async p => {
    const drawn = await p.evaluate(async () => {
      const dialog = window.__dialog;
      const group = dialog._plan.groups[0];
      const cube = group.cubes[0];
      dialog._updateCube(group.track, cube.id, {
        action: { ...cube.action, service: 'light.turn_on', service_data: { brightness_pct: 20 } },
      });
      await dialog.updateComplete;
      const el = [...dialog.shadowRoot.querySelectorAll('.cube')][0];
      return el.getAttribute('style');
    });

    s.ok(/background:rgba\(/.test(drawn),
      'a dimmed stretch is drawn dim, the way the ordinary bar colours a slot');
  }, JERUSALEM);

  // --- holding a device to what was set ------------------------------------

  await withPage(page(), async p => {
    const call = await saveWith(p);

    s.ok(call.data.timeslots.every(e => e.enforce === true),
      'a Shabbat plan holds its state by default - that is what one is for');
  }, JERUSALEM);

  await withPage(page(), async p => {
    const call = await saveWith(p, `
      const group = dialog._plan.groups[0];
      dialog._updateCube(group.track, group.cubes[1].id, { enforce: false });
    `);

    s.ok(call.data.timeslots[0].enforce === true, 'the hold is saved with the stretch');
    s.ok(call.data.timeslots[1].enforce === false, 'and can be turned off for one of them');
  }, JERUSALEM);

  // --- undo, redo and the keyboard ----------------------------------------

  const press = (p, key, opts = {}) => p.evaluate(([k, o]) => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: k, ...o }));
    return window.__dialog.updateComplete;
  }, [key, opts]);

  await withPage(page(), async p => {
    const names = () => p.evaluate(() => window.__dialog._plan.groups[0].cubes.map(c => c.name));

    const before = await names();
    await p.evaluate(async () => {
      const dialog = window.__dialog;
      dialog._updateCube(dialog._plan.groups[0].track, dialog._plan.groups[0].cubes[0].id, { name: 'שונה' });
      await dialog.updateComplete;
    });
    s.ok((await names())[0] === 'שונה', 'an edit lands');

    await press(p, 'z', { ctrlKey: true });
    s.ok((await names())[0] === before[0], 'ctrl+z puts it back');

    await press(p, 'y', { ctrlKey: true });
    s.ok((await names())[0] === 'שונה', 'ctrl+y does it again');

    await press(p, 'z', { metaKey: true });
    await press(p, 'z', { metaKey: true, shiftKey: true });
    s.ok((await names())[0] === 'שונה', 'and cmd+z / cmd+shift+z do the same on a Mac');
  }, JERUSALEM);

  await withPage(page(), async p => {
    // a drag is one move, not one per pixel
    const steps = await p.evaluate(async () => {
      const dialog = window.__dialog;
      const track = dialog._plan.groups[0].track;
      for (const minutes of [10, 20, 30]) {
        const when = new Date(dialog._moment(dialog._plan.groups[0].cubes[1].start));
        when.setMinutes(when.getMinutes() + minutes);
        dialog._moveBoundary(track, 1, dialog._boundaryFromDate(when), 'drag:x:1');
      }
      await dialog.updateComplete;
      return dialog._history.length;
    });
    s.ok(steps === 1, 'a whole drag undoes in one go');
  }, JERUSALEM);

  await withPage(page(), async p => {
    const selected = async () => p.evaluate(() => window.__dialog._selected);
    await p.evaluate(() => { window.__dialog._selected = window.__dialog._plan.groups[0].cubes[0].id; });

    await press(p, 'ArrowRight');
    const second = await selected();
    await press(p, 'ArrowLeft');
    s.ok(second !== await selected(), 'the arrows walk along the row');

    await press(p, 'o');
    s.ok(await p.evaluate(() => window.__dialog._plan.groups[0].cubes[0].action.service.endsWith('turn_off')),
      'O flips the state');

    const held = await p.evaluate(() => window.__dialog._plan.groups[0].cubes[0].enforce);
    await press(p, 'h');
    s.ok(await p.evaluate(() => window.__dialog._plan.groups[0].cubes[0].enforce) !== held,
      'H turns holding the state on and off');

    await press(p, '3');
    s.ok(await p.evaluate(() => !!window.__dialog._plan.groups[0].cubes[0].color),
      'a number picks a colour');
    await press(p, '0');
    s.ok(await p.evaluate(() => window.__dialog._plan.groups[0].cubes[0].color === undefined),
      'and 0 hands it back to the action');

    const count = await p.evaluate(() => window.__dialog._plan.groups[0].cubes.length);
    await press(p, 'n');
    s.ok(await p.evaluate(() => window.__dialog._plan.groups[0].cubes.length) === count + 1,
      'N splits a stretch');
    await press(p, 'Delete');
    s.ok(await p.evaluate(() => window.__dialog._plan.groups[0].cubes.length) === count,
      'and Delete removes one');

    await press(p, '?');
    s.ok(await count_(p, '.keys .key-row') > 10, '? brings up the key map');
  }, JERUSALEM);

  await withPage(page(), async p => {
    s.ok(await count_(p, '.swatches .swatch') === 13,
      'twelve colours to choose from, plus automatic');
    const yellow = await p.evaluate(() =>
      [...window.__dialog.shadowRoot.querySelectorAll('.swatch')]
        .some(e => e.getAttribute('style') === 'background:#fdd835'));
    s.ok(yellow, 'yellow among them');
  }, JERUSALEM);

  // --- stretches cannot cover the same moment ------------------------------

  await withPage(page(), async p => {
    const dragged = await p.evaluate(async () => {
      const dialog = window.__dialog;
      const group = dialog._plan.groups[0];
      // drag the second boundary well past the third
      const target = new Date(dialog._moment(group.cubes[2].stop));
      target.setMinutes(target.getMinutes() + 30);
      dialog._moveBoundary(group.track, 1, dialog._boundaryFromDate(target));
      await dialog.updateComplete;
      const cubes = dialog._plan.groups[0].cubes;
      return cubes.map(c => [dialog._moment(c.start)?.getTime(), dialog._moment(c.stop)?.getTime()]);
    });

    const overlapping = dragged.some(([, stop], i) =>
      i < dragged.length - 1 && stop > dragged[i + 1][0]);
    s.ok(!overlapping, 'no two stretches end up covering the same moment');
    s.ok(dragged.every(([from, to]) => to > from), 'and none is left inside out');
  }, JERUSALEM);

  await withPage(page(), async p => {
    const pushed = await p.evaluate(async () => {
      const dialog = window.__dialog;
      const group = dialog._plan.groups[0];
      const before = group.cubes.length;
      const wasAt = dialog._moment(group.cubes[2].start).getTime();
      // drag a boundary well into the next stretch
      const target = new Date(dialog._moment(group.cubes[1].stop));
      target.setMinutes(target.getMinutes() + 60);
      dialog._moveBoundary(group.track, 1, dialog._boundaryFromDate(target));
      await dialog.updateComplete;
      const after = dialog._plan.groups[0];
      return {
        before,
        count: after.cubes.length,
        movedTo: dialog._moment(after.cubes[2].start)?.getTime(),
        wasAt,
      };
    });

    s.ok(pushed.count === pushed.before,
      'a stretch pushed into is shortened, not swallowed');
    s.ok(pushed.movedTo > pushed.wasAt,
      'and the boundary beyond it is pushed along to make room');
  }, JERUSALEM);

  // --- several device states in one stretch --------------------------------
  //
  // The reason all of this exists: a house on a small generator cannot run the
  // salon air conditioner and the bedroom ones at once, so during the meal one
  // is on and the others are off, and later it is the other way round.

  await withPage(page(), async p => {
    const call = await p.evaluate(async () => {
      const dialog = window.__dialog;
      dialog._setMembers(dialog._plan.groups[0],
        ['climate.salon', 'climate.bedroom', 'light.salon', 'light.hallway']);
      const group = dialog._plan.groups[0];
      const meal = group.cubes[0];

      dialog._updateCube(group.track, meal.id, {
        action: { service: 'switch.turn_off', service_data: {} },
        overrides: {
          'climate.salon': { service: 'climate.set_temperature', service_data: { temperature: 16 } },
          'light.salon': { service: 'light.turn_on', service_data: { brightness_pct: 50 } },
          'light.hallway': { service: 'light.turn_on', service_data: { brightness_pct: 10 } },
        },
      });
      await dialog.updateComplete;
      await dialog._save();
      return (window.__apiCalls || []).slice(-1)[0];
    });

    const meal = call.data.timeslots[0];
    const byDevice = Object.fromEntries(meal.actions.map(a => [a.entity_id, a]));

    s.ok(meal.actions.length === 4, 'one stretch, one action per device');
    s.ok(byDevice['climate.salon'].service_data.temperature === 16,
      'the salon air conditioner runs at its own temperature');
    s.ok(byDevice['climate.bedroom'].service.endsWith('turn_off'),
      'while the bedroom one is off - which is what the generator needs');
    s.ok(byDevice['light.salon'].service_data.brightness_pct === 50
      && byDevice['light.hallway'].service_data.brightness_pct === 10,
      'and two lights on at different brightnesses in the same stretch');
    s.ok(new Set(call.data.timeslots.map(e => e.track)).size === 1,
      'still one track, one row: nothing was duplicated for any of them');
  }, JERUSALEM);

  await withPage(page(), async p => {
    const read = await p.evaluate(async () => {
      const dialog = window.__dialog;
      dialog._setMembers(dialog._plan.groups[0], ['climate.salon', 'light.salon']);
      const group = dialog._plan.groups[0];
      dialog._updateCube(group.track, group.cubes[0].id, {
        overrides: {
          'climate.salon': { service: 'climate.set_temperature', service_data: { temperature: 18 } },
        },
      });
      await dialog._save();
      const written = (window.__apiCalls || []).slice(-1)[0].data;
      // reopen the editor on exactly what was written
      const reopened = window.__planFromSchedule
        ? null
        : written.timeslots[0].actions.map(a => `${a.entity_id}:${JSON.stringify(a.service_data)}`);
      return reopened;
    });
    s.ok(read.some(x => x.includes('"temperature":18')),
      'a per-device temperature survives the save');
  }, JERUSALEM);

  await withPage(page(), async p => {
    await p.evaluate(async () => {
      const dialog = window.__dialog;
      dialog._setMembers(dialog._plan.groups[0], ['climate.salon', 'light.salon']);
      await dialog.updateComplete;
    });
    s.ok(await count_(p, '.device-row') === 2, 'every device gets a row of its own');
    const params = await q(p, '.device-row .param');
    s.ok(params.some(t => t.includes('טמפרטורה')), 'an air conditioner is offered a temperature');
    s.ok(params.some(t => t.includes('בהירות')), 'and a light a brightness');
    s.ok(!params.some(t => t.includes('טמפרטורה') && t.includes('בהירות')),
      'never both on the same device');
  }, JERUSALEM);

  // --- reading the day back ------------------------------------------------

  await withPage(page(), async p => {
    await p.evaluate(async () => {
      const dialog = window.__dialog;
      dialog._setMembers(dialog._plan.groups[0], ['light.salon', 'switch.plata']);
      const group = dialog._plan.groups[0];
      dialog._toggleOverride(group, group.cubes[0], 'switch.plata');
      dialog._showReport();
      await dialog.updateComplete;
    });

    s.ok(await count_(p, '.report-list li') === 5, 'every stretch is listed');
    const first = await p.evaluate(() =>
      window.__dialog.shadowRoot.querySelector('.report-list li').textContent.replace(/\s+/g, ' '));
    s.ok(first.includes('סלון') && first.includes('פלטה'),
      'each stretch says what every device does');
    s.ok(first.includes('משלו'), 'and marks the one that is not following its group');
  }, JERUSALEM);

  await withPage(page(), async p => {
    await p.evaluate(async () => {
      window.__dialog._showReport();
      await window.__dialog.updateComplete;
    });
    s.ok(await count_(p, '.report-problem') === 1,
      'a group with no devices is called out before saving');
  }, JERUSALEM);

  await withPage(page(), async p => {
    await saveWith(p);
    await p.evaluate(() => window.__dialog.updateComplete);
    s.ok(await count_(p, '.report-saved') === 1, 'and after saving it says what was saved');
    s.ok(await count_(p, '.report-list li') > 0, 'with the day laid out');
  }, JERUSALEM);

  // --- the wizard is a way in, not the only way ---------------------------

  await withPage(page(), async p => {
    s.ok(await count(p, '.offer') === 1, 'a new plan offers the guided path');
    s.ok(await count(p, '.band') === 1, 'and the editor is right there too, not replaced by it');

    await p.evaluate(async () => {
      const dialog = window.__dialog;
      dialog._wizardStep = 0;
      await dialog.updateComplete;
    });
    s.ok(await count(p, '.wizard') === 1, 'the guided path opens');

    const call = await p.evaluate(async () => {
      const dialog = window.__dialog;
      dialog._wizard = {
        entities: ['light.salon', 'switch.boiler'],
        onAtCandleLighting: true,
        moments: [
          // deliberately out of order: the wizard puts the day in sequence
          { id: 'a', name: 'בוקר', when: 'day', time: '06:30', on: true },
          { id: 'b', name: 'שינה', when: 'eve', time: '22:30', on: false },
        ],
      };
      dialog._finishWizard();
      await dialog.updateComplete;
      await dialog._save();
      return (window.__apiCalls || []).slice(-1)[0];
    });

    const slots = call.data.timeslots;
    s.ok(slots.length === 3, 'the answers become three stretches');
    s.ok(slots[0].start === CANDLE + '+00:00:00', 'the first opens at candle lighting');
    s.ok(slots[1].start === CANDLE + '@22:30:00', 'bedtime is on the evening the band opened');
    s.ok(slots[2].start === HAVDALAH + '@06:30:00', 'and the morning is on the day it closes');
    s.ok(slots.map(e => e.name).join() === 'קבלת שבת,שינה,בוקר',
      'the moments are put in the order they happen, whatever order they were added in');
    s.ok(slots.every(e => [e.actions].flat().some(a => a.entity_id === 'light.salon')),
      'the devices picked in the wizard are the ones acted on');
  }, JERUSALEM);

  // --- a day of your own, not just the questions we thought to ask ---------

  await withPage(page(), async p => {
    const call = await p.evaluate(async () => {
      const dialog = window.__dialog;
      dialog._wizardStep = 3;
      dialog._wizard = { ...dialog._wizard, entities: ['light.salon'], onAtCandleLighting: true };
      // the presets are a starting point, and anything can be added by hand
      dialog._addMoment({ key: 'meal_eve', when: 'eve', time: '20:00', on: true });
      dialog._addMoment({ key: 'meal_day', when: 'day', time: '12:00', on: true });
      dialog._addMoment();
      const own = dialog._wizard.moments[2];
      dialog._updateMoment(own.id, { name: 'שנת צהריים', when: 'day', time: '14:30', on: false });
      dialog._addMoment({ key: 'close', when: 'before_end', time: '00:30', on: true });
      await dialog.updateComplete;
      dialog._finishWizard();
      await dialog.updateComplete;
      await dialog._save();
      return (window.__apiCalls || []).slice(-1)[0];
    });

    const slots = call.data.timeslots;
    s.ok(slots.length === 5, 'a day can have as many moments as it needs');
    s.ok(slots.map(e => e.name).join() === 'קבלת שבת,סעודת ליל שבת,סעודת שבת,שנת צהריים,מוצאי שבת',
      'each moment names the stretch that starts at it');
    s.ok(slots[1].start === CANDLE + '@20:00:00', 'a Shabbat-evening moment sits on the opening day');
    s.ok(slots[2].start === HAVDALAH + '@12:00:00', 'a Shabbat-day one sits on the closing day');
    s.ok(slots[4].start === HAVDALAH + '-00:30:00', 'and one can be measured back from havdalah');
    s.ok(slots[3].actions[0].service.endsWith('turn_off'), 'each moment sets its own state');
    s.ok(slots[4].stop === HAVDALAH + '+01:30:00', 'the last stretch runs to the end of the band');
  }, JERUSALEM);

  await withPage(page(), async p => {
    const shown = await p.evaluate(async () => {
      const dialog = window.__dialog;
      dialog._wizard = {
        entities: ['light.salon'],
        onAtCandleLighting: true,
        moments: [
          { id: 'a', name: 'סעודה', when: 'day', time: '12:00', on: true },
          // 10:00 on the evening side is before candle lighting: outside the band
          { id: 'b', name: 'מוקדם מדי', when: 'eve', time: '10:00', on: true },
        ],
      };
      dialog._wizardStep = 4;
      await dialog.updateComplete;
      const root = dialog.shadowRoot;
      return {
        rows: [...root.querySelectorAll('.review-name')].map(e => e.textContent.trim()),
        warning: root.querySelector('.wizard-warning')?.textContent.trim() || '',
      };
    });

    s.ok(shown.rows.includes('סעודה'), 'the review reads the day back before it is built');
    s.ok(!shown.rows.includes('מוקדם מדי'), 'a moment outside the band is not drawn into it');
    s.ok(shown.warning.includes('מוקדם מדי'), 'and the review says which one was left out, by name');
  }, JERUSALEM);

  await withPage(page(), async p => {
    await p.evaluate(async () => {
      window.__dialog._wizardStep = 0;
      await window.__dialog.updateComplete;
      window.__dialog._wizardStep = null;
      await window.__dialog.updateComplete;
    });
    s.ok(await count(p, '.band') === 1, 'leaving the guided path lands back in the editor');
  }, JERUSALEM);

  await withPage(page({ schedule: null }), async p => {
    await p.evaluate(async () => {
      window.__dialog._help = true;
      await window.__dialog.updateComplete;
    });
    s.ok(await count(p, '.help p') === 4, 'the editor can explain itself in place');
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
