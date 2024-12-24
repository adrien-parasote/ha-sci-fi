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
    border: var(--border-width) solid var(--primary-light-color);
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
  .header .floor-info ul {
    margin: 0;
    font-size: var(--font-size-small);
    list-style-type: disclosure-closed;
  }
  /******** DISPLAY MENU *********/
  .content {
    display: flex;
    flex-direction: row;
  }
  .content .left {
    display: flex;
    flex-direction: column;
    margin-left: calc(var(--wheel-hexa-width) / 2);
    border-left: calc(var(--border-width) * 2) solid var(--primary-light-color);
    padding-left: 10px;
    position: relative;
    margin-top: 5px;
  }
  .content .left.off {
    border-left-color: var(--secondary-light-alpha-color);
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
  /******** DISPLAY AREA CONTENT *********/
  .content .area-info {
    display: flex;
    flex-direction: column;
    align-items: start;
    color: var(--primary-light-color);
    height: 100%;
  }
  .content .area-info .title {
    font-size: var(--font-size-normal);
    border-bottom: var(--border-width) solid var(--primary-light-color);
    padding-bottom: 5px;
    margin-bottom: 5px;
    font-weight: bold;
    text-align: center;
    width: 100%;
  }
  .content .area-info .title .power {
    float: right;
  }
  .content .area-info .title .power svg {
    width: var(--icon-size-small);
    height: var(--icon-size-small);
    fill: var(--primary-light-color);
  }
  .content .area-info .title .power svg:hover {
    cursor: pointer;
  }
  .content .area-info.off .title .power svg {
    fill: var(--secondary-light-color);
  }
  .content .area-info.off {
    color: var(--secondary-light-color);
  }
  .content .area-info.off .title {
    border-bottom-color: var(--secondary-light-alpha-color);
  }
  .content .area-info .lights {
    align-self: center;
    display: grid;
    grid-template-columns: var(--area-hexa-width) var(--area-hexa-width);
    gap: 10px;
    padding: 0 10px;
  }
  .content .area-info .lights .light {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    font-size: var(--font-size-small);
    padding: 5px;
    border-radius: var(--border-radius);
    border: var(--border-width) solid var(--primary-light-color);
    color: var(--primary-light-color);
  }
  .content .area-info .lights .light:hover {
    cursor: pointer;
  }
  .content .area-info .lights .light.off {
    border-color: var(--secondary-light-alpha-color);
    color: var(--secondary-light-color);
  }
  .content .area-info .lights .light svg {
    width: var(--icon-size-normal);
    height: var(--icon-size-normal);
    fill: var(--primary-light-color);
  }
  .content .area-info .lights .light.off svg {
    fill: var(--secondary-light-color);
  }
`;
