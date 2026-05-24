// @vitest-environment happy-dom
import { expect, describe, it, vi, afterEach } from 'vitest';
import '../../../src/components/buttons/sf-button.js';
import type { SciFiButton } from '../../../src/components/buttons/sf-button.js';

describe('sf-button', () => {
  afterEach(() => {
    document.body.replaceChildren();
  });

  it('renders gracefully', async () => {
    const el = document.createElement('sf-button') as SciFiButton;
    el.icon = 'mdi:home';
    document.body.appendChild(el);
    await el.updateComplete;

    const btn = el.shadowRoot!.querySelector('.btn')!;
    expect(btn).to.exist;
    expect(btn.classList.contains('btn-border')).to.be.false;
    expect(btn.classList.contains('btn-rounded')).to.be.false;
  });

  it('handles has-border and rounded attributes', async () => {
    const el = document.createElement('sf-button') as SciFiButton;
    el.hasBorder = true;
    el.rounded = true;
    document.body.appendChild(el);
    await el.updateComplete;

    const btn = el.shadowRoot!.querySelector('.btn')!;
    expect(btn.classList.contains('btn-border')).to.be.true;
    expect(btn.classList.contains('btn-rounded')).to.be.true;
  });

  it('triggers clickBtn and dispatches event when clicked', async () => {
    const el = document.createElement('sf-button') as SciFiButton;
    const handler = vi.fn();
    el.addEventListener('button-click', handler);
    document.body.appendChild(el);
    await el.updateComplete;

    const btn = el.shadowRoot!.querySelector('.btn') as HTMLElement;
    btn.click();

    expect(handler).toHaveBeenCalledOnce();
    expect(handler.mock.calls[0]![0]!.detail.element).to.equal(el);
  });

  it('does not dispatch event when disabled', async () => {
    const el = document.createElement('sf-button') as SciFiButton;
    el.disabled = true;
    const handler = vi.fn();
    el.addEventListener('button-click', handler);
    document.body.appendChild(el);
    await el.updateComplete;

    const btn = el.shadowRoot!.querySelector('.btn') as HTMLElement;
    btn.click();

    expect(handler).not.toHaveBeenCalled();
  });
});
