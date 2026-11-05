/**
 * <sci-fi-plugs> — v1.0.0
 * Spec 13 § sci-fi-plugs.ts — Full reconstruction: header + image + sensors + chart + footer.
 * Aligned with main branch architecture (single-plug-at-a-time view, footer navigation).
 *
 * ADR-005: sensors = Record<entityId, SciFiPlugSensorEntry> (not {power: string, energy: string}).
 * CSS selectors required by tests: .header, .header .title, .content, .footer, .image, .sensors .sensor
 */

import { html, nothing, type TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { msg } from '@lit/localize';
import Chart from 'chart.js/auto';

import { SciFiBaseCard } from '../../utils/base-card.js';
import { sciFiCommonStyles } from '../../styles/common.js';
import { plugStyles } from './styles.js';
import type { SciFiPlugsConfig, SciFiPlugDevice, SciFiPlugSensorEntry } from './config.js';
import { DOMAIN } from '../../types/domains.js';
import {
  PLUG_STATE_ON,
  HASS_PLUG_SERVICE,
  HASS_PLUG_SERVICE_ACTION_TURN_ON,
  HASS_PLUG_SERVICE_ACTION_TURN_OFF,
  CHART_BG_COLOR,
  CHART_BORDER_COLOR,
} from './plug_const.js';

import '../../components/sf-icon/sf-icon.js';
import '../../components/buttons/sf-button.js';
import '../../components/buttons/sf-button-card.js';
import '../../components/buttons/sf-button-card-select.js';
import '../../components/sf-toast.js';
import type { ButtonSelectItem } from '../../components/buttons/sf-button-card-select.js';

const TAG = 'sci-fi-plugs';

/** F-PLG-D04: the power chart shows the last 24 hours. */
const HISTORY_WINDOW_MS = 24 * 60 * 60 * 1000;

/** plugs-history-states FR-5: strict budget of one history request. */
const HISTORY_BUDGET_MS = 2000;
/** plugs-history-states FR-8: most recent points kept per record. */
const HISTORY_MAX_POINTS = 5000;

/**
 * plugs-history-states FR-1: one attempt per plug, keyed by its power entity
 * id. A key absent from the map means "never attempted".
 */
type HistoryStatus = 'loading' | 'loaded' | 'empty' | 'error';
interface HistoryAttempt {
  status: HistoryStatus;
  token: number;
  datasets: unknown[];
  labels: string[];
  reason?: 'timeout' | 'request';
}

interface HistoryPoint {
  last_changed: string;
  state: string;
}

/** The rejection `_withTimeout` raises when the budget expires first. */
class HistoryTimeoutError extends Error {
  readonly reason = 'timeout' as const;
  constructor() {
    super('history request timed out');
  }
}

/** FR-8: an object with a finite numeric state and a parseable timestamp (B-8). */
function isHistoryPoint(el: unknown): el is HistoryPoint {
  if (typeof el !== 'object' || el === null) return false;
  const { state, last_changed } = el as Record<string, unknown>;
  return typeof state === 'string'
    && Number.isFinite(parseFloat(state))
    && typeof last_changed === 'string'
    && !Number.isNaN(Date.parse(last_changed));
}

@customElement(TAG)
export class SciFiPlugsCard extends SciFiBaseCard {
  static override styles = [sciFiCommonStyles, plugStyles];

  /** Configured ids only: when all are absent the base card shows its banner. */
  protected override getConfiguredEntities(): string[] {
    return this.getRelevantEntities();
  }

  protected override getRelevantEntities(): string[] {
    const entities = new Set<string>();

    if (this.config.devices) {
      for (const device of this.config.devices) {
        if (device.entity_id) {
          entities.add(device.entity_id);
        }
        if (device.sensors) {
          for (const entityId of Object.keys(device.sensors)) {
            entities.add(entityId);
          }
        }
      }
    }

    return Array.from(entities);
  }

  declare config: SciFiPlugsConfig;

  @state() private _selected_plug_id: number = 0;

  /** FR-1: replaced by a new Map on every change, so Lit re-renders the section. */
  @state() private _historyAttempts: Map<string, HistoryAttempt> = new Map();

  // Chart canvas — driven imperatively from updated(), not by the template.
  private _chart: Chart | null = null;
  /** The record the current `_chart` draws; a different record means redraw. */
  private _drawnAttempt: HistoryAttempt | null = null;
  /** FR-9: last token issued; every attempt gets a new one. */
  private _historyToken = 0;
  /** FR-17: bumped on disconnect, so every in-flight answer becomes stale. */
  private _cardGeneration = 0;
  /** Pending budget timers; FR-17 clears them all on disconnect. */
  private _historyTimers = new Set<ReturnType<typeof setTimeout>>();

  // ── Lifecycle ───────────────────────────────────────────────────────────────

  /**
   * An edit that shortens `devices` leaves the selected index out of bounds,
   * and _renderHeader then dereferences undefined — the whole card becomes the
   * error card. The vacuum card specifies this clamp (its willUpdate reset case); the plugs spec
   * declared the case impossible instead.
   */
  override willUpdate(changedProperties: Map<string | number | symbol, unknown>): void {
    super.willUpdate(changedProperties);
    const count = this.config?.devices?.length ?? 0;
    if (count === 0) return;
    if (this._selected_plug_id > count - 1 || this._selected_plug_id < 0) {
      this._selected_plug_id = 0;
    }
  }

  /**
   * FR-2: a request starts whenever the card body is on screen, hass is set,
   * the selected plug has a power sensor and its key was never attempted —
   * evaluated on every update, whatever changed and whatever the mount order.
   * FR-3: a present key (error included) never starts one.
   */
  protected override updated(changedProperties: Map<string | number | symbol, unknown>): void {
    super.updated(changedProperties);
    if (!this.shadowRoot?.querySelector('.chart-container')) {
      this._destroyChart();
      return;
    }
    const key = this._selectedPowerKey();
    if (!key) {
      this._destroyChart();
      return;
    }
    if (!this.hass) return;
    const attempt = this._historyAttempts.get(key);
    if (!attempt) {
      this._startHistory(key);
      return;
    }
    if (attempt.status !== 'loaded') {
      this._destroyChart();
      return;
    }
    // B-2: a loaded record selected anew is drawn from its datasets, no request (FR-12).
    if (this._drawnAttempt !== attempt || !this._chart) {
      this._destroyChart();
      this._drawChart(attempt.datasets, attempt.labels);
      this._drawnAttempt = attempt;
    }
  }

  /** B-6: an answer lost while detached would leave a spinner forever; restart it. */
  override connectedCallback(): void {
    super.connectedCallback();
    const kept = [...this._historyAttempts].filter(([, a]) => a.status !== 'loading');
    if (kept.length !== this._historyAttempts.size) this._historyAttempts = new Map(kept);
  }

  /** FR-17: no timer outlives the card, and no late answer writes anything. */
  override disconnectedCallback(): void {
    super.disconnectedCallback();
    for (const timer of this._historyTimers) clearTimeout(timer);
    this._historyTimers.clear();
    this._cardGeneration++;
  }

  /**
   * FR-11: a key no longer configured is dropped and the chart destroyed; a
   * key still configured keeps its record as-is (B-5). A dropped key's pending
   * request keeps its own budget: it settles within 2 s and the token check
   * discards it. The selected index is clamped by willUpdate.
   */
  override setConfig(config: SciFiPlugsConfig): void {
    super.setConfig(config);
    const keys = new Set(
      (config.devices ?? []).map(d => this._powerKey(d)).filter((k): k is string => k !== undefined)
    );
    const kept = [...this._historyAttempts].filter(([key]) => keys.has(key));
    if (kept.length !== this._historyAttempts.size) this._historyAttempts = new Map(kept);
    this._destroyChart();
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  protected override renderCard(): TemplateResult {
    if (!this.config.devices?.length) {
      return html`<ha-card></ha-card>`;
    }

    const device = this.config.devices[this._selected_plug_id]!;

    return html`
      <ha-card>
        <div class="container">
          ${this._renderHeader(device)}
          ${this._renderContent(device)}
          ${this._renderFooter()}
        </div>
        <sf-toast></sf-toast>
      </ha-card>
    `;
  }

  // ── Header ─────────────────────────────────────────────────────────────────

  private _renderHeader(device: SciFiPlugDevice): TemplateResult {
    const switchState = this.hass.states[device.entity_id];
    const isOn = switchState?.state === PLUG_STATE_ON;
    const isUnavailable = this._isUnavailable(device);
    const name = device.name ?? (switchState?.attributes as any)?.friendly_name ?? device.entity_id;

    // Device registry lookup (area icon + model/manufacturer)
    const haDevice = (this.hass as any).devices?.[device.device_id];
    const areaId = haDevice?.area_id as string | undefined;
    const area = areaId ? (this.hass as any).areas?.[areaId] : null;
    const areaIcon = (area?.icon as string | undefined) ?? 'mdi:power-socket-fr';
    const manufacturer = (haDevice?.manufacturer as string | undefined) ?? '';
    const model = (haDevice?.model as string | undefined) ?? '';
    const subTitle = [model, manufacturer].filter(Boolean).join(` ${msg('by')} `);

    return html`
      <div class="header">
        <sf-icon icon="${areaIcon}" class="${isOn ? 'on' : ''}" .connection="${this.hass.connection}"></sf-icon>
        <div class="info">
          <div class="title ${isOn ? 'on' : ''}">${name}</div>
          ${isUnavailable
            ? html`<div class="offline-tag">${msg('OFFLINE')}</div>`
            : subTitle ? html`<div class="sub-title">${subTitle}</div>` : nothing}
        </div>
      </div>
    `;
  }

  /**
   * plugs.md § Adversarial Fixes 1: an `unavailable` or `unknown` plug must be
   * visibly offline and non-interactive. Rendering it as a plain OFF plug with
   * live buttons told the user the socket was reachable and switched off.
   * A missing state object is the same situation from the card's point of view.
   */
  private _isUnavailable(device: SciFiPlugDevice): boolean {
    const state = this.hass.states[device.entity_id]?.state;
    return state === undefined || state === 'unavailable' || state === 'unknown';
  }

  // ── Content ────────────────────────────────────────────────────────────────

  private _renderContent(device: SciFiPlugDevice): TemplateResult {
    const switchState = this.hass.states[device.entity_id];
    const isOn = switchState?.state === PLUG_STATE_ON;
    const icon = isOn
      ? (device.active_icon ?? 'mdi:power-socket-fr')
      : (device.inactive_icon ?? 'sci:power-socket-fr-off');

    const sensorEntries = Object.entries(device.sensors ?? {});
    // Non-power visible sensors for the sensor list
    const visibleSensors = sensorEntries.filter(([, e]) => e.show !== false && !e.power);

    return html`
      <div class="content">
        <div class="info">
          ${this._renderImage(isOn, icon, device)}
          ${this._renderSensors(visibleSensors, this._isUnavailable(device))}
        </div>
        ${this._renderChartSection(device)}
      </div>
    `;
  }


  // ── Image zone ─────────────────────────────────────────────────────────────

  private _renderImage(isOn: boolean, icon: string, device: SciFiPlugDevice): TemplateResult {
    const isUnavailable = this._isUnavailable(device);
    // Both containers carry the state class: only `.cirle-container.off` stops
    // the animation (styles.ts), so leaving the left one bare animated the
    // cable of a plug that was switched off (plugs.md:522).
    //
    // `isOn` alone covers the unavailable case: it is `state === 'on'`, and
    // _isUnavailable is `state` undefined / 'unavailable' / 'unknown', so the
    // two are mutually exclusive. The `&& !isUnavailable` this once carried was
    // dead logic — a mutation removing it could not be killed by any test,
    // because it changed nothing.
    const cableClass = isOn ? '' : 'off';
    return html`
      <div
        class="image ${isUnavailable ? 'unavailable' : ''}"
        @click="${() => this._toggle(device)}"
      >
        <div class="cirle-container ${cableClass}">
          <div class="circle"></div>
        </div>
        <div class="icon-container">
          <div class="icon">
            <div class="circle"></div>
            <div class="circle"></div>
            <div class="circle"></div>
          </div>
          <sf-icon
            icon="${icon}"
            class="${isOn ? 'on' : 'off'}"
            .connection="${this.hass.connection}"
          ></sf-icon>
        </div>
        <div class="cirle-container ${cableClass}">
          <div class="circle"></div>
        </div>
      </div>
    `;
  }

  // ── Sensors ────────────────────────────────────────────────────────────────

  private _renderSensors(
    visibleSensors: [string, SciFiPlugSensorEntry][],
    isUnavailable: boolean
  ): TemplateResult {
    if (!visibleSensors.length) return html``;
    return html`
      <div class="sensors">
        ${visibleSensors
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([entityId, entry]) => {
            const sensorState = this.hass.states[entityId];
            if (!sensorState) return nothing;
            const domain = entityId.split('.')[0]!;
            // plugs.md § Adversarial Fixes 1 says "disable interaction buttons",
            // plural: the child-lock toggle and the select dropdown are
            // interaction buttons too, and stayed live while the socket was
            // unreachable (review round 1).
            if (domain === DOMAIN.SELECT) {
              return this._renderSelectSensor(entityId, entry, sensorState, isUnavailable);
            }
            if (domain === DOMAIN.SWITCH) {
              return this._renderLockSensor(entityId, entry, sensorState, isUnavailable);
            }
            return this._renderValueSensor(entityId, entry, sensorState);
          })}
      </div>
    `;
  }

  /** select.* → sf-button-card-select dropdown (matches __displaySelectBtn in main) */
  private _renderSelectSensor(
    entityId: string,
    entry: SciFiPlugSensorEntry,
    sensorState: any,
    isUnavailable = false
  ): TemplateResult {
    const label = entry.name ?? sensorState.attributes?.friendly_name ?? entityId;
    const icon = entry.icon ?? 'mdi:format-list-bulleted';
    const currentValue: string = sensorState.state ?? '';
    const options: string[] = (sensorState.attributes?.options as string[] | undefined) ?? [];
    const items: ButtonSelectItem[] = options.map(o => ({
      id: o,
      text: o,
      icon: 'mdi:circle-medium',
    }));
    // `?disabled` is the right attribute and is kept, but neither
    // sf-button-card-select nor sf-button-card reads it today (the select
    // overrides clickBtn without a guard, the card has no disabled handling at
    // all) — both are out of this lot's diff. The `inert` class on the wrapper
    // is what actually stops the interaction and dims the control, so an
    // offline plug does not merely refuse a click it still invites.
    return html`
      <div class="sensor ${isUnavailable ? 'inert' : ''}">
        <sf-button-card-select
          icon="${icon}"
          label="${label}"
          text="${currentValue}"
          .items="${isUnavailable ? [] : items}"
          position="top"
          ?disabled="${isUnavailable}"
          @button-select="${(e: CustomEvent) => {
            if (isUnavailable) return;
            this._onSelectChange(e, entityId);
          }}"
        ></sf-button-card-select>
      </div>
    `;
  }

  /** switch.* → sf-button-card toggle (matches __displayLockBtn in main) */
  private _renderLockSensor(
    entityId: string,
    entry: SciFiPlugSensorEntry,
    sensorState: any,
    isUnavailable = false
  ): TemplateResult {
    const label = entry.name ?? sensorState.attributes?.friendly_name ?? entityId;
    const icon = entry.icon ?? 'mdi:lock-outline';
    const isOn = sensorState.state === 'on';
    return html`
      <div class="sensor ${isUnavailable ? 'inert' : ''}">
        <sf-icon icon="${icon}" .connection="${this.hass.connection}"></sf-icon>
        <div class="name">${label}</div>
        <div class="value">
          <sf-button-card
            no-title
            text="${this._getPlugStateLabel(isOn)}"
            ?disabled="${isUnavailable}"
            @button-click="${() => {
              if (isUnavailable) return;
              this._onLockToggle(entityId);
            }}"
          ></sf-button-card>
        </div>
      </div>
    `;
  }

  /** Regular sensor (numeric/text) → icon + name + value */
  private _renderValueSensor(
    entityId: string,
    entry: SciFiPlugSensorEntry,
    sensorState: any
  ): TemplateResult {
    const val = sensorState.state;
    const unit = (sensorState.attributes)['unit_of_measurement'] as string | undefined;
    const label = entry.name ?? sensorState.attributes?.friendly_name ?? entityId;
    const icon = entry.icon ?? 'mdi:information-outline';
    return html`
      <div class="sensor">
        <sf-icon icon="${icon}" .connection="${this.hass.connection}"></sf-icon>
        <div class="name">${label}</div>
        <div class="value">${val}${unit ? ` ${unit}` : ''}</div>
      </div>
    `;
  }

  private _onSelectChange(e: CustomEvent, entityId: string): void {
    const value: string = (e.detail as ButtonSelectItem).id;
    void this.hass
      .callService(DOMAIN.SELECT, 'select_option', { entity_id: entityId, option: value })
      .then(() => this._toast(false, msg('done')))
      .catch((err: Error) => this._toast(true, err.message));
  }

  private _onLockToggle(entityId: string): void {
    const currentState = this.hass.states[entityId]?.state;
    const service = currentState === 'on' ? 'turn_off' : 'turn_on';
    void this.hass
      .callService(DOMAIN.SWITCH, service, { entity_id: entityId })
      .then(() => this._toast(false, msg('done')))
      .catch((err: Error) => this._toast(true, err.message));
  }


  // ── Footer ─────────────────────────────────────────────────────────────────

  private _renderFooter(): TemplateResult {
    const multiple = (this.config.devices?.length ?? 0) > 1;
    return html`
      <div class="footer">
        <div class="${multiple ? '' : 'hide'}">
          <sf-button icon="mdi:chevron-left" @button-click="${this._prev}"></sf-button>
        </div>
        <div class="number">
          ${this.config.devices?.map((d, i) => {
            const isOn = this.hass.states[d.entity_id]?.state === PLUG_STATE_ON;
            const icon = isOn
              ? (d.active_icon ?? 'mdi:power-socket-fr')
              : (d.inactive_icon ?? 'sci:power-socket-fr-off');
            return html`
              <sf-button
                icon="${icon}"
                class="${i === this._selected_plug_id ? 'active' : ''}"
                @button-click="${() => { this._selected_plug_id = i; }}"
              ></sf-button>
            `;
          })}
        </div>
        <div class="${multiple ? '' : 'hide'}">
          <sf-button icon="mdi:chevron-right" @button-click="${this._next}"></sf-button>
        </div>
      </div>
    `;
  }

  private _prev = (): void => {
    const len = this.config.devices?.length ?? 0;
    this._selected_plug_id = this._selected_plug_id === 0 ? len - 1 : this._selected_plug_id - 1;
  };

  private _next = (): void => {
    const len = this.config.devices?.length ?? 0;
    this._selected_plug_id = this._selected_plug_id === len - 1 ? 0 : this._selected_plug_id + 1;
  };

  // ── Toggle ─────────────────────────────────────────────────────────────────

  private _toggle(device: SciFiPlugDevice): void {
    if (!device.entity_id || this._isUnavailable(device)) return;
    const isOn = this.hass.states[device.entity_id]?.state === PLUG_STATE_ON;
    void this.hass
      .callService(
        HASS_PLUG_SERVICE,
        isOn ? HASS_PLUG_SERVICE_ACTION_TURN_OFF : HASS_PLUG_SERVICE_ACTION_TURN_ON,
        { entity_id: device.entity_id }
      )
      .then(() => this._toast(false, msg('done')))
      .catch((e: Error) => this._toast(true, e.message));
  }

  // ── Chart ──────────────────────────────────────────────────────────────────

  /**
   * FR-4/FR-6/FR-8, B-4: one state per status, mutually exclusive; the
   * `.chart-container` stays in the DOM (FR-2 reads it) and shows only when
   * loaded. `.chart-section` persists across states so it can hold focus (FR-16).
   */
  private _renderChartSection(device: SciFiPlugDevice): TemplateResult {
    const key = this._powerKey(device);
    const status = key ? this._historyAttempts.get(key)?.status : undefined;
    return html`
      <div class="chart-bottom chart-section" tabindex="-1">
        ${status === 'loading'
          ? html`<div class="history-loading" role="status">${msg('Loading history…')}</div>`
          : nothing}
        ${status === 'error'
          ? html`<div class="history-error" role="alert">
              <span>${msg('Power history unavailable')}</span>
              <sf-button
                class="history-retry"
                icon="mdi:refresh"
                aria-label="${msg('Retry')}"
                title="${msg('Retry')}"
                @click="${this._retryHistory}"
              ></sf-button>
            </div>`
          : nothing}
        <div class="msg-container">${status === 'empty' ? msg('No power data to display') : ''}</div>
        <div class="chart-container" style="display: ${status === 'loaded' ? 'block' : 'none'}"></div>
      </div>
    `;
  }

  private _powerKey(device: SciFiPlugDevice | undefined): string | undefined {
    return Object.entries(device?.sensors ?? {}).find(([, e]) => e.power === true)?.[0];
  }

  private _selectedPowerKey(): string | undefined {
    return this._powerKey(this.config?.devices?.[this._selected_plug_id]);
  }

  private _setAttempt(key: string, attempt: HistoryAttempt): void {
    this._historyAttempts = new Map(this._historyAttempts).set(key, attempt);
  }

  private _destroyChart(): void {
    this._chart?.destroy();
    this._chart = null;
    this._drawnAttempt = null;
  }

  /** FR-7: the new loading record is in place before any await. */
  private _startHistory(key: string): void {
    const token = ++this._historyToken;
    this._setAttempt(key, { status: 'loading', token, datasets: [], labels: [] });
    void this._loadPowerChart(key, token, this._cardGeneration);
  }

  /**
   * FR-7/FR-16: a second activation in the same tick finds the record loading
   * and starts nothing; focus goes to the section, which outlives the button.
   */
  private _retryHistory = (): void => {
    const key = this._selectedPowerKey();
    if (!key || this._historyAttempts.get(key)?.status !== 'error') return;
    this._startHistory(key);
    (this.shadowRoot?.querySelector('.chart-section') as HTMLElement | null)?.focus();
  };

  /**
   * FR-9: the answer writes its record only while its token is the key's
   * current one and the card was not disconnected since (FR-17). What it
   * shows is rendered from the selected key's record, never from here.
   */
  private async _loadPowerChart(key: string, token: number, generation: number): Promise<void> {
    let attempt: HistoryAttempt;
    try {
      const path = `history/period/${this._historyStart()}?minimal_response=true&no_attributes=true`
        + `&significant_changes_only=false&filter_entity_id=${encodeURIComponent(key)}`;
      // Ref: https://developers.home-assistant.io/docs/api/rest/ (GET /api/history/period/<timestamp>)
      const request = new Promise<unknown>(resolve => resolve(this.hass.callApi<unknown>('GET', path)));
      attempt = this._attemptFromAnswer(await this._withTimeout(request, HISTORY_BUDGET_MS), token);
    } catch (e) {
      const reason = e instanceof HistoryTimeoutError ? 'timeout' : 'request';
      attempt = { status: 'error', token, datasets: [], labels: [], reason };
    }
    if (generation !== this._cardGeneration || this._historyAttempts.get(key)?.token !== token) return;
    this._setAttempt(key, attempt);
  }

  /** FR-8: malformed → error; zero points → empty; else the latest 5000 points (B-7). */
  private _attemptFromAnswer(data: unknown, token: number): HistoryAttempt {
    if (!Array.isArray(data) || (data.length > 0 && !Array.isArray(data[0]))) {
      return { status: 'error', token, datasets: [], labels: [], reason: 'request' };
    }
    const points = ((data[0] ?? []) as unknown[]).filter(isHistoryPoint).slice(-HISTORY_MAX_POINTS);
    if (points.length === 0) return { status: 'empty', token, datasets: [], labels: [] };
    const history = this._parseHistory(points);
    return {
      status: 'loaded',
      token,
      datasets: this._buildChartDatasets(Object.values(history)),
      labels: this._buildChartLabels(Object.keys(history)),
    };
  }

  /**
   * FR-5: races `promise` against `ms`; on expiry rejects with a
   * HistoryTimeoutError (reason 'timeout'). The timer is cleared on settle,
   * and held in `_historyTimers` so a disconnect can clear it (FR-17).
   */
  private _withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => {
        this._historyTimers.delete(timer);
        reject(new HistoryTimeoutError());
      }, ms);
      this._historyTimers.add(timer);
      const settle = (): void => {
        clearTimeout(timer);
        this._historyTimers.delete(timer);
      };
      promise.then(
        value => { settle(); resolve(value); },
        (error: unknown) => { settle(); reject(error instanceof Error ? error : new Error(String(error))); }
      );
    });
  }

  /** Buckets points by minute, keeping the highest value; non-points are dropped (FR-8). */
  private _parseHistory(data: unknown[]): Record<string, number> {
    const res: Record<string, number> = {};
    for (const el of data.filter(isHistoryPoint)) {
      const d = new Date(el.last_changed);
      d.setSeconds(0);
      d.setMilliseconds(0);
      const value = parseFloat(parseFloat(el.state).toFixed(2));
      const key = d.toISOString();
      if (!(key in res) || value > res[key]!) res[key] = value;
    }
    return res;
  }

  private _buildChartDatasets(data: number[]): unknown[] {
    return [
      {
        data,
        fill: true,
        backgroundColor: CHART_BG_COLOR,
        borderColor: CHART_BORDER_COLOR,
        tension: 0.1,
        borderWidth: 2,
        borderRadius: 5,
      },
    ];
  }

  private _buildChartLabels(keys: string[]): string[] {
    return keys.map(k => {
      const d = new Date(k);
      if (d.getHours() === 0 && d.getMinutes() === 0) return d.toLocaleDateString();
      return d.toLocaleDateString() + '-' + d.toLocaleTimeString([], { timeStyle: 'short' });
    });
  }

  /**
   * F-PLG-D04 asks for the last 24 hours. A bare `YYYY-MM-DD` means midnight
   * yesterday, so the window was 24 hours wide at midnight and 48 just before
   * it — never the 24 rolling hours the chart claims to show. A full ISO
   * timestamp pins the start exactly 24 hours back.
   */
  private _historyStart(): string {
    return new Date(Date.now() - HISTORY_WINDOW_MS).toISOString();
  }

  private _drawChart(datasets: unknown[], labels: string[]): void {
    const container = this.shadowRoot?.querySelector('.chart-container');
    if (!container) return;
    // Guard: reuse existing canvas rather than stacking new ones on each hass update
    let canvas = container.querySelector('canvas');
    if (!canvas) {
      canvas = document.createElement('canvas');
      container.appendChild(canvas);
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    this._chart = new Chart(ctx, {
      type: 'bar',
      data: { labels, datasets: datasets as any },
      options: {
        animation: {
          delay: (context: any) => {
            if (context.type === 'data' && context.mode === 'default') {
              return (context.dataIndex as number) * 10 + (context.datasetIndex as number) * 10;
            }
            return 0;
          },
        },
        scales: {
          y: { display: false, suggestedMin: 0 },
          x: {
            ticks: {
              align: 'start',
              callback: function (this: any, val: any, index: number) {
                return index % Math.floor(this.max / 3) === 0 ? this.getLabelForValue(val) : null;
              },
              color: 'rgb(102, 156, 210)',
              font: { size: 10 },
            },
          },
        },
        plugins: {
          title: { display: false },
          legend: { display: false },
          tooltip: {
            enabled: true,
            callbacks: {
              title: (items: any[]) => `${msg('Power')} (${items[0]?.label ?? ''})`,
              label: (context: any) => String(context.raw),
            },
          },
        },
      },
    });
  }

  // ── Toast ──────────────────────────────────────────────────────────────────

  private _toast(error: boolean, text: string): void {
    const toast = this.shadowRoot?.querySelector('sf-toast') as any;
    if (toast?.addMessage) toast.addMessage(text, error);
  }

  private _getPlugStateLabel(isOn: boolean): string {
    return [msg('OFF'), msg('ON')][isOn ? 1 : 0] as string;
  }

  // ── Card registration ──────────────────────────────────────────────────────

  override getCardSize(): number {
    return this.config ? 5 : 3;
  }

  static getConfigElement(): HTMLElement {
    return document.createElement(`${TAG}-editor`);
  }

  static getStubConfig(): SciFiPlugsConfig {
    return { type: `custom:${TAG}`, devices: [] };
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [TAG]: SciFiPlugsCard;
  }
}
