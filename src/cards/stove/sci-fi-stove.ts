/**
 * <sci-fi-stove> — v1.0.0
 * Full reconstruction: layout matching the JS main branch original.
 * - Header: centered friendly_name
 * - Content: stove SVG image (left) + info panel (right)
 *   - TOP zone:  pellet circle-progress + storage stack-bar
 *   - MIDDLE zone: status list (time-to-service, state, temps, pressure)
 *   - BOTTOM zone: power row (rendered, consumed, fan)
 * - Bottom: interactive controls (mode, temperature wheel, preset)
 *
 * ADR-005: preserves entity (not entity_id), all sensors, storage_counter, thresholds.
 * CSS selector required by tests: .stove-status (the label in _renderStatus).
 */
import { html, nothing, type TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { msg, str } from '@lit/localize';

import { SciFiBaseCard } from '../../utils/base-card.js';
import type { SciFiBaseConfig } from '../../types/config.js';
import { normalizePelletPct } from '../../utils/pellet.js';
import { sciFiCommonStyles } from '../../styles/common.js';
import { stoveStyles } from './styles.js';
import {
  STOVE_PELLET_QUANTITY_THRESHOLD_DEFAULT,
  STOVE_STORAGE_COUNTER_THRESHOLD_DEFAULT,
  type SciFiStoveConfig,
} from './config.js';

import './sf-stove-image.js';
import '../../components/sf-circle-progress-bar.js';
import '../../components/sf-stack-bar.js';
import '../../components/sf-icon/sf-icon.js';
import '../../components/sf-wheel.js';
import '../../components/buttons/sf-button-card.js';
import '../../components/buttons/sf-button-card-select.js';
import { DOMAIN } from '../../types/domains.js';
import { ENTITY_ID } from '../../types/entity-ids.js';
import type { HomeAssistantExt } from '../../types/ha.js';
import {
  NUMBER_DEBOUNCE_MS,
  NUMBER_DOMAINS,
  type NumberWheelKey,
  type NumberWheelSpec,
  NUMBER_WHEELS,
  type NumberPick,
  type NumberPicks,
  type NumberEntity,
  isNumeric,
  numberGrid,
  numberValue,
  isNumberDisabled,
} from './number-wheel.js';
import { stateLabel } from './state-label.js';
import { renderWearCounters, wearEntityIds, wearRows } from './wear-counters.js';
import {
  DIAGNOSTIC_DOMAINS,
  DIAGNOSTIC_ICONS,
  type DiagnosticLine,
  capErrorText,
  capText,
  configuredId,
  errorCode,
  errorText,
  isDoorOpen,
  isReported,
  readDiagnostic,
} from './diagnostics.js';

const TAG = 'sci-fi-stove';

// ── Status display helpers (ported from main/src/cards/stove/const.js) ────────
// The 14 values of the core `fumis` integration's sensor.*_detailed_stove_status.
// The first seven are also what the HACS integration's binary_sensor wrote.
// The sci:stove-unknow fallback stays for a value a future release would add.
// Spec: docs/specs/cards/stove.md § Contrat d'intégration Fumis (bead ha-sci-fi-nib).
const STATUS_ICONS: Record<string, { icon: string; color: string }> = {
  off:              { icon: 'sci:stove-off',  color: 'off' },
  pre_heating:      { icon: 'sci:stove-heat', color: 'amber' },
  ignition:         { icon: 'sci:stove-heat', color: 'amber' },
  pre_combustion:   { icon: 'sci:stove-heat', color: 'red' },
  combustion:       { icon: 'sci:stove-heat', color: 'red' },
  eco:              { icon: 'sci:stove-eco',  color: 'green' },
  cooling:          { icon: 'sci:stove-cool', color: 'blue' },
  // core only — cold start, hybrid and wood phases
  cold_start:       { icon: 'sci:stove-heat', color: 'amber' },
  cold_start_off:   { icon: 'sci:stove-off',  color: 'off' },
  hybrid_init:      { icon: 'sci:stove-heat', color: 'amber' },
  hybrid_start:     { icon: 'sci:stove-heat', color: 'red' },
  wood_start:       { icon: 'sci:stove-heat', color: 'amber' },
  wood_combustion:  { icon: 'sci:stove-heat', color: 'red' },
  wood_burning_off: { icon: 'sci:stove-cool', color: 'blue' },
};

const STATUS_LABELS: Record<string, string> = {
  off:              'off',
  pre_heating:      'pre-heating',
  ignition:         'ignition',
  combustion:       'combustion',
  pre_combustion:   'pre-combustion',
  eco:              'eco',
  cooling:          'cooling',
  cold_start:       'cold start',
  cold_start_off:   'cold start off',
  hybrid_init:      'hybrid init',
  hybrid_start:     'hybrid start',
  wood_start:       'wood start',
  wood_combustion:  'wood combustion',
  wood_burning_off: 'wood burning off',
  unknown:          'unknown',
};

const HVAC_ICONS: Record<string, string> = {
  off:  'mdi:power',
  heat: 'mdi:fire',
  cool: 'mdi:snowflake',
};

const PRESET_ICONS: Record<string, string> = {
  none: 'mdi:circle-medium',
  eco:  'mdi:leaf',
};

@customElement(TAG)
export class SciFiStoveCard extends SciFiBaseCard {
  static override styles = [sciFiCommonStyles, stoveStyles];

  /** Per-wheel pick not yet released to HA's state (FR-8); reassigned whole on every change. */
  /** FR-8: the wear section's open state, per instance, never persisted. */
  @state() private _wearOpen = false;
  @state() private _numberPicks: NumberPicks = { powerLevel: null, fanSpeed: null };
  /** Per-wheel debounce timers: never rendered, so not reactive. */
  private _numberTimers: Readonly<Partial<Record<NumberWheelKey, ReturnType<typeof setTimeout>>>> = {};

  /** Read by the power-level suite: the pending index of the power wheel. */
  private get _powerPendingIndex(): number | null {
    return this._numberPicks.powerLevel?.index ?? null;
  }

  override get hass(): HomeAssistantExt {
    return super.hass;
  }

  override set hass(hass: HomeAssistantExt) {
    super.hass = hass;
    for (const spec of NUMBER_WHEELS) this._releaseNumberPick(spec);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    for (const spec of NUMBER_WHEELS) this._cancelNumberTimer(spec);
    this._numberPicks = { powerLevel: null, fanSpeed: null };
  }

  /** Configured ids only: when all are absent the base card shows its banner. */
  protected override getConfiguredEntities(): string[] {
    return this.getRelevantEntities();
  }

  protected override getRelevantEntities(): string[] {
    const entities = new Set<string>();

    if (this.config.entity) {
      entities.add(this.config.entity);
    }
    if (this.config.storage_counter) {
      entities.add(this.config.storage_counter);
    }
    if (this.config.switch_eco_mode) {
      entities.add(this.config.switch_eco_mode);
    }
    if (this.config.number_power_level) {
      entities.add(this.config.number_power_level);
    }
    if (this.config.number_fan_speed) {
      entities.add(this.config.number_fan_speed);
    }
    if (this.config.sensors) {
      const s = this.config.sensors;
      if (s.sensor_actual_power) entities.add(s.sensor_actual_power);
      if (s.sensor_combustion_chamber_temperature) entities.add(s.sensor_combustion_chamber_temperature);
      if (s.sensor_inside_temperature) entities.add(s.sensor_inside_temperature);
      if (s.sensor_pellet_quantity) entities.add(s.sensor_pellet_quantity);
      if (s.sensor_power) entities.add(s.sensor_power);
      if (s.sensor_status) entities.add(s.sensor_status);
      if (s.sensor_fan_speed) entities.add(s.sensor_fan_speed);
      if (s.sensor_pressure) entities.add(s.sensor_pressure);
      if (s.sensor_time_to_service) entities.add(s.sensor_time_to_service);
      for (const raw of [s.sensor_door, s.sensor_alert, s.sensor_error]) {
        const id = configuredId(raw);
        if (id) entities.add(id);
      }
      for (const id of wearEntityIds(s)) entities.add(id);
    }

    return Array.from(entities);
  }

  declare config: SciFiStoveConfig;

  /** A config without `entity` is refused here, as HA cards do (bead ha-sci-fi-bnf). */
  protected override validateConfig(config: SciFiBaseConfig): void {
    super.validateConfig(config);
    const entity: unknown = (config as Partial<SciFiStoveConfig>).entity;
    if (typeof entity !== 'string' || entity === '') {
      throw new Error('You need to define an entity');
    }
  }

  protected override renderCard(): TemplateResult {
    const stoveState = this.hass.states[this.config.entity];
    if (!stoveState) {
      return html`<ha-card><div class="container">${msg(str`Stove entity not found: ${this.config.entity}`)}</div></ha-card>`;
    }

    return html`
      <ha-card>
        <div class="container">
          ${this._renderHeader(stoveState.attributes.friendly_name ?? msg('Stove'))}
          ${this._renderContent(stoveState)}
          ${this._renderBottom(stoveState)}
          ${renderWearCounters(wearRows(this.hass, this.config.sensors ?? {}), this._wearOpen, (open) => {
            this._wearOpen = open;
          }, this.hass.connection)}
        </div>
        <sf-toast></sf-toast>
      </ha-card>
    `;
  }

  // ── HEADER ────────────────────────────────────────────────────────────────

  private _renderHeader(name: string): TemplateResult {
    return html`<div class="header">${name}</div>`;
  }

  // ── CONTENT ───────────────────────────────────────────────────────────────

  private _renderContent(stoveState: any): TemplateResult {
    const s = this.config.sensors ?? {};
    const diagnostics = this._diagnosticLines(s);
    return html`
      <div class="content">
        <sf-stove-image state=${stoveState.state}></sf-stove-image>
        ${this._renderDiagnosticBadge(diagnostics)}
        <div class="info">
          ${this._renderTopZone(s)}
          ${this._renderMiddleZone(stoveState, s, diagnostics)}
          ${this._renderPowerZone(s)}
        </div>
      </div>
    `;
  }

  /** TOP zone: pellet circle gauge + storage stack bar */
  private _renderTopZone(s: any): TemplateResult {
    return html`
      <div class="e bottom-path">
        <div class="display">
          <div class="circle"></div>
          <div class="h-path"></div>
          <div class="d-path"></div>
        </div>
        <div class="quantities">
          ${this._renderPelletQuantity(s)}
          ${this._renderPelletStock()}
        </div>
      </div>
    `;
  }

  private _renderPelletQuantity(s: any): TemplateResult | typeof nothing {
    if (!s.sensor_pellet_quantity) return nothing;
    const pelletState = this.hass.states[s.sensor_pellet_quantity];
    if (!pelletState) return nothing;
    const val = parseFloat(pelletState.state);
    if (!Number.isFinite(val)) return nothing;
    const threshold = this.config.pellet_quantity_threshold ?? STOVE_PELLET_QUANTITY_THRESHOLD_DEFAULT;
    return html`
      <sf-circle-progress-bar
        text="${msg('Fuel quantity')}"
        .val=${normalizePelletPct(val)}
        .threshold=${threshold}
      ></sf-circle-progress-bar>
    `;
  }

  private _renderPelletStock(): TemplateResult | typeof nothing {
    if (!this.config.storage_counter) return nothing;
    const st = this.hass.states[this.config.storage_counter];
    if (!st) return nothing;
    const val = parseInt(st.state, 10);
    const max = (st.attributes['maximum'] as number | undefined) ?? 100;
    const threshold = this.config.storage_counter_threshold ?? STOVE_STORAGE_COUNTER_THRESHOLD_DEFAULT;
    return html`
      <sf-stack-bar
        text="${msg('Stock')}"
        .val=${val}
        .max=${max}
        .threshold=${threshold}
      ></sf-stack-bar>
    `;
  }

  /** MIDDLE zone: status list with border-left line */
  private _renderMiddleZone(stoveState: any, s: any, diagnostics: readonly DiagnosticLine[]): TemplateResult {
    const tempUnit = this.hass.config?.unit_system?.temperature ?? '°C';
    const pressureUnit = this.hass.config?.unit_system?.pressure ?? 'Pa';
    const status = s.sensor_status ? this.hass.states[s.sensor_status]?.state : undefined;
    const insideTemp = s.sensor_inside_temperature ? this.hass.states[s.sensor_inside_temperature]?.state : undefined;
    const combustionTemp = s.sensor_combustion_chamber_temperature ? this.hass.states[s.sensor_combustion_chamber_temperature]?.state : undefined;
    const pressure = s.sensor_pressure ? this.hass.states[s.sensor_pressure]?.state : undefined;
    const timeToService = s.sensor_time_to_service ? this.hass.states[s.sensor_time_to_service]?.state : undefined;
    const timeUnit: string = s.sensor_time_to_service
      ? String(this.hass.states[s.sensor_time_to_service]?.attributes?.unit_of_measurement ?? 'h')
      : 'h';

    return html`
      <div class="m">
        <div class="display">
          <div class="circle"></div>
          <div class="h-path"></div>
        </div>
        <div class="temperatures">
          ${this._renderTimeToService(timeToService, timeUnit)}
          ${this._renderStatus(msg('Status'), status)}
          ${this._renderDiagnostics(diagnostics)}
          ${this._renderTemperature(msg('External'), insideTemp ? parseFloat(insideTemp) : undefined, tempUnit)}
          ${this._renderTemperature(msg('Internal'), combustionTemp ? parseFloat(combustionTemp) : undefined, tempUnit)}
          ${this._renderPressure(msg('Pressure'), pressure, pressureUnit)}
        </div>
      </div>
    `;
  }

  // ── DIAGNOSTICS (spec docs/specs/stove-diagnostics) ────────────────────────

  /** FR-5, FR-7, FR-13: the lines to render, in the order door, alert, error. */
  private _diagnosticLines(s: any): DiagnosticLine[] {
    const read = (raw: unknown, prefix: string) => readDiagnostic(this.hass.states, configuredId(raw), prefix);
    const door = read(s.sensor_door, DIAGNOSTIC_DOMAINS.door);
    const alert = read(s.sensor_alert, DIAGNOSTIC_DOMAINS.alert);
    const error = read(s.sensor_error, DIAGNOSTIC_DOMAINS.error);
    const alertOn = alert !== undefined && isReported(alert);
    const lines: DiagnosticLine[] = [];
    if (door && isDoorOpen(door) && !(alertOn && alert.state.trim().toLowerCase() === 'door_open')) {
      const text = msg('Door open');
      lines.push({ kind: 'door', text, capped: capText(text) });
    }
    if (alertOn) {
      const label = stateLabel(this.hass, alert);
      lines.push({ kind: 'alert', text: label, capped: capText(label) });
    }
    if (error && isReported(error)) {
      const label = stateLabel(this.hass, error);
      const code = errorCode(error.attributes?.['code']);
      lines.push({ kind: 'error', text: errorText(label, code), capped: capErrorText(label, code) });
    }
    return lines;
  }

  /** FR-6: the live zone, only when there is a line to render. */
  private _renderDiagnostics(lines: readonly DiagnosticLine[]): TemplateResult | typeof nothing {
    if (lines.length === 0) return nothing;
    return html`
      <div class="diagnostics" role="status" aria-live="polite">
        ${lines.map((l) => html`
          <div class="diagnostic ${l.kind}">
            <sf-icon icon="${DIAGNOSTIC_ICONS[l.kind]}" aria-hidden="true" .connection="${this.hass.connection}"></sf-icon>
            <div class="diagnostic-text" title="${l.capped}">${l.text}</div>
          </div>
        `)}
      </div>
    `;
  }

  /** FR-8: one badge, of the most severe kind rendered (lines are ordered by severity). */
  private _renderDiagnosticBadge(lines: readonly DiagnosticLine[]): TemplateResult | typeof nothing {
    const worst = lines[lines.length - 1];
    if (!worst) return nothing;
    const label = capText(lines.map((l) => l.capped).join(' · '));
    return html`<sf-icon class="diagnostic-badge ${worst.kind}" icon="${DIAGNOSTIC_ICONS[worst.kind]}"
      role="img" title="${label}" aria-label="${label}" .connection="${this.hass.connection}"></sf-icon>`;
  }

  private _renderTimeToService(hours: string | undefined, unit: string): TemplateResult | typeof nothing {
    if (!hours) return nothing;
    const h = parseInt(hours, 10);
    const state = h <= 240 ? 'high' : h <= 480 ? 'medium' : null;
    return html`
      <div class="temperature ${state ?? ''}">
        <sf-icon icon="mdi:timeline-clock-outline" .connection="${this.hass.connection}"></sf-icon>
        <div class="label">${msg('Time to Service')}:</div>
        <div>${h}${unit}</div>
      </div>
    `;
  }

  private _renderStatus(text: string, status: string | undefined): TemplateResult {
    const resolved = status ?? 'N/A';
    const meta = STATUS_ICONS[resolved] ?? { icon: 'sci:stove-unknow', color: 'off' };
    const label = STATUS_LABELS[resolved] ?? resolved.replaceAll('_', ' ');
    return html`
      <div class="status ${meta.color}">
        <sf-icon icon="${meta.icon}" .connection="${this.hass.connection}"></sf-icon>
        <div class="label">${text}:</div>
        <div class="stove-status">${label}</div>
      </div>
    `;
  }

  private _renderTemperature(text: string, temp: number | undefined, unit: string): TemplateResult {
    if (temp === undefined || temp === null) {
      return html`
        <div class="temperature off">
          <div class="no-temp">
            <sf-icon icon="mdi:thermometer" .connection="${this.hass.connection}"></sf-icon>
            <sf-icon icon="mdi:help" .connection="${this.hass.connection}"></sf-icon>
          </div>
          <div class="label">${text}:</div>
          <div>N/A</div>
        </div>
      `;
    }
    let icon = 'mdi:thermometer-off';
    let state = 'off';
    if (temp >= 25) { icon = 'mdi:thermometer-high'; state = 'high'; }
    else if (temp >= 16) { icon = 'mdi:thermometer'; state = 'medium'; }
    else { icon = 'mdi:thermometer-low'; state = 'low'; }
    return html`
      <div class="temperature ${state}">
        <sf-icon icon="${icon}" .connection="${this.hass.connection}"></sf-icon>
        <div class="label">${text}:</div>
        <div>${temp}${unit}</div>
      </div>
    `;
  }

  private _renderPressure(text: string, pressure: string | undefined, unit: string): TemplateResult | typeof nothing {
    if (!pressure) return nothing;
    return html`
      <div class="temperature ${pressure === '0' ? 'off' : ''}">
        <sf-icon icon="mdi:gauge" .connection="${this.hass.connection}"></sf-icon>
        <div class="label">${text}:</div>
        <div>${pressure}${unit}</div>
      </div>
    `;
  }

  /** BOTTOM of content: power row */
  private _renderPowerZone(s: any): TemplateResult {
    const actualPower = s.sensor_actual_power ? this.hass.states[s.sensor_actual_power] : undefined;
    const power = s.sensor_power ? this.hass.states[s.sensor_power] : undefined;
    const fanSpeed = s.sensor_fan_speed ? this.hass.states[s.sensor_fan_speed] : undefined;

    return html`
      <div class="e top-path">
        <div class="display">
          <div class="circle"></div>
          <div class="h-path"></div>
          <div class="d-path"></div>
        </div>
        <div class="powers">
          ${this._renderPower(msg('Render'), actualPower?.state, actualPower?.attributes?.unit_of_measurement as string | undefined)}
          ${this._renderPower(msg('Consume'), power?.state, power?.attributes?.unit_of_measurement as string | undefined)}
          ${this._renderFan(msg('Fan speed'), fanSpeed?.state, fanSpeed?.attributes?.unit_of_measurement as string | undefined)}
        </div>
      </div>
    `;
  }

  private _renderPower(text: string, value: string | undefined, unit: string | undefined): TemplateResult {
    const display = value ?? 'N/A';
    return html`
      <div class="power">
        <sf-icon icon="mdi:lightning-bolt" .connection="${this.hass.connection}"></sf-icon>
        <div class="label">${text}</div>
        <div class="${display === 'N/A' ? 'nothing' : ''}">${display} ${unit ?? ''}</div>
      </div>
    `;
  }

  private _renderFan(text: string, value: string | undefined, unit: string | undefined): TemplateResult | typeof nothing {
    if (value === undefined || value === null) return nothing;
    return html`
      <div class="power">
        <sf-icon icon="mdi:speedometer" .connection="${this.hass.connection}"></sf-icon>
        <div class="label">${text}</div>
        <div>${value} ${unit ?? ''}</div>
      </div>
    `;
  }

  // ── BOTTOM INTERACTIVE ────────────────────────────────────────────────────

  private _renderBottom(stoveState: any): TemplateResult {
    const hvacModes: string[] = stoveState.attributes.hvac_modes ?? [];
    const presetModes: string[] = stoveState.attributes.preset_modes ?? [];
    const currentPreset: string = stoveState.attributes.preset_mode ?? 'none';
    const targetTemp: number = stoveState.attributes.temperature ?? stoveState.attributes.current_temperature ?? 20;
    const minTemp: number = stoveState.attributes.min_temp ?? 15;
    const maxTemp: number = stoveState.attributes.max_temp ?? 30;

    const hvacItems = hvacModes.map(m => ({
      id: m, text: m, icon: HVAC_ICONS[m] ?? 'mdi:information-off-outline',
    }));

    const presetItems = presetModes.map(p => ({
      id: p, text: p, icon: PRESET_ICONS[p] ?? 'mdi:circle-medium',
    }));

    // Build temperature wheel items (min..max step 1)
    const tempItems = Array.from({ length: maxTemp - minTemp + 1 }, (_, i) => ({
      id: String(minTemp + i),
      text: `${minTemp + i}°C`,
    }));

    return html`
      <div class="bottom">
        <sf-button-card-select
          icon="${HVAC_ICONS[stoveState.state] ?? 'mdi:information-off-outline'}"
          title="${msg('Mode')}"
          text="${this._getHvacLabel(stoveState.state)}"
          .items="${hvacItems}"
          position="bottom"
          @button-select="${(e: CustomEvent) => this._onHvacSelect(e, stoveState.attributes.entity_id ?? this.config.entity)}"
        ></sf-button-card-select>

        <sf-wheel
          .items="${tempItems}"
          .selectedId="${String(Math.round(targetTemp))}"
          text="${msg('Temperature')}"
          @wheel-change="${(e: CustomEvent) => this._onTempChange(e, stoveState.attributes.entity_id ?? this.config.entity)}"
        ></sf-wheel>

        ${NUMBER_WHEELS.map(spec => this._renderNumberWheel(spec))}

        ${this._renderEcoControl(stoveState, presetItems, currentPreset)}
      </div>
    `;
  }

  /**
   * Third bottom control — eco mode, in whichever shape the integration offers.
   *
   * The HACS integration carried eco as a climate preset; the core one dropped
   * PRESET_MODE and moved eco to its own switch.*_eco_mode entity. With neither,
   * the historical code still rendered the button over an empty list: a dead
   * control. Nothing is rendered instead.
   *
   * Spec: docs/specs/cards/stove.md § Mode éco (bead ha-sci-fi-1qy).
   */
  private _renderEcoControl(
    stoveState: any,
    presetItems: ReadonlyArray<{ id: string; text: string; icon: string }>,
    currentPreset: string,
  ): TemplateResult | typeof nothing {
    // A configured entity that is absent from hass is treated as not configured:
    // rendering the toggle on the config STRING alone would put back the very
    // thing O3 removed — a live-looking control whose press only error-toasts.
    // Same guard as _renderPelletQuantity / _renderPelletStock.
    const ecoSwitch = this.config.switch_eco_mode;
    const ecoState = ecoSwitch ? this.hass.states[ecoSwitch] : undefined;
    if (ecoSwitch && ecoState) {
      const ecoOn = ecoState.state === 'on';
      return html`
        <sf-button-card
          icon="${ecoOn ? 'mdi:leaf' : 'mdi:circle-medium'}"
          title="${msg('Eco')}"
          text="${ecoOn ? msg('On') : msg('Off')}"
          @button-click="${() => this._onEcoToggle(ecoSwitch)}"
        ></sf-button-card>
      `;
    }

    if (presetItems.length === 0) return nothing;

    return html`
      <sf-button-card-select
        icon="${PRESET_ICONS[currentPreset] ?? 'mdi:circle-medium'}"
        title="${msg('Preset')}"
        text="${this._getPresetLabel(currentPreset)}"
        .items="${presetItems}"
        position="bottom"
        @button-select="${(e: CustomEvent) => this._onPresetSelect(e, stoveState.attributes.entity_id ?? this.config.entity)}"
      ></sf-button-card-select>
    `;
  }

  // ── NUMBER WHEELS (power level, fan speed) ────────────────────────────────

  /**
   * FR-12: the domain of the configured entity, when it is present and writable.
   * stove-fan-speed FR-4.2: an entity already driven by an earlier wheel gets no second wheel.
   */
  private _numberDomain(spec: NumberWheelSpec): string | undefined {
    const id = this.config?.[spec.field];
    if (!id || !this.hass?.states[id]) return undefined;
    const earlier = NUMBER_WHEELS.slice(0, NUMBER_WHEELS.indexOf(spec));
    if (earlier.some(other => this.config[other.field] === id)) return undefined;
    const prefix = id.split('.')[0];
    return NUMBER_DOMAINS.find(d => d === prefix);
  }

  private _numberEntity(spec: NumberWheelSpec): NumberEntity | undefined {
    const id = this.config?.[spec.field];
    if (!id || !this._numberDomain(spec)) return undefined;
    return this.hass.states[id];
  }

  /** FR-5.2: index ids, never the value. */
  private _numberItems(spec: NumberWheelSpec, attrs: Record<string, unknown> | undefined): Array<{ id: string; text: string }> {
    const grid = numberGrid(attrs, spec.fallback);
    return Array.from({ length: grid.n }, (_, k) => ({ id: String(k), text: numberValue(grid, k).toFixed(grid.d) }));
  }

  /** FR-6: the pending pick, else the nearest item to HA's state, clamped. */
  private _numberSelectedId(spec: NumberWheelSpec, entity: NumberEntity): string | null {
    const pick = this._numberPicks[spec.key];
    if (pick) return String(pick.index);
    if (!isNumeric(entity.state)) return null;
    const grid = numberGrid(entity.attributes, spec.fallback);
    const k = Math.round((Number(entity.state) - grid.min) / grid.step);
    return String(Math.min(Math.max(k, 0), grid.n - 1));
  }

  /** FR-4, FR-7, FR-13: a number wheel of the bottom bar; nothing when not configured (FR-3). */
  private _renderNumberWheel(spec: NumberWheelSpec): TemplateResult | typeof nothing {
    const entity = this._numberEntity(spec);
    if (!entity) return nothing;
    const disabled = isNumberDisabled(entity);
    return html`
      <sf-wheel
        class="${spec.cssClass}"
        .items="${this._numberItems(spec, entity.attributes)}"
        .selectedId="${this._numberSelectedId(spec, entity)}"
        text="${spec.label()}"
        aria-label="${spec.label()}"
        title="${disabled ? spec.unavailableMessage() : nothing}"
        ?disabled="${disabled}"
        @wheel-change="${(e: CustomEvent) => this._onNumberWheelChange(spec, e)}"
      ></sf-wheel>
    `;
  }

  private _setNumberPick(spec: NumberWheelSpec, pick: NumberPick | null): void {
    this._numberPicks = { ...this._numberPicks, [spec.key]: pick };
  }

  /** FR-8: remember the pick, restart this wheel's debounce timer only. */
  private _onNumberWheelChange(spec: NumberWheelSpec, e: CustomEvent): void {
    const entity = this._numberEntity(spec);
    if (!entity || isNumberDisabled(entity)) return;
    const k = Number((e.detail as { id?: unknown } | undefined)?.id);
    if (!Number.isInteger(k) || k < 0 || k >= numberGrid(entity.attributes, spec.fallback).n) return;
    this._setNumberPick(spec, { index: k, sent: false });
    this._cancelNumberTimer(spec);
    this._numberTimers = { ...this._numberTimers, [spec.key]: setTimeout(() => this._sendNumberValue(spec), NUMBER_DEBOUNCE_MS) };
  }

  /** FR-8: one set_value on the entity's own domain, one toast on settlement. */
  private _sendNumberValue(spec: NumberWheelSpec): void {
    this._numberTimers = { ...this._numberTimers, [spec.key]: undefined };
    const k = this._numberPicks[spec.key]?.index;
    const domain = this._numberDomain(spec);
    const entity = this._numberEntity(spec);
    if (k === undefined || !domain || !entity || isNumberDisabled(entity)) {
      this._setNumberPick(spec, null);
      return;
    }
    const grid = numberGrid(entity.attributes, spec.fallback);
    if (k >= grid.n) {
      this._setNumberPick(spec, null);
      return;
    }
    this._setNumberPick(spec, { index: k, sent: true });
    void this.hass
      .callService(domain, 'set_value', { entity_id: this.config[spec.field], value: numberValue(grid, k) })
      .then(() => { this._showToast(false, spec.successMessage()); })
      .catch((err: unknown) => { this._showToast(true, err instanceof Error ? err.message : String(err)); });
  }

  /** FR-8 per wheel: after the call, HA's state takes over; while waiting, only a lost or disabled entity cancels. */
  private _releaseNumberPick(spec: NumberWheelSpec): void {
    const pick = this._numberPicks[spec.key];
    if (!pick) return;
    const entity = this._numberEntity(spec);
    if (
      pick.sent || !entity || isNumberDisabled(entity) ||
      pick.index >= numberGrid(entity.attributes, spec.fallback).n
    ) {
      this._cancelNumberTimer(spec);
      this._setNumberPick(spec, null);
    }
  }

  private _cancelNumberTimer(spec: NumberWheelSpec): void {
    const timer = this._numberTimers[spec.key];
    if (timer !== undefined) clearTimeout(timer);
    this._numberTimers = { ...this._numberTimers, [spec.key]: undefined };
  }

  private _getHvacLabel(state: string): string {
    const labels: Record<string, string> = { off: msg('Off'), heat: msg('Heat'), cool: msg('Cool'), auto: msg('Auto') };
    return labels[state] ?? state;
  }

  private _getPresetLabel(preset: string): string {
    const labels: Record<string, string> = { none: msg('None'), eco: msg('Eco') };
    return labels[preset] ?? preset;
  }

  private _onHvacSelect(e: CustomEvent, entityId: string): void {
    const mode: string = e.detail.id;
    void this.hass
      .callService(DOMAIN.CLIMATE, 'set_hvac_mode', { entity_id: entityId, hvac_mode: mode })
      .then(() => { this._showToast(false, msg('HVAC mode changed')); })
      .catch((err: Error) => { this._showToast(true, err.message); });
  }

  private _onTempChange(e: CustomEvent, entityId: string): void {
    const temp = parseFloat(e.detail.id);
    if (!isNaN(temp)) {
      void this.hass
        .callService(DOMAIN.CLIMATE, 'set_temperature', { entity_id: entityId, temperature: temp })
        .then(() => { this._showToast(false, msg('Temperature changed')); })
        .catch((err: Error) => { this._showToast(true, err.message); });
    }
  }

  private _onEcoToggle(switchEntityId: string): void {
    void this.hass
      .callService(DOMAIN.SWITCH, 'toggle', { entity_id: switchEntityId })
      .then(() => { this._showToast(false, msg('Eco mode changed')); })
      .catch((err: Error) => { this._showToast(true, err.message); });
  }

  private _onPresetSelect(e: CustomEvent, entityId: string): void {
    const preset: string = e.detail.id;
    void this.hass
      .callService(DOMAIN.CLIMATE, 'set_preset_mode', { entity_id: entityId, preset_mode: preset })
      .then(() => { this._showToast(false, msg('Preset changed')); })
      .catch((err: Error) => { this._showToast(true, err.message); });
  }

  private _showToast(error: boolean, text: string): void {
    const toast = this.shadowRoot?.querySelector('sf-toast') as any;
    if (toast?.addMessage) toast.addMessage(text, error);
  }

  // ── Card registration ─────────────────────────────────────────────────────

  override getCardSize(): number {
    return this.config ? 4 : 3;
  }

  static getConfigElement(): HTMLElement {
    return document.createElement(`${TAG}-editor`);
  }

  static getStubConfig(): SciFiStoveConfig {
    return { type: `custom:${TAG}`, entity: ENTITY_ID.STUB_STOVE };
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [TAG]: SciFiStoveCard;
  }
}
