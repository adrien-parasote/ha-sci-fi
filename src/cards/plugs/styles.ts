/**
 * styles.ts — Plugs card CSS
 * Ported from main:src/cards/plugs/style.js
 * Colors mapped 1:1 from main:src/helpers/styles/common_style.js
 *
 * Color reference (from main common_style.js):
 *   --primary-light-color        = rgb(105, 211, 251)   → active/on elements, values, animation ball
 *   --secondary-light-color      = rgb(102, 156, 210)   → icon ON header, text ON header, icon.off on plug
 *   --secondary-light-alpha-color= rgba(102, 156, 210, 0.5) → header default text/icon, msg-container
 *   --secondary-bg-color         = rgb(55, 61, 69)      → borders, EU socket circles
 *   --primary-bg-color           = rgb(39, 40, 43)      → header/footer border color
 *   --primary-bg-alpha-color     = rgba(39, 40, 43, 0.3) → header/footer background
 *   --border-radius              = 5px
 *   --border-width               = 1px
 *   --icon-size-small            = 20px
 *   --icon-size-normal           = 25px (was 28px — corrected to match main)
 */
import { css } from 'lit';

export const plugStyles = css`
  :host {
    font-size: 12px;
    height: 100%;
    width: 100%;
    background-color: black;
  }

  /* ── CONTAINER ──────────────────────────────────────────────────────────── */
  ha-card {
    height: 100%;
    display: flex;
    flex-direction: column;
  }
  .container {
    display: flex;
    flex-direction: column;
    width: 100%;
    flex: 1;
  }

  /* ── HEADER ─────────────────────────────────────────────────────────────── */
  .header {
    display: flex;
    flex-direction: row;
    border-bottom: 1px solid rgb(39, 40, 43);
    padding: 10px;
    background-color: rgba(39, 40, 43, 0.3);
    column-gap: 10px;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    color: rgba(102, 156, 210, 0.5);
    min-height: 45px;
  }
  /* icon ON header → secondary-light-color (bleu-gris plein) */
  .header sf-icon.on { --icon-color: rgb(102, 156, 210); }
  /* icon OFF header → secondary-light-alpha-color (bleu-gris transparent) */
  .header sf-icon    { --icon-color: rgba(102, 156, 210, 0.5); }
  /* text ON header → secondary-light-color */
  .header .on  { color: rgb(102, 156, 210); }
  .header .info {
    display: flex;
    flex-direction: column;
    flex: 1;
  }
  /* sub-title → secondary-bg-color (gris moyen) */
  .header .info .sub-title {
    font-size: 12px;
    color: rgb(55, 61, 69);
  }

  /* ── FOOTER ─────────────────────────────────────────────────────────────── */
  .footer {
    display: flex;
    flex-direction: row;
    text-align: center;
    border-top: 1px solid rgb(39, 40, 43);
    padding: 10px;
    background-color: rgba(39, 40, 43, 0.3);
    column-gap: 5px;
    align-items: center;
    justify-content: center;
  }
  .footer .hide { display: none; }
  .footer .number {
    display: flex;
    flex-direction: row;
    justify-content: center;
    column-gap: 10px;
    flex: 1;
  }
  /* inactive plug icon in footer → secondary-light-color */
  .footer .number > sf-button {
    align-items: center;
    --btn-size: 20px;
    --primary-icon-color: rgb(102, 156, 210);
  }
  /* active plug icon in footer → primary-light-color (bleu cyan) */
  .footer .number > sf-button.active {
    --btn-size: 25px;
    --primary-icon-color: rgb(105, 211, 251);
  }

  /* ── CONTENT ──────────────────────────────────────────────────── */
  .content {
    display: flex;
    flex: 1;
    flex-direction: column;
  }
  /* .info takes remaining space — pushes chart-bottom to bottom */
  .content .info {
    flex: 1;
    padding: 10px;
    display: flex;
    flex-direction: column;
  }
  /* chart-bottom zone: msg + chart, pinned to bottom of .content */
  .content .chart-bottom {
    display: flex;
    flex-direction: column;
  }
  /* msg-container → secondary-light-color */
  .content .msg-container {
    text-align: center;
    min-height: 30px;
    align-content: center;
    color: rgb(102, 156, 210);
  }
  .content .chart-container {
    min-height: 120px;
    padding: 0 10px 10px;
  }

  /* ── IMAGE ZONE ─────────────────────────────────────────────────────────── */
  .content .info .image {
    display: flex;
    flex-direction: row;
    align-items: center;
    margin: 10px 0;
  }
  /* cursor: pointer on icon-container (matches main) */
  .content .info .image .icon-container {
    border: 2px solid rgb(55, 61, 69);
    padding: 5px;
    display: flex;
    border-radius: 5px;
    position: relative;
    cursor: pointer;
  }
  .content .info .image .icon-container .icon {
    width: 70px;
    height: 70px;
    align-content: center;
    position: relative;
    border: 2px solid rgb(55, 61, 69);
    border-radius: 50%;
  }
  /* EU socket holes → secondary-bg-color */
  .content .info .image .icon-container .icon .circle {
    position: absolute;
    background-color: rgb(55, 61, 69);
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }
  .content .info .image .icon-container .icon .circle:first-child  { top: 13px; left: calc(50% - 4px); }
  .content .info .image .icon-container .icon .circle:nth-child(2) { top: calc(50% - 4px); left: 13px; }
  .content .info .image .icon-container .icon .circle:nth-child(3) { top: calc(50% - 4px); right: 13px; }
  .content .info .image .icon-container sf-icon {
    position: absolute;
    bottom: 0;
    right: 0;
  }
  /* icon.off on plug image → secondary-light-color (bleu-gris, pas transparent) */
  .content .info .image .icon-container sf-icon.off { --icon-color: rgb(102, 156, 210); }

  /* ── ANIMATED WIRE (current flowing) ───────────────────────────────────── */
  /* NOTE: class name ".cirle-container" (one 'r') preserved 1:1 from main */
  .content .info .image .cirle-container {
    flex: 1;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    border: 1px solid rgb(55, 61, 69);
  }
  /* animation ball → primary-light-color (bleu cyan) */
  .content .info .image .cirle-container .circle {
    position: absolute;
    left: -5px;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: rgb(105, 211, 251);
    animation: 3s linear 1s infinite running move;
  }
  .content .info .image .cirle-container.off .circle {
    animation: none;
    display: none;
  }
  @keyframes move {
    0%   { margin-left: 0%;    opacity: 1;    }
    60%  { opacity: 0.9; }
    70%  { opacity: 0.8; }
    80%  { margin-left: 100%;  opacity: 0.75; }
    90%  { margin-left: 100%;  opacity: 0.33; }
    100% { margin-left: 100%;  opacity: 0;    }
  }

  /* ── SENSORS ────────────────────────────────────────────────────────────── */
  .content .info .sensors {
    display: flex;
    flex-direction: column;
    row-gap: 15px;
  }
  .content .info .sensors .sensor {
    display: flex;
    flex-direction: row;
    column-gap: 5px;
    min-height: 25px;
    align-items: center;
  }
  .content .info .sensors .sensor .name {
    flex: 1;
    margin-left: 10px;
    align-content: center;
  }
  /* value → primary-light-color (bleu cyan) */
  .content .info .sensors .sensor .value {
    color: rgb(105, 211, 251);
    text-transform: uppercase;
    align-content: center;
    font-weight: bold;
  }
  /* sensor icons → secondary-light-color (bleu-gris) */
  .content .info .sensors .sensor sf-icon {
    --icon-color: rgb(102, 156, 210);
  }
  /* select dropdown sensor takes full row width */
  .content .info .sensors .sensor sf-button-card-select {
    flex: 1;
  }
  /* lock/switch button value */
  .content .info .sensors .sensor .value sf-button-card {
    --btn-padding: 5px;
    --border: none;
    --label-color: rgb(105, 211, 251);
  }
`;
