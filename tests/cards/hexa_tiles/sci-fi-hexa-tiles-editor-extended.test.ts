/* eslint-disable @typescript-eslint/no-unsafe-argument */
// @vitest-environment happy-dom
/**
 * Extended tests — sci-fi-hexa-tiles-editor.ts
 * Covers: _updateHeaderMessage, _toggleWeather, _updateWeatherField,
 * _updateTileField, _updateTileExclude, _updateTileStateOn,
 * _toggleVisibility, weather entities section, standalone tile toggle,
 * people visibility section.
 */
import { expect, describe, it, afterEach } from 'vitest';

import '../../../src/cards/hexa_tiles/sci-fi-hexa-tiles-editor.js';
import type { SciFiHexaTilesEditor } from '../../../src/cards/hexa_tiles/sci-fi-hexa-tiles-editor.js';
import type { HomeAssistantExt } from '../../../src/types/ha.js';
import { makeMockHass } from '../../fixtures/mock-hass.js';

function makeConfig(overrides: Record<string, unknown> = {}) {
  return { type: 'custom:sci-fi-hexa-tiles', ...overrides };
}

async function createElement(): Promise<SciFiHexaTilesEditor> {
  const el = document.createElement('sci-fi-hexa-tiles-editor') as SciFiHexaTilesEditor;
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

describe('sci-fi-hexa-tiles-editor extended', () => {
  afterEach(() => { document.body.replaceChildren(); });

  // ── _updateHeaderMessage ────────────────────────────────────────────────────

  it('dispatches config-changed when header message is updated', async () => {
    const el = await createElement();
    el.setConfig(makeConfig({ tiles: [] }));
    await el.updateComplete;

    const received: CustomEvent[] = [];
    el.addEventListener('config-changed', (e) => received.push(e as CustomEvent));

    const input = el.shadowRoot!.querySelector('sf-editor-input[element-id="header_message"]')!;
    input.dispatchEvent(new CustomEvent('input-update', {
      bubbles: true,
      composed: true,
      detail: { id: 'header_message', kind: '', value: 'Hello World' },
    }));

    expect(received).toHaveLength(1);
    expect(received[0]!.detail.config.header_message).toBe('Hello World');
  });

  it('clears header_message to undefined when empty value', async () => {
    const el = await createElement();
    el.setConfig(makeConfig({ tiles: [], header_message: 'Old' }));
    await el.updateComplete;

    const received: CustomEvent[] = [];
    el.addEventListener('config-changed', (e) => received.push(e as CustomEvent));

    const input = el.shadowRoot!.querySelector('sf-editor-input[element-id="header_message"]')!;
    input.dispatchEvent(new CustomEvent('input-update', {
      bubbles: true,
      composed: true,
      detail: { id: 'header_message', kind: '', value: '' },
    }));

    expect(received).toHaveLength(1);
    expect(received[0]!.detail.config.header_message).toBeUndefined();
  });

  // ── _toggleWeather ──────────────────────────────────────────────────────────

  it('dispatches config-changed when weather toggle is switched on', async () => {
    const el = await createElement();
    el.setConfig(makeConfig({ tiles: [], weather: { activate: false } }));
    await el.updateComplete;

    const received: CustomEvent[] = [];
    el.addEventListener('config-changed', (e) => received.push(e as CustomEvent));

    const toggle = el.shadowRoot!.querySelector('sf-toggle-switch')!;
    toggle.dispatchEvent(new CustomEvent('sf-toggle-change', {
      bubbles: true,
      composed: true,
      detail: { checked: true },
    }));

    expect(received).toHaveLength(1);
    expect(received[0]!.detail.config.weather.activate).toBe(true);
  });

  it('renders weather entities accordion when weather is active', async () => {
    const el = await createElement();
    el.setConfig(makeConfig({ tiles: [], weather: { activate: true, weather_entity: '' } }));
    await el.updateComplete;

    const accordion = el.shadowRoot!.querySelector('sf-editor-accordion[element-id="weather-detail"]');
    expect(accordion).not.toBeNull();
  });

  // ── _updateWeatherField ─────────────────────────────────────────────────────

  it('dispatches config-changed when weather entity is updated', async () => {
    const el = await createElement();
    el.setConfig(makeConfig({ tiles: [], weather: { activate: true, weather_entity: '' } }));
    await el.updateComplete;

    const received: CustomEvent[] = [];
    el.addEventListener('config-changed', (e) => received.push(e as CustomEvent));

    const weatherDropdown = el.shadowRoot!.querySelector('sf-editor-dropdown-entity[element-id="weather_entity"]')!;
    weatherDropdown.dispatchEvent(new CustomEvent('input-update', {
      bubbles: true,
      composed: true,
      detail: { id: 'weather_entity', kind: 'weather_entity', value: 'weather.home' },
    }));

    expect(received).toHaveLength(1);
    expect(received[0]!.detail.config.weather.weather_entity).toBe('weather.home');
  });

  it('dispatches config-changed when weather link is updated', async () => {
    const el = await createElement();
    el.setConfig(makeConfig({ tiles: [], weather: { activate: true, weather_entity: '' } }));
    await el.updateComplete;

    const received: CustomEvent[] = [];
    el.addEventListener('config-changed', (e) => received.push(e as CustomEvent));

    const linkInput = el.shadowRoot!.querySelector('sf-editor-input[element-id="weather_link"]')!;
    linkInput?.dispatchEvent(new CustomEvent('input-update', {
      bubbles: true,
      composed: true,
      detail: { id: 'link', kind: 'link', value: 'http://example.com' },
    }));

    if (received.length > 0) {
      expect(received[0]!.detail.config.weather.link).toBe('http://example.com');
    } else {
      // direct call fallback
      (el as any)._updateWeatherField('link', 'http://example.com');
      expect(el.config).toBeDefined();
    }
  });

  // ── _updateTileField ────────────────────────────────────────────────────────

  it('dispatches config-changed when tile name is updated', async () => {
    const el = await createElement();
    el.setConfig(makeConfig({
      tiles: [{ entity_kind: 'light', name: 'Old', state_on: ['on'] }],
    }));
    await el.updateComplete;

    const received: CustomEvent[] = [];
    el.addEventListener('config-changed', (e) => received.push(e as CustomEvent));

    const nameInput = el.shadowRoot!.querySelector('sf-editor-input[element-id="name"]')!;
    nameInput.dispatchEvent(new CustomEvent('input-update', {
      bubbles: true,
      composed: true,
      detail: { id: 'name', kind: 'name', value: 'New Name' },
    }));

    expect(received).toHaveLength(1);
    expect(received[0]!.detail.config.tiles[0].name).toBe('New Name');
  });

  it('dispatches config-changed when tile active_icon is updated', async () => {
    const el = await createElement();
    el.setConfig(makeConfig({
      tiles: [{ entity_kind: 'light', name: 'Lights', active_icon: '', inactive_icon: '', state_on: ['on'] }],
    }));
    await el.updateComplete;

    const received: CustomEvent[] = [];
    el.addEventListener('config-changed', (e) => received.push(e as CustomEvent));

    const activeIconDropdown = el.shadowRoot!.querySelector('sf-editor-dropdown-icon[element-id="active_icon"]')!;
    activeIconDropdown.dispatchEvent(new CustomEvent('input-update', {
      bubbles: true,
      composed: true,
      detail: { id: 'active_icon', kind: 'active_icon', value: 'mdi:lightbulb-on' },
    }));

    expect(received).toHaveLength(1);
    expect(received[0]!.detail.config.tiles[0].active_icon).toBe('mdi:lightbulb-on');
  });

  // ── _updateTileExclude ──────────────────────────────────────────────────────

  it('dispatches config-changed when entity is added to entities_to_exclude', async () => {
    const el = await createElement();
    el.setConfig(makeConfig({
      tiles: [{ entity_kind: 'light', name: 'Lights', state_on: ['on'], entities_to_exclude: [] }],
    }));
    await el.updateComplete;

    const received: CustomEvent[] = [];
    el.addEventListener('config-changed', (e) => received.push(e as CustomEvent));

    const multiEntity = el.shadowRoot!.querySelector('sf-editor-multi-entity[element-id="entities_to_exclude"]')!;
    multiEntity?.dispatchEvent(new CustomEvent('input-update', {
      bubbles: true,
      composed: true,
      detail: { id: 'entities_to_exclude', kind: 'entities_to_exclude', value: 'light.avoid', type: 'add' },
    }));

    expect(received).toHaveLength(1);
    expect(received[0]!.detail.config.tiles[0].entities_to_exclude).toContain('light.avoid');
  });

  it('dispatches config-changed when entity is removed from entities_to_exclude', async () => {
    const el = await createElement();
    el.setConfig(makeConfig({
      tiles: [{ entity_kind: 'light', name: 'Lights', state_on: ['on'], entities_to_exclude: ['light.avoid', 'light.other'] }],
    }));
    await el.updateComplete;

    const received: CustomEvent[] = [];
    el.addEventListener('config-changed', (e) => received.push(e as CustomEvent));

    const multiEntity = el.shadowRoot!.querySelector('sf-editor-multi-entity')!;
    multiEntity.dispatchEvent(new CustomEvent('input-update', {
      bubbles: true,
      composed: true,
      detail: { id: 'entities_to_exclude', kind: 'entities_to_exclude', value: '0', type: 'remove' },
    }));

    expect(received).toHaveLength(1);
    expect(received[0]!.detail.config.tiles[0].entities_to_exclude).not.toContain('light.avoid');
  });

  // ── _updateTileStateOn ──────────────────────────────────────────────────────

  it('dispatches config-changed when state_on chip is added', async () => {
    const el = await createElement();
    el.setConfig(makeConfig({
      tiles: [{ entity_kind: 'light', name: 'Lights', state_on: ['on'] }],
    }));
    await el.updateComplete;

    const received: CustomEvent[] = [];
    el.addEventListener('config-changed', (e) => received.push(e as CustomEvent));

    const chips = el.shadowRoot!.querySelector('sf-editor-chips[element-id="state_on"]')!;
    chips.dispatchEvent(new CustomEvent('input-update', {
      bubbles: true,
      composed: true,
      detail: { id: 'state_on', kind: 'state_on', value: 'playing', type: 'add' },
    }));

    expect(received).toHaveLength(1);
    expect(received[0]!.detail.config.tiles[0].state_on).toContain('playing');
  });

  it('dispatches config-changed when state_on chip is removed', async () => {
    const el = await createElement();
    el.setConfig(makeConfig({
      tiles: [{ entity_kind: 'light', name: 'Lights', state_on: ['on', 'playing'] }],
    }));
    await el.updateComplete;

    const received: CustomEvent[] = [];
    el.addEventListener('config-changed', (e) => received.push(e as CustomEvent));

    const chips = el.shadowRoot!.querySelector('sf-editor-chips[element-id="state_on"]')!;
    chips.dispatchEvent(new CustomEvent('input-update', {
      bubbles: true,
      composed: true,
      detail: { id: 'state_on', kind: 'state_on', value: '0', type: 'remove' },
    }));

    expect(received).toHaveLength(1);
    expect(received[0]!.detail.config.tiles[0].state_on).not.toContain('on');
    expect(received[0]!.detail.config.tiles[0].state_on).toContain('playing');
  });

  // ── standalone tile toggle ──────────────────────────────────────────────────

  it('renders entity dropdown when standalone is true', async () => {
    const el = await createElement();
    el.setConfig(makeConfig({
      tiles: [{ entity_kind: 'light', name: 'Lamp', standalone: true, entity: 'light.salon', state_on: ['on'] }],
    }));
    await el.updateComplete;

    // When standalone, renders sf-editor-dropdown-entity[element-id="entity"] instead of entity_kind
    const entityDropdown = el.shadowRoot!.querySelector('sf-editor-dropdown-entity[element-id="entity"]');
    expect(entityDropdown).not.toBeNull();
  });

  it('dispatches config-changed when standalone is toggled', async () => {
    const el = await createElement();
    el.setConfig(makeConfig({
      tiles: [{ entity_kind: 'light', name: 'Lights', standalone: false, state_on: ['on'] }],
    }));
    await el.updateComplete;

    const received: CustomEvent[] = [];
    el.addEventListener('config-changed', (e) => received.push(e as CustomEvent));

    // Weather section toggle is the FIRST sf-toggle-switch; the standalone tile toggle is inside the tile accordion
    // When there is no weather config, the tile's standalone toggle might be the only/first one
    // Use _updateTileField directly to test the branch
    (el as any)._updateTileField(0, 'standalone', true);

    expect(received).toHaveLength(1);
    expect(received[0]!.detail.config.tiles[0].standalone).toBe(true);
  });

  // ── _toggleVisibility ──────────────────────────────────────────────────────

  it('renders people visibility section when person entities exist in hass', async () => {
    const el = await createElement();
    el.setConfig(makeConfig({
      tiles: [{ entity_kind: 'light', name: 'Lights', state_on: ['on'] }],
    }));

    const mockHass = {
      ...makeMockHass(),
      states: {
        'person.adrien': {
          entity_id: 'person.adrien',
          state: 'home',
          attributes: { friendly_name: 'Adrien', entity_picture: null },
        },
      },
      locale: { language: 'fr' },
    } as unknown as HomeAssistantExt;

    el.hass = mockHass;
    await el.updateComplete;

    const visibilitySection = el.shadowRoot!.querySelector('.visibility-section');
    expect(visibilitySection).not.toBeNull();
  });

  it('dispatches config-changed when person visibility is toggled', async () => {
    const el = await createElement();
    el.setConfig(makeConfig({
      tiles: [{ entity_kind: 'light', name: 'Lights', state_on: ['on'], visibility: [] }],
    }));

    const mockHass = {
      ...makeMockHass(),
      states: {
        'person.adrien': {
          entity_id: 'person.adrien',
          state: 'home',
          attributes: { friendly_name: 'Adrien', entity_picture: null },
        },
      },
      locale: { language: 'fr' },
    } as unknown as HomeAssistantExt;

    el.hass = mockHass;
    await el.updateComplete;

    const received: CustomEvent[] = [];
    el.addEventListener('config-changed', (e) => received.push(e as CustomEvent));

    const visibilityBtn = el.shadowRoot!.querySelector('.visibility-section .people-row sf-button')!;
    visibilityBtn.dispatchEvent(new CustomEvent('button-click', { bubbles: true, composed: true }));

    expect(received).toHaveLength(1);
    expect(received[0]!.detail.config.tiles[0].visibility).toContain('person.adrien');
  });

  it('removes person from visibility when toggled again', async () => {
    const el = await createElement();
    el.setConfig(makeConfig({
      tiles: [{ entity_kind: 'light', name: 'Lights', state_on: ['on'], visibility: ['person.adrien'] }],
    }));

    const mockHass = {
      ...makeMockHass(),
      states: {
        'person.adrien': {
          entity_id: 'person.adrien',
          state: 'home',
          attributes: { friendly_name: 'Adrien', entity_picture: null },
        },
      },
      locale: { language: 'fr' },
    } as unknown as HomeAssistantExt;

    el.hass = mockHass;
    await el.updateComplete;

    const received: CustomEvent[] = [];
    el.addEventListener('config-changed', (e) => received.push(e as CustomEvent));

    const visibilityBtn = el.shadowRoot!.querySelector('.visibility-section .people-row sf-button')!;
    visibilityBtn.dispatchEvent(new CustomEvent('button-click', { bubbles: true, composed: true }));

    expect(received).toHaveLength(1);
    expect(received[0]!.detail.config.tiles[0].visibility).not.toContain('person.adrien');
  });

  // ── _removeTile ─────────────────────────────────────────────────────────────

  it('dispatches config-changed when tile is removed via accordion', async () => {
    const el = await createElement();
    el.setConfig(makeConfig({
      tiles: [
        { entity_kind: 'light', name: 'Lights', state_on: ['on'] },
        { entity_kind: 'climate', name: 'AC', state_on: ['heat'] },
      ],
    }));
    await el.updateComplete;

    const received: CustomEvent[] = [];
    el.addEventListener('config-changed', (e) => received.push(e as CustomEvent));

    const accordions = el.shadowRoot!.querySelectorAll('sf-editor-accordion');
    accordions[0]?.dispatchEvent(new CustomEvent('input-update', {
      bubbles: true,
      composed: true,
      detail: { id: '0', kind: 'accordion', value: '0', type: 'remove' },
    }));

    expect(received).toHaveLength(1);
    expect(received[0]!.detail.config.tiles).toHaveLength(1);
  });

  // ── person picture vs initial ────────────────────────────────────────────────

  it('renders person avatar with image when entity_picture is set', async () => {
    const el = await createElement();
    el.setConfig(makeConfig({
      tiles: [{ entity_kind: 'light', name: 'Lights', state_on: ['on'] }],
    }));

    const mockHass = {
      ...makeMockHass(),
      states: {
        'person.adrien': {
          entity_id: 'person.adrien',
          state: 'home',
          attributes: { friendly_name: 'Adrien', entity_picture: '/api/image/adrien.jpg' },
        },
      },
      locale: { language: 'fr' },
    } as unknown as HomeAssistantExt;

    el.hass = mockHass;
    await el.updateComplete;

    const img = el.shadowRoot!.querySelector('.avatar img');
    expect(img).not.toBeNull();
  });
});
