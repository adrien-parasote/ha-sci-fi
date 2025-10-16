import {css} from 'lit';

export default css`
  :host {
    background-color: black;
    height: 100%;
    width: 100%;
    min-height: 732px;
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
    padding: 10px;
    color: var(--primary-light-color);
    font-size: var(--font-size-normal);
  }
  .header .name {
    text-shadow: 0px 0px 5px var(--primary-light-color);
  }
  .header .infoH {
    display: flex;
    flex-direction: row;
    column-gap: 5px;
    align-items: center;
    flex: 1;
    justify-content: end;
  }
  .header .infoH sci-fi-icon {
    --icon-width: var(--icon-size-xsmall);
    --icon-height: var(--icon-size-xsmall);
  }
  .header .infoH .spacer {
    width: 10px;
  }

  /*********** SUB HEADER *************/
  .sub-header {
    display: flex;
    flex-direction: column;
    padding: 15px;
    position: relative;
    height: var(--icon-size-normal);
  }
  .sub-header sci-fi-icon {
    position: absolute;
  }
  .sub-header sci-fi-icon.DOCKED {
    transform: rotate(90deg);
  }
  .sub-header sci-fi-icon.CLEAN,
  .sub-header sci-fi-icon.RETURNING {
    animation: moveAcross 20s linear infinite;
  }

  @keyframes moveAcross {
    0% {
      left: 0;
      transform: rotate(90deg);
    }
    49.999% {
      left: 92%;
      transform: rotate(90deg); /* keep same rotation while moving */
    }
    50% {
      left: 92%;
      transform: rotate(-90deg); /* instant rotation at edge */
    }
    99.999% {
      left: 0;
      transform: rotate(-90deg); /* move back with same rotation */
    }
    100% {
      left: 0;
      transform: rotate(90deg); /* instant flip back */
    }
  }
  .sub-header sci-fi-icon.IDLE,
  .sub-header sci-fi-icon.ALERT {
    left: calc(50% - var(--icon-size-normal) / 2);
  }
  .sub-header sci-fi-icon.ALERT {
    --icon-color: var(--primary-error-color);
  }

  /*********** MAP *************/
  .map {
    display: flex;
    flex: 1;
    padding: 15px;
    justify-content: center;
  }

  .map .image {
    border: var(--border-width) solid var(--secondary-bg-color);
    border-radius: var(--corner-size);
    width: auto;
    height: 100%;
    overflow: hidden;
  }

  /*********** INFO *************/
  .info {
    display: inline-flex;
    flex-wrap: wrap;
    border-top: var(--border-width) solid var(--secondary-bg-color);
    border-bottom: var(--border-width) solid var(--secondary-bg-color);
    background-color: var(--primary-bg-alpha-color);
  }
  .info .sensor {
    width: 183px;
    padding: 5px;
    display: flex;
    flex-direction: column;
    row-gap: 5px;
    align-items: center;
  }
  .info .sensor sci-fi-icon {
    --icon-color: var(--secondary-light-color);
  }
  .info .sensor .data {
    display: flex;
    flex-direction: row;
    align-items: center;
    column-gap: 5px;
  }
  .info .sensor .data .value {
    color: var(--primary-light-color);
    text-shadow: 0px 0px 5px var(--primary-light-color);
  }
  .info .sensor .data .unit {
    color: var(--secondary-light-color);
  }

  .info .sensor .name {
    color: var(--secondary-light-color);
    font-size: var(--font-size-small);
  }

  /*********** ACTIONS *************/
  .actions {
    display: flex;
    flex-direction: row;
    column-gap: 5px;
    padding: 10px;
    border-top: var(--border-width) solid var(--secondary-bg-color);
    background-color: var(--primary-bg-alpha-color);
    justify-content: center;
  }
  .actions .default,
  .actions .shortcuts {
    display: flex;
    flex: 1;
    flex-direction: row;
    column-gap: 5px;
  }
  .actions .default {
    justify-content: left;
  }
  .actions .shortcuts {
    justify-content: right;
  }
`;
