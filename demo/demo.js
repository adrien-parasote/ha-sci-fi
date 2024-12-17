import {hass} from '../src/utils/mock/hass.js';

// Define global elements and shared config
const element = window.customElements.get('sci-fi-hexa-tiles');
let config = element.getStubConfig();
let editor = element.getConfigElement();

// Setup elements internal components
let card = new element();
card.hass = hass;
card.setConfig(config);
editor.hass = hass;
editor.setConfig(config);

// Render
document.querySelector('.editor').appendChild(editor);
document.querySelector('.preview').appendChild(card);

// Bind editod update on config
window.addEventListener('config-changed', (e) => {
  document.querySelector('.editor > *').setConfig(e.detail.config);
  try {
    document.querySelector('.preview > *').setConfig(e.detail.config);
  } catch (error) {
    alert(error);
  }
});
