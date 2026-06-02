// @vitest-environment happy-dom
import { expect, describe, it } from 'vitest';
import { bridgeToast } from '../../../src/cards/bridge/bridge-toast.js';

describe('bridgeToast', () => {
  it('dispatches bridge-toast event on the element', () => {
    const el = document.createElement('div');
    document.body.appendChild(el);

    const received: CustomEvent[] = [];
    el.addEventListener('bridge-toast', (e) => received.push(e as CustomEvent));

    bridgeToast(el, 'msg');

    expect(received).toHaveLength(1);
    document.body.removeChild(el);
  });

  it('event.detail.message equals the passed message', () => {
    const el = document.createElement('div');
    document.body.appendChild(el);

    const received: CustomEvent[] = [];
    el.addEventListener('bridge-toast', (e) => received.push(e as CustomEvent));

    bridgeToast(el, 'hello world');

    expect(received[0]!.detail.message).toBe('hello world');
    document.body.removeChild(el);
  });

  it('event.detail.error defaults to false', () => {
    const el = document.createElement('div');
    document.body.appendChild(el);

    const received: CustomEvent[] = [];
    el.addEventListener('bridge-toast', (e) => received.push(e as CustomEvent));

    bridgeToast(el, 'msg');

    expect(received[0]!.detail.error).toBe(false);
    document.body.removeChild(el);
  });

  it('event.detail.error is true when passed as third argument', () => {
    const el = document.createElement('div');
    document.body.appendChild(el);

    const received: CustomEvent[] = [];
    el.addEventListener('bridge-toast', (e) => received.push(e as CustomEvent));

    bridgeToast(el, 'msg', true);

    expect(received[0]!.detail.error).toBe(true);
    document.body.removeChild(el);
  });

  it('event bubbles to parent (bubbles: true)', () => {
    const parent = document.createElement('div');
    const child = document.createElement('div');
    parent.appendChild(child);
    document.body.appendChild(parent);

    const received: CustomEvent[] = [];
    parent.addEventListener('bridge-toast', (e) => received.push(e as CustomEvent));

    bridgeToast(child, 'bubbling');

    expect(received).toHaveLength(1);
    document.body.removeChild(parent);
  });

  it('event is composed: true', () => {
    const el = document.createElement('div');
    document.body.appendChild(el);

    const received: CustomEvent[] = [];
    el.addEventListener('bridge-toast', (e) => received.push(e as CustomEvent));

    bridgeToast(el, 'composed');

    expect(received[0]!.composed).toBe(true);
    document.body.removeChild(el);
  });
});
