import {
  mdiBookmarkMultipleOutline,
  mdiCallSplit,
  mdiCogOutline,
  mdiClipboardTextClockOutline,
  mdiClose,
  mdiHelpCircleOutline,
  mdiKeyboardOutline,
  mdiPlus,
  mdiRedoVariant,
  mdiTrashCanOutline,
  mdiUndo,
  mdiUndoVariant,
  mdiWizardHat,
} from "@mdi/js";
import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators";
import { Action, CardConfig, Schedule, TConditionLogicType, TRepeatType, TWeekday, Time, TimeMode } from "../types";
import { HomeAssistant } from "../lib/types";
import { localize } from "../localize/localize";
import { hassLocalize } from "../localize/hassLocalize";
import { saveSchedule } from "../data/store/save_schedule";
import { updateSchedule } from "../data/store/update_schedule";
import { deleteSchedule } from "../data/store/delete_schedule";
import { handleWebsocketError } from "../data/store/handle_websocket_error";
import { parseTimeString } from "../data/time/parse_time_string";
import { timeToString } from "../data/time/time_to_string";
import { isOffAction, invertOnOffAction } from "../data/format/is_off_action";
import { computeActionColor } from "../data/format/compute_action_color";
import { computeEntity } from "../lib/entity";
import { resolveBoundary } from "../data/plan/resolve_boundary";
import { PlanReport, describePlan } from "../data/plan/describe_plan";
import {
  DeviceBook,
  EMPTY_BOOK,
  fetchDeviceBook,
  groupDevices,
  nameDevice,
  setDeviceGroup,
} from "../data/plan/device_book";
import {
  DEFAULT_END_ANCHOR,
  DEFAULT_START_ANCHOR,
  Plan,
  PlanCube,
  PlanDetach,
  PlanGroup,
  HOLDS_BY_DEFAULT,
  defaultPlan,
  detachTrack,
  groupTrack,
  cubeActionFor,
  cubeTouches,
  plainAction,
  planFromSchedule,
  planToSchedule,
} from "../data/plan/plan_model";
import {
  EndKind,
  EndTime,
  MomentDefault,
  PlanPrefs,
  DEFAULT_MOMENTS,
  loadPrefs,
  savePrefs,
} from "../data/plan/plan_prefs";

import "../components/scheduler-entity-picker";

export type PlanDialogParams = {
  schedule?: Schedule;
  cardConfig: CardConfig;
};

/**
 * How a boundary is written down.
 *
 * These three are genuinely different things, and the editor used to blur two
 * of them together by offering "at a time" in two different lists:
 *
 *   exact  - the anchor itself. Candle lighting, whenever that is.
 *   offset - so long before or after the anchor. Half an hour before havdalah.
 *   clock  - a reading on the clock, on the day the anchor falls. 06:30 on the
 *            morning Shabbat ends - which is a different date every week, and
 *            not a Saturday at all when the festival runs into one.
 *
 * Only the third one is a clock time, and it still needs an anchor to know
 * which day it belongs to. A boundary with no anchor at all is a fourth thing:
 * the same clock time every single day, which inside a plan is almost always a
 * mistake, so it is offered last and labelled as such.
 */
type BoundaryMode = 'exact' | 'offset' | 'clock';

type BoundaryParts = {
  /** the entity the boundary hangs off, or '' for a plain daily clock time */
  anchor: string;
  mode: BoundaryMode;
  /** always positive; `before` carries the direction */
  hours: number;
  minutes: number;
  before: boolean;
};

/**
 * A moment in the wizard's day.
 *
 * Somebody setting up their Shabbat does not think in anchors and offsets;
 * they think "Friday night dinner at eight, bed at eleven, back on at seven".
 * So a moment is a name, a side of the band, and a time - and the wizard turns
 * the list of them into the stretches between them.
 */
/**
 * How a stretch says where it ends - see `EndKind` for the three ways.
 *
 * Only the end is ever asked for. A stretch begins the moment the one before
 * it finished, so there is only one time to think about per moment, and no way
 * to leave a gap or an overlap by accident.
 */
type WizardWhen = EndKind;

type WizardMoment = EndTime & {
  id: string;
  name: string;
  on: boolean;
  /** what individual devices do from this moment, when they differ */
  overrides?: Record<string, Action>;
};

type WizardAnswers = {
  entities: string[];
  onAtCandleLighting: boolean;
  openingOverrides?: Record<string, Action>;
  moments: WizardMoment[];
  /** put a device back if something else moves it during the plan */
  hold?: boolean;
};

const SNAP_MINUTES = 5;

/** the swatches offered for a stretch, on top of "let the action decide" */
const PALETTE = [
  '#43a047', // green
  '#7cb342', // lime
  '#fdd835', // yellow
  '#fb8c00', // amber
  '#f4511e', // orange
  '#e53935', // red
  '#d81b60', // pink
  '#8e24aa', // purple
  '#3949ab', // indigo
  '#1e88e5', // blue
  '#00897b', // teal
  '#6d4c41', // brown
];

const emptySchedule = (): Schedule => ({
  entries: [{ weekdays: [TWeekday.Daily], slots: [] }],
  repeat_type: TRepeatType.Repeat,
  next_entries: [],
  timestamps: [],
  enabled: true,
  tags: [],
});

const emptyConditions = () => ({
  type: TConditionLogicType.Or,
  items: [],
  track_changes: false,
});

const sameDay = (a: Date, b: Date) => a.toDateString() == b.toDateString();

