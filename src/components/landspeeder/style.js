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
    top: var(--top-height);
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
    height: calc(var(--top-height) - 20px);
    padding: 10px;
  }
  .top sci-fi-icon,
  .middle .fuel sci-fi-icon {
    --icon-color: var(--secondary-light-alpha-color);
  }
  .component {
    display: flex;
    flex-direction: column;
    flex: 1;
    color: var(--primary-light-color);
    text-align: center;
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
    border: 1px solid yellow;
  }
  .middle .lock {
    position: absolute;
    left: calc(75% - 35px);
    top: 50%;
  }
  .middle .lock div,
  .middle .fuel div {
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
  .middle .lock div .h-path {
    border-color: var(--primary-green-color);
  }
  .middle .lock div .circle,
  .middle .lock div .h-path {
    border-color: var(--primary-green-color);
    background: var(--primary-green-alpha-color);
  }
  .middle .lock div.orange sci-fi-icon {
    border: var(--border-width) solid var(--primary-error-color);
    --icon-color: var(--primary-error-color);
    background: var(--primary-error-light-alpha-color);
  }
  .middle .lock div.orange .circle,
  .middle .lock div.orange .h-path {
    border-color: var(--primary-error-color);
    background: var(--primary-error-light-alpha-color);
  }

  .middle .fuel {
    position: absolute;
    top: 70%;
    left: 25px;
  }
  .middle .fuel .h-path {
    width: 40px;
  }
  .middle .fuel .components {
    border: var(--border-width) solid var(--primary-light-color);
    border-radius: var(--border-radius);
    padding: 3px;
    background: var(--primary-bg-color);
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    row-gap: 3px;
  }
  .bottom {
    border: 1px solid red;
    height: calc(var(--bottom-height) - 20px);
    padding: 10px;
  }
`;
