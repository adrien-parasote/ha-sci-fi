import { css } from 'lit';

export const waterStyles = css`
  /* ── Host / Card shell ───────────────────────────────── */
  :host {
    --water-on-color: #00d2ff;
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
    --icon-color: rgba(224,232,255,0.35);
    display: block;
  }
  .floor-hexa[data-active="true"] .hexa-content sf-icon {
    --icon-color: var(--sf-primary, #00d2ff);
  }
  .floor-hexa .floor-name {
    font-size: 0.48rem;
    font-weight: 600;
    color: rgba(224,232,255,0.35);
    margin-top: 2px;
    text-align: center;
    max-width: 90%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .floor-hexa[data-active="true"] .floor-name { color: var(--sf-primary, #00d2ff); }

  /* ── Floor info panel ─────────────────────────────────── */
  .floor-content {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid rgba(0,210,255,0.15);
    border-top: 1px solid rgba(0,210,255,0.15);
    padding: 10px 14px;
    margin: 0;
    background-color: rgba(13, 17, 23, 0.6);
  }
  .floor-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex: 1;
    color: var(--sf-primary, #00d2ff);
  }
  .floor-info.floor-off { color: rgba(224,232,255,0.4); }
  .floor-title {
    font-size: 0.9rem;
    font-weight: bold;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .floor-sync-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    color: var(--sf-primary, #00d2ff);
    opacity: 0.6;
    transition: opacity 0.2s;
    flex-shrink: 0;
  }
  .floor-sync-btn:hover {
    opacity: 1;
  }
  .floor-sync-btn.syncing ha-icon {
    animation: spin 1s linear infinite;
  }
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  /* ── Entities List Section ────────────────────────────── */
  .entities-section {
    display: flex;
    flex-direction: column;
    flex: 1;
    padding: 10px 15px;
    background-color: black;
    gap: 15px;
    overflow-y: auto;
  }

  .device-group {
    background: rgba(13, 17, 23, 0.4);
    border: 1px solid rgba(0, 210, 255, 0.15);
    border-radius: 8px;
    padding: 12px;
    margin-bottom: 12px;
  }

  .entity-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 15px;
    border: 1px solid var(--sf-primary, #00d2ff);
    border-radius: 6px;
    background: transparent;
    transition: background 0.15s, border-color 0.15s, box-shadow 0.15s;
    box-sizing: border-box;
    /* Sci-fi corner decoration */
    mask:
      conic-gradient(#000 0 0) content-box,
      conic-gradient(
        at var(--corner-size) var(--corner-size),
        #0000 75%,
        #000 0
      )
      0 0 / calc(100% - var(--corner-size)) calc(100% - var(--corner-size));
  }

  .entity-row.row-off {
    border-color: rgba(255,255,255,0.15);
  }
  
  .entity-row:hover {
    box-shadow: 0 0 8px rgba(0,210,255,0.35);
  }

  .entity-info {
    display: flex;
    align-items: center;
    gap: 15px;
    flex: 1;
    min-width: 0;
  }

  .entity-info sf-icon, .entity-info ha-state-icon {
    --icon-width: 24px;
    --icon-height: 24px;
    --icon-color: var(--water-on-color);
    --state-icon-color: var(--water-on-color);
    color: var(--water-on-color);
    flex-shrink: 0;
  }
  
  .entity-row.row-off sf-icon, .entity-row.row-off ha-state-icon {
    --icon-color: rgba(255,255,255,0.3);
    --state-icon-color: rgba(255,255,255,0.3);
    color: rgba(255,255,255,0.3);
  }

  .entity-name {
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--sf-primary, #00d2ff);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1.2;
  }
  
  .entity-text {
    display: flex;
    flex-direction: column;
    justify-content: center;
    overflow: hidden;
  }

  .entity-domain {
    font-size: 0.5rem;
    font-weight: 700;
    letter-spacing: 0.5px;
    color: rgba(255, 255, 255, 0.4);
    margin-top: 2px;
  }
  
  .entity-row.row-off .entity-name {
    color: rgba(255,255,255,0.5);
  }

  .entity-state {
    font-size: 0.75rem;
    color: rgba(255,255,255,0.7);
    margin-right: 15px;
  }
  
  .entity-state.state-active {
    color: var(--sf-primary, #00d2ff);
    text-shadow: 0 0 5px var(--sf-primary, #00d2ff);
  }

  .entity-controls {
    display: flex;
    align-items: center;
    min-width: 40px;
    text-align: right;
  }
  
  select.sf-select {
    background: rgba(0, 0, 0, 0.5);
    color: var(--sf-color-cyan, #00d2ff);
    border: 1px solid rgba(0, 210, 255, 0.3);
    border-radius: 4px;
    padding: 4px 8px;
    font-family: var(--sf-font-body, monospace);
    font-size: 0.8rem;
    outline: none;
    cursor: pointer;
  }
  select.sf-select option {
    background: #0d1117;
    color: #fff;
  }
  select.sf-select:hover:not([disabled]), select.sf-select:focus:not([disabled]) {
    border-color: rgba(0, 210, 255, 0.8);
  }
  select.sf-select[disabled] {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* ── Footer / Actions ────────────────────────────── */
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

  /* ── Empty state ──────────────────────────────────────── */
  .empty-state {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    color: rgba(255,255,255,0.3);
    font-size: 0.8rem;
    text-align: center;
  }

  /* ── Automation History Log Console ───────────────────── */
  .log-console {
    margin-top: 15px;
    padding: 12px;
    background: rgba(13, 17, 23, 0.7);
    border: 1px dashed rgba(0, 210, 255, 0.2);
    border-radius: 6px;
    font-family: var(--sf-font-mono, monospace);
    box-sizing: border-box;
    text-align: left;
  }

  .log-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    border-bottom: 1px solid rgba(0, 210, 255, 0.15);
    padding-bottom: 6px;
  }

  .log-title {
    font-size: 0.7rem;
    font-weight: bold;
    letter-spacing: 1px;
    color: var(--sf-primary, #00d2ff);
    text-shadow: 0 0 4px rgba(0, 210, 255, 0.5);
  }

  .log-filters {
    display: flex;
    gap: 6px;
  }

  .log-filter-btn {
    background: transparent;
    border: 1px solid rgba(0, 210, 255, 0.25);
    color: rgba(255, 255, 255, 0.5);
    font-size: 0.6rem;
    padding: 2px 6px;
    cursor: pointer;
    border-radius: 3px;
    transition: all 0.15s ease-in-out;
  }

  .log-filter-btn.active, .log-filter-btn:hover {
    border-color: var(--sf-primary, #00d2ff);
    color: var(--sf-primary, #00d2ff);
    background: rgba(0, 210, 255, 0.08);
    box-shadow: 0 0 5px rgba(0, 210, 255, 0.2);
  }

  .log-timeline {
    display: flex;
    flex-direction: column;
    gap: 6px;
    max-height: 220px;
    overflow-y: auto;
    padding-right: 4px;
  }

  /* Custom scrollbar for timeline */
  .log-timeline::-webkit-scrollbar {
    width: 4px;
  }
  .log-timeline::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.3);
  }
  .log-timeline::-webkit-scrollbar-thumb {
    background: rgba(0, 210, 255, 0.3);
    border-radius: 2px;
  }

  .log-entry {
    display: flex;
    flex-direction: column;
    font-size: 0.7rem;
    line-height: 1.4;
    padding: 4px 4px 4px 8px;
    border-left: 2px solid rgba(255, 255, 255, 0.1);
    transition: background 0.15s;
    box-sizing: border-box;
    gap: 1px;
  }

  .log-meta {
    display: flex;
    gap: 6px;
    align-items: center;
    flex-shrink: 0;
  }

  .log-time {
    color: rgba(255, 255, 255, 0.4);
    white-space: nowrap;
  }

  .log-badge {
    font-weight: bold;
    padding: 0 4px;
    border-radius: 2px;
    font-size: 0.55rem;
    letter-spacing: 0.5px;
    white-space: nowrap;
  }

  .log-content {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .log-text {
    color: rgba(224, 232, 255, 0.85);
    white-space: normal;
    word-break: break-word;
    overflow-wrap: anywhere;
  }

  .empty-log {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 15px 0;
    color: rgba(255, 255, 255, 0.3);
    font-size: 0.7rem;
    text-align: center;
  }

  /* ── Cyber Scanner Loading State ──────────────────────── */
  .log-scanner {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 20px 0;
    gap: 10px;
    overflow: hidden;
    color: var(--sf-primary, #00d2ff);
    font-size: 0.65rem;
    letter-spacing: 1px;
    text-shadow: 0 0 4px rgba(0, 210, 255, 0.4);
  }

  .scanner-bar {
    width: 60px;
    height: 2px;
    background: var(--sf-primary, #00d2ff);
    box-shadow: 0 0 8px var(--sf-primary, #00d2ff);
    animation: scanning 1.5s infinite ease-in-out;
  }

  /* Log Status Themes */
  .log-entry[data-status="success"] {
    border-left-color: #00ffaa;
  }
  .log-entry[data-status="success"] .log-badge {
    background: rgba(0, 255, 170, 0.1);
    color: #00ffaa;
    border: 1px solid rgba(0, 255, 170, 0.25);
  }

  .log-entry[data-status="running"] {
    border-left-color: var(--sf-primary, #00d2ff);
  }
  .log-entry[data-status="running"] .log-badge {
    background: rgba(0, 210, 255, 0.1);
    color: var(--sf-primary, #00d2ff);
    border: 1px solid rgba(0, 210, 255, 0.25);
    animation: pulse 1.5s infinite alternate;
  }

  .log-entry[data-status="warning"] {
    border-left-color: #ffaa00;
  }
  .log-entry[data-status="warning"] .log-badge {
    background: rgba(255, 170, 0, 0.1);
    color: #ffaa00;
    border: 1px solid rgba(255, 170, 0, 0.25);
    text-shadow: 0 0 3px rgba(255, 170, 0, 0.4);
  }

  @keyframes pulse {
    0% { box-shadow: 0 0 2px rgba(0, 210, 255, 0.1); }
    100% { box-shadow: 0 0 6px rgba(0, 210, 255, 0.4); }
  }

  @keyframes scanning {
    0%, 100% { transform: translateY(-5px); opacity: 0.3; }
    50% { transform: translateY(5px); opacity: 1; }
  }
`;

