 
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
import * as fs from 'node:fs';
import * as path from 'node:path';

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

  // ── Zone → couleur mapping : les SIX lignes ───────────────────────────────

  // One row per line of the mapping table (docs/specs/cards/bridge.md). Six
  // rows, six cases: the previous pass honoured three of them and asserted the
  // CLASS only, which is identical for work, school and any other zone — so a
  // person at work rendered cyan and nothing could tell.
  const ZONE_MAPPING: ReadonlyArray<{
    state: string;
    ring: string;
    token: string;
    notToken: string;
  }> = [
    { state: 'home',        ring: 'ring-home',    token: '--sf-accent-on',     notToken: '--sf-primary' },
    { state: 'work',        ring: 'ring-other',   token: '--sf-warning',       notToken: '--sf-primary' },
    { state: 'school',      ring: 'ring-other',   token: '--sf-warning',       notToken: '--sf-primary' },
    { state: 'not_home',    ring: 'ring-away',    token: '--sf-accent-off',    notToken: '--sf-text-disabled' },
    { state: 'gym',         ring: 'ring-other',   token: '--sf-primary',       notToken: '--sf-warning' },
    { state: 'unavailable', ring: 'ring-unknown', token: '--sf-text-disabled', notToken: '--sf-primary' },
    { state: 'unknown',     ring: 'ring-unknown', token: '--sf-text-disabled', notToken: '--sf-primary' },
  ];

  for (const row of ZONE_MAPPING) {
    it(`TC-BRIDGE-U-11/U-12: state '${row.state}' → ${row.ring} and ${row.token}`, async () => {
      const el = makeEl();
      el.persons = [ALICE];
      el.hass = makeHass(row.state);
      document.body.appendChild(el);
      await el.updateComplete;

      const wrap = el.shadowRoot!.querySelector(`.${row.ring}`) as HTMLElement;
      expect(wrap, `${row.state} should carry .${row.ring}`).not.to.be.null;
      const style = wrap.getAttribute('style') ?? '';
      expect(style, `${row.state} should paint ${row.token}`).to.contain(row.token);
      expect(style, `${row.state} must not paint ${row.notToken}`).to.not.contain(row.notToken);
    });
  }

  it('TC-BRIDGE-U-12: every ring-* rule consumes --ring-color', () => {
    // Without this, the inline property above is only tied to the painted halo
    // by the CSS snapshot: reverting the rule AND the snapshot together put the
    // original defect back, green. This assertion fails on that revert.
    const sheet = fs.readFileSync(
      path.resolve(__dirname, '../../../../src/cards/bridge/styles.ts'),
      'utf8',
    );
    for (const ring of ['ring-home', 'ring-away', 'ring-other', 'ring-unknown']) {
      expect(sheet, `${ring} must read --ring-color`).toMatch(
        new RegExp(`\\.crew-avatar-wrap\\.${ring}\\s*{[^}]*var\\(--ring-color`),
      );
    }
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
