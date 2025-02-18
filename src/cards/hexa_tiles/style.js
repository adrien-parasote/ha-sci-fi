import {css} from 'lit';

export default css`
  :host {
    --tile-width: 155px;
    --tile-height: calc(var(--tile-width) * 1.1547);
    --icon-size: 50px;

    background-color: black;
    height: 100%;
  }
  /******** COMMON *********/
  .container .hexa-row {
    display: flex;
    flex-direction: row;
    height: var(--tile-height);
    justify-content: center;
    margin-bottom: calc(var(--tile-height) * -0.2);
  }
  /******** HEADER *********/
  .container .header {
    display: flex;
    flex-direction: row;
    column-gap: 15px;
    margin: 10px;
  }
  .container .header sci-fi-person {
    --custom-avatar-size: var(--icon-size-large);
  }
  .container .header .info {
    display: flex;
    flex-direction: column;
    row-gap: 5px;
    justify-content: center;
  }
  .container .header .info .message {
    font-size: var(--font-size-normal);
    color: var(--secondary-light-color);
    text-transform: capitalize;
  }
  .container .header .info .name {
    font-size: var(--font-size-title);
    font-weight: bold;
    text-shadow: 0px 0px 5px var(--primary-light-color);
  }
  /******** TILES *********/
  .container .hexa-row sci-fi-hexa-tile,
  .container .hexa-row sci-fi-half-hexa-tile {
    --hexa-width: var(--tile-width);
    --hexa-height: var(--tile-height);
  }
  sci-fi-hexa-tile .item-name {
    margin-top: 10px;
  }
  #weather-tile .item-name {
    margin-top: 0;
  }
  .container .hexa-row sci-fi-hexa-tile sci-fi-icon {
    --icon-width: var(--icon-size);
    --icon-height: var(--icon-size);
  }
  .container .hexa-row sci-fi-weather-icon {
    --weather-icon-width: var(--icon-size);
    --weather-icon-height: var(--icon-size);
  }
  .container .hexa-row sci-fi-hexa-tile[active-tile] sci-fi-icon {
    --icon-color: var(--primary-light-color);
  }
  .container .hexa-row sci-fi-hexa-tile[active-tile].state-off sci-fi-icon {
    --icon-color: var(--secondary-light-alpha-color);
  }
  .container .hexa-row sci-fi-hexa-tile[active-tile].state-error sci-fi-icon {
    --icon-color: var(--primary-error-color);
  }
`;
