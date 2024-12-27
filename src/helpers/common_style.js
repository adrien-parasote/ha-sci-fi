import {css} from 'lit';

export default css`
  :host {
    --primary-color: white;

    --primary-light-color: rgb(105, 211, 251);
    --primary-light-alpha-color: rgba(105, 211, 251, 0.5);
    --secondary-light-color: rgb(102, 156, 210);
    --secondary-light-alpha-color: rgba(102, 156, 210, 0.5);

    --primary-error-color: rgb(250 146 29);
    --primary-error-alpha-color: rgba(250, 146, 29, 0.9);

    --primary-bg-color: rgb(39, 40, 43);
    --primary-bg-alpha-color: rgba(39, 40, 43, 0.3);
    --secondary-bg-color: rgb(55, 61, 69);

    --font-size-title: 16px;
    --font-size-normal: 14px;
    --font-size-small: 12px;
    --font-size-xsmall: 10px;

    --icon-size-large: 50px;
    --icon-size-title: 36px;
    --icon-size-normal: 25px;
    --icon-size-small: 20px;
    --icon-size-xsmall: 15px;

    --tile-width: 155px;
    --tile-height: calc(var(--tile-width) * 1.1547);

    --border-width: 1px;
    --border-radius: 5px;
    --corner-size: 10px;

    font-family: 'Titillium Web', sans-serif;
    color: var(--primary-color);
    display: flex;
  }
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
`;
