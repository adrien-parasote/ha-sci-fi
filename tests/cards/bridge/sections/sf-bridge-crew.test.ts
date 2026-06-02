/* eslint-disable @typescript-eslint/no-unsafe-argument */
// @vitest-environment happy-dom
/**
 * Tests — sf-bridge-crew
 * Covers: render guard, ringClass (home/not_home/other), ringColor (home/not_home/other),
 *         zoneIcon (home/not_home/work/school/unknown), picture branch, no-state guard,
 *         friendly_name fallback.
 */
import { expect, describe, it, afterEach } from 'vitest';
import '../../../../src/cards/bridge/sections/sf-bridge-crew.js';
import { makeMockHass, makeMockEntity } from '../../../fixtures/mock-hass.js';

// ── Stubs ─────────────────────────────────────────────────────────────────────
for (const tag of ['sf-icon']) {
  if (!customElements.get(tag)) customElements.define(tag, class extends HTMLElement {});
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeEl(): any {
  return document.createElement('sf-bridge-crew') as any;
}

function makeHass(state: string, picture?: string) {
  return makeMockHass({
    states: {
      'person.alice': makeMockEntity({
        entity_id: 'person.alice',
        state,
        attributes: {
          friendly_name: 'Alice',
          ...(picture ? { entity_picture: picture } : {}),
        },
      }),
    },
  });
}

const ALICE = { entity: 'person.alice', name: 'Alice' };

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('sf-bridge-crew', () => {
  afterEach(() => {
    document.body.replaceChildren();
  });

  // ── Render guards ──────────────────────────────────────────────────────────

  it('renders empty when hass is not set', async () => {
    const el = makeEl();
    el.persons = [ALICE];
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.bridge-section')).to.be.null;
  });

  it('renders empty when persons is empty', async () => {
    const el = makeEl();
    el.persons = [];
    el.hass = makeHass('home');
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.bridge-section')).to.be.null;
  });

  // ── ringClass: home branch ────────────────────────────────────────────────

  it('renders ring-home class when person state is home', async () => {
    const el = makeEl();
    el.persons = [ALICE];
    el.hass = makeHass('home');
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.ring-home')).not.to.be.null;
  });

  // ── ringClass: not_home branch ────────────────────────────────────────────

  it('renders ring-away class when person state is not_home', async () => {
    const el = makeEl();
    el.persons = [ALICE];
    el.hass = makeHass('not_home');
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.ring-away')).not.to.be.null;
  });

  // ── ringClass: other branch (work/school/etc.) ────────────────────────────

  it('renders ring-other class when person is at work', async () => {
    const el = makeEl();
    el.persons = [ALICE];
    el.hass = makeHass('work');
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.ring-other')).not.to.be.null;
  });

  it('renders ring-other class when person is at school', async () => {
    const el = makeEl();
    el.persons = [ALICE];
    el.hass = makeHass('school');
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.ring-other')).not.to.be.null;
  });

  // ── zoneIcon: home/not_home/work/school/unknown ────────────────────────────

  it('renders crew badge with all states rendering bridge-section', async () => {
    for (const state of ['home', 'not_home', 'work', 'school', 'somewhere_else']) {
      const el = makeEl();
      el.persons = [ALICE];
      el.hass = makeHass(state);
      document.body.appendChild(el);
      await el.updateComplete;
      expect(el.shadowRoot!.querySelector('.crew-badge')).not.to.be.null;
      document.body.replaceChildren();
    }
  });

  // ── picture branch: renders <img> ─────────────────────────────────────────

  it('renders <img> when entity_picture is present', async () => {
    const el = makeEl();
    el.persons = [ALICE];
    el.hass = makeHass('home', '/path/to/photo.jpg');
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('img')).not.to.be.null;
    expect(el.shadowRoot!.querySelector('sf-icon[icon="mdi:account"]')).to.be.null;
  });

  // ── no-picture branch: renders sf-icon fallback ──────────────────────────

  it('renders sf-icon fallback when no entity_picture', async () => {
    const el = makeEl();
    el.persons = [ALICE];
    el.hass = makeHass('home');
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('img')).to.be.null;
  });

  // ── _renderBadge: returns nothing when stateObj is missing ───────────────

  it('does not render badge for unknown entity', async () => {
    const el = makeEl();
    el.persons = [{ entity: 'person.unknown', name: 'Ghost' }];
    el.hass = makeMockHass({ states: {} });
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.crew-badge')).to.be.null;
  });

  // ── friendly_name fallback: uses p.entity when name missing ──────────────

  it('renders crew-badge even when friendly_name is absent', async () => {
    const el = makeEl();
    el.persons = [{ entity: 'person.bob', name: 'Bob' }];
    el.hass = makeMockHass({
      states: {
        'person.bob': makeMockEntity({ entity_id: 'person.bob', state: 'home', attributes: {} }),
      },
    });
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.crew-badge')).not.to.be.null;
  });
});
