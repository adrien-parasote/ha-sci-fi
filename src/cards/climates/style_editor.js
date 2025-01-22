import {css} from 'lit';

export default css`
  .container.false {
    display: none;
  }
  .editor.false {
    display: none;
  }
  .state-mode-row {
    display: flex;
    flex-direction: row;
    column-gap: 5px;
    margin-bottom: 10px;
  }
  .state-mode-row sci-fi-input {
    flex: 1;
  }
  .state-mode-row sci-fi-button {
    align-self: center;
  }
  .editor {
    display: flex;
    flex-direction: column;
    row-gap: 10px;
    flex: 1;
    min-height: 300px;
  }
  .editor .head {
    display: flex;
    flex-direction: row;
    column-gap: 10px;
  }
  .editor .head span {
    flex: 1;
    align-content: center;
  }
`;
