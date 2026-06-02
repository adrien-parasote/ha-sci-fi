// ─── Mock HASS builder module ────────────────────────────────────────────────
// Builds mock and live hass objects for the workbench.

import { MOCK_STATES, MOCK_AREAS, MOCK_FLOORS, MOCK_ENTITIES, MOCK_DEVICES } from './mock-data.js';
import { log } from './console.js';
import { callService } from '/node_modules/home-assistant-js-websocket/dist/index.js';

/**
 * Merge scenario overrides into MOCK_STATES.
 * Supports `$match:pattern` keys for wildcard matching.
 *
 * @param {Object} overrides - State overrides (entity_id → partial state)
 * @returns {Object} Merged states
 */
export function resolveScenario(overrides) {
  const states = { ...MOCK_STATES };

  for (const key of Object.keys(overrides)) {
    if (key.startsWith('$match:')) {
      // Wildcard matching
      const pattern = key.slice('$match:'.length);
      const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
      for (const stateKey of Object.keys(MOCK_STATES)) {
        if (regex.test(stateKey)) {
          states[stateKey] = {
            ...MOCK_STATES[stateKey],
            ...overrides[key],
            entity_id: stateKey, // always inject — HA hass.states always has entity_id on each entity
            attributes: {
              ...(MOCK_STATES[stateKey]?.attributes || {}),
              ...(overrides[key]?.attributes || {}),
            },
          };
        }
      }
    } else {
      // Direct entity override — deep-merge attributes
      states[key] = {
        ...MOCK_STATES[key],
        ...overrides[key],
        entity_id: key, // always inject — HA hass.states always has entity_id on each entity
        attributes: {
          ...(MOCK_STATES[key]?.attributes || {}),
          ...(overrides[key]?.attributes || {}),
        },
      };
    }
  }

  return states;
}

/**
 * Build a complete mock hass object for dev workbench.
 *
 * @param {Object} scenarioOverrides - Scenario state overrides
 * @param {string} language - Language code ('fr' or 'en')
 * @returns {Object} Mock hass object
 */
export function buildMockHass(scenarioOverrides = {}, language = 'fr') {
  const rawStates = resolveScenario(scenarioOverrides);

  // Normalize: inject entity_id on every state entry (matches real HA behaviour).
  // MOCK_STATES uses entity IDs as dict keys but not as properties on the object.
  const states = Object.fromEntries(
    Object.entries(rawStates).map(([id, state]) => [
      id,
      state?.entity_id ? state : { ...state, entity_id: id },
    ])
  );

  const subscribeMessageMock = (cb, msg) => {
    if (msg.type === 'weather/subscribe_forecast') {
      if (msg.forecast_type === 'hourly') {
        // Generate 120 hours of hourly forecast to match all days in daily forecast
        const hourly = [];
        const now = Date.now();
        const conditions = ['partlycloudy', 'rainy', 'sunny', 'cloudy', 'sunny'];
        for (let i = 0; i < 120; i++) {
          const dt = new Date(now + i * 3600000);
          const dayIdx = Math.floor(i / 24);
          const hour = dt.getHours();
          // Simulated temperature profile (colder at night, warmer in afternoon)
          const baseTemp = 18 - dayIdx * 2;
          const tempOffset = 6 * Math.sin((hour - 8) / 12 * Math.PI);
          const temp = Math.round(baseTemp + tempOffset);
          hourly.push({
            datetime: dt.toISOString(),
            condition: conditions[dayIdx % conditions.length],
            temperature: temp,
            precipitation: Math.random() > 0.75 ? parseFloat((Math.random() * 2).toFixed(1)) : 0,
            wind_speed: Math.round(10 + Math.random() * 15),
          });
        }
        setTimeout(() => cb({ forecast: hourly }), 50);
      } else {
        // Return unwrapped daily forecast to matching callback
        setTimeout(() => cb({ forecast: states['weather.la_chapelle_sur_erdre']?.attributes?.forecast ?? [] }), 50);
      }
    }
    return Promise.resolve(() => { });
  };

  return {
    states,
    areas: MOCK_AREAS,
    floors: MOCK_FLOORS,
    entities: MOCK_ENTITIES,
    devices: MOCK_DEVICES,
    user: { name: 'Adrien', id: 'adrien', is_admin: true },
    language,
    locale: { language, number_format: 'comma_decimal', time_format: '24', date_format: 'DMY', time_zone: 'Europe/Paris', first_weekday: 'monday' },
    config: { unit_system: { length: 'km', temperature: '°C' }, time_zone: 'Europe/Paris' },
    themes: { darkMode: true, theme: 'default' },
    connection: {
      subscribeEvents: () => () => { },
      sendMessagePromise: async (msg) => {
        if (msg.type === 'weather/subscribe_forecast') return { forecast: states['weather.la_chapelle_sur_erdre']?.attributes?.forecast ?? [] };
        if (msg && msg.type === 'logbook/get_events') {
          return mockLogbookEvents(scenarioOverrides);
        }
        return {};
      },
      addEventListener: () => { },
      removeEventListener: () => { },
      subscribeMessage: subscribeMessageMock,
    },
    subscribeMessage: subscribeMessageMock,
    callService: (domain, service, data) => {
      log(`🔧 callService(${domain}.${service})`, 'ok');

      // Simulate state mutation for common services so UI toggles/sliders respond
      const entityId = data?.entity_id;
      if (entityId && states[entityId]) {
        const s = states[entityId];
        if (service === 'turn_on')  { states[entityId] = { ...s, state: 'on' }; }
        else if (service === 'turn_off') { states[entityId] = { ...s, state: 'off' }; }
        else if (service === 'toggle') {
          states[entityId] = { ...s, state: s.state === 'on' ? 'off' : 'on' };
        }
        else if (service === 'open_cover')  { states[entityId] = { ...s, state: 'open' }; }
        else if (service === 'close_cover') { states[entityId] = { ...s, state: 'closed' }; }
        else if (service === 'set_value' && data?.value !== undefined) {
          states[entityId] = { ...s, state: String(data.value) };
        }
        else if (service === 'press') {
          // input_button: keep state as is, no visual change needed
        }
        // Notify cards of state change via a custom event on the hass object
        window.dispatchEvent(new CustomEvent('mock-hass-state-changed', { detail: { states } }));
      }

      return Promise.resolve();
    },
    callWS: async (msg) => {
      if (msg && msg.type === 'logbook/get_events') {
        return mockLogbookEvents(scenarioOverrides);
      }
      return {};
    },
    callApi: async (method, path) => {
      // Mock history API for plugs power chart
      log(`📊 callApi(${method}, ${path})`, 'info');
      if (path.includes('history/period')) {
        const now = Date.now();
        // Generate 24h of mock power data (one point every 30 min)
        const history = Array.from({ length: 48 }, (_, i) => ({
          last_changed: new Date(now - (47 - i) * 30 * 60 * 1000).toISOString(),
          state: String(Math.round(10 + Math.random() * 25)),
        }));
        return [history];
      }
      return [[]];
    },
  };
}

