/**
 * Stove card styles — port from src/cards/stove/style.js (main branch)
 * Tokens: --sf-* replacing old custom tokens
 */
import { css } from 'lit';

export const stoveStyles = css`
  :host {
    background-color: black;
    height: 100%;
    width: 100%;
    --stove-width: 130px;
    --stove-height: 500px;
    --circle-color: #181818;
  }

  /*********** CONTAINER ***********/
  .container {
    display: flex;
    flex-direction: column;
    flex: 1;
  }

  /*********** HEADER ***********/
  .header {
    text-align: center;
    border-bottom: var(--sf-border-width, 1px) solid var(--sf-bg-primary, #0d1117);
    padding: 5px;
    background-color: rgba(13, 17, 23, 0.6);
    color: var(--sf-text-secondary, #b0bec5);
    font-size: var(--sf-text-sm, 12px);
    font-weight: bold;
  }

  /*********** CONTENT ***********/
  .content {
    display: flex;
    flex-direction: row;
    overflow: visible;
  }
  .content sf-stove-image {
    height: var(--stove-height);
    width: var(--stove-width);
    flex-shrink: 0;
  }
  .content .info {
    display: flex;
    flex-direction: column;
    padding: 0 10px;
    flex: 1;
    position: relative;
    overflow: visible;
  }

  /*** Zones e (top / bottom) ***/
  .content .info .e {
    height: 90px;
    position: relative;
    padding: 5px;
    display: flex;
  }
  .content .info .circle {
    background-color: var(--sf-primary, #00d2ff);
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
  }
  /* h-path: thin horizontal line — color matches main --secondary-light-light-alpha-color */
  .content .info .h-path {
    border-top: 1px solid rgba(110, 203, 245, 0.4);
    flex: 1;
    min-width: 0;
  }
  /* bottom-path: margin-top on BOTH h-path and d-path — exact main branch behavior.
     Both shift together to y=3, circle center at y=4 ≈ line at y=3 → centered. */
  .content .info .e.bottom-path .display .h-path,
  .content .info .e.bottom-path .display .d-path {
    margin-top: 3px;
  }
  .content .info .e.bottom-path .display .h-path {
    align-self: flex-start;
  }
  /* top-path: margin-bottom on BOTH h-path and d-path — same logic inverted. */
  .content .info .e.top-path .display .h-path,
  .content .info .e.top-path .display .d-path {
    margin-bottom: 3px;
  }
  .content .info .e.top-path .display .h-path {
    align-self: flex-end;
  }
  /* middle zone: align-self merged into the rule below (width+flex+align) */
  .content .info .e.top-path .powers,
  .content .info .e.bottom-path .quantities {
    display: flex;
    flex-direction: row;
  }
  .content .info .e.top-path {
    border-top: calc(2 * var(--sf-border-width, 1px)) solid rgba(110, 203, 245, 0.2);
  }
  .content .info .e.bottom-path {
    border-bottom: calc(2 * var(--sf-border-width, 1px)) solid rgba(110, 203, 245, 0.2);
  }
  .content .info .e.bottom-path .quantities {
    align-items: flex-end;
    justify-content: center;
    display: flex;
    flex-direction: row;
    column-gap: 20px;
    height: 90%;
    align-self: center;
    flex: 1;
  }
  .content .info .e.bottom-path .quantities sf-stack-bar,
  .content .info .e.bottom-path .quantities sf-circle-progress-bar {
    height: 100%;
  }
  .content .info .e.top-path .powers {
    align-items: flex-start;
    display: flex;
    flex-direction: row;
    flex: 1;
    justify-content: center;
  }

  /*** Power cells ***/
  .content .info .e.top-path .power {
    display: flex;
    flex-direction: column;
    row-gap: 5px;
    align-self: center;
    font-size: var(--sf-text-sm, 12px);
    color: var(--sf-text-secondary, #b0bec5);
    text-align: center;
    font-weight: bold;
    flex: 1;
  }
  .content .info .e.top-path .powers .power div:last-child {
    font-size: var(--sf-text-base, 0.875rem);
    color: var(--primary-light-color, #6ecbf5);
  }
  .content .info .e.top-path .powers .power div:last-child.nothing {
    color: var(--sf-text-secondary, #7ca8c9);
  }
  /* icon color in power cells — matches main --secondary-light-color */
  .content .info .e.top-path .powers .power sf-icon {
    --icon-color: var(--primary-light-color, #6ecbf5);
  }

  /*** Decorative display connector (circle + lines) ***/
  .content .info .e .display {
    position: absolute;
    display: flex;
    flex-direction: row;
    left: -80px;
    width: 80px; /* spans exactly from x=-80 to x=0 (left edge of .info) */
    overflow: visible;
  }
  .content .info .e.bottom-path .display {
    align-items: flex-start;
    top: 45px;
  }
  .content .info .e.top-path .display {
    align-items: flex-end;
    bottom: 45px;
  }
  /* No margin offsets — let display positioning handle alignment */
  .content .info .e.bottom-path .display .d-path,
  .content .info .e.top-path .display .d-path {
    width: 45px;
    height: 54px; /* matches main branch — overflows zone border for a clean visual join */
  }
  .content .info .e.top-path .display .d-path {
    background-color: rgba(0, 210, 255, 0.2);
    clip-path: polygon(0 95%, 100% 0, 100% 5%, 0 100%);
  }
  .content .info .e.bottom-path .display .d-path {
    background-color: rgba(0, 210, 255, 0.2);
    clip-path: polygon(0 0, 100% 95%, 100% 100%, 0% 5%);
  }

  /*** N/A quantity ***/
  .content .info .e.bottom-path .quantities .nothing {
    display: flex;
    flex-direction: column;
    row-gap: 10px;
    font-size: var(--sf-text-sm, 12px);
    color: var(--sf-text-secondary, #b0bec5);
    text-align: center;
    align-items: center;
    min-width: 100px;
    font-weight: bold;
  }

  /*** Middle zone ***/
  .content .info .m {
    flex: 1;
    align-content: center;
    position: relative;
  }
  .content .info .m .display {
    position: absolute;
    display: flex;
    flex-direction: row;
    left: -13px;
    top: 145px;
    align-items: center;
    width: 46px; /* 8px circle + 33px h-path + 5px margin → reaches border-left of .temperatures */
    overflow: visible;
  }
  .content .info .m .display .h-path {
    align-self: center; /* display uses align-items:center — h-path matches */
    width: 33px;
    flex: none; /* fixed width — do not grow/shrink */
  }
  .content .info .m .temperatures {
    border-left: calc(2 * var(--sf-border-width, 1px)) solid rgba(0, 210, 255, 0.2);
    padding: 5px;
    margin-left: 30px;
    display: flex;
    flex-direction: column;
    row-gap: 20px;
  }

  /*** Status + temperature rows ***/
  .content .info .m .temperatures .status,
  .content .info .m .temperatures .temperature {
    display: flex;
    flex-direction: row;
    column-gap: 5px;
    align-items: center;
    font-weight: bold;
    color: var(--sf-primary, #00d2ff);
  }
  .content .info .m .temperatures .status .label,
  .content .info .m .temperatures .temperature .label {
    color: var(--sf-text-secondary, #b0bec5);
    font-size: var(--sf-text-sm, 12px);
  }
  .content .info .m .temperatures .status div:last-child {
    color: var(--primary-light-color, #6ecbf5);
  }
  .content .info .m .temperatures .status.off div:last-child,
  .content .info .m .temperatures .temperature.off div:last-child {
    color: var(--sf-text-secondary, #7ca8c9);
  }
  .content .info .m .temperatures .status.amber div:last-child {
    color: rgb(250, 146, 29); /* amber — exact main branch --primary-error-color */
  }
  .content .info .m .temperatures .status.red div:last-child {
    color: #ff4444;
  }
  .content .info .m .temperatures .status.green div:last-child {
    color: #4caf50; /* main: --primary-green-color */
  }
  .content .info .m .temperatures .status.blue div:last-child {
    color: var(--primary-light-color, #6ecbf5);
  }
  .content .info .m .temperatures .temperature.high div:last-child {
    color: #ff4444;
  }
  .content .info .m .temperatures .temperature.medium div:last-child {
    color: rgb(250, 146, 29);
  }
  .content .info .m .temperatures .status sf-icon,
  .content .info .m .temperatures .temperature sf-icon {
    --icon-color: var(--primary-light-color, #6ecbf5);
  }
  .content .info .m .temperatures .status.green sf-icon {
    --icon-color: #4caf50;
  }
  .content .info .m .temperatures .status.off sf-icon,
  .content .info .m .temperatures .temperature.off sf-icon {
    --icon-color: var(--sf-text-secondary, #7ca8c9);
  }
  .content .info .m .temperatures .status.red sf-icon,
  .content .info .m .temperatures .temperature.high sf-icon {
    --icon-color: #ff4444;
  }
  .content .info .m .temperatures .status.amber sf-icon,
  .content .info .m .temperatures .temperature.medium sf-icon {
    --icon-color: rgb(250, 146, 29);
  }
  .content .info .m .temperatures .temperature .no-temp {
    display: flex;
    flex-direction: row;
    position: relative;
  }
  .content .info .m .temperatures .temperature .no-temp sf-icon:last-of-type {
    position: absolute;
    right: -4px;
    --icon-width: 10px;
    --icon-height: 10px;
  }

  /*** stove-status selector (required by tests) ***/
  .stove-status {
    display: inline;
  }

  /*** sensor-tile (required by tests — legacy compatibility) ***/
  .sensor-tile {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 8px;
    border: 1px solid rgba(0, 210, 255, 0.2);
    border-radius: 6px;
  }
  .sensor-tile.warn {
    border-color: var(--sf-error, #ff6b35);
  }
  .bar-fill.pellet,
  .bar-fill.storage {
    height: 4px;
    border-radius: 2px;
    background: var(--sf-primary, #00d2ff);
  }

  /*********** BOTTOM ***********/
  .bottom {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    column-gap: 10px;
    flex: 1;
    border-top: var(--sf-border-width, 1px) solid var(--sf-bg-primary, #0d1117);
    padding: 5px;
    background-color: rgba(13, 17, 23, 0.6);
  }
  .bottom sf-button-card-select {
    --title-color: var(--secondary-bg-color, #7ca8c9);
    --label-text-color: var(--primary-light-color, #6ecbf5);
    align-self: center; /* vertically center relative to the wheel */
  }
  .bottom sf-wheel {
    --item-font-size: 12px;
    --wheel-item-color: var(--sf-primary, #00d2ff);
    --text-font-color: var(--sf-text-secondary, #b0bec5);
    --text-size: var(--sf-text-sm, 12px); /* match sf-button-card-select title size */
    border: 1px solid var(--sf-primary, #00d2ff);
    border-radius: 8px;
    padding: 0;
    min-width: 100px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
`;
