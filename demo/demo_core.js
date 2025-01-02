import {config} from '../src/utils/config/config_lights.js';
import {hass} from '../src/utils/mock/hass.js';

const element = window.customElements.get('sci-fi-lights');

export function demoRender(element, config) {
  // Component
  let component = new element();
  component.hass = hass;
  component.setConfig(config);
  document.querySelector('#content').appendChild(component);
  // Define global elements and shared config
  let sub_config = element.getStubConfig();
  let editor = element.getConfigElement();
  // Setup elements internal components
  let card = new element();

  // Render
  document.querySelector('.editor').appendChild(editor);
  document.querySelector('.preview').appendChild(card);
  // Bind editod update on config
  window.addEventListener('config-changed', (e) => {
    console.log(e.detail.config);
    document.querySelector('.editor > *').setConfig(e.detail.config);
    try {
      document.querySelector('.preview > *').setConfig(e.detail.config);
    } catch (error) {
      console.error(error);
    }
  });
  // Setup compoonent
  card.hass = hass;
  editor.hass = hass;
  card.setConfig(sub_config);
  editor.setConfig(sub_config);
}
