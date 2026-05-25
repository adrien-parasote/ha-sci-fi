/* eslint-disable @typescript-eslint/no-unsafe-argument */
// @vitest-environment happy-dom
/**
 * Extended tests — sci-fi-vehicles.ts
 * Covers: _prev/_next wrap, _startAc, _stopAc, _onTempChange,
 * single vs multiple vehicle layout, multiple vehicles navigation.
 */
import { expect, describe, it, afterEach, vi } from 'vitest';

import '../../../src/cards/vehicles/sci-fi-vehicles.js';
import { SciFiVehiclesCard } from '../../../src/cards/vehicles/sci-fi-vehicles.js';
import { makeMockHass } from '../../fixtures/mock-hass.js';

const V1 = { id: 'v1', name: 'Tesla' };
const V2 = { id: 'v2', name: 'Zoe' };

function makeHass(callService?: any) {
  return makeMockHass({ callService });
}

async function mountCard(vehicles: any[], hass = makeHass()): Promise<SciFiVehiclesCard> {
  const el = document.createElement('sci-fi-vehicles') as SciFiVehiclesCard;
  (el as any).setConfig({ type: 'custom:sci-fi-vehicles', vehicles });
  el.hass = hass;
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

describe('sci-fi-vehicles extended', () => {
  afterEach(() => {
    document.body.replaceChildren();
    vi.resetAllMocks();
  });

  // ── Header hide for single vehicle ─────────────────────────────────────────

  it('hides prev/next buttons for a single vehicle', async () => {
    const el = await mountCard([V1]);
    const footer = el.shadowRoot!.querySelector('.header');
    const hiddenDivs = footer!.querySelectorAll('.hide');
    expect(hiddenDivs.length).toBeGreaterThanOrEqual(2);
  });

  // ── prev/next navigation ────────────────────────────────────────────────────

  it('_next goes to vehicle 2', async () => {
    const el = await mountCard([V1, V2]);
    const nextBtn = el.shadowRoot!.querySelector('.header sf-button[icon="mdi:chevron-right"]') as HTMLElement;
    nextBtn.dispatchEvent(new CustomEvent('button-click', { bubbles: true, composed: true }));
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.header .title')!.textContent?.trim()).toBe('Zoe');
  });

  it('_next wraps from last to first', async () => {
    const el = await mountCard([V1, V2]);
    const nextBtn = el.shadowRoot!.querySelector('.header sf-button[icon="mdi:chevron-right"]') as HTMLElement;
    // Go to V2
    nextBtn.dispatchEvent(new CustomEvent('button-click', { bubbles: true, composed: true }));
    await el.updateComplete;
    // Wrap back to V1
    nextBtn.dispatchEvent(new CustomEvent('button-click', { bubbles: true, composed: true }));
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.header .title')!.textContent?.trim()).toBe('Tesla');
  });

  it('_prev wraps from first to last', async () => {
    const el = await mountCard([V1, V2]);
    const prevBtn = el.shadowRoot!.querySelector('.header sf-button[icon="mdi:chevron-left"]') as HTMLElement;
    prevBtn.dispatchEvent(new CustomEvent('button-click', { bubbles: true, composed: true }));
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.header .title')!.textContent?.trim()).toBe('Zoe');
  });

  it('_prev from vehicle 2 goes to vehicle 1', async () => {
    const el = await mountCard([V1, V2]);
    // Go to V2 first
    const nextBtn = el.shadowRoot!.querySelector('.header sf-button[icon="mdi:chevron-right"]') as HTMLElement;
    nextBtn.dispatchEvent(new CustomEvent('button-click', { bubbles: true, composed: true }));
    await el.updateComplete;
    // Now prev
    const prevBtn = el.shadowRoot!.querySelector('.header sf-button[icon="mdi:chevron-left"]') as HTMLElement;
    prevBtn.dispatchEvent(new CustomEvent('button-click', { bubbles: true, composed: true }));
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.header .title')!.textContent?.trim()).toBe('Tesla');
  });

  // ── _startAc ───────────────────────────────────────────────────────────────

  it('_startAc calls callService with renault_ac service', async () => {
    const mockCallService = vi.fn(() => Promise.resolve({} as any));
    const el = await mountCard([V1], makeHass(mockCallService));

    const startBtn = el.shadowRoot!.querySelector('sf-button-card[icon="mdi:play"]')!;
    startBtn.dispatchEvent(new CustomEvent('button-click', { bubbles: true, composed: true }));
    await new Promise(r => setTimeout(r, 0));

    expect(mockCallService).toHaveBeenCalledWith(
      'renault',
      'ac_start',
      { vehicle: 'v1', temperature: 18 } // default temp idx 2 → 16+2=18
    );
  });

  it('_startAc sets loading and resets after resolve', async () => {
    const mockCallService = vi.fn(() => Promise.resolve({} as any));
    const el = await mountCard([V1], makeHass(mockCallService));

    const startBtn = el.shadowRoot!.querySelector('sf-button-card[icon="mdi:play"]')!;
    startBtn.dispatchEvent(new CustomEvent('button-click', { bubbles: true, composed: true }));

    // loading is set synchronously
    expect((el as any)._is_ac_loading).toBe(true);

    await new Promise(r => setTimeout(r, 0));
    // loading cleared after promise resolves
    expect((el as any)._is_ac_loading).toBe(false);
  });

  // ── _stopAc ────────────────────────────────────────────────────────────────

  it('_stopAc calls callService with stop_vehicle_ac service', async () => {
    const mockCallService = vi.fn(() => Promise.resolve({} as any));
    const el = await mountCard([V1], makeHass(mockCallService));

    const stopBtn = el.shadowRoot!.querySelector('sf-button-card[icon="mdi:stop"]')!;
    stopBtn.dispatchEvent(new CustomEvent('button-click', { bubbles: true, composed: true }));
    await new Promise(r => setTimeout(r, 0));

    expect(mockCallService).toHaveBeenCalledWith(
      'renault',
      'ac_cancel',
      { vehicle: 'v1' }
    );
  });

  it('_stopAc handles errors and resets loading', async () => {
    const mockCallService = vi.fn(() => Promise.reject(new Error('service unavailable')));
    const el = await mountCard([V1], makeHass(mockCallService));

    const stopBtn = el.shadowRoot!.querySelector('sf-button-card[icon="mdi:stop"]')!;
    stopBtn.dispatchEvent(new CustomEvent('button-click', { bubbles: true, composed: true }));
    await new Promise(r => setTimeout(r, 0));

    expect((el as any)._is_ac_loading).toBe(false);
  });

  // ── _onTempChange ──────────────────────────────────────────────────────────

  it('_onTempChange updates selected temp id', async () => {
    const el = await mountCard([V1]);
    const wheel = el.shadowRoot!.querySelector('sf-wheel')!;
    wheel.dispatchEvent(new CustomEvent('wheel-change', {
      bubbles: true,
      composed: true,
      detail: { id: '5' },
    }));
    await el.updateComplete;
    expect((el as any)._selected_temp_id).toBe(5);
  });

  it('temp change affects AC call temperature', async () => {
    const mockCallService = vi.fn(() => Promise.resolve({} as any));
    const el = await mountCard([V1], makeHass(mockCallService));

    // Change temp to idx 4 → temperature 20°C
    const wheel = el.shadowRoot!.querySelector('sf-wheel')!;
    wheel.dispatchEvent(new CustomEvent('wheel-change', {
      bubbles: true,
      composed: true,
      detail: { id: '4' },
    }));
    await el.updateComplete;

    const startBtn = el.shadowRoot!.querySelector('sf-button-card[icon="mdi:play"]')!;
    startBtn.dispatchEvent(new CustomEvent('button-click', { bubbles: true, composed: true }));
    await new Promise(r => setTimeout(r, 0));

    expect(mockCallService).toHaveBeenCalledWith('renault', 'ac_start', { vehicle: 'v1', temperature: 20 });
  });

  // ── tempItems length ───────────────────────────────────────────────────────

  it('renders sf-wheel with 10 temperature items', async () => {
    const el = await mountCard([V1]);
    const wheel = el.shadowRoot!.querySelector('sf-wheel') as any;
    expect(wheel?.items?.length).toBe(10);
  });
});
