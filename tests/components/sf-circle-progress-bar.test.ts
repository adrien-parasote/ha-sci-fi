// @vitest-environment happy-dom
/**
 * Tests for sf-circle-progress-bar — port from sf-circle_progress_bar.js (main branch)
 * RED phase: written before implementation.
 */
import { expect, describe, it, afterEach } from 'vitest';

afterEach(() => {
  document.body.replaceChildren();
});

describe('sf-circle-progress-bar', () => {
  it('registers as a custom element', async () => {
    await import('../../src/components/sf-circle-progress-bar.js');
    expect(customElements.get('sf-circle-progress-bar')).to.not.be.undefined;
  });

  it('renders a circular SVG with value text', async () => {
    await import('../../src/components/sf-circle-progress-bar.js');
    const el = document.createElement('sf-circle-progress-bar') as any;
    el.val = 75;
    el.text = 'Granulés';
    document.body.appendChild(el);
    await el.updateComplete;
    const shadow = el.shadowRoot!;
    expect(shadow.querySelector('svg.circular-progress')).to.not.be.null;
    expect(shadow.textContent).to.include('75%');
    expect(shadow.textContent).to.include('Granulés');
  });

  it('adds warning class when val/100 < threshold', async () => {
    await import('../../src/components/sf-circle-progress-bar.js');
    const el = document.createElement('sf-circle-progress-bar') as any;
    el.val = 10;
    el.threshold = 0.5; // 10% < 50% → warning
    document.body.appendChild(el);
    await el.updateComplete;
    const svg = el.shadowRoot!.querySelector('svg.circular-progress');
    expect(svg!.classList.contains('warning')).to.be.true;
  });

  it('does NOT add warning class when val/100 >= threshold', async () => {
    await import('../../src/components/sf-circle-progress-bar.js');
    const el = document.createElement('sf-circle-progress-bar') as any;
    el.val = 80;
    el.threshold = 0.5; // 80% >= 50% → no warning
    document.body.appendChild(el);
    await el.updateComplete;
    const svg = el.shadowRoot!.querySelector('svg.circular-progress');
    expect(svg!.classList.contains('warning')).to.be.false;
  });

  it('renders a background circle and a foreground circle', async () => {
    await import('../../src/components/sf-circle-progress-bar.js');
    const el = document.createElement('sf-circle-progress-bar') as any;
    el.val = 50;
    document.body.appendChild(el);
    await el.updateComplete;
    const circles = el.shadowRoot!.querySelectorAll('circle');
    expect(circles.length).to.equal(2); // bg + fg
  });
});
