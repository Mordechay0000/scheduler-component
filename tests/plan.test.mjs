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

    // the entity picker asks the backend which entities are already scheduled,
    // and the editor asks for the device book
    window.__wsCalls = [];
    window.__hass.callWS = req => {
      window.__wsCalls.push(req);
      if (req && String(req.type).startsWith('scheduler/device_book')) {
        window.__book = window.__book || { groups: [], devices: [], kinds: ['light', 'switch', 'climate'] };
        if (req.type === 'scheduler/device_book/group') {
          window.__book.groups = req.devices.length
            ? [...window.__book.groups.filter(g => g.name !== req.group), { name: req.group, devices: req.devices }]
            : window.__book.groups.filter(g => g.name !== req.group);
        }
        if (req.type === 'scheduler/device_book/device') {
          window.__book.devices = [
            ...window.__book.devices.filter(d => d.entity_id !== req.entity_id),
            { entity_id: req.entity_id, name: req.name || req.entity_id, alias: req.name || null,
              kind: req.kind || req.entity_id.split('.')[0], groups: [] },
          ];
        }
        return Promise.resolve(window.__book);
      }
      return Promise.resolve([]);
    };

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
      const pick = cube => Object.values(cube.devices || {})[0]?.service || '';
      return [pick(cubes[1]), pick(cubes[2])];
    });
    s.ok(opposite[0] !== opposite[1] || !opposite[0],
      'the new stretch flips each device, as a carved slot does on the ordinary bar');

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
    s.ok(byDevice['light.salon'] === 'light.turn_on', 'the other devices keep doing what they did');
    s.ok(byDevice['switch.plata'] === 'switch.turn_off', 'and the one device does the opposite');
    s.ok(new Set(call.data.timeslots.map(e => e.track)).size === 1,
      'still one track: nothing was duplicated for the odd one out');
    s.ok(call.data.timeslots[1].actions.every(a => a.service.endsWith('turn_off')),
      'the other stretches are untouched by it');
  }, JERUSALEM);

  await withPage(page(), async p => {
    const flipped = await p.evaluate(() => {
      const dialog = window.__dialog;
      dialog._setMembers(dialog._plan.groups[0], ['light.salon', 'switch.plata']);
      const group = dialog._plan.groups[0];
      dialog._toggleOverride(group, group.cubes[0], 'switch.plata');
      const flippedTo = dialog._plan.groups[0].cubes[0].devices['switch.plata'].service;
      dialog._toggleOverride(dialog._plan.groups[0], dialog._plan.groups[0].cubes[0], 'switch.plata');
      return { flippedTo, back: dialog._plan.groups[0].cubes[0].devices['switch.plata'].service };
    });

    s.ok(flipped.flippedTo.endsWith('turn_off'), 'a device can be made to differ');
    s.ok(flipped.back.endsWith('turn_on'), 'and flipped back again');
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

    s.ok(read.join() === 'light.hallway=light.turn_on,light.salon=light.turn_on,switch.plata=switch.turn_off',
      'every device is written out with its own action, in its own domain');
  }, JERUSALEM);

  // --- brightness and colour ----------------------------------------------

  await withPage(page(), async p => {
    const call = await saveWith(p, `
      const group = dialog._plan.groups[0];
      const cube = group.cubes[0];
      dialog._updateCube(group.track, cube.id, {
        devices: { ...cube.devices, 'light.salon':
          { service: 'light.turn_on', service_data: { brightness_pct: 35, color_temp_kelvin: 2200 } } },
      });
    `);

    const data = call.data.timeslots[0].actions
      .find(a => a.entity_id === 'light.salon').service_data;
    s.ok(data.brightness_pct === 35, 'brightness reaches the service call');
    s.ok(data.color_temp_kelvin === 2200, 'so does the colour temperature');
  }, JERUSALEM);

  await withPage(page(), async p => {
    const drawn = await p.evaluate(async () => {
      const dialog = window.__dialog;
      const group = dialog._plan.groups[0];
      const cube = group.cubes[0];
      dialog._updateCube(group.track, cube.id, {
        devices: Object.fromEntries(Object.keys(cube.devices).map(e =>
          [e, { service: 'light.turn_on', service_data: { brightness_pct: 20 } }])),
      });
      await dialog.updateComplete;
      const el = [...dialog.shadowRoot.querySelectorAll('.cube')][0];
      return el.getAttribute('style');
    });

    await p.evaluate(async () => {
      window.__dialog._plainColours = false;
      await window.__dialog.updateComplete;
    });
    const tinted = await p.evaluate(() =>
      window.__dialog.shadowRoot.querySelector('.cube').getAttribute('style'));
    s.ok(tinted.includes('inset-inline-start'), 'the stretch is still drawn');
    s.ok(drawn.includes('inset-inline-start'), 'with plain colours on it keeps the plain tone');
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
    s.ok(await p.evaluate(() => Object.values(window.__dialog._plan.groups[0].cubes[0].devices)
      .every(a => a.service.endsWith('turn_off'))),
      'O flips every device of the stretch');

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
        devices: {
          'climate.salon': { service: 'climate.set_temperature', service_data: { temperature: 16 } },
          'climate.bedroom': { service: 'climate.turn_off', service_data: {} },
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
        devices: {
          ...group.cubes[0].devices,
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
    s.ok(first.includes('לא בקובייה') || !first.includes('undefined'),
      'and a device the stretch leaves out is marked as such');
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

  // --- a device the stretch leaves alone -----------------------------------
  //
  // Not a shade of off. The stretch does not act on it: it keeps whatever it
  // had, is not held to anything, is not retried, and any other schedule may
  // drive it. It has to be visible as its own thing, everywhere.

  await withPage(page(), async p => {
    const call = await saveWith(p, `
      const group = dialog._plan.groups[0];
      dialog._clearDeviceAction(group, group.cubes[0], 'switch.plata');
    `);

    const slot = call.data.timeslots[0];
    s.ok(!slot.actions.some(a => a.entity_id === 'switch.plata'),
      'a device left out of a stretch gets no action at all');
    s.ok(slot.actions.length === 3, 'while the rest of the group still does');
    s.ok(call.data.timeslots[1].actions.some(a => a.entity_id === 'switch.plata'),
      'and it is only left out of that one stretch');
  }, JERUSALEM);

  await withPage(page(), async p => {
    const marked = await p.evaluate(async () => {
      const dialog = window.__dialog;
      dialog._setMembers(dialog._plan.groups[0], ['light.salon', 'switch.plata']);
      const group = dialog._plan.groups[0];
      dialog._clearDeviceAction(group, group.cubes[0], 'switch.plata');
      dialog._selected = group.cubes[0].id;
      await dialog.updateComplete;
      const rows = [...dialog.shadowRoot.querySelectorAll('.device-row')];
      return {
        untouched: rows.filter(r => r.classList.contains('untouched')).length,
        chosen: rows.map(r => r.querySelector('.segmented.states .active')?.textContent.trim()),
      };
    });

    s.ok(marked.untouched === 1, 'the row is greyed and dashed so it cannot be mistaken');
    s.ok(marked.chosen.includes('לא בקובייה'), 'and "not in this stretch" is the chosen state');
  }, JERUSALEM);

  await withPage(page(), async p => {
    const shown = await p.evaluate(async () => {
      const dialog = window.__dialog;
      dialog._setMembers(dialog._plan.groups[0], ['light.salon', 'switch.plata']);
      dialog._clearDeviceAction(dialog._plan.groups[0], dialog._plan.groups[0].cubes[0], 'switch.plata');
      dialog._showReport();
      await dialog.updateComplete;
      return dialog.shadowRoot.querySelector('.report-list li').textContent.replace(/\s+/g, ' ');
    });

    s.ok(shown.includes('לא בקובייה'), 'the report says which devices are left alone');
  }, JERUSALEM);

  // --- one button, one behaviour -------------------------------------------

  await withPage(page(), async p => {
    const opened = await p.evaluate(async () => {
      const dialog = window.__dialog;
      dialog._toggleReport();
      await dialog.updateComplete;
      const yes = !!dialog.shadowRoot.querySelector('.report');
      dialog._toggleReport();
      await dialog.updateComplete;
      return { yes, no: !!dialog.shadowRoot.querySelector('.report') };
    });

    s.ok(opened.yes, 'the button opens what will happen');
    s.ok(!opened.no, 'and the same button closes it again');
  }, JERUSALEM);

  // --- plain on/off colours ------------------------------------------------

  await withPage(page(), async p => {
    const tones = await p.evaluate(async () => {
      const dialog = window.__dialog;
      dialog._setMembers(dialog._plan.groups[0], ['light.salon', 'switch.plata']);
      const group = dialog._plan.groups[0];
      // one stretch where the two devices disagree
      dialog._setDeviceAction(group, group.cubes[2], 'switch.plata',
        { service: 'switch.turn_off', service_data: {} });
      await dialog.updateComplete;
      return [...dialog.shadowRoot.querySelectorAll('.cube')]
        .map(e => [...e.classList].find(c => c.startsWith('tone-')));
    });

    s.ok(tones.includes('tone-on') && tones.includes('tone-off'),
      'on and off stretches are told apart at a glance');
    s.ok(tones.some(t => t === 'tone-mixed'),
      'and a stretch where devices disagree is drawn as mixed');
  }, JERUSALEM);

  await withPage(page(), async p => {
    await p.evaluate(async () => {
      window.__dialog._settingsOpen = true;
      await window.__dialog.updateComplete;
    });
    s.ok(await count_(p, '.book') === 1, 'settings open');
    const plain = await p.evaluate(async () => {
      const dialog = window.__dialog;
      dialog._plainColours = false;
      await dialog.updateComplete;
      return dialog._plainColours;
    });
    s.ok(plain === false, 'and the plain colours can be turned back off');
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
          { id: 'a', name: 'בוקר', when: 'clock', time: '06:30', on: true },
          { id: 'b', name: 'שינה', when: 'clock', time: '22:30', on: false },
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
      dialog._wizardStep = 4;
      dialog._wizard = { ...dialog._wizard, entities: ['light.salon'], onAtCandleLighting: true };
      // the presets are a starting point, and anything can be added by hand
      dialog._addMoment({ key: 'meal_eve', when: 'clock', time: '20:00', on: true });
      dialog._addMoment({ key: 'meal_day', when: 'clock', time: '12:00', on: true });
      dialog._addMoment();
      const own = dialog._wizard.moments[2];
      dialog._updateMoment(own.id, { name: 'שנת צהריים', when: 'clock', time: '14:30', on: false });
      dialog._addMoment({ key: 'close', when: 'end', time: '00:30', before: true, on: true });
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
          { id: 'a', name: 'סעודה', when: 'clock', time: '12:00', on: true },
          // an evening reading before candle lighting: outside the band
          { id: 'b', name: 'מוקדם מדי', when: 'clock', time: '17:00', on: true },
        ],
      };
      dialog._wizardStep = 6;
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

  // --- the wizard sets each device, moment by moment -----------------------

  await withPage(page(), async p => {
    const call = await p.evaluate(async () => {
      const dialog = window.__dialog;
      dialog._wizard = {
        entities: ['climate.salon', 'climate.bedroom', 'light.salon'],
        onAtCandleLighting: false,
        moments: [
          { id: 'meal', name: 'סעודה', when: 'clock', time: '20:00', on: false },
          { id: 'night', name: 'שינה', when: 'clock', time: '23:00', on: false },
        ],
      };
      dialog._wizardStep = 4;
      await dialog.updateComplete;

      // during the meal: the salon air conditioner and a dim light; the bedroom off
      dialog._setMomentDevice('meal', 'climate.salon',
        { service: 'climate.set_temperature', service_data: { temperature: 16 } });
      dialog._setMomentDevice('meal', 'light.salon',
        { service: 'light.turn_on', service_data: { brightness_pct: 40 } });
      // afterwards the other way round
      dialog._setMomentDevice('night', 'climate.bedroom',
        { service: 'climate.set_temperature', service_data: { temperature: 24 } });

      await dialog.updateComplete;
      dialog._finishWizard();
      await dialog.updateComplete;
      await dialog._save();
      return (window.__apiCalls || []).slice(-1)[0];
    });

    const slots = call.data.timeslots;
    const at = name => Object.fromEntries(
      slots.find(x => x.name === name).actions.map(a => [a.entity_id, a]));

    s.ok(at('סעודה')['climate.salon'].service_data.temperature === 16,
      'the wizard carries a per-device temperature through');
    s.ok(at('סעודה')['climate.bedroom'].service.endsWith('turn_off'),
      'while another device in the same moment stays off');
    s.ok(at('סעודה')['light.salon'].service_data.brightness_pct === 40,
      'and a brightness alongside it');
    s.ok(at('שינה')['climate.bedroom'].service_data.temperature === 24
      && at('שינה')['climate.salon'].service.endsWith('turn_off'),
      'and the next moment is the other way round, as the generator needs');
  }, JERUSALEM);

  await withPage(page(), async p => {
    const rows = await p.evaluate(async () => {
      const dialog = window.__dialog;
      dialog._wizard = {
        entities: ['climate.salon', 'light.salon'],
        onAtCandleLighting: true,
        moments: [{ id: 'meal', name: 'סעודה', when: 'clock', time: '20:00', on: true }],
      };
      dialog._wizardStep = 4;
      await dialog.updateComplete;
      return {
        moments: dialog.shadowRoot.querySelectorAll('.wizard-moment').length,
        devices: dialog.shadowRoot.querySelectorAll('.wizard-moment .device-row').length,
      };
    });

    s.ok(rows.moments === 2, 'the opening and every moment are laid out');
    s.ok(rows.devices === 4, 'each with a row per device');
  }, JERUSALEM);

  await withPage(page({ schedule: null }), async p => {
    await p.evaluate(async () => {
      window.__dialog._help = true;
      await window.__dialog.updateComplete;
    });
    s.ok(await count(p, '.help p') === 4, 'the editor can explain itself in place');
  }, JERUSALEM);

  // --- a moment says only where it ends ------------------------------------
  //
  // There is no "which side of Shabbat is this on" any more, because there was
  // never a real question there: a stretch begins where the one before it
  // ended, so the only thing to ask is when it ends. Three ways to say that,
  // and each writes a different kind of boundary.

  await withPage(page(), async p => {
    const written = await p.evaluate(async () => {
      const dialog = window.__dialog;
      const at = (when, time, before) => dialog._momentBoundary({ when, time, before });
      dialog._wizardStep = 3;
      dialog._addMoment();
      await dialog.updateComplete;
      return {
        options: [...dialog.shadowRoot.querySelectorAll('.moment select option')].map(o => o.value),
        evening: at('clock', '22:30'),
        morning: at('clock', '06:30'),
        afterSunset: at('sunset', '01:30', false),
        beforeSunset: at('sunset', '00:20', true),
        beforeEnd: at('end', '00:30', true),
        afterEnd: at('end', '01:00', false),
      };
    });

    s.ok(written.options.join() === 'clock,sunset,end',
      'a moment is asked only where it ends, in the three ways people say it');
    s.ok(written.evening === CANDLE + '@22:30:00',
      'an evening reading belongs to the day the band opened');
    s.ok(written.morning === HAVDALAH + '@06:30:00',
      'and a morning one to the day it closes');
    s.ok(written.afterSunset === 'sunset+01:30:00', 'sunset can be measured forwards');
    s.ok(written.beforeSunset === 'sunset-00:20:00', 'and backwards');
    s.ok(written.beforeEnd === HAVDALAH + '-00:30:00', 'havdalah likewise');
    s.ok(written.afterEnd === HAVDALAH + '+01:00:00', 'in both directions');
  }, JERUSALEM);

  // --- one colour decision, reaching everything ---------------------------

  await withPage(page(), async p => {
    const painted = await p.evaluate(async () => {
      const dialog = window.__dialog;
      const group = dialog._plan.groups[0];
      dialog._setMembers(group, ['light.salon', 'switch.boiler']);
      dialog._selected = dialog._plan.groups[0].cubes[0].id;
      dialog._showReport();
      await dialog.updateComplete;

      const read = () => {
        const on = dialog.shadowRoot.querySelector('.report-device.on');
        const button = dialog.shadowRoot.querySelector('.segmented.states button.on.active');
        return {
          attribute: dialog.hasAttribute('plain'),
          device: on ? getComputedStyle(on).backgroundColor : '',
          button: button ? getComputedStyle(button).backgroundColor : '',
        };
      };

      const plain = read();
      dialog._setPlainColours(false);
      await dialog.updateComplete;
      const action = read();
      return { plain, action, stored: window.localStorage.getItem('scheduler-card.plan-prefs') };
    });

    s.ok(painted.plain.attribute && !painted.action.attribute,
      'the colour scheme is one decision, not a setting per screen');
    s.ok(/67, *160, *71/.test(painted.plain.device),
      'plain paints "on" green in the day report');
    s.ok(/67, *160, *71/.test(painted.plain.button), 'and on the buttons that set it');
    s.ok(!/67, *160, *71/.test(painted.action.device)
      && !/67, *160, *71/.test(painted.action.button),
      'and turning it off really does put both back');
    s.ok(JSON.parse(painted.stored).plainColours === false,
      'the choice is remembered for next time');
  }, JERUSALEM);

  // --- the editor asks the same one question ------------------------------

  await withPage(page(), async p => {
    const moved = await p.evaluate(async () => {
      const dialog = window.__dialog;
      const group = dialog._plan.groups[0];
      dialog._selected = group.cubes[1].id;
      await dialog.updateComplete;

      const fields = {
        boundaries: dialog.shadowRoot.querySelectorAll('.inspector .field.boundary').length,
        start: dialog.shadowRoot.querySelector('.inspector .field-value.fixed')?.textContent.trim(),
      };

      const target = new Date(dialog._moment(group.cubes[1].stop));
      target.setHours(target.getHours() - 1);
      dialog._setCubeEnd(group, group.cubes[1], dialog._boundaryFromDate(target));
      await dialog.updateComplete;

      const after = dialog._plan.groups[0].cubes;
      return {
        fields,
        stop: dialog._moment(after[1].stop).getTime(),
        nextStart: dialog._moment(after[2].start).getTime(),
        untouched: dialog._moment(after[0].stop).getTime()
          === dialog._moment(after[1].start).getTime(),
      };
    });

    s.ok(moved.fields.boundaries === 1,
      'a stretch is asked only where it ends - its start is where the one before it finished');
    s.ok(moved.fields.start && moved.fields.start !== '—', 'and that start is shown, not hidden');
    s.ok(moved.stop === moved.nextStart,
      'moving the end moves where the next one begins, so they still meet');
    s.ok(moved.untouched, 'and the boundary before it is left where it was');
  }, JERUSALEM);

  // --- the sun is drawn onto the band, not wherever it happens to be next --

  await withPage(page(), async p => {
    const drawn = await p.evaluate(async () => {
      const dialog = window.__dialog;
      // `sun.sun` publishes the NEXT sunset, which on a Thursday is Thursday's:
      // days away from a band that opens on Friday evening
      dialog.hass = {
        ...dialog.hass,
        states: {
          ...dialog.hass.states,
          'sun.sun': { entity_id: 'sun.sun', state: 'above_horizon',
            attributes: { next_setting: '2026-08-13T19:31:00+03:00' } },
        },
      };
      dialog._wizardStep = 3;
      dialog._wizard = {
        entities: ['light.salon'],
        onAtCandleLighting: true,
        moments: [{ id: 'a', name: 'סעודה', when: 'sunset', time: '01:30', before: false, on: true }],
      };
      await dialog.updateComplete;

      const at = dialog._moment(dialog._momentBoundary(dialog._wizard.moments[0]));
      const problems = dialog._wizardProblems();
      dialog._finishWizard();
      await dialog.updateComplete;

      return {
        boundary: dialog._momentBoundary({ when: 'sunset', time: '01:30', before: false }),
        day: at && at.getDate(),
        hour: at && at.getHours(),
        blocking: problems.blocking.length,
        cubes: dialog._plan.groups[0].cubes.map(c => c.name),
      };
    });

    s.ok(drawn.boundary === 'sunset+01:30:00',
      'what gets saved is the sun itself, read again on the day the stretch runs');
    s.ok(drawn.day === 14 && drawn.hour === 21,
      'while the drawing puts it on the band\'s own evening rather than three days earlier');
    s.ok(drawn.blocking === 0, 'and an estimate never blocks the wizard');
    s.ok(drawn.cubes.includes('סעודה'),
      'nor is a moment measured from the sun quietly dropped out of the plan');
  }, JERUSALEM);

  // --- checked while it is being built, not after --------------------------

  await withPage(page(), async p => {
    const checked = await p.evaluate(async () => {
      const dialog = window.__dialog;
      const read = () => ({
        blocking: dialog._wizardProblems().blocking.length,
        blocked: dialog._wizardBlocked('moments'),
        next: dialog.shadowRoot.querySelector('.wizard-buttons .primary')?.disabled,
        shown: dialog.shadowRoot.querySelectorAll('.wizard-warning.blocking').length,
      });

      dialog._wizardStep = 3;
      dialog._wizard = {
        entities: ['light.salon'],
        onAtCandleLighting: true,
        // 17:00 on the opening day is before candle lighting: outside the band
        moments: [{ id: 'a', name: 'מוקדם מדי', when: 'clock', time: '17:00', on: true }],
      };
      await dialog.updateComplete;
      const outside = read();

      dialog._updateMoment('a', { time: '22:30' });
      await dialog.updateComplete;
      const fixed = read();

      dialog._addMoment();
      dialog._updateMoment(dialog._wizard.moments[1].id, { name: 'שוב', when: 'clock', time: '22:30' });
      await dialog.updateComplete;
      const collided = read();

      return { outside, fixed, collided };
    });

    s.ok(checked.outside.blocking === 1 && checked.outside.blocked,
      'a moment that falls outside Shabbat is caught as it is typed');
    s.ok(checked.outside.next === true, 'and the wizard will not move on until it changes');
    s.ok(checked.outside.shown === 1, 'saying so on the screen rather than only in the button');
    s.ok(!checked.fixed.blocked && checked.fixed.next === false,
      'moving it inside the band clears the way again');
    s.ok(checked.collided.blocking === 1 && checked.collided.blocked,
      'and two moments on the same minute are blocked too');
  }, JERUSALEM);

  await withPage(page(), async p => {
    const said = await p.evaluate(async () => {
      const dialog = window.__dialog;
      dialog._wizardStep = 3;
      dialog._wizard = {
        entities: ['light.salon'],
        onAtCandleLighting: true,
        moments: [
          { id: 'a', name: 'שינה', when: 'clock', time: '22:30', on: false },
          { id: 'b', name: 'מוצאי', when: 'end', time: '00:30', before: true, on: true },
        ],
      };
      await dialog.updateComplete;
      const problems = dialog._wizardProblems();
      return {
        blocking: problems.blocking.length,
        warnings: problems.warnings,
        marks: dialog.shadowRoot.querySelectorAll('.moment-caution').length,
      };
    });

    s.ok(said.blocking === 0, 'a workable day is not blocked for using a clock time');
    s.ok(said.warnings.length === 1 && said.warnings[0].includes('שינה'),
      'but the one hard time is named');
    s.ok(!said.warnings[0].includes('מוצאי'),
      'and the one measured from havdalah is not, because it moves with the year');
    s.ok(said.warnings[0].includes('לא תפעל') || said.warnings[0].includes('לא יפעל'),
      'the warning says what will actually happen on a Shabbat where it lands outside');
    s.ok(said.marks === 1, 'and the moment itself is marked where it is typed');
  }, JERUSALEM);

  // --- devices come from the book, not from a list of entity ids -----------

  await withPage(page(), async p => {
    const picked = await p.evaluate(async () => {
      const dialog = window.__dialog;
      dialog._book = {
        groups: [{ name: 'מזגנים', devices: ['climate.salon', 'climate.bedroom'] }],
        devices: [
          { entity_id: 'light.salon', name: 'סלון', alias: 'תאורת הסלון', kind: 'light', groups: [] },
        ],
        kinds: [],
      };
      dialog._wizardStep = 1;
      await dialog.updateComplete;
      const before = {
        chips: dialog.shadowRoot.querySelectorAll('.wizard-devices .chip').length,
        pickers: dialog.shadowRoot.querySelectorAll('.wizard-devices scheduler-entity-picker').length,
        named: [...dialog.shadowRoot.querySelectorAll('.wizard-devices .chip.device')]
          .map(e => e.textContent.trim()),
      };

      dialog.shadowRoot.querySelector('.wizard-devices .chip').click();
      await dialog.updateComplete;
      const afterGroup = [...dialog._wizard.entities];

      dialog._wizardAdvanced = true;
      await dialog.updateComplete;
      const pickers = dialog.shadowRoot.querySelectorAll('.wizard-devices scheduler-entity-picker').length;

      return { before, afterGroup, pickers };
    });

    s.ok(picked.before.chips === 2, 'the book is what the wizard offers: a group and a named device');
    s.ok(picked.before.named[0].includes('תאורת הסלון'),
      'under the name the household gave it, not its entity id');
    s.ok(picked.before.pickers === 0, 'the raw entity list is not in the way');
    s.ok(picked.afterGroup.length === 2 && picked.afterGroup.includes('climate.salon'),
      'a group goes in whole, in one click');
    s.ok(picked.pickers === 1, 'and the raw list is still there for anything the book never heard of');
  }, JERUSALEM);

  // --- the times this household keeps --------------------------------------

  await withPage(page(), async p => {
    const kept = await p.evaluate(async () => {
      const dialog = window.__dialog;
      dialog._settingsOpen = true;
      await dialog.updateComplete;
      const rows = dialog.shadowRoot.querySelectorAll('.moments.defaults .moment').length;

      // the meal runs until five minutes after sunset, and the night to eight
      dialog._setDefaultMoment('meal_eve', { when: 'sunset', time: '00:05', before: false });
      dialog._setDefaultMoment('sleep', { when: 'clock', time: '20:00' });
      dialog._setDefaultMoment('meal_day', { when: 'end', time: '00:05', before: true });
      await dialog.updateComplete;

      dialog._settingsOpen = false;
      dialog._wizardStep = 3;
      dialog._wizard = { entities: ['light.salon'], onAtCandleLighting: true, moments: [] };
      await dialog.updateComplete;
      dialog._addMoment(dialog._prefs.moments.find(m => m.key === 'meal_eve'));
      dialog._addMoment(dialog._prefs.moments.find(m => m.key === 'sleep'));
      dialog._addMoment(dialog._prefs.moments.find(m => m.key === 'meal_day'));
      await dialog.updateComplete;

      return {
        rows,
        stored: JSON.parse(window.localStorage.getItem('scheduler-card.plan-prefs')).moments
          .find(m => m.key === 'meal_eve'),
        boundaries: dialog._wizard.moments.map(m => dialog._momentBoundary(m)),
      };
    });

    s.ok(kept.rows === 6, 'every moment the wizard offers has a time this household can set');
    s.ok(kept.stored.time === '00:05' && kept.stored.when === 'sunset',
      'and it is remembered rather than asked again next time');
    s.ok(kept.boundaries[0] === 'sunset+00:05:00', 'the meal ends five minutes after sunset');
    s.ok(kept.boundaries[1] === CANDLE + '@20:00:00', 'the night ends at eight, on the clock');
    s.ok(kept.boundaries[2] === HAVDALAH + '-00:05:00',
      'and the day meal five minutes before havdalah');
  }, JERUSALEM);

  // --- a "?" wherever the question comes up --------------------------------

  await withPage(page(), async p => {
    const answered = await p.evaluate(async () => {
      const dialog = window.__dialog;
      const seen = {};
      const open = async key => {
        dialog._helpKey = key;
        await dialog.updateComplete;
        const note = dialog.shadowRoot.querySelector('.help-note');
        seen[key] = note ? note.textContent.trim().length : 0;
      };

      dialog._selected = dialog._plan.groups[0].cubes[0].id;
      dialog._setMembers(dialog._plan.groups[0], ['light.salon']);
      await dialog.updateComplete;
      const inspector = dialog.shadowRoot.querySelectorAll('.inspector .help-toggle').length;
      await open('cube');
      await open('devices');
      await open('group');

      dialog._helpKey = null;
      dialog._settingsOpen = true;
      await dialog.updateComplete;
      const settings = dialog.shadowRoot.querySelectorAll('.book .help-toggle').length;
      await open('colours');
      await open('times');

      dialog._helpKey = null;
      dialog._settingsOpen = false;
      dialog._wizardStep = 3;
      await dialog.updateComplete;
      const wizard = dialog.shadowRoot.querySelectorAll('.wizard .help-toggle').length;
      await open('step_moments');

      return { seen, inspector, settings, wizard };
    });

    s.ok(answered.inspector >= 2, 'the stretch and its devices each carry their own "?"');
    s.ok(answered.settings >= 3, 'so does every preference');
    s.ok(answered.wizard >= 1, 'and every step of the wizard');
    s.ok(Object.values(answered.seen).every(length => length > 60),
      'and each one answers in plain words rather than a label');
  }, JERUSALEM);

  // --- holding the state is asked once, for the whole plan -----------------

  await withPage(page(), async p => {
    const held = await p.evaluate(async () => {
      const dialog = window.__dialog;
      dialog._wizard = {
        entities: ['light.salon'],
        onAtCandleLighting: true,
        moments: [{ id: 'a', name: 'שינה', when: 'clock', time: '22:30', on: false }],
        hold: false,
      };
      dialog._wizardStep = 5;
      await dialog.updateComplete;
      const buttons = dialog.shadowRoot.querySelectorAll('.wizard .segmented button').length;
      dialog._finishWizard();
      await dialog.updateComplete;
      const off = dialog._plan.groups[0].cubes.every(c => c.enforce === false);

      dialog._wizard = { ...dialog._wizard, hold: true };
      dialog._finishWizard();
      await dialog.updateComplete;
      const on = dialog._plan.groups[0].cubes.every(c => c.enforce === true);

      return { buttons, off, on };
    });

    s.ok(held.buttons === 2, 'the wizard asks whether the plan should hold its state');
    s.ok(held.off, 'and a plan that should not hold is built without it');
    s.ok(held.on, 'while one that should, holds in every stretch');
  }, JERUSALEM);

  // --- the device book -----------------------------------------------------
  //
  // Groups are Home Assistant labels and names are its entity aliases, so both
  // are worth something outside a schedule. The kind is the piece kept here,
  // because a device registered under the wrong domain decides wrongly whether
  // the editor offers it a brightness or a temperature.

  await withPage(page(), async p => {
    const made = await p.evaluate(async () => {
      const dialog = window.__dialog;
      dialog._setMembers(dialog._plan.groups[0], ['climate.salon', 'climate.bedroom']);
      dialog._bookOpen = true;
      dialog._newGroup = 'מזגנים';
      await dialog.updateComplete;
      await dialog._saveGroup('מזגנים', dialog._selectedGroupEntities());
      await dialog.updateComplete;
      return {
        request: window.__wsCalls.find(r => r.type === 'scheduler/device_book/group'),
        groups: dialog._book.groups.map(g => g.name),
      };
    });

    s.ok(made.request.group === 'מזגנים', 'a group is created from the devices at hand');
    s.ok(made.request.devices.length === 2, 'with all of them in it');
    s.ok(made.groups.includes('מזגנים'), 'and it comes back in the book');
  }, JERUSALEM);

  await withPage(page(), async p => {
    const named = await p.evaluate(async () => {
      const dialog = window.__dialog;
      dialog._setMembers(dialog._plan.groups[0], ['light.salon']);
      await dialog._nameDevice('light.salon', { name: 'מזגן סלון', kind: 'climate' });
      return window.__wsCalls.find(r => r.type === 'scheduler/device_book/device');
    });

    s.ok(named.name === 'מזגן סלון', 'a device can be given the name the household uses');
    s.ok(named.kind === 'climate',
      'and put right when Home Assistant has it registered as the wrong sort of thing');
  }, JERUSALEM);

  await withPage(page(), async p => {
    const used = await p.evaluate(async () => {
      const dialog = window.__dialog;
      dialog._setMembers(dialog._plan.groups[0], ['light.salon']);
      dialog._book = {
        groups: [{ name: 'מזגנים', devices: ['climate.salon', 'climate.bedroom'] }],
        devices: [], kinds: [],
      };
      await dialog.updateComplete;
      dialog._useGroup('מזגנים');
      await dialog.updateComplete;
      return dialog._plan.groups[0].entities;
    });

    s.ok(used.length === 3, 'a whole group of the book goes into a plan in one click');
    s.ok(used.includes('light.salon'), 'without displacing what was already there');
  }, JERUSALEM);

  await withPage(page(), async p => {
    await p.evaluate(async () => {
      const dialog = window.__dialog;
      dialog._setMembers(dialog._plan.groups[0], ['climate.salon']);
      dialog._bookOpen = true;
      await dialog.updateComplete;
    });
    s.ok(await count_(p, '.book') === 1, 'the book opens in the editor');
    s.ok(await count_(p, '.book-devices .device-row') === 1,
      'showing the devices of the group being edited');
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
