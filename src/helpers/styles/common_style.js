import {css} from 'lit';

export default css`
  :host {
    --primary-color: white;

    --primary-light-color: rgb(105, 211, 251);
    --primary-light-alpha-color: rgba(105, 211, 251, 0.5);
    --primary-dark-color: rgb(34, 34, 34);

    --secondary-light-color: rgb(102, 156, 210);
    --secondary-light-alpha-color: rgba(102, 156, 210, 0.5);
    --secondary-light-light-alpha-color: rgba(102, 156, 210, 0.2);

    --primary-error-color: rgb(250, 146, 29);
    --primary-error-alpha-color: rgba(250, 146, 29, 0.9);
    --primary-error-light-alpha-color: rgba(250, 146, 29, 0.3);
    --primary-green-color: rgb(79, 227, 139);
    --primary-green-alpha-color: rgb(79, 227, 139, 0.3);
    --primary-emergency-color: rgb(255, 49, 49);
    --primary-emergency-alpha-color: rgb(255, 49, 49, 0.3);

    --primary-bg-color: rgb(39, 40, 43);
    --primary-bg-alpha-color: rgba(39, 40, 43, 0.3);
    --secondary-bg-color: rgb(55, 61, 69);

    --font-size-large: 50px;
    --font-size-title: 16px;
    --font-size-normal: 14px;
    --font-size-small: 12px;
    --font-size-xsmall: 10px;
    --font-size-xxsmall: 7px;

    --icon-size-xlarge: 60px;
    --icon-size-large: 50px;
    --icon-size-title: 36px;
    --icon-size-subtitle: 30px;
    --icon-size-normal: 25px;
    --icon-size-small: 20px;
    --icon-size-xsmall: 15px;
    --icon-size-xxsmall: 10px;

    --small-hexa-width: 40px;
    --default-hexa-width: 60px;
    --medium-hexa-width: 70px;
    --selected-hexa-width: 80px;

    --border-width: 1px;
    --border-radius: 5px;
    --corner-size: 10px;

    font-family: 'Titillium Web', sans-serif;
    color: var(--primary-color);
    display: flex;
  }
  .svg-container {
    display: flex;
    justify-content: center;
  }
  /********* CARD ************/
  .card-corner {
    border-width: var(--border-width);
    border-style: solid;
    border-color: var(--primary-light-color);
    padding: 10px;
    mask:
      conic-gradient(#000 0 0) content-box,
      conic-gradient(
          at var(--corner-size) var(--corner-size),
          #0000 75%,
          #000 0
        )
        0 0 / calc(100% - var(--corner-size)) calc(100% - var(--corner-size));
  }
  .card-corner.off {
    border-color: var(--secondary-light-color);
  }
  /********* SEPARATOR ************/
  .h-separator {
    margin: 0 3px;
    display: flex;
    flex-direction: row;
    align-items: center;
  }
  .h-separator.hide {
    display: none;
  }
  .circle {
    width: 6px;
    height: 6px;
    border: var(--border-width) solid var(--secondary-bg-color);
    background: var(--primary-light-color);
    border-radius: 50%;
  }
  .circle.off {
    background-color: var(--secondary-light-alpha-color);
  }
  .h-path {
    border: var(--border-width) solid var(--primary-light-color);
    width: 25px;
  }
  .h-path.off {
    border-color: var(--secondary-light-alpha-color);
  }
`;