@customElement('dialog-scheduler-plan')
export class DialogSchedulerPlan extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @state() private _params?: PlanDialogParams;
  @state() private _plan!: Plan;
  @state() private _selected: string | null = null;
  @state() private _error: string | null = null;
  @state() private _help = false;

  /** the wizard is a way in, never the only way: the editor is always there */
  @state() private _wizardStep: number | null = null;
  @state() private _offerWizard = false;
  @state() private _wizard: WizardAnswers = {
    entities: [],
    onAtCandleLighting: true,
    moments: [],
    hold: HOLDS_BY_DEFAULT,
  };
  /** the raw entity picker, for a device the book has never heard of */
  @state() private _wizardAdvanced = false;

  @state() private _history: Plan[] = [];
  @state() private _future: Plan[] = [];
  @state() private _keys = false;
  @state() private _book: DeviceBook = EMPTY_BOOK;
  @state() private _bookOpen = false;
  @state() private _newGroup = "";
  /** the household's own preferences: colours, and the times it keeps */
  @state() private _prefs: PlanPrefs = loadPrefs();
  /** unmistakable green/grey for on and off, rather than shades of the action */
  @state() private _plainColours = this._prefs.plainColours;
  @state() private _settingsOpen = false;
  /** which explanation is open, if any - one at a time, wherever it was asked */
  @state() private _helpKey: string | null = null;
  /** the raw picker in the editor, for a device the book has never heard of */
  @state() private _membersAdvanced = false;
  @state() private _report: PlanReport | null = null;
  @state() private _saved = false;

  private _lastChange?: string;
  private _base: Schedule = emptySchedule();
  private _drag: { row: string; index: number; track: HTMLElement } | null = null;

  public async showDialog(params: PlanDialogParams): Promise<void> {
    this._params = params;
    this._base = params.schedule ? { ...params.schedule } : emptySchedule();
    this._plan = params.schedule ? planFromSchedule(params.schedule) : this._blankPlan();
    this._selected = this._plan.groups[0]?.cubes[0]?.id ?? null;
    this._error = null;
    this._help = false;
    this._helpKey = null;
    this._wizardStep = null;
    this._wizardAdvanced = false;
    this._membersAdvanced = false;
    this._history = [];
    this._future = [];
    this._report = null;
    this._saved = false;
    this._keys = false;
    this._prefs = loadPrefs();
    this._plainColours = this._prefs.plainColours;
    this._wizard = {
      entities: [],
      onAtCandleLighting: true,
      moments: [],
      hold: HOLDS_BY_DEFAULT,
    };
    // a brand new plan is where the step-by-step path is worth offering
    this._offerWizard = !params.schedule;
    this._bookOpen = false;
    this._loadBook();
    await this.updateComplete;
  }

  public async closeDialog() {
    this._params = undefined;
  }

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('keydown', this._handleKeyDown);
  }

  disconnectedCallback() {
    window.removeEventListener('keydown', this._handleKeyDown);
    super.disconnectedCallback();
  }

  private _t(key: string, search?: string | string[], replace?: string | string[]) {
    return localize(`ui.panel.plan.${key}`, this.hass, search || [], replace || []);
  }

  // --- explaining itself, wherever the question comes up -------------------
  //
  // Every panel and every choice carries the same small "?" and answers in
  // plain words: what it is for, how it works, and what will actually happen
  // if it is set one way or the other. One is open at a time, so an answer
  // never buries the thing it is answering about.

  private _helpFor(key: string) {
    return html`
      <button
        class="icon-only help-toggle ${this._helpKey == key ? 'active' : ''}"
        title=${this._t('help.open')}
        @click=${() => { this._helpKey = this._helpKey == key ? null : key; }}
      ><ha-svg-icon .path=${mdiHelpCircleOutline}></ha-svg-icon></button>
    `;
  }

  private _helpText(key: string) {
    if (this._helpKey != key) return nothing;
    return html`<p class="help-note">${this._t(`help.${key}`)}</p>`;
  }

  // --- preferences ---------------------------------------------------------

  private _updatePrefs(changes: Partial<PlanPrefs>) {
    this._prefs = { ...this._prefs, ...changes };
    savePrefs(this._prefs);
  }

  private _setPlainColours(plain: boolean) {
    this._plainColours = plain;
    this._updatePrefs({ plainColours: plain });
  }

  /** the household's own time for one of the moments the wizard offers */
  private _setDefaultMoment(key: string, changes: Partial<MomentDefault>) {
    this._updatePrefs({
      moments: this._prefs.moments.map(moment =>
        moment.key == key ? { ...moment, ...changes } : moment
      ),
    });
  }

  private _resetDefaultMoments() {
    this._updatePrefs({ moments: DEFAULT_MOMENTS.map(moment => ({ ...moment })) });
  }

  private _blankPlan() {
    return defaultPlan(this._t('title'), [
      this._t('cube.welcome'),
      this._t('cube.night'),
      this._t('cube.morning'),
      this._t('cube.afternoon'),
      this._t('cube.close'),
      this._t('group.default'),
    ]);
  }

  // --- keyboard, the same shortcuts the ordinary editor uses ---------------

  /**
   * Everything the editor can do, from the keyboard.
   *
   * Undo and redo work while typing in a field too - they are the one pair
   * people reach for mid-edit - but nothing else steals a key from an input.
   */
  private _handleKeyDown = async (ev: KeyboardEvent) => {
    if (!this._params) return;
    const origin = ev.composedPath()[0];
    const typing = origin instanceof HTMLElement
      && (['input', 'textarea', 'select'].includes(origin.tagName.toLowerCase())
        || origin.isContentEditable);
    const meta = ev.ctrlKey || ev.metaKey;
    const key = ev.key.toLowerCase();

    if (meta && key == 'z' && !ev.shiftKey) {
      ev.preventDefault();
      this._undo();
      return;
    }
    if (meta && (key == 'y' || (key == 'z' && ev.shiftKey))) {
      ev.preventDefault();
      this._redo();
      return;
    }
    if (meta && key == 's') {
      ev.preventDefault();
      await this._save();
      return;
    }

    if (typing) return;
    if (this._wizardStep !== null) return;

    if (key == 'escape' && (this._keys || this._report)) {
      ev.preventDefault();
      this._keys = false;
      this._report = null;
      return;
    }
    if (key == '?' || (ev.shiftKey && key == '/')) {
      ev.preventDefault();
      this._keys = !this._keys;
      return;
    }

    const selected = this._selectedCube();
    const detach = this._selectedDetach();

    switch (key) {
      case 'delete':
      case 'backspace':
        ev.preventDefault();
        if (selected) this._removeCube(selected.group, selected.cube);
        else if (detach) this._rejoinGroup(detach.track);
        return;
      case 'arrowright':
      case 'arrowleft':
        ev.preventDefault();
        if (ev.shiftKey || ev.altKey) this._nudgeBoundary(key == 'arrowright' ? 1 : -1, ev.altKey);
        else this._step(key == 'arrowright' ? 1 : -1);
        return;
      case 'arrowdown':
      case 'arrowup':
        ev.preventDefault();
        this._stepRow(key == 'arrowdown' ? 1 : -1);
        return;
      case 'n':
      case '+':
        ev.preventDefault();
        if (selected) this._splitCube(selected.group, selected.cube);
        return;
      case 'o':
        ev.preventDefault();
        this._toggleSelectedState();
        return;
      case 'h':
        ev.preventDefault();
        if (selected) {
          this._updateCube(selected.group.track, selected.cube.id, {
            enforce: !selected.cube.enforce,
          });
        }
        return;
      case 'g':
        ev.preventDefault();
        this._addGroup();
        return;
      case 'r':
        ev.preventDefault();
        this._toggleReport();
        return;
      case 'w':
        ev.preventDefault();
        this._wizardStep = 0;
        return;
      case 'enter':
        ev.preventDefault();
        this._focusName();
        return;
      default:
        break;
    }

    // 1-9 and 0 pick a colour, 0 being "let the action decide"
    if (selected && /^[0-9]$/.test(key)) {
      ev.preventDefault();
      const index = Number(key) - 1;
      this._updateCube(selected.group.track, selected.cube.id, {
        color: index < 0 ? undefined : PALETTE[index],
      });
    }
  };

  /** every row in the band, in the order they are drawn */
  private get _rows(): { track: string; ids: string[] }[] {
    return [
      ...this._plan.groups.map(group => ({
        track: group.track,
        ids: group.cubes.map(cube => cube.id),
      })),
      ...this._plan.detaches.map(detach => ({ track: detach.track, ids: [detach.track] })),
    ];
  }

  private _step(direction: 1 | -1) {
    const row = this._rows.find(r => r.ids.includes(this._selected || ''));
    if (!row) {
      this._selected = this._rows[0]?.ids[0] ?? null;
      return;
    }
    const index = row.ids.indexOf(this._selected!);
    const next = index + direction;
    if (next >= 0 && next < row.ids.length) this._selected = row.ids[next];
  }

  private _stepRow(direction: 1 | -1) {
    const rows = this._rows;
    const index = rows.findIndex(r => r.ids.includes(this._selected || ''));
    const next = rows[Math.min(rows.length - 1, Math.max(0, index + direction))];
    if (next) this._selected = next.ids[0];
  }

  /** shift/alt with the arrows walks a boundary five minutes at a time */
  private _nudgeBoundary(direction: 1 | -1, stop: boolean) {
    const selected = this._selectedCube();
    if (!selected) return;
    const { group, cube } = selected;
    const index = group.cubes.findIndex(c => c.id == cube.id);
    const boundary = stop ? index + 1 : index;
    const value = stop ? cube.stop : cube.start;
    const moment = this._moment(value);
    if (!moment) return;

    const moved = new Date(moment.getTime() + direction * SNAP_MINUTES * 60000);
    if (boundary > 0 && boundary < group.cubes.length) {
      this._moveBoundary(group.track, boundary, this._boundaryFromDate(moved), 'nudge');
      return;
    }
    // the very ends of the row have no neighbour to hand over to
    const cubes = group.cubes.map(c =>
      c.id != cube.id ? c : { ...c, [stop ? 'stop' : 'start']: this._boundaryFromDate(moved) }
    );
    this._setCubes(group.track, cubes, 'nudge');
  }

  private _toggleSelectedState() {
    const selected = this._selectedCube();
    if (selected) {
      this._updateCube(selected.group.track, selected.cube.id, {
        devices: this._invertDevices(selected.cube),
      });
      return;
    }
    const detach = this._selectedDetach();
    if (detach) {
      const domain = detach.action.service.split('.')[0];
      const turning = isOffAction(detach.action) ? 'turn_on' : 'turn_off';
      this._updateDetach(detach.track, {
        action: { ...detach.action, service: `${domain}.${turning}` },
      });
    }
  }

  private async _focusName() {
    await this.updateComplete;
    const field = this.shadowRoot?.querySelector('.cube-title') as HTMLInputElement | null;
    field?.focus();
    field?.select();
  }

  private _showReport() {
    this._report = describePlan(this._plan, this.hass);
  }

  /** the same button closes it again - anything else is just confusing */
  private _toggleReport() {
    if (this._report) {
      this._report = null;
      this._saved = false;
      return;
    }
    this._showReport();
  }

  // --- the band -----------------------------------------------------------

  private get _bandStart() {
    return resolveBoundary(`${this._plan.startAnchor}+00:00:00`, this.hass);
  }

  private get _bandEnd() {
    return resolveBoundary(`${this._plan.endAnchor}+01:30:00`, this.hass);
  }

  /**
   * Where a boundary falls, on the band this editor is drawing.
   *
   * Everything anchored to candle lighting or havdalah lands exactly, because
   * those entities publish the very timestamps the engine will read. Sunset is
   * the awkward one: `sun.sun` publishes the *next* sunset, which on a Thursday
   * afternoon is Thursday's, nowhere near the band. The engine has no such
   * problem - it reads the sun again on the day the stretch runs - so the
   * stored boundary is exact and only the drawing needs help.
   *
   * So a sun boundary is drawn from the time of day it works out to, placed on
   * the band's own days. Sunset shifts about a minute a day, so within a week
   * of the band that is right to within a few minutes; it is an estimate for
   * the picture, never for what gets saved.
   */
  private _moment(value: string) {
    const resolved = resolveBoundary(value, this.hass, this._bandStart || undefined);
    if (!resolved) return resolved;
    const parsed = parseTimeString(value);
    if (parsed.mode != TimeMode.Sunset && parsed.mode != TimeMode.Sunrise) return resolved;
    return this._onBandDay(resolved.getHours(), resolved.getMinutes()) || resolved;
  }

  /**
   * A time of day, put on whichever of the band's two days it belongs to.
   *
   * Before the small hours it is still the evening the band opened on;
   * afterwards it belongs to the day it closes - the same rule the wizard uses
   * when somebody types a clock time.
   */
  private _onBandDay(hours: number, minutes: number) {
    const anchor = hours >= 16 ? this._bandStart : this._bandEnd;
    if (!anchor) return null;
    const out = new Date(anchor);
    out.setHours(hours, minutes, 0, 0);
    return out;
  }

  private _position(value: string) {
    const start = this._bandStart;
    const end = this._bandEnd;
    if (!start || !end) return null;
    const span = end.getTime() - start.getTime();
    if (span <= 0) return null;
    const moment = this._moment(value);
    if (!moment) return null;
    return Math.min(1, Math.max(0, (moment.getTime() - start.getTime()) / span));
  }

  private _formatMoment(value: string) {
    const moment = this._moment(value);
    if (!moment) return '—';
    return new Intl.DateTimeFormat(this.hass.locale?.language || 'en', {
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(moment);
  }

  private _hourTicks() {
    const start = this._bandStart;
    const end = this._bandEnd;
    if (!start || !end) return [];
    const ticks: { at: number; label: string }[] = [];
    const span = end.getTime() - start.getTime();
    const cursor = new Date(start);
    cursor.setMinutes(0, 0, 0);
    cursor.setHours(cursor.getHours() + 1);
    while (cursor.getTime() < end.getTime()) {
      // every third hour keeps the ruler readable across a 25-hour band
      if (cursor.getHours() % 3 == 0) {
        ticks.push({
          at: (cursor.getTime() - start.getTime()) / span,
          label: String(cursor.getHours()).padStart(2, '0'),
        });
      }
      cursor.setHours(cursor.getHours() + 1);
    }
    return ticks;
  }

  // --- reading and writing a boundary --------------------------------------

  private _boundaryParts(value: string): BoundaryParts {
    const parsed = parseTimeString(value);
    const anchor = parsed.entity_id || '';
    const offsetIsZero = parsed.hours == 0 && parsed.minutes == 0;
    return {
      anchor,
      mode: !anchor
        ? 'clock'
        : parsed.mode == TimeMode.EntityDay
          ? 'clock'
          : offsetIsZero ? 'exact' : 'offset',
      hours: Math.abs(parsed.hours),
      minutes: Math.abs(parsed.minutes),
      before: parsed.hours < 0 || parsed.minutes < 0,
    };
  }

  private _boundaryString(parts: BoundaryParts): string {
    if (!parts.anchor) {
      return timeToString(<Time>{ mode: TimeMode.Fixed, hours: parts.hours, minutes: parts.minutes });
    }
    if (parts.mode == 'exact') {
      return timeToString(<Time>{ mode: TimeMode.Entity, hours: 0, minutes: 0, entity_id: parts.anchor });
    }
    if (parts.mode == 'clock') {
      return timeToString(<Time>{
        mode: TimeMode.EntityDay,
        hours: parts.hours,
        minutes: parts.minutes,
        entity_id: parts.anchor,
      });
    }
    const sign = parts.before ? -1 : 1;
    return timeToString(<Time>{
      mode: TimeMode.Entity,
      hours: sign * parts.hours,
      minutes: sign * parts.minutes,
      entity_id: parts.anchor,
    });
  }

  /**
   * Write a dragged moment down as a boundary.
   *
   * A clock time on the anchor's own day says it most plainly, so that is the
   * first choice. A band that runs over a long festival has days neither anchor
   * names, and those are measured from whichever anchor is within a day.
   */
  private _boundaryFromDate(when: Date): string {
    const candle = this._moment(`${this._plan.startAnchor}+00:00:00`);
    const havdalah = this._moment(`${this._plan.endAnchor}+00:00:00`);

    const clockOn = (anchor: string) => timeToString(<Time>{
      mode: TimeMode.EntityDay,
      hours: when.getHours(),
      minutes: when.getMinutes(),
      entity_id: anchor,
    });

    if (candle && sameDay(when, candle)) return clockOn(this._plan.startAnchor);
    if (havdalah && sameDay(when, havdalah)) return clockOn(this._plan.endAnchor);

    const options = [
      { anchor: this._plan.startAnchor, base: candle },
      { anchor: this._plan.endAnchor, base: havdalah },
    ].filter(o => o.base) as { anchor: string; base: Date }[];

    for (const option of options.sort(
      (a, b) => Math.abs(when.getTime() - a.base.getTime()) - Math.abs(when.getTime() - b.base.getTime())
    )) {
      const minutes = Math.round((when.getTime() - option.base.getTime()) / 60000);
      if (Math.abs(minutes) < 24 * 60) {
        return this._boundaryString({
          anchor: option.anchor,
          mode: 'offset',
          hours: Math.floor(Math.abs(minutes) / 60),
          minutes: Math.abs(minutes) % 60,
          before: minutes < 0,
        });
      }
    }
    return clockOn(this._plan.endAnchor);
  }

  // --- dragging a boundary, as on the ordinary time bar --------------------

  private _dateFromPointer(track: HTMLElement, clientX: number) {
    const start = this._bandStart;
    const end = this._bandEnd;
    if (!start || !end) return null;
    const rect = track.getBoundingClientRect();
    const rtl = getComputedStyle(this).direction == 'rtl';
    const fraction = Math.min(1, Math.max(0,
      (rtl ? rect.right - clientX : clientX - rect.left) / rect.width));
    const when = new Date(start.getTime() + fraction * (end.getTime() - start.getTime()));
    when.setMinutes(Math.round(when.getMinutes() / SNAP_MINUTES) * SNAP_MINUTES, 0, 0);
    return when;
  }

  private _handleDragStart(ev: PointerEvent, row: string, index: number) {
    const track = (ev.currentTarget as HTMLElement).parentElement;
    if (!track) return;
    ev.preventDefault();
    (ev.currentTarget as HTMLElement).setPointerCapture(ev.pointerId);
    this._drag = { row, index, track };
  }

  private _handleDragMove(ev: PointerEvent) {
    if (!this._drag) return;
    const when = this._dateFromPointer(this._drag.track, ev.clientX);
    if (!when) return;
    this._moveBoundary(
      this._drag.row,
      this._drag.index,
      this._boundaryFromDate(when),
      `drag:${this._drag.row}:${this._drag.index}`
    );
  }

  private _handleDragEnd() {
    this._drag = null;
  }

  /**
   * Move the boundary between two stretches.
   *
   * Pushed into its neighbour, it shortens that neighbour and carries on
   * pushing the ones after it - so dragging one boundary a long way squeezes
   * the stretches ahead of it rather than swallowing them. Only when a
   * neighbour has nothing left to give is it absorbed, and the row never runs
   * past the end of the band.
   */
  private _moveBoundary(track: string, index: number, value: string, coalesce?: string) {
    const group = this._plan.groups.find(g => g.track == track);
    const when = this._moment(value);
    if (!group || !when) return;

    const minimum = SNAP_MINUTES * 60000;
    const at = (v: string) => this._moment(v)?.getTime() ?? null;
    const cubes = group.cubes.map(cube => ({ ...cube }));

    cubes[index] = { ...cubes[index], start: value };
    if (index > 0) cubes[index - 1] = { ...cubes[index - 1], stop: value };

    // push forwards: every boundary after this one keeps at least a minimum
    let edge = when.getTime();
    for (let i = index; i < cubes.length; i++) {
      const stop = at(cubes[i].stop);
      if (stop === null || stop >= edge + minimum) break;
      edge += minimum;
      const pushed = this._boundaryFromDate(new Date(edge));
      cubes[i] = { ...cubes[i], stop: pushed };
      if (i + 1 < cubes.length) cubes[i + 1] = { ...cubes[i + 1], start: pushed };
    }

    // and backwards, for a boundary dragged the other way
    edge = when.getTime();
    for (let i = index - 1; i >= 0; i--) {
      const start = at(cubes[i].start);
      if (start === null || start <= edge - minimum) break;
      edge -= minimum;
      const pushed = this._boundaryFromDate(new Date(edge));
      cubes[i] = { ...cubes[i], start: pushed };
      if (i > 0) cubes[i - 1] = { ...cubes[i - 1], stop: pushed };
    }

    this._setCubes(track, cubes, coalesce);
  }

  private _setCubes(track: string, cubes: PlanCube[], coalesce?: string) {
    this._updatePlan(
      {
        groups: this._plan.groups.map(g =>
          g.track == track ? { ...g, cubes: this._resolveOverlaps(cubes) } : g
        ),
      },
      coalesce
    );
    this._keepSelectionValid();
  }

  /**
   * Keep a row a single unbroken line of stretches.
   *
   * Two stretches covering the same moment would both act on the same devices,
   * and which one won would come down to the order they happened to be stored
   * in. So a boundary pushed past its neighbour shortens that neighbour, and
   * one pushed clean past its far end absorbs it - which is what dragging over
   * something small looks like it should do anyway.
   */
  private _resolveOverlaps(cubes: PlanCube[]): PlanCube[] {
    const minimum = SNAP_MINUTES * 60000;
    const at = (value: string) => this._moment(value)?.getTime() ?? null;

    let out = cubes.filter(cube => {
      const from = at(cube.start);
      const to = at(cube.stop);
      // pushing keeps a stretch alive wherever it can; anything still with no
      // length left had nowhere to be pushed to, and is absorbed
      return from === null || to === null || to - from >= minimum;
    });
    if (!out.length) return cubes.slice(0, 1);

    // each stretch runs up to the next one's start, so no moment is claimed twice
    out = out.map((cube, index) =>
      index < out.length - 1 ? { ...cube, stop: out[index + 1].start } : cube
    );
    return out;
  }

  // --- editing -------------------------------------------------------------

  /**
   * Every change goes through here, so undo is simply the plan as it was.
   *
   * `coalesce` keeps a drag from filling the history with one entry per pixel:
   * consecutive changes carrying the same label collapse into the one before
   * them, so a drag undoes as a single move.
   */
  private _updatePlan(plan: Partial<Plan>, coalesce?: string) {
    const previous = this._plan;
    const merge = coalesce !== undefined && coalesce === this._lastChange;
    if (!merge) this._history = [...this._history.slice(-49), previous];
    this._lastChange = coalesce;
    this._future = [];
    this._plan = { ...previous, ...plan };
  }

  private _undo() {
    if (!this._history.length) return;
    const previous = this._history[this._history.length - 1];
    this._history = this._history.slice(0, -1);
    this._future = [...this._future, this._plan];
    this._plan = previous;
    this._lastChange = undefined;
    this._keepSelectionValid();
  }

  private _redo() {
    if (!this._future.length) return;
    const next = this._future[this._future.length - 1];
    this._future = this._future.slice(0, -1);
    this._history = [...this._history, this._plan];
    this._plan = next;
    this._lastChange = undefined;
    this._keepSelectionValid();
  }

  /** after an undo the selected stretch may no longer exist */
  private _keepSelectionValid() {
    if (this._selectedCube() || this._selectedDetach()) return;
    this._selected = this._plan.groups[0]?.cubes[0]?.id ?? null;
  }

  private _updateCube(groupTrackId: string, cubeId: string, changes: Partial<PlanCube>) {
    this._updatePlan({
      groups: this._plan.groups.map(group =>
        group.track != groupTrackId
          ? group
          : {
            ...group,
            cubes: group.cubes.map(cube => (cube.id == cubeId ? { ...cube, ...changes } : cube)),
          }
      ),
    });
  }

  private _updateDetach(track: string, changes: Partial<PlanDetach>) {
    this._updatePlan({
      detaches: this._plan.detaches.map(d => (d.track == track ? { ...d, ...changes } : d)),
    });
  }

  private _selectedCube(): { group: PlanGroup; cube: PlanCube } | null {
    for (const group of this._plan.groups) {
      const cube = group.cubes.find(c => c.id == this._selected);
      if (cube) return { group, cube };
    }
    return null;
  }

  private _selectedDetach() {
    return this._plan.detaches.find(d => d.track == this._selected) || null;
  }

  private _addGroup() {
    const name = this._t('group.new', '{n}', String(this._plan.groups.length + 1));
    const template = this._blankPlan().groups[0];
    const group: PlanGroup = {
      ...template,
      track: groupTrack(name),
      name,
      cubes: template.cubes.map((cube, i) => ({ ...cube, id: `${groupTrack(name)}#${i}` })),
    };
    this._updatePlan({ groups: [...this._plan.groups, group] });
    this._selected = group.cubes[0].id;
  }

  private _removeGroup(track: string) {
    this._updatePlan({ groups: this._plan.groups.filter(g => g.track != track) });
    this._selected = this._plan.groups[0]?.cubes[0]?.id ?? null;
  }

  private _splitCube(group: PlanGroup, cube: PlanCube) {
    const index = group.cubes.findIndex(c => c.id == cube.id);
    const a = this._moment(cube.start);
    const b = this._moment(cube.stop);
    if (!a || !b || b.getTime() - a.getTime() < 2 * SNAP_MINUTES * 60000) return;

    const middle = new Date((a.getTime() + b.getTime()) / 2);
    middle.setMinutes(Math.round(middle.getMinutes() / SNAP_MINUTES) * SNAP_MINUTES, 0, 0);
    const boundary = this._boundaryFromDate(middle);

    const second: PlanCube = {
      ...cube,
      id: `${group.track}#new${index}${group.cubes.length}`,
      name: '',
      color: undefined,
      start: boundary,
      // a new stretch keeps the same devices but flips each of them, which is
      // what the ordinary editor does when a slot is carved
      devices: this._invertDevices(cube),
    };
    const cubes = [...group.cubes];
    cubes.splice(index, 1, { ...cube, stop: boundary }, second);
    this._setCubes(group.track, cubes);
    this._selected = second.id;
  }

  /** the same devices, each doing the opposite */
  private _invertDevices(cube: PlanCube): Record<string, Action> {
    const out: Record<string, Action> = {};
    Object.entries(cube.devices || {}).forEach(([entity, action]) => {
      out[entity] = invertOnOffAction(action) || action;
    });
    return out;
  }

  private _removeCube(group: PlanGroup, cube: PlanCube) {
    if (group.cubes.length < 2) return;
    const index = group.cubes.findIndex(c => c.id == cube.id);
    const cubes = group.cubes.filter(c => c.id != cube.id);
    // the neighbour takes over the stretch that was given up, so the band
    // stays continuous
    if (index > 0) cubes[index - 1] = { ...cubes[index - 1], stop: cube.stop };
    else cubes[0] = { ...cubes[0], start: cube.start };
    this._selected = cubes[Math.max(0, index - 1)].id;
    this._setCubes(group.track, cubes);
  }

  private _detachDevice(group: PlanGroup, entity: string) {
    let track = detachTrack(entity);
    let suffix = 1;
    while (this._plan.detaches.some(d => d.track == track)) track = `${detachTrack(entity)}#${suffix++}`;

    const cube = group.cubes[Math.min(2, group.cubes.length - 1)];
    const detach: PlanDetach = {
      track,
      name: this._t('detach.name'),
      entity,
      start: cube.start,
      stop: cube.stop,
      action: { service: `${entity.split('.')[0]}.turn_on`, service_data: {} },
    };
    this._updatePlan({ detaches: [...this._plan.detaches, detach] });
    this._selected = track;
  }

  private _rejoinGroup(track: string) {
    this._updatePlan({ detaches: this._plan.detaches.filter(d => d.track != track) });
    this._selected = this._plan.groups[0]?.cubes[0]?.id ?? null;
  }

  private _setMembers(group: PlanGroup, entities: string[]) {
    const added = entities.filter(e => !group.entities.includes(e));
    const withDevices = (cube: PlanCube) => {
      const devices = { ...(cube.devices || {}) };
      // a device just added lands wherever the stretch suggests, and one
      // removed from the group leaves every stretch with it
      added.forEach(entity => {
        devices[entity] = plainAction(entity, cube.suggestOn !== false);
      });
      Object.keys(devices).forEach(entity => {
        if (!entities.includes(entity)) delete devices[entity];
      });
      return { ...cube, devices };
    };

    this._updatePlan({
      groups: this._plan.groups.map(g =>
        g.track == group.track ? { ...g, entities, cubes: g.cubes.map(withDevices) } : g
      ),
      // a device that left the group has nothing to be detached from
      detaches: this._plan.detaches.filter(
        d => entities.includes(d.entity)
          || this._plan.groups.some(other => other.track != group.track && other.entities.includes(d.entity))
      ),
    });
  }

  // --- saving --------------------------------------------------------------

  private async _save() {
    const emptyGroup = this._plan.groups.find(g => !g.entities.length);
    if (emptyGroup) {
      this._error = this._t('error.no_entities', '{group}', emptyGroup.name);
      return;
    }
    if (!this._bandStart || !this._bandEnd) {
      this._error = this._t('error.no_anchor');
      return;
    }

    const schedule = planToSchedule(this._plan, this._base);
    try {
      // one schedule, so applying a plan is a single write - it cannot leave
      // half a Shabbat defined behind it
      if (schedule.schedule_id) {
        await updateSchedule(this.hass, schedule as Schedule & { schedule_id: string });
      } else {
        await saveSchedule(this.hass, schedule);
      }
      this._saved = true;
      // what was just saved, in words, so it can be checked rather than assumed
      this._showReport();
    } catch (e) {
      this._reportError(e);
    }
  }

  private async _delete() {
    if (this._base.schedule_id) {
      await deleteSchedule(this.hass, this._base.schedule_id).catch(e => this._reportError(e));
    }
    this.closeDialog();
  }

  private _reportError(err: any) {
    this._error = err?.body?.message || err?.error || String(err);
    if (err?.body?.message) handleWebsocketError(err, this, this.hass);
  }

  // --- render --------------------------------------------------------------

  /**
   * The colour scheme, reflected where the stylesheet can see it.
   *
   * Plain on/off is one decision, not a dozen: every green and every grey in
   * here - buttons, dots, the day report, the wizard's read-back - hangs off
   * this attribute, so turning it off really does put everything back to the
   * theme's own colours rather than leaving half the screen shouting.
   */
  protected updated() {
    this.toggleAttribute('plain', this._plainColours);
  }

  render() {
    if (!this._params) return html``;

    return html`
      <ha-dialog open @closed=${this.closeDialog} width="full" prevent-scrim-close>
        <ha-dialog-header slot="header">
          <ha-icon-button
            slot="navigationIcon"
            data-dialog="close"
            .label=${hassLocalize('ui.dialogs.more_info_control.dismiss', this.hass)}
            .path=${mdiClose}
            @click=${this.closeDialog}
          ></ha-icon-button>
          <div slot="title">${this._t('title')}</div>
        </ha-dialog-header>

        <div class="content">
          ${this._wizardStep !== null ? this._renderWizard() : this._renderEditor()}
          ${this._error ? html`<div class="error">${this._error}</div>` : nothing}
        </div>

        ${this._wizardStep !== null ? nothing : html`
        <div class="buttons" slot="footer">
          <ha-button appearance="plain" variant="danger" @click=${this._delete} ?disabled=${!this._base.schedule_id}>
            ${hassLocalize('ui.common.delete', this.hass)}
          </ha-button>
          <ha-button appearance="plain" @click=${this._save} class="save">
            ${hassLocalize('ui.common.save', this.hass)}
          </ha-button>
        </div>`}
      </ha-dialog>
    `;
  }

  private _renderEditor() {
    return html`
      ${this._renderHeader()}
      ${this._offerWizard ? this._renderWizardOffer() : nothing}
      ${this._help ? this._renderHelp() : nothing}
      ${this._keys ? this._renderKeys() : nothing}
      ${this._settingsOpen ? this._renderSettings() : nothing}
      ${this._bookOpen ? this._renderBook() : nothing}
      ${this._report ? this._renderReport(this._report) : nothing}
      ${this._bandStart && this._bandEnd ? this._renderBand() : this._renderMissingAnchors()}
      ${this._renderInspector()}
    `;
  }

  private _renderHeader() {
    return html`
      <div class="plan-header">
        <div class="plan-title">
          <input
            class="plan-name"
            .value=${this._plan.name}
            placeholder=${this._t('title')}
            @input=${(ev: Event) => this._updatePlan({ name: (ev.target as HTMLInputElement).value })}
          />
          <button
            class="icon-only ${this._help ? 'active' : ''}"
            title=${this._t('help.open')}
            @click=${() => { this._help = !this._help; }}
          >
            <ha-svg-icon .path=${mdiHelpCircleOutline}></ha-svg-icon>
          </button>
          <button
            class="icon-only"
            title=${this._t('history.undo')}
            ?disabled=${!this._history.length}
            @click=${this._undo}
          ><ha-svg-icon .path=${mdiUndo}></ha-svg-icon></button>
          <button
            class="icon-only"
            title=${this._t('history.redo')}
            ?disabled=${!this._future.length}
            @click=${this._redo}
          ><ha-svg-icon .path=${mdiRedoVariant}></ha-svg-icon></button>
          <button
            class="icon-only ${this._keys ? 'active' : ''}"
            title=${this._t('keys.open')}
            @click=${() => { this._keys = !this._keys; }}
          ><ha-svg-icon .path=${mdiKeyboardOutline}></ha-svg-icon></button>
          <button
            class="ghost ${this._settingsOpen ? 'primary' : ''}"
            @click=${() => { this._settingsOpen = !this._settingsOpen; this._bookOpen = false; }}
          >
            <ha-svg-icon .path=${mdiCogOutline}></ha-svg-icon>${this._t('settings.open')}
          </button>
          <button class="ghost ${this._report ? 'primary' : ''}" @click=${this._toggleReport}>
            <ha-svg-icon .path=${mdiClipboardTextClockOutline}></ha-svg-icon>${this._t('report.open')}
          </button>
          <button class="ghost" @click=${() => { this._wizardStep = 0; }}>
            <ha-svg-icon .path=${mdiWizardHat}></ha-svg-icon>${this._t('wizard.open')}
          </button>
        </div>
        <div class="anchors">
          <div class="anchor">
            <span class="anchor-label">${this._t('anchor.opens')}</span>
            <span class="anchor-value">${this._formatMoment(`${this._plan.startAnchor}+00:00:00`)}</span>
          </div>
          <div class="anchor-arrow"></div>
          <div class="anchor">
            <span class="anchor-label">${this._t('anchor.closes')}</span>
            <span class="anchor-value">${this._formatMoment(`${this._plan.endAnchor}+00:00:00`)}</span>
          </div>
        </div>
      </div>
    `;
  }

  private _renderWizardOffer() {
    return html`
      <div class="offer">
        <span>${this._t('wizard.offer')}</span>
        <div class="offer-actions">
          <button class="ghost primary" @click=${() => { this._wizardStep = 0; }}>${this._t('wizard.offer_yes')}</button>
          <button class="ghost" @click=${() => { this._offerWizard = false; }}>${this._t('wizard.offer_no')}</button>
        </div>
      </div>
    `;
  }

  private _renderHelp() {
    return html`
      <div class="help">
        <p>${this._t('help.band')}</p>
        <p>${this._t('help.rows')}</p>
        <p>${this._t('help.detach')}</p>
        <p>${this._t('help.keys')}</p>
      </div>
    `;
  }

  private _renderKeys() {
    const keys: [string, string][] = [
      ['← →', this._t('keys.select')],
      ['↑ ↓', this._t('keys.row')],
      ['⇧ ← →', this._t('keys.move_start')],
      ['⌥ ← →', this._t('keys.move_stop')],
      ['N', this._t('cube.split')],
      ['⌫', hassLocalize('ui.common.delete', this.hass)],
      ['O', this._t('keys.state')],
      ['H', this._t('enforce.label')],
      ['1…9 / 0', this._t('keys.colour')],
      ['G', this._t('group.add')],
      ['R', this._t('report.open')],
      ['W', this._t('wizard.open')],
      ['↵', this._t('keys.rename')],
      ['⌘Z / Ctrl Z', this._t('history.undo')],
      ['⌘Y / Ctrl Y', this._t('history.redo')],
      ['⌘S / Ctrl S', hassLocalize('ui.common.save', this.hass)],
      ['?', this._t('keys.open')],
    ];
    return html`
      <div class="keys">
        ${keys.map(([key, what]) => html`
          <div class="key-row"><kbd>${key}</kbd><span>${what}</span></div>`)}
      </div>
    `;
  }

  /**
   * The day read back as what will actually happen.
   *
   * Shown on demand, before saving and again afterwards - it is much easier to
   * spot a mistake in a list of "at 22:30 the salon goes off" than in a bar.
   */
  private _renderReport(report: PlanReport) {
    const time = (value: Date | null) =>
      value
        ? new Intl.DateTimeFormat(this.hass.locale?.language || 'en', {
          weekday: 'short', hour: '2-digit', minute: '2-digit',
        }).format(value)
        : '—';

    return html`
      <div class="report">
        <div class="report-head">
          <span class="report-title">${this._t('report.title')}</span>
          <span class="report-band">${time(report.opens)} → ${time(report.closes)}</span>
          ${this._helpFor('report')}
          <button class="icon-only" @click=${() => { this._report = null; }}>
            <ha-svg-icon .path=${mdiClose}></ha-svg-icon>
          </button>
        </div>
        ${this._helpText('report')}

        ${this._saved ? html`<div class="report-saved">${this._t('report.saved')}</div>` : nothing}

        ${report.problems.length
        ? html`<div class="report-problem">
            ${this._t('error.no_entities', '{group}', report.problems.join(', '))}
          </div>`
        : nothing}

        <ol class="report-list">
          ${report.stretches.map(stretch => html`
          <li>
            <span class="report-at">${time(stretch.from)}</span>
            <div class="report-what">
              <span class="report-name">
                ${stretch.name}
                <span class="report-group">${stretch.group}</span>
                ${stretch.holds ? html`<span class="beta">${this._t('enforce.on')}</span>` : nothing}
              </span>
              <div class="report-devices">
                ${stretch.devices.map(device => html`
                <span class="report-device ${device.state}">
                  ${device.name}
                  <b>${this._t(
      device.state == 'untouched' ? 'device.untouched'
        : device.state == 'on' ? 'state.on' : 'state.off'
    )}</b>
                  ${device.brightness !== undefined ? html`<i>${device.brightness}%</i>` : nothing}
                  ${device.kelvin !== undefined ? html`<i>${device.kelvin}K</i>` : nothing}
                  ${device.degrees !== undefined ? html`<i>${device.degrees}°</i>` : nothing}
                  ${device.takenOverBy
            ? html`<em>${this._t('report.taken', '{name}', device.takenOverBy)}</em>`
            : nothing}
                </span>`)}
              </div>
            </div>
          </li>`)}
        </ol>
      </div>
    `;
  }

  /**
   * Everything that is a preference rather than part of a plan.
   *
   * The device book lives here because building it is a one-off chore, not
   * something to be doing in the middle of drawing a Shabbat.
   */
  private _renderSettings() {
    return html`
      <div class="book">
        <div class="book-head">
          <span class="report-title">${this._t('settings.title')}</span>
          <span class="report-band">${this._t('settings.hint')}</span>
          <button class="icon-only" @click=${() => { this._settingsOpen = false; }}>
            <ha-svg-icon .path=${mdiClose}></ha-svg-icon>
          </button>
        </div>
        <div class="book-body">
          <div class="field">
            <span class="field-label">
              ${this._t('settings.colours')}${this._helpFor('colours')}
            </span>
            ${this._helpText('colours')}
            <div class="segmented">
              <button class=${this._plainColours ? 'active' : ''}
                @click=${() => this._setPlainColours(true)}>${this._t('settings.colours_plain')}</button>
              <button class=${this._plainColours ? '' : 'active'}
                @click=${() => this._setPlainColours(false)}>${this._t('settings.colours_action')}</button>
            </div>
            <span class="field-resolved">${this._t('settings.colours_hint')}</span>
          </div>

          ${this._renderDefaultTimes()}

          <div class="field">
            <span class="field-label">
              ${this._t('book.title')}${this._helpFor('book')}
            </span>
            ${this._helpText('book')}
            <button class="ghost" @click=${() => { this._bookOpen = true; this._settingsOpen = false; }}>
              <ha-svg-icon .path=${mdiBookmarkMultipleOutline}></ha-svg-icon>${this._t('book.open')}
            </button>
            <span class="field-resolved">${this._t('book.hint')}</span>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * The times this household keeps, so the wizard stops asking.
   *
   * "The meal runs until five minutes after sunset. The night ends at eight,
   * on the clock. Shabbat lunch runs until five minutes before havdalah."
   * These are the same every week, and a wizard that asks for them every time
   * is a form wearing a wizard's hat. Set once here and every new plan starts
   * with them already right.
   */
  private _renderDefaultTimes() {
    return html`
      <div class="field">
        <span class="field-label">
          ${this._t('settings.times')}${this._helpFor('times')}
        </span>
        ${this._helpText('times')}
        <div class="moments defaults">
          ${this._prefs.moments.map(preset => html`
          <div class="moment">
            <span class="moment-fixed-name">${this._t(`wizard.preset.${preset.key}`)}</span>
            ${this._endPicker(preset, changes => this._setDefaultMoment(preset.key, changes))}
            <div class="segmented states">
              <button class="on ${preset.on ? 'active' : ''}"
                @click=${() => this._setDefaultMoment(preset.key, { on: true })}>
                ${this._t('state.on')}
              </button>
              <button class="off ${preset.on ? '' : 'active'}"
                @click=${() => this._setDefaultMoment(preset.key, { on: false })}>
                ${this._t('state.off')}
              </button>
            </div>
            <span class="moment-at">${this._formatMoment(this._momentBoundary(preset))}</span>
          </div>`)}
        </div>
        <button class="ghost small" @click=${this._resetDefaultMoments}>
          ${this._t('settings.times_reset')}
        </button>
        <span class="field-resolved">${this._t('settings.times_hint')}</span>
      </div>
    `;
  }

  private async _loadBook() {
    try {
      const book = await fetchDeviceBook(this.hass);
      // an older integration, or none at all, simply has no book
      this._book = {
        groups: book?.groups || [],
        devices: book?.devices || [],
        kinds: book?.kinds || [],
      };
    } catch (_err) {
      this._book = EMPTY_BOOK;
    }
  }

  /**
   * The household's own names and groupings.
   *
   * Groups are Home Assistant labels and names are its entity aliases, so both
   * mean something outside this dialog too. The kind is the one piece kept
   * here, because a device registered under the wrong domain - an air
   * conditioner behind a switch - is what decides whether this editor offers it
   * a temperature or a brightness.
   */
  private _renderBook() {
    return html`
      <div class="book">
        <div class="book-head">
          <span class="report-title">${this._t('book.title')}</span>
          <span class="report-band">${this._t('book.hint')}</span>
          ${this._helpFor('book')}
          <button class="icon-only" @click=${() => { this._bookOpen = false; }}>
            <ha-svg-icon .path=${mdiClose}></ha-svg-icon>
          </button>
        </div>
        ${this._helpText('book')}

        <div class="book-body">
          <div class="book-groups">
            ${this._book.groups.map(group => html`
            <div class="book-group">
              <span class="book-group-name">${group.name}</span>
              <span class="book-group-count">
                ${this._t('group.members', '{n}', String(group.devices.length))}
              </span>
              <button class="ghost small" @click=${() => this._useGroup(group.name)}>
                ${this._t('book.use')}
              </button>
              <button class="ghost small danger" @click=${() => this._saveGroup(group.name, [])}>
                ${hassLocalize('ui.common.delete', this.hass)}
              </button>
            </div>`)}

            <div class="book-group new">
              <input
                class="moment-name"
                .value=${this._newGroup}
                placeholder=${this._t('book.new_group')}
                @input=${(ev: Event) => { this._newGroup = (ev.target as HTMLInputElement).value; }}
              />
              <button
                class="ghost small"
                ?disabled=${!this._newGroup.trim() || !this._selectedGroupEntities().length}
                @click=${() => this._saveGroup(this._newGroup.trim(), this._selectedGroupEntities())}
              >${this._t('book.from_selection')}</button>
            </div>
          </div>

          <div class="book-devices">
            ${this._selectedGroupEntities().map(entity => this._renderBookDevice(entity))}
          </div>
        </div>
      </div>
    `;
  }

  private _renderBookDevice(entity: string) {
    const entry = this._book.devices.find(d => d.entity_id == entity);
    const kinds = this._book.kinds.length ? this._book.kinds : ['light', 'switch', 'climate', 'other'];
    return html`
      <div class="device-row">
        <span class="device-label">${this.hass.states[entity]?.attributes.friendly_name || entity}</span>
        <input
          class="moment-name"
          .value=${entry?.alias || ''}
          placeholder=${this._t('book.name_it')}
          @change=${(ev: Event) =>
        this._nameDevice(entity, { name: (ev.target as HTMLInputElement).value.trim() || null })}
        />
        <select @change=${(ev: Event) =>
        this._nameDevice(entity, { kind: (ev.target as HTMLSelectElement).value })}>
          ${kinds.map(kind => html`
            <option value=${kind} ?selected=${(entry?.kind || entity.split('.')[0]) == kind}>
              ${this._t(`book.kind.${kind}`) || kind}
            </option>`)}
        </select>
      </div>
    `;
  }

  private _selectedGroupEntities() {
    return this._selectedCube()?.group.entities || this._plan.groups[0]?.entities || [];
  }

  private async _saveGroup(name: string, devices: string[]) {
    try {
      this._book = await setDeviceGroup(this.hass, name, devices);
      this._newGroup = '';
    } catch (err) {
      this._reportError(err);
    }
  }

  private async _nameDevice(entity: string, changes: { name?: string | null; kind?: string | null }) {
    try {
      this._book = await nameDevice(this.hass, entity, changes);
    } catch (err) {
      this._reportError(err);
    }
  }

  /** put a whole group of the book into the stretch's group in one click */
  private _useGroup(name: string) {
    const selected = this._selectedCube();
    const group = selected?.group || this._plan.groups[0];
    if (!group) return;
    const members = groupDevices(this._book, name);
    this._setMembers(group, [...new Set([...group.entities, ...members])]);
  }

  private _renderMissingAnchors() {
    return html`
      <div class="empty">
        <div class="empty-title">${this._t('error.no_anchor')}</div>
        <div class="empty-body">
          ${this._t('error.no_anchor_hint', ['{start}', '{end}'], [DEFAULT_START_ANCHOR, DEFAULT_END_ANCHOR])}
        </div>
      </div>
    `;
  }

  private _renderBand() {
    return html`
      <div class="band">
        <div class="ruler">
          ${this._hourTicks().map(
      tick => html`<span class="tick" style="inset-inline-start:${(tick.at * 100).toFixed(3)}%">${tick.label}</span>`
    )}
        </div>

        ${this._plan.groups.map(group => this._renderGroupRow(group))}
        ${this._plan.detaches.map(detach => this._renderDetachRow(detach))}

        <div class="row-actions">
          <button class="ghost" @click=${this._addGroup}>
            <ha-svg-icon .path=${mdiPlus}></ha-svg-icon>${this._t('group.add')}
          </button>
        </div>
      </div>
    `;
  }

  private _renderGroupRow(group: PlanGroup) {
    return html`
      <div class="row">
        <div class="row-label">
          <span class="row-name">${group.name}</span>
          <span class="row-meta">${this._t('group.members', '{n}', String(group.entities.length))}</span>
        </div>
        <div
          class="track"
          @pointermove=${this._handleDragMove}
          @pointerup=${this._handleDragEnd}
          @pointercancel=${this._handleDragEnd}
        >
          ${group.cubes.map(cube => this._renderCube(group, cube))}
          ${group.cubes.slice(1).map((cube, i) => this._renderHandle(group, i + 1, cube))}
        </div>
      </div>
    `;
  }

  /** the grab area on the line between two stretches */
  private _renderHandle(group: PlanGroup, index: number, cube: PlanCube) {
    const at = this._position(cube.start);
    if (at === null) return nothing;
    return html`
      <div
        class="handle"
        style="inset-inline-start:${(at * 100).toFixed(3)}%"
        title=${this._formatMoment(cube.start)}
        @pointerdown=${(ev: PointerEvent) => this._handleDragStart(ev, group.track, index)}
        @pointermove=${this._handleDragMove}
        @pointerup=${this._handleDragEnd}
      ></div>
    `;
  }

  /**
   * How a stretch is drawn.
   *
   * An explicit colour wins. Otherwise the devices decide: all on, all off, or
   * a mix - and with plain colours turned on, on and off are unmistakable at a
   * glance rather than a matter of shade.
   */
  private _cubeTone(cube: PlanCube): 'on' | 'off' | 'mixed' | 'empty' {
    const actions = Object.values(cube.devices || {});
    if (!actions.length) return 'empty';
    const off = actions.filter(isOffAction).length;
    if (off === actions.length) return 'off';
    if (off === 0) return 'on';
    return 'mixed';
  }

  private _cubeStyle(cube: PlanCube) {
    if (cube.color) return `background:${cube.color};color:#fff`;
    if (this._plainColours) return '';

    const actions = Object.values(cube.devices || {});
    const lit = actions.filter(a => !isOffAction(a));
    if (lit.length === actions.length && lit.length) {
      const fromAction = computeActionColor(lit[0]);
      if (fromAction) {
        const [r, g, b] = fromAction.rgb;
        return `background:rgba(${r},${g},${b},${fromAction.alpha})`;
      }
    }
    return '';
  }

  private _renderCube(group: PlanGroup, cube: PlanCube) {
    const from = this._position(cube.start);
    const to = this._position(cube.stop);
    if (from === null || to === null || to <= from) return nothing;

    const tone = this._cubeTone(cube);
    const selected = this._selected == cube.id;
    return html`
      <button
        class="cube tone-${tone} ${this._plainColours ? 'plain' : ''} ${selected ? 'selected' : ''}"
        style="inset-inline-start:${(from * 100).toFixed(3)}%;width:${((to - from) * 100).toFixed(3)}%;${this._cubeStyle(cube)}"
        title="${this._formatMoment(cube.start)} – ${this._formatMoment(cube.stop)}"
        @click=${() => { this._selected = cube.id; }}
      >
        <span class="cube-name">${cube.name || this._t('cube.unnamed')}</span>
        ${selected ? html`
        <span class="cube-tools">
          <span
            class="cube-tool"
            title=${this._t('cube.split')}
            @click=${(ev: Event) => { ev.stopPropagation(); this._splitCube(group, cube); }}
          ><ha-svg-icon .path=${mdiPlus}></ha-svg-icon></span>
          ${group.cubes.length > 1 ? html`
          <span
            class="cube-tool"
            title=${hassLocalize('ui.common.delete', this.hass)}
            @click=${(ev: Event) => { ev.stopPropagation(); this._removeCube(group, cube); }}
          ><ha-svg-icon .path=${mdiClose}></ha-svg-icon></span>` : nothing}
        </span>` : nothing}
      </button>
    `;
  }

  private _renderDetachRow(detach: PlanDetach) {
    const from = this._position(detach.start);
    const to = this._position(detach.stop);
    const name = this.hass.states[detach.entity]?.attributes.friendly_name || detach.entity;

    return html`
      <div class="row detached">
        <div class="row-label">
          <span class="row-name">${name}</span>
          <span class="row-meta">${this._t('detach.row')}</span>
        </div>
        <div class="track">
          ${from === null || to === null || to <= from
        ? nothing
        : html`
          <button
            class="cube detach ${this._selected == detach.track ? 'selected' : ''}"
            style="inset-inline-start:${(from * 100).toFixed(3)}%;width:${((to - from) * 100).toFixed(3)}%"
            title="${this._formatMoment(detach.start)} – ${this._formatMoment(detach.stop)}"
            @click=${() => { this._selected = detach.track; }}
          >
            <span class="cube-name">${detach.name || this._t('detach.name')}</span>
          </button>
        `}
        </div>
      </div>
    `;
  }

  private _renderInspector() {
    const selectedCube = this._selectedCube();
    const selectedDetach = this._selectedDetach();
    if (selectedDetach) return this._renderDetachInspector(selectedDetach);
    if (!selectedCube) return nothing;

    const { group, cube } = selectedCube;

    return html`
      <div class="inspector">
        <div class="inspector-head">
          <input
            class="cube-title"
            .value=${cube.name}
            placeholder=${this._t('cube.unnamed')}
            @input=${(ev: Event) =>
        this._updateCube(group.track, cube.id, { name: (ev.target as HTMLInputElement).value })}
          />
          <div class="inspector-actions">
            ${this._helpFor('cube')}
            <button class="ghost" @click=${() => this._splitCube(group, cube)}>
              <ha-svg-icon .path=${mdiCallSplit}></ha-svg-icon>${this._t('cube.split')}
            </button>
            <button
              class="ghost danger"
              ?disabled=${group.cubes.length < 2}
              @click=${() => this._removeCube(group, cube)}
            >
              <ha-svg-icon .path=${mdiTrashCanOutline}></ha-svg-icon>${hassLocalize('ui.common.delete', this.hass)}
            </button>
          </div>
        </div>

        ${this._helpText('cube')}

        <div class="fields">
          ${this._renderStartField(group, cube)}
          ${this._renderBoundaryField(this._t('boundary.to'), cube.stop, value =>
          this._setCubeEnd(group, cube, value)
        )}
          ${this._nextCube(group, cube)
        ? html`<span class="hint spans">
              ${this._t('boundary.pushes', '{name}',
          this._nextCube(group, cube)!.name || this._t('cube.unnamed'))}
            </span>`
        : nothing}
          ${this._renderAllDevicesField(group, cube)}
          ${this._renderColorField(cube.color, color => this._updateCube(group.track, cube.id, { color }))}
          ${this._renderEnforceField(cube.enforce, enforce =>
          this._updateCube(group.track, cube.id, { enforce })
        )}
        </div>

        ${this._renderOverrides(group, cube)}

        <div class="members">
          <label>${this._t('group.devices')}${this._helpFor('group')}</label>
          ${this._helpText('group')}
          ${this._book.groups.length ? html`
          <div class="member-chips">
            ${this._book.groups.map(entry => html`
              <button class="chip" @click=${() => this._useGroup(entry.name)}>
                <ha-svg-icon .path=${mdiPlus}></ha-svg-icon>${entry.name}
                <span class="chip-action">
                  ${this._t('group.members', '{n}', String(entry.devices.length))}
                </span>
              </button>`)}
          </div>` : nothing}
          ${this._book.devices.length ? html`
          <div class="member-chips">
            ${this._book.devices.map(device => {
          const inGroup = group.entities.includes(device.entity_id);
          return html`
              <button
                class="chip device ${inGroup ? 'on' : ''}"
                @click=${() => this._setMembers(group, inGroup
              ? group.entities.filter(e => e != device.entity_id)
              : [...group.entities, device.entity_id])}
              >
                <span class="device-dot ${inGroup ? '' : 'none'}"></span>
                ${device.alias
              || this.hass.states[device.entity_id]?.attributes.friendly_name
              || device.entity_id}
              </button>`;
        })}
          </div>` : nothing}
          <button class="ghost small" @click=${() => { this._membersAdvanced = !this._membersAdvanced; }}>
            ${this._t(this._membersAdvanced ? 'wizard.devices.simple' : 'wizard.devices.advanced')}
          </button>
          ${this._membersAdvanced ? html`
          <scheduler-entity-picker
            .hass=${this.hass}
            .config=${this._params!.cardConfig}
            .value=${group.entities}
            multiple
            @value-changed=${(ev: CustomEvent) => this._setMembers(group, ev.detail.value)}
          ></scheduler-entity-picker>` : nothing}
          ${group.entities.length ? html`
          <span class="hint">${this._t('detach.hint')}</span>
          <div class="member-chips">
            ${group.entities.map(
          entity => html`
              <button class="chip" @click=${() => this._detachDevice(group, entity)}>
                ${this.hass.states[entity]?.attributes.friendly_name || entity}
                <span class="chip-action">${this._t('detach.action')}</span>
              </button>
            `
        )}
          </div>` : nothing}
          ${this._plan.groups.length > 1
        ? html`<button class="ghost danger" @click=${() => this._removeGroup(group.track)}>
              ${this._t('group.remove')}
            </button>`
        : nothing}
        </div>
      </div>
    `;
  }

  private _renderDetachInspector(detach: PlanDetach) {
    const name = this.hass.states[detach.entity]?.attributes.friendly_name || detach.entity;
    return html`
      <div class="inspector detached">
        <div class="inspector-head">
          <input
            class="cube-title"
            .value=${detach.name}
            placeholder=${this._t('detach.name')}
            @input=${(ev: Event) => this._updateDetach(detach.track, { name: (ev.target as HTMLInputElement).value })}
          />
          <div class="inspector-actions">
            <button class="ghost" @click=${() => this._rejoinGroup(detach.track)}>
              <ha-svg-icon .path=${mdiUndoVariant}></ha-svg-icon>${this._t('detach.rejoin')}
            </button>
          </div>
        </div>
        <div class="detach-note">${this._t('detach.note', '{device}', name)}</div>

        <div class="fields">
          ${this._renderBoundaryField(this._t('boundary.from'), detach.start, value =>
      this._updateDetach(detach.track, { start: value })
    )}
          ${this._renderBoundaryField(this._t('boundary.to'), detach.stop, value =>
      this._updateDetach(detach.track, { stop: value })
    )}
          ${this._renderStateField(isOffAction(detach.action), off =>
      this._updateDetach(detach.track, {
        action: {
          ...detach.action,
          service: `${detach.action.service.split('.')[0]}.${off ? 'turn_off' : 'turn_on'}`,
        },
      })
    )}
          ${this._renderLightFields(detach.action, action => this._updateDetach(detach.track, { action }))}
          <label class="field once">
            <span class="field-label">${this._t('detach.once')}</span>
            <input
              type="date"
              .value=${detach.end_date || ''}
              @change=${(ev: Event) => {
        const value = (ev.target as HTMLInputElement).value || undefined;
        this._updateDetach(detach.track, { start_date: value, end_date: value });
      }}
            />
            <span class="field-resolved">${this._t('detach.once_hint')}</span>
          </label>
        </div>
      </div>
    `;
  }

  /** the anchors on offer, plus whatever this boundary already points at */
  private _anchorOptions(current: string) {
    const options = [
      { value: this._plan.startAnchor, label: this._t('anchor.opens') },
      { value: this._plan.endAnchor, label: this._t('anchor.closes') },
    ];
    if (current && !options.some(o => o.value == current)) {
      options.push({
        value: current,
        label: this.hass.states[current]?.attributes.friendly_name || current,
      });
    }
    options.push({ value: '', label: this._t('anchor.fixed') });
    return options;
  }

  /**
   * Where a stretch starts, which is never a question.
   *
   * A stretch begins the instant the one before it ended - that is what makes a
   * row a row rather than a pile of intervals - so its start is shown and not
   * asked for. Only the end is editable, and moving it moves the start of the
   * next one with it, so a gap or an overlap cannot be typed into existence.
   */
  private _renderStartField(group: PlanGroup, cube: PlanCube) {
    const index = group.cubes.findIndex(c => c.id == cube.id);
    const previous = group.cubes[index - 1];

    return html`
      <div class="field">
        <span class="field-label">${this._t('boundary.from')}</span>
        <span class="field-value fixed">${this._formatMoment(cube.start)}</span>
        <span class="field-resolved">
          ${previous
        ? this._t('boundary.starts_after', '{name}', previous.name || this._t('cube.unnamed'))
        : this._t('boundary.starts_open')}
        </span>
      </div>
    `;
  }

  private _nextCube(group: PlanGroup, cube: PlanCube): PlanCube | undefined {
    return group.cubes[group.cubes.findIndex(c => c.id == cube.id) + 1];
  }

  /** move where a stretch ends, and with it where the next one begins */
  private _setCubeEnd(group: PlanGroup, cube: PlanCube, value: string) {
    const index = group.cubes.findIndex(c => c.id == cube.id);
    if (index < 0) return;
    if (index + 1 < group.cubes.length) {
      this._moveBoundary(group.track, index + 1, value, `end:${group.track}:${index}`);
      return;
    }
    // the last stretch of a row has nobody after it: its end is its own
    this._setCubes(
      group.track,
      group.cubes.map((entry, i) => (i == index ? { ...entry, stop: value } : entry)),
      `end:${group.track}:${index}`
    );
  }

  private _renderBoundaryField(label: string, value: string, onChange: (value: string) => void) {
    const parts = this._boundaryParts(value);
    const commit = (changes: Partial<BoundaryParts>) => onChange(this._boundaryString({ ...parts, ...changes }));

    const modes: { value: BoundaryMode; label: string }[] = [
      { value: 'exact', label: this._t('boundary.exact') },
      { value: 'offset', label: this._t('boundary.offset') },
      { value: 'clock', label: this._t('boundary.clock') },
    ];

    return html`
      <div class="field boundary">
        <span class="field-label">${label}</span>

        <select
          class="anchor-select"
          @change=${(ev: Event) => {
        const anchor = (ev.target as HTMLSelectElement).value;
        // a boundary with no anchor is a plain clock time, nothing else
        commit({ anchor, mode: anchor ? parts.mode : 'clock' });
      }}
        >
          ${this._anchorOptions(parts.anchor).map(
        option => html`<option value=${option.value} ?selected=${option.value == parts.anchor}>${option.label}</option>`
      )}
        </select>

        ${parts.anchor ? html`
        <div class="segmented modes">
          ${modes.map(
        mode => html`
            <button
              class=${parts.mode == mode.value ? 'active' : ''}
              @click=${() => commit({ mode: mode.value })}
            >${mode.label}</button>`
      )}
        </div>` : nothing}

        ${parts.anchor && parts.mode == 'exact' ? nothing : html`
        <div class="field-row">
          ${parts.anchor && parts.mode == 'offset' ? html`
          <button
            class="sign ${parts.before ? 'before' : 'after'}"
            @click=${() => commit({ before: !parts.before })}
          >${parts.before ? this._t('boundary.before') : this._t('boundary.after')}</button>` : nothing}
          <input
            type="time"
            class="time-input"
            .value=${`${String(parts.hours).padStart(2, '0')}:${String(parts.minutes).padStart(2, '0')}`}
            @change=${(ev: Event) => {
        const [hours, minutes] = (ev.target as HTMLInputElement).value.split(':').map(Number);
        commit({ hours: hours || 0, minutes: minutes || 0 });
      }}
          />
        </div>`}

        <span class="field-resolved">→ ${this._formatMoment(value)}</span>
      </div>
    `;
  }

  private _renderStateField(off: boolean, onChange: (off: boolean) => void) {
    return html`
      <div class="field">
        <span class="field-label">${this._t('state.label')}</span>
        <div class="segmented">
          <button class="${off ? '' : 'active'}" @click=${() => onChange(false)}>${this._t('state.on')}</button>
          <button class="${off ? 'active' : ''}" @click=${() => onChange(true)}>${this._t('state.off')}</button>
        </div>
      </div>
    `;
  }

  /**
   * Every device of the group, each with its own state and its own settings.
   *
   * A stretch is not one state for everything, and it cannot be: a house on a
   * small generator runs the salon air conditioner during the meal and the
   * bedroom ones afterwards, never both. So each device gets a row here - on
   * or off, and whatever it takes: brightness and warmth for a light, degrees
   * for an air conditioner. A device with no row of its own simply follows the
   * stretch.
   */
  private _renderOverrides(group: PlanGroup, cube: PlanCube) {
    if (!group.entities.length) return nothing;

    return html`
      <div class="overrides">
        <label>${this._t('override.label')}${this._helpFor('devices')}</label>
        ${this._helpText('devices')}
        <div class="device-rows">
          ${group.entities.map(entity => this._renderDeviceRow(group, cube, entity))}
        </div>
        <span class="hint">${this._t('override.hint')}</span>
      </div>
    `;
  }

  private _renderDeviceRow(group: PlanGroup, cube: PlanCube, entity: string) {
    return this._deviceRow(
      entity,
      cubeActionFor(cube, entity),
      action => this._setDeviceAction(group, cube, entity, action),
      () => this._clearDeviceAction(group, cube, entity)
    );
  }

  /**
   * One device: whether the stretch acts on it at all, its state, and whatever
   * settings it can take.
   *
   * "Not in this stretch" is a real third choice, not a shade of off. The
   * stretch does not switch it, does not hold it, and does not retry it; it
   * keeps whatever it had and any other schedule may drive it.
   */
  private _deviceRow(
    entity: string,
    action: Action | undefined,
    onChange: (action: Action) => void,
    onClear: () => void
  ) {
    const domain = entity.split('.')[0];
    const untouched = !action;
    const off = action ? isOffAction(action) : false;
    const current = action || plainAction(entity, true);
    const set = (changes: Partial<Action>) => onChange({ ...current, ...changes });

    return html`
      <div class="device-row ${untouched ? 'untouched' : ''}">
        <span class="device-label">
          <span class="device-dot ${untouched ? 'none' : off ? 'off' : 'on'}"></span>
          ${this.hass.states[entity]?.attributes.friendly_name || entity}
          ${untouched
        ? html`<em class="follows">${this._t('device.untouched_hint')}</em>`
        : nothing}
        </span>

        <div class="segmented states">
          <button class="on ${!untouched && !off ? 'active' : ''}" @click=${() =>
        set({ service: `${domain}.turn_on` })}>${this._t('state.on')}</button>
          <button class="off ${!untouched && off ? 'active' : ''}" @click=${() =>
        set({ service: `${domain}.turn_off`, service_data: {} })}>${this._t('state.off')}</button>
          <button class="none ${untouched ? 'active' : ''}" title=${this._t('device.untouched_hint')}
            @click=${onClear}>${this._t('device.untouched')}</button>
        </div>

        ${untouched || off ? nothing : this._renderDeviceParameters(domain, current, set)}
      </div>
    `;
  }

  /** only what the device can actually be told */
  private _renderDeviceParameters(
    domain: string,
    action: Action,
    set: (changes: Partial<Action>) => void
  ) {
    const data = action.service_data || {};
    const withData = (changes: Record<string, any>) => {
      const service_data = { ...data, ...changes };
      Object.keys(service_data).forEach(key => {
        if (service_data[key] === undefined) delete service_data[key];
      });
      set({ service_data });
    };

    if (domain == 'light') {
      const brightness = data.brightness_pct ?? (
        data.brightness !== undefined ? Math.round((data.brightness / 255) * 100) : undefined
      );
      const kelvin = data.color_temp_kelvin;
      return html`
        <label class="param">
          <input type="checkbox" ?checked=${brightness !== undefined}
            @change=${(ev: Event) => withData({
        brightness_pct: (ev.target as HTMLInputElement).checked ? 100 : undefined,
        brightness: undefined,
      })} />
          ${this._t('light.brightness')}
          <input type="range" min="1" max="100" .value=${String(brightness ?? 100)}
            ?disabled=${brightness === undefined}
            @input=${(ev: Event) => withData({
        brightness_pct: Number((ev.target as HTMLInputElement).value), brightness: undefined,
      })} />
          <span class="field-value">${brightness === undefined ? '—' : `${brightness}%`}</span>
        </label>
        <label class="param">
          <input type="checkbox" ?checked=${kelvin !== undefined}
            @change=${(ev: Event) => withData({
        color_temp_kelvin: (ev.target as HTMLInputElement).checked ? 2700 : undefined,
      })} />
          ${this._t('light.warmth')}
          <input class="kelvin" type="range" min="2000" max="6500" step="100"
            .value=${String(kelvin ?? 2700)} ?disabled=${kelvin === undefined}
            @input=${(ev: Event) => withData({
        color_temp_kelvin: Number((ev.target as HTMLInputElement).value),
      })} />
          <span class="field-value">${kelvin === undefined ? '—' : `${kelvin}K`}</span>
        </label>`;
    }

    if (domain == 'climate') {
      const degrees = data.temperature;
      return html`
        <label class="param">
          <input type="checkbox" ?checked=${degrees !== undefined}
            @change=${(ev: Event) => {
        const on = (ev.target as HTMLInputElement).checked;
        set({
          service: on ? 'climate.set_temperature' : 'climate.turn_on',
          service_data: on ? { ...data, temperature: 24 } : {},
        });
      }} />
          ${this._t('climate.degrees')}
          <input type="range" min="16" max="30" step="1"
            .value=${String(degrees ?? 24)} ?disabled=${degrees === undefined}
            @input=${(ev: Event) => set({
        service: 'climate.set_temperature',
        service_data: { ...data, temperature: Number((ev.target as HTMLInputElement).value) },
      })} />
          <span class="field-value">${degrees === undefined ? '—' : `${degrees}°`}</span>
        </label>`;
    }
    return nothing;
  }

  private _setDeviceAction(group: PlanGroup, cube: PlanCube, entity: string, action: Action) {
    this._updateCube(group.track, cube.id, {
      devices: { ...(cube.devices || {}), [entity]: action },
    });
  }

  /** take a device out of the stretch entirely */
  private _clearDeviceAction(group: PlanGroup, cube: PlanCube, entity: string) {
    const devices = { ...(cube.devices || {}) };
    delete devices[entity];
    this._updateCube(group.track, cube.id, { devices });
  }

  /** the keyboard's flip: on, off, and out of the stretch altogether */
  private _toggleOverride(group: PlanGroup, cube: PlanCube, entity: string) {
    const action = cubeActionFor(cube, entity);
    if (!action) {
      this._setDeviceAction(group, cube, entity, plainAction(entity, true));
      return;
    }
    const opposite = invertOnOffAction(action);
    if (opposite) this._setDeviceAction(group, cube, entity, opposite);
    else this._clearDeviceAction(group, cube, entity);
  }

  /** brightness and warmth, for the devices that have them */
  private _renderLightFields(action: Action, onChange: (action: Action) => void) {
    if (isOffAction(action)) return nothing;

    const data = action.service_data || {};
    const brightness = data.brightness_pct ?? (
      data.brightness !== undefined ? Math.round((data.brightness / 255) * 100) : undefined
    );
    const kelvin = data.color_temp_kelvin;

    const set = (changes: Record<string, any>) => {
      const service_data = { ...data, ...changes };
      Object.keys(service_data).forEach(key => {
        if (service_data[key] === undefined) delete service_data[key];
      });
      onChange({ ...action, service_data });
    };

    return html`
      <div class="field">
        <span class="field-label">${this._t('light.brightness')}</span>
        <div class="field-row">
          <input
            type="range" min="1" max="100" step="1"
            .value=${String(brightness ?? 100)}
            ?disabled=${brightness === undefined}
            @input=${(ev: Event) => set({
      brightness_pct: Number((ev.target as HTMLInputElement).value),
      brightness: undefined,
    })}
          />
          <span class="field-value">${brightness === undefined ? '—' : `${brightness}%`}</span>
          <button
            class="ghost small"
            @click=${() => set({
      brightness_pct: brightness === undefined ? 100 : undefined,
      brightness: undefined,
    })}
          >${brightness === undefined ? this._t('light.set') : this._t('light.clear')}</button>
        </div>
      </div>

      <div class="field">
        <span class="field-label">${this._t('light.warmth')}</span>
        <div class="field-row">
          <input
            class="kelvin"
            type="range" min="2000" max="6500" step="100"
            .value=${String(kelvin ?? 2700)}
            ?disabled=${kelvin === undefined}
            @input=${(ev: Event) => set({ color_temp_kelvin: Number((ev.target as HTMLInputElement).value) })}
          />
          <span class="field-value">
            ${kelvin === undefined
        ? '—'
        : `${kelvin}K · ${this._t(kelvin <= 3200 ? 'light.warm' : kelvin <= 4800 ? 'light.neutral' : 'light.cool')}`}
          </span>
          <button
            class="ghost small"
            @click=${() => set({ color_temp_kelvin: kelvin === undefined ? 2700 : undefined })}
          >${kelvin === undefined ? this._t('light.set') : this._t('light.clear')}</button>
        </div>
      </div>
    `;
  }

  private _renderEnforceField(enforce: boolean | undefined, onChange: (enforce: boolean) => void) {
    return html`
      <div class="field">
        <span class="field-label">
          ${this._t('enforce.label')} <span class="beta">${this._t('enforce.beta')}</span>
        </span>
        <div class="segmented">
          <button class=${enforce ? '' : 'active'} @click=${() => onChange(false)}>
            ${this._t('enforce.off')}
          </button>
          <button class=${enforce ? 'active' : ''} @click=${() => onChange(true)}>
            ${this._t('enforce.on')}
          </button>
        </div>
        <span class="field-resolved">${this._t('enforce.hint')}</span>
      </div>
    `;
  }

  /** set every device of the stretch at once - a shortcut, not a state */
  private _renderAllDevicesField(group: PlanGroup, cube: PlanCube) {
    const setAll = (make: (entity: string) => Action | null) => {
      const devices: Record<string, Action> = {};
      group.entities.forEach(entity => {
        const action = make(entity);
        if (action) devices[entity] = action;
      });
      this._updateCube(group.track, cube.id, { devices });
    };

    return html`
      <div class="field">
        <span class="field-label">${this._t('device.all')}</span>
        <div class="segmented states">
          <button class="on" @click=${() => setAll(e => plainAction(e, true))}>
            ${this._t('state.on')}
          </button>
          <button class="off" @click=${() => setAll(e => plainAction(e, false))}>
            ${this._t('state.off')}
          </button>
          <button class="none" @click=${() => setAll(() => null)}>
            ${this._t('device.untouched')}
          </button>
        </div>
        <span class="field-resolved">${this._t('device.all_hint')}</span>
      </div>
    `;
  }

  private _renderColorField(color: string | undefined, onChange: (color: string | undefined) => void) {
    return html`
      <div class="field">
        <span class="field-label">${this._t('color.label')}</span>
        <div class="swatches">
          <button
            class="swatch auto ${color ? '' : 'active'}"
            title=${this._t('color.auto')}
            @click=${() => onChange(undefined)}
          >A</button>
          ${PALETTE.map(
      value => html`
            <button
              class="swatch ${color == value ? 'active' : ''}"
              style="background:${value}"
              @click=${() => onChange(value)}
            ></button>`
    )}
        </div>
      </div>
    `;
  }

  // --- the wizard ----------------------------------------------------------
  //
  // A way in for somebody who does not want to think about anchors at all. It
  // never replaces the editor: it builds a plan and hands it straight over.

  private get _wizardSteps() {
    return ['intro', 'devices', 'opening', 'moments', 'settings', 'hold', 'review'];
  }

  /**
   * Where a stretch ends, written the way the engine stores it.
   *
   * A clock time is tied to the day the stretch is running on, which is what
   * keeps it inside the band on a festival: before the small hours it belongs
   * to the evening the band opened, afterwards to the day it closes.
   */
  private _momentBoundary(moment: EndTime) {
    const [hours, minutes] = moment.time.split(':').map(Number);

    if (moment.when == 'end') {
      return this._boundaryString({
        anchor: this._plan.endAnchor,
        mode: 'offset',
        hours: hours || 0,
        minutes: minutes || 0,
        before: moment.before !== false,
      });
    }

    if (moment.when == 'sunset') {
      // sunset itself, not a halachic time - offered because people think in it
      const sign = moment.before ? -1 : 1;
      return timeToString(<Time>{
        mode: TimeMode.Sunset,
        hours: sign * (hours || 0),
        minutes: sign * (minutes || 0),
      });
    }

    // a clock time before roughly 04:00 is still that night; anything later is
    // the following day, which is the day the band closes on
    const evening = (hours || 0) >= 16;
    return this._boundaryString({
      anchor: evening ? this._plan.startAnchor : this._plan.endAnchor,
      mode: 'clock',
      hours: hours || 0,
      minutes: minutes || 0,
      before: false,
    });
  }

  /**
   * A caution about a time that may not land the same way every week.
   *
   * A clock time is fixed while the band's ends move through the year, so one
   * that works this Shabbat can fall outside the band on another - and a
   * stretch that falls outside simply never runs, leaving the devices as the
   * stretch before it left them.
   */
  private _momentCaution(moment: WizardMoment): string | null {
    const at = this._moment(this._momentBoundary(moment));
    const start = this._bandStart;
    const end = this._bandEnd;
    if (!at || !start || !end) return this._t('wizard.caution.unknown');

    if (at <= start || at >= end) {
      const shown = this._formatMoment(this._momentBoundary(moment));
      // the sun is drawn from an estimate of the day's sunset, so a sun
      // boundary near an edge is worth a word rather than a verdict
      return this._t(
        moment.when == 'sunset' ? 'wizard.caution.estimate' : 'wizard.caution.outside',
        '{time}',
        shown
      );
    }
    if (moment.when != 'clock') return null;

    const marginHours = Math.min(
      (at.getTime() - start.getTime()) / 3600000,
      (end.getTime() - at.getTime()) / 3600000
    );
    if (marginHours < 1.5) {
      return this._t('wizard.caution.tight', '{time}', moment.time);
    }
    return this._t('wizard.caution.hard', '{time}', moment.time);
  }

  /**
   * What is wrong with the day as it stands, checked on every keystroke.
   *
   * Two kinds of wrong, and they are not the same kind at all:
   *
   * Blocking - the day cannot be built like this. A moment that falls outside
   * the band, or two moments landing on the same minute, would leave a stretch
   * with no length; there is nothing to warn about, it simply has to change,
   * so the wizard will not move on until it does.
   *
   * Worth saying - a clock time works this week and may not work another. The
   * band's ends move by more than an hour across the year, so 23:00 is
   * comfortably inside it in December and outside it in June. Nothing breaks
   * when that happens: the stretch just does not run, and the one before it
   * carries on until the next boundary that does land. That is the behaviour,
   * and it is worth knowing at the moment the time is being typed rather than
   * six months later.
   */
  private _wizardProblems(): { blocking: string[]; warnings: string[] } {
    const blocking: string[] = [];
    const warnings: string[] = [];
    const start = this._bandStart;
    const end = this._bandEnd;
    const named = (moment: WizardMoment) => moment.name || this._t('cube.unnamed');

    const placed = this._wizard.moments.map(moment => ({
      moment,
      boundary: this._momentBoundary(moment),
      at: this._moment(this._momentBoundary(moment)),
    }));

    placed.forEach(({ moment, boundary, at }) => {
      if (!/^\d{1,2}:\d{2}$/.test(moment.time || '')) {
        blocking.push(this._t('wizard.problem.no_time', '{name}', named(moment)));
        return;
      }
      if (!at) {
        // the anchor has not published anything yet; the boundary itself is
        // fine, so this is worth saying and not worth stopping for
        warnings.push(this._t('wizard.problem.unknown', '{name}', named(moment)));
        return;
      }
      if (!start || !end || (at > start && at < end)) return;
      const message = this._t(
        'wizard.problem.outside',
        ['{name}', '{time}'],
        [named(moment), this._formatMoment(boundary)]
      );
      // a sun boundary is only drawn from an estimate of the day's sunset, so
      // it is worth saying and not solid enough to stop on
      if (moment.when == 'sunset') warnings.push(message);
      else blocking.push(message);
    });

    // two moments on the same minute would leave nothing in between them
    const byMinute = new Map<number, string[]>();
    placed.forEach(({ moment, at }) => {
      if (!at) return;
      const minute = Math.floor(at.getTime() / 60000);
      byMinute.set(minute, [...(byMinute.get(minute) || []), named(moment)]);
    });
    byMinute.forEach(names => {
      if (names.length > 1) {
        blocking.push(this._t('wizard.problem.collide', '{names}', names.join(' · ')));
      }
    });

    const hard = placed.filter(entry => entry.moment.when == 'clock');
    if (hard.length) {
      warnings.push(this._t(
        'wizard.problem.hard',
        '{names}',
        hard.map(entry => named(entry.moment)).join(' · ')
      ));
    }
    hard.forEach(({ moment, at }) => {
      if (!at || !start || !end) return;
      const margin = Math.min(
        at.getTime() - start.getTime(),
        end.getTime() - at.getTime()
      ) / 3600000;
      if (margin > 0 && margin < 1.5) {
        warnings.push(this._t(
          'wizard.problem.tight',
          ['{name}', '{hours}'],
          [named(moment), margin.toFixed(1)]
        ));
      }
    });

    return { blocking, warnings };
  }

  /** whether this step is allowed to hand over to the next one */
  private _wizardBlocked(step: string) {
    if (step == 'devices') return !this._wizard.entities.length;
    if (step == 'moments') return this._wizardProblems().blocking.length > 0;
    return false;
  }

  /** the moments in the order they actually happen, and the ones that cannot */
  private _wizardTimeline() {
    const start = this._bandStart;
    const end = this._bandEnd;
    const placed = this._wizard.moments.map(moment => {
      const boundary = this._momentBoundary(moment);
      const at = this._moment(boundary);
      const within = !!(at && start && end && at > start && at < end);
      // a sun boundary is placed here from an estimate; the engine reads the
      // real sunset on the day, so one sitting on an edge is kept rather than
      // quietly dropped out of the plan
      const inside = within || !!(at && moment.when == 'sunset');
      return { moment, boundary, at, inside };
    });
    const inside = placed
      .filter(entry => entry.inside)
      .sort((a, b) => a.at!.getTime() - b.at!.getTime());
    return { inside, outside: placed.filter(entry => !entry.inside) };
  }

  private _updateMoment(id: string, changes: Partial<WizardMoment>) {
    this._wizard = {
      ...this._wizard,
      moments: this._wizard.moments.map(m => (m.id == id ? { ...m, ...changes } : m)),
    };
  }

  private _addMoment(preset?: MomentDefault) {
    const moment: WizardMoment = {
      id: `m${this._wizard.moments.length}-${preset?.key || 'new'}`,
      name: preset ? this._t(`wizard.preset.${preset.key}`) : '',
      when: preset?.when || 'clock',
      time: preset?.time || '12:00',
      before: preset?.before,
      on: preset ? preset.on : true,
    };
    this._wizard = { ...this._wizard, moments: [...this._wizard.moments, moment] };
  }

  private _removeMoment(id: string) {
    this._wizard = {
      ...this._wizard,
      moments: this._wizard.moments.filter(m => m.id != id),
    };
  }

  private _renderWizard() {
    const step = this._wizardSteps[this._wizardStep!];
    const last = this._wizardStep == this._wizardSteps.length - 1;
    const blocked = this._wizardBlocked(step);

    return html`
      <div class="wizard">
        <div class="wizard-progress">
          ${this._wizardSteps.map((_s, i) => html`<span class="dot ${i <= this._wizardStep! ? 'done' : ''}"></span>`)}
        </div>

        <h2 class="wizard-title">
          ${this._t(`wizard.${step}.title`)}
          <span class="wizard-count">
            ${this._t('wizard.step_of', ['{n}', '{total}'],
      [String(this._wizardStep! + 1), String(this._wizardSteps.length)])}
          </span>
          ${this._helpFor(`step_${step}`)}
        </h2>
        <p class="wizard-body">${this._t(`wizard.${step}.body`)}</p>
        ${this._helpText(`step_${step}`)}

        ${step == 'devices' ? this._renderWizardDevices() : nothing}
        ${step == 'opening' ? this._renderWizardOpening() : nothing}
        ${step == 'moments' ? this._renderWizardMoments() : nothing}
        ${step == 'settings' ? this._renderWizardSettings() : nothing}
        ${step == 'hold' ? this._renderWizardHold() : nothing}
        ${step == 'review' ? this._renderWizardReview() : nothing}

        <div class="wizard-buttons">
          <button class="ghost" @click=${() => {
        if (this._wizardStep! > 0) this._wizardStep = this._wizardStep! - 1;
        else this._wizardStep = null;
      }}>
            ${this._wizardStep! > 0 ? this._t('wizard.back') : hassLocalize('ui.common.cancel', this.hass)}
          </button>
          <button
            class="ghost primary"
            ?disabled=${blocked}
            title=${blocked ? this._t('wizard.blocked') : ''}
            @click=${() => (last ? this._finishWizard() : (this._wizardStep = this._wizardStep! + 1))}
          >
            ${last ? this._t('wizard.finish') : this._t('wizard.next')}
          </button>
        </div>
      </div>
    `;
  }

  /**
   * The devices, taken from the book first.
   *
   * The book is where the household has already said what things are called
   * and which of them belong together, so that is what is offered: a group in
   * one click, a device in one click. The raw entity list is still there for
   * something the book has never heard of, but it is not what anybody should
   * have to read to set up a Shabbat.
   */
  private _renderWizardDevices() {
    const picked = new Set(this._wizard.entities);
    const setEntities = (entities: string[]) => {
      this._wizard = { ...this._wizard, entities: [...new Set(entities)] };
    };
    const label = (entity: string, alias?: string | null) =>
      alias || this.hass.states[entity]?.attributes.friendly_name || entity;

    return html`
      <div class="wizard-devices">
        ${this._book.groups.length ? html`
        <div class="field">
          <span class="field-label">
            ${this._t('wizard.devices.groups')}${this._helpFor('book_groups')}
          </span>
          ${this._helpText('book_groups')}
          <div class="member-chips">
            ${this._book.groups.map(group => {
      const members = groupDevices(this._book, group.name);
      return html`
            <button class="chip" @click=${() => setEntities([...this._wizard.entities, ...members])}>
              <ha-svg-icon .path=${mdiPlus}></ha-svg-icon>${group.name}
              <span class="chip-action">
                ${this._t('group.members', '{n}', String(members.length))}
              </span>
            </button>`;
    })}
          </div>
        </div>` : nothing}

        <div class="field">
          <span class="field-label">
            ${this._t('wizard.devices.book')}${this._helpFor('book_devices')}
          </span>
          ${this._helpText('book_devices')}
          ${this._book.devices.length
        ? html`
          <div class="member-chips">
            ${this._book.devices.map(device => html`
            <button
              class="chip device ${picked.has(device.entity_id) ? 'on' : ''}"
              @click=${() => setEntities(
          picked.has(device.entity_id)
            ? this._wizard.entities.filter(e => e != device.entity_id)
            : [...this._wizard.entities, device.entity_id]
        )}
            >
              <span class="device-dot ${picked.has(device.entity_id) ? '' : 'none'}"></span>
              ${label(device.entity_id, device.alias)}
            </button>`)}
          </div>`
        : html`<p class="wizard-empty">${this._t('wizard.devices.no_book')}</p>`}
        </div>

        <button class="ghost small" @click=${() => { this._wizardAdvanced = !this._wizardAdvanced; }}>
          ${this._t(this._wizardAdvanced ? 'wizard.devices.simple' : 'wizard.devices.advanced')}
        </button>

        ${this._wizardAdvanced ? html`
        <div class="field">
          <span class="field-resolved">${this._t('wizard.devices.advanced_hint')}</span>
          <scheduler-entity-picker
            .hass=${this.hass}
            .config=${this._params!.cardConfig}
            .value=${this._wizard.entities}
            multiple
            @value-changed=${(ev: CustomEvent) => setEntities(ev.detail.value)}
          ></scheduler-entity-picker>
        </div>` : nothing}

        <p class="wizard-empty">
          ${this._wizard.entities.length
        ? this._t('wizard.devices.chosen', '{n}', String(this._wizard.entities.length))
        : this._t('wizard.devices.none')}
        </p>
      </div>
    `;
  }

  /** what the house is doing the moment the plan takes over */
  private _renderWizardOpening() {
    return html`
      <div class="field">
        <span class="field-label">
          ${this._t('wizard.opening.label')}${this._helpFor('opening')}
        </span>
        ${this._helpText('opening')}
        <div class="segmented big states">
          <button class="on ${this._wizard.onAtCandleLighting ? 'active' : ''}"
            @click=${() => { this._wizard = { ...this._wizard, onAtCandleLighting: true }; }}>
            ${this._t('state.on')}
          </button>
          <button class="off ${this._wizard.onAtCandleLighting ? '' : 'active'}"
            @click=${() => { this._wizard = { ...this._wizard, onAtCandleLighting: false }; }}>
            ${this._t('state.off')}
          </button>
        </div>
        <span class="field-resolved">
          ${this._t('wizard.opening.at', '{time}',
      this._formatMoment(`${this._plan.startAnchor}+00:00:00`))}
        </span>
      </div>
    `;
  }

  /** hold the state, or leave a device wherever somebody else put it */
  private _renderWizardHold() {
    const hold = this._wizard.hold ?? HOLDS_BY_DEFAULT;
    return html`
      <div class="field">
        <span class="field-label">
          ${this._t('enforce.label')} <span class="beta">${this._t('enforce.beta')}</span>
          ${this._helpFor('hold')}
        </span>
        ${this._helpText('hold')}
        <div class="segmented big">
          <button class=${hold ? 'active' : ''}
            @click=${() => { this._wizard = { ...this._wizard, hold: true }; }}>
            ${this._t('enforce.on')}
          </button>
          <button class=${hold ? '' : 'active'}
            @click=${() => { this._wizard = { ...this._wizard, hold: false }; }}>
            ${this._t('enforce.off')}
          </button>
        </div>
        <span class="field-resolved">${this._t('enforce.hint')}</span>
      </div>
    `;
  }

  private _renderWizardMoments() {
    const used = new Set(this._wizard.moments.map(m => m.name));
    const suggestions = this._prefs.moments.filter(
      preset => !used.has(this._t(`wizard.preset.${preset.key}`))
    );

    return html`
      <div class="moment-presets">
        ${suggestions.map(
      preset => html`
          <button class="chip" @click=${() => this._addMoment(preset)}>
            <ha-svg-icon .path=${mdiPlus}></ha-svg-icon>${this._t(`wizard.preset.${preset.key}`)}
          </button>`
    )}
      </div>

      ${this._wizard.moments.length
        ? html`
      <div class="moments">
        ${this._wizard.moments.map(moment => this._renderWizardMoment(moment))}
      </div>`
        : html`<p class="wizard-empty">${this._t('wizard.moments.empty')}</p>`}

      <button class="ghost" @click=${() => this._addMoment()}>
        <ha-svg-icon .path=${mdiPlus}></ha-svg-icon>${this._t('wizard.moments.add')}
      </button>

      ${this._renderWizardProblems()}
    `;
  }

  /** what is wrong, and what is merely worth knowing, as it is being typed */
  private _renderWizardProblems() {
    const { blocking, warnings } = this._wizardProblems();
    if (!blocking.length && !warnings.length) return nothing;

    return html`
      <div class="wizard-checks">
        ${blocking.map(problem => html`
        <p class="wizard-warning blocking">
          <span class="mark">✕</span>${problem}
        </p>`)}
        ${warnings.map(warning => html`
        <p class="wizard-warning">
          <span class="mark">⚠</span>${warning}
        </p>`)}
      </div>
    `;
  }

  /**
   * Where a moment ends, offered the way people say it.
   *
   * Shared with the settings, where the same three choices set the household's
   * own default for each moment, so both places behave identically.
   */
  private _endPicker(value: EndTime, onChange: (changes: Partial<EndTime>) => void) {
    return html`
      <select
        title=${this._t('wizard.when.hint')}
        @change=${(ev: Event) =>
        onChange({ when: (ev.target as HTMLSelectElement).value as EndKind })}
      >
        <option value="clock" ?selected=${value.when == 'clock'}>${this._t('wizard.when.clock')}</option>
        <option value="sunset" ?selected=${value.when == 'sunset'}>${this._t('wizard.when.sunset')}</option>
        <option value="end" ?selected=${value.when == 'end'}>${this._t('wizard.when.end')}</option>
      </select>
      ${value.when == 'clock' ? nothing : html`
      <div class="segmented modes">
        <button class=${value.before ? 'active' : ''} @click=${() => onChange({ before: true })}>
          ${this._t('boundary.before')}
        </button>
        <button class=${value.before ? '' : 'active'} @click=${() => onChange({ before: false })}>
          ${this._t('boundary.after')}
        </button>
      </div>`}
      <input
        type="time"
        class="time-input"
        .value=${value.time}
        @change=${(ev: Event) => onChange({ time: (ev.target as HTMLInputElement).value })}
      />
    `;
  }

  private _renderWizardMoment(moment: WizardMoment) {
    const at = this._moment(this._momentBoundary(moment));
    const caution = this._momentCaution(moment);
    const outside = !!(at && this._bandStart && this._bandEnd
      && (at <= this._bandStart || at >= this._bandEnd)
      && moment.when != 'sunset');

    return html`
      <div class="moment ${outside ? 'wrong' : ''}">
        <input
          class="moment-name"
          .value=${moment.name}
          placeholder=${this._t('wizard.moments.name')}
          @input=${(ev: Event) => this._updateMoment(moment.id, { name: (ev.target as HTMLInputElement).value })}
        />
        ${this._endPicker(moment, changes => this._updateMoment(moment.id, changes))}
        <div class="segmented states">
          <button class="on ${moment.on ? 'active' : ''}"
            @click=${() => this._updateMoment(moment.id, { on: true })}>
            ${this._t('state.on')}
          </button>
          <button class="off ${moment.on ? '' : 'active'}"
            @click=${() => this._updateMoment(moment.id, { on: false })}>
            ${this._t('state.off')}
          </button>
        </div>
        <span class="moment-at">${at ? this._formatMoment(this._momentBoundary(moment)) : '—'}</span>
        ${caution
        ? html`<span class="moment-caution ${outside ? 'wrong' : ''}" title=${caution}>
            ${outside ? '✕' : '⚠'}
          </span>`
        : nothing}
        <button class="icon-only" title=${hassLocalize('ui.common.delete', this.hass)}
          @click=${() => this._removeMoment(moment.id)}>
          <ha-svg-icon .path=${mdiClose}></ha-svg-icon>
        </button>
      </div>
    `;
  }

  /**
   * Moment by moment, what each device does.
   *
   * This is where a plan stops being "everything on" and becomes usable: the
   * salon air conditioner during the meal, the bedrooms afterwards, one light
   * bright and another dim. A device left alone simply does whatever the
   * moment does.
   */
  private _renderWizardSettings() {
    const moments = this._wizardTimeline().inside;
    const domainOf = (entity: string) => entity.split('.')[0];
    const act = (on: boolean, entity: string) => ({
      service: `${domainOf(entity)}.turn_${on ? 'on' : 'off'}`,
      service_data: {},
    });

    const opening = {
      id: '',
      name: this._t('cube.welcome'),
      on: this._wizard.onAtCandleLighting,
      overrides: this._wizard.openingOverrides,
      at: `${this._plan.startAnchor}+00:00:00`,
    };
    const entries = [
      opening,
      ...moments.map(entry => ({
        id: entry.moment.id,
        name: entry.moment.name || this._t('cube.unnamed'),
        on: entry.moment.on,
        overrides: entry.moment.overrides,
        at: entry.boundary,
      })),
    ];

    return html`
      <div class="wizard-settings">
        ${entries.map(entry => html`
        <div class="wizard-moment">
          <div class="wizard-moment-head">
            <span class="review-name">${entry.name}</span>
            <span class="review-at">${this._formatMoment(entry.at)}</span>
            <div class="segmented states">
              <button class="on ${entry.on ? 'active' : ''}"
                @click=${() => this._setMomentDefault(entry.id, true)}>${this._t('state.on')}</button>
              <button class="off ${entry.on ? '' : 'active'}"
                @click=${() => this._setMomentDefault(entry.id, false)}>${this._t('state.off')}</button>
            </div>
          </div>
          <div class="device-rows">
            ${this._wizard.entities.map(entity => {
      const own = entry.overrides?.[entity];
      return this._deviceRow(
        entity,
        own || act(entry.on, entity),
        action => this._setMomentDevice(entry.id, entity, action),
        () => this._setMomentDevice(entry.id, entity, null)
      );
    })}
          </div>
        </div>`)}
      </div>
    `;
  }

  private _setMomentDefault(id: string, on: boolean) {
    if (!id) {
      this._wizard = { ...this._wizard, onAtCandleLighting: on };
      return;
    }
    this._updateMoment(id, { on });
  }

  private _setMomentDevice(id: string, entity: string, action: Action | null) {
    const apply = (overrides?: Record<string, Action>) => {
      const next = { ...(overrides || {}) };
      if (action) next[entity] = action;
      else delete next[entity];
      return Object.keys(next).length ? next : undefined;
    };
    if (!id) {
      this._wizard = { ...this._wizard, openingOverrides: apply(this._wizard.openingOverrides) };
      return;
    }
    const moment = this._wizard.moments.find(m => m.id == id);
    this._updateMoment(id, { overrides: apply(moment?.overrides) });
  }

  /** the day read back as a list, so it can be checked before it is built */
  private _renderWizardReview() {
    const { inside, outside } = this._wizardTimeline();
    const opening = this._t(this._wizard.onAtCandleLighting ? 'state.on' : 'state.off');

    return html`
      <ol class="review">
        <li>
          <span class="review-at">${this._formatMoment(`${this._plan.startAnchor}+00:00:00`)}</span>
          <span class="review-name">${this._t('cube.welcome')}</span>
          <span class="review-state ${this._wizard.onAtCandleLighting ? 'on' : 'off'}">${opening}</span>
        </li>
        ${inside.map(
      entry => html`
        <li>
          <span class="review-at">${this._formatMoment(entry.boundary)}</span>
          <span class="review-name">${entry.moment.name || this._t('cube.unnamed')}</span>
          <span class="review-state ${entry.moment.on ? 'on' : 'off'}">
            ${this._t(entry.moment.on ? 'state.on' : 'state.off')}
          </span>
        </li>`
    )}
        <li class="review-end">
          <span class="review-at">${this._formatMoment(`${this._plan.endAnchor}+00:00:00`)}</span>
          <span class="review-name">${this._t('anchor.closes')}</span>
        </li>
      </ol>

      ${outside.length
        ? html`<p class="wizard-warning">
            <span class="mark">⚠</span>
            ${this._t('wizard.review.outside', '{names}',
      outside.map(e => e.moment.name || this._t('cube.unnamed')).join(', '))}
          </p>`
        : nothing}

      ${this._renderWizardProblems()}
    `;
  }

  /** turn the answers into a plan and hand it to the editor */
  private _finishWizard() {
    const answers = this._wizard;
    const act = (on: boolean, entity: string) => plainAction(entity, on);

    // a moment is a boundary; the stretches are what lies between them
    const boundaries = [
      {
        at: `${this._plan.startAnchor}+00:00:00`,
        on: answers.onAtCandleLighting,
        name: this._t('cube.welcome'),
        overrides: answers.openingOverrides,
      },
      ...this._wizardTimeline().inside.map(entry => ({
        at: entry.boundary,
        on: entry.moment.on,
        name: entry.moment.name || this._t('cube.unnamed'),
        overrides: entry.moment.overrides,
      })),
    ];

    const track = groupTrack(this._t('group.default'));
    const cubes: PlanCube[] = boundaries.map((boundary, i) => {
      const devices: Record<string, Action> = {};
      answers.entities.forEach(entity => {
        devices[entity] = boundary.overrides?.[entity] || act(boundary.on, entity);
      });
      return {
        id: `${track}#${i}`,
        name: boundary.name,
        start: boundary.at,
        stop: i + 1 < boundaries.length
          ? boundaries[i + 1].at
          : `${this._plan.endAnchor}+01:30:00`,
        devices,
        enforce: answers.hold ?? HOLDS_BY_DEFAULT,
      };
    });

    this._updatePlan({
      groups: [{ track, name: this._t('group.default'), entities: answers.entities, cubes }],
      detaches: [],
    });
    this._selected = cubes[0].id;
    this._wizardStep = null;
    this._offerWizard = false;
  }

  static get styles() {
    return css`
      :host {
        --plan-radius: 14px;
        --plan-on: var(--rgb-state-active-color, 67, 160, 71);
        --plan-off: var(--rgb-secondary-text-color, 114, 114, 114);
        --plan-detach: 245, 158, 11;
      }
      ha-dialog {
        --dialog-content-padding: 0px;
        --dialog-surface-padding: 0px;
      }
      .content {
        padding: 20px 24px 24px 24px;
        display: flex;
        flex-direction: column;
        gap: 18px;
      }

      /* --- header --- */
      .plan-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        flex-wrap: wrap;
      }
      .plan-title { display: flex; align-items: center; gap: 8px; }
      .plan-name {
        font-size: 24px;
        font-weight: 600;
        letter-spacing: -0.01em;
        color: var(--primary-text-color);
        background: none;
        border: none;
        border-bottom: 2px solid transparent;
        padding: 2px 0;
        min-width: 180px;
        outline: none;
      }
      .plan-name:hover { border-bottom-color: var(--divider-color); }
      .plan-name:focus { border-bottom-color: var(--primary-color); }

      .anchors { display: flex; align-items: center; gap: 12px; }
      .anchor {
        display: flex;
        flex-direction: column;
        padding: 8px 14px;
        border-radius: 999px;
        background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.09);
      }
      .anchor-label {
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: var(--secondary-text-color);
      }
      .anchor-value {
        font-size: 14px;
        font-weight: 600;
        color: var(--primary-text-color);
        font-variant-numeric: tabular-nums;
      }
      /* reads the same whichever way the page runs */
      .anchor-arrow {
        width: 28px;
        height: 2px;
        border-radius: 2px;
        background: repeating-linear-gradient(
          to right,
          rgba(var(--rgb-primary-color, 3, 169, 244), 0.5) 0 4px,
          transparent 4px 8px
        );
      }

      /* --- the offer and the help --- */
      .offer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        flex-wrap: wrap;
        padding: 12px 16px;
        border-radius: var(--plan-radius);
        background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.08);
        font-size: 14px;
        color: var(--primary-text-color);
      }
      .offer-actions { display: flex; gap: 8px; }
      .help {
        border-inline-start: 3px solid var(--primary-color);
        background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.05);
        border-radius: 8px;
        padding: 12px 16px;
        font-size: 13px;
        line-height: 1.6;
        color: var(--primary-text-color);
      }
      .help p { margin: 0 0 8px 0; }
      .help p:last-child { margin-bottom: 0; }

      /* the answer to a "?" asked somewhere in particular */
      .help-toggle { --mdc-icon-size: 16px; }
      .help-toggle ha-svg-icon { width: 16px; height: 16px; }
      .help-toggle.active { color: var(--primary-color); }
      .help-note {
        align-self: stretch;
        margin: 0;
        padding: 10px 14px;
        border-inline-start: 3px solid var(--primary-color);
        background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.06);
        border-radius: 8px;
        font-size: 13px;
        line-height: 1.65;
        color: var(--primary-text-color);
        max-width: 62ch;
      }

      /* --- the band --- */
      .band {
        border-radius: var(--plan-radius);
        padding: 12px 14px 14px 14px;
        background: var(--card-background-color);
        border: 1px solid var(--divider-color);
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04), 0 8px 24px rgba(0, 0, 0, 0.04);
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .ruler {
        position: relative;
        height: 18px;
        margin-inline-start: 132px;
        border-bottom: 1px solid var(--divider-color);
      }
      .tick {
        position: absolute;
        top: 0;
        transform: translateX(-50%);
        font-size: 11px;
        font-variant-numeric: tabular-nums;
        color: var(--secondary-text-color);
      }
      .row { display: flex; align-items: stretch; gap: 8px; min-height: 52px; }
      .row-label {
        width: 124px;
        flex: 0 0 124px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        overflow: hidden;
      }
      .row-name {
        font-size: 14px;
        font-weight: 600;
        color: var(--primary-text-color);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .row-meta { font-size: 11px; color: var(--secondary-text-color); }
      .track {
        position: relative;
        flex: 1;
        border-radius: 10px;
        touch-action: none;
        background: repeating-linear-gradient(
          to right,
          rgba(var(--rgb-secondary-text-color, 114, 114, 114), 0.05) 0 1px,
          transparent 1px 60px
        );
      }
      .row.detached .track {
        background: rgba(var(--rgb-secondary-text-color, 114, 114, 114), 0.04);
        border: 1px dashed var(--divider-color);
      }

      .cube {
        position: absolute;
        top: 4px;
        bottom: 4px;
        border: none;
        border-radius: 10px;
        padding: 0 8px;
        cursor: pointer;
        font: inherit;
        color: var(--text-primary-color, #fff);
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        overflow: hidden;
        transition: transform 120ms ease, box-shadow 120ms ease, filter 120ms ease;
      }
      .cube:hover { filter: brightness(1.06); }
      /* plain on/off: unmistakable at a glance, not a matter of shade */
      .cube.tone-on { background: linear-gradient(160deg, rgba(var(--plan-on), 0.95), rgba(var(--plan-on), 0.78)); }
      .cube.tone-off { background: linear-gradient(160deg, rgba(var(--plan-off), 0.5), rgba(var(--plan-off), 0.34)); }
      .cube.tone-mixed {
        background: repeating-linear-gradient(
          135deg,
          rgba(var(--plan-on), 0.85) 0 10px,
          rgba(var(--plan-off), 0.5) 10px 20px
        );
      }
      .cube.tone-empty {
        background: repeating-linear-gradient(
          135deg,
          rgba(var(--rgb-secondary-text-color, 114, 114, 114), 0.18) 0 6px,
          transparent 6px 12px
        );
        color: var(--secondary-text-color);
        border: 1px dashed var(--divider-color);
      }
      :host([plain]) .segmented button.on.active { background: rgb(var(--plan-on)); }
      :host([plain]) .segmented button.off.active { background: rgba(var(--plan-off), 0.85); }
      .segmented button.none.active {
        background: repeating-linear-gradient(
          135deg,
          var(--divider-color) 0 5px,
          transparent 5px 10px
        );
        color: var(--secondary-text-color);
      }
      .device-row.untouched { opacity: 0.62; border-style: dashed; }
      .device-row.untouched .device-label { color: var(--secondary-text-color); }
      .device-dot.none {
        background: transparent;
        border: 1px dashed var(--secondary-text-color);
      }
      :host([plain]) .device-dot.on { background: rgb(var(--plan-on)); }
      :host([plain]) .device-dot.off { background: rgba(var(--plan-off), 0.55); }
      .report-device.untouched {
        background: transparent;
        border: 1px dashed var(--divider-color);
        color: var(--secondary-text-color);
      }

      .cube.on {
        background: linear-gradient(160deg, rgba(var(--plan-on), 0.95), rgba(var(--plan-on), 0.75));
      }
      .cube.off {
        background: linear-gradient(160deg, rgba(var(--plan-off), 0.55), rgba(var(--plan-off), 0.38));
      }
      .cube.detach {
        background: linear-gradient(160deg, rgba(var(--plan-detach), 0.95), rgba(var(--plan-detach), 0.7));
        color: #1a1200;
      }
      .cube.selected {
        box-shadow: 0 0 0 2px var(--card-background-color), 0 0 0 4px var(--primary-color);
        transform: translateY(-1px);
      }
      .cube-name {
        font-size: 12px;
        font-weight: 600;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .cube-tools { display: inline-flex; gap: 2px; flex: 0 0 auto; }
      .cube-tool {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 20px;
        height: 20px;
        border-radius: 6px;
        background: rgba(0, 0, 0, 0.22);
      }
      .cube-tool:hover { background: rgba(0, 0, 0, 0.38); }
      .cube-tool ha-svg-icon { --mdc-icon-size: 14px; width: 14px; height: 14px; }

      /* the grab line between two stretches, as on the ordinary time bar */
      .handle {
        position: absolute;
        top: 0;
        bottom: 0;
        width: 14px;
        margin-inline-start: -7px;
        cursor: ew-resize;
        touch-action: none;
        z-index: 2;
      }
      .handle::after {
        content: '';
        position: absolute;
        top: 8px;
        bottom: 8px;
        inset-inline-start: 6px;
        width: 2px;
        border-radius: 2px;
        background: transparent;
      }
      .handle:hover::after { background: rgba(255, 255, 255, 0.85); }

      .row-actions { margin-inline-start: 132px; }

      /* --- inspector --- */
      .inspector {
        border-radius: var(--plan-radius);
        border: 1px solid var(--divider-color);
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 16px;
        background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.03);
      }
      .inspector.detached {
        background: rgba(var(--plan-detach), 0.06);
        border-color: rgba(var(--plan-detach), 0.35);
      }
      .inspector-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        flex-wrap: wrap;
      }
      .cube-title {
        font-size: 18px;
        font-weight: 600;
        color: var(--primary-text-color);
        background: none;
        border: none;
        border-bottom: 2px solid transparent;
        padding: 2px 0;
        outline: none;
        min-width: 160px;
      }
      .cube-title:hover { border-bottom-color: var(--divider-color); }
      .cube-title:focus { border-bottom-color: var(--primary-color); }
      .inspector-actions { display: flex; gap: 8px; }
      .detach-note { font-size: 13px; color: var(--secondary-text-color); margin-top: -8px; }
      .hint { font-size: 12px; color: var(--secondary-text-color); }

      .fields { display: flex; flex-wrap: wrap; gap: 20px; align-items: flex-start; }
      .field { display: flex; flex-direction: column; gap: 6px; }
      .field.boundary {
        padding: 10px 12px;
        border-radius: 10px;
        background: var(--card-background-color);
        border: 1px solid var(--divider-color);
      }
      .field-label {
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: var(--secondary-text-color);
      }
      .field-row { display: flex; gap: 6px; align-items: center; }
      .field-resolved {
        font-size: 12px;
        color: var(--secondary-text-color);
        font-variant-numeric: tabular-nums;
      }
      select, input[type="time"], input[type="date"] {
        font: inherit;
        font-size: 13px;
        color: var(--primary-text-color);
        background: var(--card-background-color);
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        padding: 7px 9px;
        outline: none;
      }
      select:focus, input:focus { border-color: var(--primary-color); }
      .time-input { font-variant-numeric: tabular-nums; }

      .segmented {
        display: inline-flex;
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        overflow: hidden;
        align-self: flex-start;
      }
      .segmented button {
        font: inherit;
        font-size: 13px;
        border: none;
        background: var(--card-background-color);
        color: var(--secondary-text-color);
        padding: 7px 12px;
        cursor: pointer;
        white-space: nowrap;
      }
      .segmented button.active {
        background: var(--primary-color);
        color: var(--text-primary-color, #fff);
        font-weight: 600;
      }
      .segmented.big button { font-size: 15px; padding: 12px 28px; }
      .segmented.modes button { font-size: 12px; padding: 6px 10px; }
      .sign {
        font: inherit;
        font-size: 13px;
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        background: var(--card-background-color);
        color: var(--primary-text-color);
        padding: 7px 10px;
        cursor: pointer;
      }

      .overrides { display: flex; flex-direction: column; gap: 8px; }
      .overrides > label {
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: var(--secondary-text-color);
      }
      .device-rows { display: flex; flex-direction: column; gap: 6px; }
      .device-row {
        display: flex;
        align-items: center;
        gap: 12px;
        flex-wrap: wrap;
        padding: 8px 12px;
        border-radius: 10px;
        border: 1px solid var(--divider-color);
        background: var(--card-background-color);
      }
      .device-row.own { border-color: rgba(var(--plan-detach), 0.55); }
      .device-label {
        display: flex;
        align-items: center;
        gap: 8px;
        min-width: 190px;
        font-size: 13px;
        font-weight: 600;
        color: var(--primary-text-color);
      }
      .follows { font-style: normal; font-size: 11px; font-weight: 400; color: var(--secondary-text-color); }
      .link {
        font: inherit;
        font-size: 11px;
        font-weight: 600;
        border: none;
        background: none;
        padding: 0;
        cursor: pointer;
        color: rgba(var(--plan-detach), 1);
      }
      .param {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        color: var(--secondary-text-color);
      }
      .param input[type="range"] { width: 96px; }
      .chip.device { gap: 8px; }
      .device-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: rgba(var(--plan-off), 0.5);
        flex: 0 0 auto;
      }
      .chip.device.on .device-dot { background: rgb(var(--plan-on)); }
      .chip.device.overridden {
        border-color: rgba(var(--plan-detach), 0.8);
        box-shadow: inset 0 0 0 1px rgba(var(--plan-detach), 0.35);
      }
      .device-state { font-size: 11px; color: var(--secondary-text-color); font-weight: 600; }

      input[type="range"] { width: 150px; accent-color: var(--primary-color); }
      input[type="range"].kelvin {
        accent-color: #ffb060;
        background: linear-gradient(to right, #ffb060, #ffffff);
        border-radius: 999px;
      }
      input[type="range"][disabled] { opacity: 0.35; }
      .field-value {
        font-size: 12px;
        color: var(--secondary-text-color);
        font-variant-numeric: tabular-nums;
        min-width: 72px;
      }
      /* a start is read back, not asked for: the stretch before it decides */
      .field-value.fixed {
        font-size: 15px;
        font-weight: 600;
        color: var(--primary-text-color);
        padding: 6px 0;
      }
      .hint.spans { flex-basis: 100%; max-width: 62ch; }
      .ghost.small { font-size: 11px; padding: 4px 8px; }
      .beta {
        font-size: 9px;
        letter-spacing: 0.04em;
        padding: 1px 5px;
        border-radius: 4px;
        background: rgba(var(--plan-detach), 0.2);
        color: var(--primary-text-color);
      }

      .book {
        border-radius: var(--plan-radius);
        border: 1px solid var(--divider-color);
        background: var(--card-background-color);
        overflow: hidden;
      }
      .book-head {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 16px;
        border-bottom: 1px solid var(--divider-color);
      }
      .book-body { display: flex; flex-wrap: wrap; gap: 20px; padding: 14px 16px; }
      .book-groups { display: flex; flex-direction: column; gap: 6px; min-width: 260px; }
      .book-group {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 10px;
        border-radius: 8px;
        background: rgba(var(--rgb-secondary-text-color, 114, 114, 114), 0.06);
      }
      .book-group.new { background: none; border: 1px dashed var(--divider-color); }
      .book-group-name { font-size: 13px; font-weight: 600; flex: 1; }
      .book-group-count { font-size: 11px; color: var(--secondary-text-color); }
      .book-devices { display: flex; flex-direction: column; gap: 6px; flex: 1; min-width: 280px; }

      .swatches { display: flex; flex-wrap: wrap; gap: 6px; max-width: 240px; }

      /* --- shortcuts and the report --- */
      .keys {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
        gap: 6px 20px;
        padding: 14px 16px;
        border-radius: var(--plan-radius);
        border: 1px solid var(--divider-color);
        background: var(--card-background-color);
      }
      .key-row { display: flex; align-items: center; gap: 10px; font-size: 13px; }
      .key-row span { color: var(--secondary-text-color); }
      kbd {
        font-family: inherit;
        font-size: 11px;
        font-weight: 600;
        min-width: 62px;
        text-align: center;
        padding: 3px 6px;
        border-radius: 6px;
        border: 1px solid var(--divider-color);
        border-bottom-width: 2px;
        background: rgba(var(--rgb-secondary-text-color, 114, 114, 114), 0.06);
        color: var(--primary-text-color);
      }

      .report {
        border-radius: var(--plan-radius);
        border: 1px solid var(--divider-color);
        background: var(--card-background-color);
        overflow: hidden;
      }
      .report-head {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 16px;
        border-bottom: 1px solid var(--divider-color);
      }
      .report-title { font-size: 15px; font-weight: 600; color: var(--primary-text-color); }
      .report-band {
        flex: 1;
        font-size: 12px;
        color: var(--secondary-text-color);
        font-variant-numeric: tabular-nums;
      }
      .report-saved {
        padding: 10px 16px;
        font-size: 13px;
        font-weight: 600;
        color: rgb(var(--plan-on));
        background: rgba(var(--plan-on), 0.1);
      }
      .report-problem {
        padding: 10px 16px;
        font-size: 13px;
        color: var(--error-color, #db4437);
        background: rgba(219, 68, 55, 0.08);
      }
      .report-list { list-style: none; margin: 0; padding: 0; }
      .report-list li {
        display: flex;
        gap: 14px;
        padding: 10px 16px;
        border-top: 1px solid var(--divider-color);
      }
      .report-list li:first-child { border-top: none; }
      .report-at {
        font-size: 12px;
        color: var(--secondary-text-color);
        font-variant-numeric: tabular-nums;
        min-width: 96px;
        padding-top: 2px;
      }
      .report-what { display: flex; flex-direction: column; gap: 6px; flex: 1; }
      .report-name {
        font-size: 14px;
        font-weight: 600;
        color: var(--primary-text-color);
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
      }
      .report-group { font-size: 11px; font-weight: 400; color: var(--secondary-text-color); }
      .report-devices { display: flex; flex-wrap: wrap; gap: 6px; }
      .report-device {
        font-size: 12px;
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 3px 10px;
        border-radius: 999px;
        background: rgba(var(--rgb-secondary-text-color, 114, 114, 114), 0.1);
        color: var(--primary-text-color);
      }
      :host([plain]) .report-device.off { background: rgba(var(--plan-off), 0.18); }
      :host([plain]) .report-device.on { background: rgba(var(--plan-on), 0.15); }
      .report-device b { font-weight: 700; }
      .report-device i { font-style: normal; color: var(--secondary-text-color); }
      .report-device em {
        font-style: normal;
        font-size: 11px;
        color: rgba(var(--plan-detach), 1);
        font-weight: 600;
      }
      .icon-only[disabled] { opacity: 0.35; cursor: default; }

      .swatch {
        width: 26px;
        height: 26px;
        border-radius: 8px;
        border: 1px solid var(--divider-color);
        cursor: pointer;
        padding: 0;
        font: inherit;
        font-size: 11px;
        font-weight: 700;
        color: var(--secondary-text-color);
        background: var(--card-background-color);
      }
      .swatch.active { box-shadow: 0 0 0 2px var(--card-background-color), 0 0 0 4px var(--primary-color); }

      .members { display: flex; flex-direction: column; gap: 8px; }
      .members > label {
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: var(--secondary-text-color);
      }
      .member-chips { display: flex; flex-wrap: wrap; gap: 6px; }
      .chip {
        font: inherit;
        font-size: 12px;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        border: 1px solid var(--divider-color);
        border-radius: 999px;
        background: var(--card-background-color);
        color: var(--primary-text-color);
        padding: 5px 12px;
        cursor: pointer;
      }
      .chip:hover { border-color: rgba(var(--plan-detach), 0.8); }
      .chip-action { font-size: 11px; color: rgba(var(--plan-detach), 1); font-weight: 600; }

      .ghost, .icon-only {
        font: inherit;
        font-size: 13px;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        background: none;
        color: var(--primary-text-color);
        padding: 6px 12px;
        cursor: pointer;
      }
      .icon-only { padding: 6px; }
      .icon-only.active { background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.15); }
      .ghost:hover, .icon-only:hover { background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.08); }
      .ghost[disabled] { opacity: 0.4; cursor: default; }
      .ghost.danger { color: var(--error-color, #db4437); }
      .ghost.primary {
        background: var(--primary-color);
        border-color: var(--primary-color);
        color: var(--text-primary-color, #fff);
        font-weight: 600;
      }
      .ghost ha-svg-icon, .icon-only ha-svg-icon {
        --mdc-icon-size: 18px;
        width: 18px;
        height: 18px;
      }

      /* --- wizard --- */
      .wizard {
        display: flex;
        flex-direction: column;
        gap: 16px;
        align-items: flex-start;
        min-height: 320px;
        padding: 8px 0;
        /* the buttons belong beside the question, not at the far edge of a
           wide dialog */
        width: 100%;
        max-width: 640px;
        margin-inline: auto;
      }
      .wizard-settings {
        align-self: stretch;
        display: flex;
        flex-direction: column;
        gap: 14px;
        max-height: 46vh;
        overflow-y: auto;
      }
      .wizard-moment {
        border: 1px solid var(--divider-color);
        border-radius: 10px;
        padding: 10px 12px;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .wizard-moment-head {
        display: flex;
        align-items: center;
        gap: 12px;
        flex-wrap: wrap;
      }
      .wizard-moment-head .review-name { flex: 1; }
      .wizard-progress { display: flex; gap: 6px; }
      .dot {
        width: 28px;
        height: 4px;
        border-radius: 2px;
        background: var(--divider-color);
      }
      .dot.done { background: var(--primary-color); }
      .wizard-title {
        font-size: 22px;
        font-weight: 600;
        margin: 0;
        color: var(--primary-text-color);
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
      }
      .wizard-count {
        font-size: 12px;
        font-weight: 500;
        color: var(--secondary-text-color);
        letter-spacing: 0.02em;
      }
      .wizard-devices {
        align-self: stretch;
        display: flex;
        flex-direction: column;
        gap: 14px;
      }
      .wizard-body {
        font-size: 15px;
        line-height: 1.6;
        margin: 0;
        color: var(--secondary-text-color);
        max-width: 52ch;
      }
      .wizard-row { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
      .wizard-empty { font-size: 13px; color: var(--secondary-text-color); margin: 0; }
      .wizard-warning {
        font-size: 13px;
        line-height: 1.6;
        margin: 0;
        padding: 10px 12px;
        border-radius: 8px;
        background: rgba(var(--plan-detach), 0.12);
        color: var(--primary-text-color);
        display: flex;
        gap: 8px;
        align-items: flex-start;
      }
      .wizard-warning .mark { flex: none; font-weight: 700; }
      /* a blocking problem is not a shade of warning: it stops the wizard */
      .wizard-warning.blocking {
        background: rgba(var(--rgb-error-color, 229, 57, 53), 0.14);
        border-inline-start: 3px solid var(--error-color, #e53935);
      }
      .wizard-warning.blocking .mark { color: var(--error-color, #e53935); }
      .wizard-checks {
        align-self: stretch;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .moment-presets { display: flex; flex-wrap: wrap; gap: 6px; }
      .moment-presets .chip ha-svg-icon {
        --mdc-icon-size: 14px;
        width: 14px;
        height: 14px;
      }
      .moments { display: flex; flex-direction: column; gap: 8px; align-self: stretch; }
      .moment {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
        padding: 8px 10px;
        border-radius: 10px;
        border: 1px solid var(--divider-color);
        background: var(--card-background-color);
      }
      .moment-name {
        font: inherit;
        font-size: 14px;
        font-weight: 600;
        color: var(--primary-text-color);
        background: none;
        border: none;
        border-bottom: 1px solid transparent;
        outline: none;
        min-width: 120px;
        flex: 1;
        padding: 4px 0;
      }
      .moment-name:hover { border-bottom-color: var(--divider-color); }
      .moment-name:focus { border-bottom-color: var(--primary-color); }
      .moment-at {
        font-size: 12px;
        color: var(--secondary-text-color);
        font-variant-numeric: tabular-nums;
        min-width: 92px;
      }
      /* a moment that cannot be built is marked as such, where it is typed */
      .moment.wrong {
        border-color: var(--error-color, #e53935);
        background: rgba(var(--rgb-error-color, 229, 57, 53), 0.06);
      }
      .moment-caution {
        font-size: 14px;
        line-height: 1;
        cursor: help;
        color: rgb(var(--plan-detach));
      }
      .moment-caution.wrong { color: var(--error-color, #e53935); font-weight: 700; }
      .moment-fixed-name {
        font-size: 14px;
        font-weight: 600;
        color: var(--primary-text-color);
        min-width: 120px;
        flex: 1;
      }
      .moments.defaults .moment { background: transparent; }

      .review {
        align-self: stretch;
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
      }
      .review li {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 12px;
        border-inline-start: 2px solid var(--divider-color);
      }
      .review li:first-child { border-start-start-radius: 8px; }
      .review-at {
        font-size: 12px;
        color: var(--secondary-text-color);
        font-variant-numeric: tabular-nums;
        min-width: 96px;
      }
      .review-name { font-size: 14px; font-weight: 600; flex: 1; color: var(--primary-text-color); }
      .review-state {
        font-size: 12px;
        font-weight: 600;
        padding: 3px 10px;
        border-radius: 999px;
      }
      .review-state {
        background: rgba(var(--rgb-secondary-text-color, 114, 114, 114), 0.12);
        color: var(--secondary-text-color);
      }
      :host([plain]) .review-state.on {
        background: rgba(var(--plan-on), 0.18);
        color: rgb(var(--plan-on));
      }
      :host([plain]) .review-state.off {
        background: rgba(var(--plan-off), 0.18);
        color: var(--secondary-text-color);
      }
      .review-end { opacity: 0.7; }
      .wizard-buttons {
        display: flex;
        gap: 8px;
        margin-top: auto;
        padding-top: 16px;
        align-self: stretch;
        justify-content: space-between;
      }

      .empty {
        border: 1px dashed var(--divider-color);
        border-radius: var(--plan-radius);
        padding: 28px;
        text-align: center;
      }
      .empty-title { font-size: 16px; font-weight: 600; color: var(--primary-text-color); }
      .empty-body { font-size: 13px; color: var(--secondary-text-color); margin-top: 6px; }

      .error { color: var(--error-color, #db4437); font-size: 13px; }
      .buttons {
        box-sizing: border-box;
        display: flex;
        padding: 16px 24px;
        justify-content: space-between;
        border-top: 1px solid var(--divider-color);
      }
    `;
  }
}
