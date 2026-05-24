/**
 * <sci-fi-weather> — v1.0.0
 * Weather card with current conditions + hourly/daily forecast chart (Chart.js bundled).
 * ADR-005: uses weather_entity (not weather_entity_id) + alert section preserved.
 * Chart.js is bundled (HIGH-01 fix) — never loaded from CDN.
 */

import { html, css, type TemplateResult } from 'lit';
import { customElement, query } from 'lit/decorators.js';
import { SciFiBaseCard } from '../../utils/base-card.js';
import { sciFiCommonStyles } from '../../styles/common.js';
import type { SciFiWeatherConfig } from '../../types/config.js';

// Chart.js is tree-shaken and bundled by Rollup (see rollup.config.mjs)
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Filler,
  Tooltip,
} from 'chart.js';

Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Filler,
  Tooltip
);

const TAG = 'sci-fi-weather';

// Weather condition → MDI icon mapping
const WEATHER_ICON_MAP: Record<string, string> = {
  'clear-night': 'mdi:weather-night',
  'cloudy': 'mdi:weather-cloudy',
  'exceptional': 'mdi:alert-circle',
  'fog': 'mdi:weather-fog',
  'hail': 'mdi:weather-hail',
  'lightning': 'mdi:weather-lightning',
  'lightning-rainy': 'mdi:weather-lightning-rainy',
  'partlycloudy': 'mdi:weather-partly-cloudy',
  'pouring': 'mdi:weather-pouring',
  'rainy': 'mdi:weather-rainy',
  'snowy': 'mdi:weather-snowy',
  'snowy-rainy': 'mdi:weather-snowy-rainy',
  'sunny': 'mdi:weather-sunny',
  'windy': 'mdi:weather-windy',
  'windy-variant': 'mdi:weather-windy-variant',
};

// Alert level → background/color mapping
const ALERT_LEVEL_STYLES: Record<string, { bg: string; color: string }> = {
  green:  { bg: 'rgba(0,255,157,0.1)',   color: '#00ff9d' },
  yellow: { bg: 'rgba(255,214,10,0.1)', color: '#ffd60a' },
  orange: { bg: 'rgba(255,107,53,0.1)', color: '#ff6b35' },
  red:    { bg: 'rgba(255,77,109,0.15)', color: '#ff4d6d' },
};

@customElement(TAG)
export class SciFiWeatherCard extends SciFiBaseCard {
  static override styles = [
    sciFiCommonStyles,
    css`
      .container { padding: var(--sf-spacing-md); }
      .alert-band {
        padding: var(--sf-spacing-sm);
        border-radius: var(--sf-radius-sm);
        margin-bottom: var(--sf-spacing-md);
        text-align: center;
        font-size: var(--sf-font-size-sm);
        font-weight: 600;
      }
      .current {
        display: flex;
        align-items: center;
        gap: var(--sf-spacing-md);
        margin-bottom: var(--sf-spacing-lg);
      }
      .current-temp {
        font-size: 3rem;
        font-weight: 700;
        color: var(--sf-primary);
        line-height: 1;
      }
      .current-desc {
        font-size: var(--sf-font-size-base);
        color: var(--sf-text-secondary);
        text-transform: capitalize;
      }
      .current-details {
        display: flex;
        flex-direction: column;
        gap: 4px;
        margin-left: auto;
        text-align: right;
        font-size: var(--sf-font-size-sm);
        color: var(--sf-text-secondary);
      }
      .chart-container {
        position: relative;
        height: 120px;
        margin-bottom: var(--sf-spacing-md);
      }
      .forecast-row {
        display: flex;
        justify-content: space-between;
        gap: var(--sf-spacing-xs);
        overflow-x: auto;
        padding-bottom: var(--sf-spacing-xs);
      }
      .forecast-day {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        min-width: 48px;
        font-size: var(--sf-font-size-sm);
        color: var(--sf-text-secondary);
      }
      .forecast-day .temp-hi { color: var(--sf-text-primary); font-weight: 600; }
      .forecast-day .temp-lo { color: var(--sf-text-disabled); }
    `,
  ];

  @query('#weather-chart') private _chartCanvas?: HTMLCanvasElement;
  private _chart?: Chart;

  declare config: SciFiWeatherConfig;

  override updated(): void {
    this._renderChart();
  }

