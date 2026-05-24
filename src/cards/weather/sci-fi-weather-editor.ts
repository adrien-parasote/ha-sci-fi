/**
 * <sci-fi-weather-editor> — Graphical editor for the sci-fi-weather card.
 *
 * Sections:
 *   1. Weather  — entity picker (required)
 *   2. Technical — forecast day limit slider
 *   3. Chart    — first chart kind dropdown
 *   4. Alert    — alert entity + 4 state inputs
 *
 * Spec 10 § sci-fi-weather-editor
 */

import type { HomeAssistantExt } from '../../types/ha.js';
import { html, type TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { msg } from '@lit/localize';
import { SciFiBaseEditor } from '../../utils/base-editor.js';
import { sciFiEditorCommonStyles } from '../../styles/editor-common.js';
import type { SciFiWeatherConfig } from '../../types/config.js';
import type { InputUpdateDetail } from '../../components/editor-inputs/sf-editor-input.js';
import type { EditorHassEntity } from '../../components/editor-inputs/sf-editor-dropdown-entity.js';

import '../../components/editor-inputs/sf-editor-input.js';
import '../../components/editor-inputs/sf-editor-dropdown-entity.js';
import '../../components/editor-inputs/sf-editor-slider.js';
import '../../components/editor-inputs/sf-editor-dropdown.js';

const CHART_KINDS: Record<string, 'temperature' | 'precipitation' | 'wind'> = {
  Temperature: 'temperature',
  Precipitation: 'precipitation',
  'Wind Speed': 'wind',
};

const CHART_KIND_LABELS: Record<string, string> = {
  temperature: 'Temperature',
  precipitation: 'Precipitation',
  wind: 'Wind Speed',
};

@customElement('sci-fi-weather-editor')
export class SciFiWeatherEditor extends SciFiBaseEditor {
  @state() private _weatherEntities: EditorHassEntity[] = [];

  static override styles = [sciFiEditorCommonStyles];

  override set hass(hass: HomeAssistantExt | undefined) {
    super.hass = hass;
    if (!hass || this._weatherEntities.length > 0) return;
    this._weatherEntities = Object.values(hass.states)
      .filter(e => e.entity_id.startsWith('weather.'))
      .map(e => ({
        entity_id: e.entity_id,
        attributes: {
          friendly_name: e.attributes['friendly_name'] as string | undefined,
          icon: e.attributes['icon'] as string | undefined,
        },
      }));
  }

  private _update(e: CustomEvent<InputUpdateDetail>): void {
    const newConfig = this._getNewConfig<SciFiWeatherConfig>();
    const { id, kind, value } = e.detail;

    if (kind === 'alert') {
      newConfig.alert = { ...(newConfig.alert ?? { entity_id: '' }), [id]: value } as SciFiWeatherConfig['alert'];
    } else if (kind === 'chart') {
      (newConfig as unknown as Record<string, unknown>)['chart_first_kind_to_render'] = CHART_KINDS[value] ?? value;
    } else {
      (newConfig as unknown as Record<string, unknown>)[id] = value;
    }

    this._dispatchChange(newConfig);
  }

  protected override renderEditor(): TemplateResult {
    const config = this.config as SciFiWeatherConfig;
    return html`
      <div class="card" @input-update="${this._update}">
        <div class="container">

          <!-- 1. Weather entity (required) -->
          <section>
            <h1>${this.getSectionTitle('section-title-weather')}</h1>
            <sf-editor-dropdown-entity
              element-id="weather_entity"
              kind="weather_entity"
              label="${this.getLabel('input-weather-entity')}"
              icon="mdi:city"
              .value="${config.weather_entity ?? ''}"
              .items="${this._weatherEntities}"
            ></sf-editor-dropdown-entity>
          </section>

          <!-- 2. Technical — forecast limit -->
          <section>
            <h1>${this.getSectionTitle('section-title-technical')} <span style="font-size:0.75rem">${this.getLabel('text-optional')}</span></h1>
            <sf-editor-slider
              element-id="weather_daily_forecast_limit"
              kind="weather_daily_forecast_limit"
              label="${this.getLabel('input-daily-forecast-number')}"
              icon="mdi:counter"
              min="1"
              max="15"
              step="1"
              .value="${String(config.weather_daily_forecast_limit ?? 5)}"
            ></sf-editor-slider>
          </section>

          <!-- 3. Chart kind -->
          <section>
            <h1>${this.getSectionTitle('section-title-chart')} <span style="font-size:0.75rem">${this.getLabel('text-optional')}</span></h1>
            <sf-editor-dropdown
              element-id="chart_first_kind_to_render"
              kind="chart"
              label="${this.getLabel('input-chart-first-focus-data')}"
              .value="${CHART_KIND_LABELS[config.chart_first_kind_to_render ?? ''] ?? ''}"
              .items="${Object.keys(CHART_KINDS)}"
            ></sf-editor-dropdown>
          </section>

          <!-- 4. Alert entity -->
          <section>
            <h1>${this.getSectionTitle('section-title-alert')} <span style="font-size:0.75rem">${this.getLabel('text-optional')}</span></h1>
            <sf-editor-input
              element-id="entity_id"
              kind="alert"
              label="${this.getLabel('input-weather-alert-entity-id')}"
              icon="mdi:weather-sunny-alert"
              .value="${config.alert?.entity_id ?? ''}"
            ></sf-editor-input>
            <sf-editor-input
              element-id="state_green"
              kind="alert"
              label="${this.getLabel('input-alert-green')}"
              icon="mdi:state-machine"
              .value="${config.alert?.state_green ?? ''}"
            ></sf-editor-input>
            <sf-editor-input
              element-id="state_yellow"
              kind="alert"
              label="${this.getLabel('input-alert-yellow')}"
              icon="mdi:state-machine"
              .value="${config.alert?.state_yellow ?? ''}"
            ></sf-editor-input>
            <sf-editor-input
              element-id="state_orange"
              kind="alert"
              label="${this.getLabel('input-alert-orange')}"
              icon="mdi:state-machine"
              .value="${config.alert?.state_orange ?? ''}"
            ></sf-editor-input>
            <sf-editor-input
              element-id="state_red"
              kind="alert"
              label="${this.getLabel('input-alert-red')}"
              icon="mdi:state-machine"
              .value="${config.alert?.state_red ?? ''}"
            ></sf-editor-input>
          </section>

        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'sci-fi-weather-editor': SciFiWeatherEditor;
  }
}
