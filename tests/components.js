import config_hexa from './config/config_hexa.js';
import config_lights from './config/config_lights.js';
import config_weather from './config/config_weather.js';

const MAP = {
  hexa: {
    config: config_hexa,
    element: window.customElements.get('sci-fi-hexa-tiles'),
  },
  lights: {
    config: config_lights,
    element: window.customElements.get('sci-fi-lights'),
  },
  weather: {
    config: config_weather,
    element: window.customElements.get('sci-fi-weather'),
  },
};

let content = null;
let hassRdy = false;
let srvRdy = false;
let statesRdy = false;

function renderElement(){
  if (!content) {
    const param = new URLSearchParams(window.location.search).get(
      'component'
    );
    const component_name =
      param && Object.keys(MAP).includes(param) ? param : 'hexa';

    
    // Create component
    const component = new MAP[component_name].element();
    const editor = MAP[component_name].element.getConfigElement();

    if(document.getElementById('editor').checked){
      editor.hass = window.hass;
      editor.setConfig(MAP[component_name].element.getStubConfig());
      content = document.getElementById('phone').appendChild(editor);
    }else{
      component.hass = window.hass;
      component.setConfig(MAP[component_name].config);
      content = document.getElementById('phone').appendChild(component);
    }
  } else {
    content.hass = window.hass;
  }
}


window.addEventListener('hass-created', (e) => {
  hassRdy = true;
});

window.addEventListener('hass-changed', (e) => {
  if (e.detail == 'services') srvRdy = true;
  if (e.detail == 'states') statesRdy = true;
  if (srvRdy && statesRdy) {
    renderElement();
  }
});

window.editorMode = function(checkbox){
  var node = document.getElementById('phone');
  while (node.hasChildNodes()) {
      node.removeChild(node.firstChild);
  }
  content = null;
  renderElement();
}

window.addEventListener('config-changed', (e) => {
  content.setConfig(e.detail.config);
  console.log(e.detail.config)
});