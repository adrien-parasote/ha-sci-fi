import {css} from 'lit';

export default css`
  :host {
    --light-on-color: rgb(255, 193, 7);

    background-color: black;
    height: 100%;
    width: 100%;
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
    border-bottom: var(--border-width) solid var(--primary-bg-color);
    background-color: var(--primary-bg-alpha-color);
    padding: 5px 10px 0 10px;
  }
  .header .info {
    flex: 1;
    display: flex;
    flex-direction: row;
    column-gap: 5px;
    align-items: center;
    padding-bottom: 5px;
  }
  .header .info .power {
    cursor: pointer;
  }
  .header .info .power.off sci-fi-icon {
    --icon-color: var(--secondary-light-color);
  }
  .header .info .text {
    font-size: var(--font-size-normal);
    color: var(--primary-light-color);
    text-shadow: 0px 0px 5px var(--primary-light-color);
  }
  .header .weather {
    display: flex;
  }
  /******** COMMON *********/
  .title .power {
    float: right;
    color: var(--primary-light-color);
  }
  .title .power sci-fi-icon {
    --icon-width: var(--icon-size-xsmall);
    --icon-height: var(--icon-size-xsmall);
    cursor: pointer;
  }
  .title .power.off {
    color: var(--secondary-light-color);
  }
  .title .power.off sci-fi-icon {
    --icon-color: var(--secondary-light-color);
  }
  /******** FLOORS *********/
  .floors {
    display: flex;
    flex-direction: row;
    column-gap: 5px;
    justify-content: center;
    align-items: center;
    margin-top: 10px;
  }
  .floors sci-fi-hexa-tile {
    --hexa-width: var(--default-hexa-width);
  }
  .floors sci-fi-hexa-tile .item-icon sci-fi-icon {
    --icon-width: var(--icon-size-title);
    --icon-height: var(--icon-size-title);
  }
  .floors sci-fi-hexa-tile .item-icon.off sci-fi-icon {
    --icon-color: var(--secondary-bg-color);
  }
  .floors sci-fi-hexa-tile.selected {
    --hexa-width: var(--selected-hexa-width);
  }
  .floors sci-fi-hexa-tile.selected .item-icon sci-fi-icon {
    --icon-width: var(--icon-size-large);
    --icon-height: var(--icon-size-large);
  }
  /******** FLOOR CONTENT *********/
  .floor-content {
    display: flex;
    flex-direction: column;
    border-bottom: var(--border-width) solid var(--primary-bg-color);
    border-top: var(--border-width) solid var(--primary-bg-color);
    padding: 10px 0;
    margin: 10px 0 20px 0;
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
    border-bottom-color: var(--secondary-bg-color);
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
    height: calc(var(--hexa-max-count) * var(--default-hexa-width) + 10px);
  }
  .areas .area-list .row {
    display: flex;
    flex-direction: row;
    margin-bottom: calc(var(--default-hexa-width) * -0.38);
  }
  .areas .area-list .row sci-fi-hexa-tile {
    --hexa-width: var(--default-hexa-width);
  }
  .areas .area-list .row sci-fi-hexa-tile .item-icon sci-fi-icon {
    --icon-width: var(--icon-size-title);
    --icon-height: var(--icon-size-title);
  }
  .areas .area-list .row sci-fi-hexa-tile .item-icon.off sci-fi-icon {
    --icon-color: var(--secondary-bg-color);
  }
  /******** AREA CONTENT *********/
  .areas .area-content {
    display: flex;
    flex: 1;
    align-items: start;
    flex-direction: column;
    color: var(--primary-light-color);
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
    border-bottom-color: var(--secondary-bg-color);
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
    border-color: var(--secondary-bg-color);
    color: var(--secondary-light-color);
  }
  .area-content .lights .light sci-fi-icon {
    --icon-color: var(--light-on-color);
  }
  .area-content .lights .light.off sci-fi-icon {
    --icon-color: var(--secondary-bg-color);
  }
`;
