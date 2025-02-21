import {
  ERR_HASS_HOST_REQUIRED,
  callService,
  createConnection,
  getAuth,
  getConfig,
  getUser,
  subscribeEntities,
  subscribeServices,
} from 'home-assistant-js-websocket';

window.hass = {
  dev: {},
  auth: null,
  connection: null,
  connected: false,
  user: {},
  states: {},
  services: {},
  floors: {},
  areas: {},
  devices: {},
  entities: {},
  callService: hassCallService,
};

async function hassCallService(service, serviceData, target) {
  await callService(window.hass.connection, service, serviceData, target).then(
    () => {
      window.hass.dev.setupEntitiesSubscription();
    }
  );
}

async function getConnection(auth) {
  const connection = await createConnection({auth});
  for (const ev of ['disconnected', 'ready', 'reconnect-error']) {
    connection.addEventListener(ev, () => console.log(`Event: ${ev}`));
  }
  // Clear url if we have been able to establish a connection
  if (location.search.includes('auth_callback=1')) {
    history.replaceState(null, '', location.pathname);
  }
  return connection;
}

function setupHass(auth, connection) {
  window.hass.auth = auth;
  window.hass.connection = connection;
  window.hass.connected = true;
  getUser(connection).then((user) => {
    window.hass.user = user;
  });
}

function connected() {
  document.getElementById('connectHA').disabled = true;
  document.getElementById('refreshStates').disabled = false;
  buildHass();
}

function getAuthOptions() {
  const storeAuth = true;
  const authOptions = storeAuth
    ? {
        async loadTokens() {
          try {
            return JSON.parse(localStorage.hassTokens);
          } catch (err) {
            return undefined;
          }
        },
        saveTokens: (tokens) => {
          localStorage.hassTokens = JSON.stringify(tokens);
        },
      }
    : {};
  return authOptions;
}

(async () => {
  const authOptions = getAuthOptions();
  if (localStorage.hassTokens) {
    let auth = await getAuth(authOptions);
    const connection = await getConnection(auth);
    setupHass(auth, connection);
    connected();
  }
})();

window.connect = async () => {
  let auth;
  const authOptions = getAuthOptions();
  try {
    auth = await getAuth(authOptions);
  } catch (err) {
    if (err === ERR_HASS_HOST_REQUIRED) {
      authOptions.hassUrl = prompt(
        'What host to connect to ?',
        'https://localhost:8123'
      );
      if (!authOptions.hassUrl) return;
      auth = await getAuth(authOptions);
    } else {
      alert(`Unknown error: ${err}`);
      return;
    }
  }
  const connection = await getConnection(auth);
  setupHass(auth, connection);
  connected();
};

let unsubEntities;
window.hass.dev.setupEntitiesSubscription = async () => {
  if (unsubEntities) {
    unsubEntities();
    console.debug('Sleeping');
    await new Promise((resolve) => setTimeout(resolve, 4000));
  }
  unsubEntities = subscribeEntities(window.hass.connection, (entities) => {
    window.hass.states = entities;
    // Unsubscribe to manually control state update
    unsubEntities();
    unsubEntities = null;
    dispatchEvent(
      new CustomEvent('hass-changed', {
        detail: 'states',
        bubbles: true,
        composed: true,
      })
    );
  });
};

let unsubServices;
window.hass.dev.setupServicesSubscription = async () => {
  if (unsubServices) {
    unsubServices();
    console.debug('Sleeping');
    await new Promise((resolve) => setTimeout(resolve, 4000));
  }
  unsubServices = subscribeServices(window.hass.connection, (services) => {
    window.hass.services = services;
    // Unsubscribe to manually control state update
    unsubServices();
    unsubServices = null;
    dispatchEvent(
      new CustomEvent('hass-changed', {
        detail: 'services',
        bubbles: true,
        composed: true,
      })
    );
  });
};

window.buildHass = function () {
  // Get Areas
  window.hass.connection
    .sendMessagePromise({
      type: 'config/area_registry/list',
    })
    .then(
      (areas) =>
        areas.forEach((area) => {
          window.hass.areas[area.area_id] = area;
        }),
      (err) => console.error('Failed to load areas', err)
    );
  // Get Floors
  window.hass.connection
    .sendMessagePromise({
      type: 'config/floor_registry/list',
    })
    .then(
      (floors) =>
        floors.forEach((floor) => {
          window.hass.floors[floor.floor_id] = floor;
        }),
      (err) => console.error('Failed to load floors', err)
    );
  // Get Devices
  window.hass.connection
    .sendMessagePromise({
      type: 'config/device_registry/list',
    })
    .then(
      (devices) =>
        devices.forEach((device) => {
          window.hass.devices[device.id] = device;
        }),
      (err) => console.error('Failed to load devices', err)
    );
  // Get entities
  window.hass.connection
    .sendMessagePromise({
      type: 'config/entity_registry/list',
    })
    .then(
      (entities) =>
        entities.forEach((entitie) => {
          window.hass.entities[entitie.entity_id] = entitie;
        }),
      (err) => console.error('Failed to load entities', err)
    );
  dispatchEvent(
    new CustomEvent('hass-created', {
      detail: 'create',
      bubbles: true,
      composed: true,
    })
  );

  getConfig(window.hass.connection).then(
    (config) => {
      window.hass.language = config.language;
      window.hass.locale = {
        language: config.language,
        number_format: 'language',
        time_format: 'language',
        date_format: 'language',
        time_zone: 'local',
        first_weekday: 'language',
      };
    },
    (err) => console.error('Failed to load config', err)
  );

  // Subscribe to services (hass.services)
  window.hass.dev.setupServicesSubscription();
  // Subscribe to entities (hass.states)
  window.hass.dev.setupEntitiesSubscription();
};
