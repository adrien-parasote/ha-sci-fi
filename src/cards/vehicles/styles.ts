/**
 * styles.ts — Vehicle card CSS
 * Ported from main:src/cards/vehicles/style.js
 * Variables inlined from main:src/helpers/styles/common_style.js
 */
import { css } from 'lit';

export const vehicleStyles = css`
  /* display:flex so ha-card can use flex:1 — works in both card mode (intrinsic
     min-height) and panel/PC mode (workbench flex-determined height).
     height:100% on ha-card would fail in card mode where :host only has min-height. */
  :host {
    display: flex;
    flex-direction: column;
    background-color: black;
    width: 100%;
    min-height: 732px;
  }

  ha-card {
    background: rgba(39, 40, 43, 0.3) !important;
    border: none !important;
    /* flex:1 fills :host regardless of whether height comes from flex or min-height */
    flex: 1;
    width: 100%;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    /* common.ts sets overflow-y:auto — override so flex children resolve height */
    overflow: hidden !important;
  }

  /* ── CONTAINER ──────────────────────────────────────── */
  .container {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
  }

  /* Speeder fills all available vertical space between header and actions */
  sf-landspeeder {
    flex: 1;
    min-height: 0;
  }

  /* ── HEADER ──────────────────────────────────────────── */
  /* main: border-bottom: var(--border-width) solid var(--primary-bg-color) */
  .header {
    display: flex;
    flex-direction: row;
    text-align: center;
    border-bottom: 1px solid rgb(39, 40, 43);
    padding: 10px;
    background-color: rgba(39, 40, 43, 0.3);
    align-items: center;
  }

  /* main: .header .hide { display: none } */
  .header .hide {
    display: none;
  }

  /* main: color: var(--primary-light-color) */
  .header .title {
    flex: 1;
    align-content: center;
    color: rgb(105, 211, 251);
  }

  /* ── ACTIONS ──────────────────────────────────────── */
  /* Fixed at bottom: flex-shrink:0 + justify-content:center for centered buttons */
  .actions {
    display: flex;
    flex-direction: row;
    justify-content: center;
    flex-shrink: 0;
    padding: 10px;
    padding-bottom: 20px;
  }

  .actions .ac {
    display: flex;
    flex-direction: row;
    column-gap: 5px;
    /* stretch makes sf-wheel match the height of sf-button-card */
    align-items: stretch;
  }

  /* main: --text-size: var(--font-size-xsmall) = 10px */
  .actions .ac sf-wheel {
    --padding: 0 10px;
    --wheel-row-gap: 2px;
    --text-size: 10px;
    --border: 1px solid rgba(102, 156, 210, 0.5);
    /* Center wheel content vertically when host is stretched to button height */
    justify-content: center;
  }

  /* Bordures sf-button-card: override --border via le hook CSS */
  .actions .ac sf-button-card {
    --border: 1px solid rgba(102, 156, 210, 0.5);
    --background: rgba(102, 156, 210, 0.2);
  }
`;
