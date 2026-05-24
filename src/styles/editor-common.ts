/**
 * Shared CSS design tokens for all sci-fi card editors.
 * Import this in every card editor: import { sciFiEditorCommonStyles } from '../../styles/editor-common.js';
 */

import { css } from 'lit';

export const sciFiEditorCommonStyles = css`
  :host {
    width: 100%;
    height: 100%;
    display: block;
    --editor-gap: 10px;
    --editor-section-color: var(--secondary-text-color, rgba(224, 232, 255, 0.6));
    --editor-border: var(--divider-color, rgba(0, 210, 255, 0.2));
    --editor-chip-bg: rgba(0, 210, 255, 0.12);
    --editor-chip-color: var(--primary-text-color, #e0e8ff);
    --editor-icon-size: 18px;
  }

  .card {
    position: relative;
    padding: 10px;
    justify-content: center;
    display: flex;
    width: 100%;
    height: fit-content;
    box-sizing: border-box;
  }

  .container {
    display: flex;
    flex-direction: column;
    flex: 1;
    row-gap: var(--editor-gap);
  }

  .container.false {
    display: none;
  }

  section {
    display: flex;
    flex-direction: column;
    gap: var(--editor-gap);
    margin-bottom: var(--editor-gap);
  }

  section h1 {
    font-size: var(--font-size-normal, 0.875rem);
    border-bottom: 1px solid var(--editor-border);
    margin: 10px 0 5px 0;
    padding-bottom: 5px;
    text-transform: capitalize;
    font-weight: 400;
    color: var(--editor-section-color);
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 8px;
  }

  section h1 sf-icon {
    --icon-width: var(--editor-icon-size);
    --icon-height: var(--editor-icon-size);
  }

  .editor {
    display: flex;
    flex-direction: column;
    row-gap: var(--editor-gap);
    flex: 1;
    min-height: 300px;
  }

  .editor.false {
    display: none;
  }

  .editor .head {
    display: flex;
    flex-direction: row;
    column-gap: var(--editor-gap);
    align-items: center;
    margin-bottom: var(--editor-gap);
  }

  .editor .head span {
    flex: 1;
    align-content: center;
    font-size: var(--font-size-normal, 0.875rem);
    color: var(--primary-text-color, #e0e8ff);
  }


  .entity-row {
    display: flex;
    flex-direction: row;
    column-gap: 5px;
    align-items: center;
  }

  .entity-row sf-editor-dropdown-entity {
    flex: 1;
  }

  .add-btn {
    background: none;
    border: 1px dashed var(--editor-border);
    border-radius: 6px;
    color: var(--editor-section-color);
    cursor: pointer;
    padding: 6px 12px;
    font-size: 0.8rem;
    width: 100%;
    text-align: left;
    transition: background 150ms, color 150ms;
  }

  .add-btn:hover {
    background: rgba(0, 210, 255, 0.06);
    color: var(--primary-text-color, #e0e8ff);
  }

  .delete-btn sf-button {
    --btn-icon-color: var(--editor-section-color, #00d2ff);
  }

  .delete-btn sf-button:hover {
    --btn-icon-color: var(--error-color, #ff4444);
  }

  /* Legacy fallback for plain button.delete-btn still in use */
  button.delete-btn {
    background: none;
    border: none;
    color: var(--editor-section-color, #00d2ff);
    cursor: pointer;
    font-size: 0.85rem;
    padding: 4px 6px;
    border-radius: 4px;
    transition: color 150ms;
    flex-shrink: 0;
  }

  button.delete-btn:hover {
    color: var(--error-color, #ff4444);
  }

  .edit-btn {
    background: none;
    border: none;
    color: var(--editor-section-color);
    cursor: pointer;
    font-size: 0.85rem;
    padding: 4px 6px;
    border-radius: 4px;
    transition: background 150ms;
    flex-shrink: 0;
  }

  .edit-btn:hover {
    background: rgba(0, 210, 255, 0.1);
    color: var(--primary-text-color, #e0e8ff);
  }

  .row {
    display: flex;
    flex-direction: row;
    align-items: center;
    column-gap: 5px;
  }

  .row-label {
    flex: 1;
    font-size: 0.85rem;
    color: var(--primary-text-color, #e0e8ff);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .tabs-header {
    display: flex;
    flex-direction: row;
    gap: 4px;
    margin-bottom: 8px;
    border-bottom: 1px solid var(--editor-border);
    padding-bottom: 4px;
  }

  .tab-btn {
    background: none;
    border: none;
    color: var(--editor-section-color);
    cursor: pointer;
    padding: 4px 12px;
    font-size: 0.8rem;
    border-radius: 4px 4px 0 0;
    transition: background 150ms, color 150ms;
  }

  .tab-btn.active {
    background: rgba(0, 210, 255, 0.15);
    color: var(--primary-color, #00d2ff);
    border-bottom: 2px solid var(--primary-color, #00d2ff);
  }

  /* ── Visibility section (prod-faithful) ─────────────────────────────────── */

  .visibility-section {
    border-left: 2px solid var(--secondary-light-color, rgb(102, 156, 210));
    padding-left: 10px;
  }

  .visibility-header {
    color: var(--secondary-light-color, rgb(102, 156, 210)) !important;
    border-bottom: 1px solid var(--editor-border) !important;
    font-size: 0.875rem;
    font-weight: 400;
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0 0 8px 0;
    padding-bottom: 5px;
  }

  .people {
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  .people-row {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 12px;
    padding: 6px 0;
  }

  .avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: 1px solid var(--secondary-light-color, rgb(102, 156, 210));
    box-shadow: 0 0 5px 1px rgba(102, 156, 210, 0.4);
    overflow: hidden;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(102, 156, 210, 0.15);
  }

  .avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
  }

  .avatar-initial {
    font-size: 14px;
    font-weight: bold;
    color: var(--primary-light-color, rgb(105, 211, 251));
  }

  .person-name {
    flex: 1;
    font-size: 0.875rem;
    color: var(--primary-text-color, #e0e8ff);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .empty-hint {
    font-size: 0.8rem;
    color: var(--secondary-text-color, rgba(224, 232, 255, 0.5));
    text-align: center;
    padding: 12px 0 6px;
    margin: 0;
  }

  .section-label {
    font-size: 0.75rem;
    color: var(--secondary-text-color, rgba(224, 232, 255, 0.6));
    margin-bottom: 6px;
  }
`;
