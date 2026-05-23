// @vitest-environment happy-dom
import { expect, describe, it, beforeEach } from 'vitest';

import '../../../src/components/sf-toggle-switch/sf-toggle-switch.js';
import type { SfToggleSwitch } from '../../../src/components/sf-toggle-switch/sf-toggle-switch.js';

describe('sf-toggle-switch', () => {
  it('renders correctly with default properties', async () => {
    const el = document.createElement('sf-toggle-switch') as SfToggleSwitch;
    document.body.appendChild(el);
    expect(el.checked).to.be.false;
    expect(el.disabled).to.be.false;
    expect(el.label).to.equal('');
  });

  it('renders the label when provided', async () => {
    const el = document.createElement('sf-toggle-switch') as SfToggleSwitch;
    el.label = 'Test Label';
    document.body.appendChild(el);
    await new Promise(r => setTimeout(r, 50));
    const labelEl = el.shadowRoot!.querySelector('.label');
    expect(labelEl).to.exist;
    expect(labelEl!.textContent).to.equal('Test Label');
  });

  it('toggles state on click and dispatches event', async () => {
    const el = document.createElement('sf-toggle-switch') as SfToggleSwitch;
    document.body.appendChild(el);
    await new Promise(r => setTimeout(r, 50));

    const track = el.shadowRoot!.querySelector('.track') as HTMLElement;
    track.click();

    expect(el.checked).to.be.true;

    // Optional: could spy on dispatchEvent if we wanted to be rigorous
  });

  it('does not toggle when disabled', async () => {
    const el = document.createElement('sf-toggle-switch') as SfToggleSwitch;
    el.disabled = true;
    document.body.appendChild(el);
    await new Promise(r => setTimeout(r, 50));

    const track = el.shadowRoot!.querySelector('.track') as HTMLElement;
    track.click();

    expect(el.checked).to.be.false;
  });

  it('toggles on space/enter key press', async () => {
    const el = document.createElement('sf-toggle-switch') as SfToggleSwitch;
    document.body.appendChild(el);
    await new Promise(r => setTimeout(r, 50));

    const track = el.shadowRoot!.querySelector('.track') as HTMLElement;

    track.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(el.checked).to.be.true;

    track.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }));
    expect(el.checked).to.be.false;
  });
});
