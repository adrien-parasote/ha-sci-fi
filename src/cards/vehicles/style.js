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
  /*********** HEADER ***********/
  .header {
    display: flex;
    flex-direction: row;
    text-align: center;
    border-bottom: var(--border-width) solid var(--primary-bg-color);
    padding: 10px;
    background-color: var(--primary-bg-alpha-color);
  }
  .header .title {
    flex: 1;
    align-content: center;
    color: var(--primary-light-color);
  }
`;
