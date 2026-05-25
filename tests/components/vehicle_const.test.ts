import { expect, describe, it } from 'vitest';
import * as consts from '../../src/components/vehicle_const.js';

describe('vehicle_const', () => {
  it('should export correct Renault HA service values', () => {
    expect(consts.HASS_RENAULT_SERVICE).toBe('renault');
    expect(consts.HASS_RENAULT_SERVICE_ACTION_START_AC).toBe('ac_start');
    expect(consts.HASS_RENAULT_SERVICE_ACTION_STOP_AC).toBe('ac_cancel');
  });

  it('should export correct generic sensor states', () => {
    expect(consts.VEHICLE_SENSOR_ON_STATE).toBe('on');
    expect(consts.VEHICLE_SENSOR_UNAVAILABLE_STATE).toBe('unavailable');
  });

  it('should export correct charge states', () => {
    expect(consts.VEHICLE_CHARGE_STATES_NOT_IN_CHARGE).toBe('not_in_charge');
    expect(consts.VEHICLE_CHARGE_STATES_WAITING_PLANNED_CHARGE).toBe('waiting_for_a_planned_charge');
    expect(consts.VEHICLE_CHARGE_STATES_WAITING_CURRENT_CHARGE).toBe('waiting_for_current_charge');
    expect(consts.VEHICLE_CHARGE_STATES_CHARGE_IN_PROGRESS).toBe('charge_in_progress');
    expect(consts.VEHICLE_CHARGE_STATES_CHARGE_ENDED).toBe('charge_ended');
    expect(consts.VEHICLE_CHARGE_STATES_CHARGE_ERROR).toBe('charge_error');
    expect(consts.VEHICLE_CHARGE_STATES_ENERGY_FLAP_OPENED).toBe('energy_flap_opened');
    expect(consts.VEHICLE_CHARGE_STATES_UNAVAILABLE).toBe('unavailable');
  });

  it('should export correct plug states', () => {
    expect(consts.VEHICLE_PLUG_STATES_UNPLUGGED).toBe('unplugged');
    expect(consts.VEHICLE_PLUG_STATES_PLUGGED).toBe('plugged');
    expect(consts.VEHICLE_PLUG_STATES_PLUGGED_WAITING_FOR_CHARGE).toBe('plugged_waiting_for_charge');
    expect(consts.VEHICLE_PLUG_STATES_ERROR).toBe('plug_error');
    expect(consts.VEHICLE_PLUG_STATES_UNKNOWN).toBe('plug_unknown');
    expect(consts.VEHICLE_PLUG_UNAVAILABLE).toBe('unavailable');
  });

  it('should have a valid charge state icon map', () => {
    expect(consts.CHARGE_STATE_ICONS[consts.VEHICLE_CHARGE_STATES_NOT_IN_CHARGE]).toBe('mdi:battery-off');
    expect(consts.CHARGE_STATE_ICONS[consts.VEHICLE_CHARGE_STATES_CHARGE_IN_PROGRESS]).toBe('mdi:battery-charging-medium');
    expect(consts.CHARGE_STATE_ICONS[consts.VEHICLE_CHARGE_STATES_CHARGE_ENDED]).toBe('mdi:battery-check');
  });

  it('should have a valid plug state icon map', () => {
    expect(consts.PLUG_STATE_ICONS[consts.VEHICLE_PLUG_STATES_UNPLUGGED]).toBe('sci:landspeeder-plugged-off');
    expect(consts.PLUG_STATE_ICONS[consts.VEHICLE_PLUG_STATES_PLUGGED]).toBe('sci:landspeeder-plugged');
    expect(consts.PLUG_STATE_ICONS[consts.VEHICLE_PLUG_UNAVAILABLE]).toBe('sci:landspeeder-unknown-plug');
  });
});
