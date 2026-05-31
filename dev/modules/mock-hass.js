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
        attributes: {
          ...(MOCK_STATES[key]?.attributes || {}),
          ...(overrides[key]?.attributes || {}),
        },
      };
      // Preserve entity_id from MOCK_STATES if it exists
      if (MOCK_STATES[key]?.entity_id) {
        states[key].entity_id = MOCK_STATES[key].entity_id;
      }
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
  const states = resolveScenario(scenarioOverrides);

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
        return {};
      },
      addEventListener: () => { },
      removeEventListener: () => { },
      subscribeMessage: subscribeMessageMock,
    },
    subscribeMessage: subscribeMessageMock,
    callService: (domain, service, _data) => { log(`🔧 callService(${domain}.${service})`, 'ok'); return Promise.resolve(); },
    callWS: async () => ({}),
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
