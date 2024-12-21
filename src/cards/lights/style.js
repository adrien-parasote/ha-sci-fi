import {css} from 'lit';

export default css`
  :host {
    --wheel-hexa-width: 100px;
    --area-hexa-width: 60px;

    background-color: black;
    height: 100%;
    padding: 10px;
  }
  /******** COMMON *********/
  .container {
    display: flex;
    flex-direction: column;
    flex: 1;
  }
  sci-fi-wheel {
    --hexa-width: var(--wheel-hexa-width);
  }
  .h-separator {
    margin: 0 3px;
    display: flex;
    flex-direction: row;
    align-items: center;
  }
  .h-separator.hide {
    display: none;
  }
  .circle {
    width: 6px;
    height: 6px;
    border: var(--border-width) solid var(--secondary-bg-color);
    background: var(--primary-light-color);
    border-radius: 50%;
  }
  .circle.off {
    background-color: var(--secondary-light-alpha-color);
  }
  .h-path {
    content: '';
    border: var(--border-width) solid var(--secondary-bg-color);
    width: 25px;
  }
  .h-path.off {
    border-color: var(--secondary-light-alpha-color);
  }
  .card-corner {
    width: 100%;
    height: fit-content;
    display: flex;
    flex-direction: column;
  }
  .card-corner.off {
    border-color: var(--secondary-light-alpha-color);
  }
  /******** DISPLAY HEADER *********/
  .header {
    display: flex;
    flex-direction: row;
    align-items: center;
  }
  .header sci-fi-wheel {
    --icon-size: var(--icon-size-title);
  }
  .header .floor-info {
    color: var(--primary-light-color);
  }
  .header .floor-info .title {
    font-size: var(--font-size-normal);
    border-bottom: var(--border-width) solid var(--primary-light-color);
    padding-bottom: 5px;
    margin-bottom: 5px;
    font-weight: bold;
    text-align: center;
  }
  .header .floor-info.off {
    color: var(--secondary-light-color);
  }
  .header .floor-info.off .title {
    border-bottom-color: var(--secondary-light-alpha-color);
  }
  .header .floor-info .rooms,
  .header .floor-info .devices {
    margin-left: 10px;
    font-size: var(--font-size-small);
  }
  ul {
    margin: 0;
    list-style-type: disclosure-closed;
  }
  /******** DISPLAY CONTENT *********/
  .content {
    display: flex;
    flex-direction: row;
  }
  .content .left {
    display: flex;
    flex-direction: column;
    margin-left: calc(var(--wheel-hexa-width) / 2);
    border-left: calc(var(--border-width) * 2) solid var(--secondary-bg-color);
    padding-left: 10px;
    position: relative;
    margin-top: 5px;
  }
  .content .left .left-circle {
    position: absolute;
    top: -6px;
    left: -5px;
  }
  .content .left .row {
    display: flex;
    flex-direction: row;
    margin-bottom: calc(var(--area-hexa-width) * -0.38);
  }
  .content .left .row sci-fi-hexa-tile {
    --hexa-width: var(--area-hexa-width);
  }
  .content .left .row sci-fi-hexa-tile .item-icon svg {
    width: var(--icon-size-title);
  }
  .content .left .row sci-fi-hexa-tile[active] .item-icon svg {
    fill: var(--primary-light-color);
  }
  .content .left .row sci-fi-hexa-tile[active].off .item-icon svg {
    fill: var(--secondary-light-alpha-color);
  }
  .content .right {
    height: 100%;
    flex: 1;
  }
`;
