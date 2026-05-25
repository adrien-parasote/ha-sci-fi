import { css } from 'lit';

export const hexaTilesStyles = css`
  ha-card {
    background: #000000 !important;
    border: none !important;
    padding: var(--sf-spacing-md) 0;
    display: block;
    width: 100%;
    height: 100% !important;
    min-height: 100vh;
    box-sizing: border-box;
  }

  .container {
    padding: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
  }

  .header {
    display: flex;
    flex-direction: row;
    column-gap: 16px;
    margin-bottom: var(--sf-spacing-md);
    padding: 0 var(--sf-spacing-md);
    align-items: center;
    width: 100%;
    box-sizing: border-box;
  }
  .avatar-container {
    position: relative;
    width: 60px;
    height: 60px;
  }
  .avatar {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    border: 2px solid var(--sf-primary, #00d2ff);
    box-shadow: 0 0 8px var(--sf-primary, #00d2ff);
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.04);
    position: relative;
  }
  .avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .avatar-initials {
    font-size: 1.5rem;
    font-weight: bold;
    color: var(--sf-primary, #00d2ff);
  }
  .status-badge {
    position: absolute;
    top: -6px;
    right: -6px;
    width: 26px;
    height: 26px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .status-badge sf-icon {
    --icon-width: 22px;
    --icon-height: 22px;
    --icon-color: var(--sf-primary, #00d2ff);
  }
  .header-info {
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .header-message {
    font-size: 0.8rem;
    color: var(--sf-primary, #00d2ff);
    margin-bottom: 2px;
    text-transform: capitalize;
  }
  .header-name {
    font-size: 1.2rem;
    font-weight: bold;
    color: #ffffff;
    text-shadow: 0 0 6px var(--sf-primary, #00d2ff);
  }

  /* Icon mapping for Light DOM sf-icon */
  sf-icon svg, .sf-icon {
    width: var(--icon-width, 24px);
    height: var(--icon-height, 24px);
    fill: var(--icon-color, currentColor);
    display: inline-block;
  }

  :host {
    --tile-width: calc(100% / (var(--cols, 2) + 0.5));
    --tile-height: calc(var(--tile-width) * 1.1547);
    display: block;
    height: 100%;
  }
  .hexa-grid {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
  }
  .hexa-row {
    display: flex;
    flex-direction: row;
    justify-content: center;
    height: var(--tile-height);
    margin-bottom: calc(var(--tile-height) * -0.25);
    width: 100%;
  }
  .hexa-row:last-child {
    margin-bottom: 0;
  }

  /* Hexagon tile */
  .hexa-tile {
    position: relative;
    width: var(--tile-width);
    height: var(--tile-height);
    margin: 0;
    cursor: pointer;
    display: block;
  }
  .hexa-half {
    width: calc(var(--tile-width) / 2);
    height: var(--tile-height);
    margin: 0;
  }
  .hexa-half svg {
    width: 100%;
    height: 100%;
    display: block;
  }
  .hexa-half svg polygon {
    fill: rgba(16, 22, 38, 0.6);
    stroke: rgba(224, 232, 255, 0.1);
    stroke-width: 1.5px;
  }

  /* SVG structures */
  .hexa-svg {
    width: 100%;
    height: 100%;
    display: block;
  }
  .hexa-bg {
    transition: fill var(--sf-transition-fast);
  }
  .hexa-border {
    transition: stroke var(--sf-transition-fast), filter var(--sf-transition-fast);
    fill: none;
  }

  /* Active vs Inactive tile styles */
  .hexa-tile[data-active="true"] .hexa-bg {
    fill: rgba(0, 210, 255, 0.08);
  }
  .hexa-tile[data-active="true"] .hexa-border {
    stroke: var(--sf-primary, #00d2ff);
    stroke-width: 2px;
    filter: drop-shadow(0 0 4px var(--sf-primary, #00d2ff));
  }
  .hexa-tile[data-active="false"] .hexa-bg {
    fill: rgba(16, 22, 38, 0.6);
  }
  .hexa-tile[data-active="false"] .hexa-border {
    stroke: rgba(224, 232, 255, 0.1);
    stroke-width: 1.5px;
  }

  /* Hover effects */
  .hexa-tile:hover .hexa-border {
    stroke: var(--sf-primary, #00d2ff);
    filter: drop-shadow(0 0 6px var(--sf-primary, #00d2ff));
  }

  /* Center content */
  .hexa-content {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 6px;
    box-sizing: border-box;
    z-index: 2;
    pointer-events: none; /* Let clicks pass to the wrapper */
  }
  .hexa-content sf-icon {
    --icon-width: 56px;
    --icon-height: 56px;
    transition: color var(--sf-transition-fast), filter var(--sf-transition-fast);
  }
  .hexa-tile[data-active="true"] .hexa-content sf-icon {
    --icon-color: var(--sf-primary, #00d2ff);
    filter: drop-shadow(0 0 3px var(--sf-primary, #00d2ff));
  }
  .hexa-tile[data-active="false"] .hexa-content sf-icon {
    --icon-color: rgba(224, 232, 255, 0.4);
  }
  .hexa-tile.weather-tile[data-active="true"] .hexa-content sf-icon {
    --icon-color: #ffd60a;
    filter: drop-shadow(0 0 3px #ffd60a);
  }

  /* Alert-level border colors on weather tile */
  .hexa-tile.weather-tile[data-alert-level="yellow"] .hexa-border {
    stroke: #ffd60a;
    stroke-width: 2px;
    filter: drop-shadow(0 0 6px #ffd60a);
  }
  .hexa-tile.weather-tile[data-alert-level="orange"] .hexa-border {
    stroke: #ff6b35;
    stroke-width: 2px;
    filter: drop-shadow(0 0 6px #ff6b35);
  }
  .hexa-tile.weather-tile[data-alert-level="red"] .hexa-border {
    stroke: #ff4d6d;
    stroke-width: 2.5px;
    filter: drop-shadow(0 0 8px #ff4d6d);
  }
  .hexa-tile.weather-tile[data-alert-level="yellow"] .hexa-content sf-icon {
    --icon-color: #ffd60a;
    filter: drop-shadow(0 0 4px #ffd60a);
  }
  .hexa-tile.weather-tile[data-alert-level="orange"] .hexa-content sf-icon {
    --icon-color: #ff6b35;
    filter: drop-shadow(0 0 4px #ff6b35);
  }
  .hexa-tile.weather-tile[data-alert-level="red"] .hexa-content sf-icon {
    --icon-color: #ff4d6d;
    filter: drop-shadow(0 0 6px #ff4d6d);
  }

  .tile-label {
    font-size: 0.625rem;
    font-weight: 500;
    margin-top: 4px;
    max-width: 90%;
    line-height: 1.2;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    transition: color var(--sf-transition-fast);
  }
  .hexa-tile[data-active="true"] .tile-label {
    color: var(--sf-primary, #00d2ff);
    text-shadow: 0 0 5px var(--sf-primary, #00d2ff);
  }
  .hexa-tile[data-active="false"] .tile-label {
    color: rgba(224, 232, 255, 0.4);
  }

  .weather-alert {
    padding: var(--sf-spacing-sm);
    border-radius: var(--sf-radius-sm);
    margin-bottom: var(--sf-spacing-md);
    text-align: center;
    font-size: var(--sf-font-size-sm);
    font-weight: 600;
    width: calc(100% - 2 * var(--sf-spacing-md));
    box-sizing: border-box;
  }
  .weather-alert[data-level="green"] { background: rgba(0,255,157,0.1); color: #00ff9d; }
  .weather-alert[data-level="yellow"] { background: rgba(255,214,10,0.1); color: #ffd60a; }
  .weather-alert[data-level="orange"] { background: rgba(255,107,53,0.1); color: #ff6b35; }
  .weather-alert[data-level="red"] { background: rgba(255,77,109,0.15); color: #ff4d6d; }
`;
