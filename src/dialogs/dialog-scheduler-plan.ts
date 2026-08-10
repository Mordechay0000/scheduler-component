import {
  mdiCallSplit,
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
  DEFAULT_END_ANCHOR,
  DEFAULT_START_ANCHOR,
  Plan,
  PlanCube,
  PlanDetach,
  PlanGroup,
  defaultPlan,
  detachTrack,
  groupTrack,
  planFromSchedule,
  planToSchedule,
} from "../data/plan/plan_model";

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
type WizardWhen = 'eve' | 'day' | 'before_end';

type WizardMoment = {
  id: string;
  name: string;
  when: WizardWhen;
  /** a clock time for 'eve' and 'day'; a duration for 'before_end' */
  time: string;
  on: boolean;
};

type WizardAnswers = {
  entities: string[];
  onAtCandleLighting: boolean;
  moments: WizardMoment[];
};

/** starting points, so the common day is a few clicks rather than a form */
const MOMENT_PRESETS: { key: string; when: WizardWhen; time: string; on: boolean }[] = [
  { key: 'meal_eve', when: 'eve', time: '20:00', on: true },
  { key: 'sleep', when: 'eve', time: '23:00', on: false },
  { key: 'morning', when: 'day', time: '07:00', on: true },
  { key: 'meal_day', when: 'day', time: '12:00', on: true },
  { key: 'nap', when: 'day', time: '14:30', on: false },
  { key: 'close', when: 'before_end', time: '00:30', on: true },
];

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
  };

  @state() private _history: Plan[] = [];
  @state() private _future: Plan[] = [];
  @state() private _keys = false;
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
    this._wizardStep = null;
    this._history = [];
    this._future = [];
    this._report = null;
    this._saved = false;
    this._keys = false;
    // a brand new plan is where the step-by-step path is worth offering
    this._offerWizard = !params.schedule;
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
        this._showReport();
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
        action: this._invert(selected.cube),
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

  // --- the band -----------------------------------------------------------

  private get _bandStart() {
    return resolveBoundary(`${this._plan.startAnchor}+00:00:00`, this.hass);
  }

  private get _bandEnd() {
    return resolveBoundary(`${this._plan.endAnchor}+01:30:00`, this.hass);
  }

  private _moment(value: string) {
    return resolveBoundary(value, this.hass, this._bandStart || undefined);
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

  /** boundary `index` is the start of cube `index` and the stop of the one before */
  private _moveBoundary(track: string, index: number, value: string, coalesce?: string) {
    const group = this._plan.groups.find(g => g.track == track);
    if (!group || !this._moment(value)) return;

    const cubes = group.cubes.map((cube, i) => {
      if (i == index) return { ...cube, start: value };
      if (i == index - 1) return { ...cube, stop: value };
      return cube;
    });
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
      // a stretch with no length left has been absorbed by its neighbour
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
      // a new stretch defaults to the opposite of the one it came out of,
      // which is what the ordinary editor does when a slot is carved
      action: this._invert(cube),
    };
    const cubes = [...group.cubes];
    cubes.splice(index, 1, { ...cube, stop: boundary }, second);
    this._setCubes(group.track, cubes);
    this._selected = second.id;
  }

  private _invert(cube: PlanCube) {
    const domain = cube.action.service.split('.')[0];
    const turning = computeEntity(cube.action.service) == 'turn_off' ? 'turn_on' : 'turn_off';
    return { ...cube.action, service: `${domain}.${turning}`, service_data: {} };
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
    this._updatePlan({
      groups: this._plan.groups.map(g => (g.track == group.track ? { ...g, entities } : g)),
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
          <button class="ghost" @click=${this._showReport}>
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
          <button class="icon-only" @click=${() => { this._report = null; }}>
            <ha-svg-icon .path=${mdiClose}></ha-svg-icon>
          </button>
        </div>

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
                  <b>${this._t(device.state == 'on' ? 'state.on' : 'state.off')}</b>
                  ${device.brightness !== undefined ? html`<i>${device.brightness}%</i>` : nothing}
                  ${device.kelvin !== undefined ? html`<i>${device.kelvin}K</i>` : nothing}
                  ${device.own ? html`<em>${this._t('report.own')}</em>` : nothing}
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

  /** an explicit colour wins; otherwise the action decides, as it does on the bar */
  private _cubeStyle(cube: PlanCube) {
    if (cube.color) {
      return `background:${cube.color};color:#fff`;
    }
    const fromAction = computeActionColor(cube.action);
    if (fromAction) {
      const [r, g, b] = fromAction.rgb;
      return `background:rgba(${r},${g},${b},${fromAction.alpha})`;
    }
    return '';
  }

  private _renderCube(group: PlanGroup, cube: PlanCube) {
    const from = this._position(cube.start);
    const to = this._position(cube.stop);
    if (from === null || to === null || to <= from) return nothing;

    const off = isOffAction(cube.action);
    const selected = this._selected == cube.id;
    return html`
      <button
        class="cube ${off ? 'off' : 'on'} ${selected ? 'selected' : ''}"
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

        <div class="fields">
          ${this._renderBoundaryField(this._t('boundary.from'), cube.start, value =>
          this._updateCube(group.track, cube.id, { start: value })
        )}
          ${this._renderBoundaryField(this._t('boundary.to'), cube.stop, value =>
          this._updateCube(group.track, cube.id, { stop: value })
        )}
          ${this._renderStateField(isOffAction(cube.action), off =>
          this._updateCube(group.track, cube.id, {
            action: {
              ...cube.action,
              service: `${cube.action.service.split('.')[0]}.${off ? 'turn_off' : 'turn_on'}`,
            },
          })
        )}
          ${this._renderLightFields(cube.action, action =>
          this._updateCube(group.track, cube.id, { action })
        )}
          ${this._renderColorField(cube.color, color => this._updateCube(group.track, cube.id, { color }))}
          ${this._renderEnforceField(cube.enforce, enforce =>
          this._updateCube(group.track, cube.id, { enforce })
        )}
        </div>

        ${this._renderOverrides(group, cube)}

        <div class="members">
          <label>${this._t('group.devices')}</label>
          <scheduler-entity-picker
            .hass=${this.hass}
            .config=${this._params!.cardConfig}
            .value=${group.entities}
            multiple
            @value-changed=${(ev: CustomEvent) => this._setMembers(group, ev.detail.value)}
          ></scheduler-entity-picker>
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
   * The devices of the group, each showing what it does in this stretch.
   *
   * Clicking one flips it away from the group and back again, so a stretch
   * where the lights are on but the hotplate is off is two clicks rather than
   * a second copy of the whole timeline.
   */
  private _renderOverrides(group: PlanGroup, cube: PlanCube) {
    if (group.entities.length < 2) return nothing;
    const groupIsOff = isOffAction(cube.action);

    return html`
      <div class="overrides">
        <label>${this._t('override.label')}</label>
        <div class="member-chips">
          ${group.entities.map(entity => {
      const own = cube.overrides?.[entity];
      const off = own ? isOffAction(own) : groupIsOff;
      return html`
            <button
              class="chip device ${off ? 'off' : 'on'} ${own ? 'overridden' : ''}"
              title=${own ? this._t('override.back') : this._t('override.flip')}
              @click=${() => this._toggleOverride(group, cube, entity)}
            >
              <span class="device-dot"></span>
              ${this.hass.states[entity]?.attributes.friendly_name || entity}
              <span class="device-state">${this._t(off ? 'state.off' : 'state.on')}</span>
            </button>`;
    })}
        </div>
        <span class="hint">${this._t('override.hint')}</span>
      </div>
    `;
  }

  private _toggleOverride(group: PlanGroup, cube: PlanCube, entity: string) {
    const overrides = { ...(cube.overrides || {}) };
    if (overrides[entity]) {
      // back with the group
      delete overrides[entity];
    } else {
      const opposite = invertOnOffAction(cube.action);
      if (!opposite) return;
      overrides[entity] = opposite;
    }
    this._updateCube(group.track, cube.id, {
      overrides: Object.keys(overrides).length ? overrides : undefined,
    });
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
    return ['intro', 'devices', 'candle', 'moments', 'review'];
  }

  /** where a moment sits, written the way the engine stores it */
  private _momentBoundary(moment: WizardMoment) {
    const [hours, minutes] = moment.time.split(':').map(Number);
    if (moment.when == 'before_end') {
      return this._boundaryString({
        anchor: this._plan.endAnchor,
        mode: 'offset',
        hours: hours || 0,
        minutes: minutes || 0,
        before: true,
      });
    }
    return this._boundaryString({
      anchor: moment.when == 'eve' ? this._plan.startAnchor : this._plan.endAnchor,
      mode: 'clock',
      hours: hours || 0,
      minutes: minutes || 0,
      before: false,
    });
  }

  /** the moments in the order they actually happen, and the ones that cannot */
  private _wizardTimeline() {
    const start = this._bandStart;
    const end = this._bandEnd;
    const placed = this._wizard.moments.map(moment => {
      const boundary = this._momentBoundary(moment);
      const at = this._moment(boundary);
      const inside = !!(at && start && end && at > start && at < end);
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

  private _addMoment(preset?: { key: string; when: WizardWhen; time: string; on: boolean }) {
    const moment: WizardMoment = {
      id: `m${this._wizard.moments.length}-${preset?.key || 'new'}`,
      name: preset ? this._t(`wizard.preset.${preset.key}`) : '',
      when: preset?.when || 'day',
      time: preset?.time || '12:00',
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

    return html`
      <div class="wizard">
        <div class="wizard-progress">
          ${this._wizardSteps.map((_s, i) => html`<span class="dot ${i <= this._wizardStep! ? 'done' : ''}"></span>`)}
        </div>

        <h2 class="wizard-title">${this._t(`wizard.${step}.title`)}</h2>
        <p class="wizard-body">${this._t(`wizard.${step}.body`)}</p>

        ${step == 'devices' ? html`
        <scheduler-entity-picker
          .hass=${this.hass}
          .config=${this._params!.cardConfig}
          .value=${this._wizard.entities}
          multiple
          @value-changed=${(ev: CustomEvent) => { this._wizard = { ...this._wizard, entities: ev.detail.value }; }}
        ></scheduler-entity-picker>` : nothing}

        ${step == 'candle' ? html`
        <div class="segmented big">
          <button
            class=${this._wizard.onAtCandleLighting ? 'active' : ''}
            @click=${() => { this._wizard = { ...this._wizard, onAtCandleLighting: true }; }}
          >${this._t('state.on')}</button>
          <button
            class=${this._wizard.onAtCandleLighting ? '' : 'active'}
            @click=${() => { this._wizard = { ...this._wizard, onAtCandleLighting: false }; }}
          >${this._t('state.off')}</button>
        </div>` : nothing}

        ${step == 'moments' ? this._renderWizardMoments() : nothing}
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
            ?disabled=${step == 'devices' && !this._wizard.entities.length}
            @click=${() => (last ? this._finishWizard() : (this._wizardStep = this._wizardStep! + 1))}
          >
            ${last ? this._t('wizard.finish') : this._t('wizard.next')}
          </button>
        </div>
      </div>
    `;
  }

  private _renderWizardMoments() {
    const used = new Set(this._wizard.moments.map(m => m.name));
    const suggestions = MOMENT_PRESETS.filter(p => !used.has(this._t(`wizard.preset.${p.key}`)));

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
    `;
  }

  private _renderWizardMoment(moment: WizardMoment) {
    const at = this._moment(this._momentBoundary(moment));
    return html`
      <div class="moment">
        <input
          class="moment-name"
          .value=${moment.name}
          placeholder=${this._t('wizard.moments.name')}
          @input=${(ev: Event) => this._updateMoment(moment.id, { name: (ev.target as HTMLInputElement).value })}
        />
        <select
          @change=${(ev: Event) =>
        this._updateMoment(moment.id, { when: (ev.target as HTMLSelectElement).value as WizardWhen })}
        >
          <option value="eve" ?selected=${moment.when == 'eve'}>${this._t('wizard.when.eve')}</option>
          <option value="day" ?selected=${moment.when == 'day'}>${this._t('wizard.when.day')}</option>
          <option value="before_end" ?selected=${moment.when == 'before_end'}>
            ${this._t('wizard.when.before_end')}
          </option>
        </select>
        <input
          type="time"
          class="time-input"
          .value=${moment.time}
          @change=${(ev: Event) => this._updateMoment(moment.id, { time: (ev.target as HTMLInputElement).value })}
        />
        <div class="segmented">
          <button class=${moment.on ? 'active' : ''} @click=${() => this._updateMoment(moment.id, { on: true })}>
            ${this._t('state.on')}
          </button>
          <button class=${moment.on ? '' : 'active'} @click=${() => this._updateMoment(moment.id, { on: false })}>
            ${this._t('state.off')}
          </button>
        </div>
        <span class="moment-at">${at ? this._formatMoment(this._momentBoundary(moment)) : '—'}</span>
        <button class="icon-only" title=${hassLocalize('ui.common.delete', this.hass)}
          @click=${() => this._removeMoment(moment.id)}>
          <ha-svg-icon .path=${mdiClose}></ha-svg-icon>
        </button>
      </div>
    `;
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
            ${this._t('wizard.review.outside', '{names}',
      outside.map(e => e.moment.name || this._t('cube.unnamed')).join(', '))}
          </p>`
        : nothing}
    `;
  }

  /** turn the answers into a plan and hand it to the editor */
  private _finishWizard() {
    const answers = this._wizard;
    const domain = answers.entities[0]?.split('.')[0] || 'switch';
    const act = (on: boolean) => ({ service: `${domain}.turn_${on ? 'on' : 'off'}`, service_data: {} });

    // a moment is a boundary; the stretches are what lies between them
    const boundaries = [
      {
        at: `${this._plan.startAnchor}+00:00:00`,
        on: answers.onAtCandleLighting,
        name: this._t('cube.welcome'),
      },
      ...this._wizardTimeline().inside.map(entry => ({
        at: entry.boundary,
        on: entry.moment.on,
        name: entry.moment.name || this._t('cube.unnamed'),
      })),
    ];

    const track = groupTrack(this._t('group.default'));
    const cubes: PlanCube[] = boundaries.map((boundary, i) => ({
      id: `${track}#${i}`,
      name: boundary.name,
      start: boundary.at,
      stop: i + 1 < boundaries.length
        ? boundaries[i + 1].at
        : `${this._plan.endAnchor}+01:30:00`,
      action: act(boundary.on),
    }));

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
      .ghost.small { font-size: 11px; padding: 4px 8px; }
      .beta {
        font-size: 9px;
        letter-spacing: 0.04em;
        padding: 1px 5px;
        border-radius: 4px;
        background: rgba(var(--plan-detach), 0.2);
        color: var(--primary-text-color);
      }

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
        background: rgba(var(--plan-off), 0.12);
        color: var(--primary-text-color);
      }
      .report-device.on { background: rgba(var(--plan-on), 0.15); }
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
      .wizard-progress { display: flex; gap: 6px; }
      .dot {
        width: 28px;
        height: 4px;
        border-radius: 2px;
        background: var(--divider-color);
      }
      .dot.done { background: var(--primary-color); }
      .wizard-title { font-size: 22px; font-weight: 600; margin: 0; color: var(--primary-text-color); }
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
        margin: 0;
        padding: 10px 12px;
        border-radius: 8px;
        background: rgba(var(--plan-detach), 0.12);
        color: var(--primary-text-color);
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
      .review-state.on {
        background: rgba(var(--plan-on), 0.18);
        color: rgb(var(--plan-on));
      }
      .review-state.off {
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
