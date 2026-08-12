// @vitest-environment happy-dom
import { expect, describe, it, beforeEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { CARD_REGISTRATIONS } from '../src/sci-fi.js';

describe('sci-fi entry point', () => {
  it('TC-114: registers custom cards to window.customCards with documentationURL', () => {
    expect(CARD_REGISTRATIONS).to.exist;
    expect(CARD_REGISTRATIONS.length).to.equal(11);

    expect(window.customCards).to.exist;
    expect(window.customCards!.length).to.be.greaterThan(0);

    const hexaCard = window.customCards!.find(c => c.type === 'sci-fi-hexa-tiles');
    expect(hexaCard).to.exist;
    expect(hexaCard!.name).to.equal('Sci-Fi Hexa Tiles');

    // Assert every card has documentationURL and correct type format
    for (const card of window.customCards!) {
      expect(card.documentationURL).to.equal('https://github.com/adrien-parasote/ha-sci-fi');
      expect(card.type).to.not.contain('custom:');
    }
  });

  it('TC-115, TC-105: hacs.json conforms to HACS 2.0 schema (no type field)', () => {
    const hacsPath = path.resolve(__dirname, '../hacs.json');
    const hacsContent = fs.readFileSync(hacsPath, 'utf8');
    const hacsJson = JSON.parse(hacsContent);

    expect(hacsJson).to.not.have.property('type');
    expect(hacsJson).to.have.property('name');
  });

  it('TC-116: ensures card types do not contain custom: prefix', () => {
    for (const card of window.customCards!) {
      expect(card.type).to.not.contain('custom:');
    }
  });

  it('IT-501, TC-603: every declared card tag is defined in customElements', async () => {
    // The spec row says "8 cartes"; the registry has grown since. Assert the real
    // contract — every entry the entry point declares must resolve to a class —
    // rather than a count that goes stale on the next card.
    await import('../src/sci-fi.js');
    expect(CARD_REGISTRATIONS.length).to.be.greaterThan(0);
    for (const card of CARD_REGISTRATIONS) {
      expect(customElements.get(card.type), `${card.type} must be defined`).to.be.a('function');
    }
  });

  it('TC-602: the entry point registers the custom icon namespace with Home Assistant', async () => {
    await import('../src/components/sf-icon/sf-iconset.js');
    // The spec row says `window.customIcons.sf`; the namespace shipped is `sci`
    // (sf-iconset.ts, and every <ha-icon icon="sci:…"> call site). Pinning what exists.
    const w = window as any;
    expect(w.customIconsets, 'customIconsets must exist').to.exist;
    expect(w.customIconsets['sci'], 'sci: resolver for <ha-icon>').to.be.a('function');
    expect(w.customIcons, 'customIcons must exist').to.exist;
    expect(w.customIcons['sci'].getIcon, 'icon-picker getIcon').to.be.a('function');
    expect(w.customIcons['sci'].getIconList, 'icon-picker getIconList').to.be.a('function');
  });

  it('TC-605: locales are imported statically so the bundle never fetches them at runtime', () => {
    const localization = fs.readFileSync(
      path.resolve(__dirname, '../src/locales/localization.ts'),
      'utf8',
    );
    // A static `import { templates } from './locales/fr.js'` is what puts the translations
    // inside sci-fi.min.js. A dynamic import() or a fetch() here would mean a network round
    // trip from the HA dashboard — the failure IT-601 guards against.
    expect(localization).toMatch(/^import\s+{\s*templates[^}]*}\s+from\s+'\.\/locales\/fr\.js';/m);
    expect(localization).to.not.match(/\bfetch\s*\(/);
    expect(localization).to.not.match(/\bimport\s*\(/);
  });
});
