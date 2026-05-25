// @vitest-environment happy-dom
import { expect, describe, it, afterEach } from 'vitest';
import '../../src/components/sf-landspeeder.js';
import { SciFiLandspeeder } from '../../src/components/sf-landspeeder.js';

describe('sf-landspeeder', () => {
  afterEach(() => {
    document.body.replaceChildren();
  });

  it('is registered in customElements', () => {
    expect(customElements.get('sf-landspeeder')).to.not.be.undefined;
  });

  it('can be mounted and renders content', async () => {
    const el = document.createElement('sf-landspeeder') as SciFiLandspeeder;
    // Set minimal mock vehicle config
    el.vehicle = { id: 'v1', name: 'Speeder 1' } as any;
    document.body.appendChild(el);
    await el.updateComplete;

    expect(el.shadowRoot).not.to.be.null;
  });
});
