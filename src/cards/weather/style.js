import {css} from 'lit';

export default css`
  :host {
    --default-hexa-width: 60px;
    --main-weather-icon-size: 150px;
    --yellow: rgb(255, 255, 102);
    --orange: orange;
    --red: red;
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
  /******** HEADER *********/
  .header {
    padding-top: 10px;
    display: flex;
    flex-direction: row;
    justify-content: center;
    column-gap: 20px;
    border-top: var(--border-width) solid var(--primary-bg-color);
    background-color: var(--primary-bg-alpha-color);
  }
  .header .weather-icon sci-fi-weather-icon {
    --weather-icon-width: var(--main-weather-icon-size);
    --weather-icon-height: var(--main-weather-icon-size);
  }
  .header .weather-clock {
    display: flex;
    flex-direction: column;
    align-self: center;
    color: var(--secondary-light-color);
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
    line-height: normal;
  }
  /******** ALERTS *********/
  .alerts {
    display: flex;
    flex-direction: row;
    column-gap: 10px;
    background-color: var(--primary-bg-alpha-color);
    width: 100%;
    justify-content: center;
  }
  .alerts .alert {
    display: flex;
    flex-direction: column;
    text-align: center;
  }
  .alerts .alert.yellow {
    color: var(--yellow);
  }
  .alerts .alert.orange {
    color: var(--orange);
  }
  .alerts .alert.red {
    color: var(--red);
  }
  .alerts .alert.yellow sci-fi-icon {
    --icon-color: var(--yellow);
  }
  .alerts .alert.orange sci-fi-icon {
    --icon-color: var(--orange);
  }
  .alerts .alert.red sci-fi-icon {
    --icon-color: var(--red);
  }

  /******** TODAY SUMMARY *********/
  .today-summary {
    display: flex;
    width: 100%;
    justify-content: center;
    flex-direction: row;
    border-bottom: var(--border-width) solid var(--primary-bg-color);
    background-color: var(--primary-bg-alpha-color);
    padding-bottom: 25px;
  }
  .today-summary .sensor {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 55px;
    padding: 10px;
  }
  .today-summary div .label {
    color: var(--secondary-light-color);
    text-align: center;
  }
  .today-summary div .label:last-of-type {
    color: var(--primary-light-color);
    text-shadow: 0px 0px 5px var(--secondary-light-color);
  }
  /******** CHART *********/
  .chart-container {
    margin: 10px;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .chart-container .chart-header {
    display: flex;
    flex-direction: row;
  }
  .chart-container .chart-header .title {
    display: flex;
    flex: 1;
    flex-direction: row;
  }
  .chart-container .chart-header .title sci-fi-weather-icon {
    --weather-icon-width: var(--icon-size-title);
    --weather-icon-height: var(--icon-size-title);
  }
  .chart-container .chart-header .title .label {
    align-self: center;
    color: var(--primary-light-color);
    text-shadow: 0px 0px 5px var(--secondary-light-color);
  }
  .chart-container .chart-header .dropdown {
    position: relative;
    display: inline-block;
    margin-right: 10px;
    align-content: center;
  }
  .chart-container .chart-header .dropdown .dropdow-button {
    border-radius: var(--border-radius);
    border: var(--border-width) solid var(--primary-bg-color);
    background-color: var(--primary-bg-alpha-color);
    cursor: pointer;
    display: flex;
    flex-direction: row;
    padding: 0;
    align-items: center;
  }

  .chart-container .chart-header .dropdown .dropdown-content {
    display: none;
    position: absolute;
    right: 0;
    border: var(--border-width) solid var(--primary-bg-color);
    background-color: var(--primary-bg-color);
    box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
    z-index: 1;
  }
  .chart-container .chart-header .dropdown .dropdown-content.show {
    display: block;
  }
  .chart-container .chart-header .dropdown .dropdown-content .dropdown-item {
    display: flex;
    flex-direction: row;
    align-items: center;
    align-items: center;
    padding: 5px;
    min-width: 120px;
    color: var(--primary-light-alpha-color);
    border-top: var(--border-width) solid var(--secondary-bg-color);
    border-bottom: var(--border-width) solid var(--secondary-bg-color);
    cursor: pointer;
  }
  .chart-container
    .chart-header
    .dropdown
    .dropdown-content
    .dropdown-item:hover {
    background-color: var(--secondary-bg-color);
  }
  .chart-container
    .chart-header
    .dropdown
    .dropdown-content
    .dropdown-item:first-child,
  .chart-container
    .chart-header
    .dropdown
    .dropdown-content
    .dropdown-item:last-child {
    border: none;
  }
  .chart-container
    .chart-header
    .dropdown
    .dropdown-content
    .dropdown-item
    sci-fi-weather-icon,
  .chart-container .chart-header .dropdown .dropdow-button sci-fi-weather-icon {
    --weather-icon-width: var(--icon-size-title);
    --weather-icon-height: var(--icon-size-title);
  }
  .chart-container .chart-header .dropdown .dropdow-button sci-fi-icon {
    --icon-color: var(--secondary-light-alpha-color);
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
    cursor: pointer;
  }
  .days-forecast .content .weather.selected {
    background-color: var(--secondary-light-light-alpha-color);
  }
  .days-forecast .content .weather .state sci-fi-weather-icon {
    --weather-icon-width: var(--icon-size-title);
    --weather-icon-height: var(--icon-size-title);
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
`;
