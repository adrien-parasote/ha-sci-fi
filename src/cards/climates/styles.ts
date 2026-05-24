import { css } from 'lit';

export const climateStyles = css`
  :host {
    font-size: var(--sf-text-sm, 12px);
    height: 100%;
    width: 100%;
    background-color: rgba(39, 40, 43, 0.3);
  }
  .container {
    display: flex;
    flex-direction: column;
    width: 100%;
  }
  /*********** HEADER *************/
  .header {
    display: flex;
    flex-direction: row;
    border-bottom: var(--sf-border-width, 1px) solid var(--sf-border);
    background-color: transparent;
    padding: 5px 10px;
    font-size: var(--sf-text-sm, 12px);
  }
  .header .info,
  .header .actions {
    display: flex;
    flex-direction: row;
    column-gap: 5px;
    align-items: center;
  }
  .header .info .text {
    color: var(--sf-primary);
    text-shadow: 0px 0px 5px var(--sf-primary);
  }
  .header .actions {
    justify-content: center;
    flex: 1;
  }
  .header .actions .action {
    display: flex;
    flex-direction: row;
    column-gap: 5px;
    align-items: center;
    border: var(--sf-border-width, 1px) solid var(--sf-border);
    padding: 5px;
    border-radius: var(--sf-border-radius, 8px);
    cursor: pointer;
    background: var(--sf-bg-secondary);
    color: var(--sf-primary);
  }
  .header .actions sf-icon {
    --icon-width: var(--sf-icon-size-xs, 12px);
    --icon-height: var(--sf-icon-size-xs, 12px);
  }
  .header .info sf-icon {
    --icon-width: var(--sf-icon-size-sm, 16px);
    --icon-height: var(--sf-icon-size-sm, 16px);
    --icon-color: var(--sf-primary);
    filter: drop-shadow(0px 0px 5px var(--sf-primary));
  }
  .header .season {
    display: flex;
    align-items: center;
  }
  .header .season sf-icon {
    --icon-width: var(--sf-icon-size-sm, 16px);
    --icon-height: var(--sf-icon-size-sm, 16px);
  }
  .header .season.blue sf-icon { --icon-color: #acd5f3; }
  .header .season.green sf-icon { --icon-color: #ace1af; }
  .header .season.yellow sf-icon { --icon-color: #fdda0d; }
  .header .season.orange sf-icon { --icon-color: #f47b20; }
  
  /*********** FLOORS *************/
  .floors {
    display: flex;
    justify-content: center;
  }
  .floors sf-hexa-row {
    --sf-hexa-row-width: 50px;
    --sf-hexa-row-selected-width: 70px;
    --sf-hexa-row-icon-width: 24px;
    --sf-hexa-row-icon-height: 24px;
    --sf-hexa-row-icon-selected-width: 36px;
    --sf-hexa-row-icon-selected-height: 36px;
  }
  
  /*********** FLOOR CONTENT *************/
  .floor-content {
    display: flex;
    flex-direction: row;
    border-bottom: var(--sf-border-width, 1px) solid var(--sf-border);
    border-top: var(--sf-border-width, 1px) solid var(--sf-border);
    padding: 10px;
    justify-content: center;
    background-color: transparent;
    color: var(--sf-primary);
  }
  .floor-content .title {
    font-size: var(--sf-text-base, 14px);
    font-weight: bold;
    align-content: center;
  }
  .floor-content .title.off {
    color: var(--sf-text-secondary);
  }
  .floor-content .temperature {
    display: flex;
    flex-direction: row;
    align-items: center;
    text-shadow: 0px 0px 5px var(--sf-primary);
  }
  .floor-content .temperature sf-icon {
    --icon-width: var(--sf-icon-size-sm, 16px);
    --icon-height: var(--sf-icon-size-sm, 16px);
  }
  .floor-content .temperature.off {
    color: var(--sf-text-secondary);
    text-shadow: none;
  }
  .floor-content .temperature.off sf-icon {
    --icon-color: var(--sf-text-secondary);
  }

  /******** AREA LIST *********/
  .areas {
    display: flex;
    flex-direction: column;
    flex: 1;
  }
  .areas .area-list {
    display: flex;
  }
  .areas .area-list sf-hexa-row {
    --sf-hexa-row-width: 50px;
    --sf-hexa-row-selected-width: 70px;
    --sf-hexa-row-icon-width: 24px;
    --sf-hexa-row-icon-height: 24px;
    --sf-hexa-row-icon-selected-width: 36px;
    --sf-hexa-row-icon-selected-height: 36px;
  }

  /******** AREA CONTENT *********/
  .areas .area-content {
    display: flex;
    flex: 1;
    align-items: start;
    flex-direction: column;
  }
  .area-content .climates {
    display: flex;
    flex-direction: column;
    row-gap: 10px;
    border-bottom: var(--sf-border-width, 1px) solid var(--sf-border);
    border-top: var(--sf-border-width, 1px) solid var(--sf-border);
    padding: 10px 0;
    background-color: transparent;
    font-weight: bold;
    width: 100%;
    align-items: center;
  }
  .area-content .climates .title {
    font-size: var(--sf-text-base, 14px);
    color: var(--sf-primary);
    font-weight: bold;
    text-align: center;
    width: 100%;
  }
  .area-content.off .climates .title {
    border-bottom-color: var(--sf-border);
    color: var(--sf-text-secondary);
  }
  .area-content .climates .slider {
    min-width: 368px;
    max-width: 368px;
    height: 300px;
    overflow: hidden;
  }
  .area-content .climates .slider .slides {
    display: flex;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    scroll-behavior: smooth;
    -webkit-overflow-scrolling: touch;
    height: 95%;
  }
  .area-content .climates .slider .slides::-webkit-scrollbar {
    width: 10px;
    height: 10px;
  }
  .area-content .climates .slider .slides::-webkit-scrollbar-thumb {
    background: black;
    border-radius: 10px;
  }
  .area-content .climates .slider .slides::-webkit-scrollbar-track {
    background: transparent;
  }
  .area-content .climates .slider .number {
    display: flex;
    flex-direction: row;
    justify-content: center;
    column-gap: 10px;
    margin-bottom: 10px;
  }
  .area-content .climates .slider .number > div {
    content: '';
    width: 10px;
    height: 10px;
    background-color: var(--sf-primary-dim);
    border-radius: 50%;
  }
  @supports (scroll-snap-type) {
    .area-content .climates .slider .number > a {
      display: none;
    }
  }
`;
