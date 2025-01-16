import {css} from 'lit';

export default css`
  :host {
    font-size: var(--font-size-small);
    height: 100%;
    width: 100%;
    background-color: black;
    --mr: calc(-1 * var(--default-hexa-width) / 2);
    --mt: calc(9 * var(--default-hexa-width) / 10);
  }
  .container {
    display: flex;
    flex-direction: column;
    width: 100%;
  }
  /*********** HOUSE *************/
  .house {
    display: flex;
    flex-direction: column;
    margin: 10px;
    position: relative;
    flex: 1;
  }
  .house .weather {
    position: absolute;
    top: 0;
    right: 0;
  }
  .house .weather svg {
    width: var(--icon-size-xlarge);
    height: var(--icon-size-xlarge);
  }
  .house .roof {
    height: 100px;
    aspect-ratio: 2;
    clip-path: polygon(50% 0, 100% 100%, 0 100%);
    background: var(--primary-bg-alpha-color);
  }
  .house .roof .info {
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  .house .roof .info .svg-container {
    margin-top: 10px;
  }
  .house .roof .info svg {
    fill: var(--primary-light-color);
    width: var(--icon-size-normal);
    height: var(--icon-size-normal);
  }
  .house .roof .info .text {
    color: var(--primary-light-color);
    text-shadow: 0px 0px 5px var(--primary-light-color);
  }
  /*********** HOUSE FLOORS *************/
  .house .floors {
    display: flex;
    flex-direction: column;
    padding: 10px;
    border-top: calc(2 * var(--border-width)) solid var(--primary-light-color);

    border-bottom: calc(2 * var(--border-width)) solid
      var(--primary-light-color);
  }
  .house .floors .floor {
    display: flex;
    flex-direction: row;
    padding: 10px 0;
  }
  .house .floors .floor:not(:first-child) {
    border-top: var(--border-width) dashed var(--secondary-bg-color);
  }
  .house .floors .floor:first-child {
    padding-top: 5px;
  }
  .house .floors .floor:last-child {
    padding-bottom: 5px;
  }
  .house .floors .floor .info {
    font-size: var(--font-size-xsmall);
    display: flex;
    align-items: center;
  }
  .house .floors .floor .info sci-fi-hexa-tile {
    --hexa-width: var(--medium-hexa-width);
    align-items: baseline;
  }
  .house .floors .floor .info sci-fi-hexa-tile .item-icon svg {
    fill: var(--primary-light-color);
    width: var(--icon-size-normal);
    height: var(--icon-size-normal);
  }
  .house .floors .floor .info sci-fi-hexa-tile .info-temp {
    color: var(--secondary-light-color);
  }
  .house .floors .floor .info sci-fi-hexa-tile.off .item-icon svg {
    fill: var(--secondary-light-color);
  }
  .house .floors .floor .info sci-fi-hexa-tile.on .info-temp {
    color: var(--primary-light-color);
    text-shadow: 0px 0px 5px var(--primary-light-color);
  }
  /*********** HOUSE FLOOR AREAS *************/
  .house .floors .floor .areas {
    display: flex;
    flex-direction: row;
    flex: 1;
    font-size: var(--font-size-xsmall);
    justify-content: center;
  }
  .house .floors .floor .areas.card-corner {
    padding: 0 10px;
  }
  .house .floors .floor .areas sci-fi-hexa-tile {
    --hexa-width: var(--default-hexa-width);
    align-items: baseline;
  }
  .house .floors .floor .areas sci-fi-hexa-tile:not(:first-child) {
    margin-left: var(--mr);
  }
  .house .floors .floor .areas sci-fi-hexa-tile.odd {
    margin-top: var(--mt);
  }
  .house .floors .floor .areas sci-fi-hexa-tile .item-icon svg {
    fill: var(--primary-light-color);
    width: var(--icon-size-normal);
    height: var(--icon-size-normal);
  }
  .house .floors .floor .areas sci-fi-hexa-tile .area-temp {
    color: var(--secondary-light-color);
  }
  .house .floors .floor .areas sci-fi-hexa-tile.off .item-icon svg {
    fill: var(--secondary-light-color);
  }
  .house .floors .floor .areas sci-fi-hexa-tile.on .area-temp {
    color: var(--primary-light-color);
    text-shadow: 0px 0px 5px var(--primary-light-color);
  }
  /*********** RADIATOR *************/
  .area-radiators {
    display: flex;
    flex-direction: column;
    border-top: var(--border-width) solid var(--primary-bg-color);
    background-color: var(--primary-bg-alpha-color);
  }
  .area-radiators .label {
    color: var(--primary-light-color);
    text-shadow: 0px 0px 5px var(--primary-light-color);
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
