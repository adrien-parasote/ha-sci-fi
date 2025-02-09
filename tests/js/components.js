import config_climates from '../config/config_climates.js';
import config_hexa from '../config/config_hexa.js';
import config_lights from '../config/config_lights.js';
import config_stove from '../config/config_stove.js';
import config_weather from '../config/config_weather.js';

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
  climate: {
    config: config_climates,
    element: window.customElements.get('sci-fi-climates'),
  },
  stove: {
    config: config_stove,
    element: window.customElements.get('sci-fi-stove'),
  },
};

let content = null;
let hassRdy = false;
let srvRdy = false;
let statesRdy = false;

function renderElement() {
  if (!content) {
    const param = new URLSearchParams(window.location.search).get('component');
    const component_name =
      param && Object.keys(MAP).includes(param) ? param : 'hexa';

    // Create component
    const component = new MAP[component_name].element();
    const editor = MAP[component_name].element.getConfigElement();

    if (document.getElementById('editor').checked) {
      editor.setConfig(MAP[component_name].element.getStubConfig());
      editor.hass = window.hass;
      content = document.getElementById('phone').appendChild(editor);
    } else {
      component.setConfig(MAP[component_name].config);
      component.hass = window.hass;
      content = document.getElementById('phone').appendChild(component);
    }
  } else {
    content.hass = window.hass;
  }
}

function cleanContent() {
  var node = document.getElementById('phone');
  while (node.hasChildNodes()) {
    node.removeChild(node.firstChild);
  }
  content = null;
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

window.editorMode = function (checkbox) {
  cleanContent();
  renderElement();
};

window.addEventListener('config-changed', (e) => {
  content.setConfig(e.detail.config);
  console.log(e.detail.config);
});

(() => {
  const select = document.getElementById('components');
  let param = new URLSearchParams(window.location.search).get('component');
  param = param && Object.keys(MAP).includes(param) ? param : 'hexa';
  Object.keys(MAP).forEach((key) => {
    const option = document.createElement('option');
    option.value = key;
    option.innerHTML = key;
    if (param == key) option.selected = true;
    select.appendChild(option);
  });
  select.addEventListener('change', function () {
    const query = ['component', this.value].join('=');
    var searchParams = new URLSearchParams(window.location.search);
    searchParams.set('component', this.value);
    window.history.pushState(
      null,
      '',
      [window.location.pathname, '?', searchParams.toString()].join('')
    );
    cleanContent();
    renderElement();
  });
  renderElement();
})();
