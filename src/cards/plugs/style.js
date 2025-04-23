import {css} from 'lit';

export default css`
  :host {
    font-size: var(--font-size-small);
    height: 100%;
    width: 100%;
    background-color: black;
    --tile-width: 60px;
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
    color: var(--primary-light-alpha-color);
    min-height: 45px;
  }
  .header sci-fi-icon.on {
    --icon--color: var(--primary-light-color);
  }
  .header sci-fi-icon {
    --icon--color: var(--primary-light-alpha-color);
  }
  .header .on {
    color: var(--primary-light-color);
  }
  .header .info {
    display: flex;
    flex-direction: column;
    flex:1
  }
  .header .info .sub-title {
    font-size: var(--font-size-small);
    color: var(--secondary-bg-color);;
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
  .footer .number > div {
    content: '';
    width: 10px;
    height: 10px;
    background-color: var(--primary-light-alpha-color);
    text-decoration: none;
    border-radius: 50%;
  }
  .footer .number > div.active {
    background-color: var(--primary-light-color);
  }
  .content {
    display: flex;
    flex: 1;
    padding: 10px;    
    flex-direction: column;
  }
  
`;
