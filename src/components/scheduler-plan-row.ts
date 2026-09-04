import { CSSResultGroup, LitElement, css, html, nothing } from "lit";
import { customElement, property } from "lit/decorators";
import { mdiCandle } from "@mdi/js";
import { HomeAssistant } from "../lib/types";
import { CardConfig, Schedule } from "../types";
import { localize } from "../localize/localize";
import { PlanReport, describePlan } from "../data/plan/describe_plan";
import { planFromSchedule } from "../data/plan/plan_model";
import { resolveBoundary } from "../data/plan/resolve_boundary";

/**
 * A Shabbat plan, in the list, as the thing it actually is.
 *
 * An ordinary schedule row reads "turn on the salon light at 19:29", which is
 * true of a plan and tells you nothing about it: a plan is a whole band cut
 * into parts, with several devices disagreeing inside each one, and the row
 * that describes it has to say when it opens, what the parts are, and which
 * one is running now. Reading that off a single next-action line is how you
 * end up opening the editor to answer "is tonight set up?".
 */
@customElement("scheduler-plan-row")
export class SchedulerPlanRow extends LitElement {
  @property() hass!: HomeAssistant;
  @property() schedule_id!: string;
  @property() schedule!: Schedule;
  @property() config!: CardConfig;

  private _t(key: string, search?: string | string[], replace?: string | string[]) {
    return localize(`ui.panel.plan.${key}`, this.hass, search || [], replace || []);
  }

  /** "Fri 19:29" - the same shape the plan editor uses for a boundary */
  private _when(at: Date | null, weekday = true) {
    if (!at) return '—';
    return new Intl.DateTimeFormat(this.hass.locale?.language || 'en', {
      ...(weekday ? { weekday: 'short' as const } : {}),
      hour: '2-digit',
      minute: '2-digit',
    }).format(at);
  }

  render() {
    const stateObj = this.hass.states[this.schedule.entity_id!];
    const disabled = !stateObj || ['off', 'completed'].includes(stateObj.state);
    let report: PlanReport;
    let closes: Date | null;
    try {
      const plan = planFromSchedule(this.schedule);
      report = describePlan(plan, this.hass);
      // the band's own close, not the tail the last stretch runs into: what a
      // person is looking for here is havdalah
      closes = resolveBoundary(`${plan.endAnchor}+00:00:00`, this.hass);
    } catch (_err) {
      return nothing;
    }

    const now = new Date();
    const stretches = report.stretches.filter(stretch => stretch.from && stretch.to);
    const running = stretches.find(
      stretch => stretch.from! <= now && stretch.to! > now
    );
    const next = stretches.find(stretch => stretch.from! > now);
    const devices = new Set(
      report.stretches.flatMap(stretch => stretch.devices.map(device => device.entity_id))
    );

    return html`
      <div class="row ${disabled ? 'disabled' : ''}">
        <ha-svg-icon .path=${mdiCandle} @click=${this._edit}></ha-svg-icon>

        <div class="info" @click=${this._edit}>
          <div class="name">
            ${this.schedule.name || this._t('title')}
            ${disabled ? html`<span class="off-badge">${this._t('row.paused')}</span>` : nothing}
          </div>

          <div class="band">
            ${this._t('row.band', ['{from}', '{to}'],
      [this._when(report.opens), this._when(closes)])}
          </div>

          <div class="parts">
            ${stretches.map(stretch => html`
            <span class="part ${stretch === running ? 'now' : ''}">
              <span class="part-at">${this._when(stretch.from, false)}</span>
              ${stretch.name}
            </span>`)}
          </div>

          <div class="foot">
            ${this._t('row.summary', ['{parts}', '{devices}'],
        [String(stretches.length), String(devices.size)])}
            ${running
        ? html`<span class="dot-sep">·</span>${this._t('row.now', '{name}', running.name)}`
        : next
          ? html`<span class="dot-sep">·</span>${this._t('row.next', ['{name}', '{time}'],
            [next.name, this._when(next.from)])}`
          : nothing}
          </div>
        </div>

        <div class="state">
          ${this.config?.show_toggle_switches !== false
        ? html`<ha-switch
              ?checked=${!disabled}
              @change=${this._toggle}
            ></ha-switch>`
        : nothing}
        </div>
      </div>
    `;
  }

  private _edit(ev: Event) {
    ev.stopPropagation();
    this.dispatchEvent(new CustomEvent('editClick', { bubbles: true, composed: true }));
  }

  private _toggle(ev: Event) {
    const checked = (ev.target as HTMLInputElement).checked;
    this.hass.callService('switch', checked ? 'turn_on' : 'turn_off', {
      entity_id: this.schedule.entity_id,
    });
  }

  static get styles(): CSSResultGroup {
    return css`
      :host { display: block; }
      .row {
        display: flex;
        align-items: flex-start;
        gap: 14px;
        padding: 10px 0;
        cursor: pointer;
      }
      .row.disabled { opacity: 0.6; }
      ha-svg-icon {
        flex: 0 0 auto;
        margin-top: 2px;
        color: var(--state-icon-color, #44739e);
        width: 24px;
        height: 24px;
      }
      .info { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; gap: 4px; }
      .name {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        font-weight: 600;
        color: var(--primary-text-color);
      }
      .off-badge {
        font-size: 11px;
        font-weight: 500;
        padding: 1px 8px;
        border-radius: 999px;
        color: var(--secondary-text-color);
        background: rgba(var(--rgb-secondary-text-color, 114, 114, 114), 0.14);
      }
      .band, .foot { font-size: 12px; color: var(--secondary-text-color); }
      .parts { display: flex; flex-wrap: wrap; gap: 4px; margin: 2px 0; }
      /* the parts, in the order they happen: the shape of the day at a glance,
         which is the one thing a single "next action" line can never show */
      .part {
        display: inline-flex;
        align-items: baseline;
        gap: 6px;
        font-size: 12px;
        padding: 2px 8px;
        border-radius: 999px;
        border: 1px solid var(--divider-color);
        color: var(--primary-text-color);
        white-space: nowrap;
      }
      .part-at { font-variant-numeric: tabular-nums; color: var(--secondary-text-color); }
      .part.now {
        border-color: var(--primary-color);
        background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.12);
      }
      .part.now .part-at { color: var(--primary-color); }
      .dot-sep { margin: 0 5px; }
      .state { flex: 0 0 auto; }
    `;
  }
}
