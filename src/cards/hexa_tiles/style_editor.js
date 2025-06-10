import {css} from 'lit';

export default css`
  .people {
    display: flex;
    flex-direction: column;
    row-gap: 5px;
  }
  .people .people-row {
    display: flex;
    flex-direction: row;
    column-gap: 5px;
    align-items: center;
    font-size: var(--font-size-normal);
  }
  .people .people-row > div {
    flex: 1;
  }

  .people .people-row sci-fi-button {
    align-self: center;
  }
`;
