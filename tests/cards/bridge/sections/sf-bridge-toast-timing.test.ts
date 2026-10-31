// @vitest-environment happy-dom
/**
 * O3 — the toast a bridge section emits must follow its service call, not race it.
 *
 * The four section suites each `vi.mock` bridge-toast to a no-op and never
 * assert it, so none of them could see the toast being emitted before the call
 * resolved — nor see a failed call still announcing success. This file mocks
 * nothing and listens to the real `bridge-toast` event on the way up.
 */
import { expect, describe, it, vi, afterEach } from 'vitest';

import '../../../../src/cards/bridge/sections/sf-bridge-alerts.js';
import '../../../../src/cards/bridge/sections/sf-bridge-access.js';
import { makeMockHass, makeMockEntity } from '../../../fixtures/mock-hass.js';

for (const tag of ['sf-icon']) {
  if (!customElements.get(tag)) customElements.define(tag, class extends HTMLElement {});
}

describe('bridge sections — toast timing (O3)', () => {
  afterEach(() => {
    document.body.replaceChildren();
    vi.restoreAllMocks();
  });

  const mountAlerts = async (callService: any) => {
    const el = document.createElement('sf-bridge-alerts') as any;
    el.config = { toggles: [{ entity: 'switch.gate', name: 'Gate' }] };
    el.hass = makeMockHass({
      callService,
      states: {
        'switch.gate': makeMockEntity({ entity_id: 'switch.gate', state: 'off' }),
      },
    });
    const toasts: CustomEvent[] = [];
    el.addEventListener('bridge-toast', (e: Event) => toasts.push(e as CustomEvent));
    document.body.appendChild(el);
    await el.updateComplete;
    return { el, toasts };
  };

  it('holds the success toast until the service call resolves', async () => {
    let resolveCall: (v: unknown) => void = () => {};
    const callService = vi.fn(
      () =>
        new Promise(resolve => {
          resolveCall = resolve;
        })
    );
    const { el, toasts } = await mountAlerts(callService);

    (el.shadowRoot!.querySelector('.sf-toggle') as HTMLButtonElement).click();
    expect(callService).toHaveBeenCalled();
    expect(toasts.length).to.equal(0);

    resolveCall({});
    await Promise.resolve();
    await Promise.resolve();

    expect(toasts.length).to.equal(1);
    expect(toasts[0]!.detail.error).to.equal(false);
  });

  it('announces nothing when the service call is rejected', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const callService = vi.fn().mockRejectedValue(new Error('HA said no'));
    const { el, toasts } = await mountAlerts(callService);

    (el.shadowRoot!.querySelector('.sf-toggle') as HTMLButtonElement).click();
    await Promise.resolve();
    await Promise.resolve();

    // bridge.md: "Aucun message visible — log console".
    expect(toasts.length).to.equal(0);
    expect(errorSpy).toHaveBeenCalledWith('[sf-bridge] callService error:', expect.any(Error));
  });

  it('holds the cover toast until the call resolves, in another section', async () => {
    let resolveCall: (v: unknown) => void = () => {};
    const callService = vi.fn(
      () =>
        new Promise(resolve => {
          resolveCall = resolve;
        })
    );
    const el = document.createElement('sf-bridge-access') as any;
    el.config = { items: [{ entity: 'cover.garage', name: 'Garage' }] };
    el.hass = makeMockHass({
      callService,
      states: {
        'cover.garage': makeMockEntity({ entity_id: 'cover.garage', state: 'closed' }),
      },
    });
    const toasts: CustomEvent[] = [];
    el.addEventListener('bridge-toast', (e: Event) => toasts.push(e as CustomEvent));
    document.body.appendChild(el);
    await el.updateComplete;

    const openBtn = el.shadowRoot!.querySelector('.access-btn') as HTMLElement;
    expect(openBtn, 'the access section must render a cover open button').to.exist;
    openBtn.click();

    expect(callService).toHaveBeenCalled();
    expect(toasts.length).to.equal(0);

    resolveCall({});
    await Promise.resolve();
    await Promise.resolve();

    expect(toasts.length).to.equal(1);
  });
});
