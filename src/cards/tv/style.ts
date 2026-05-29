import { css } from 'lit';

export const tvStyles = css`
  :host {
    display: block;
    height: 100%;
  }

  ha-card {
    background: rgba(13, 17, 23, 0.45) !important;
    border: 1px solid var(--sf-glow-navy, hsl(230, 40%, 15%)) !important;
    height: 100%;
    width: 100%;
    display: block;
    box-sizing: border-box;
  }

  .container {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 0;
    box-sizing: border-box;
  }

  /* ── Header ─────────────────────────────────────────── */
  .header {
    display: flex;
    flex-direction: row;
    border-bottom: 1px solid var(--sf-glow-navy, hsl(230, 40%, 15%));
    background-color: rgba(13, 17, 23, 0.7);
    padding: 6px 12px;
    align-items: center;
    min-height: 40px;
    box-sizing: border-box;
  }
  
  .header .info {
    display: flex;
    flex-direction: row;
    column-gap: 8px;
    align-items: center;
    flex: 1;
  }

  .header-text {
    font-size: 0.85rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: var(--sf-glow-cyan, hsl(190, 100%, 50%));
    text-shadow: 0 0 6px var(--sf-glow-cyan, hsl(190, 100%, 50%));
  }

  .header-power {
    background: none;
    border: none;
    cursor: pointer;
    padding: 3px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: background 0.15s;
  }

  .header-power:hover {
    background: rgba(0, 210, 255, 0.1);
  }

  .header-power svg {
    width: 16px;
    height: 16px;
    fill: none;
    stroke: var(--sf-glow-cyan, hsl(190, 100%, 50%));
    stroke-width: 2.5;
    filter: drop-shadow(0 0 4px var(--sf-glow-cyan, hsl(190, 100%, 50%)));
    transition: stroke 0.15s, filter 0.15s;
  }

  .header-power.is-off svg {
    stroke: var(--sf-glow-red, hsl(0, 100%, 50%));
    filter: drop-shadow(0 0 4px var(--sf-glow-red, hsl(0, 100%, 50%)));
  }

  /* ── Bridge Viewport (Grid Layout) ──────────────────── */
  .bridge-layout {
    display: grid;
    grid-template-columns: 1fr 1fr;
    flex: 1;
    align-items: center;
    padding: 12px;
    gap: 16px;
    background: radial-gradient(circle at center, rgba(16, 22, 38, 0.8) 0%, black 100%);
  }

  @media (max-width: 380px) {
    .bridge-layout {
      grid-template-columns: 1fr;
      justify-items: center;
    }
  }

  /* ── Telemetry Dial ────────────────────────────────── */
  .dial-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
    width: 100%;
    max-width: 160px;
    margin: 0 auto;
  }

  .dial-svg {
    width: 100%;
    height: auto;
    cursor: pointer;
    touch-action: none; /* pointer event drag works on mobile */
  }

  .dial-track {
    fill: none;
    stroke: rgba(0, 210, 255, 0.08);
    stroke-width: 8;
  }

  .dial-active {
    fill: none;
    stroke: var(--sf-glow-cyan, hsl(190, 100%, 50%));
    stroke-width: 8;
    stroke-linecap: round;
    transition: stroke-dashoffset 0.1s linear, stroke 0.2s;
  }

  .dial-active.is-off {
    stroke: var(--sf-glow-red, hsl(0, 100%, 50%));
  }

  .dial-grid {
    fill: none;
    stroke: var(--sf-telemetry-border, rgba(0, 210, 255, 0.2));
    stroke-width: 0.8;
  }

  .dial-label-container {
    position: absolute;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    pointer-events: none;
  }

  .dial-value {
    font-size: 1.3rem;
    font-weight: 700;
    font-family: monospace;
    color: var(--sf-glow-cyan, hsl(190, 100%, 50%));
    text-shadow: 0 0 6px var(--sf-glow-cyan, hsl(190, 100%, 50%));
  }

  .dial-value.is-off {
    color: rgba(255, 255, 255, 0.15);
    text-shadow: none;
  }

  .dial-title {
    font-size: 0.5rem;
    text-transform: uppercase;
    color: rgba(0, 210, 255, 0.4);
    letter-spacing: 1px;
    margin-top: 2px;
  }

  /* ── Tactical Command Sections ─────────────────────── */
  .control-section {
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 100%;
    align-items: center;
  }

  /* D-Pad Grid */
  .dpad-container {
    display: grid;
    grid-template-columns: repeat(3, 34px);
    grid-template-rows: repeat(3, 34px);
    gap: 4px;
    position: relative;
  }

  .dpad-btn {
    background: rgba(16, 22, 38, 0.7);
    border: 1px solid var(--sf-glow-navy, hsl(230, 40%, 15%));
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(0, 210, 255, 0.5);
    transition: all 0.15s;
    padding: 0;
  }

  .dpad-btn:hover:not(:disabled) {
    border-color: var(--sf-glow-cyan, hsl(190, 100%, 50%));
    color: var(--sf-glow-cyan, hsl(190, 100%, 50%));
    box-shadow: 0 0 6px rgba(0, 210, 255, 0.25);
  }

  .dpad-btn:active:not(:disabled) {
    background: var(--sf-bg-active, hsl(240, 30%, 15%));
    color: var(--sf-glow-cyan-active, hsl(190, 100%, 70%));
  }

  .dpad-btn:disabled {
    cursor: not-allowed;
    opacity: 0.15;
    border-color: rgba(255, 255, 255, 0.05);
  }

  .dpad-btn sf-icon {
    --icon-width: 16px;
    --icon-height: 16px;
    --icon-color: currentColor;
  }

  /* D-Pad Placements */
  .btn-up      { grid-column: 2; grid-row: 1; }
  .btn-left    { grid-column: 1; grid-row: 2; }
  .btn-confirm { grid-column: 2; grid-row: 2; border-radius: 50%; }
  .btn-right   { grid-column: 3; grid-row: 2; }
  .btn-down    { grid-column: 2; grid-row: 3; }

  /* Remote Secondary Row */
  .remote-row {
    display: flex;
    flex-direction: row;
    gap: 6px;
    justify-content: center;
    width: 100%;
  }

  .row-btn {
    flex: 1;
    max-width: 48px;
    height: 24px;
    font-size: 0.55rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    background: rgba(16, 22, 38, 0.7);
    border: 1px solid var(--sf-glow-navy, hsl(230, 40%, 15%));
    border-radius: 3px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(0, 210, 255, 0.4);
    transition: all 0.15s;
  }

  .row-btn:hover:not(:disabled) {
    border-color: var(--sf-glow-cyan, hsl(190, 100%, 50%));
    color: var(--sf-glow-cyan, hsl(190, 100%, 50%));
    box-shadow: 0 0 6px rgba(0, 210, 255, 0.2);
  }

  .row-btn:disabled {
    cursor: not-allowed;
    opacity: 0.15;
  }

  /* ── Hex Sources Honeycomb ──────────────────────────── */
  .sources-panel {
    display: flex;
    flex-direction: row;
    gap: 4px;
    justify-content: center;
    align-items: center;
    padding: 10px 0;
    flex-wrap: wrap;
    width: 100%;
  }

  .source-hexa {
    position: relative;
    width: 44px;
    height: 50.8px; /* 44 * 1.1547 */
    cursor: pointer;
    flex-shrink: 0;
    transition: transform 0.15s;
  }

  .source-hexa:hover:not([data-disabled="true"]) {
    transform: scale(1.05);
  }

  .source-hexa[data-disabled="true"] {
    cursor: not-allowed;
    opacity: 0.15;
  }

  .source-hexa svg {
    width: 100%;
    height: 100%;
    display: block;
  }

  .source-hexa .hexa-bg {
    fill: rgba(16, 22, 38, 0.6);
    transition: fill 0.15s;
  }

  .source-hexa .hexa-border {
    fill: none;
    stroke: var(--sf-glow-navy, hsl(230, 40%, 15%));
    stroke-width: 1.5px;
    transition: stroke 0.15s, filter 0.15s;
  }

  .source-hexa[data-active="true"] .hexa-bg {
    fill: rgba(0, 210, 255, 0.12);
  }

  .source-hexa[data-active="true"] .hexa-border {
    stroke: var(--sf-glow-cyan, hsl(190, 100%, 50%));
    stroke-width: 2px;
    filter: drop-shadow(0 0 4px var(--sf-glow-cyan, hsl(190, 100%, 50%)));
  }

  .source-hexa:hover:not([data-disabled="true"]) .hexa-border {
    stroke: var(--sf-glow-cyan, hsl(190, 100%, 50%));
  }

  .source-hexa .hexa-content {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 2px;
    box-sizing: border-box;
    pointer-events: none;
    font-size: 0.45rem;
    font-weight: 600;
    text-transform: uppercase;
    color: rgba(224, 232, 255, 0.4);
    letter-spacing: 0.5px;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .source-hexa[data-active="true"] .hexa-content {
    color: var(--sf-glow-cyan, hsl(190, 100%, 50%));
    text-shadow: 0 0 3px var(--sf-glow-cyan, hsl(190, 100%, 50%));
  }

  /* ── Offline state visual overlay ────────────────────── */
  .offline-banner {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4px;
    background: rgba(255, 0, 0, 0.08);
    border-top: 1px solid rgba(255, 0, 0, 0.2);
    font-size: 0.55rem;
    font-weight: 700;
    color: var(--sf-glow-red, hsl(0, 100%, 50%));
    letter-spacing: 1px;
    text-shadow: 0 0 4px var(--sf-glow-red, hsl(0, 100%, 50%));
  }

  /* ── Visual Editor Styles ───────────────────────────── */
  .editor-card {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 12px;
  }
`;
