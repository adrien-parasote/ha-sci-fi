import {css} from 'lit';

export default css`
  :host {
    background-color: black;
    height: 100%;
    width: 100%;

    --stove-width: 120px;
    --stove-height: 500px;
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
    border-top: var(--border-width) solid var(--primary-bg-color);
    padding: 10px;
    padding-left: 120px;
    background-color: var(--primary-bg-alpha-color);
  }
  .header .info {
    display: flex;
    flex-direction: row;
    flex: 1;
    align-items: center;
    justify-content: center;
    color: var(--primary-light-color);
    font-size: var(--font-size-small);
  }
  .header .info div:first-of-type {
    font-size: var(--font-size-title);
  }
  .header .info div:last-of-type {
    padding-top: 2px;
  }
  .header .info svg {
    fill: var(--primary-light-color);
    width: var(--icon-size-small);
    height: var(--icon-size-small);
  }
  .header sci-fi-hexa-tile {
    --hexa-width: var(--small-hexa-width);
  }
  .header sci-fi-hexa-tile .item-icon svg {
    width: var(--icon-size-small);
    fill: var(--secondary-light-color);
  }
  .header sci-fi-hexa-tile.selected .item-icon svg {
    fill: var(--primary-light-color);
  }
  /*********** CONTENT *************/
  .content {
    display: flex;
    flex-direction: row;
    position: relative;
  }
  .content sci-fi-stove-image {
    height: var(--stove-height);
  }
  .content .stove-name {
    position: absolute;
    height: 95px;
    display: flex;
    align-items: center;
    padding-left: 10px;
    font-weight: bold;
    font-size: var(--font-size-normal);
    background-color: #4e545c;
    color: transparent;
    text-shadow: 0.5px 0.5px 0.75px rgba(24, 24, 24, 0.8);
    -webkit-background-clip: text;
    -moz-background-clip: text;
    background-clip: text;
    width: calc(var(--stove-width) - 30px);
  }
`;
