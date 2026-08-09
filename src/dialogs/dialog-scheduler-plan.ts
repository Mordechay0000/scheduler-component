import { mdiClose, mdiPlus, mdiTrashCanOutline, mdiCallSplit, mdiUndoVariant } from "@mdi/js";
import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators";
import { CardConfig, Schedule, TConditionLogicType, TRepeatType, TWeekday, Time, TimeMode } from "../types";
import { HomeAssistant } from "../lib/types";
import { localize } from "../localize/localize";
import { hassLocalize } from "../localize/hassLocalize";
import { fireEvent } from "../lib/fire_event";
import { saveSchedule } from "../data/store/save_schedule";
import { updateSchedule } from "../data/store/update_schedule";
import { deleteSchedule } from "../data/store/delete_schedule";
import { handleWebsocketError } from "../data/store/handle_websocket_error";
import { parseTimeString } from "../data/time/parse_time_string";
import { timeToString } from "../data/time/time_to_string";
import { isOffAction } from "../data/format/is_off_action";
import { computeEntity } from "../lib/entity";
import { resolveBoundary } from "../data/plan/resolve_boundary";
import {
  DEFAULT_END_ANCHOR,
  DEFAULT_START_ANCHOR,
  DETACH_PRIORITY,
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

/** which anchor a boundary hangs off, and how */
type BoundaryAnchor = 'start' | 'end' | 'fixed';
type BoundaryMode = 'offset' | 'clock';

type BoundaryParts = {
  anchor: BoundaryAnchor;
  mode: BoundaryMode;
  /** always positive; `before` carries the direction */
  hours: number;
  minutes: number;
  before: boolean;
};

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

@customElement('dialog-scheduler-plan')
export class DialogSchedulerPlan extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @state() private _params?: PlanDialogParams;
  @state() private _plan!: Plan;
  @state() private _selected: string | null = null;
  @state() private _error: string | null = null;

  private _base: Schedule = emptySchedule();

  public async showDialog(params: PlanDialogParams): Promise<void> {
    this._params = params;
    this._base = params.schedule ? { ...params.schedule } : emptySchedule();
    this._plan = params.schedule
      ? planFromSchedule(params.schedule)
      : defaultPlan(this._t('title'), [
        this._t('cube.welcome'),
        this._t('cube.night'),
        this._t('cube.morning'),
        this._t('cube.afternoon'),
        this._t('cube.close'),
        this._t('group.default'),
      ]);
    this._selected = this._plan.groups[0]?.cubes[0]?.id ?? null;
    this._error = null;
    await this.updateComplete;
  }

  public async closeDialog() {
    this._params = undefined;
  }

  private _t(key: string, search?: string | string[], replace?: string | string[]) {
    return localize(`ui.panel.plan.${key}`, this.hass, search || [], replace || []);
  }

  // --- the band -----------------------------------------------------------
  //
  // A plan is drawn against real dates: the band opens on one evening and
  // closes on another, so every stretch is placed by where it actually falls
  // rather than by a reading on a 24-hour clock.

  private get _bandStart() {
    return resolveBoundary(`${this._plan.startAnchor}+00:00:00`, this.hass);
  }

  private get _bandEnd() {
    return resolveBoundary(`${this._plan.endAnchor}+01:30:00`, this.hass);
  }

  private _position(value: string) {
    const start = this._bandStart;
    const end = this._bandEnd;
    if (!start || !end) return null;
    const span = end.getTime() - start.getTime();
    if (span <= 0) return null;
    const moment = resolveBoundary(value, this.hass, start);
    if (!moment) return null;
    return Math.min(1, Math.max(0, (moment.getTime() - start.getTime()) / span));
  }

  private _formatMoment(value: string) {
    const moment = resolveBoundary(value, this.hass, this._bandStart || undefined);
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
    const anchor: BoundaryAnchor =
      parsed.entity_id == this._plan.startAnchor
        ? 'start'
        : parsed.entity_id == this._plan.endAnchor
          ? 'end'
          : 'fixed';
    return {
      anchor,
      mode: parsed.mode == TimeMode.EntityDay || anchor == 'fixed' ? 'clock' : 'offset',
      hours: Math.abs(parsed.hours),
      minutes: Math.abs(parsed.minutes),
      before: parsed.hours < 0 || parsed.minutes < 0,
    };
  }

  private _boundaryString(parts: BoundaryParts): string {
    if (parts.anchor == 'fixed') {
      return timeToString(<Time>{ mode: TimeMode.Fixed, hours: parts.hours, minutes: parts.minutes });
    }
    const entity_id = parts.anchor == 'start' ? this._plan.startAnchor : this._plan.endAnchor;
    if (parts.mode == 'clock') {
      return timeToString(<Time>{ mode: TimeMode.EntityDay, hours: parts.hours, minutes: parts.minutes, entity_id });
    }
    const sign = parts.before ? -1 : 1;
    return timeToString(<Time>{
      mode: TimeMode.Entity,
      hours: sign * parts.hours,
      minutes: sign * parts.minutes,
      entity_id,
    });
  }

  // --- editing -------------------------------------------------------------

  private _updatePlan(plan: Partial<Plan>) {
    this._plan = { ...this._plan, ...plan };
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
    const template = defaultPlan(this._plan.name, [
      this._t('cube.welcome'),
      this._t('cube.night'),
      this._t('cube.morning'),
      this._t('cube.afternoon'),
      this._t('cube.close'),
      name,
    ]).groups[0];
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
    const middle = this._midpoint(cube.start, cube.stop);
    if (!middle) return;
    const first = { ...cube, stop: middle };
    const second: PlanCube = {
      ...cube,
      id: `${group.track}#new${Date.now()}`,
      name: '',
      start: middle,
      action: this._invert(cube),
    };
    const cubes = [...group.cubes];
    cubes.splice(index, 1, first, second);
    this._updatePlan({
      groups: this._plan.groups.map(g => (g.track == group.track ? { ...g, cubes } : g)),
    });
    this._selected = second.id;
  }

  private _midpoint(start: string, stop: string) {
    const a = resolveBoundary(start, this.hass, this._bandStart || undefined);
    const b = resolveBoundary(stop, this.hass, this._bandStart || undefined);
    if (!a || !b || b.getTime() <= a.getTime()) return null;
    const middle = new Date((a.getTime() + b.getTime()) / 2);
    middle.setMinutes(Math.round(middle.getMinutes() / 15) * 15, 0, 0);
    // the split lands on the day the stretch runs through, which is what "@"
    // is for - a plain clock time would leak out of the band
    const anchor = middle.getTime() - a.getTime() < b.getTime() - middle.getTime()
      ? start
      : stop;
    const anchorEntity = parseTimeString(anchor).entity_id;
    if (!anchorEntity) {
      return timeToString(<Time>{ mode: TimeMode.Fixed, hours: middle.getHours(), minutes: middle.getMinutes() });
    }
    return timeToString(<Time>{
      mode: TimeMode.EntityDay,
      hours: middle.getHours(),
      minutes: middle.getMinutes(),
      entity_id: anchorEntity,
    });
  }

  private _invert(cube: PlanCube) {
    const domain = cube.action.service.split('.')[0];
    const turning = computeEntity(cube.action.service) == 'turn_off' ? 'turn_on' : 'turn_off';
    return { ...cube.action, service: `${domain}.${turning}`, service_data: {} };
  }

  private _removeCube(group: PlanGroup, cube: PlanCube) {
    if (group.cubes.length < 2) return;
    const cubes = group.cubes.filter(c => c.id != cube.id);
    const index = group.cubes.findIndex(c => c.id == cube.id);
    // the neighbour takes over the stretch that was given up
    if (index > 0) cubes[index - 1] = { ...cubes[index - 1], stop: cube.stop };
    else cubes[0] = { ...cubes[0], start: cube.start };
    this._updatePlan({
      groups: this._plan.groups.map(g => (g.track == group.track ? { ...g, cubes } : g)),
    });
    this._selected = cubes[Math.max(0, index - 1)].id;
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
      this.closeDialog();
    } catch (e) {
      this._reportError(e);
    }
  }

  private async _delete() {
    if (this._base.schedule_id) {
      await deleteSchedule(this.hass, this._base.schedule_id).catch(e => this._reportError(e));
      this.closeDialog();
      return;
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
          ${this._renderHeader()}
          ${this._bandStart && this._bandEnd ? this._renderBand() : this._renderMissingAnchors()}
          ${this._renderInspector()}
          ${this._error ? html`<div class="error">${this._error}</div>` : nothing}
        </div>

        <div class="buttons" slot="footer">
          <ha-button appearance="plain" variant="danger" @click=${this._delete} ?disabled=${!this._base.schedule_id}>
            ${hassLocalize('ui.common.delete', this.hass)}
          </ha-button>
          <ha-button appearance="plain" @click=${this._save} class="save">
            ${hassLocalize('ui.common.save', this.hass)}
          </ha-button>
        </div>
      </ha-dialog>
    `;
  }

  private _renderHeader() {
    return html`
      <div class="plan-header">
        <input
          class="plan-name"
          .value=${this._plan.name}
          placeholder=${this._t('title')}
          @input=${(ev: Event) => this._updatePlan({ name: (ev.target as HTMLInputElement).value })}
        />
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
        <div class="track">
          ${group.cubes.map(cube => this._renderCube(group, cube))}
        </div>
      </div>
    `;
  }

  private _renderCube(_group: PlanGroup, cube: PlanCube) {
    const from = this._position(cube.start);
    const to = this._position(cube.stop);
    if (from === null || to === null || to <= from) return nothing;

    const off = isOffAction(cube.action);
    return html`
      <button
        class="cube ${off ? 'off' : 'on'} ${this._selected == cube.id ? 'selected' : ''}"
        style="inset-inline-start:${(from * 100).toFixed(3)}%;width:${((to - from) * 100).toFixed(3)}%"
        title="${this._formatMoment(cube.start)} – ${this._formatMoment(cube.stop)}"
        @click=${() => { this._selected = cube.id; }}
      >
        <span class="cube-name">${cube.name || this._t('cube.unnamed')}</span>
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
    if (!selectedCube && !selectedDetach) return nothing;

    if (selectedDetach) return this._renderDetachInspector(selectedDetach);
    const { group, cube } = selectedCube!;

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
        </div>

        <div class="members">
          <label>${this._t('group.devices')}</label>
          <scheduler-entity-picker
            .hass=${this.hass}
            .config=${this._params!.cardConfig}
            .value=${group.entities}
            multiple
            @value-changed=${(ev: CustomEvent) => this._setMembers(group, ev.detail.value)}
          ></scheduler-entity-picker>
          <div class="member-chips">
            ${group.entities.map(
          entity => html`
              <button class="chip" @click=${() => this._detachDevice(group, entity)}>
                ${this.hass.states[entity]?.attributes.friendly_name || entity}
                <span class="chip-action">${this._t('detach.action')}</span>
              </button>
            `
        )}
          </div>
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
          </label>
        </div>
      </div>
    `;
  }

  private _renderBoundaryField(label: string, value: string, onChange: (value: string) => void) {
    const parts = this._boundaryParts(value);
    const commit = (changes: Partial<BoundaryParts>) => onChange(this._boundaryString({ ...parts, ...changes }));

    return html`
      <div class="field">
        <span class="field-label">${label}</span>
        <div class="field-row">
          <select
            class="anchor-select"
            .value=${parts.anchor}
            @change=${(ev: Event) => commit({ anchor: (ev.target as HTMLSelectElement).value as BoundaryAnchor })}
          >
            <option value="start" ?selected=${parts.anchor == 'start'}>${this._t('anchor.opens')}</option>
            <option value="end" ?selected=${parts.anchor == 'end'}>${this._t('anchor.closes')}</option>
            <option value="fixed" ?selected=${parts.anchor == 'fixed'}>${this._t('anchor.fixed')}</option>
          </select>

          ${parts.anchor == 'fixed'
        ? nothing
        : html`
          <select
            class="mode-select"
            .value=${parts.mode}
            @change=${(ev: Event) => commit({ mode: (ev.target as HTMLSelectElement).value as BoundaryMode })}
          >
            <option value="clock" ?selected=${parts.mode == 'clock'}>${this._t('boundary.at_clock')}</option>
            <option value="offset" ?selected=${parts.mode == 'offset'}>${this._t('boundary.offset')}</option>
          </select>
        `}

          ${parts.anchor != 'fixed' && parts.mode == 'offset'
        ? html`
          <button
            class="sign ${parts.before ? 'before' : 'after'}"
            @click=${() => commit({ before: !parts.before })}
          >
            ${parts.before ? this._t('boundary.before') : this._t('boundary.after')}
          </button>
        `
        : nothing}

          <input
            type="time"
            class="time-input"
            .value=${`${String(parts.hours).padStart(2, '0')}:${String(parts.minutes).padStart(2, '0')}`}
            @change=${(ev: Event) => {
        const [hours, minutes] = (ev.target as HTMLInputElement).value.split(':').map(Number);
        commit({ hours: hours || 0, minutes: minutes || 0 });
      }}
          />
        </div>
        <span class="field-resolved">${this._formatMoment(value)}</span>
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

  private _setMembers(group: PlanGroup, entities: string[]) {
    this._updatePlan({
      groups: this._plan.groups.map(g => (g.track == group.track ? { ...g, entities } : g)),
      // a device that left the group has nothing to be detached from
      detaches: this._plan.detaches.filter(
        d => entities.includes(d.entity) || this._plan.groups.some(other => other.track != group.track && other.entities.includes(d.entity))
      ),
    });
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
        gap: 20px;
      }

      /* --- header --- */
      .plan-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        flex-wrap: wrap;
      }
      .plan-name {
        font-size: 24px;
        font-weight: 600;
        letter-spacing: -0.01em;
        color: var(--primary-text-color);
        background: none;
        border: none;
        border-bottom: 2px solid transparent;
        padding: 2px 0;
        min-width: 200px;
        outline: none;
      }
      .plan-name:hover { border-bottom-color: var(--divider-color); }
      .plan-name:focus { border-bottom-color: var(--primary-color); }

      .anchors {
        display: flex;
        align-items: center;
        gap: 12px;
      }
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
      .row {
        display: flex;
        align-items: stretch;
        gap: 8px;
        min-height: 52px;
      }
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
      .row-meta {
        font-size: 11px;
        color: var(--secondary-text-color);
      }
      .track {
        position: relative;
        flex: 1;
        border-radius: 10px;
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
        overflow: hidden;
        transition: transform 120ms ease, box-shadow 120ms ease, filter 120ms ease;
      }
      .cube:hover { filter: brightness(1.06); }
      .cube.on {
        background: linear-gradient(
          160deg,
          rgba(var(--plan-on), 0.95),
          rgba(var(--plan-on), 0.75)
        );
      }
      .cube.off {
        background: linear-gradient(
          160deg,
          rgba(var(--plan-off), 0.55),
          rgba(var(--plan-off), 0.38)
        );
      }
      .cube.detach {
        background: linear-gradient(
          160deg,
          rgba(var(--plan-detach), 0.95),
          rgba(var(--plan-detach), 0.7)
        );
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

      .row-actions {
        margin-inline-start: 132px;
      }

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
      .detach-note {
        font-size: 13px;
        color: var(--secondary-text-color);
        margin-top: -8px;
      }

      .fields {
        display: flex;
        flex-wrap: wrap;
        gap: 16px;
      }
      .field {
        display: flex;
        flex-direction: column;
        gap: 6px;
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
      }
      .segmented button {
        font: inherit;
        font-size: 13px;
        border: none;
        background: var(--card-background-color);
        color: var(--secondary-text-color);
        padding: 7px 14px;
        cursor: pointer;
      }
      .segmented button.active {
        background: var(--primary-color);
        color: var(--text-primary-color, #fff);
        font-weight: 600;
      }
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
      .chip-action {
        font-size: 11px;
        color: rgba(var(--plan-detach), 1);
        font-weight: 600;
      }

      .ghost {
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
      .ghost:hover { background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.08); }
      .ghost[disabled] { opacity: 0.4; cursor: default; }
      .ghost.danger { color: var(--error-color, #db4437); }
      .ghost ha-svg-icon { --mdc-icon-size: 18px; width: 18px; height: 18px; }

      .empty {
        border: 1px dashed var(--divider-color);
        border-radius: var(--plan-radius);
        padding: 28px;
        text-align: center;
      }
      .empty-title { font-size: 16px; font-weight: 600; color: var(--primary-text-color); }
      .empty-body { font-size: 13px; color: var(--secondary-text-color); margin-top: 6px; }

      .error {
        color: var(--error-color, #db4437);
        font-size: 13px;
      }
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
