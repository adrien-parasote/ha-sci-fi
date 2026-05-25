import { css } from 'lit';

export const lightStyles = css`
  /* ── Host / Card shell ───────────────────────────────── */
  :host {
    --light-on-color: rgb(255, 193, 7);
    --hexa-w: 60px;
    --hexa-h: calc(var(--hexa-w) * 1.1547);
    --corner-size: 10px;
    display: block;
    height: 100%;
  }

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

  /* ── Header ─────────────────────────────────────────── */
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
  /* Day/night icon — top-right of header */
  .header .weather-icon {
    width: 36px;
    height: 36px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .header .weather-icon svg {
    width: 100%;
    height: 100%;
  }

  /* ── Floors row (hexa) ───────────────────────────────── */
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
  /* Selected floor is visually larger (matches main branch) */
  .floor-hexa[data-selected="true"] {
    transform: scale(1.3);
    z-index: 1;
  }
  .floor-hexa[data-selected="true"]:hover { transform: scale(1.35); }

  .floor-hexa svg { width: 100%; height: 100%; display: block; }
  .floor-hexa .hexa-bg { transition: fill 0.15s; }
  .floor-hexa .hexa-border { fill: none; transition: stroke 0.15s, filter 0.15s; }

  /*
   * Floor hexa states:
   *   data-selected="true"  → border glow (this floor is selected)
   *   data-active="true"    → icon bright (≥1 light ON in this floor)
   */
  .floor-hexa .hexa-bg { fill: rgba(16,22,38,0.6); }
  .floor-hexa .hexa-border { stroke: rgba(224,232,255,0.15); stroke-width: 1.5px; }

  /* Selected = glowing border */
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
  /* Active = icon bright (≥1 light on in floor) */
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
  /* Active = name bright */
  .floor-hexa[data-active="true"] .floor-name { color: var(--sf-primary, #00d2ff); }

  /* ── Floor info panel ────────────────────────────────── */
  .floor-content {
    display: flex;
    flex-direction: column;
    border-bottom: 1px solid rgba(0,210,255,0.15);
    border-top: 1px solid rgba(0,210,255,0.15);
    padding: 10px 0;
    margin: 0;
    background-color: rgba(13, 17, 23, 0.6);
  }
  .floor-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 0 auto;
    min-width: 200px;
    color: var(--sf-primary, #00d2ff);
  }
  .floor-info.floor-off { color: rgba(224,232,255,0.4); }
  .floor-title {
    font-size: 0.9rem;
    font-weight: bold;
    border-bottom: 1px solid currentColor;
    padding-bottom: 5px;
    margin-bottom: 8px;
    width: 100%;
    /* Center the name, button floats right (absolute) */
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
  }
  .floor-title .power-btn {
    position: absolute;
    right: 0;
  }
  .floor-lights {
    display: flex;
    flex-direction: row;
    justify-content: center;
    gap: 8px;
    flex-wrap: wrap;
    padding: 0 10px;
  }
  .floor-lights > div {
    border-radius: 50%;
    height: 10px;
    width: 10px;
    background-color: var(--light-on-color);
    box-shadow: 0 0 4px var(--light-on-color);
  }
  .floor-lights > div.dot-off {
    background-color: rgba(255,255,255,0.12);
    box-shadow: none;
  }

  /* ── Areas section — left column + right panel ───────── */
  .areas-section {
    display: flex;
    background-color: black;
    flex-direction: row;
    flex: 1;                  /* fill all remaining vertical space in .container */
    align-items: stretch;     /* right panel stretches to same height as area-list */
    padding: 10px 10px 0 10px;
    gap: 0;
    overflow: hidden;
  }

  /* ── Area list (vertical column) ─────────────────────── */
  /*
   * Each area row contains: hexagon + connector line.
   * Odd rows (1, 3, …) are offset right by hexa-w/2 to create
   * the staggered honeycomb column effect matching the main branch.
   * The negative bottom margin creates the vertical overlap.
   */
  .area-list {
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    /* width = max possible: hexa-w + hexa-w/2 offset */
    width: calc(var(--hexa-w) * 1.5 + 60px); /* hexa + connector */
  }
  .area-row {
    display: flex;
    flex-direction: row;
    align-items: center;
    /* Vertical overlap to create honeycomb stacking */
    margin-bottom: calc(var(--hexa-h) * -0.27);
    position: relative;
  }
  .area-row:last-child { margin-bottom: 0; }

  /* Stagger: odd rows shift right by half a hexagon */
  .area-row.row-odd {
    padding-left: calc(var(--hexa-w) / 2);
  }

  /* ── Area hexagon ─────────────────────────────────────── */
  .area-hexa {
    position: relative;
    width: var(--hexa-w);
    height: var(--hexa-h);
    cursor: pointer;
    flex-shrink: 0;
    transition: transform 0.2s ease;
  }
  .area-hexa:hover { transform: scale(1.08); }
  .area-hexa:hover .hexa-border {
    stroke: var(--sf-primary, #00d2ff);
    filter: drop-shadow(0 0 5px var(--sf-primary, #00d2ff));
  }
  .area-hexa svg { width: 100%; height: 100%; display: block; }
  .area-hexa .hexa-bg { transition: fill 0.15s; }
  .area-hexa .hexa-border { fill: none; transition: stroke 0.15s, filter 0.15s; }

  /*
   * Area hexa states:
   *   data-selected="true"  → border glow (this area is selected)
   *   data-active="true"    → icon bright (≥1 light ON in this area)
   */
  .area-hexa .hexa-bg { fill: rgba(16,22,38,0.6); }
  .area-hexa .hexa-border { stroke: rgba(224,232,255,0.12); stroke-width: 1.5px; }

  /* Selected = glowing border */
  .area-hexa[data-selected="true"] .hexa-bg { fill: rgba(0,210,255,0.12); }
  .area-hexa[data-selected="true"] .hexa-border {
    stroke: var(--sf-primary, #00d2ff);
    stroke-width: 2.5px;
    filter: drop-shadow(0 0 7px var(--sf-primary, #00d2ff));
  }

  .area-hexa .hexa-content {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
  }
  .area-hexa .hexa-content sf-icon {
    --icon-width: 22px;
    --icon-height: 22px;
    /* Default: dim (no lights on) */
    --icon-color: rgba(224,232,255,0.3);
    display: block;
  }
  /* Active = icon bright (≥1 light on in area) */
  .area-hexa[data-active="true"] .hexa-content sf-icon {
    --icon-color: var(--sf-primary, #00d2ff);
  }

  /* ── Connector: hexa → content panel ─────────────────── */
  /*
   *  Visible  = selected area  (show class)
   *  Bright   = active area (≥1 light ON)  (.active class on sep-circle/sep-line)
   */
  .h-separator {
    display: flex;
    flex-direction: row;
    align-items: center;
    height: 8px;
    width: 0;
    overflow: hidden;
    opacity: 0;
    transition: width 0.2s ease, opacity 0.2s ease;
  }
  /* Visible when selected */
  .h-separator.show {
    width: 50px;
    opacity: 1;
  }
  /* Dim by default (selected but no lights on) */
  .sep-circle {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    flex-shrink: 0;
    background-color: rgba(255,255,255,0.2);
  }
  /* Bright when area is active */
  .sep-circle.active {
    background-color: var(--sf-primary, #00d2ff);
    box-shadow: 0 0 4px var(--sf-primary, #00d2ff);
  }
  .sep-line {
    flex: 1;
    height: 1px;
    background-color: rgba(255,255,255,0.2);
  }
  .sep-line.active { background-color: var(--sf-primary, #00d2ff); }

  /* ── Area content panel (right) ──────────────────── */
  .area-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 10px;
    min-width: 0;
    /* Vertically align with first area row */
    margin-top: calc(var(--hexa-h) * 0.1);

    /* Sci-fi corner decoration (from main branch common_style) */
    border-width: 1px;
    border-style: solid;
    border-color: var(--sf-primary, #00d2ff);
    mask:
      conic-gradient(#000 0 0) content-box,
      conic-gradient(
        at var(--corner-size) var(--corner-size),
        #0000 75%,
        #000 0
      )
      0 0 / calc(100% - var(--corner-size)) calc(100% - var(--corner-size));
  }
  .area-content.area-off {
    border-color: rgba(255,255,255,0.15);
    color: rgba(224,232,255,0.4);
  }
  .area-title {
    font-size: 0.9rem;
    font-weight: bold;
    border-bottom: 1px solid currentColor;
    padding-bottom: 5px;
    margin-bottom: 8px;
    /* Center the name, button floats right (absolute) */
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    min-height: 28px;
  }
  .area-title .power-btn {
    position: absolute;
    right: 0;
  }
  /* Power button is last child → pushed to right by space-between */

  /* ── Light buttons grid ───────────────────────────────── */
  .lights-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 5px;
    padding: 5px 0;
    justify-items: center;
    width: 100%;
  }
  .light-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3px;
    border: 1px solid var(--sf-primary, #00d2ff);
    border-radius: 6px;
    padding: 6px 4px;
    cursor: pointer;
    background: transparent;
    transition: background 0.15s, border-color 0.15s, box-shadow 0.15s;
    width: 100%;
    box-sizing: border-box;
    min-width: 0;
  }
  .light-btn.light-off { border-color: rgba(255,255,255,0.12); }
  .light-btn:hover { box-shadow: 0 0 8px rgba(0,210,255,0.35); }
  .light-btn sf-icon {
    --icon-width: 20px;
    --icon-height: 20px;
    --icon-color: var(--light-on-color);
    display: block;
  }
  .light-btn.light-off sf-icon { --icon-color: rgba(255,255,255,0.2); }
  .light-label {
    font-size: 0.55rem;
    color: var(--sf-primary, #00d2ff);
    text-align: center;
    line-height: 1.2;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .light-btn.light-off .light-label { color: rgba(255,255,255,0.25); }

  /* ── Shared: power button ─────────────────────────────── */
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
  .header-power svg { width: 18px; height: 18px; }

  /* ── Empty state ──────────────────────────────────────── */
  .empty-state {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    color: rgba(255,255,255,0.3);
    font-size: 0.8rem;
  }
`;
