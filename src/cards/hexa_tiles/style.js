import {css} from 'lit';

export default css`
  :host {
    --icon-size: 50px;
    --hexa-width: 155px;
    --hexa-height: calc(var(--hexa-width) * 1.1547);
    background-color: black;
  }
  /******** COMMON *********/
  .container {
    display: flex;
    flex-direction: column;
    flex: 1;
  }
  .container .hexa-row {
    display: flex;
    flex-direction: row;
    height: var(--hexa-height);
    justify-content: center;
    margin-bottom: calc(var(--hexa-height) * -0.2);
  }
  .container .hexa-row .hexa {
    width: var(--hexa-width);
  }
  .container .hexa-row .half {
    width: calc(var(--hexa-width) / 2);
  }
  .container .hexa-row .hexa svg .background {
    fill: var(--primary-bg-color);
    stroke-width: 4px;
    stroke: var(--secondary-bg-color);
    stroke-opacity: 0.8;
    stroke-linejoin: round;
  }
  /******** HEADER *********/
  .container .header {
    display: flex;
    flex-direction: row;
    column-gap: 15px;
    margin: 10px;
  }
  .container .header sci-fi-person {
    --custom-avatar-size: var(--icon-size-large);
  }
  .container .header .info {
    display: flex;
    flex-direction: column;
    row-gap: 5px;
    justify-content: center;
  }
  .container .header .info .message {
    font-size: var(--font-size-normal);
    color: var(--secondary-light-color);
    text-transform: capitalize;
  }
  .container .header .info .name {
    font-size: var(--font-size-title);
    font-weight: bold;
    text-shadow: 0px 0px 5px var(--primary-light-color);
  }
  /******** ACTIVE TILES *********/
  .container .hexa-row .hexa svg .border {
    fill: var(--primary-bg-color);
    stroke: var(--secondary-light-alpha-color);
    stroke-width: 5px;
    stroke-linejoin: round;
  }
  .container .hexa-row .item {
    position: relative;
  }
  .container .hexa-row .item:hover {
    cursor: pointer;
  }
  .container .hexa-row .item .item-content {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
  }
  .container .hexa-row .item .item-content .item-name {
    margin-top: 10px;
  }
  .container .hexa-row .item .item-content .item-icon svg {
    width: var(--icon-size);
  }
  .container .hexa-row .item-on svg .border {
    stroke: var(--primary-light-color);
  }
  .container .hexa-row .item-on .item-content {
    color: var(--primary-light-color);
    text-shadow: 0px 0px 5px var(--secondary-light-color);
  }
  .container .hexa-row .item-on .item-content .item-icon svg {
    fill: var(--primary-light-color);
  }
  .container .hexa-row .item-off .item-content {
    color: var(--secondary-light-alpha-color);
    text-shadow: none;
  }
  .container .hexa-row .item-off .item-content .item-icon svg {
    fill: var(--secondary-light-alpha-color);
  }
  .container .hexa-row .item-error svg .border {
    stroke: var(--primary-error-color);
  }
  .container .hexa-row .item-error .item-content {
    color: var(--primary-error-color);
    text-shadow: 0px 0px 5px var(--primary-error-alpha-color);
  }
  .container .hexa-row .item-error .item-content .item-icon svg {
    fill: var(--primary-error-color);
  }
`;
