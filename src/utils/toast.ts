/**
 * toast.ts — Lightweight toast notification utility
 * Shows a brief message overlay in the top-right of the viewport.
 * Used by all bridge sections to confirm actionable interactions.
 *
 * Usage: showToast('Activé', 'ok')
 * Types: 'ok' | 'warn' | 'error' | 'info'
 */

export type ToastType = 'ok' | 'warn' | 'error' | 'info';

const TOAST_DURATION_MS = 1800;
const TOAST_Z = '99999';

let activeToast: HTMLElement | null = null;

const colorMap: Record<ToastType, { bg: string; border: string; text: string }> = {
  ok:    { bg: 'rgba(0,255,157,0.12)', border: '#00ff9d', text: '#00ff9d' },
  warn:  { bg: 'rgba(255,214,10,0.12)', border: '#ffd60a', text: '#ffd60a' },
  error: { bg: 'rgba(255,77,109,0.12)', border: '#ff4d6d', text: '#ff4d6d' },
  info:  { bg: 'rgba(0,210,255,0.12)',  border: '#00d2ff', text: '#00d2ff' },
};

export function showToast(message: string, type: ToastType = 'ok'): void {
  // Remove existing toast immediately
  if (activeToast) {
    activeToast.remove();
    activeToast = null;
  }

  const { bg, border, text } = colorMap[type];

  const el = document.createElement('div');
  el.textContent = message;
  el.style.cssText = `
    position: fixed;
    top: 16px;
    right: 16px;
    z-index: ${TOAST_Z};
    padding: 8px 16px;
    border-radius: 8px;
    border: 1px solid ${border};
    background: ${bg};
    color: ${text};
    font-family: 'Inter', 'Roboto', system-ui, sans-serif;
    font-size: 0.8rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    backdrop-filter: blur(8px);
    box-shadow: 0 0 12px ${border}55;
    pointer-events: none;
    opacity: 0;
    transform: translateY(-8px);
    transition: opacity 0.15s ease, transform 0.15s ease;
  `;

  document.body.appendChild(el);
  activeToast = el;

  // Trigger entrance animation
  requestAnimationFrame(() => {
    el.style.opacity = '1';
    el.style.transform = 'translateY(0)';
  });

  // Auto-remove
  setTimeout(() => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(-8px)';
    setTimeout(() => {
      if (el.parentNode) el.remove();
      if (activeToast === el) activeToast = null;
    }, 160);
  }, TOAST_DURATION_MS);
}
