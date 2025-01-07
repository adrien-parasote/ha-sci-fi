import {css} from 'lit';

export default css`
  :host {
    --default-hexa-width: 60px;
    --main-weather-icon-size: 150px;
    font-size: var(--font-size-xsmall);
  }
  .container {
    display: flex;
    flex-direction: column;
    width: 100%;
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
    width: var(--icon-size-title);
    height: var(--icon-size-title);
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
  /******** TODAY SUMMARY *********/
  .summary {
    display: flex;
    flex-direction: row;
    column-gap: 20px;
    margin: 20px;
  }
  .summary .card-corner {
    height: 100%;
    padding: 0;
    justify-content: center;
  }
  .summary .card-corner:last-of-type {
    flex: 1;
  }
  .today-summary {
    display: flex;
    flex-direction: column;
    align-self: center;
  }
  .today-summary .sensor {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 55px;
    padding: 10px;
  }
  .today-summary .sensor .state svg {
    width: var(--icon-size-small);
    height: var(--icon-size-small);
  }
  .today-summary div .label {
    color: var(--secondary-light-alpha-color);
    text-align: center;
  }
  .today-summary div .label:last-of-type {
    color: var(--primary-light-color);
    text-shadow: 0px 0px 5px var(--secondary-light-color);
  }
  /******** CHART *********/
  .chart-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    row-gap: 10px;
    padding: 10px;
  }
  .chart-container .header {
    display: flex;
    flex-direction: row;
  }
  .chart-container .header .title {
    display: flex;
    flex: 1;
    flex-direction: row;
  }
  .chart-container .header .title svg {
    width: var(--icon-size-large);
    height: var(--icon-size-large);
  }
  .chart-container .header .title .label {
    align-self: center;
    font-size: var(--font-size-normal);
    color: var(--primary-light-color);
    text-shadow: 0px 0px 5px var(--secondary-light-color);
  }
`;
