// @vitest-environment happy-dom
import { expect, describe, it, beforeEach } from 'vitest';
import { CARD_REGISTRATIONS } from '../src/sci-fi.js';

describe('sci-fi entry point', () => {
  it('registers custom cards to window.customCards', () => {
    expect(CARD_REGISTRATIONS).to.exist;
    expect(CARD_REGISTRATIONS.length).to.equal(8);

    expect(window.customCards).to.exist;
    expect(window.customCards!.length).to.be.greaterThan(0);

    const hexaCard = window.customCards!.find(c => c.type === 'custom:sci-fi-hexa-tiles');
    expect(hexaCard).to.exist;
    expect(hexaCard!.name).to.equal('Sci-Fi Hexa Tiles');
  });
});
