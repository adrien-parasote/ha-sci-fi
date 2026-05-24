// @vitest-environment happy-dom
import { expect, describe, it, afterEach } from 'vitest';
import '../../../src/components/buttons/sf-button-card.js';
import type { SciFiCardButton } from '../../../src/components/buttons/sf-button-card.js';

describe('sf-button-card', () => {
  afterEach(() => {
    document.body.replaceChildren();
  });

  it('renders standard card button with title and text', async () => {
    const el = document.createElement('sf-button-card') as SciFiCardButton;
    el.title = 'Title text';
    el.text = 'Body text';
    el.icon = 'mdi:lightbulb';
    document.body.appendChild(el);
    await el.updateComplete;

    const label = el.shadowRoot!.querySelector('.label')!;
    expect(label).to.exist;
    expect(label.textContent).to.include('Title text');
    expect(label.textContent).to.include('Body text');
  });

  it('renders title-less (no-title) style', async () => {
    const el = document.createElement('sf-button-card') as SciFiCardButton;
    el.noTitle = true;
    el.text = 'Alone text';
    document.body.appendChild(el);
    await el.updateComplete;

    const label = el.shadowRoot!.querySelector('.label')!;
    expect(label.classList.contains('label-alone')).to.be.true;
    expect(label.textContent).to.equal('Alone text');
  });
});
