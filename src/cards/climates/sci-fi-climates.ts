import { html, nothing, type TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { SciFiBaseCard } from '../../utils/base-card.js';
import { sciFiCommonStyles } from '../../styles/common.js';
import { climateStyles } from './styles.js';
import type { SciFiClimatesConfig } from '../../types/config.js';
import { getClimateEntitiesExcluding, isClimateActive } from '../../selectors/climate.js';
import { getFloors, getAreasByFloor, getEntitiesByAreaAndDomain, getFirstFloor, getFloorById, getAreaById, getAreas } from '../../selectors/house.js';

import '../../components/sf-hexa-row.js';
import '../../components/sf-radiator.js';

const TAG = 'sci-fi-climates';

@customElement(TAG)
export class SciFiClimatesCard extends SciFiBaseCard {
  static override styles = [sciFiCommonStyles, climateStyles];

  declare config: SciFiClimatesConfig;

  @state() private _active_floor_id: string | null = null;
  @state() private _active_area_id: string | null = null;

  protected override renderCard(): TemplateResult {
    if (!this.hass || !this.config) return html``;

    const excluded = this.config.entities_to_exclude ?? [];
    const allClimates = getClimateEntitiesExcluding(this.hass, excluded);
    if (allClimates.length === 0) {
      return html`<div class="empty-message">Aucun radiateur configuré</div>`;
    }
    
    // Initialize active floor if empty
    if (!this._active_floor_id) {
      const allFloors = getFloors(this.hass);
      // Find first floor containing climates
      for (const floor of allFloors) {
        if (this.__hasClimateInFloor(floor.floor_id, excluded)) {
          this._active_floor_id = floor.floor_id;
          break;
        }
      }
      if ((this.config as any)?.filter_by === 'floor') {
        const allFloors = getFloors(this.hass);
        if (allFloors && allFloors.length > 0 && !this._active_floor_id) {
          this._active_floor_id = (allFloors as any)[0].floor_id;
        }
      }
    }

    // Initialize active area if empty or if we switched floor
    if (this._active_floor_id) {
      const areas = getAreasByFloor(this.hass, this._active_floor_id);
      const validAreaIds = areas.map(a => a.area_id);
      
      if (!this._active_area_id || !validAreaIds.includes(this._active_area_id)) {
        this._active_area_id = null;
        for (const area of areas) {
          if (this.__hasClimateInArea(area.area_id, excluded)) {
            this._active_area_id = area.area_id;
            break;
          }
        }
      }
      if ((this.config as any)?.filter_by === 'area') {
        const areas = getAreas(this.hass);
        if (areas && areas.length > 0 && !this._active_area_id) {
          this._active_area_id = (areas as any)[0].area_id;
        }
      }
    }

    return html`
      <div class="container">
        <div class="header">${this.__displayHeader()}</div>
        <div class="floors">${this.__displayFloors(excluded)}</div>
        <div class="floor-content">${this.__displayFloorInfo()}</div>
        <div class="areas">
          <div class="area-list">${this.__displayAreas(excluded)}</div>
          ${this.__displayAreaInfo(excluded)}
        </div>
      </div>
      <sf-toast></sf-toast>
    `;
  }

  private __getAverageTemperature(entities: readonly any[]): number | null {
    if (entities.length === 0) return null;
    let sum = 0;
    let count = 0;
    for (const entry of entities) {
      const state = this.hass.states[entry.entity_id];
      const temp = state?.attributes?.current_temperature;
      if (temp !== undefined && temp !== null) {
        sum += Number(temp);
        count++;
      }
    }
    return count > 0 ? Math.round((sum / count) * 10) / 10 : null;
  }

  private __hasClimateInArea(areaId: string, excluded: readonly string[]): boolean {
    const climates = getEntitiesByAreaAndDomain(this.hass, areaId, 'climate');
    return climates.some(c => !excluded.includes(c.entity_id));
  }

  private __hasClimateInFloor(floorId: string, excluded: readonly string[]): boolean {
    const areas = getAreasByFloor(this.hass, floorId);
    return areas.some(a => this.__hasClimateInArea(a.area_id, excluded));
  }

  private __isFloorActive(floorId: string, excluded: readonly string[]): boolean {
    const areas = getAreasByFloor(this.hass, floorId);
    for (const a of areas) {
      const climates = getEntitiesByAreaAndDomain(this.hass, a.area_id, 'climate');
      for (const c of climates) {
        if (!excluded.includes(c.entity_id) && isClimateActive(this.hass, c.entity_id)) {
          return true;
        }
      }
    }
    return false;
  }

  private __isAreaActive(areaId: string, excluded: readonly string[]): boolean {
    const climates = getEntitiesByAreaAndDomain(this.hass, areaId, 'climate');
    return climates.some(c => !excluded.includes(c.entity_id) && isClimateActive(this.hass, c.entity_id));
  }

  private __displayHeader(): TemplateResult {
    const excluded = this.config.entities_to_exclude ?? [];
    const allClimates = getClimateEntitiesExcluding(this.hass, excluded);
    const avgTemp = this.__getAverageTemperature(allClimates);
    const tempUnit = (this.hass as any).config?.unit_system?.temperature || '°C';
    
    // Fallback season handling
    const seasonState = this.hass.states['sensor.season']?.state;
    let seasonColor = '';
    let seasonIcon = nothing as any;
    
    if (seasonState === 'winter') {
      seasonColor = 'blue';
      seasonIcon = html`<sf-icon icon="mdi:snowflake"></sf-icon>`;
    } else if (seasonState === 'summer') {
      seasonColor = 'orange';
      seasonIcon = html`<sf-icon icon="mdi:white-balance-sunny"></sf-icon>`;
    } else if (seasonState === 'autumn') {
      seasonColor = 'yellow';
      seasonIcon = html`<sf-icon icon="mdi:leaf"></sf-icon>`;
    } else if (seasonState === 'spring') {
      seasonColor = 'green';
      seasonIcon = html`<sf-icon icon="mdi:flower"></sf-icon>`;
    }

    return html`
      <div class="info">
        <sf-icon icon="mdi:home-thermometer-outline"></sf-icon>
        <div class="text">
          ${avgTemp !== null ? `${avgTemp}${tempUnit}` : '--'}
        </div>
      </div>
        <div class="actions">${this.__displayActionHeader(allClimates as any[])}</div>
      <div class="season ${seasonColor}">
        ${seasonIcon}
      </div>
    `;
  }

  private __displayActionHeader(entities: any[]): TemplateResult {
    if (!this.config.header?.display) return html``;
    
    const active = entities.some(c => isClimateActive(this.hass, c.entity_id));
    const h = this.config.header;
    const icon = active ? (h.icon_summer_state || 'mdi:thermometer-chevron-down') : (h.icon_winter_state || 'mdi:thermometer-chevron-up');
    const msg = active ? (h.message_summer_state || 'Summer time') : (h.message_winter_state || 'Winter is coming');

    return html`<div class="action" @click="${() => this.__globalOnOffClimates(entities, active)}">
      <sf-icon .icon=${icon}></sf-icon>
      <div>${msg}</div>
    </div>`;
  }

  private __globalOnOffClimates(allClimates: any[], isCurrentlyActive: boolean): void {
    const action = isCurrentlyActive ? 'off' : 'heat';
    allClimates.forEach(c => {
      void this.hass.callService('climate', 'set_hvac_mode', { entity_id: c.entity_id, hvac_mode: action });
    });
    this.__toast(false, 'Mode appliqué');
  }

  private __displayFloors(excluded: readonly string[]): TemplateResult {
    const floors = getFloors(this.hass).filter(f => this.__hasClimateInFloor(f.floor_id, excluded));
    
    const cells = floors.map(floor => {
      return {
        id: floor.floor_id,
        state: this._active_floor_id === floor.floor_id ? 'on' : 'off',
        selected: this._active_floor_id === floor.floor_id,
        active: this.__isFloorActive(floor.floor_id, excluded) ? 'on' : 'off',
        icon: floor.icon || 'mdi:home-floor-1',
      };
    });
    return html`<sf-hexa-row
      .cells=${cells}
      @cell-selected="${this.__onFloorSelect}"
    ></sf-hexa-row>`;
  }

  private __onFloorSelect(e: CustomEvent): void {
    e.preventDefault();
    e.stopPropagation();
    this._active_floor_id = e.detail.cell.id;
  }

  private __displayFloorInfo(): TemplateResult | typeof nothing {
    if (!this._active_floor_id) return nothing;
    const floor = getFloorById(this.hass, this._active_floor_id);
    if (!floor) return nothing;
    
    const excluded = this.config.entities_to_exclude ?? [];
    const areas = getAreasByFloor(this.hass, this._active_floor_id);
    let allFloorClimates: any[] = [];
    for (const a of areas) {
      const clim = getEntitiesByAreaAndDomain(this.hass, a.area_id, 'climate');
      allFloorClimates = [...allFloorClimates, ...clim.filter(c => !excluded.includes(c.entity_id))];
    }
    
    const avgTemp = this.__getAverageTemperature(allFloorClimates);
    const tempUnit = (this.hass as any).config?.unit_system?.temperature || '°C';
    
    const icon = avgTemp !== null ? 'mdi:thermometer' : 'mdi:thermometer-off';
    const label = avgTemp !== null ? `${avgTemp}${tempUnit}` : 'Off';
    
    return html`
      <div class="title ${avgTemp === null ? 'off' : 'on'}">${floor.name} -</div>
      <div class="temperature ${avgTemp === null ? 'off' : 'on'}">
        <sf-icon .icon=${icon}></sf-icon>
        <div>${label}</div>
      </div>
    `;
  }

  private __displayAreas(excluded: readonly string[]): TemplateResult | typeof nothing {
    if (!this._active_floor_id) return nothing;
    const areas = getAreasByFloor(this.hass, this._active_floor_id).filter(a => this.__hasClimateInArea(a.area_id, excluded));
    
    const cells = areas.map(area => {
      return {
        id: area.area_id,
        state: this._active_area_id === area.area_id ? 'on' : 'off',
        selected: this._active_area_id === area.area_id,
        active: this.__isAreaActive(area.area_id, excluded) ? 'on' : 'off',
        icon: area.icon || 'mdi:sofa',
      };
    });
    return html`<sf-hexa-row
      .cells=${cells}
      @cell-selected="${this.__onAreaSelect}"
    ></sf-hexa-row>`;
  }

  private __onAreaSelect(e: CustomEvent): void {
    e.preventDefault();
    e.stopPropagation();
    this._active_area_id = e.detail.cell.id;
  }

  private __displayAreaInfo(excluded: readonly string[]): TemplateResult | typeof nothing {
    if (!this._active_area_id) return nothing;
    const area = getAreaById(this.hass, this._active_area_id);
    if (!area) return nothing;
    
    const active = this.__isAreaActive(area.area_id, excluded);
    const climates = getEntitiesByAreaAndDomain(this.hass, area.area_id, 'climate').filter(c => !excluded.includes(c.entity_id));
    
    return html`
      <div class="area-content ${active ? 'on' : 'off'}">
        <div class="climates">
          <div class="title">${area.name}</div>
          <div class="slider">
            <div class="number">${climates.map(() => html`<div></div>`)}</div>
            <div class="slides">${this.__displayAreaClimates(climates)}</div>
          </div>
        </div>
      </div>
    `;
  }

  private __displayAreaClimates(climates: any[]): TemplateResult[] {
    const cardStyles = {
      state: {
        icons: this.config.state_icons || {},
        colors: this.config.state_colors || {},
      },
      mode: {
        icons: this.config.mode_icons || {},
        colors: this.config.mode_colors || {},
      },
    };
    
    const tempUnit = (this.hass as any).config?.unit_system?.temperature || '°C';

    return climates.map(
      (climate) => html`<div class="climate">
        <sf-radiator
          id="${climate.entity_id}"
          .climateEntity="${this.hass.states[climate.entity_id]}"
          .unit="${tempUnit}"
          .cardStyles="${cardStyles}"
          @change-preset-mode="${this._changePresetMode}"
          @change-hvac-mode="${this._changeHvacMode}"
          @change-temperature="${this._changeTemperature}"
        ></sf-radiator>
      </div>`
    );
  }

  private _changeTemperature(e: CustomEvent): void {
    void this.hass.callService('climate', 'set_temperature', { entity_id: e.detail.id, temperature: e.detail.temperature })
      .then(() => this.__toast(false, 'Température modifiée'))
      .catch((err) => this.__toast(true, String(err)));
  }

  private _changeHvacMode(e: CustomEvent): void {
    void this.hass.callService('climate', 'set_hvac_mode', { entity_id: e.detail.id, hvac_mode: e.detail.mode })
      .then(() => this.__toast(false, 'Mode HVAC modifié'))
      .catch((err) => this.__toast(true, String(err)));
  }

  private _changePresetMode(e: CustomEvent): void {
    void this.hass.callService('climate', 'set_preset_mode', { entity_id: e.detail.id, preset_mode: e.detail.mode })
      .then(() => this.__toast(false, 'Preset modifié'))
      .catch((err) => this.__toast(true, String(err)));
  }

  private __toast(error: boolean, text: string): void {
    const toast = this.shadowRoot?.querySelector('sf-toast') as any;
    if (toast && toast.addMessage) {
      toast.addMessage(text, error);
    } else {
      console.warn(`Toast (${error ? 'ERROR' : 'OK'}): ${text}`);
    }
  }

  static getConfigElement(): HTMLElement {
    return document.createElement(`${TAG}-editor`);
  }

  static getStubConfig(): SciFiClimatesConfig {
    return {
      type: `custom:${TAG}`,
      header: { display: true },
    };
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [TAG]: SciFiClimatesCard;
  }
}
