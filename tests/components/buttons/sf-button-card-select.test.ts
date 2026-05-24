// @vitest-environment happy-dom
import { expect, describe, it, vi, afterEach } from 'vitest';
import '../../../src/components/buttons/sf-button-card-select.js';
import type { SciFiCardSelectButton } from '../../../src/components/buttons/sf-button-card-select.js';

describe('sf-button-card-select', () => {
  afterEach(() => {
    document.body.replaceChildren();
  });

  it('renders dropdown items and handles selection', async () => {
    const el = document.createElement('sf-button-card-select') as SciFiCardSelectButton;
    el.title = 'Mode';
    el.text = 'Heat';
    el.items = [
      { id: 'heat', text: 'Heating', icon: 'mdi:fire', color: '#ff0000' },
      { id: 'off', text: 'Off', icon: 'mdi:power', color: '#888888' }
    ];

    const handler = vi.fn();
    el.addEventListener('button-select', handler);

    document.body.appendChild(el);
    await el.updateComplete;

    // Click button to toggle dropdown items display list (removes hide class)
    const btn = el.shadowRoot!.querySelector('.btn') as HTMLElement;
    btn.click();

    const dropdown = el.shadowRoot!.querySelector('.items')!;
    expect(dropdown.classList.contains('hide')).to.be.false;

    const itemEls = el.shadowRoot!.querySelectorAll('.items .item');
    expect(itemEls.length).to.equal(2);

    // Select first item
    (itemEls[0] as HTMLElement).click();

    expect(handler).toHaveBeenCalledOnce();
    expect(handler.mock.calls[0]![0]!.detail).to.deep.equal({
      id: 'heat',
      text: 'Heating',
      icon: 'mdi:fire',
      color: '#ff0000'
    });
    expect(dropdown.classList.contains('hide')).to.be.true; // Toggled back to hidden
  });

  it('handles items without color and clickBtn without event', async () => {
    const el = document.createElement('sf-button-card-select') as SciFiCardSelectButton;
    el.title = 'Mode';
    el.text = 'Cool';
    el.items = [
      { id: 'cool', text: 'Cooling', icon: 'mdi:snowflake' }
    ];

    document.body.appendChild(el);
    await el.updateComplete;

    // Call clickBtn without event argument
    el.clickBtn();

    const dropdown = el.shadowRoot!.querySelector('.items')!;
    expect(dropdown.classList.contains('hide')).to.be.false;

    const itemEls = el.shadowRoot!.querySelectorAll('.items .item');
    expect(itemEls.length).to.equal(1);
    
    const itemEl = itemEls[0] as HTMLElement;
    expect(itemEl.style.color).to.equal('var(--sf-text-secondary)');
  });
});

