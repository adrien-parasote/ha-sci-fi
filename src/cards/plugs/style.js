import {css} from 'lit';

export default css`
  :host {
    font-size: var(--font-size-small);
    height: 100%;
    width: 100%;
    background-color: black;
  }
  .container {
    display: flex;
    flex-direction: column;
    width: 100%;
  }
`;
