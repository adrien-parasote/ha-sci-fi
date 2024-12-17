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

    --border-width: 1px;
    --border-radius: 5px;

    font-family: 'Titillium Web', sans-serif;
    color: var(--primary-color);
    display: flex;
  }
`;
