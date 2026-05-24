// @vitest-environment happy-dom
import { expect, describe, it, beforeEach, afterEach, } from 'vitest';

import '../../../src/components/sf-icon/sf-icon.js';
import type { SfIcon } from '../../../src/components/sf-icon/sf-icon.js';

describe('sf-icon', () => {
  afterEach(() => {
    document.body.replaceChildren();
  });

  it('renders a fallback icon for unknown namespaces', async () => {
    const originalWarn = console.warn;
    console.warn = () => {};
    try {
      const el = document.createElement('sf-icon') as SfIcon;
      el.icon = 'unknown:icon';
      document.body.appendChild(el);
      await el.updateComplete;
      const path = el.querySelector('path')!;
      expect(path.getAttribute('d')).to.include('M11.5,2C6.81,2');
    } finally {
      console.warn = originalWarn;
    }
  });

  it('renders custom icon if present in window.customIcons', async () => {
    window.customIcons = {
      sf: { custom: 'M10 10 H 90 V 90 H 10 L 10 10' },
    };
    const el = document.createElement('sf-icon') as SfIcon;
    el.icon = 'sf:custom';
    document.body.appendChild(el);
    await new Promise(r => setTimeout(r, 50));
    const path = el.querySelector('path')!;
    expect(path.getAttribute('d')).to.equal('M10 10 H 90 V 90 H 10 L 10 10');
  });

  it('renders nothing when icon is empty', async () => {
    const el = document.createElement('sf-icon') as SfIcon;
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.querySelector('svg')).to.be.null;
  });

  it('renders fallback when icon format is invalid (no prefix/name)', async () => {
    const originalWarn = console.warn;
    console.warn = () => {};
    try {
      const el = document.createElement('sf-icon') as SfIcon;
      el.icon = 'invalidformat';
      document.body.appendChild(el);
      await new Promise(r => setTimeout(r, 10));
      await el.updateComplete;
      const path = el.querySelector('path')!;
      expect(path.getAttribute('d')).to.include('M11.5,2C6.81,2');
    } finally {
      console.warn = originalWarn;
    }
  });

  it('renders fallback when mdi is requested but no connection is provided', async () => {
    const originalWarn = console.warn;
    console.warn = () => {};
    try {
      const el = document.createElement('sf-icon') as SfIcon;
      el.icon = 'mdi:home';
      document.body.appendChild(el);
      await new Promise(r => setTimeout(r, 10));
      await el.updateComplete;
      const path = el.querySelector('path')!;
      expect(path.getAttribute('d')).to.include('M11.5,2C6.81,2');
    } finally {
      console.warn = originalWarn;
    }
  });

  it('renders loading state then actual icon via HA connection', async () => {
    const el = document.createElement('sf-icon') as SfIcon;
    
    // Create a connection that resolves slowly so we can see the loading state
    let resolveMessage: any;
    const promise = new Promise(r => { resolveMessage = r; });
    
    el.connection = {
      sendMessagePromise: () => promise
    } as unknown as any;
    
    el.icon = 'mdi:lightbulb';
    document.body.appendChild(el);
    
    // Wait for lit to start update cycle
    await new Promise(r => setTimeout(r, 0));
    
    // Should be in loading state
    const svgLoading = el.querySelector('svg');
    expect(svgLoading?.classList.contains('sf-icon--loading')).to.be.true;

    // Resolve the HA connection
    resolveMessage({ resources: { 'lightbulb': 'M-lightbulb-path' } });
    
    // Wait for the async _resolveIcon to finish
    await new Promise(r => setTimeout(r, 10));
    await el.updateComplete;

    const path = el.querySelector('path')!;
    expect(path.getAttribute('d')).to.equal('M-lightbulb-path');
  });

  it('renders fallback when HA connection returns ICON_NOT_FOUND', async () => {
    const el = document.createElement('sf-icon') as SfIcon;
    el.connection = {
      sendMessagePromise: () => Promise.resolve({ resources: {} }) // Not found
    } as unknown as any;
    
    el.icon = 'mdi:missing';
    document.body.appendChild(el);
    
    await new Promise(r => setTimeout(r, 10));
    await el.updateComplete;

    const path = el.querySelector('path')!;
    expect(path.getAttribute('d')).to.include('M11.5,2C6.81,2');
  });

  it('renders native ha-icon if ha-icon is registered as a custom element', async () => {
    // Define ha-icon custom element for this test if not already defined
    if (!customElements.get('ha-icon')) {
      customElements.define('ha-icon', class extends HTMLElement {
        static get observedAttributes() { return ['icon']; }
        icon = '';
        attributeChangedCallback(name: string, oldVal: string, newVal: string) {
          if (name === 'icon') {
            this.icon = newVal;
            this.innerHTML = `<span class="mock-ha-icon-content">${newVal}</span>`;
          }
        }
      });
    }

    const el = document.createElement('sf-icon') as SfIcon;
    el.icon = 'mdi:weather-sunny';
    document.body.appendChild(el);
    await el.updateComplete;

    const haIcon = el.querySelector('ha-icon');
    expect((haIcon as any).icon).to.equal('mdi:weather-sunny');
    
    // Verify CSS styles mapping
    const styleAttr = haIcon?.getAttribute('style');
    expect(styleAttr).to.include('--mdc-icon-size');
    expect(styleAttr).to.include('width');
    expect(styleAttr).to.include('height');
    expect(styleAttr).to.include('color');
  });
});
