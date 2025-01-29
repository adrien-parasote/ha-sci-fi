import {css} from 'lit';

export default css`
  :host {
    background-color: black;
    height: 100%;
    width: 100%;
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
    padding: 5px 10px;
    padding-left: 120px;
    background-color: var(--primary-bg-alpha-color);
  }
  .header .info {
    display: flex;
    flex-direction: column;
    flex: 1;
    align-items: center;
    justify-content: center;
    color: var(--primary-light-color);
  }
  .header .info div:last-of-type {
    font-size: var(--font-size-small);
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
  }
  .content sci-fi-stove-image {
    height: 500px;
  }
`;
