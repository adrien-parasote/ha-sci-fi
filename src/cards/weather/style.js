import {css} from 'lit';

export default css`
  :host {
    --default-hexa-size: 100px;
    --main-weather-icon-size: 150px;
    --hourly-weather-icon-size: var(--icon-size-title);
    font-size: var(--font-size-small);
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
  }
  .header .weather-clock .state::first-letter {
    text-transform: capitalize;
  }
  .header .weather-clock .hour {
    font-size: var(--font-size-large);
    text-align: center;
  }
  /******** HOURLY FORECAST *********/
  .hours-forcast {
    display: grid;
    border-bottom: var(--border-width) solid var(--primary-bg-color);
    border-top: var(--border-width) solid var(--primary-bg-color);
    padding: 20px 10px;
    background-color: var(--primary-bg-alpha-color);
  }
  .hours-forcast .content {
    display: flex;
    flex-wrap: nowrap;
    overflow-x: auto;
    gap: 15px;
    -webkit-overflow-scrolling: touch;
    &::-webkit-scrollbar {
      display: none;
    }
  }
  .hours-forcast .hourly-weather .state .svg-container {
    justify-self: center;
  }
  .hours-forcast .hourly-weather .state svg {
    width: var(--hourly-weather-icon-size);
    height: var(--hourly-weather-icon-size);
  }
  .hours-forcast .hourly-weather .hour,
  .hours-forcast .hourly-weather .temp {
    text-align: center;
    font-weight: bold;
  }
`;
