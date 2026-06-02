// @vitest-environment happy-dom
import { expect, describe, it, afterEach } from 'vitest';

import '../../../src/components/sf-icon/sci-icon.js';
import type { SciIcon } from '../../../src/components/sf-icon/sci-icon.js';

describe('sci-icon', () => {
  afterEach(() => {
    document.body.replaceChildren();
  });

  it('is registered as a custom element under the "sci-icon" tag name', () => {
    expect(customElements.get('sci-icon')).to.be.a('function');
  });

  it('renders nothing when icon is empty', async () => {
    const el = document.createElement('sci-icon') as SciIcon;
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.querySelector('svg')).to.be.null;
  });

  it('renders a custom sci: icon from the bundled icon set', async () => {
    const el = document.createElement('sci-icon') as SciIcon;
    el.icon = 'sci:stove';
    document.body.appendChild(el);
    await new Promise(r => setTimeout(r, 10));
    await el.updateComplete;

    const svgElement = el.querySelector('svg');
    expect(svgElement).to.exist;
    const path = svgElement!.querySelector('path');
    expect(path?.getAttribute('d')).to.include('M 10.272');
  });

  it('renders a custom sf: icon from the bundled icon set', async () => {
    const el = document.createElement('sci-icon') as SciIcon;
    el.icon = 'sf:stove';
    document.body.appendChild(el);
    await new Promise(r => setTimeout(r, 10));
    await el.updateComplete;

    const svgElement = el.querySelector('svg');
    expect(svgElement).to.exist;
    const path = svgElement!.querySelector('path');
    expect(path?.getAttribute('d')).to.include('M 10.272');
  });

  it('renders animated weather icons (TemplateResult) correctly', async () => {
    const el = document.createElement('sci-icon') as SciIcon;
    el.icon = 'sci:clear-day';
    document.body.appendChild(el);
    await new Promise(r => setTimeout(r, 10));
    await el.updateComplete;

    const svgElement = el.querySelector('svg');
    expect(svgElement).to.exist;
    const circle = svgElement!.querySelector('circle');
    expect(circle?.getAttribute('r')).to.equal('84');
  });

  it('renders native ha-icon for mdi: prefix when ha-icon is registered', async () => {
    if (!customElements.get('ha-icon')) {
      customElements.define('ha-icon', class extends HTMLElement {
        static get observedAttributes() { return ['icon']; }
        icon = '';
        attributeChangedCallback(name: string, _oldVal: string, newVal: string) {
          if (name === 'icon') {
            this.icon = newVal;
            this.innerHTML = `<span>${newVal}</span>`;
          }
        }
      });
    }

    const el = document.createElement('sci-icon') as SciIcon;
    el.icon = 'mdi:home';
    document.body.appendChild(el);
    await el.updateComplete;

    const haIcon = el.querySelector('ha-icon');
    expect((haIcon as any).icon).to.equal('mdi:home');
    const styleAttr = haIcon?.getAttribute('style');
    expect(styleAttr).to.include('--mdc-icon-size');
  });

  it('renders fallback icon for unknown namespaces', async () => {
    const originalWarn = console.warn;
    console.warn = () => {};
    try {
      const el = document.createElement('sci-icon') as SciIcon;
      el.icon = 'unknown:something';
      document.body.appendChild(el);
      await new Promise(r => setTimeout(r, 10));
      await el.updateComplete;
      const path = el.querySelector('path');
      expect(path?.getAttribute('d')).to.include('M11.5,2C6.81,2');
    } finally {
      console.warn = originalWarn;
    }
  });

  it('renders mdi: icon without throwing when no connection is provided', async () => {
    // ha-icon may already be registered from a prior test in the same environment.
    // If so, sci-icon delegates to ha-icon (live HA mode) — which is the correct behaviour.
    // If not registered, it falls back to the mdi:help-circle placeholder path.
    // Either outcome is valid — we only verify no unhandled exception is thrown.
    const originalWarn = console.warn;
    console.warn = () => {};
    try {
      const el = document.createElement('sci-icon') as SciIcon;
      el.icon = 'mdi:lightbulb';
      document.body.appendChild(el);
      await new Promise(r => setTimeout(r, 10));
      await el.updateComplete;

      const haIcon = el.querySelector('ha-icon');
      const path = el.querySelector('path');
      // One or the other must be present — no blank render and no thrown exception
      expect(haIcon !== null || path !== null).to.be.true;
    } finally {
      console.warn = originalWarn;
    }
  });

  it('accepts icon as an attribute (HTML usage)', async () => {
    const el = document.createElement('sci-icon') as SciIcon;
    el.setAttribute('icon', 'sci:stove');
    document.body.appendChild(el);
    await new Promise(r => setTimeout(r, 10));
    await el.updateComplete;

    expect(el.icon).to.equal('sci:stove');
    expect(el.querySelector('svg')).to.exist;
  });
});
