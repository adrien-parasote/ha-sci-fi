/**
 * styles.ts — Bridge Overview card styles
 * Spec: docs/specs/cards/bridge.md §Responsive Layout
 * ADR-B02: Container queries (pas media queries)
 * ADR-B03: CREW + CALL KIDS full-width toujours
 */
import { css } from 'lit';

export const bridgeStyles = css`
  /* ── Bridge background overrides ─────────────────────────────────────────── */
  /* Force black card background regardless of HA theme.
   * --sf-bg         → ha-card background (common.ts: line 60)
   * --sf-bg-secondary → bridge-section panel background (styles.ts: line 58)
   */
  :host {
    /* Bridge-only names, one consumer (ADR-018 option B, ha-sci-fi-yj6): they keep the
       render the bridge always had, distinct from --sf-text-primary / --sf-font-family. */
    --sf-text: #e0e0e0;
    --sf-font: 'Inter', sans-serif;
    --sf-bg: #000000;
    --sf-bg-secondary: rgba(255,255,255,0.04);   /* panels: très légèrement visibles sur le noir */
  }

  .bridge-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--sf-spacing-sm, 8px);
    padding: var(--sf-spacing-md, 16px);
  }

  /* ≥ 600px : mode 2 colonnes Pinterest — COLUMN FLOW (container query — ADR-016,
   * qui remplace la clause de layout d'ADR-013)
   * Clé : display:block + columns:2 = les éléments remplissent la colonne gauche
   * de haut en bas, puis la colonne droite. Pas de row-flow grid.
   */
  @container sf-card (min-width: 600px) {
    .bridge-grid {
      display: block;                           /* quitte le mode grid */
      columns: 2;
      column-gap: var(--sf-spacing-sm, 8px);
      padding: var(--sf-spacing-md, 16px);
      gap: unset;
    }

    /* Chaque section : block + break interdit + marge basse */
    .bridge-grid > * {
      break-inside: avoid;
      display: block;
      margin-bottom: var(--sf-spacing-sm, 8px);
      box-sizing: border-box;
    }

    /* Restaurer le style individuel des sections (bord-radius, border) */
    .bridge-section {
      border-radius: var(--sf-radius, 12px);
      border: 1px solid var(--sf-border, rgba(0, 210, 255, 0.15));
    }

    /* Sections full-width : couvrent les 2 colonnes + espace au-dessus */
    .full-width {
      column-span: all;
      margin-top: var(--sf-spacing-sm, 8px);
    }
  }

  /* CREW + CALL KIDS : toujours pleine largeur (ADR-B03) */
  .full-width {
    grid-column: 1 / -1;   /* utilisé seulement en portrait (grid) */
  }

  /* Section card style */
  .bridge-section {
    background: var(--sf-bg-secondary, rgba(255,255,255,0.04));
    border: 1px solid var(--sf-border, rgba(0, 210, 255, 0.15));
    border-radius: var(--sf-radius, 12px);
    padding: var(--sf-spacing-md, 16px);
  }

  /* Card title header — same format as TV remote .header-text */
  .bridge-card-title {
    font-size: 0.85rem;
    font-weight: 600;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: var(--sf-glow-cyan, hsl(190, 100%, 50%));
    text-shadow: 0 0 6px var(--sf-glow-cyan, hsl(190, 100%, 50%));
    padding: var(--sf-spacing-md, 16px) var(--sf-spacing-md, 16px) 0;
    border-bottom: 1px solid var(--sf-border, rgba(0, 210, 255, 0.15));
    padding-bottom: var(--sf-spacing-sm, 8px);
    margin-bottom: 0;
  }

  /* Section title */
  .bridge-section-title {
    display: flex;
    align-items: center;
    gap: var(--sf-spacing-xs, 4px);
    font-size: var(--sf-font-size-sm, 12px);
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--sf-primary, #00d2ff);
    padding-bottom: var(--sf-spacing-xs, 4px);
    margin-bottom: var(--sf-spacing-sm, 8px);
    border-bottom: 1px solid var(--sf-border, rgba(0, 210, 255, 0.15));
  }

  /* ── Crew — halo glow + icône colorée (like hexa tile) ——— */
  .crew-row {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 16px;
  }

  .crew-badge {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    min-width: 56px;
  }

  /* Avatar wrap — halo via box-shadow uniquement (pas de fond coloré) */
  .crew-avatar-wrap {
    position: relative;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    box-sizing: border-box;
  }

  /* Halo glow : anneau fin + lueur diffuse.
     Every ring-* rule reads --ring-color, set inline from ringColor(), so the
     Zone → couleur mapping has ONE source of truth. Each fallback repeats that
     row's token, keeping the rule correct on its own. */
  .crew-avatar-wrap.ring-home {
    box-shadow:
      0 0 0 2px var(--ring-color, var(--sf-accent-on, #00ff9d)),
      0 0 10px 0px var(--ring-color, var(--sf-accent-on, #00ff9d));
  }
  .crew-avatar-wrap.ring-away {
    box-shadow: 0 0 0 2px var(--ring-color, var(--sf-accent-off, rgba(224, 232, 255, 0.25)));
  }
  .crew-avatar-wrap.ring-other {
    box-shadow:
      0 0 0 2px var(--ring-color, var(--sf-primary, #00d2ff)),
      0 0 10px 0px var(--ring-color, var(--sf-primary, #00d2ff));
  }
  /* unavailable / unknown : no zone is known, so no diffuse glow either —
     a thin desaturated ring only. */
  .crew-avatar-wrap.ring-unknown {
    box-shadow: 0 0 0 2px var(--ring-color, var(--sf-text-disabled, rgba(224, 232, 255, 0.3)));
  }

  /* Inner circle — photo ou icône directement, sans fond */
  .crew-avatar {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    overflow: hidden;
    background: var(--sf-bg-secondary);   /* très léger pour le fallback icône */
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .crew-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  /* Zone icon — top-right overlay: just the icon, no circle wrapper */
  .crew-zone-badge {
    position: absolute;
    top: -2px;
    right: -2px;
    width: 14px;
    height: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    /* NO background, NO border, NO border-radius — icon only */
  }

  /* ── Alerts ── */
  .alerts-smoke-row {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 8px;
    justify-content: center;  /* spec: elements centred */
    margin-bottom: 8px;
  }

  .smoke-chip {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 8px;
    border-radius: var(--sf-radius, 12px);
    border: 1px solid var(--sf-border, rgba(0, 210, 255, 0.15));
    font-size: 0.75rem;
  }

  .smoke-chip.smoke-ok { color: var(--sf-accent-on, #00ff9d); }
  .smoke-chip.smoke-unknown { color: var(--sf-text-disabled, rgba(224, 232, 255, 0.3)); }
  .smoke-chip.smoke-active { color: var(--sf-error, #ff4d6d); border-color: var(--sf-error, #ff4d6d); }

  .alerts-toggles-row {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-bottom: 8px;
  }

  .toggle-row {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 8px;
    padding: 4px 0;
  }

  .toggle-name { flex: 1; font-size: 0.875rem; transition: color 0.2s; }
  .toggle-on  { color: var(--sf-text, #e0e0e0); }
  .toggle-off { color: var(--sf-text-disabled, rgba(224, 232, 255, 0.3)); }
  .toggle-unknown { color: var(--sf-text-disabled, rgba(224, 232, 255, 0.3)); }

  .occupancy-badge {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 4px;
  }

  .occupancy-pill {
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    padding: 2px 10px;
    border-radius: 12px;
    margin-left: auto;   /* float right */
  }

  .occupancy-pill.occupied {
    background: color-mix(in srgb, var(--sf-accent-on, #00ff9d) 15%, transparent);
    color: var(--sf-accent-on, #00ff9d);
    border: 1px solid var(--sf-accent-on, #00ff9d);
  }

  .occupancy-pill.unknown {
    color: var(--sf-text-disabled, rgba(224, 232, 255, 0.3));
    border: 1px solid var(--sf-text-disabled, rgba(224, 232, 255, 0.3));
  }

  .occupancy-pill.empty {
    background: color-mix(in srgb, var(--sf-text-disabled, rgba(224, 232, 255, 0.3)) 15%, transparent);
    color: var(--sf-text-disabled, rgba(224, 232, 255, 0.3));
    border: 1px solid var(--sf-text-disabled, rgba(224, 232, 255, 0.3));
  }

  /* ── Access ── */
  .access-entry {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 8px;
    padding: 6px 0;
    border-bottom: 1px solid var(--sf-border, rgba(0, 210, 255, 0.15));
  }

  .access-entry:last-child { border-bottom: none; }

  /* Left block: icon + info stacked (crew-badge style) */
  .access-identity {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 8px;
    flex: 1;
  }

  .access-icon-wrap {
    width: 36px;
    height: 36px;
    border-radius: var(--sf-radius, 12px);
    background: var(--sf-bg-secondary, rgba(255,255,255,0.06));
    border: 1px solid var(--sf-border, rgba(0, 210, 255, 0.15));
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .access-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
    align-items: flex-start;   /* prevent children from stretching full width */
  }

  .access-name {
    font-size: 0.875rem;
    color: var(--sf-text, #e0e0e0);
    font-weight: 500;
  }

  /* Status tag below name — pill style, auto-width (hugs label) */
  .access-state-tag {
    font-size: 0.65rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    padding: 1px 7px;
    border-radius: 999px;
    border: 1px solid currentColor;
    background: color-mix(in srgb, currentColor 12%, transparent);
    display: inline-block;
    width: fit-content;
    align-self: flex-start;  /* never stretch across full parent column */
  }

  .state-closed      { color: var(--sf-accent-on, #00ff9d); }
  .state-open        { color: var(--sf-warning, #ffd60a); }
  .state-moving      { color: var(--sf-primary, #00d2ff); }
  .state-unavailable { color: var(--sf-text-disabled, rgba(224, 232, 255, 0.3)); }

  /* Right block: small icon buttons + lock indicator */
  .access-actions {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 4px;
    flex-shrink: 0;
  }

  /* Access action buttons — larger for touch (screen 3) */
  .access-btn {
    background: transparent;
    border: 1px solid var(--sf-border, rgba(0, 210, 255, 0.15));
    border-radius: var(--sf-radius, 12px);
    padding: 8px;
    cursor: pointer;
    color: var(--sf-text, #e0e0e0);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.15s, border-color 0.15s;
    --icon-width: 20px;
    --icon-height: 20px;
    min-width: 40px;
    min-height: 40px;
  }

  .access-btn:hover {
    background: rgba(0,210,255,0.08);
    border-color: var(--sf-primary, #00d2ff);
  }

  .access-btn:active {
    background: var(--sf-border);
  }

  .access-btn.disabled {
    opacity: 0.3;
    pointer-events: none;
  }

  /* Lock button wrapping the state icon */
  .lock-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 4px;
    background: transparent;
    border: none;
    border-radius: var(--sf-radius, 12px);
    cursor: pointer;
  }

  .lock-btn:hover:not([disabled]) {
    background: var(--sf-primary-dim, color-mix(in srgb, var(--sf-primary) 40%, transparent));
  }

  .lock-btn[disabled] {
    cursor: default;
  }

  .lock-locked      { color: var(--sf-accent-on, #00ff9d); --icon-width: 20px; --icon-height: 20px; }
  .lock-unlocked    { color: var(--sf-error, #ff4d6d);    --icon-width: 20px; --icon-height: 20px; }
  .lock-unknown     { color: var(--sf-text-disabled, rgba(224, 232, 255, 0.3)); --icon-width: 20px; --icon-height: 20px; }
  .lock-unavailable { color: var(--sf-text-disabled, rgba(224, 232, 255, 0.3)); --icon-width: 20px; --icon-height: 20px; }
  .lock-pending     { color: var(--sf-primary, #00d2ff);  --icon-width: 20px; --icon-height: 20px; }
  .lock-jammed      { color: var(--sf-warning, #ffd60a);  --icon-width: 20px; --icon-height: 20px; }

  /* ── Automations ── */
  .auto-row {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 8px;
    padding: 4px 0;
    border-bottom: 1px solid var(--sf-border, rgba(0, 210, 255, 0.15));
  }

  .auto-row:last-child { border-bottom: none; }

  .auto-name {
    flex: 1;
    font-size: 0.875rem;
    transition: color 0.2s;
  }
  /* auto-name also reuses toggle-on/toggle-off classes */
  .auto-name.toggle-on  { color: var(--sf-text, #e0e0e0); }
  .auto-name.toggle-off { color: var(--sf-text-disabled, rgba(224, 232, 255, 0.3)); }

  /* Custom toggle switch (remplace ha-switch non dispo hors HA) */
  .sf-toggle {
    position: relative;
    width: 36px;
    height: 20px;
    flex-shrink: 0;
    cursor: pointer;
    background: transparent;
    border: none;
    padding: 0;
  }

  .sf-toggle-track {
    width: 36px;
    height: 20px;
    border-radius: 10px;
    background: var(--sf-bg-secondary, rgba(255,255,255,0.1));
    border: 1.5px solid var(--sf-border, rgba(0, 210, 255, 0.15));
    transition: background 0.2s, border-color 0.2s;
    position: relative;
    display: flex;
    align-items: center;
  }

  .sf-toggle-thumb {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: var(--sf-text-disabled, rgba(224, 232, 255, 0.3));
    position: absolute;
    left: 2px;
    transition: transform 0.2s, background 0.2s;
  }

  .sf-toggle[data-on="true"] .sf-toggle-track {
    background: color-mix(in srgb, var(--sf-accent-on, #00ff9d) 20%, transparent);
    border-color: var(--sf-accent-on, #00ff9d);
  }

  .sf-toggle[data-on="true"] .sf-toggle-thumb {
    background: var(--sf-accent-on, #00ff9d);
    transform: translateX(16px);
  }

  .slider-row {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 4px 0;
    border-bottom: 1px solid var(--sf-border, rgba(0, 210, 255, 0.15));
  }

  .slider-row:last-child { border-bottom: none; }

  .slider-header {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 8px;
  }

  .slider-value {
    font-size: 0.75rem;
    font-weight: 700;
    color: var(--sf-primary, #00d2ff);
  }

  input[type='range'] {
    width: 100%;
    accent-color: var(--sf-primary, #00d2ff);
    cursor: pointer;
  }

  /* ── Appliances ── */
  .appliances-cycles {
    display: flex;
    flex-direction: row;
    gap: 8px;
    justify-content: space-evenly;
    flex-wrap: wrap;
    margin-bottom: 8px;
  }

  .cycle-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    flex: 1;
    min-width: 64px;
    max-width: 90px;
  }

  /* Square tile with icon — matches mockup */
  .cycle-icon-wrap {
    width: 64px;
    height: 64px;
    border-radius: var(--sf-radius, 12px);
    background: var(--sf-bg-secondary, rgba(255,255,255,0.06));
    border: 1.5px solid var(--sf-border, rgba(0, 210, 255, 0.15));
    display: flex;
    align-items: center;
    justify-content: center;
    transition: border-color 0.2s, box-shadow 0.2s;
    --icon-width: 28px;
    --icon-height: 28px;
  }

  .cycle-running {
    border-color: var(--sf-primary, #00d2ff);
    animation: cycle-pulse 1.5s ease-in-out infinite;
  }

  @keyframes cycle-pulse {
    0%, 100% { box-shadow: 0 0 4px var(--sf-primary, #00d2ff); }
    50%       { box-shadow: 0 0 14px var(--sf-primary, #00d2ff); }
  }

  .cycle-name {
    font-size: 0.75rem;
    font-weight: 500;
    color: var(--sf-text, #e0e0e0);  /* white, not grey */
    text-align: center;
  }

  .cycle-status {
    font-size: 0.65rem;
    font-weight: 600;
    text-transform: lowercase;
  }

  .cycle-status.running { color: var(--sf-primary, #00d2ff); }
  .cycle-status.unknown { color: var(--sf-text-disabled, rgba(224, 232, 255, 0.3)); }
  .cycle-status.idle    { color: var(--sf-text-disabled, rgba(224, 232, 255, 0.3)); }

  .consumables-row {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 8px;
    justify-content: center;  /* spec: consumable-chip centered */
  }

  .consumable-chip {
    font-size: 0.75rem;
    font-weight: 700;
    padding: 2px 8px;
    border-radius: 12px;
    border: 1px solid currentColor;
  }

  .consumable-ok { color: var(--sf-accent-on, #00ff9d); }
  .consumable-unknown { color: var(--sf-text-disabled, rgba(224, 232, 255, 0.3)); }
  .consumable-warn { color: var(--sf-error, #ff4d6d); }

  /* ── Stove ── */

  /* Status row: icon + chip */
  .stove-status-row {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 8px;
    padding: 4px 0 10px;
  }

  .stove-status-chip {
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
    padding: 2px 10px;
    border-radius: 12px;
    border: 1px solid currentColor;
    letter-spacing: 0.05em;
  }

  .stove-on  { color: var(--sf-warning, #ffd60a); }
  .stove-off { color: var(--sf-text-disabled, rgba(224, 232, 255, 0.3)); }
  .stove-pellet-placeholder,
  .stove-stock-placeholder { color: var(--sf-text-disabled, rgba(224, 232, 255, 0.3)); font-weight: 700; }

  /* Graphs row — flex row, centered */
  .stove-graphs-row {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-evenly;
    gap: 16px;
  }

  /* Fixed-size wrappers — forces SVG components to a defined box, no background */
  .stove-graph-wrap {
    flex-shrink: 0;
    overflow: hidden;
    background: transparent;
  }

  /* Circle gauge — smaller for bridge card */
  .stove-circle-wrap {
    width: 80px;
    height: 95px; /* SVG square + label line below */
  }

  /* Stack bar — narrower for bridge card */
  .stove-stack-wrap {
    width: 52px;
    height: 100px; /* 20 bars + label */
  }

  /* ── Vehicle ── */
  .vehicle-body {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    gap: 12px;
  }

  .vehicle-right {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
  }

  .vehicle-power-row {
    display: flex;
    flex-direction: row;
    align-items: baseline;
    gap: 4px;
  }

  .vehicle-power-value {
    font-size: 1.4rem;
    font-weight: 700;
    line-height: 1;
    letter-spacing: -0.02em;
  }

  .vehicle-power-value.charging { color: var(--sf-accent-on, #00ff9d); }
  .vehicle-power-value.idle     { color: var(--sf-text-secondary, rgba(224, 232, 255, 0.6)); }

  .vehicle-status-label {
    font-size: 0.8rem;
    color: var(--sf-text-secondary, rgba(224, 232, 255, 0.6));
  }

  .vehicle-entity-name {
    font-size: 0.7rem;
    color: var(--sf-text-disabled, rgba(224, 232, 255, 0.3));
    padding: 1px 8px;
    border-radius: 999px;
    border: 1px solid var(--sf-border, rgba(0, 210, 255, 0.15));
    align-self: flex-start;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }

  .spin {
    animation: spin 0.8s linear infinite;
  }

  /* ── Actions panel ── */

  /* Responsive grid: 2 cols minimum, wraps if more items */
  .actions-grid {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 8px;
    padding-top: 4px;
  }

  /* Each action button: sci-fi glowing pill */
  .action-btn {
    flex: 1;
    min-width: 80px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 10px 8px;
    border-radius: var(--sf-radius, 12px);
    border: 1px solid var(--action-color, var(--sf-primary, #00d2ff));
    background: color-mix(in srgb, var(--action-color, var(--sf-primary, #00d2ff)) 8%, transparent);
    color: var(--action-color, var(--sf-primary, #00d2ff));
    font-family: var(--sf-font, 'Inter', sans-serif);
    font-size: 0.72rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    cursor: pointer;
    transition: background 0.15s ease, box-shadow 0.15s ease;
    box-shadow: inset 0 0 0 0 var(--action-color, var(--sf-primary, #00d2ff));
  }

  .action-btn:hover {
    background: color-mix(in srgb, var(--action-color, var(--sf-primary, #00d2ff)) 16%, transparent);
    box-shadow: 0 0 10px color-mix(in srgb, var(--action-color, var(--sf-primary, #00d2ff)) 30%, transparent);
  }

  .action-btn:active {
    background: color-mix(in srgb, var(--action-color, var(--sf-primary, #00d2ff)) 28%, transparent);
  }

  .action-btn[disabled] {
    opacity: 0.45;
    pointer-events: none;
  }

  .action-label {
    font-size: 0.68rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
  }
`;
