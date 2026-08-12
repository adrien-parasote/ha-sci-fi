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

  /* ── Header ─────────────────────────────────────────── */
  /* ── Floors row (hexa) ───────────────────────────────── */
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

