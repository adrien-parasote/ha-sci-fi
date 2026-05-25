// @vitest-environment happy-dom
/**
 * Tests for sf-stove-image — port from sf-stove.js (main branch)
 * RED phase: written before implementation.
 */
import { expect, describe, it, afterEach } from 'vitest';

afterEach(() => {
  document.body.replaceChildren();
});

describe('sf-stove-image', () => {
  it('registers as a custom element', async () => {
    await import('../../src/components/sf-stove-image.js');
    expect(customElements.get('sf-stove-image')).to.not.be.undefined;
  });

  it('renders an SVG element', async () => {
    await import('../../src/components/sf-stove-image.js');
    const el = document.createElement('sf-stove-image') as any;
    el.state = 'off';
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('svg')).to.not.be.null;
  });

  it('reflects state attribute — off', async () => {
    await import('../../src/components/sf-stove-image.js');
    const el = document.createElement('sf-stove-image') as any;
    el.state = 'off';
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.state).to.equal('off');
  });

  it('reflects state attribute — heat', async () => {
    await import('../../src/components/sf-stove-image.js');
    const el = document.createElement('sf-stove-image') as any;
    el.state = 'heat';
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.state).to.equal('heat');
  });

  it('reflects state attribute — cool', async () => {
    await import('../../src/components/sf-stove-image.js');
    const el = document.createElement('sf-stove-image') as any;
    el.state = 'cool';
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.state).to.equal('cool');
  });
});
