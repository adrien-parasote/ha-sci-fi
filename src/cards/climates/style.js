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
    padding: 5px 10px;
  }
  .header .info,
  .header .actions {
    display: flex;
    flex-direction: row;
    column-gap: 5px;
    align-items: center;
  }
  .header .info .text {
    color: var(--primary-light-color);
    text-shadow: 0px 0px 5px var(--primary-light-color);
  }
  .header .actions {
    justify-content: center;
    flex: 1;
  }
  .header .actions .action {
    display: flex;
    flex-direction: row;
    column-gap: 5px;
    align-items: center;
    border: var(--border-width) solid var(--secondary-bg-color);
    padding: 5px;
    border-radius: var(--border-radius);
    cursor: pointer;
    background: var(--secondary-light-light-alpha-color);
    color: var(--primary-light-color);
  }
  .header .actions sci-fi-icon {
    --icon-width: var(--icon-size-xsmall);
    --icon-height: var(--icon-size-xsmall);
  }
  .header .season {
    display: flex;
    align-items: center;
  }
  .header .season svg {
    width: var(--icon-size-normal);
    height: var(--icon-size-normal);
  }
  .header .season.blue svg {
    fill: #acd5f3;
  }
  .header .season.green svg {
    fill: #ace1af;
  }
  .header .season.yellow svg {
    fill: #fdda0d;
  }
  .header .season.orange svg {
    fill: #f47b20;
  }
  /*********** FLOORS *************/
  .floors {
    display: flex;
  }
  /*********** FLOOR CONTENT *************/
  .floor-content {
    display: flex;
    flex-direction: row;
    border-bottom: var(--border-width) solid var(--primary-bg-color);
    border-top: var(--border-width) solid var(--primary-bg-color);
    padding: 10px;
    justify-content: center;
    background-color: var(--primary-bg-alpha-color);
    color: var(--primary-light-color);
  }
  .floor-content .title {
    font-size: var(--font-size-normal);
    font-weight: bold;
    align-content: center;
  }
  .floor-content .title.off {
    color: var(--secondary-light-color);
  }
  .floor-content .temperature {
    display: flex;
    flex-direction: row;
    align-items: center;
    text-shadow: 0px 0px 5px var(--primary-light-color);
  }
  .floor-content .temperature sci-fi-icon {
    --icon-width: var(--icon-size-small);
    --icon-height: var(--icon-size-small);
  }
  .floor-content .temperature.off {
    color: var(--secondary-light-color);
  }

  .floor-content .temperature.off sci-fi-icon {
    --icon-color: var(--secondary-light-color);
  }
  /******** AREA LIST *********/
  .areas {
    display: flex;
    flex-direction: column;
    flex: 1;
  }
  .areas .area-list {
    display: flex;
  }
  .areas .area-list sci-fi-hexa-row {
    --hexa-row-selected-width: var(--medium-hexa-width);
    --hexa-row-icon-selected-height: var(--icon-size-title);
  }
  /******** AREA CONTENT *********/
  .areas .area-content {
    display: flex;
    flex: 1;
    align-items: start;
    flex-direction: column;
  }
  .area-content .climates {
    display: flex;
    flex-direction: column;
    row-gap: 10px;
    border-bottom: var(--border-width) solid var(--primary-bg-color);
    border-top: var(--border-width) solid var(--primary-bg-color);
    padding: 10px 0;
    background-color: var(--primary-bg-alpha-color);
    font-weight: bold;
    width: 100%;
    align-items: center;
  }
  .area-content .climates .title {
    font-size: var(--font-size-normal);
    color: var(--primary-light-color);
    font-weight: bold;
    text-align: center;
    width: 100%;
  }
  .area-content.off .climates .title {
    border-bottom-color: var(--secondary-light-alpha-color);
    color: var(--secondary-light-color);
  }

  .area-content .climates .slider {
    min-width: 368px;
    max-width: 368px;
    height: 300px;
    overflow: hidden;
  }

  .area-content .climates .slider .slides {
    display: flex;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    scroll-behavior: smooth;
    -webkit-overflow-scrolling: touch;
    height: 95%;
  }
  .area-content .climates .slider .slides > * {
    /*margin: 0 10px;*/
  }
  .area-content .climates .slider .slides::-webkit-scrollbar {
    width: 10px;
    height: 10px;
  }
  .area-content .climates .slider .slides::-webkit-scrollbar-thumb {
    background: black;
    border-radius: 10px;
  }
  .area-content .climates .slider .slides::-webkit-scrollbar-track {
    background: transparent;
  }
  .area-content .climates .slider .number {
    display: flex;
    flex-direction: row;
    justify-content: center;
    column-gap: 10px;
    margin-bottom: 10px;
  }
  .area-content .climates .slider .number > div {
    content: '';
    width: 10px;
    height: 10px;
    background-color: var(--primary-light-alpha-color);
    text-decoration: none;
    border-radius: 50%;
  }
  /* Don't need button navigation */
  @supports (scroll-snap-type) {
    .area-content .climates .slider .number > a {
      display: none;
    }
  }
`;
