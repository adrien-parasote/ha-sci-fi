import {css} from 'lit';

export default css`
  .container.false {
    display: none;
  }
  .editor.false {
    display: none;
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
  .entity-row {
    display: flex;
    flex-direction: row;
    column-gap: 5px;
  }
  .entity-row sci-fi-input {
    flex: 1;
  }
  .entity-row sci-fi-button {
    align-self: center;
  }
  section h1 .section-title {
    flex: 1;
  }
  .additional-sensors {
    display: flex;
    flex-direction: column;
    row-gap: 10px;
  }
  .additional-sensors .sensor-row {
    display: flex;
    flex-direction: row;
    column-gap: 5px;
  }
  .additional-sensors .sensor-row sci-fi-dropdown-entity-input {
    flex: 1;
  }
  .additional-sensors .sensor-row sci-fi-button {
    align-self: center;
  }
`;
