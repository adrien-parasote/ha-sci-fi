import {Area} from './house';

export class Device {
  constructor(hass, device_id) {
    const device = hass.devices[device_id];
    this.area = device.area_id ? new Area(device.area_id, hass) : null;
    this.hw_version = device.hw_version;
    this.id = device.id;
    this.manufacturer = device.manufacturer;
    this.model = device.model;
    this.name = device.name;
    this.name_by_user = device.name_by_user;
    this.serial_number = device.serial_number;
    this.sw_version = device.sw_version;
  }
}
