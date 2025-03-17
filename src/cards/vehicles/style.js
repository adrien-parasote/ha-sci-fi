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
  .header {
    display: flex;
    flex-direction: row;
    text-align: center;
    border-bottom: var(--border-width) solid var(--primary-bg-color);
    padding: 10px;
    background-color: var(--primary-bg-alpha-color);
  }
  .header .hide {
    display: none;
  }
  .header .title {
    flex: 1;
    align-content: center;
    color: var(--primary-light-color);
  }
  .actions {
    display: flex;
    flex-direction: row;
    padding: 10px;
    padding-bottom: 20px;
    margin: auto;
  }
  .actions .ac {
    display: flex;
    flex-direction: row;
    column-gap: 5px;
  }
  .actions .ac sci-fi-wheel {
    --padding: 0 10px;
    --wheel-row-gap: 2px;
    --text-size: var(--font-size-xsmall);
  }
`;
