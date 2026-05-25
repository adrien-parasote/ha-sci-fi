/**
 * Shared CSS design tokens for all sci-fi cards.
 * Uses CSS custom properties for theming compatibility with HA frontend.
 */

import { css } from 'lit';

export const sciFiCommonStyles = css`
  :host {
    /* ── Color tokens ─────────────────────────────── */
    --sf-primary: var(--primary-color, #00d2ff);
    --sf-primary-dim: color-mix(in srgb, var(--sf-primary) 40%, transparent);
    --sf-bg: var(--ha-card-background, rgba(10, 14, 26, 0.92));
    --sf-bg-secondary: rgba(255, 255, 255, 0.04);
    --sf-border: rgba(0, 210, 255, 0.15);
    --sf-text-primary: var(--primary-text-color, #e0e8ff);
    --sf-text-secondary: var(--secondary-text-color, rgba(224, 232, 255, 0.6));
    --sf-text-disabled: rgba(224, 232, 255, 0.3);
    --sf-accent-on: #00ff9d;
    --sf-accent-off: rgba(224, 232, 255, 0.25);
    --sf-error: #ff4d6d;
    --sf-warning: #ffd60a;

    /* ── Layout tokens ───────────────────────────── */
    --sf-radius: 12px;
    --sf-radius-sm: 6px;
    --sf-spacing-xs: 4px;
    --sf-spacing-sm: 8px;
    --sf-spacing-md: 16px;
    --sf-spacing-lg: 24px;

    /* ── Typography ──────────────────────────────── */
    --sf-font-family: var(--paper-font-body1_-_font-family, 'Inter', system-ui, sans-serif);
    --sf-font-size-sm: 0.75rem;
    --sf-font-size-base: 0.875rem;
    --sf-font-size-lg: 1rem;
    --sf-font-size-xl: 1.25rem;

    /* ── Animation ───────────────────────────────── */
    --sf-transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
    --sf-transition-base: 250ms cubic-bezier(0.4, 0, 0.2, 1);

    /* ── Panel mode support ──────────────────────── */
    /* display:block + height:100% allows the card to fill its HA Panel
       container (100vh). In normal dashboard mode the parent controls
       the height, so these have no visual effect there. */
    display: block;
    height: 100%;
    box-sizing: border-box;
  }

  /* ── Card wrapper ──────────────────────────────────────────────────────── */
  ha-card {
    /* Force block layout so ha-card fills its parent width even when rendered
       as an unknown custom element (workbench). Without this, display:inline
       makes the container query report content-width (~668px) instead of
       the device-frame width (430px), breaking all mobile breakpoints. */
    display: block;
    width: 100%;
    background: var(--sf-bg);
    border: 1px solid var(--sf-border);
    border-radius: var(--sf-radius);
    font-family: var(--sf-font-family);
    color: var(--sf-text-primary);
    /* Panel mode: fill host height and enable internal scroll */
    height: 100%;
    box-sizing: border-box;
    overflow-y: auto;
    /* Container queries: responsive breakpoints react to the card width,
       not the viewport. Works in Panel mode AND in workbench device simulation. */
    container-type: inline-size;
    container-name: sf-card;
  }

  /* ── Inner container (used by all sci-fi cards) ────────────────────────── */
  .container {
    background-color: black;
  }

  /* ── Section header ────────────────────────────────────────────────────── */
  .sf-header {
    display: flex;
    align-items: center;
    gap: var(--sf-spacing-sm);
    padding: var(--sf-spacing-md);
    border-bottom: 1px solid var(--sf-border);
    font-size: var(--sf-font-size-lg);
    font-weight: 600;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: var(--sf-primary);
  }

  /* ── State indicators ──────────────────────────────────────────────────── */
  .sf-state-on {
    color: var(--sf-accent-on);
  }

  .sf-state-off {
    color: var(--sf-accent-off);
  }

  .sf-state-unavailable {
    color: var(--sf-text-disabled);
    opacity: 0.5;
  }

  /* ── Error card ────────────────────────────────────────────────────────── */
  .sf-error-card {
    display: flex;
    align-items: center;
    gap: var(--sf-spacing-sm);
    padding: var(--sf-spacing-md);
    color: var(--sf-error);
    font-size: var(--sf-font-size-base);
  }

  .sf-error-icon {
    font-size: 1.25rem;
  }

  /* ── Interactive elements ──────────────────────────────────────────────── */
  button, [role="button"] {
    cursor: pointer;
    transition: background var(--sf-transition-fast), color var(--sf-transition-fast);
  }

  button:focus-visible, [role="button"]:focus-visible {
    outline: 2px solid var(--sf-primary);
    outline-offset: 2px;
  }
`;

export const sciFiEditorStyles = css`
  :host {
    display: block;
    font-family: var(--sf-font-family, 'Inter', system-ui, sans-serif);
  }

  .editor-row {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 16px;
  }

  .editor-label {
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--secondary-text-color);
  }

  ha-textfield, ha-select {
    width: 100%;
  }
`;
