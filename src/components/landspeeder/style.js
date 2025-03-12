import {css} from 'lit';

export default css`
  :host {
    display: flex;
    height: 100%;
    --speeder-width: 250px;
    --speeder-height: 493px;

    --top-height: calc((100% - var(--speeder-height)) / 3);
    --bottom-height: calc((100% - var(--speeder-height)) / 1.5);

    font-size: var(--font-size-small);
  }
  .circle {
    border-color: none;
    background-color: var(--secondary-light-alpha-color);
  }
  .h-path {
    border-color: var(--secondary-light-alpha-color);
  }
  .content {
    display: flex;
    flex-direction: column;
    position: relative;
    width: 100%;
    height: 100%;
  }
  .image {
    width: var(--speeder-width);
    height: var(--speeder-height);
    position: absolute;
    top: calc(var(--top-height) + 10px);
    left: calc((100% - var(--speeder-width)) / 2);
  }
  .top,
  .middle,
  .bottom {
    display: flex;
    flex-direction: row;
    position: relative;
  }
  .top {
    height: calc(var(--top-height) - 10px);
    padding: 10px;
    align-items: center;
  }
  sci-fi-icon {
    --icon-color: var(--secondary-light-alpha-color);
  }
  .component {
    display: flex;
    flex-direction: column;
    flex: 1;
    color: var(--primary-light-color);
    text-align: center;
    column-gap: 3px;
  }
  .component .sub-info {
    color: var(--secondary-bg-color);
    font-size: var(--font-size-xsmall);
  }
  .component .location {
    display: flex;
    column-gap: 5px;
    justify-content: center;
    flex-direction: row;
    text-transform: capitalize;
  }
  .component .location sci-fi-button {
    --primary-icon-color: var(--primary-light-color);
    --btn-size: var(--icon-size-xsmall);
  }
  .middle {
    flex: 1;
  }
  .middle .lock {
    position: absolute;
    left: 65px;
    top: 55%;
  }
  .middle .lock div,
  .middle .charging div,
  .middle .fuel div,
  .middle .battery div {
    position: relative;
    display: flex;
    flex-direction: row;
    align-items: center;
  }
  .middle .lock div sci-fi-icon {
    border: var(--border-width) solid var(--primary-green-color);
    border-radius: var(--border-radius);
    padding: 3px;
    --icon-color: var(--primary-green-color);
    background: var(--primary-green-alpha-color);
  }
  .middle .lock div .circle,
  .middle .charging.on div .circle,
  .middle .battery div .circle {
    background: var(--primary-green-color);
  }
  .middle .lock div.orange .circle,
  .middle .battery.orange div .circle {
    background: var(--primary-error-alpha-color);
  }
  .middle .battery.red div .circle,
  .middle .charging.error div .circle {
    background: var(--primary-emergency-color);
  }
  .middle .lock div .h-path,
  .middle .charging.on div .h-path,
  .middle .battery div .h-path {
    border-color: var(--primary-green-color);
  }
  .middle .lock div.orange sci-fi-icon {
    border: var(--border-width) solid var(--primary-error-color);
    --icon-color: var(--primary-error-color);
    background: var(--primary-error-light-alpha-color);
  }
  .middle .lock div.orange .h-path,
  .middle .battery.orange div .h-path {
    border-color: var(--primary-error-color);
  }
  .middle .battery.red div .h-path,
  .middle .charging.error div .h-path {
    border-color: var(--primary-emergency-color);
  }
  .middle .fuel {
    position: absolute;
    top: 70%;
    left: 25px;
  }
  .middle .fuel .h-path,
  .middle .battery .h-path {
    width: 40px;
  }
  .middle .fuel .components,
  .middle .charging .components,
  .middle .battery .components {
    min-width: 75px;
    border: var(--border-width) solid var(--secondary-light-alpha-color);
    border-radius: var(--border-radius);
    padding: 3px;
    background: var(--secondary-light-light-alpha-color);
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    row-gap: 3px;
  }
  .middle .battery .components,
  .middle .charging.on .components {
    border: var(--border-width) solid var(--primary-green-color);
    background: var(--primary-green-alpha-color);
  }
  .middle .battery .components .component,
  .middle .charging.on .components .component {
    color: var(--primary-green-color);
  }
  .middle .battery .components sci-fi-icon,
  .middle .charging.on sci-fi-icon {
    --icon-color: var(--primary-green-color);
  }
  .middle .battery.orange .components {
    border: var(--border-width) solid var(--primary-error-color);
    background: var(--primary-error-light-alpha-color);
  }
  .middle .battery.orange .components .component {
    color: var(--primary-error-color);
  }
  .middle .battery.orange .components sci-fi-icon {
    --icon-color: var(--primary-error-color);
  }
  .middle .battery.red .components,
  .middle .charging.error .components {
    border: var(--border-width) solid var(--primary-emergency-color);
    background: var(--primary-emergency-alpha-color);
  }
  .middle .battery.red .components .component,
  .middle .charging.error .components .component {
    color: var(--primary-emergency-color);
  }
  .middle .battery.red .components sci-fi-icon,
  .middle .charging.error sci-fi-icon {
    --icon-color: var(--primary-emergency-color);
  }
  .middle .battery {
    position: absolute;
    top: 70%;
    right: 25px;
  }
  .middle .charging {
    position: absolute;
    top: 10px;
    right: 25px;
  }
  .middle .charging .components {
    width: 120px;
  }
  .middle .charging .h-path {
    width: 34px;
  }
  .bottom {
    height: calc(var(--bottom-height) - 30px);
    padding-bottom: 20px;
    column-gap: 10px;
    align-items: end;
    justify-content: center;
  }
`;
