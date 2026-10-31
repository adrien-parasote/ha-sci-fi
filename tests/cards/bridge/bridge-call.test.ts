// @vitest-environment happy-dom
import { expect, describe, it, vi, afterEach } from 'vitest';
import { bridgeCall } from '../../../src/cards/bridge/bridge-call.js';

describe('bridgeCall — O3', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  const collect = (el: Element) => {
    const received: CustomEvent[] = [];
    el.addEventListener('bridge-toast', e => received.push(e as CustomEvent));
    return received;
  };

  it('announces success only once the service call has resolved', async () => {
    const el = document.createElement('div');
    const received = collect(el);
    let resolveCall: (v: unknown) => void = () => {};
    const hass = {
      callService: vi.fn(
        () =>
          new Promise(resolve => {
            resolveCall = resolve;
          })
      ),
    } as any;

    const pending = bridgeCall(el, hass, 'switch', 'turn_on', { entity_id: 'switch.a' }, 'A on');

    // The whole defect: the toast used to be emitted here, before the call
    // had any chance to fail.
    expect(received.length).to.equal(0);

    resolveCall({});
    await pending;

    expect(received.length).to.equal(1);
    expect(received[0]!.detail.message).to.equal('A on');
    expect(received[0]!.detail.error).to.equal(false);
  });

  it('shows no toast at all when the call is rejected', async () => {
    const el = document.createElement('div');
    const received = collect(el);
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const hass = { callService: vi.fn().mockRejectedValue(new Error('boom')) } as any;

    await bridgeCall(el, hass, 'switch', 'turn_on', { entity_id: 'switch.a' }, 'A on');

    // bridge.md AP#6 and the Error Handling Matrix both prescribe a console log
    // and NO visible message for a failed callService.
    expect(received.length).to.equal(0);
    expect(errorSpy).toHaveBeenCalledWith('[sf-bridge] callService error:', expect.any(Error));
  });

  it('never rejects, so no caller leaks an unhandled rejection', async () => {
    const el = document.createElement('div');
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const hass = { callService: vi.fn().mockRejectedValue(new Error('boom')) } as any;

    await expect(
      bridgeCall(el, hass, 'switch', 'turn_on', { entity_id: 'switch.a' }, 'A on')
    ).resolves.toBeUndefined();
  });

  it('reports whether the call succeeded through the after hook', async () => {
    const el = document.createElement('div');
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const seen: boolean[] = [];
    const ok = { callService: vi.fn().mockResolvedValue({}) } as any;
    const ko = { callService: vi.fn().mockRejectedValue(new Error('boom')) } as any;

    await bridgeCall(el, ok, 'switch', 'turn_on', {}, 'ok', { after: v => seen.push(v) });
    await bridgeCall(el, ko, 'switch', 'turn_on', {}, 'ko', { after: v => seen.push(v) });

    expect(seen).to.deep.equal([true, false]);
  });
});
