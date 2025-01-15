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
  sci-fi-hexa-tile {
    --hexa-width: var(--default-hexa-width);
  }
  sci-fi-hexa-tile .item-icon svg {
    margin-top: 5px;
    fill: var(--primary-light-color);
    width: var(--icon-size-normal);
    height: var(--icon-size-normal);
  }
  sci-fi-hexa-tile .item-icon.off svg {
    fill: var(--secondary-light-color);
  }
  sci-fi-hexa-tile .text {
    font-size: var(--font-size-xsmall);
    display: ruby-text;
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
    display: grid;
    border-bottom: var(--border-width) solid var(--primary-bg-color);
    border-top: var(--border-width) solid var(--primary-bg-color);
    padding: 20px 10px;
    background-color: var(--primary-bg-alpha-color);
    color: var(--secondary-light-color);
    font-weight: bold;
  }
  .radiators .content {
    display: flex;
    flex-wrap: nowrap;
    overflow-x: auto;
    gap: 5px;
    -webkit-overflow-scrolling: touch;
    &::-webkit-scrollbar {
      display: none;
    }
  }
  .radiators .radiator-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    border: var(--border-width) solid var(--secondary-light-alpha-color);
    border-radius: var(--border-radius);
    padding: 5px;
    min-width: 50px;
    font-size: var(--font-size-xsmall);
    justify-content: center;
    cursor: pointer;
  }
  .radiators .radiator-state.focus {
    background-color: var(--secondary-light-light-alpha-color);
  }
  .radiators .radiator-state.on {
    color: var(--primary-light-color);
    text-shadow: 0px 0px 5px var(--primary-light-color);
    border: var(--border-width) solid var(--primary-light-alpha-color);
  }
  .radiators .radiator-state .item-icon svg {
    fill: var(--primary-light-color);
    width: var(--icon-size-normal);
    height: var(--icon-size-normal);
  }
  .radiators .radiator-state .item-icon.off svg {
    fill: var(--secondary-light-color);
  }
  /*********** RADIATOR INFO *************/
  .radiator-content {
    flex: 1;
  }
`;
