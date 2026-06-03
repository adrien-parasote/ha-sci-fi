 
// @vitest-environment happy-dom
/**
 * Tests — sf-bridge-automations
 * Spec: docs/specs/cards/bridge.md §sf-bridge-automations
 *
 * Covers: autoDefaultIcon, resolveToggleService, render guards, _renderToggle,
 *         _renderSlider, _toggle, _onSliderInput (debounce + localValues),
 *         _setSliderValue, disconnectedCallback.
 */
import { expect, describe, it, afterEach, vi } from 'vitest';
import '../../../../src/cards/bridge/sections/sf-bridge-automations.js';
import { makeMockHass, makeMockEntity } from '../../../fixtures/mock-hass.js';

// ── Stubs ─────────────────────────────────────────────────────────────────────
const STUB_ELEMENTS = ['sf-icon'];
for (const tag of STUB_ELEMENTS) {
  if (!customElements.get(tag)) customElements.define(tag, class extends HTMLElement {});
}

vi.mock('../../../../src/cards/bridge/bridge-toast.js', () => ({
  bridgeToast: vi.fn(),
}));

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeEl(): any {
  return document.createElement('sf-bridge-automations') as any;
}

function makeHass(extra: Record<string, any> = {}, callService?: any) {
  return makeMockHass({
    states: {
      'automation.nuit': makeMockEntity({ entity_id: 'automation.nuit', state: 'off' }),
      'switch.pump': makeMockEntity({ entity_id: 'switch.pump', state: 'on' }),
      'input_boolean.mode': makeMockEntity({ entity_id: 'input_boolean.mode', state: 'on' }),
      'input_number.tempo': makeMockEntity({ entity_id: 'input_number.tempo', state: '15' }),
      ...extra,
    },
    callService,
  });
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('sf-bridge-automations', () => {
  afterEach(() => {
    document.body.replaceChildren();
  });

  // ── Render guards ─────────────────────────────────────────────────────────

  it('renders empty when hass is not set', async () => {
    const el = makeEl();
    el.config = { items: [{ entity: 'automation.nuit', name: 'Nuit', type: 'toggle' as const }] };
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.bridge-section')).to.be.null;
  });

  it('renders empty when config.items is empty', async () => {
    const el = makeEl();
    el.config = { items: [] };
    el.hass = makeHass();
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.bridge-section')).to.be.null;
  });

  // ── Section renders ───────────────────────────────────────────────────────

  it('renders .bridge-section with toggle item', async () => {
    const el = makeEl();
    el.config = { items: [{ entity: 'automation.nuit', name: 'Nuit', type: 'toggle' as const }] };
    el.hass = makeHass();
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.bridge-section')).not.to.be.null;
  });

  it('renders .auto-row for toggle items', async () => {
    const el = makeEl();
    el.config = { items: [{ entity: 'automation.nuit', name: 'Nuit', type: 'toggle' as const }] };
    el.hass = makeHass();
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.auto-row')).not.to.be.null;
  });

  it('renders .slider-row for slider items', async () => {
    const el = makeEl();
    el.config = { items: [{ entity: 'input_number.tempo', name: 'Tempo', type: 'slider' as const, min: 0, max: 60, step: 5 }] };
    el.hass = makeHass();
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.slider-row')).not.to.be.null;
  });

  it('uses config.icon for section title when provided', async () => {
    const el = makeEl();
    el.config = { icon: 'mdi:robot-excited', items: [{ entity: 'automation.nuit', name: 'Nuit', type: 'toggle' as const }] };
    el.hass = makeHass();
    document.body.appendChild(el);
    await el.updateComplete;
    const titleIcon = el.shadowRoot!.querySelector('.bridge-section-title sf-icon');
    expect(titleIcon?.getAttribute('icon')).to.equal('mdi:robot-excited');
  });

  it('defaults section icon to mdi:robot', async () => {
    const el = makeEl();
    el.config = { items: [{ entity: 'automation.nuit', name: 'Nuit', type: 'toggle' as const }] };
    el.hass = makeHass();
    document.body.appendChild(el);
    await el.updateComplete;
    const titleIcon = el.shadowRoot!.querySelector('.bridge-section-title sf-icon');
    expect(titleIcon?.getAttribute('icon')).to.equal('mdi:robot');
  });

  // ── autoDefaultIcon per domain ────────────────────────────────────────────

  it('uses mdi:robot icon for automation domain toggle', async () => {
    const el = makeEl();
    el.config = { items: [{ entity: 'automation.nuit', name: 'Nuit', type: 'toggle' as const }] };
    el.hass = makeHass();
    document.body.appendChild(el);
    await el.updateComplete;
    const rowIcon = el.shadowRoot!.querySelector('.auto-row sf-icon');
    expect(rowIcon?.getAttribute('icon')).to.equal('mdi:robot');
  });

  it('uses mdi:power-plug icon for switch domain toggle', async () => {
    const el = makeEl();
    el.config = { items: [{ entity: 'switch.pump', name: 'Pump', type: 'toggle' as const }] };
    el.hass = makeHass();
    document.body.appendChild(el);
    await el.updateComplete;
    const rowIcon = el.shadowRoot!.querySelector('.auto-row sf-icon');
    expect(rowIcon?.getAttribute('icon')).to.equal('mdi:power-plug');
  });

  it('uses mdi:toggle-switch icon for input_boolean domain', async () => {
    const el = makeEl();
    el.config = { items: [{ entity: 'input_boolean.mode', name: 'Mode', type: 'toggle' as const }] };
    el.hass = makeHass();
    document.body.appendChild(el);
    await el.updateComplete;
    const rowIcon = el.shadowRoot!.querySelector('.auto-row sf-icon');
    expect(rowIcon?.getAttribute('icon')).to.equal('mdi:toggle-switch');
  });

  it('uses mdi:tune icon for input_number domain', async () => {
    const el = makeEl();
    el.config = { items: [{ entity: 'input_number.tempo', name: 'Tempo', type: 'slider' as const }] };
    el.hass = makeHass();
    document.body.appendChild(el);
    await el.updateComplete;
    const rowIcon = el.shadowRoot!.querySelector('.slider-row sf-icon');
    expect(rowIcon?.getAttribute('icon')).to.equal('mdi:tune');
  });

  it('falls back to mdi:robot for unknown domain', async () => {
    const el = makeEl();
    el.config = { items: [{ entity: 'unknown_domain.x', name: 'X', type: 'toggle' as const }] };
    el.hass = makeHass({ 'unknown_domain.x': makeMockEntity({ entity_id: 'unknown_domain.x', state: 'off' }) });
    document.body.appendChild(el);
    await el.updateComplete;
    const rowIcon = el.shadowRoot!.querySelector('.auto-row sf-icon');
    expect(rowIcon?.getAttribute('icon')).to.equal('mdi:robot');
  });

  it('uses item.icon when provided for toggle', async () => {
    const el = makeEl();
    el.config = { items: [{ entity: 'automation.nuit', name: 'Nuit', type: 'toggle' as const, icon: 'mdi:moon' }] };
    el.hass = makeHass();
    document.body.appendChild(el);
    await el.updateComplete;
    const rowIcon = el.shadowRoot!.querySelector('.auto-row sf-icon');
    expect(rowIcon?.getAttribute('icon')).to.equal('mdi:moon');
  });

  // ── Toggle state class ────────────────────────────────────────────────────

  it('renders toggle-on class when state is "on"', async () => {
    const el = makeEl();
    el.config = { items: [{ entity: 'switch.pump', name: 'Pump', type: 'toggle' as const }] };
    el.hass = makeHass();
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.auto-name.toggle-on')).not.to.be.null;
  });

  it('renders toggle-on class when state is "enabled"', async () => {
    const el = makeEl();
    el.config = { items: [{ entity: 'automation.nuit', name: 'Nuit', type: 'toggle' as const }] };
    el.hass = makeHass({ 'automation.nuit': makeMockEntity({ entity_id: 'automation.nuit', state: 'enabled' }) });
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.auto-name.toggle-on')).not.to.be.null;
  });

  it('renders toggle-off class when state is "off"', async () => {
    const el = makeEl();
    el.config = { items: [{ entity: 'automation.nuit', name: 'Nuit', type: 'toggle' as const }] };
    el.hass = makeHass();
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.auto-name.toggle-off')).not.to.be.null;
  });

  // ── _toggle (resolveToggleService) ───────────────────────────────────────

  it('_toggle calls turn_off when state is on', async () => {
    const callService = vi.fn().mockResolvedValue({});
    const el = makeEl();
    el.config = { items: [{ entity: 'switch.pump', name: 'Pump', type: 'toggle' as const }] };
    el.hass = makeHass({}, callService);
    document.body.appendChild(el);
    await el.updateComplete;

    const btn = el.shadowRoot!.querySelector('.sf-toggle') as HTMLButtonElement;
    btn.click();

    expect(callService).toHaveBeenCalledWith('switch', 'turn_off', { entity_id: 'switch.pump' });
  });

  it('_toggle calls turn_on when state is off', async () => {
    const callService = vi.fn().mockResolvedValue({});
    const el = makeEl();
    el.config = { items: [{ entity: 'automation.nuit', name: 'Nuit', type: 'toggle' as const }] };
    el.hass = makeHass({}, callService);
    document.body.appendChild(el);
    await el.updateComplete;

    el.shadowRoot!.querySelector('.sf-toggle')!.dispatchEvent(new MouseEvent('click'));

    expect(callService).toHaveBeenCalledWith('automation', 'turn_on', { entity_id: 'automation.nuit' });
  });

  // ── Slider: localValues + debounce ────────────────────────────────────────

  it('slider input updates localValues immediately', async () => {
    vi.useFakeTimers();
    const callService = vi.fn().mockResolvedValue({});
    const el = makeEl();
    el.config = { items: [{ entity: 'input_number.tempo', name: 'Tempo', type: 'slider' as const, min: 0, max: 60 }] };
    el.hass = makeHass({}, callService);
    document.body.appendChild(el);
    await el.updateComplete;

    const input = el.shadowRoot!.querySelector('input[type="range"]') as HTMLInputElement;
    input.value = '30';
    input.dispatchEvent(new Event('input'));

    // localValues should update immediately (before debounce fires)
    expect(el._localValues.get('input_number.tempo')).to.equal(30);
    vi.useRealTimers();
  });

  it('slider callService fires after 300ms debounce', async () => {
    vi.useFakeTimers();
    const callService = vi.fn().mockResolvedValue({});
    const el = makeEl();
    el.config = { items: [{ entity: 'input_number.tempo', name: 'Tempo', type: 'slider' as const, min: 0, max: 60 }] };
    el.hass = makeHass({}, callService);
    document.body.appendChild(el);
    await el.updateComplete;

    const input = el.shadowRoot!.querySelector('input[type="range"]') as HTMLInputElement;
    input.value = '25';
    input.dispatchEvent(new Event('input'));

    expect(callService).not.toHaveBeenCalled();

    vi.advanceTimersByTime(300);

    expect(callService).toHaveBeenCalledWith('input_number', 'set_value', { entity_id: 'input_number.tempo', value: 25 });
    vi.useRealTimers();
  });

  it('slider debounce resets on rapid input', async () => {
    vi.useFakeTimers();
    const callService = vi.fn().mockResolvedValue({});
    const el = makeEl();
    el.config = { items: [{ entity: 'input_number.tempo', name: 'Tempo', type: 'slider' as const, min: 0, max: 60 }] };
    el.hass = makeHass({}, callService);
    document.body.appendChild(el);
    await el.updateComplete;

    const input = el.shadowRoot!.querySelector('input[type="range"]') as HTMLInputElement;

    input.value = '10';
    input.dispatchEvent(new Event('input'));
    vi.advanceTimersByTime(100);

    input.value = '40';
    input.dispatchEvent(new Event('input'));
    vi.advanceTimersByTime(300);

    // Should only call once with final value
    expect(callService).toHaveBeenCalledTimes(1);
    expect(callService).toHaveBeenCalledWith('input_number', 'set_value', { entity_id: 'input_number.tempo', value: 40 });
    vi.useRealTimers();
  });

  it('slider NaN value is ignored — guard prevents service call', async () => {
    vi.useFakeTimers();
    const callService = vi.fn().mockResolvedValue({});
    const el = makeEl();
    el.config = { items: [{ entity: 'input_number.tempo', name: 'Tempo', type: 'slider' as const }] };
    el.hass = makeHass({}, callService);
    document.body.appendChild(el);
    await el.updateComplete;

    // Dispatch a synthetic Event with a NaN-valued target by invoking private method directly
    // (input[type=range] in happy-dom clamps to valid numbers, so we can't feed NaN via DOM)
    const entry = el.config.items[0];
    const fakeEvent = { target: { value: 'NaN' } } as unknown as Event;
    (el as any)._onSliderInput(entry, fakeEvent);

    vi.advanceTimersByTime(400);
    expect(callService).not.toHaveBeenCalled();
    vi.useRealTimers();
  });

  // ── Slider with hass state fallback ──────────────────────────────────────

  it('slider falls back to entry.min when state is NaN', async () => {
    const el = makeEl();
    el.config = { items: [{ entity: 'input_number.tempo', name: 'Tempo', type: 'slider' as const, min: 5, max: 60 }] };
    el.hass = makeHass({ 'input_number.tempo': makeMockEntity({ entity_id: 'input_number.tempo', state: 'unavailable' }) });
    document.body.appendChild(el);
    await el.updateComplete;
    const valueSpan = el.shadowRoot!.querySelector('.slider-value');
    expect(valueSpan?.textContent).to.equal('5');
  });

  it('slider shows unit when entry.unit is provided', async () => {
    const el = makeEl();
    el.config = { items: [{ entity: 'input_number.tempo', name: 'Tempo', type: 'slider' as const, min: 0, max: 60, unit: 'min' }] };
    el.hass = makeHass();
    document.body.appendChild(el);
    await el.updateComplete;
    const valueSpan = el.shadowRoot!.querySelector('.slider-value');
    expect(valueSpan?.textContent).to.include('min');
  });

  // ── disconnectedCallback ─────────────────────────────────────────────────

  it('clears debounce timers on disconnectedCallback', async () => {
    vi.useFakeTimers();
    const callService = vi.fn().mockResolvedValue({});
    const el = makeEl();
    el.config = { items: [{ entity: 'input_number.tempo', name: 'Tempo', type: 'slider' as const }] };
    el.hass = makeHass({}, callService);
    document.body.appendChild(el);
    await el.updateComplete;

    const input = el.shadowRoot!.querySelector('input[type="range"]') as HTMLInputElement;
    input.value = '20';
    input.dispatchEvent(new Event('input'));

    // Remove from DOM triggers disconnectedCallback
    document.body.removeChild(el);

    vi.advanceTimersByTime(400);
    // callService should NOT have been called because timer was cleared
    expect(callService).not.toHaveBeenCalled();
    vi.useRealTimers();
  });
});
