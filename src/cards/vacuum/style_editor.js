import {css} from 'lit';

export default css`
  .shortcuts {
    display: flex;
    flex-direction: column;
    row-gap: 5px;
  }
  .shortcut {
    display: flex;
    flex-direction: row;
    column-gap: 5px;
  }
  .shortcut sci-fi-button {
    align-self: center;
  }
  .shortcut sci-fi-input {
    flex: 1;
  }

  .container.false {
    display: none;
  }
  .editor.false {
    display: none;
  }
  .entity-row {
    display: flex;
    flex-direction: row;
    column-gap: 5px;
  }
  .entity-row sci-fi-dropdown-entity-input {
    flex: 1;
  }
  .entity-row sci-fi-button {
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
  .editor .segments {
    display: flex;
    flex-direction: column;
    row-gap: 5px;
  }
  .editor .segments sci-fi-button {
    align-self: flex-end;
  }
  .editor .segments .segment {
    display: flex;
    flex-direction: row;
    column-gap: 5px;
  }
  .editor .segments .segment sci-fi-input {
    flex: 1;
  }
  .editor .segments .segment sci-fi-button {
    align-self: center;
  }
`;
