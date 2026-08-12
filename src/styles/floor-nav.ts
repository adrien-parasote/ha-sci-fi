/**
 * floor-nav.ts — the hexagonal floor-navigation shell.
 *
 * The lights card and the water-management card render the same widget: a card
 * frame, a header with a global power button, and a row of hexagonal floor
 * tiles with their hover/selected/active states. Until ADR-017 step 8 the whole
 * thing existed twice, copy-pasted — 26 rules, 106 declarations, in two files
 * that had already started to drift apart elsewhere.
 *
 * Only rules that were **byte-identical** in both cards live here. Anything a
 * card had customised stayed in that card's own styles.ts. Because this sheet
 * is placed BEFORE the card sheet in `static styles`, a card can still override
 * any rule below without touching this file.
 *
 * Guarded by tests/styles/card-css-baseline.test.ts: both cards must resolve to
 * exactly the CSS they resolved to before the hoist.
 */

import { css } from 'lit';

export const floorNavStyles = css`
  ha-card {
    background: rgba(39, 40, 43, 0.3) !important;
    border: none !important;
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
  }

  .header {
    display: flex;
    flex-direction: row;
    border-top: var(--sf-border-width, 1px) solid var(--sf-border);
    border-bottom: var(--sf-border-width, 1px) solid var(--sf-border);
    background-color: rgba(13, 17, 23, 0.6);
    padding: 5px 10px;
    font-size: var(--sf-text-sm, 12px);
    align-items: center;
    min-height: 44px;
  }

  .header .info {
    display: flex;
    flex-direction: row;
    column-gap: 5px;
    align-items: center;
    padding-bottom: 5px;
    flex: 1;
  }

  .header-text {
    font-size: 0.9rem;
    color: var(--sf-primary, #00d2ff);
    text-shadow: 0 0 5px var(--sf-primary, #00d2ff);
  }

  .floors {
    display: flex;
    flex-direction: row;
    background-color: black;
    column-gap: 5px;
    justify-content: center;
    align-items: center;
    margin: 0;
    padding: 20px 0;
  }

  .floor-hexa {
    position: relative;
    width: var(--hexa-w);
    height: var(--hexa-h);
    cursor: pointer;
    flex-shrink: 0;
    transition: transform 0.2s ease;
  }

  .floor-hexa:hover { transform: scale(1.08); }

  .floor-hexa[data-selected="true"] {
    transform: scale(1.3);
    z-index: 1;
  }

  .floor-hexa[data-selected="true"]:hover { transform: scale(1.35); }

  .floor-hexa svg { width: 100%; height: 100%; display: block; }

  .floor-hexa .hexa-bg { transition: fill 0.15s; }

  .floor-hexa .hexa-border { fill: none; transition: stroke 0.15s, filter 0.15s; }

  .floor-hexa .hexa-bg { fill: rgba(16,22,38,0.6); }

  .floor-hexa .hexa-border { stroke: rgba(224,232,255,0.15); stroke-width: 1.5px; }

  .floor-hexa[data-selected="true"] .hexa-bg { fill: rgba(0,210,255,0.12); }

  .floor-hexa[data-selected="true"] .hexa-border {
    stroke: var(--sf-primary, #00d2ff);
    stroke-width: 2.5px;
    filter: drop-shadow(0 0 6px var(--sf-primary, #00d2ff));
  }

  .floor-hexa:hover .hexa-border {
    stroke: var(--sf-primary, #00d2ff);
    filter: drop-shadow(0 0 5px var(--sf-primary, #00d2ff));
  }

  .floor-hexa .hexa-content {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    pointer-events: none;
    padding: 4px;
    box-sizing: border-box;
  }

  .floor-hexa .hexa-content sf-icon {
    --icon-width: 20px;
    --icon-height: 20px;
    /* Default: dim (no lights on) */
    --icon-color: rgba(224,232,255,0.35);
    display: block;
  }

  .floor-hexa[data-active="true"] .hexa-content sf-icon {
    --icon-color: var(--sf-primary, #00d2ff);
  }

  .floor-hexa .floor-name {
    font-size: 0.48rem;
    font-weight: 600;
    /* Default: dim */
    color: rgba(224,232,255,0.35);
    margin-top: 2px;
    text-align: center;
    max-width: 90%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .floor-hexa[data-active="true"] .floor-name { color: var(--sf-primary, #00d2ff); }

  .floor-info.floor-off { color: rgba(224,232,255,0.4); }

  .power-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 2px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: background 0.15s;
    flex-shrink: 0;
  }

  .power-btn:hover { background: rgba(0,210,255,0.12); }

  .power-btn svg {
    width: 14px;
    height: 14px;
    fill: none;
    stroke: var(--sf-primary, #00d2ff);
    stroke-width: 2;
    filter: drop-shadow(0 0 3px var(--sf-primary, #00d2ff));
    transition: stroke 0.15s, filter 0.15s;
  }

  .power-btn.is-off svg { stroke: rgba(255,255,255,0.2); filter: none; }
`;
