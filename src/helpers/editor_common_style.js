import {css} from 'lit';

export default css`
  :host {
    width: 100%;
    height: 100%;
  }
  /*********EXTERNAL CARD*********/
  .card {
    position: relative;
    padding: 10px;
    justify-content: center;
    display: flex;
    width: 100%;
    height: fit-content;
  }
  /*********CONTENT*********/
  .container {
    display: flex;
    flex-direction: column;
    flex: 1;
    row-gap: 10px;
  }
  .container sci-fi-button {
    align-self: flex-end;
  }
  section {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 10px;
  }
  section h1 {
    font-size: var(--font-size-normal);
    border-bottom: var(--border-width) solid var(--secondary-light-color);
    margin: 10px 0 5px 0;
    padding-bottom: 5px;
    text-transform: capitalize;
    font-weight: 400;
    color: var(--secondary-light-color);
    display: flex;
    flex-direction: row;
    align-items: center;
  }
  section h1 .svg-container {
    width: var(--icon-size-small);
    height: var(--icon-size-small);
    fill: var(--secondary-light-color);
    margin-right: 10px;
  }
`;
