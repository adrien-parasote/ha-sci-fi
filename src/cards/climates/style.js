import {css} from 'lit';

export default css`
  :host {
    font-size: var(--font-size-small);
    height: 100%;
    width: 100%;
    background-color: black;
  }
  .container {
    display: flex;
    flex-direction: column;
    width: 100%;
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
  }
  .header .info svg {
    fill: var(--primary-light-color);
    width: var(--icon-size-normal);
    height: var(--icon-size-normal);
  }
  .header .info .text {
    color: var(--primary-light-color);
    text-shadow: 0px 0px 5px var(--primary-light-color);
  }
  .header .weather svg {
    width: var(--icon-size-title);
    height: var(--icon-size-title);
  }
  /*********** FLOORS *************/
  .floors {
    display: flex;
    flex-direction: row;
    column-gap: 5px;
    justify-content: center;
    align-items: center;
    margin: 10px 0;
  }
  .floors sci-fi-hexa-tile {
    --hexa-width: var(--default-hexa-width);
  }
  .floors sci-fi-hexa-tile.selected {
    --hexa-width: var(--selected-hexa-width);
  }
  .floors sci-fi-hexa-tile .item-icon svg {
    width: var(--icon-size-title);
    fill: var(--primary-light-color);
  }
  .floors sci-fi-hexa-tile .item-icon.off svg {
    fill: var(--secondary-bg-color);
  }
  .floors sci-fi-hexa-tile.selected .item-icon svg {
    width: var(--icon-size-large);
  }
  /*********** FLOOR CONTENT *************/
  .floor-content {
    display: flex;
    flex-direction: column;
    border-bottom: var(--border-width) solid var(--primary-bg-color);
    border-top: var(--border-width) solid var(--primary-bg-color);
    padding: 10px 0 5px 0;
    background-color: var(--primary-bg-alpha-color);
    color: var(--primary-light-color);
    margin-bottom: 20px;
  }
  .floor-content .title {
    font-size: var(--font-size-normal);
    border-bottom: var(--border-width) solid var(--primary-light-color);
    padding-bottom: 5px;
    margin-bottom: 5px;
    font-weight: bold;
    text-align: center;
    margin: auto;
    min-width: 250px;
  }
  .floor-content .title.off {
    border-bottom-color: var(--secondary-light-alpha-color);
    color: var(--secondary-light-color);
  }
  .floor-content .temperature {
    display: flex;
    flex-direction: row;
    row-gap: 5px;
    align-items: center;
    justify-content: center;
    margin-top: 5px;
    text-shadow: 0px 0px 5px var(--primary-light-color);
  }
  .floor-content .temperature svg {
    fill: var(--primary-light-color);
    width: var(--icon-size-small);
    height: var(--icon-size-small);
  }
  .floor-content .temperature.off {
    color: var(--secondary-light-color);
  }

  .floor-content .temperature.off svg {
    fill: var(--secondary-light-color);
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
    fill: var(--primary-light-color);
  }
  .areas .area-list .row sci-fi-hexa-tile .item-icon.off svg {
    fill: var(--secondary-bg-color);
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
    margin-bottom: 15px;
    font-weight: bold;
    text-align: center;
    width: 100%;
  }
  .area-content.off .title {
    border-bottom-color: var(--secondary-light-alpha-color);
    color: var(--secondary-light-color);
  }
  .area-content .climates {
    align-self: center;
    display: flex;
    flex-direction: column;
    row-gap: 5px;
    justify-content: center;
  }
`;
