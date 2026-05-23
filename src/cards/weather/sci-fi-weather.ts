/**
 * <sci-fi-weather> — v2
 * Weather card with current conditions + hourly/daily forecast chart (Chart.js bundled).
 * Chart.js is bundled (HIGH-01 fix) — never loaded from CDN.
 */

import { html, css, type TemplateResult } from 'lit';
import { customElement, state, query } from 'lit/decorators.js';
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

@customElement(TAG)
export class SciFiWeatherCard extends SciFiBaseCard {
  static override styles = [
    sciFiCommonStyles,
    css`
      .container { padding: var(--sf-spacing-md); }
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
  @state() private _chart?: Chart;

  declare config: SciFiWeatherConfig;

  override updated(): void {
    this._renderChart();
  }

  private _renderChart(): void {
    const weatherEntity = this.hass.states[this.config.weather_entity_id];
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
  }

  protected override renderCard(): TemplateResult {
    const weatherEntity = this.hass.states[this.config.weather_entity_id];
    if (!weatherEntity) {
      return html`<ha-card><div class="container">Entité météo non trouvée : ${this.config.weather_entity_id}</div></ha-card>`;
    }

    const condition = weatherEntity.state;
    const icon = WEATHER_ICON_MAP[condition] ?? 'mdi:weather-cloudy';
    const temp = weatherEntity.attributes['temperature'] as number | undefined;
    const humidity = weatherEntity.attributes['humidity'] as number | undefined;
    const wind = weatherEntity.attributes['wind_speed'] as number | undefined;
    const forecast = (weatherEntity.attributes['forecast'] as unknown[]) ?? [];
    const dailyLimit = this.config.weather_daily_forecast_limit ?? 5;
    const dailyForecast = forecast.slice(0, dailyLimit);

    return html`
      <ha-card>
        ${this.config.header_message ? html`<div class="sf-header">${this.config.header_message}</div>` : ''}
        <div class="container">
          <div class="current">
            <sf-icon .icon="${icon}" .connection="${this.hass.connection}"></sf-icon>
            <div>
              <div class="current-temp">${temp ?? '--'}°</div>
              <div class="current-desc">${condition}</div>
            </div>
            <div class="current-details">
              ${humidity != null ? html`<span>💧 ${humidity}%</span>` : ''}
              ${wind != null ? html`<span>💨 ${wind} km/h</span>` : ''}
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
                  ${lo != null ? html`<span class="temp-lo">${lo}°</span>` : ''}
                </div>
              `;
            })}
          </div>
        </div>
      </ha-card>
    `;
  }

  static getConfigElement(): HTMLElement {
    return document.createElement(`${TAG}-editor`);
  }

  static getStubConfig(): SciFiWeatherConfig {
    return { type: `custom:${TAG}`, weather_entity_id: 'weather.forecast_home' };
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [TAG]: SciFiWeatherCard;
  }
}
