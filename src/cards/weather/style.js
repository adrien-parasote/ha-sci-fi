import {css} from 'lit';

export default css`
  :host {
    --default-hexa-width: 60px;
    --main-weather-icon-size: 150px;
    font-size: var(--font-size-xsmall);
    height: 100%;
    width: 100%;
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
  .header .weather-icon svg {
    width: var(--main-weather-icon-size);
    height: var(--main-weather-icon-size);
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
  .today-summary .sensor .state svg {
    width: var(--icon-size-normal);
    height: var(--icon-size-normal);
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
  .chart-container .chart-header .title svg {
    width: var(--icon-size-title);
    height: var(--icon-size-title);
  }
  .chart-container .chart-header .title .label {
    align-self: center;
    font-size: var(--font-size-small);
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
  .chart-container .chart-header .dropdown .dropdown-content .dropdown-item svg,
  .chart-container .chart-header .dropdown .dropdow-button svg {
    width: var(--icon-size-title);
    height: var(--icon-size-title);
  }
  .chart-container
    .chart-header
    .dropdown
    .dropdow-button
    .svg-container:last-of-type
    svg {
    fill: var(--secondary-light-alpha-color);
    width: var(--icon-size-normal);
    height: var(--icon-size-normal);
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
`;
