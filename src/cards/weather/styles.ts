import { css } from 'lit';

export const weatherStyles = css`
  :host {
    --default-hexa-width: 60px;
    --main-weather-icon-size: 150px;
    --yellow: rgb(255, 255, 102);
    --orange: orange;
    --red: red;
    font-size: var(--font-size-small, 14px);
    height: 100%;
    width: 100%;
    background-color: transparent;
    display: block;
  }
  ha-card {
    background: rgba(39, 40, 43, 0.3) !important;
    border: none !important;
    box-shadow: none !important;
    height: 100%;
    width: 100%;
    display: block;
    box-sizing: border-box;
  }
  .container {
    display: flex;
    flex-direction: column;
    width: 100%;
  }
  /******** HEADER *********/
  .header {
    padding-top: 0px;
    display: flex;
    flex-direction: row;
    justify-content: center;
    column-gap: 20px;
    border-top: 1px solid var(--sf-border, rgba(0, 210, 255, 0.15));
    background-color: rgba(13, 17, 23, 0.6);
  }
  .header .weather-icon svg {
    width: var(--main-weather-icon-size, 150px);
    height: var(--main-weather-icon-size, 150px);
  }
  .header .weather-clock {
    display: flex;
    flex-direction: column;
    align-self: center;
    color: var(--secondary-light-color, #7ca8c9);
  }
  .header .weather-clock .state {
    text-align: end;
  }
  .header .weather-clock .state::first-letter {
    text-transform: capitalize;
  }
  .header .weather-clock .hour {
    font-size: var(--font-size-large, 54px);
    text-align: center;
    color: var(--primary-light-color, #6ecbf5);
    text-shadow: 0px 0px 10px var(--secondary-light-color, rgba(110, 203, 245, 0.5));
    line-height: normal;
    margin: -5px 0;
  }
  .header .weather-clock .date {
    text-align: center;
  }
  /******** ALERTS *********/
  .alerts {
    display: flex;
    flex-direction: row;
    column-gap: 10px;
    background-color: rgba(13, 17, 23, 0.6);
    width: 100%;
    justify-content: center;
  }
  .alerts .alert {
    display: flex;
    flex-direction: column;
    text-align: center;
  }
  .alerts .alert.yellow {
    color: var(--yellow, rgb(255, 255, 102));
  }
  .alerts .alert.orange {
    color: var(--orange, orange);
  }
  .alerts .alert.red {
    color: var(--red, red);
  }
  .alerts .alert.yellow sf-icon {
    --icon-color: var(--yellow, rgb(255, 255, 102));
  }
  .alerts .alert.orange sf-icon {
    --icon-color: var(--orange, orange);
  }
  .alerts .alert.red sf-icon {
    --icon-color: var(--red, red);
  }

  /******** TODAY SUMMARY *********/
  .today-summary {
    display: flex;
    width: 100%;
    justify-content: center;
    flex-direction: row;
    border-bottom: 1px solid var(--sf-border, rgba(0, 210, 255, 0.15));
    background-color: rgba(13, 17, 23, 0.6);
    padding-bottom: 10px;
    margin-top: 0px;
  }
  .today-summary .sensor {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 55px;
    padding: 10px;
    row-gap: 20px;
  }
  .today-summary div .label {
    color: var(--secondary-light-color, #7ca8c9);
    text-align: center;
  }
  .today-summary div .label:last-of-type {
    color: var(--primary-light-color, #6ecbf5);
    text-shadow: 0px 0px 5px var(--secondary-light-color, rgba(110, 203, 245, 0.3));
  }
  /******** CHART *********/
  .chart-container {
    height: 190px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    margin: 0;
    padding: 10px 0;
    background-color: black;
  }
  .chart-container .chart-header {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 5px;
  }
  .chart-container .chart-header .title {
    display: flex;
    flex-direction: row;
    align-items: center;
    color: var(--secondary-light-color, #7ca8c9);
  }
  .chart-header .title .title-icon {
    width: 32px;
    height: 32px;
    margin-right: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .chart-header .title .title-icon svg {
    width: 100%;
    height: 100%;
    fill: var(--primary-text-color);
  }
  .canvas-wrapper {
    position: relative;
    flex: 1;
    width: 100%;
    min-height: 0;
  }
  .chart-container .chart-header .dropdown {
    position: relative;
    display: inline-block;
    margin-right: 10px;
    align-content: center;
  }
  .chart-container .chart-header .dropdown .dropdow-button {
    border-radius: var(--border-radius, 8px);
    border: 1px solid var(--sf-border, rgba(0, 210, 255, 0.15));
    background-color: rgba(39, 40, 43, 0.3);
    cursor: pointer;
    display: flex;
    flex-direction: row;
    padding: 5px 10px;
    align-items: center;
    column-gap: 10px;
  }

  .chart-container .chart-header .dropdown .dropdown-content {
    display: none;
    position: absolute;
    right: 0;
    border: 1px solid var(--primary-bg-color, rgba(255,255,255,0.1));
    background-color: var(--primary-bg-color, #1a2332);
    box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.5);
    z-index: 10;
  }
  .chart-container .chart-header .dropdown .dropdown-content.show {
    display: block;
  }
  .chart-container .dropdown .dropdown-content .dropdown-item {
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 8px 10px;
    min-width: 150px;
    color: var(--primary-light-alpha-color, #c5d6e6);
    border-bottom: 1px solid var(--secondary-bg-color, rgba(255,255,255,0.05));
    cursor: pointer;
  }
  .chart-container .dropdown .dropdown-content .dropdown-item:hover {
    background-color: var(--secondary-bg-color, rgba(255,255,255,0.1));
  }
  .chart-container .dropdown .dropdown-content .dropdown-item:last-child {
    border: none;
  }
  .chart-container .dropdown .dropdown-content .dropdown-item svg,
  .chart-container .dropdown .dropdow-button .btn-icon svg {
    width: 32px;
    height: 32px;
    fill: var(--primary-text-color);
  }
  .chart-container .dropdown .dropdow-button sf-icon {
    --icon-color: var(--secondary-light-alpha-color, #7ca8c9);
  }
  .chart-container .dropdown .dropdown-content .dropdown-item-label {
    margin-left: 10px;
  }
  /******** DAILY FORECAST *********/
  .days-forecast {
    display: grid;
    border-bottom: 1px solid var(--sf-border, rgba(0, 210, 255, 0.15));
    border-top: 1px solid var(--sf-border, rgba(0, 210, 255, 0.15));
    padding: 20px 10px;
    background-color: rgba(13, 17, 23, 0.6);
    color: var(--secondary-light-color, #7ca8c9);
    font-weight: bold;
  }
  .days-forecast .content {
    display: flex;
    flex-wrap: nowrap;
    overflow-x: auto;
    gap: 15px;
    -webkit-overflow-scrolling: touch;
    padding: 5px;
  }
  .days-forecast .content::-webkit-scrollbar {
    display: none;
  }
  .days-forecast .content .weather {
    display: flex;
    flex-direction: column;
    row-gap: 5px;
    align-items: center;
    min-width: 60px;
    cursor: pointer;
    border-radius: 10px;
    padding: 5px;
    border: 1px solid var(--primary-bg-color, rgba(255,255,255,0.05));
  }
  .days-forecast .content .weather.selected {
    border-color: var(--primary-light-color, #6ecbf5);
    background-color: var(--primary-bg-alpha-color, rgba(255,255,255,0.05));
  }
  .days-forecast .content .weather .state svg {
    width: 45px;
    height: 45px;
  }
  .days-forecast .content .weather .label,
  .days-forecast .content .weather .temp {
    text-align: center;
  }
  .days-forecast .content .weather .label {
    margin-bottom: 5px;
  }
  .days-forecast .content .weather .temp {
    color: var(--primary-light-color, #6ecbf5);
    text-shadow: 0px 0px 5px var(--secondary-light-color, rgba(110, 203, 245, 0.3));
  }
  .days-forecast .content .weather .temp.high {
    color: var(--orange, orange);
    text-shadow: 0px 0px 5px rgba(255, 165, 0, 0.5);
  }
`;
