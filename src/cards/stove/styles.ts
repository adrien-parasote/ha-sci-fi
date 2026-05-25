/**
 * src/cards/stove/styles.ts
 * Stove card design styles — Spec 11 (11_stove_card_design_update.md)
 * Extracted from sci-fi-stove.ts following the climates/styles.ts pattern.
 */

import { css } from 'lit';

export const stoveStyles = css`
  :host {
    font-size: var(--sf-text-sm, 12px);
    height: 100%;
    width: 100%;
  }

  ha-card {
    background: rgba(39, 40, 43, 0.3) !important;
    border: none !important;
    height: 100%;
    width: 100%;
    display: block;
    box-sizing: border-box;
  }

  /* ─── HEADER ─────────────────────────────────────────── */

  .header {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: var(--sf-spacing-sm, 8px);
    border-top: 1px solid var(--sf-border);
    border-bottom: 1px solid var(--sf-border);
    padding: 8px 12px;
    background-color: transparent;
  }

  .header-icon sf-icon {
    --icon-width: 28px;
    --icon-height: 28px;
    --icon-color: var(--sf-primary);
    display: block;
  }

  .header-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
    flex: 1;
  }

  .stove-name {
    font-size: var(--sf-font-size-base, 0.875rem);
    font-weight: 600;
    color: var(--sf-text-primary);
  }

  /* .stove-status preserved — tests depend on this class */
  .stove-status {
    font-size: var(--sf-font-size-sm, 0.75rem);
  }

  .stove-status.sf-state-on {
    color: #ff6b35;
    text-shadow: 0 0 4px #ff6b35;
  }

  .stove-status.sf-state-off {
    color: var(--sf-accent-off);
  }

  /* ─── CONTAINER ──────────────────────────────────────── */

  .container {
    padding: var(--sf-spacing-sm, 8px) var(--sf-spacing-md, 16px);
  }

  /* ─── SENSOR GRID ────────────────────────────────────── */

  .sensors-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--sf-spacing-sm, 8px);
    margin-top: var(--sf-spacing-sm, 8px);
  }

  /* .sensor-tile preserved — tests depend on this class */
  .sensor-tile {
    background: var(--sf-bg-secondary);
    border: 1px solid var(--sf-border);
    border-radius: var(--sf-radius-sm, 6px);
    padding: var(--sf-spacing-sm, 8px);
    text-align: center;
    transition: border-color 0.2s ease;
  }

  /* .sensor-tile.warn preserved — tests depend on this class */
  .sensor-tile.warn {
    border-color: #ff6b35;
    box-shadow: 0 0 6px rgba(255, 107, 53, 0.3);
  }

  .sensor-value {
    font-size: var(--sf-font-size-xl, 1.25rem);
    font-weight: 700;
    color: var(--sf-primary);
    text-shadow: 0 0 4px var(--sf-primary);
  }

  .sensor-label {
    font-size: var(--sf-font-size-sm, 0.75rem);
    color: var(--sf-text-secondary);
    margin-top: 2px;
  }

  /* ─── PROGRESS BARS ──────────────────────────────────── */

  .bar-bg {
    background: rgba(255, 255, 255, 0.08);
    border-radius: 4px;
    height: 6px;
    overflow: hidden;
    margin-top: 6px;
  }

  /* .bar-fill preserved — tests depend on this class */
  .bar-fill {
    height: 100%;
    border-radius: 4px;
    transition: width var(--sf-transition-base, 250ms);
  }

  /* .bar-fill.pellet preserved — tests depend on this class */
  .bar-fill.pellet {
    background: linear-gradient(90deg, #ff6b35, #ffd60a);
  }

  /* .bar-fill.storage preserved — tests depend on this class */
  .bar-fill.storage {
    background: linear-gradient(90deg, #669cd2, #00ff9d);
  }

  /* ─── RESPONSIVE ─────────────────────────────────────── */

  @container sf-card (max-width: 599px) {
    .sensors-grid {
      grid-template-columns: repeat(2, 1fr);
    }
    .container {
      padding: var(--sf-spacing-sm, 8px);
    }
  }

  @container sf-card (min-width: 600px) {
    .sensors-grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }
`;
