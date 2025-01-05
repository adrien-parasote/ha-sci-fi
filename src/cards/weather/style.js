import {css} from 'lit';

export default css`
  :host {
    --default-hexa-size: 100px;
    --main-weather-icon-size: 150px;
    /*
    --planet-size: 100px;
    */
  }
  .container {
    display: flex;
    flex-direction: column;
    flex: 1;
  }
  /******** HEADER *********/
  .header {
    display: flex;
    flex-direction: row;
    justify-content: center;
    column-gap: 20px;
  }
  .header .card-corner {
    display: flex;
    flex-direction: row;
    padding-right: 30px;
  }
  .header .weather-icon svg {
    width: var(--main-weather-icon-size);
    height: var(--main-weather-icon-size);
  }
  .header .weather-clock {
    display: flex;
    flex-direction: column;
    align-self: center;
  }
  .header .weather-clock .state {
    text-align: end;
    font-size: var(--font-size-small);
  }
  .header .weather-clock .state::first-letter {
    text-transform: capitalize;
  }
  .header .weather-clock .hour {
    font-size: var(--font-size-large);
    text-align: center;
  }
  .header .weather-clock .date {
    font-size: var(--font-size-small);
  }
  /******** PLANET *********/
  /*
  sci-fi-hexa-tile {
    --hexa-width: var(--default-hexa-size);
    --hexa-height: var(--default-hexa-size);
    align-self: center;
  }
  .planet-svg-container {
    width: var(--planet-size);
    height: var(--planet-size);
  }
  .planet-svg-container svg {
    stroke: var(--secondary-light-color);
  }
  .planet-svg-container .ring {
    stroke-miterlimit: 10;
    fill: none;
    stroke-width: 10px;
    filter: url('#drop-shadow-filter');
  }
  .planet-svg-container .inner-ring {
    stroke-dasharray: 50, 90, 200, 30, 40, 0;
  }
  .planet-svg-container .planet {
    stroke-width: 4px;
    fill: none;
  }
  .planet-svg-container.bubble {
    fill: white;
    stroke-width: 0;
  }
  */
`;
