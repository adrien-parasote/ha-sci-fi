// @vitest-environment happy-dom
import { expect, describe, it, vi, afterEach } from 'vitest';
import '../../src/components/sf-wheel.js';
import type { SciFiWheel } from '../../src/components/sf-wheel.js';

describe('sf-wheel', () => {
  afterEach(() => {
    document.body.replaceChildren();
  });

  it('renders gracefully with default properties', async () => {
    const el = document.createElement('sf-wheel') as SciFiWheel;
    document.body.appendChild(el);
    await el.updateComplete;

    expect(el.shadowRoot!.querySelector('.container')).to.exist;
    expect(el.shadowRoot!.querySelector('.text')).to.be.null;
  });

  it('renders text when provided', async () => {
    const el = document.createElement('sf-wheel') as SciFiWheel;
    el.text = 'Set Value';
    document.body.appendChild(el);
    await el.updateComplete;

    const textEl = el.shadowRoot!.querySelector('.text')!;
    expect(textEl).to.exist;
    expect(textEl.textContent).to.equal('Set Value');
  });

  it('displays active items based on selectedId', async () => {
    const el = document.createElement('sf-wheel') as SciFiWheel;
    el.items = [
      { id: '1', text: 'Item 1', icon: 'mdi:numeric-1' },
      { id: '2', text: 'Item 2', icon: 'mdi:numeric-2' }
    ];
    el.selectedId = '1';
    document.body.appendChild(el);
    await el.updateComplete;

    const items = el.shadowRoot!.querySelectorAll('.slider-item');
    expect(items.length).to.equal(2);
    expect(items[0]!.classList.contains('show')).to.be.true;
    expect(items[0]!.classList.contains('hide')).to.be.false;
    expect(items[1]!.classList.contains('show')).to.be.false;
    expect(items[1]!.classList.contains('hide')).to.be.true;
  });

  it('navigates up and down and dispatches wheel-change', async () => {
    const el = document.createElement('sf-wheel') as SciFiWheel;
    el.items = [
      { id: '1', text: 'Item 1' },
      { id: '2', text: 'Item 2' },
      { id: '3', text: 'Item 3' }
    ];
    el.selectedId = '2';

    const handler = vi.fn();
    el.addEventListener('wheel-change', handler);

    document.body.appendChild(el);
    await el.updateComplete;

    // Up button click (moves to next index: 2 + 1 = 3 -> index 2, id '3')
    const upBtn = el.shadowRoot!.querySelector('.up') as HTMLElement;
    upBtn.dispatchEvent(new CustomEvent('button-click'));
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0]![0]!.detail).to.deep.equal({ id: '3', text: 'Item 3' });

    // Down button click (moves to previous index: 2 - 1 = 1 -> index 0, id '1')
    const downBtn = el.shadowRoot!.querySelector('.down') as HTMLElement;
    downBtn.dispatchEvent(new CustomEvent('button-click'));
    expect(handler).toHaveBeenCalledTimes(2);
    expect(handler.mock.calls[1]![0]!.detail).to.deep.equal({ id: '1', text: 'Item 1' });
  });

  it('triggers wheel-click when slider is clicked', async () => {
    const el = document.createElement('sf-wheel') as SciFiWheel;
    el.items = [
      { id: '1', text: 'Item 1' },
      { id: '2', text: 'Item 2' }
    ];
    el.selectedId = '1';

    const handler = vi.fn();
    el.addEventListener('wheel-click', handler);

    document.body.appendChild(el);
    await el.updateComplete;

    const slider = el.shadowRoot!.querySelector('.slider') as HTMLElement;
    slider.click();

    expect(handler).toHaveBeenCalledOnce();
    expect(handler.mock.calls[0]![0]!.detail).to.deep.equal({ id: '1', text: 'Item 1' });
  });

  it('respects inline property and disabled state', async () => {
    const el = document.createElement('sf-wheel') as SciFiWheel;
    el.items = [
      { id: '1', text: 'Item 1' }
    ];
    el.selectedId = '1';
    el.inLine = true;
    el.disabled = true;

    document.body.appendChild(el);
    await el.updateComplete;

    expect(el.shadowRoot!.querySelector('.core')!.classList.contains('inline')).to.be.true;
    expect(el.shadowRoot!.querySelector('.up')!.hasAttribute('disabled')).to.be.true;
    expect(el.shadowRoot!.querySelector('.down')!.hasAttribute('disabled')).to.be.true;
  });

  it('handles empty items gracefully during interaction', async () => {
    const el = document.createElement('sf-wheel') as SciFiWheel;
    el.items = [];
    el.selectedId = '1';

    const handler = vi.fn();
    el.addEventListener('wheel-change', handler);
    el.addEventListener('wheel-click', handler);

    document.body.appendChild(el);
    await el.updateComplete;

    // Click up button
    const upBtn = el.shadowRoot!.querySelector('.up') as HTMLElement;
    upBtn.dispatchEvent(new CustomEvent('button-click'));
    
    // Click slider
    const slider = el.shadowRoot!.querySelector('.slider') as HTMLElement;
    slider.click();

    expect(handler).not.toHaveBeenCalled();
  });

  it('wraps around index correctly when navigating up and down', async () => {
    const el = document.createElement('sf-wheel') as SciFiWheel;
    el.items = [
      { id: '1', text: 'Item 1' },
      { id: '2', text: 'Item 2' },
      { id: '3', text: 'Item 3' }
    ];

    const handler = vi.fn();
    el.addEventListener('wheel-change', handler);

    document.body.appendChild(el);
    await el.updateComplete;

    // Up wrap-around: start at index 2 (last item) and go up -> should go to index 0 (id '1')
    el.selectedId = '3';
    await el.updateComplete;
    const upBtn = el.shadowRoot!.querySelector('.up') as HTMLElement;
    upBtn.dispatchEvent(new CustomEvent('button-click'));
    expect(handler.mock.calls[0]![0]!.detail).to.deep.equal({ id: '1', text: 'Item 1' });

    // Down wrap-around: start at index 0 (first item) and go down -> should go to index 2 (id '3')
    el.selectedId = '1';
    await el.updateComplete;
    const downBtn = el.shadowRoot!.querySelector('.down') as HTMLElement;
    downBtn.dispatchEvent(new CustomEvent('button-click'));
    expect(handler.mock.calls[1]![0]!.detail).to.deep.equal({ id: '3', text: 'Item 3' });
  });

  it('handles invalid selectedId and falls back appropriately', async () => {
    const el = document.createElement('sf-wheel') as SciFiWheel;
    el.items = [
      { id: '1', text: 'Item 1' },
      { id: '2', text: 'Item 2' }
    ];
    el.selectedId = 'non-existent';

    const handler = vi.fn();
    el.addEventListener('wheel-change', handler);

    document.body.appendChild(el);
    await el.updateComplete;

    // Up click when index is -1.
    // Index -1 + 1 = 0. Should navigate to index 0 (id '1')
    const upBtn = el.shadowRoot!.querySelector('.up') as HTMLElement;
    upBtn.dispatchEvent(new CustomEvent('button-click'));
    expect(handler.mock.calls[0]![0]!.detail).to.deep.equal({ id: '1', text: 'Item 1' });

    // Down click when index is -1.
    // Index -1 - 1 = -2 < 0. Should wrap to items.length - 1 = 1 (id '2')
    const downBtn = el.shadowRoot!.querySelector('.down') as HTMLElement;
    downBtn.dispatchEvent(new CustomEvent('button-click'));
    expect(handler.mock.calls[1]![0]!.detail).to.deep.equal({ id: '2', text: 'Item 2' });
  });
});

