/**
 * Shared toggle switch of the bridge sections (alerts toggles, automations).
 * An absent entity renders it disabled (spec bridge-error-matrix FR-6.2).
 */
import { html, type TemplateResult } from 'lit';

export function renderSfToggle(absent: boolean, isOn: boolean, onClick: () => void): TemplateResult {
  return html`
    <button
      class="sf-toggle"
      data-on="${isOn}"
      aria-pressed="${isOn}"
      ?disabled="${absent}"
      aria-disabled="${absent ? 'true' : 'false'}"
      @click="${onClick}"
    >
      <div class="sf-toggle-track">
        <div class="sf-toggle-thumb"></div>
      </div>
    </button>
  `;
}
