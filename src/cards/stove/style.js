import {css} from 'lit';

export default css`
  :host {
    background-color: black;
    height: 100%;
    width: 100%;

    --stove-width: 130px;
    --stove-height: 500px;
  }
  .container {
    display: flex;
    flex-direction: column;
    flex: 1;
  }
  /*********** CONTENT *************/
  .content {
    display: flex;
    flex-direction: row;
  }
  .content sci-fi-stove-image {
    height: var(--stove-height);
    width: var(--stove-width);
  }
  .content .info {
    display: flex;
    flex-direction: column;
    padding: 0 10px;
    flex: 1;
  }
  .content .info .e {
    height: 100px;
    align-content: center;
  }
  .content .info .m {
    flex: 1;
    align-content: center;
  }
  /*********** BOTTOM *************/
  .bottom {
    display: flex;
    flex-direction: row;
    flex: 1;
    border-bottom: var(--border-width) solid var(--primary-bg-color);
    border-top: var(--border-width) solid var(--primary-bg-color);
    padding: 10px;
    background-color: var(--primary-bg-alpha-color);
  }
  .bottom .info {
    display: flex;
    flex-direction: row;
    flex: 1;
    align-items: center;
    justify-content: center;
    color: var(--primary-light-color);
    font-size: var(--font-size-small);
  }
  .bottom .info div:first-of-type {
    font-size: var(--font-size-title);
  }
  .bottom .info div:last-of-type {
    padding-top: 2px;
  }
  .bottom .info svg {
    fill: var(--primary-light-color);
    width: var(--icon-size-small);
    height: var(--icon-size-small);
  }
  .bottom sci-fi-hexa-tile {
    --hexa-width: var(--small-hexa-width);
  }
  .bottom sci-fi-hexa-tile .item-icon svg {
    width: var(--icon-size-small);
    fill: var(--secondary-light-color);
  }
  .bottom sci-fi-hexa-tile.selected .item-icon svg {
    fill: var(--primary-light-color);
  }
`;
