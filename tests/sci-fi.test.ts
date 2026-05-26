// @vitest-environment happy-dom
import { expect, describe, it, beforeEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { CARD_REGISTRATIONS } from '../src/sci-fi.js';

describe('sci-fi entry point', () => {
  it('TC-114: registers custom cards to window.customCards with documentationURL', () => {
    expect(CARD_REGISTRATIONS).to.exist;
    expect(CARD_REGISTRATIONS.length).to.equal(8);

    expect(window.customCards).to.exist;
    expect(window.customCards!.length).to.be.greaterThan(0);

    const hexaCard = window.customCards!.find(c => c.type === 'custom:sci-fi-hexa-tiles');
    expect(hexaCard).to.exist;
    expect(hexaCard!.name).to.equal('Sci-Fi Hexa Tiles');

    // Assert every card has documentationURL
    for (const card of window.customCards!) {
      expect(card.documentationURL).to.equal('https://github.com/adrien-parasote/ha-sci-fi');
    }
  });

  it('TC-115: hacs.json includes required plugin classification', () => {
    const hacsPath = path.resolve(__dirname, '../hacs.json');
    const hacsContent = fs.readFileSync(hacsPath, 'utf8');
    const hacsJson = JSON.parse(hacsContent);

    expect(hacsJson).to.have.property('type');
    expect(hacsJson.type).to.equal('plugin');
  });
});
