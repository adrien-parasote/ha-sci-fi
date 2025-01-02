import {css} from 'lit';

export default css`
  :host {
    --default-hexa-width: 60px;
    --selected-hexa-width: 80px;

    --light-on-color: rgb(255, 193, 7);

    background-color: black;
    height: 100%;
  }
  .container {
    display: flex;
    flex-direction: column;
    flex: 1;
  }
  /******** COMMON *********/
  svg {
    fill: var(--primary-light-color);
  }
  .off {
    color: var(--secondary-light-color) !important;
  }
  .off svg {
    fill: var(--secondary-light-color) !important;
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
  .title .power {
    float: right;
  }
  .title .power svg {
    width: var(--icon-size-xsmall);
    height: var(--icon-size-xsmall);
  }
  .title .power svg:hover {
    cursor: pointer;
  }
  /******** FLOORS *********/
  .floors {
    display: flex;
    flex-direction: row;
    column-gap: 10px;
    justify-content: center;
    align-items: center;
    margin-top: 20px;
  }
  .floors sci-fi-hexa-tile {
    --hexa-width: var(--default-hexa-width);
  }
  .floors sci-fi-hexa-tile .item-icon svg {
    width: var(--icon-size-title);
  }
  .floors sci-fi-hexa-tile.selected {
    --hexa-width: var(--selected-hexa-width);
  }
  .floors sci-fi-hexa-tile.selected .item-icon svg {
    width: var(--icon-size-large);
  }
  /******** FLOOR CONTENT *********/
  .floor-content {
    display: flex;
    flex-direction: column;
    border-bottom: var(--border-width) solid var(--primary-bg-color);
    border-top: var(--border-width) solid var(--primary-bg-color);
    padding: 10px 0;
    margin: 20px 0 40px 0;
    background-color: var(--primary-bg-alpha-color);
  }
  .floor-content .info {
    display: flex;
    color: var(--primary-light-color);
    flex-direction: column;
    margin: auto;
    min-width: 250px;
  }
  .floor-content .info .title {
    font-size: var(--font-size-normal);
    border-bottom: var(--border-width) solid var(--primary-light-color);
    padding-bottom: 5px;
    margin-bottom: 5px;
    font-weight: bold;
    text-align: center;
  }
  .floor-content .info.off .title {
    border-bottom-color: var(--secondary-light-alpha-color);
  }
  .floor-content .info .floor-lights {
    display: flex;
    flex-direction: row;
    justify-content: center;
    column-gap: 10px;
  }
  .floor-content .info .floor-lights > div {
    border-radius: 50%;
    height: 10px;
    width: 10px;
    background-color: var(--light-on-color);
  }
  .floor-content .info .floor-lights > div.off {
    background-color: var(--primary-light-alpha-color);
  }
  .floor-content .areas {
    display: flex;
    flex-direction: column;
    flex: 1;
  }
  /******** AREA LIST *********/
  .areas {
    display: flex;
    flex-direction: row;
    padding: 0 10px;
  }
  .areas .area-list .row {
    display: flex;
    flex-direction: row;
    margin-bottom: calc(var(--default-hexa-width) * -0.38);
  }
  .areas .area-list .row sci-fi-hexa-tile {
    --hexa-width: var(--default-hexa-width);
  }
  .areas .area-list .row sci-fi-hexa-tile .item-icon svg {
    width: var(--icon-size-title);
  }
  /******** AREA CONTENT *********/
  .areas .area-content {
    display: flex;
    flex: 1;
    align-items: start;
    flex-direction: column;
    color: var(--primary-light-color);
    height: 100%;
  }
  .area-content .title {
    font-size: var(--font-size-normal);
    border-bottom: var(--border-width) solid var(--primary-light-color);
    padding-bottom: 5px;
    margin-bottom: 5px;
    font-weight: bold;
    text-align: center;
    width: 100%;
    min-height: 23px;
  }
  .area-content.off .title {
    border-bottom-color: var(--secondary-light-alpha-color);
  }
  .area-content .lights {
    align-self: center;
    display: grid;
    grid-template-columns: 30% 30% 30%;
    gap: 5px;
    padding: 10px 0;
    justify-content: center;
    width: 100%;
  }
  .area-content .lights .light {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    font-size: var(--font-size-small);
    padding: 5px;
    border-radius: var(--border-radius);
    border: var(--border-width) solid var(--primary-light-color);
  }
  .area-content .lights .light:hover {
    cursor: pointer;
  }
  .area-content .lights .light.off {
    border-color: var(--secondary-light-alpha-color);
  }
  .area-content .lights .light svg {
    width: var(--icon-size-normal);
    height: var(--icon-size-normal);
    fill: var(--light-on-color);
  }
`;