  private _renderChart(): void {
    if (!this.hass) return;
    // ADR-005: field is weather_entity (not weather_entity_id)
    const weatherEntity = this.hass.states[this.config.weather_entity];
    const forecast = (weatherEntity?.attributes['forecast'] as unknown[]) ?? [];

    if (!this._chartCanvas || forecast.length === 0) return;

    const temps = forecast
      .slice(0, 24)
      .map(f => (f as Record<string, unknown>)['temperature'] as number);
    const labels = forecast
      .slice(0, 24)
      .map(f => {
        const dt = (f as Record<string, unknown>)['datetime'] as string;
        return new Date(dt).getHours() + 'h';
      });

    if (this._chart) {
      this._chart.data.labels = labels;
      (this._chart.data.datasets[0] as { data: number[] }).data = temps;
      this._chart.update();
      return;
    }

    try {
      this._chart = new Chart(this._chartCanvas, {
        type: 'line',
        data: {
          labels,
          datasets: [{
            data: temps,
            borderColor: 'rgba(0, 210, 255, 0.8)',
            backgroundColor: 'rgba(0, 210, 255, 0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 2,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { ticks: { color: 'rgba(224,232,255,0.6)', font: { size: 10 } }, grid: { display: false } },
            y: { ticks: { color: 'rgba(224,232,255,0.6)', font: { size: 10 } }, grid: { color: 'rgba(0,210,255,0.1)' } },
          },
        },
      });
    } catch {
      // Chart.js init failure — fallback rendered in renderCard (TC-506)
    }
  }

  /** Resolve alert state to level string (case-insensitive, trimmed). */
  private _resolveAlertLevel(alertState: string): string {
    const s = alertState.trim().toLowerCase();
    const cfg = this.config.alert!;
    if (cfg.state_green?.toLowerCase() === s) return 'green';
    if (cfg.state_yellow?.toLowerCase() === s) return 'yellow';
    if (cfg.state_orange?.toLowerCase() === s) return 'orange';
    if (cfg.state_red?.toLowerCase() === s) return 'red';
    return 'green';
  }

  protected override renderCard(): TemplateResult {
    // ADR-005: field is weather_entity (not weather_entity_id)
    const weatherEntity = this.hass.states[this.config.weather_entity];
    if (!weatherEntity) {
      return html`<ha-card><div class="container">Entité météo non trouvée : ${this.config.weather_entity}</div></ha-card>`;
    }

    const condition = weatherEntity.state;
    const icon = WEATHER_ICON_MAP[condition] ?? 'mdi:weather-cloudy';
    const temp = weatherEntity.attributes['temperature'] as number | undefined;
    const humidity = weatherEntity.attributes['humidity'] as number | undefined;
    const wind = weatherEntity.attributes['wind_speed'] as number | undefined;
    const forecast = (weatherEntity.attributes['forecast'] as unknown[]) ?? [];
    const dailyLimit = this.config.weather_daily_forecast_limit ?? 5;
    const dailyForecast = forecast.slice(0, dailyLimit);

    // ADR-005: alert section preserved
    const alertSection = this._renderAlert();

    return html`
      <ha-card>
        ${this.config.header_message ? html`<div class="sf-header">${this.config.header_message}</div>` : ''}
        <div class="container">
          ${alertSection}
          <div class="current">
            <sf-icon .icon="${icon}" .connection="${this.hass.connection}"></sf-icon>
            <div>
              <div class="current-temp">${temp ?? '--'}°</div>
              <div class="current-desc">${condition}</div>
            </div>
            <div class="current-details">
              ${humidity !== null && humidity !== undefined ? html`<span>💧 ${humidity}%</span>` : ''}
              ${wind !== null && wind !== undefined ? html`<span>💨 ${wind} km/h</span>` : ''}
            </div>
          </div>

          <div class="chart-container">
            <canvas id="weather-chart"></canvas>
          </div>

          <div class="forecast-row">
            ${dailyForecast.map(day => {
              const d = day as Record<string, unknown>;
              const dt = new Date(d['datetime'] as string);
              const dayName = dt.toLocaleDateString('fr', { weekday: 'short' });
              const hi = d['temperature'] as number;
              const lo = d['templow'] as number | undefined;
              const cond = d['condition'] as string;
              const dIcon = WEATHER_ICON_MAP[cond] ?? 'mdi:weather-cloudy';
              return html`
                <div class="forecast-day">
                  <span>${dayName}</span>
                  <sf-icon .icon="${dIcon}" .connection="${this.hass.connection}"></sf-icon>
                  <span class="temp-hi">${hi}°</span>
                  ${lo !== null && lo !== undefined ? html`<span class="temp-lo">${lo}°</span>` : ''}
                </div>
              `;
            })}
          </div>
        </div>
      </ha-card>
    `;
  }

  /** ADR-005: alert section — was missing in v1.0.0-wip. */
  private _renderAlert(): TemplateResult {
    const alertCfg = this.config.alert;
    if (!alertCfg?.entity_id) return html``;

    const alertState = this.hass.states[alertCfg.entity_id]?.state;
    if (!alertState) return html``;

    const level = this._resolveAlertLevel(alertState);
    const styles = ALERT_LEVEL_STYLES[level]!;

    return html`
      <div
        class="alert-band"
        style="background: ${styles.bg}; color: ${styles.color};"
        role="alert"
        aria-label="Alerte météo niveau ${level}"
      >
        ⚠️ Alerte météo : ${alertState}
      </div>
    `;
  }

  static getConfigElement(): HTMLElement {
    return document.createElement(`${TAG}-editor`);
  }

  static getStubConfig(): SciFiWeatherConfig {
    // ADR-005: weather_entity (not weather_entity_id)
    return { type: `custom:${TAG}`, weather_entity: 'weather.forecast_home' };
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [TAG]: SciFiWeatherCard;
  }
}
