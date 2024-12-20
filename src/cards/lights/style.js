import {css} from 'lit';

export default css`
  :host {
    background-color: black;
    height: 100%;
  }
  /******** COMMON *********/
  .container {
    display: flex;
    flex-direction: column;
    flex: 1;
  }
  /******** DISPLAY HEADER *********/
  .header {
    display: flex;
    flex-direction: row;
    margin: 10px 10px 0 10px;
    align-items: center;
  }
  .header .separator {
    margin: 0 5px;
    display: flex;
    flex-direction: row;
    align-items: center;
  }
  .header .path {
    content: '';
    border: var(--border-width) solid var(--secondary-bg-color);
    width: 25px;
  }
  .header .circle {
    width: 5px;
    height: 5px;
    border: var(--border-width) solid var(--secondary-bg-color);
    background: var(--primary-light-color);
    border-radius: 50%;
  }
  .header .card-corner {
    width: 100%;
    height: fit-content;
    display: flex;
    flex-direction: column;
  }
  .header.off .circle {
    background-color: var(--secondary-light-alpha-color);
  }
  .header.off .path,
  .header.off .card-corner {
    border-color: var(--secondary-light-alpha-color);
  }
  .header sci-fi-wheel {
    --icon-size: var(--icon-size-title);
  }
  .header .floor-info {
    color: var(--primary-light-color);
  }
  .header .floor-info .title {
    font-size: var(--font-size-normal);
    border-bottom: var(--border-width) solid var(--primary-light-color);
    padding-bottom: 5px;
    margin-bottom: 5px;
    font-weight: bold;
    text-align: center;
  }
  .header.off .floor-info {
    color: var(--secondary-light-color);
  }
  .header.off .floor-info .title {
    border-bottom-color: var(--secondary-light-alpha-color);
  }
  .header .floor-info .rooms,
  .header .floor-info .devices {
    margin-left: 10px;
    font-size: var(--font-size-small);
  }
  ul {
    margin: 0;
    list-style-type: disclosure-closed;
  }
  /******** DISPLAY CONTENT *********/
  .content {
    align-items: center;
    justify-content: center;
    height: 100%;
    display: flex;
  }
`;
