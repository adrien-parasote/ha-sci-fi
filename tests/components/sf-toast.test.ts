// @vitest-environment happy-dom
/**
 * Tests for sf-toast component.
 * Covers: addMessage (success), addMessage (error), container missing guard,
 * auto-remove on click close.
 */
import { expect, describe, it, afterEach, vi } from 'vitest';

async function createElement(): Promise<any> {
  await import('../../src/components/sf-toast.js');
  const el = document.createElement('sf-toast') as any;
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

describe('sf-toast', () => {
  afterEach(() => {
    document.body.replaceChildren();
    vi.restoreAllMocks();
  });

  it('renders #toast container', async () => {
    const el = await createElement();
    const container = el.shadowRoot!.getElementById('toast');
    expect(container).not.toBeNull();
  });

  it('addMessage appends a toast element (success)', async () => {
    vi.useFakeTimers();
    const el = await createElement();
    el.addMessage('Operation succeeded', false);

    const container = el.shadowRoot!.getElementById('toast')!;
    expect(container.children.length).toBe(1);
    expect(container.children[0]!.classList.contains('success')).toBe(true);
    expect(container.children[0]!.classList.contains('error')).toBe(false);
    vi.useRealTimers();
  });

  it('addMessage appends a toast element (error)', async () => {
    vi.useFakeTimers();
    const el = await createElement();
    el.addMessage('Something went wrong', true);

    const container = el.shadowRoot!.getElementById('toast')!;
    expect(container.children.length).toBe(1);
    expect(container.children[0]!.classList.contains('error')).toBe(true);
    vi.useRealTimers();
  });

  it('addMessage can add multiple toasts', async () => {
    vi.useFakeTimers();
    const el = await createElement();
    el.addMessage('First', false);
    el.addMessage('Second', true);

    const container = el.shadowRoot!.getElementById('toast')!;
    expect(container.children.length).toBe(2);
    vi.useRealTimers();
  });

  it('toast is removed when close button clicked', async () => {
    vi.useFakeTimers();
    const el = await createElement();
    el.addMessage('Click to close', false);

    const container = el.shadowRoot!.getElementById('toast')!;
    const toastEl = container.children[0] as HTMLElement;

    // Simulate click on .toast-close
    const closeDiv = document.createElement('div');
    closeDiv.classList.add('toast-close');
    toastEl.appendChild(closeDiv);

    // The onclick handler checks if the target has .toast-close ancestor
    const event = new MouseEvent('click', { bubbles: true });
    Object.defineProperty(event, 'target', { value: closeDiv });
    toastEl.onclick!(event as unknown as PointerEvent);

    expect(container.children.length).toBe(0);
    vi.useRealTimers();
  });

  it('toast is auto-removed after timeout', async () => {
    vi.useFakeTimers();
    const el = await createElement();
    el.addMessage('Auto remove', false);

    const container = el.shadowRoot!.getElementById('toast')!;
    expect(container.children.length).toBe(1);

    // success: autoDelay = 3000 + 2000 = 5000ms
    vi.advanceTimersByTime(5001);

    expect(container.children.length).toBe(0);
    vi.useRealTimers();
  });

  it('error toast has longer auto-remove timeout', async () => {
    vi.useFakeTimers();
    const el = await createElement();
    el.addMessage('Error!', true);

    const container = el.shadowRoot!.getElementById('toast')!;
    // error: autoDelay = 3000 + 5000 = 8000ms — should still be present at 5s
    vi.advanceTimersByTime(5000);
    expect(container.children.length).toBe(1);

    vi.advanceTimersByTime(3001);
    expect(container.children.length).toBe(0);
    vi.useRealTimers();
  });
});
