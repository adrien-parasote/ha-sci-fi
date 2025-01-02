import {NOW, generateid} from './utils';

export class Device {
  constructor(area_id, name) {
    this.id = generateid();
    this.area_id = area_id;
    this.configuration_url = null;
    this.config_entries = [];
    this.connections = [];
    this.created_at = NOW.toISOString();
    this.disabled_by = null;
    this.entry_type = null;
    this.hw_version = '';
    this.identifiers = [];
    this.labels = [];
    this.manufacturer = '';
    this.model = '';
    this.model_id = null;
    this.modified_at = NOW.toISOString();
    this.name_by_user = null;
    this.name = name;
    this.primary_config_entry = '';
    this.serial_number = null;
    this.sw_version = '';
    this.via_device_id = null;
  }
}
