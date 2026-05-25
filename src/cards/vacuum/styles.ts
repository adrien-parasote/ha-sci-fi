/**
 * styles.ts — CSS for sci-fi-vacuum card.
 * Ported 1:1 from main:src/cards/vacuum/style.js
 *
 * Color values from main:src/helpers/styles/common_style.js:
 *   --primary-light-color        = rgb(105, 211, 251)       → header text, values, active dots
 *   --secondary-light-color      = rgb(102, 156, 210)       → icons, units, dim labels
 *   --primary-light-alpha-color  = rgba(105, 211, 251, 0.5) → inactive dots
 *   --primary-error-color        = rgb(250, 146, 29)        → ALERT icon
 *   --primary-bg-alpha-color     = rgba(39, 40, 43, 0.3)    → section backgrounds
 *   --secondary-bg-color         = rgb(55, 61, 69)          → borders in map/info/actions
 *   --primary-bg-color           = rgb(39, 40, 43)          → border header/devices
 */

import { css } from 'lit';

export const vacuumStyles = css`
  :host {
    display: flex;
    flex-direction: column;
    background-color: black;
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
    border-bottom: 1px solid rgb(39, 40, 43);
    background-color: rgba(39, 40, 43, 0.3);
    padding: 10px;
    color: rgb(105, 211, 251);
    font-size: var(--sf-font-size-base, 14px);
  }
  .header .name {
    text-shadow: 0px 0px 5px rgb(105, 211, 251);
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
    --icon-color: rgb(255, 215, 0); /* amber — --primary-warning-color */
    color: rgb(255, 215, 0);
    text-shadow: 0 0 5px rgb(255, 215, 0);
  }
  .header .infoH sf-icon.battery-critical,
  .header .infoH div.battery-critical {
    --icon-color: rgb(250, 146, 29); /* red-orange — --primary-error-color */
    color: rgb(250, 146, 29);
    text-shadow: 0 0 5px rgb(250, 146, 29);
  }

  /*********** DEVICES *************/
  .devices {
    display: flex;
    flex-direction: row;
    border-top: 1px solid rgb(39, 40, 43);
    background-color: rgba(39, 40, 43, 0.3);
    padding: 10px;
    color: rgb(105, 211, 251);
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
    background-color: rgba(105, 211, 251, 0.5);
    text-decoration: none;
    border-radius: 50%;
  }
  .devices .number > div.active {
    background-color: rgb(105, 211, 251);
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
    --icon-color: rgb(105, 211, 251);
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
    --icon-color: rgb(250, 146, 29);
  }

  /*********** MAP *************/
  .map {
    display: flex;
    flex: 1;
    padding: 15px;
    justify-content: center;
  }
  .map .image {
    border: 1px solid rgb(55, 61, 69);
    border-radius: var(--sf-radius, 8px);
    width: auto;
    height: 100%;
    max-width: 100%;
    overflow: hidden;
  }
  .map .map-content {
    color: rgb(102, 156, 210);
    align-self: center;
  }

  /*********** INFO *************/
  .info {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    border-top: 1px solid rgb(55, 61, 69);
    border-bottom: 1px solid rgb(55, 61, 69);
    background-color: rgba(39, 40, 43, 0.3);
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
    --icon-color: rgb(102, 156, 210);
  }
  .info .sensor .data {
    display: flex;
    flex-direction: row;
    align-items: center;
    column-gap: 5px;
  }
  .info .sensor .data .value {
    color: rgb(105, 211, 251);
    text-shadow: 0px 0px 5px rgb(105, 211, 251);
  }
  .info .sensor .data .unit {
    color: rgb(102, 156, 210);
  }
  .info .sensor .name {
    color: rgb(102, 156, 210);
    font-size: var(--sf-font-size-sm, 12px);
  }


  /*********** ACTIONS — pinned to bottom *************/
  .actions {
    display: flex;
    flex-direction: row;
    column-gap: 5px;
    padding: 10px 10px 15px 10px;
    border-top: 1px solid rgb(55, 61, 69);
    background-color: rgba(39, 40, 43, 0.3);
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
