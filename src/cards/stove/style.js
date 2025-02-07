import {css} from 'lit';

export default css`
  :host {
    background-color: black;
    height: 100%;
    width: 100%;
    --stove-width: 130px;
    --stove-height: 500px;
    --circle-color: #181818;
  }
  .container {
    display: flex;
    flex-direction: column;
    flex: 1;
  }
  /*********** CONTENT ***********/
  .content {
    display: flex;
    flex-direction: row;
  }
  .content sci-fi-stove-image {
    height: var(--stove-height);
    width: var(--stove-width);
  }
  .content .info {
    display: flex;
    flex-direction: column;
    padding: 0 10px;
    flex: 1;
  }
  .content .info .e {
    height: 90px;
    position: relative;
    padding: 5px;
    display: flex;
  }
  .content .info .circle {
    border-color: var(--primary-dark-color);
    background-color: var(--primary-light-color);
  }
  .content .info .h-path {
    border-color: var(--secondary-light-light-alpha-color);
  }
  .content .info .e.top-path .powers,
  .content .info .e.bottom-path .quantities {
    display: flex;
    flex-direction: row;
  }
  .content .info .e.top-path {
    border-top: calc(2 * var(--border-width)) solid
      var(--secondary-light-light-alpha-color);
  }
  .content .info .e.bottom-path {
    border-bottom: calc(2 * var(--border-width)) solid
      var(--secondary-light-light-alpha-color);
  }
  .content .info .e.bottom-path .quantities {
    align-items: flex-end;
    display: flex;
    flex-direction: row;
    column-gap: 10px;
    height: 90%;
    align-self: center;
  }
  .content .info .e.bottom-path .quantities sci-fi-stack-bar,
  .content .info .e.bottom-path .quantities sci-fi-circle-progress-bar {
    height: 100%;
  }
  .content .info .e.top-path .powers {
    align-items: flex-start;
    display: flex;
    flex-direction: row;
    flex: 1;
    justify-content: center;
  }
  .content .info .e.top-path .power {
    display: flex;
    flex-direction: column;
    row-gap: 5px;
    align-self: center;
    font-size: var(--font-size-small);
    color: var(--secondary-bg-color);
    text-align: center;
    font-weight: bold;
    flex: 1;
  }
  .content .info .e.top-path .powers .power div:last-child {
    font-size: var(--font-size-normal);
    color: var(--primary-light-color);
  }
  .content .info .e.top-path .powers .power div:last-child.nothing {
    color: var(--secondary-bg-color);
  }
  .content .info .e.top-path .powers .power svg {
    fill: var(--primary-light-color);
    width: var(--icon-size-normal);
    height: var(--icon-size-normal);
  }
  .content .info .e .display {
    position: absolute;
    display: flex;
    flex-direction: row;
    left: -80px;
  }
  .content .info .e.bottom-path .display {
    align-items: flex-start;
    top: 45px;
  }
  .content .info .e.top-path .display {
    align-items: flex-end;
    bottom: 45px;
  }
  .content .info .e.top-path .display .h-path,
  .content .info .e.top-path .display .d-path {
    margin-bottom: 3px;
  }
  .content .info .e.bottom-path .display .h-path,
  .content .info .e.bottom-path .display .d-path {
    margin-top: 3px;
  }
  .content .info .e.bottom-path .display .d-path,
  .content .info .e.top-path .display .d-path {
    width: 45px;
    height: 54px;
  }
  .content .info .e.top-path .display .d-path {
    background-color: var(--secondary-light-light-alpha-color);
    clip-path: polygon(0 95%, 100% 0, 100% 5%, 0 100%);
  }
  .content .info .e.bottom-path .display .d-path {
    background-color: var(--secondary-light-light-alpha-color);
    clip-path: polygon(0 0, 100% 95%, 100% 100%, 0% 5%);
  }
  .content .info .e.bottom-path .quantities .nothing {
    display: flex;
    flex-direction: column;
    row-gap: 10px;
    font-size: var(--font-size-small);
    color: var(--secondary-bg-color);
    text-align: center;
    align-items: center;
    min-width: 100px;
    font-weight: bold;
  }
  .content .info .e.bottom-path .quantities .nothing div:first-of-type {
    color: var(--secondary-bg-color);
  }
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
  }
  .content .info .m .display .h-path {
    width: 33px;
  }
  .content .info .m .temperatures {
    border-left: calc(2 * var(--border-width)) solid
      var(--secondary-light-light-alpha-color);
    padding: 10px;
    margin-left: 30px;
    display: flex;
    flex-direction: column;
    row-gap: 20px;
  }
  .content .info .m .temperatures .status,
  .content .info .m .temperatures .temperature {
    display: flex;
    flex-direction: row;
    column-gap: 5px;
    align-items: center;
    font-weight: bold;
    color: var(--secondary-light-color);
  }
  .content .info .m .temperatures .status .label,
  .content .info .m .temperatures .temperature .label {
    color: var(--secondary-bg-color);
    font-size: var(--font-size-small);
  }
  .content .info .m .temperatures .status div:last-child {
    color: var(--secondary-light-color);
    font-size: var(--secondary-bg-color);
  }
  .content .info .m .temperatures .status.off div:last-child,
  .content .info .m .temperatures .temperature.off div:last-child {
    color: var(--secondary-bg-color);
  }
  .content .info .m .temperatures .status.amber div:last-child {
    color: var(--primary-error-color);
  }
  .content .info .m .temperatures .status.red div:last-child {
    color: red;
  }
  .content .info .m .temperatures .status.green div:last-child {
    color: var(--primary-green-color);
  }
  .content .info .m .temperatures .status.blue div:last-child {
    color: var(--primary-light-color);
  }
  .content .info .m .temperatures .temperature.high div:last-child {
    color: red;
  }
  .content .info .m .temperatures .temperature.medium div:last-child {
    color: var(--primary-error-color);
  }
  .content .info .m .temperatures .status svg,
  .content .info .m .temperatures .temperature svg {
    width: var(--icon-size-normal);
    height: var(--icon-size-normal);
    fill: var(--secondary-light-color);
  }
  .content .info .m .temperatures .status.green svg {
    fill: var(--primary-green-color);
  }
  .content .info .m .temperatures .status.off svg,
  .content .info .m .temperatures .temperature.off svg {
    fill: var(--secondary-bg-color);
  }
  .content .info .m .temperatures .status.red svg,
  .content .info .m .temperatures .temperature.high svg {
    fill: red;
  }
  .content .info .m .temperatures .status.amber svg,
  .content .info .m .temperatures .temperature.medium svg {
    fill: var(--primary-error-color);
  }
  .content .info .m .temperatures .temperature .no-temp {
    display: flex;
    flex-direction: row;
    position: relative;
  }
  .content
    .info
    .m
    .temperatures
    .temperature
    .no-temp
    .svg-container:last-of-type {
    position: absolute;
    right: -4px;
  }
  .content
    .info
    .m
    .temperatures
    .temperature
    .no-temp
    .svg-container:last-of-type
    svg {
    width: var(--icon-size-xsmall);
    height: var(--icon-size-xsmall);
  }
  /*********** HEADER ***********/
  .header {
    text-align: center;
    border-bottom: var(--border-width) solid var(--primary-bg-color);
    padding: 10px;
    background-color: var(--primary-bg-alpha-color);
    color: var(--secondary-bg-color);
  }
  /*********** BOTTOM ***********/
  .bottom {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    column-gap: 10px;
    flex: 1;
    border-top: var(--border-width) solid var(--primary-bg-color);
    padding: 10px;
    background-color: var(--primary-bg-alpha-color);
  }
  .bottom sci-fi-button-select-card {
    --title-color: var(--secondary-bg-color);
    --label-text-color: var(--primary-light-color);
  }
  .bottom sci-fi-wheel {
    --item-font-size: var(--font-size-title);
    --item-color: var(--primary-light-color);
    --text-font-color: var(--secondary-bg-color);
  }
`;
