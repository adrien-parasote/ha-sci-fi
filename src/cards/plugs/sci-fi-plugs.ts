/**
 * <sci-fi-plugs> — v2.0.0
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
import type { SciFiPlugsConfig, SciFiPlugDevice, SciFiPlugSensorEntry } from '../../types/config.js';
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

@customElement(TAG)
export class SciFiPlugsCard extends SciFiBaseCard {
  static override styles = [sciFiCommonStyles, plugStyles];

  declare config: SciFiPlugsConfig;

  @state() private _selected_plug_id: number = 0;

  // Chart state — NOT @state() (driven imperatively, not via Lit re-render)
  private _chart: Chart | null = null;
  private _chart_generation: Record<number, { datasets: unknown[]; labels: string[]; fetchedAt: number }> = {};
  private _chartLoaded = false; // true after first successful load

  // ── Lifecycle ───────────────────────────────────────────────────────────────

  protected override updated(changedProperties: Map<string | number | symbol, unknown>): void {
    super.updated(changedProperties);
    // Load chart only on:
    //   1. Initial card load (hass set for the first time, no chart yet)
    //   2. User selects a different plug (prev/next)
    // NOT on every hass update (entity state polling)
    const plugChanged = changedProperties.has('_selected_plug_id');
    const isInitialLoad = !this._chartLoaded && changedProperties.has('hass');
    if (plugChanged || isInitialLoad) {
      const device = this.config.devices?.[this._selected_plug_id];
      if (!device) return;
      const powerEntry = Object.entries(device.sensors ?? {}).find(([, e]) => e.power === true);
      if (powerEntry) {
        this._chartLoaded = true;
        void this._loadPowerChart(device, powerEntry[0]);
      }
    }
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
          ${subTitle ? html`<div class="sub-title">${subTitle}</div>` : nothing}
        </div>
      </div>
    `;
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

    // Chart loading is handled by updated() — not here.
    // This avoids calling callApi on every hass update (entity state polling).

    return html`
      <div class="content">
        <div class="info">
          ${this._renderImage(isOn, icon, device)}
          ${this._renderSensors(visibleSensors)}
        </div>
        <div class="chart-bottom">
          <div class="msg-container"></div>
          <div class="chart-container"></div>
        </div>
      </div>
    `;
  }


  // ── Image zone ─────────────────────────────────────────────────────────────

  private _renderImage(isOn: boolean, icon: string, device: SciFiPlugDevice): TemplateResult {
    return html`
      <div class="image" @click="${() => this._toggle(device)}">
        <div class="cirle-container">
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
        <div class="cirle-container ${isOn ? 'on' : 'off'}">
          <div class="circle"></div>
        </div>
      </div>
    `;
  }

  // ── Sensors ────────────────────────────────────────────────────────────────

  private _renderSensors(
    visibleSensors: [string, SciFiPlugSensorEntry][]
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
            if (domain === 'select') return this._renderSelectSensor(entityId, entry, sensorState);
            if (domain === 'switch') return this._renderLockSensor(entityId, entry, sensorState);
            return this._renderValueSensor(entityId, entry, sensorState);
          })}
      </div>
    `;
  }

  /** select.* → sf-button-card-select dropdown (matches __displaySelectBtn in main) */
  private _renderSelectSensor(
    entityId: string,
    entry: SciFiPlugSensorEntry,
    sensorState: any
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
    return html`
      <div class="sensor">
        <sf-button-card-select
          icon="${icon}"
          label="${label}"
          text="${currentValue}"
          .items="${items}"
          position="top"
          @button-select="${(e: CustomEvent) => this._onSelectChange(e, entityId)}"
        ></sf-button-card-select>
      </div>
    `;
  }

  /** switch.* → sf-button-card toggle (matches __displayLockBtn in main) */
  private _renderLockSensor(
    entityId: string,
    entry: SciFiPlugSensorEntry,
    sensorState: any
  ): TemplateResult {
    const label = entry.name ?? sensorState.attributes?.friendly_name ?? entityId;
    const icon = entry.icon ?? 'mdi:lock-outline';
    const isOn = sensorState.state === 'on';
    return html`
      <div class="sensor">
        <sf-icon icon="${icon}" .connection="${this.hass.connection}"></sf-icon>
        <div class="name">${label}</div>
        <div class="value">
          <sf-button-card
            no-title
            text="${isOn ? msg('ON') : msg('OFF')}"
            @button-click="${() => this._onLockToggle(entityId)}"
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
      .callService('select', 'select_option', { entity_id: entityId, option: value })
      .then(() => this._toast(false, msg('done')))
      .catch((err: Error) => this._toast(true, err.message));
  }

  private _onLockToggle(entityId: string): void {
    const currentState = this.hass.states[entityId]?.state;
    const service = currentState === 'on' ? 'turn_off' : 'turn_on';
    void this.hass
      .callService('switch', service, { entity_id: entityId })
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
    this._clearChart();
    this._selected_plug_id = this._selected_plug_id === 0 ? len - 1 : this._selected_plug_id - 1;
  };

  private _next = (): void => {
    const len = this.config.devices?.length ?? 0;
    this._clearChart();
    this._selected_plug_id = this._selected_plug_id === len - 1 ? 0 : this._selected_plug_id + 1;
  };

  // ── Toggle ─────────────────────────────────────────────────────────────────

  private _toggle(device: SciFiPlugDevice): void {
    if (!device.entity_id || !this.hass.states[device.entity_id]) return;
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

  private _clearChart(): void {
    this._chart?.destroy();
    this._chart = null;
    // Invalidate cache for the current plug so _loadPowerChart refetches on next view
    delete this._chart_generation[this._selected_plug_id];
  }

  private async _loadPowerChart(device: SciFiPlugDevice, powerEntityId: string): Promise<void> {
    const idx = this._selected_plug_id;

    // Cache chart data per plug — avoids re-fetching when switching back to a previously viewed plug.
    // Cache is cleared when _clearChart() is called (plug navigation), not by time.
    const cache = this._chart_generation[idx];
    if (cache) {
      if (!this._chart) {
        this._drawChart(cache.datasets, cache.labels);
      } else {
        this._updateChart(cache.datasets, cache.labels);
      }
      return;
    }

    try {
      const yesterday = this._getYesterday();
      // [unverified — query params ported from main:src/helpers/entities/plug/plug.js]
      const data = await (this.hass as any).callApi(
        'GET',
        `history/period/${yesterday}?minimal_response=true&no_attributes=true&significant_changes_only=false&filter_entity_id=${powerEntityId}`
      ) as unknown[][];

      const history = this._parseHistory(data[0] ?? []);
      const msgContainer = this.shadowRoot?.querySelector('.msg-container');
      const chartContainer = this.shadowRoot?.querySelector('.chart-container') as HTMLElement | null;

      if (!Object.keys(history).length) {
        if (msgContainer) msgContainer.textContent = msg('No power data to display');
        if (chartContainer) chartContainer.style.display = 'none';
      } else {
        if (msgContainer) msgContainer.textContent = '';
        if (chartContainer) chartContainer.style.display = 'block';
      }

      const datasets = this._buildChartDatasets(Object.values(history));
      const labels = this._buildChartLabels(Object.keys(history));
      this._chart_generation[idx] = { datasets, labels, fetchedAt: Date.now() };

      if (!this._chart) {
        this._drawChart(datasets, labels);
      } else {
        this._updateChart(datasets, labels);
      }
    } catch (e) {
      this._toast(true, (e as Error).message);
    }
  }


  private _parseHistory(data: unknown[]): Record<string, number> {
    const res: Record<string, number> = {};
    (data as Array<{ last_changed: string; state: string }>).forEach((el, idx) => {
      if (idx === 0) return;
      const d = new Date(el.last_changed);
      d.setMinutes(Math.round(d.getMinutes()));
      d.setSeconds(0);
      d.setMilliseconds(0);
      const value = isNaN(parseFloat(el.state)) ? 0 : parseFloat(parseFloat(el.state).toFixed(2));
      const key = d.toISOString();
      if (!(key in res) || value > res[key]!) res[key] = value;
    });
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

  private _getYesterday(): string {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0]!;
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

  private _updateChart(datasets: unknown[], labels: string[]): void {
    if (!this._chart) return;
    this._chart.data = { labels, datasets: datasets as any };
    this._chart.update();
  }

  // ── Toast ──────────────────────────────────────────────────────────────────

  private _toast(error: boolean, text: string): void {
    const toast = this.shadowRoot?.querySelector('sf-toast') as any;
    if (toast?.addMessage) toast.addMessage(text, error);
  }

  // ── Card registration ──────────────────────────────────────────────────────

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
