// ─── Mock HA Icon Custom Element (dev workbench only — CRITICAL-01 compliant) ─
export function registerMockHaIcon() {
  if (customElements.get('ha-icon')) return;

  customElements.define('ha-icon', class extends HTMLElement {
    static get observedAttributes() { return ['icon']; }

    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-block;
          width: 100%;
          height: 100%;
        }
        svg {
          width: 100%;
          height: 100%;
          fill: currentColor;
          display: block;
        }
      </style>
      <div id="icon-container" style="width:100%; height:100%; display:flex; align-items:center; justify-content:center;">
        <svg viewBox="0 0 24 24"><path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4Z" /></svg>
      </div>
    `;
    }

    attributeChangedCallback(name, oldVal, newVal) {
      if (name === 'icon' && newVal) {
        this._loadIcon(newVal);
      }
    }

    set icon(val) {
      this.setAttribute('icon', val);
    }

    get icon() {
      return this.getAttribute('icon');
    }

    async _loadIcon(iconName) {
      const container = this.shadowRoot.getElementById('icon-container');
      const [prefix, name] = iconName.split(':');
      if (prefix !== 'mdi' || !name) return;

      try {
        const res = await fetch(`https://unpkg.com/@mdi/svg@7.4.47/svg/${name}.svg`);
        if (res.ok) {
          const svgText = await res.text();
          const parser = new DOMParser();
          const doc = parser.parseFromString(svgText, 'image/svg+xml');
          const path = doc.querySelector('path');
          if (path) {
            const d = path.getAttribute('d');
            container.innerHTML = `<svg viewBox="0 0 24 24"><path d="${d}" /></svg>`;
            return;
          }
        }
      } catch (e) {
        // Silent fallback on fetch fail
      }
      // Fallback placeholder (mdi:help-circle)
      container.innerHTML = `<svg viewBox="0 0 24 24"><path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4Z" /></svg>`;
    }
  });
}
