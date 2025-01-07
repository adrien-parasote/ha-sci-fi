import {css} from 'lit';

export default css`
  :host {
    --default-hexa-width: 60px;
    --main-weather-icon-size: 150px;
    --daily-weather-icon-size: var(--icon-size-title);
    --sensor-weather-icon-size: var(--icon-size-small);
    font-size: var(--font-size-xsmall);
  }
  .container {
    display: flex;
    flex-direction: column;
    width: 100%;
  }
  .card-corner {
    display: flex;
    flex-direction: column;
    row-gap: 10px;
    margin: 20px;
  }
  /******** HEADER *********/
  .header {
    display: flex;
    flex-direction: row;
    justify-content: center;
    column-gap: 20px;
  }
  .header .weather-icon svg {
    width: var(--main-weather-icon-size);
    height: var(--main-weather-icon-size);
  }
  .header .weather-clock {
    display: flex;
    flex-direction: column;
    align-self: center;
    color: var(--secondary-light-alpha-color);
  }
  .header .weather-clock .state {
    text-align: end;
  }
  .header .weather-clock .state::first-letter {
    text-transform: capitalize;
  }
  .header .weather-clock .hour {
    font-size: var(--font-size-large);
    text-align: center;
    color: var(--primary-light-color);
    text-shadow: 0px 0px 5px var(--secondary-light-color);
  }
  /******** TODAY SUMMARY *********/
  .today-summary {
    display: flex;
    flex-direction: row;
    column-gap: 10px;
    align-self: center;
  }
  .today-summary .sensor {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1;
    min-width: 55px;
  }
  .today-summary .sensor .state svg {
    width: var(--sensor-weather-icon-size);
    height: var(--sensor-weather-icon-size);
  }
  .today-summary div .label {
    color: var(--secondary-light-alpha-color);
    text-align: center;
    color: var(--primary-light-color);
    text-shadow: 0px 0px 5px var(--secondary-light-color);
  }
  /******** DAILY FORECAST *********/
  .days-forecast {
    display: grid;
    border-bottom: var(--border-width) solid var(--primary-bg-color);
    border-top: var(--border-width) solid var(--primary-bg-color);
    padding: 20px 10px;
    background-color: var(--primary-bg-alpha-color);
    color: var(--secondary-light-color);
    font-weight: bold;
  }
  .days-forecast .content {
    display: flex;
    flex-wrap: nowrap;
    overflow-x: auto;
    gap: 5px;
    -webkit-overflow-scrolling: touch;
    &::-webkit-scrollbar {
      display: none;
    }
  }
  .days-forecast .content .weather {
    border: var(--border-width) solid var(--secondary-light-alpha-color);
    border-radius: var(--border-radius);
    padding: 10px 15px;
  }
  .days-forecast .content .weather .state .svg-container {
    justify-self: center;
  }
  .days-forecast .content .weather .state svg {
    width: var(--daily-weather-icon-size);
    height: var(--daily-weather-icon-size);
  }
  .days-forecast .content .weather .label,
  .days-forecast .content .weather .temp {
    text-align: center;
  }
  .days-forecast .content .weather .label {
    margin-bottom: 5px;
  }
  .days-forecast .content .weather .temp {
    color: var(--primary-light-color);
    text-shadow: 0px 0px 5px var(--secondary-light-color);
  }
  .days-forecast .content .weather .temp.hight {
    color: var(--primary-error-color);
    text-shadow: 0px 0px 5px var(--primary-error-alpha-color);
  }
  /******** DAILY FORECAST *********/
  .chart-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    row-gap: 10px;
    height: 200px;
  }
  .chart-container .content {
    flex: 1;
  }
`;
