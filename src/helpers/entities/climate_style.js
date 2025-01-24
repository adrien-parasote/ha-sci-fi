import {css} from 'lit';

export default css`
  :host {
    --stop-color-0: #aed6f1;
    --stop-color-0-25: #f9e79f;
    --stop-color-0-5: #fad7a0;
    --stop-color-0-75: #edbb99;
    --stop-color-1: #c0392b;
    display: flex;
    flex-direction: column;
    border: var(--border-width) solid var(--secondary-bg-color);
    border-radius: var(--border-radius);
    padding: 10px;
    row-gap: 10px;
    height: 240px;
    width: 332px;
  }
  .hexagon-container {
    position: relative;
    display: flex;
    flex: 1;
    width: 100%;
    align-items: center;
    justify-content: center;
  }
  .hexagon-container svg {
    width: 180px;
    height: 180px;
  }
  .hexagon-container svg .border {
    fill: var(--secondary-bg-color);
  }
  .hexagon-container svg .background {
    fill: var(--primary-bg-color);
  }
  .hexagon-container .pointer {
    position: absolute;
    content: '';
    width: 15px;
    height: 15px;
    background-color: var(--pointer-color);
    border: 2px solid white;
    top: var(--pointer-top);
    left: var(--pointer-left);
    border-radius: 50%;
  }
  .hexagon-container .info {
    position: absolute;
  }
  .hexagon-container .info .state svg {
    width: var(--icon-size-subtitle);
    height: var(---icon-size-subtitle);
    fill: var(--state-color);
  }
  .hexagon-container .info .temperature-label {
    display: flex;
    flex-direction: row;
    font-size: 40px;
    justify-content: center;
    margin: 10px;
    color: var(--primary-light-color);
  }
  .hexagon-container .info .temperature-label .radical {
    align-self: center;
  }
  .hexagon-container .info .temperature-label .decimal {
    display: flex;
    flex-direction: column;
    font-size: 15px;
    justify-content: center;
  }
  .hexagon-container .info .target-temperature {
    text-align: center;
    font-size: var(--font-size-xsmall);
    color: var(--secondary-light-color);
  }
  .hexagon-container .info .target-temperature .label {
    text-transform: capitalize;
  }
  .controls {
    position: relative;
    display: flex;
    flex-direction: row;
    column-gap: 5px;
    align-self: center;
  }
  .controls .spacer-middle {
    content: '';
    width: 50px;
  }
  .controls .button {
    border: var(--border-width) solid var(--secondary-bg-color);
    padding: 10px;
    border-radius: 50%;
    cursor: pointer;
    border-color: var(--primary-light-color);
    background: var(--secondary-light-light-alpha-color);
  }
  .controls .button svg {
    width: var(--icon-size-normal);
    height: var(---icon-size-normal);
    fill: var(--mode-color);
  }
  .controls .spacer {
    width: 50px;
    display: flex;
    flex-direction: row;
  }
  .controls .spacer.hide > * {
    display: none;
  }
  .controls .spacer .vertical {
    border: var(--border-width) solid var(--primary-light-color);
    height: 22px;
  }
  .controls .spacer .horizontal {
    border: var(--border-width) solid var(--primary-light-color);
    width: 100%;
    height: fit-content;
    align-self: center;
  }
  .controls .spacer .circle {
    align-self: center;
    width: 7px;
  }
  .controls .hvac-options.hide,
  .controls .preset-mode-options.hide {
    display: none;
  }
  .controls .hvac-options,
  .controls .preset-mode-options {
    display: flex;
    flex-direction: column;
    border: var(--border-width) solid var(--primary-light-color);
    border-radius: var(--border-radius);
    padding: 5px;
    position: absolute;
    width: 100px;
    background: black;
    bottom: 47px;
  }
  .controls .hvac-options {
    right: -40px;
  }
  .controls .preset-mode-options {
    left: -40px;
  }
  .controls .hvac-options > div,
  .controls .preset-mode-options > div {
    display: flex;
    flex-direction: row;
    column-gap: 5px;
    color: var(--option-color);
    align-items: center;
    cursor: pointer;
    padding: 5px 0;
    font-size: var(--font-size-xsmall);
  }
  .controls .hvac-options > div:not(:last-child),
  .controls .preset-mode-options > div:not(:last-child) {
    border-bottom: var(--border-width) solid var(--secondary-light-alpha-color);
  }
  .controls .hvac-options svg,
  .controls .preset-mode-options svg {
    fill: var(--option-color);
    width: var(--icon-size-small);
    height: var(---icon-size-small);
  }
`;
