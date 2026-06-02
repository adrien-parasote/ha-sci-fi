/**
 * dev/cards/bridge.js — Workbench scenarios for sci-fi-bridge
 * Spec: docs/specs/cards/bridge.md §Workbench (5 scénarios nommés)
 * Confirmed entities: 2026-06-01
 */

const BASE_ENTITIES = {
  'person.adrien':   { state: 'home', attributes: { friendly_name: 'Adrien', entity_picture: '/local/avatars/adrien.jpg' } },
  'person.virginie': { state: 'home', attributes: { friendly_name: 'Virginie', entity_picture: null } },
  'input_button.call_kids':               { state: 'unknown' },
  'input_button.action_wifi_guest':        { state: 'unknown' },
  'input_button.action_reboot_box':        { state: 'unknown' },
};

const scenarioNormal = {
  ...BASE_ENTITIES,
  'binary_sensor.frient_smoke_detector_salon_smoke':  { state: 'off' },
  'binary_sensor.frient_smoke_detector_garage_smoke': { state: 'off' },
  'switch.smoke_detector_switch': { state: 'on' },
  'automation.alerte_intrusion':  { state: 'off' },
  'input_boolean.holidays':       { state: 'off' },
  'binary_sensor.people_at_home': { state: 'on' },
  'cover.nodon_porte_garage':              { state: 'closed' },
  'lock.zbmini_lock_porte_garage':         { state: 'locked' },
  'automation.nuit_extinction_lumieres_etage': { state: 'on' },
  'automation.gestion_lumieres_etage':     { state: 'on' },
  'automation.maison_vide':                { state: 'off' },
  'input_number.temporisation_lumieres_nuit_etage': { state: '10', attributes: { min: 0, max: 60, step: 5 } },
  'switch.ouvreunlivre_guest':             { state: 'off' },
  'binary_sensor.cycle_lave_linge':        { state: 'off' },
  'binary_sensor.cycle_seche_linge':       { state: 'off' },
  'sensor.electrolux_lave_vaisselle_appliancestate': { state: 'Standby' },
  'binary_sensor.rinse_aid':               { state: 'off' },
  'binary_sensor.salt_missing':            { state: 'off' },
  'sensor.clou_pellet_quantity':           { state: '0.65' },
  'counter.pellet_stock':                  { state: '18', attributes: { maximum: 20 } },
  'binary_sensor.clou_stove_status':       { state: 'off' },
  'sensor.mureva_evlink_power':            { state: '0', attributes: { unit_of_measurement: 'W' } },
};

const scenarioAlert = {
  ...scenarioNormal,
  'person.virginie': { state: 'not_home', attributes: { friendly_name: 'Virginie', entity_picture: null } },
  'binary_sensor.frient_smoke_detector_garage_smoke': { state: 'on' },
  'automation.alerte_intrusion': { state: 'on' },
  'cover.nodon_porte_garage':    { state: 'open' },
  // Porte ouverte → cadenas logiquement déverrouillé
  'lock.zbmini_lock_porte_garage': { state: 'unlocked' },
  'binary_sensor.cycle_lave_linge': { state: 'on' },
  'sensor.electrolux_lave_vaisselle_appliancestate': { state: 'Running' },
  'binary_sensor.rinse_aid':     { state: 'on' },
  'sensor.clou_pellet_quantity': { state: '0.15' },
  'binary_sensor.clou_stove_status': { state: 'on' },
  'sensor.mureva_evlink_power':  { state: '2300', attributes: { unit_of_measurement: 'W' } },
};

const scenarioAway = {
  ...scenarioNormal,
  'person.adrien':   { state: 'work',     attributes: { friendly_name: 'Adrien',   entity_picture: '/local/avatars/adrien.jpg' } },
  'person.virginie': { state: 'not_home', attributes: { friendly_name: 'Virginie', entity_picture: null } },
  'binary_sensor.people_at_home': { state: 'off' },
  'automation.maison_vide': { state: 'on' },
  'input_boolean.holidays': { state: 'on' },
};

const scenarioDisconnected = {
  'person.adrien':   { state: 'unavailable', attributes: { friendly_name: 'Adrien',   entity_picture: null } },
  'person.virginie': { state: 'unavailable', attributes: { friendly_name: 'Virginie', entity_picture: null } },
  'binary_sensor.frient_smoke_detector_salon_smoke':  { state: 'unavailable' },
  'binary_sensor.frient_smoke_detector_garage_smoke': { state: 'unavailable' },
  'switch.smoke_detector_switch': { state: 'unavailable' },
  'automation.alerte_intrusion':  { state: 'unavailable' },
  'input_boolean.holidays':       { state: 'unavailable' },
  'binary_sensor.people_at_home': { state: 'unavailable' },
  'cover.nodon_porte_garage':     { state: 'unavailable' },
  'lock.zbmini_lock_porte_garage':{ state: 'unavailable' },
  'automation.nuit_extinction_lumieres_etage': { state: 'unavailable' },
  'automation.gestion_lumieres_etage':   { state: 'unavailable' },
  'automation.maison_vide':              { state: 'unavailable' },
  'input_number.temporisation_lumieres_nuit_etage': { state: 'unavailable' },
  'switch.ouvreunlivre_guest':           { state: 'unavailable' },
  'binary_sensor.cycle_lave_linge':      { state: 'unavailable' },
  'binary_sensor.cycle_seche_linge':     { state: 'unavailable' },
  'sensor.electrolux_lave_vaisselle_appliancestate': { state: 'unavailable' },
  'binary_sensor.rinse_aid':             { state: 'unavailable' },
  'binary_sensor.salt_missing':          { state: 'unavailable' },
  'sensor.clou_pellet_quantity':         { state: 'unavailable' },
  'counter.pellet_stock':                { state: 'unavailable' },
  'binary_sensor.clou_stove_status':     { state: 'unavailable' },
  'sensor.mureva_evlink_power':          { state: 'unavailable', attributes: { unit_of_measurement: 'W' } },
  'input_button.call_kids':               { state: '2024-01-01T00:00:00Z' },
  'input_button.action_wifi_guest':        { state: '2024-01-01T00:00:00Z' },
  'input_button.action_reboot_box':        { state: '2024-01-01T00:00:00Z' },
};

