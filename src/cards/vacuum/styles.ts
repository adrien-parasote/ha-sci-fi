/**
 * styles.ts — CSS for sci-fi-vacuum card.
 * Ported 1:1 from main:src/cards/vacuum/style.js
 *
 * Fully refactored to use standard CSS custom properties and design tokens
 * defined in src/styles/common.ts for theme compatibility.
 */

import { css } from 'lit';

export const vacuumStyles = css`
  :host {
    display: flex;
    flex-direction: column;
    background-color: var(--sf-bg, black);
    height: 100%;
    width: 100%;
    min-height: 732px;
  }
  /* ha-card is display:block in common styles — override to flex so the chain works:
     :host (flex col, min-height 732px) → ha-card (flex:1 = fills host) → .container (flex:1) → .map (flex:1) */
  ha-card {
    display: flex !important;
    flex-direction: column;
    flex: 1;
    overflow: hidden;
  }
  .container {
    display: flex;
    flex-direction: column;
    flex: 1;
  }

  /*********** HEADER *************/
  .header {
    display: flex;
    flex-direction: row;
    border-bottom: 1px solid var(--sf-border);
    background-color: var(--sf-bg-secondary);
    padding: 10px;
    color: var(--sf-primary);
    font-size: var(--sf-font-size-base, 14px);
  }
  .header .name {
    text-shadow: 0px 0px 5px var(--sf-primary);
  }
  .header .infoH {
    display: flex;
    flex-direction: row;
    column-gap: 5px;
    align-items: center;
    flex: 1;
    justify-content: end;
  }
  .header .infoH sf-icon {
    --icon-width: 16px;
    --icon-height: 16px;
  }
  .header .infoH .spacer {
    width: 10px;
  }
  /* Battery warning/critical colors — mirrors sf-landspeeder thresholds */
  .header .infoH sf-icon.battery-warn,
  .header .infoH div.battery-warn {
    --icon-color: var(--sf-warning);
    color: var(--sf-warning);
    text-shadow: 0 0 5px var(--sf-warning);
  }
  .header .infoH sf-icon.battery-critical,
  .header .infoH div.battery-critical {
    --icon-color: var(--sf-error);
    color: var(--sf-error);
    text-shadow: 0 0 5px var(--sf-error);
  }

  /*********** DEVICES *************/
  .devices {
    display: flex;
    flex-direction: row;
    border-top: 1px solid var(--sf-border);
    background-color: var(--sf-bg-secondary);
    padding: 10px;
    color: var(--sf-primary);
    font-size: var(--sf-font-size-base, 14px);
  }
  .devices .number {
    display: flex;
    flex-direction: row;
    justify-content: center;
    column-gap: 10px;
    align-items: center;
    flex-grow: 1;
  }
  .devices .number > div {
    content: '';
    width: 10px;
    height: 10px;
    background-color: var(--sf-primary-dim);
    text-decoration: none;
    border-radius: 50%;
  }
  .devices .number > div.active {
    background-color: var(--sf-primary);
  }

  /*********** SUB HEADER *************/
  .sub-header {
    display: flex;
    flex-direction: column;
    padding: 15px;
    position: relative;
    height: 40px;
  }
  .sub-header sf-icon {
    position: absolute;
    --icon-width: 40px;
    --icon-height: 40px;
    --icon-color: var(--sf-primary);
  }
  .sub-header sf-icon.DOCKED {
    transform: rotate(90deg);
  }
  .sub-header sf-icon.CLEAN,
  .sub-header sf-icon.RETURNING {
    animation: moveAcross 20s linear infinite;
  }

  @keyframes moveAcross {
    0% {
      left: 0;
      transform: rotate(90deg);
    }
    49.999% {
      left: 92%;
      transform: rotate(90deg);
    }
    50% {
      left: 92%;
      transform: rotate(-90deg);
    }
    99.999% {
      left: 0;
      transform: rotate(-90deg);
    }
    100% {
      left: 0;
      transform: rotate(90deg);
    }
  }

  .sub-header sf-icon.IDLE,
  .sub-header sf-icon.ALERT {
    left: calc(50% - 20px);
  }
  .sub-header sf-icon.ALERT {
    --icon-color: var(--sf-error);
  }

  /*********** MAP *************/
  .map {
    display: flex;
    flex: 1;
    padding: 15px;
    justify-content: center;
  }
  .map .image {
    border: 1px solid var(--sf-border);
    border-radius: var(--sf-radius, 8px);
    width: auto;
    height: 100%;
    max-width: 100%;
    overflow: hidden;
  }
  .map .map-content {
    color: var(--sf-text-secondary);
    align-self: center;
  }

  /*********** INFO *************/
  .info {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    border-top: 1px solid var(--sf-border);
    border-bottom: 1px solid var(--sf-border);
    background-color: var(--sf-bg-secondary);
  }
  .info .sensor {
    width: 183px;
    padding: 5px;
    display: flex;
    flex-direction: column;
    row-gap: 5px;
    align-items: center;
  }
  .info .sensor sf-icon {
    --icon-color: var(--sf-text-secondary);
  }
  .info .sensor .data {
    display: flex;
    flex-direction: row;
    align-items: center;
    column-gap: 5px;
  }
  .info .sensor .data .value {
    color: var(--sf-primary);
    text-shadow: 0px 0px 5px var(--sf-primary);
  }
  .info .sensor .data .unit {
    color: var(--sf-text-secondary);
  }
  .info .sensor .name {
    color: var(--sf-text-secondary);
    font-size: var(--sf-font-size-sm, 12px);
  }


  /*********** ACTIONS — pinned to bottom *************/
  .actions {
    display: flex;
    flex-direction: row;
    column-gap: 5px;
    padding: 10px 10px 15px 10px;
    border-top: 1px solid var(--sf-border);
    background-color: var(--sf-bg-secondary);
    justify-content: center;
    margin-top: auto;
  }
  .actions .default,
  .actions .shortcuts {
    display: flex;
    flex: 1;
    flex-direction: row;
    column-gap: 5px;
  }
  .actions .default {
    justify-content: left;
  }
  .actions .shortcuts {
    justify-content: right;
  }
  .actions .default sf-button,
  .actions .shortcuts sf-button {
    --btn-size: 28px;
  }
`;
