import {config} from './src/utils/config/config_hexa.js';
import {hass} from './src/utils/mock/hass.js';

const element = window.customElements.get('sci-fi-hexa-tiles');
let card = new element();
card.hass = hass;
card.setConfig(config);
document.querySelector('#content').appendChild(card);
