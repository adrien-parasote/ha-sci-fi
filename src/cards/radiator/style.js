import {css} from 'lit';

export default css`
  :host {
    font-size: var(--font-size-small);
    height: 100%;
    width: 100%;
    background-color: black;
    /*
    --mr: calc(-1 * var(--default-hexa-width) / 2);
    --mt: calc(9 * var(--default-hexa-width) / 10);
    */
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
    fill: var(--primary-light-color);
    width: var(--icon-size-normal);
  }
  .floors sci-fi-hexa-tile .item-icon.off svg {
    fill: var(--secondary-light-color);
  }
  .floors sci-fi-hexa-tile.selected .item-icon svg {
    width: var(--icon-size-title);
  }
  /*********** FLOOR CONTENT *************/
  .floor-content {
    display: flex;
    flex-direction: column;
    border-bottom: var(--border-width) solid var(--primary-bg-color);
    border-top: var(--border-width) solid var(--primary-bg-color);
    padding: 10px 0;
    background-color: var(--primary-bg-alpha-color);
    color: var(--primary-light-color);
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
  /*********** AREAS *************/
  .areas {
    display: flex;
    flex-direction: row;
    align-self: center;
    margin: 10px 0;
    flex: 1;
  }
  .areas sci-fi-hexa-tile {
    --hexa-width: var(--default-hexa-width);
    height: fit-content;
  }
  .areas sci-fi-hexa-tile.selected {
    --hexa-width: var(--medium-hexa-width);
  }
  .areas sci-fi-hexa-tile .item-icon svg {
    fill: var(--primary-light-color);
    width: var(--icon-size-small);
  }
  .areas sci-fi-hexa-tile.selected .item-icon svg {
    width: var(--icon-size-normal);
  }
  .areas sci-fi-hexa-tile.selected .item-icon.off svg {
    fill: var(--secondary-light-color);
  }
  /*********** RADIATOR *************/
  .area-radiators {
    display: flex;
    flex-direction: column;
    color: var(--primary-light-color);
  }
  .area-radiators .title {
    font-size: var(--font-size-normal);
    border-bottom: var(--border-width) solid var(--primary-bg-color);
    border-top: var(--border-width) solid var(--primary-bg-color);
    background-color: var(--primary-bg-alpha-color);
    padding: 10px 0;
    margin-bottom: 10px;
    font-weight: bold;
    text-align: center;
    position: relative;
  }
  .area-radiators .title.off {
    border-bottom-color: var(--secondary-light-alpha-color);
    color: var(--secondary-light-color);
  }

  .area-radiators .temperature {
    display: flex;
    flex-direction: row;
    row-gap: 5px;
    align-items: center;
    text-shadow: 0px 0px 5px var(--primary-light-color);
    position: absolute;
    top: 10px;
    right: 10px;
    font-size: var(--font-size-xsmall);
  }
  .area-radiators .temperature svg {
    fill: var(--primary-light-color);
    width: var(--icon-size-xsmall);
    height: var(--icon-size-xsmall);
  }
  .area-radiators .temperature.off {
    color: var(--secondary-light-color);
  }
  .area-radiators .temperature.off svg {
    fill: var(--secondary-light-color);
  }

  .area-radiators .radiators {
    display: flex;
    flex-direction: row;
    column-gap: 10px;
  }
  .area-radiators .radiators .radiator {
    display: flex;
    flex-direction: column;
  }
`;
