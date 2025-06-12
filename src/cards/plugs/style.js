import {css} from 'lit';

export default css`
  :host {
    font-size: var(--font-size-small);
    height: 100%;
    width: 100%;
    background-color: black;
    --tile-width: 60px;
  }
  section {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 10px;
  }
  section h1 {
    font-size: var(--font-size-normal);
    border-bottom: var(--border-width) solid var(--primary-bg-color);
    margin: 10px 0 5px 0;
    padding-bottom: 5px;
    text-transform: capitalize;
    font-weight: 400;
    color: var(--secondary-light-color);
    display: flex;
    flex-direction: row;
    align-items: center;
  }
  section h1 sci-fi-icon {
    --icon-width: var(--icon-size-small);
    --icon-height: var(--icon-size-small);
    --icon-color: var(--secondary-light-color);
    margin-right: 10px;
  }
  .container {
    display: flex;
    flex-direction: column;
    width: 100%;
  }
  .header {
    display: flex;
    flex-direction: row;
    border-bottom: var(--border-width) solid var(--primary-bg-color);
    padding: 10px;
    background-color: var(--primary-bg-alpha-color);
    column-gap: 10px;
    align-items: center;
    justify-content: center;
    font-size: var(--font-size-normal);
    color: var(--secondary-light-alpha-color);
    min-height: 45px;
  }
  .header sci-fi-icon.on {
    --icon--color: var(--secondary-light-color);
  }

  .header sci-fi-icon {
    --icon--color: var(--secondary-light-alpha-color);
  }
  .header .on {
    color: var(--secondary-light-color);
  }
  .header .info {
    display: flex;
    flex-direction: column;
    flex: 1;
  }
  .header .info .sub-title {
    font-size: var(--font-size-small);
    color: var(--secondary-bg-color);
  }
  .footer {
    display: flex;
    flex-direction: row;
    text-align: center;
    border-top: var(--border-width) solid var(--primary-bg-color);
    padding: 10px;
    background-color: var(--primary-bg-alpha-color);
    column-gap: 5px;
    align-items: center;
    justify-content: center;
  }
  .footer .hide {
    display: none;
  }
  .footer .number {
    display: flex;
    flex-direction: row;
    justify-content: center;
    column-gap: 10px;
    flex: 1;
  }
  .footer .number > sci-fi-button {
    align-items: center;
    --btn-size: var(--icon-size-small);
    --primary-icon-color: var(--secondary-light-color);
  }
  .footer .number > sci-fi-button.active {
    --btn-size: var(--icon-size-normal);
    --primary-icon-color: var(--primary-light-color);
  }
  .content {
    display: flex;
    flex: 1;
    flex-direction: column;
  }
  .content .msg-container {
    text-align: center;
    min-height: 30px;
    align-content: center;
    color: var(--secondary-light-color);
  }
  .content .info {
    padding: 10px;
    display: flex;
    flex: 1;
    flex-direction: column;
  }
  .content .info .image {
    display: flex;
    flex-direction: row;
    align-items: center;
    margin: 10px 0;
  }
  .content .info .image .icon-container {
    border: calc(var(--border-width) * 2) solid var(--secondary-bg-color);
    padding: 5px;
    display: flex;
    border-radius: var(--border-radius);
    position: relative;
    cursor: pointer;
  }
  .content .info .image .icon-container .icon {
    width: 70px;
    height: 70px;
    align-content: center;
    position: relative;
    border: calc(var(--border-width) * 2) solid var(--secondary-bg-color);
    border-radius: 50%;
  }
  .content .info .image .icon-container .icon .circle {
    position: absolute;
    background-color: var(--secondary-bg-color);
  }
  .content .info .image .icon-container .icon .circle:first-child {
    top: 13px;
    left: calc(50% - 4px);
  }
  .content .info .image .icon-container .icon .circle:nth-child(2) {
    top: calc(50% - 4px);
    left: 13px;
  }
  .content .info .image .icon-container .icon .circle:nth-child(3) {
    top: calc(50% - 4px);
    right: 13px;
  }
  .content .info .image .icon-container sci-fi-icon {
    position: absolute;
    bottom: 0;
    right: 0;
  }
  .content .info .image .icon-container sci-fi-icon.off {
    --icon--color: var(--secondary-light-color);
  }
  .content .info .image .cirle-container {
    flex: 1;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    border: var(--border-width) solid var(--secondary-bg-color);
  }
  .content .info .image .cirle-container .circle {
    position: absolute;
    left: -5px;
    animation: 3s linear 1s infinite running move;
  }
  .content .info .image .cirle-container.off .circle {
    animation: none;
    display: none;
  }
  @keyframes move {
    0% {
      margin-left: 0%;
      opacity: 1;
    }
    60% {
      opacity: 0.9;
    }
    70% {
      opacity: 0.8;
    }
    80% {
      margin-left: 100%;
      opacity: 0.75;
    }
    90% {
      margin-left: 100%;
      opacity: 0.33;
    }
    100% {
      margin-left: 100%;
      opacity: 0;
    }
  }
  .content .info .sensors {
    display: flex;
    flex-direction: column;
    row-gap: 15px;
  }
  .content .info .sensors .sensor {
    display: flex;
    flex-direction: row;
    column-gap: 5px;
    min-height: 25px;
    align-items: center;
  }
  .content .info .sensors .sensor sci-fi-dropdown-input {
    flex: 1;
  }
  .content .info .sensors .sensor .name {
    flex: 1;
    margin-left: 10px;
    align-content: center;
  }
  .content .info .sensors .sensor .value {
    color: var(--primary-light-color);
    text-transform: uppercase;
    align-content: center;
    font-weight: bold;
  }
  .content .info .sensors .sensor .value sci-fi-button-card {
    --btn-padding: 5px;
    --margin-top-label-alone: 0;
    --border: none;
    --label-color: var(--primary-light-color);
  }
`;
