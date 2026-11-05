/**
 * CSS blocks shared by several editor inputs — one definition, composed
 * into each component's `static styles` (a later block overrides it).
 */
import { css } from 'lit';

/** Chips layout shared by <sf-editor-chips> and <sf-editor-multi-entity>. */
export const editorChipsStyles = css`
  .container {
    flex-direction: column;
    height: fit-content;
    min-height: 56px;
    padding: 6px 12px;
    align-items: flex-start;
  }

  .chips-row {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    width: 100%;
    margin-bottom: 4px;
  }

  .chip {
    display: flex;
    align-items: center;
    gap: 4px;
    background: var(--editor-chip-bg, rgba(0, 210, 255, 0.12));
    border: 1px solid var(--editor-chip-border, rgba(0, 210, 255, 0.25));
    border-radius: 12px;
    font-size: 0.75rem;
    color: var(--editor-text, #e0e8ff);
  }

  .chip-delete {
    background: none;
    border: none;
    color: var(--editor-text-secondary, rgba(224, 232, 255, 0.6));
    cursor: pointer;
    font-size: 0.7rem;
    padding: 0 2px;
    border-radius: 50%;
    transition: color 150ms, background 150ms;
  }

  .chip-delete:hover {
    color: var(--editor-error, #ff4444);
    background: var(--editor-error-soft, rgba(255, 68, 68, 0.12));
  }

  .input-group {
    width: 100%;
    padding: 8px 0 4px 0;
  }
`;

/** Framed panel shared by <sf-editor-action> and <sf-editor-source-list>. */
export const editorPanelStyles = css`
  :host {
    display: block;
    width: 100%;
    margin-bottom: 12px;
  }

  .container {
    background: var(--editor-surface, rgba(255, 255, 255, 0.02));
    border: 1px solid var(--editor-accent-border, rgba(0, 210, 255, 0.2));
    border-radius: 8px;
    padding: 12px;
    box-sizing: border-box;
    width: 100%;
  }

  .label {
    font-size: 0.875rem;
    color: var(--editor-accent, #00d2ff);
    font-weight: 500;
  }
`;
