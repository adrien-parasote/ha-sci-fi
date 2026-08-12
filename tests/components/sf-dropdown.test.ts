// @vitest-environment happy-dom
/**
 * Tests — sf-dropdown
 *
 * Written during the P14 pass (bead ha-sci-fi-9xf): the component shipped with no
 * test at all, which is what the TDD gate was flagging.
 */
import { expect, describe, it, afterEach, vi } from 'vitest';

import '../../src/components/sf-dropdown.js';
import type { SciFiDropdown, DropdownItem } from '../../src/components/sf-dropdown.js';

const ITEMS: DropdownItem[] = [
  { id: 'a', text: 'Alpha', icon: 'mdi:alpha' },
  { id: 'b', text: 'Beta', color: '#ff0000' },
];

async function createElement(props: Partial<SciFiDropdown> = {}): Promise<SciFiDropdown> {
  const el = document.createElement('sf-dropdown') as SciFiDropdown;
  Object.assign(el, { items: ITEMS, text: 'Pick one', ...props });
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

afterEach(() => {
  document.body.replaceChildren();
});

describe('sf-dropdown', () => {
  it('renders the trigger label and one row per item', async () => {
    const el = await createElement();
    expect(el.shadowRoot!.querySelector('.trigger span')!.textContent).toBe('Pick one');
    expect(el.shadowRoot!.querySelectorAll('.item').length).toBe(2);
  });

  it('renders the trigger icon only when one is provided', async () => {
    const withIcon = await createElement({ icon: 'mdi:menu-down' });
    expect(withIcon.shadowRoot!.querySelector('.trigger sf-icon')).not.toBeNull();

    document.body.replaceChildren();
    const without = await createElement();
    expect(without.shadowRoot!.querySelector('.trigger sf-icon')).toBeNull();
  });

  it('applies item.color to the row and falls back to inherit', async () => {
    const el = await createElement();
    const rows = el.shadowRoot!.querySelectorAll('.item');
    expect(rows[1]!.getAttribute('style')).toContain('#ff0000');
    expect(rows[0]!.getAttribute('style')).toContain('inherit');
  });

  it('the menu is closed until the trigger is clicked', async () => {
    const el = await createElement();
    const menu = el.shadowRoot!.querySelector('.menu')!;
    expect(menu.classList.contains('open')).toBe(false);

    (el.shadowRoot!.querySelector('.trigger') as HTMLElement).click();
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.menu')!.classList.contains('open')).toBe(true);
  });

  it('selecting an item emits dropdown-select with the item and closes the menu', async () => {
    const el = await createElement();
    const received: CustomEvent[] = [];
    el.addEventListener('dropdown-select', e => received.push(e as CustomEvent));

    (el.shadowRoot!.querySelector('.trigger') as HTMLElement).click();
    await el.updateComplete;

    (el.shadowRoot!.querySelectorAll('.item')[1] as HTMLElement).click();
    await el.updateComplete;

    expect(received).toHaveLength(1);
    expect(received[0]!.detail).toEqual(ITEMS[1]);
    expect(received[0]!.bubbles).toBe(true);
    expect(received[0]!.composed).toBe(true);
    expect(el.shadowRoot!.querySelector('.menu')!.classList.contains('open')).toBe(false);
  });

  it('a click outside closes the menu, and the listener is dropped on disconnect', async () => {
    const el = await createElement();
    (el.shadowRoot!.querySelector('.trigger') as HTMLElement).click();
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.menu')!.classList.contains('open')).toBe(true);

    window.dispatchEvent(new MouseEvent('click'));
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.menu')!.classList.contains('open')).toBe(false);

    const remove = vi.spyOn(window, 'removeEventListener');
    el.remove();
    expect(remove).toHaveBeenCalledWith('click', expect.any(Function));
    remove.mockRestore();
  });
});
