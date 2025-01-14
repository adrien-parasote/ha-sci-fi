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
  /*********** GLOBAL *************/
  .global {
    padding: 10px;
    display: flex;
    flex-direction: row;
    background-color: var(--primary-bg-alpha-color);
    border-bottom: var(--border-width) solid var(--primary-bg-color);
    align-items: center;
  }
  .global sci-fi-hexa-tile {
    --hexa-width: var(--default-hexa-width);
  }
  .global sci-fi-hexa-tile .temp-text {
    font-size: var(--font-size-xsmall);
    display: ruby-text;
  }
  .global sci-fi-hexa-tile .item-icon svg {
    margin-top: 5px;
    fill: var(--primary-light-color);
    width: var(--icon-size-normal);
    height: var(--icon-size-normal);
  }
  .global sci-fi-hexa-tile .item-icon.off svg {
    fill: var(--secondary-light-color);
  }
  .global .card-corner {
    flex: 1;
    padding: 5px;
    text-align: center;
  }
  .global .card-corner > div {
    display: inline-block;
    margin: 5px;
  }
  .global .card-corner .floor-temperature {
    display: flex;
    flex-direction: row;
    column-gap: 5px;
    border: var(--border-width) solid var(--primary-bg-color);
    border-radius: var(--border-radius);
    width: fit-content;
  }
  .global .card-corner .floor-temperature .item-icon {
    background-color: var(--primary-bg-color);
    border-top-left-radius: 4px;
    border-bottom-left-radius: 4px;
    padding: 2px 2px 0 2px;
  }
  .global .card-corner .floor-temperature .item-icon svg {
    fill: var(--secondary-light-color);
    width: var(--icon-size-small);
    height: var(--icon-size-small);
  }
  .global .card-corner .floor-temperature .floor-name {
    align-content: center;
    font-size: var(--font-size-xsmall);
    color: var(--secondary-light-color);
  }
  .global .card-corner .floor-temperature .floor-temp {
    align-content: center;
    margin-right: 5px;
    color: var(--primary-light-color);
    text-shadow: 0px 0px 5px var(--primary-light-color);
  }

  /*********** RADIATORS *************/
  .radiators {
  }

  /*********** RADIATOR INFO *************/
  .radiator-content {
    flex: 1;
  }
`;
