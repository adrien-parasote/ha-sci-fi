// @vitest-environment happy-dom
/**
 * Tests for sf-stack-bar — port from sf-stack_bar.js (main branch)
 * RED phase: written before implementation.
 */
import { expect, describe, it, afterEach } from 'vitest';

afterEach(() => {
  document.body.replaceChildren();
});

describe('sf-stack-bar', () => {
  it('registers as a custom element', async () => {
    await import('../../src/components/sf-stack-bar.js');
    expect(customElements.get('sf-stack-bar')).to.not.be.undefined;
  });

  it('renders an SVG with horizontal bar rows', async () => {
    await import('../../src/components/sf-stack-bar.js');
    const el = document.createElement('sf-stack-bar') as any;
    el.val = 5;
    el.max = 10;
    el.text = 'Stock';
    document.body.appendChild(el);
    await el.updateComplete;
    const shadow = el.shadowRoot!;
    expect(shadow.querySelector('svg')).to.not.be.null;
    // 20 bar rows
    const paths = shadow.querySelectorAll('path.path');
    expect(paths.length).to.equal(20);
    expect(shadow.textContent).to.include('Stock');
    expect(shadow.textContent).to.include('5');
  });

  it('adds warning class on text when val/max <= threshold', async () => {
    await import('../../src/components/sf-stack-bar.js');
    const el = document.createElement('sf-stack-bar') as any;
    el.val = 1;
    el.max = 20;
    el.threshold = 0.5; // 1/20 = 5% <= 50% → warning
    document.body.appendChild(el);
    await el.updateComplete;
    const textEl = el.shadowRoot!.querySelector('.text');
    expect(textEl!.classList.contains('warning')).to.be.true;
  });

  it('does NOT add warning class when val/max > threshold', async () => {
    await import('../../src/components/sf-stack-bar.js');
    const el = document.createElement('sf-stack-bar') as any;
    el.val = 15;
    el.max = 20;
    el.threshold = 0.5; // 15/20 = 75% > 50% → no warning
    document.body.appendChild(el);
    await el.updateComplete;
    const textEl = el.shadowRoot!.querySelector('.text');
    expect(textEl!.classList.contains('warning')).to.be.false;
  });
});