/**
 * Wrap a real HA connection into a hass-compatible object.
 *
 * @param {Object} baseHass - Base hass object built from live HA data
 * @param {string} language - Language code
 * @param {Object} haConnection - HA websocket connection
 * @param {Object} haAuth - HA auth object
 * @returns {Object} Live hass object
 */
export function buildLiveHass(baseHass, language = 'fr', haConnection, haAuth) {
  return {
    ...baseHass,
    language,
    locale: { ...baseHass.locale, language },
    callService: async (domain, service, serviceData, target) => {
      log(`🔧 live callService(${domain}.${service})`, 'live');
      await callService(haConnection, domain, service, serviceData, target);
    },
    callWS: async (msg) => haConnection.sendMessagePromise(msg),
    subscribeMessage: (cb, msg) => {
      if (haConnection) return haConnection.subscribeMessage(cb, msg);
      return Promise.resolve(() => { });
    },
    callApi: async (method, path, parameters) => {
      if (!haAuth) throw new Error('Not connected to HA');
      const baseUrl = haAuth.data?.hassUrl ?? haAuth.hassUrl ?? '';
      const url = `${baseUrl}/api/${path}`;
      log(`📊 live callApi(${method}, ${path})`, 'live');
      const res = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${haAuth.accessToken}`,
          'Content-Type': 'application/json',
        },
        ...(parameters ? { body: JSON.stringify(parameters) } : {}),
      });
      if (!res.ok) throw new Error(`HA API ${res.status}: ${path}`);
      return res.json();
    },
  };
}

/**
 * Helper to generate mock logbook events matching active scenario state.
 */
function mockLogbookEvents(scenarioOverrides = {}) {
  const now = Date.now();
  const baseLogs = [
    { entity_id: 'switch.valve_main', state: 'on', when: new Date(now - 15 * 60 * 1000).toISOString(), name: 'Vanne Principale' },
    { entity_id: 'switch.arrosage_terrasse', state: 'off', when: new Date(now - 30 * 60 * 1000).toISOString(), name: 'Arrosage Terrasse' },
    { entity_id: 'switch.arrosage_haie', state: 'off', when: new Date(now - 45 * 60 * 1000).toISOString(), name: 'Arrosage Haie' },
  ];
  
  if (scenarioOverrides['switch.arrosage_terrasse']?.state === 'on') {
    baseLogs.unshift({
      entity_id: 'switch.arrosage_terrasse',
      state: 'on',
      when: new Date(now - 5 * 60 * 1000).toISOString(),
      name: 'Arrosage Terrasse'
    });
  }
  if (scenarioOverrides['switch.arrosage_haie']?.state === 'on') {
    baseLogs.unshift({
      entity_id: 'switch.arrosage_haie',
      state: 'on',
      when: new Date(now - 2 * 60 * 1000).toISOString(),
      name: 'Arrosage Haie'
    });
  }

  if (scenarioOverrides['sensor.leak_kitchen']?.state === 'on') {
    baseLogs.unshift({
      entity_id: 'sensor.leak_kitchen',
      state: 'on',
      when: new Date(now - 3 * 60 * 1000).toISOString(),
      name: 'Fuite Cuisine',
      device_class: 'moisture'
    });
  }
  if (scenarioOverrides['switch.valve_main']?.state === 'unavailable') {
    baseLogs.unshift({
      entity_id: 'switch.valve_main',
      state: 'unavailable',
      when: new Date(now - 1 * 60 * 1000).toISOString(),
      name: 'Vanne Principale'
    });
  }
  
  return baseLogs;
}
