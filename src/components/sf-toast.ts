/**
 * <sf-toast> — Toast notification component
 *
 * Ported from main branch src/components/sf-toast.js (SciFiToast).
 * Tag changed: sci-fi-toast → sf-toast (aligned with v2 naming convention).
 * Replaced sci-fi-icon with sf-icon.
 *
 * Usage: add <sf-toast></sf-toast> to card template, then call:
 *   const toast = this.shadowRoot.querySelector('sf-toast');
 *   toast.addMessage('Message text', false); // false = success, true = error
 */

import { LitElement, html, css, type TemplateResult } from 'lit';
import { customElement } from 'lit/decorators.js';
import { render } from 'lit-html';

import './sf-icon/sf-icon.js';

@customElement('sf-toast')
export class SfToast extends LitElement {
  static override styles = css`
    :host {
      --toast-green: #47d864;
      --toast-red: #ff623d;
    }
    #toast {
      position: fixed;
      right: 5px;
      bottom: 50px;
      z-index: 999999;
      min-width: 300px;
      max-width: 300px;
      display: flex;
      flex-direction: column;
      row-gap: 10px;
      align-items: flex-end;
      pointer-events: none;
    }
    #toast .toast {
      pointer-events: auto;
      display: flex;
      align-items: center;
      background-color: #0d1117;
      border-radius: 8px;
      border: 1px solid rgba(102, 156, 210, 0.3);
      width: fit-content;
      border-left: 4px solid;
      box-shadow: 0 5px 8px rgba(0, 0, 0, 0.4);
      transition: all linear 0.3s;
      color: white;
    }
    @keyframes slideInRight {
      from { opacity: 0; transform: translateX(calc(100% + 32px)); }
      to   { opacity: 1; transform: translateX(0); }
    }
    @keyframes fadeOut {
      to { opacity: 0; }
    }
    .toast.success { border-left-color: var(--toast-green); }
    .toast.success .toast-icon { --icon-color: var(--toast-green); }
    .toast.error   { border-left-color: var(--toast-red); }
    .toast.error   .toast-icon { --icon-color: var(--toast-red); }
    .toast-icon,
    .toast-close {
      padding: 0 10px;
    }
    .toast-icon sf-icon,
    .toast-close sf-icon {
      --icon-width: 18px;
      --icon-height: 18px;
    }
    .toast-body {
      flex-grow: 1;
      font-size: 13px;
      padding: 10px 5px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 220px;
    }
    .toast-close {
      cursor: pointer;
    }
    .toast-close sf-icon {
      --icon-color: rgba(255,255,255,0.6);
    }
  `;

  override render(): TemplateResult {
    return html`<div id="toast"></div>`;
  }

  /**
   * Display a toast notification.
   * @param message  Text to display
   * @param error    true = error (red), false = success (green)
   */
  addMessage(message: string, error = false): void {
    const container = this.shadowRoot?.getElementById('toast');
    if (!container) return;

    const toastEl = document.createElement('div');
    const delay = 3;                                    // seconds before fade
    const autoDelay = delay * 1000 + (error ? 5000 : 2000);

    const autoRemoveId = window.setTimeout(() => {
      if (container.contains(toastEl)) container.removeChild(toastEl);
    }, autoDelay);

    toastEl.onclick = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest('.toast-close')) {
        if (container.contains(toastEl)) container.removeChild(toastEl);
        clearTimeout(autoRemoveId);
      }
    };

    toastEl.classList.add('toast', error ? 'error' : 'success');
    toastEl.style.animation =
      `slideInRight ease .3s, fadeOut linear 1s ${delay}s forwards`;

    render(
      html`
        <div class="toast-icon">
          <sf-icon icon="${error ? 'mdi:alert-circle' : 'mdi:check-circle'}"></sf-icon>
        </div>
        <div class="toast-body">${message}</div>
        <div class="toast-close">
          <sf-icon icon="mdi:close"></sf-icon>
        </div>
      `,
      toastEl
    );

    container.appendChild(toastEl);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'sf-toast': SfToast;
  }
}