const scenarioMinimal = {
  ...BASE_ENTITIES,
  // _config overrides the full card config for this scenario only
  _config: {
    type: 'custom:sci-fi-bridge',
    title: 'Config Partielle',
    persons: [
      { entity: 'person.adrien' },
      { entity: 'person.virginie' },
    ],
    actions: {
      items: [
        { entity: 'input_button.call_kids',        name: 'Appeler enfants', icon: 'mdi:bullhorn',  color: 'var(--sf-primary, #00d2ff)' },
        { entity: 'input_button.action_wifi_guest', name: 'WiFi Invité',    icon: 'mdi:wifi-plus', color: 'var(--sf-accent-on, #00ff9d)' },
        { entity: 'input_button.action_reboot_box', name: 'Redémarrer box', icon: 'mdi:restart',   color: 'var(--sf-warning, #ffd60a)' },
      ],
    },
  },
};

export default {
  id: 'bridge',
  label: '🌉 Bridge Overview',
  tag: 'sci-fi-bridge',
  config: {
    type: 'custom:sci-fi-bridge',
    title: 'Bridge Overview',
    persons: [
      { entity: 'person.adrien' },
      { entity: 'person.virginie' },
    ],
    alerts: {
      smoke: [
        { entity: 'binary_sensor.frient_smoke_detector_salon_smoke',  name: 'Salon' },
        { entity: 'binary_sensor.frient_smoke_detector_garage_smoke', name: 'Stockage' },
      ],
      smoke_switch: 'switch.smoke_detector_switch',
      toggles: [
        { entity: 'automation.alerte_intrusion', name: 'Intrusion',  icon: 'mdi:motion-sensor' },
        { entity: 'input_boolean.holidays',      name: 'Vacances',   icon: 'mdi:beach' },
      ],
      occupancy: 'binary_sensor.people_at_home',
    },
    access: {
      items: [
        { entity: 'cover.nodon_porte_garage', name: 'Porte Garage', icon: 'mdi:garage', lock: 'lock.zbmini_lock_porte_garage' },
      ],
    },
    automations: {
      items: [
        { entity: 'automation.nuit_extinction_lumieres_etage', name: 'Nuit extinction',  type: 'toggle', icon: 'mdi:lightbulb-night' },
        { entity: 'automation.gestion_lumieres_etage',          name: 'Gestion lumières', type: 'toggle', icon: 'mdi:lightbulb-auto' },
        { entity: 'automation.maison_vide',                     name: 'Maison vide',      type: 'toggle', icon: 'mdi:home-off' },
        { entity: 'input_number.temporisation_lumieres_nuit_etage', name: 'Tempo lumières', type: 'slider', icon: 'mdi:timer-outline', min: 0, max: 60, step: 5, unit: 'min' },
        { entity: 'switch.ouvreunlivre_guest',                  name: 'WiFi Invité',      type: 'toggle', icon: 'mdi:wifi' },
      ],
    },
    appliances: {
      cycles: [
        { entity: 'binary_sensor.cycle_lave_linge',      name: 'Lave-linge',    icon: 'mdi:washing-machine' },
        { entity: 'binary_sensor.cycle_seche_linge',     name: 'Sèche-linge',   icon: 'mdi:tumble-dryer' },
        { entity: 'sensor.electrolux_lave_vaisselle_appliancestate', name: 'Lave-vaisselle', icon: 'mdi:dishwasher', running_states: ['Running', 'Programme running'] },
      ],
      consumables: [
        { entity: 'binary_sensor.rinse_aid',   name: 'Liquide', ok_when: 'off' },
        { entity: 'binary_sensor.salt_missing', name: 'Sel',     ok_when: 'off' },
      ],
    },
    stove: {
      pellet_quantity: 'sensor.clou_pellet_quantity',
      pellet_stock:    'counter.pellet_stock',
      status:          'binary_sensor.clou_stove_status',
      low_threshold:   0.3,
    },
    vehicle: {
      power_sensor: 'sensor.mureva_evlink_power',
    },
    actions: {
      items: [
        { entity: 'input_button.call_kids',        name: 'Appeler enfants', icon: 'mdi:bullhorn',    color: 'var(--sf-primary, #00d2ff)' },
        { entity: 'input_button.action_wifi_guest', name: 'WiFi Invité',    icon: 'mdi:wifi-plus',   color: 'var(--sf-accent-on, #00ff9d)' },
        { entity: 'input_button.action_reboot_box', name: 'Redémarrer box', icon: 'mdi:restart',     color: 'var(--sf-warning, #ffd60a)' },
      ],
    },
  },
  scenarios: {
    'Normal (tout OK)':                scenarioNormal,
    'Mode Alerte':                     scenarioAlert,
    'Maison Vide (Absent)':            scenarioAway,
    'Déconnecté (Unavailable)':        scenarioDisconnected,
    'Config Partielle (CREW + ACTIONS)':  scenarioMinimal,
  },
};
