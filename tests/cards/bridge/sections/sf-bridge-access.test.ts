/* eslint-disable @typescript-eslint/no-unsafe-argument */
// @vitest-environment happy-dom
/**
 * Tests — sf-bridge-access
 * Spec: docs/specs/cards/bridge.md §sf-bridge-access
 *
 * Covers: coverStateInfo (all states), lockClass, render guards,
 *         items rendering, _openCover, _closeCover.
 */
import { expect, describe, it, afterEach, vi } from 'vitest';
import '../../../../src/cards/bridge/sections/sf-bridge-access.js';
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
  return document.createElement('sf-bridge-access') as any;
}

function makeHass(states: Record<string, any> = {}, callService?: any) {
  return makeMockHass({
    states: {
      'cover.garage': makeMockEntity({ entity_id: 'cover.garage', state: 'closed' }),
      'lock.garage': makeMockEntity({ entity_id: 'lock.garage', state: 'locked' }),
      ...states,
    },
    callService,
  });
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('sf-bridge-access', () => {
  afterEach(() => {
    document.body.replaceChildren();
  });

  // ── Render guards ─────────────────────────────────────────────────────────

  it('renders empty when hass is not set', async () => {
    const el = makeEl();
    el.config = { items: [{ entity: 'cover.garage', name: 'Garage' }] };
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

  it('renders .bridge-section with items', async () => {
    const el = makeEl();
    el.config = { items: [{ entity: 'cover.garage', name: 'Garage' }] };
    el.hass = makeHass();
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.bridge-section')).not.to.be.null;
  });

  it('renders one .access-entry per item', async () => {
    const el = makeEl();
    el.config = {
      items: [
        { entity: 'cover.garage', name: 'Garage' },
        { entity: 'cover.portail', name: 'Portail' },
      ],
    };
    el.hass = makeHass({
      'cover.portail': makeMockEntity({ entity_id: 'cover.portail', state: 'open' }),
    });
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.shadowRoot!.querySelectorAll('.access-entry').length).to.equal(2);
  });

  it('uses default icon mdi:garage when item.icon is absent', async () => {
    const el = makeEl();
    el.config = { items: [{ entity: 'cover.garage', name: 'Garage' }] };
    el.hass = makeHass();
    document.body.appendChild(el);
    await el.updateComplete;
    // The access-icon-wrap sf-icon should be mdi:garage
    const icon = el.shadowRoot!.querySelector('.access-icon-wrap sf-icon');
    expect(icon?.getAttribute('icon')).to.equal('mdi:garage');
  });

  it('uses item.icon when provided', async () => {
    const el = makeEl();
    el.config = { items: [{ entity: 'cover.garage', name: 'Garage', icon: 'mdi:door' }] };
    el.hass = makeHass();
    document.body.appendChild(el);
    await el.updateComplete;
    const icon = el.shadowRoot!.querySelector('.access-icon-wrap sf-icon');
    expect(icon?.getAttribute('icon')).to.equal('mdi:door');
  });

  it('uses config.icon for section title', async () => {
    const el = makeEl();
    el.config = { icon: 'mdi:home-lock', items: [{ entity: 'cover.garage', name: 'Garage' }] };
    el.hass = makeHass();
    document.body.appendChild(el);
    await el.updateComplete;
    const titleIcon = el.shadowRoot!.querySelector('.bridge-section-title sf-icon');
    expect(titleIcon?.getAttribute('icon')).to.equal('mdi:home-lock');
  });

  it('defaults section icon to mdi:door-closed', async () => {
    const el = makeEl();
    el.config = { items: [{ entity: 'cover.garage', name: 'Garage' }] };
    el.hass = makeHass();
    document.body.appendChild(el);
    await el.updateComplete;
    const titleIcon = el.shadowRoot!.querySelector('.bridge-section-title sf-icon');
    expect(titleIcon?.getAttribute('icon')).to.equal('mdi:door-closed');
  });

  // ── coverStateInfo: all branches ─────────────────────────────────────────

  it('shows state-closed class when cover is closed', async () => {
    const el = makeEl();
    el.config = { items: [{ entity: 'cover.garage', name: 'Garage' }] };
    el.hass = makeHass({ 'cover.garage': makeMockEntity({ entity_id: 'cover.garage', state: 'closed' }) });
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.access-state-tag.state-closed')).not.to.be.null;
  });

  it('shows state-open class when cover is open', async () => {
    const el = makeEl();
    el.config = { items: [{ entity: 'cover.garage', name: 'Garage' }] };
    el.hass = makeHass({ 'cover.garage': makeMockEntity({ entity_id: 'cover.garage', state: 'open' }) });
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.access-state-tag.state-open')).not.to.be.null;
  });

  it('shows state-moving class when cover is opening', async () => {
    const el = makeEl();
    el.config = { items: [{ entity: 'cover.garage', name: 'Garage' }] };
    el.hass = makeHass({ 'cover.garage': makeMockEntity({ entity_id: 'cover.garage', state: 'opening' }) });
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.access-state-tag.state-moving')).not.to.be.null;
  });

  it('shows state-moving class when cover is closing', async () => {
    const el = makeEl();
    el.config = { items: [{ entity: 'cover.garage', name: 'Garage' }] };
    el.hass = makeHass({ 'cover.garage': makeMockEntity({ entity_id: 'cover.garage', state: 'closing' }) });
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.access-state-tag.state-moving')).not.to.be.null;
  });

  it('shows state-unavailable class for unknown cover state', async () => {
    const el = makeEl();
    el.config = { items: [{ entity: 'cover.garage', name: 'Garage' }] };
    el.hass = makeHass({ 'cover.garage': makeMockEntity({ entity_id: 'cover.garage', state: 'unavailable' }) });
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.access-state-tag.state-unavailable')).not.to.be.null;
  });

  it('shows state-unavailable class when entity is missing from states', async () => {
    const el = makeEl();
    el.config = { items: [{ entity: 'cover.missing', name: 'Missing' }] };
    el.hass = makeHass(); // cover.missing not in states
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.access-state-tag.state-unavailable')).not.to.be.null;
  });

  // ── lockClass: all branches ───────────────────────────────────────────────

  it('renders lock icon mdi:lock when lock state is locked', async () => {
    const el = makeEl();
    el.config = { items: [{ entity: 'cover.garage', name: 'Garage', lock: 'lock.garage' }] };
    el.hass = makeHass({
      'cover.garage': makeMockEntity({ entity_id: 'cover.garage', state: 'closed' }),
      'lock.garage': makeMockEntity({ entity_id: 'lock.garage', state: 'locked' }),
    });
    document.body.appendChild(el);
    await el.updateComplete;
    const lockIcon = el.shadowRoot!.querySelector('sf-icon[icon="mdi:lock"]');
    expect(lockIcon).not.to.be.null;
    expect(lockIcon?.classList.contains('lock-locked')).to.be.true;
  });

  it('renders lock icon mdi:lock-open when lock state is unlocked', async () => {
    const el = makeEl();
    el.config = { items: [{ entity: 'cover.garage', name: 'Garage', lock: 'lock.garage' }] };
    el.hass = makeHass({
      'cover.garage': makeMockEntity({ entity_id: 'cover.garage', state: 'closed' }),
      'lock.garage': makeMockEntity({ entity_id: 'lock.garage', state: 'unlocked' }),
    });
    document.body.appendChild(el);
    await el.updateComplete;
    const lockIcon = el.shadowRoot!.querySelector('sf-icon[icon="mdi:lock-open"]');
    expect(lockIcon).not.to.be.null;
    expect(lockIcon?.classList.contains('lock-unlocked')).to.be.true;
  });

  it('renders lock-unavailable class when lock state is unknown', async () => {
    const el = makeEl();
    el.config = { items: [{ entity: 'cover.garage', name: 'Garage', lock: 'lock.garage' }] };
    el.hass = makeHass({
      'cover.garage': makeMockEntity({ entity_id: 'cover.garage', state: 'closed' }),
      'lock.garage': makeMockEntity({ entity_id: 'lock.garage', state: 'unknown' }),
    });
    document.body.appendChild(el);
    await el.updateComplete;
    const unavailableEl = el.shadowRoot!.querySelector('.lock-unavailable');
    expect(unavailableEl).not.to.be.null;
  });

  it('does NOT render lock icon when entry.lock is absent', async () => {
    const el = makeEl();
    el.config = { items: [{ entity: 'cover.garage', name: 'Garage' }] };
    el.hass = makeHass();
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.lock-locked')).to.be.null;
    expect(el.shadowRoot!.querySelector('.lock-unlocked')).to.be.null;
  });

  // ── Button disabled states ────────────────────────────────────────────────

  it('Open button has disabled class when cover is open', async () => {
    const el = makeEl();
    el.config = { items: [{ entity: 'cover.garage', name: 'Garage' }] };
    el.hass = makeHass({ 'cover.garage': makeMockEntity({ entity_id: 'cover.garage', state: 'open' }) });
    document.body.appendChild(el);
    await el.updateComplete;
    const btns = el.shadowRoot!.querySelectorAll('.access-btn');
    // First button = Open
    expect(btns[0].classList.contains('disabled')).to.be.true;
    // Second button = Close
    expect(btns[1].classList.contains('disabled')).to.be.false;
  });

  it('Close button has disabled class when cover is closed', async () => {
    const el = makeEl();
    el.config = { items: [{ entity: 'cover.garage', name: 'Garage' }] };
    el.hass = makeHass({ 'cover.garage': makeMockEntity({ entity_id: 'cover.garage', state: 'closed' }) });
    document.body.appendChild(el);
    await el.updateComplete;
    const btns = el.shadowRoot!.querySelectorAll('.access-btn');
    expect(btns[1].classList.contains('disabled')).to.be.true;
  });

  // ── _openCover and _closeCover ────────────────────────────────────────────

  it('_openCover calls cover.open_cover service', async () => {
    const callService = vi.fn().mockResolvedValue({});
    const el = makeEl();
    el.config = { items: [{ entity: 'cover.garage', name: 'Garage' }] };
    el.hass = makeHass({ 'cover.garage': makeMockEntity({ entity_id: 'cover.garage', state: 'closed' }) }, callService);
    document.body.appendChild(el);
    await el.updateComplete;

    // Click the Open button (first .access-btn)
    const btns = el.shadowRoot!.querySelectorAll('.access-btn');
    btns[0].dispatchEvent(new MouseEvent('click'));

    expect(callService).toHaveBeenCalledWith('cover', 'open_cover', { entity_id: 'cover.garage' });
  });

  it('_closeCover calls cover.close_cover service', async () => {
    const callService = vi.fn().mockResolvedValue({});
    const el = makeEl();
    el.config = { items: [{ entity: 'cover.garage', name: 'Garage' }] };
    el.hass = makeHass({ 'cover.garage': makeMockEntity({ entity_id: 'cover.garage', state: 'open' }) }, callService);
    document.body.appendChild(el);
    await el.updateComplete;

    const btns = el.shadowRoot!.querySelectorAll('.access-btn');
    btns[1].dispatchEvent(new MouseEvent('click'));

    expect(callService).toHaveBeenCalledWith('cover', 'close_cover', { entity_id: 'cover.garage' });
  });
});
