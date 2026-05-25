// @vitest-environment happy-dom
import { expect, describe, it, vi, afterEach } from 'vitest';
import '../../src/components/sf-hexa-row.js';
import type { SciFiHexaRow } from '../../src/components/sf-hexa-row.js';

describe('sf-hexa-row', () => {
  afterEach(() => {
    document.body.replaceChildren();
  });

  it('renders list of tiles from cells property and dispatches selection event', async () => {
    const el = document.createElement('sf-hexa-row') as SciFiHexaRow;
    el.cells = [
      { id: 'area_1', state: 'on', selected: true, active: 'on', icon: 'mdi:sofa' },
      { id: 'area_2', state: 'off', selected: false, active: 'off', icon: 'mdi:bed' }
    ];

    const handler = vi.fn();
    el.addEventListener('cell-selected', handler);

    document.body.appendChild(el);
    await el.updateComplete;

    const tiles = el.shadowRoot!.querySelectorAll('sf-hexa-tile');
    expect(tiles.length).to.equal(2);
    expect(tiles[0]!.classList.contains('selected')).to.be.true;
    expect(tiles[1]!.classList.contains('selected')).to.be.false;

    // Verify cell.active state sets proper classes on item-icon
    expect(tiles[0]!.querySelector('.item-icon')!.classList.contains('on')).to.be.true;
    expect(tiles[1]!.querySelector('.item-icon')!.classList.contains('off')).to.be.true;

    // Click second cell
    (tiles[1]! as HTMLElement).click();

    expect(handler).toHaveBeenCalledOnce();
    expect(handler.mock.calls[0]![0]!.detail.cell).to.deep.equal({
      id: 'area_2', state: 'off', selected: false, active: 'off', icon: 'mdi:bed'
    });
  });
});
