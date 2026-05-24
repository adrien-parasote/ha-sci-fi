// @vitest-environment happy-dom
import { expect, describe, it, afterEach } from 'vitest';
import '../../src/components/sf-hexa-tile.js';
import type { SciFiHexaTile, SciFiHexaHalfTile } from '../../src/components/sf-hexa-tile.js';

describe('sf-hexa-tile and sf-half-hexa-tile', () => {
  afterEach(() => {
    document.body.replaceChildren();
  });

  describe('sf-hexa-tile', () => {
    it('renders inactive tile by default', async () => {
      const el = document.createElement('sf-hexa-tile') as SciFiHexaTile;
      document.body.appendChild(el);
      await el.updateComplete;

      const path = el.shadowRoot!.querySelector('.background')!;
      expect(path).to.exist;
      expect(el.shadowRoot!.querySelector('.border')).to.be.null;
    });

    it('renders active tile with border when active-tile attribute is set', async () => {
      const el = document.createElement('sf-hexa-tile') as SciFiHexaTile;
      el.activeTile = true;
      el.state = 'on';
      document.body.appendChild(el);
      await el.updateComplete;

      const border = el.shadowRoot!.querySelector('.border')!;
      expect(border).to.exist;
      expect(el.shadowRoot!.querySelector('.item-content')).to.exist;
      expect(el.shadowRoot!.querySelector('.item-on')).to.exist;
    });

    it('handles off and error states correctly', async () => {
      const el = document.createElement('sf-hexa-tile') as SciFiHexaTile;
      el.activeTile = true;
      el.state = 'error';
      document.body.appendChild(el);
      await el.updateComplete;

      expect(el.shadowRoot!.querySelector('.item-error')).to.exist;

      el.state = 'off';
      await el.updateComplete;
      expect(el.shadowRoot!.querySelector('.item-off')).to.exist;
    });
  });

  describe('sf-half-hexa-tile', () => {
    it('renders left half tile by default', async () => {
      const el = document.createElement('sf-half-hexa-tile') as SciFiHexaHalfTile;
      document.body.appendChild(el);
      await el.updateComplete;

      const background = el.shadowRoot!.querySelector('.background')!;
      expect(background.getAttribute('d')).to.include('M 66.021');
    });

    it('renders right half tile when right attribute is true', async () => {
      const el = document.createElement('sf-half-hexa-tile') as SciFiHexaHalfTile;
      el.right = true;
      document.body.appendChild(el);
      await el.updateComplete;

      const background = el.shadowRoot!.querySelector('.background')!;
      expect(background.getAttribute('d')).to.include('M 2 2');
    });
  });
});
