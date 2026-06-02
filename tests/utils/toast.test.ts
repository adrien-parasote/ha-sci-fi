// @vitest-environment happy-dom
import { expect, describe, it, afterEach, vi, beforeEach } from 'vitest';
import { showToast } from '../../src/utils/toast.js';

describe('showToast', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    vi.useRealTimers();
  });

  it('adds a div into document.body', () => {
    showToast('msg');
    expect(document.body.children.length).toBeGreaterThanOrEqual(1);
  });

  it('div contains the message text', () => {
    showToast('hello toast');
    const div = document.body.lastElementChild as HTMLElement;
    expect(div.textContent).toBe('hello toast');
  });

  it('showToast with type ok → border contains #00ff9d', () => {
    showToast('msg', 'ok');
    const div = document.body.lastElementChild as HTMLElement;
    expect(div.style.cssText).toContain('#00ff9d');
  });

  it('showToast with type error → border contains #ff4d6d', () => {
    showToast('msg', 'error');
    const div = document.body.lastElementChild as HTMLElement;
    expect(div.style.cssText).toContain('#ff4d6d');
  });

  it('showToast with type warn → border contains #ffd60a', () => {
    showToast('msg', 'warn');
    const div = document.body.lastElementChild as HTMLElement;
    expect(div.style.cssText).toContain('#ffd60a');
  });

  it('showToast with type info → border contains #00d2ff', () => {
    showToast('msg', 'info');
    const div = document.body.lastElementChild as HTMLElement;
    expect(div.style.cssText).toContain('#00d2ff');
  });

  it('calling showToast twice replaces the first toast (only one toast in body)', () => {
    vi.useFakeTimers();
    showToast('first');
    showToast('second');
    // Count divs added by showToast
    const toastDivs = Array.from(document.body.children);
    expect(toastDivs.length).toBe(1);
    expect((toastDivs[0] as HTMLElement).textContent).toBe('second');
  });

  it('auto-removes the toast after 1800 + 160ms', () => {
    vi.useFakeTimers();
    showToast('auto remove');
    expect(document.body.children.length).toBe(1);
    vi.advanceTimersByTime(2000);
    expect(document.body.children.length).toBe(0);
  });
});
