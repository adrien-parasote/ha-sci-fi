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
  }
  .header .info svg {
    fill: var(--primary-light-color);
    width: var(--icon-size-normal);
    height: var(--icon-size-normal);
  }
  .header .info .text {
    font-size: var(--font-size-small);
    color: var(--primary-light-color);
    text-shadow: 0px 0px 5px var(--primary-light-color);
  }
  .header .weather svg {
    width: var(--icon-size-title);
    height: var(--icon-size-title);
  }
  /******** COMMON *********/
  .title .power {
    float: right;
    color: var(--primary-light-color);
  }
  .title .power svg {
    width: var(--icon-size-xsmall);
    height: var(--icon-size-xsmall);
    fill: var(--primary-light-color);
    cursor: pointer;
  }
  .title .power.off {
    color: var(--secondary-light-color);
  }
  .title .power.off svg {
    fill: var(--secondary-light-color);
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
  .floors sci-fi-hexa-tile .item-icon svg {
    width: var(--icon-size-title);
    fill: var(--primary-light-color);
  }
  .floors sci-fi-hexa-tile .item-icon.off svg {
    fill: var(--secondary-bg-color);
  }
  .floors sci-fi-hexa-tile.selected {
    --hexa-width: var(--selected-hexa-width);
  }
  .floors sci-fi-hexa-tile.selected .item-icon svg {
    width: var(--icon-size-large);
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
  .area-content .lights .light.off svg {
    fill: var(--secondary-light-alpha-color);
  }
`;
