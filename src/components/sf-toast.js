import {LitElement, css} from 'lit';
import {html, render} from 'lit-html';

import common_style from '../helpers/styles/common_style.js';
import {defineCustomElement} from '../helpers/utils/import.js';

class SciFiToast extends LitElement {
  static get styles() {
    return [
      common_style,
      css`
        :host {
          --green: #47d864;
          --red: #ff623d;
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
          align-items: end;
        }
        #toast .toast {
          display: flex;
          align-items: center;
          background-color: black;
          border-radius: var(--border-radius);
          border: var(--border-width) solid var(--primary-bg-color);
          width: fit-content;
          border-left: calc(4 * var(--border-width)) solid;
          box-shadow: 0 5px 8px rgba(0, 0, 0, 0.08);
          transition: all linear 0.3s;
          color: white;
        }
        #toast .toast sci-fi-icon {
          --icon-width: var(--icon-size-small);
          --icon-height: var(--icon-size-small);
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(calc(100% + 32px));
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes fadeOut {
          to {
            opacity: 0;
          }
        }
        #toast .toast.success {
          border-left-color: var(--green);
        }
        #toast .toast.success .toast_icon sci-fi-icon {
          --icon-color: var(--green);
        }
        #toast .toast.error {
          border-left-color: var(--red);
        }
        #toast .toast.error .toast_icon sci-fi-icon {
          --icon-color: var(--red);
        }
        #toast .toast .toast_icon,
        #toast .toast .toast_close {
          padding: 0 10px;
        }
        #toast .toast .toast_body {
          flex-grow: 1;
          font-size: var(--font-size-normal);
          padding: 10px 5px;
        }
        #toast .toast .toast_close {
          cursor: pointer;
        }
        #toast .toast .toast_close sci-fi-icon {
          --icon-color: white;
        }
      `,
    ];
  }

  render() {
    return html`<div id="toast"></div>`;
  }

  addMessage(message, error = false) {
    const main = this.shadowRoot.getElementById('toast');
    const toast = document.createElement('div');
    const duration = 3000;
    // Auto remove toast
    const autoRemoveId = setTimeout(function () {
      main.removeChild(toast);
    }, duration + 2000);
    // Remove toast when clicked
    toast.onclick = function (e) {
      if (e.target.closest('.toast_close')) {
        main.removeChild(toast);
        clearTimeout(autoRemoveId);
      }
    };
    // Build message
    const delay = (duration / 1000).toFixed(2);
    toast.classList.add('toast', error ? 'error' : 'success');
    toast.style.animation = `slideInLeft ease .3s, fadeOut linear 1s ${delay}s forwards`;
    render(
      html`
        <div class="toast_icon">
          <sci-fi-icon icon=${error ? 'mdi:alert-circle' : 'mdi:check-circle'}></sci-f-icon>
        </div>
        <div class="toast_body">${message}</div>
        <div class="toast_close"><sci-fi-icon icon='mdi:close'></sci-f-icon></div>
      `,
      toast
    );
    main.appendChild(toast);
  }
}

defineCustomElement('sci-fi-toast', SciFiToast);
