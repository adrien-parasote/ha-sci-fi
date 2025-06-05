export default {
  devices: [
    {
      device_id: '7ae536ffff7d2371aadcdbc90750108d',
      entity_id: 'switch.nous_paillette_charlotte',
      active_icon: 'mdi:lava-lamp',
      inactive_icon: 'mdi:lava-lamp',
      name: 'Lava lamp',
      sensors: {
        'number.nous_paillette_charlotte_countdown': {
          show: true,
          name: 'Countdown',
          power: false,
        },
        'select.nous_paillette_charlotte_power_outage_memory': {
          show: true,
          name: 'Power outage memory',
          power: false,
        },
        'select.nous_paillette_charlotte_indicator_mode': {
          show: true,
          name: 'Indicator mode',
          power: false,
        },
        'sensor.nous_paillette_charlotte_power': {
          show: false,
          name: 'Puissance',
          power: true,
        },
        'sensor.nous_paillette_charlotte_energy': {
          show: true,
          name: 'Energy',
          power: false,
        },
        'lock.nous_paillette_charlotte_child_lock': {
          show: true,
          name: 'Child lock',
          power: false,
        },
        'update.nous_paillette_charlotte': {
          show: false,
          name: 'Nous Paillette Charlotte',
          power: false,
        },
        'light.nous_paillette_charlotte': {
          show: true,
          name: 'Light',
          power: false,
        },
      },
    },
    {
      device_id: '4d644238c5ebefb7f11878e790fd9317',
      entity_id: 'switch.nous_lave_linge',
      active_icon: 'mdi:power-plug-outline',
      inactive_icon: 'mdi:power-plug-off-outline',
      name: 'Washing machine',
      sensors: {
        'number.nous_lave_linge_countdown': {
          show: true,
          name: 'Countdown',
          power: false,
        },
        'select.nous_lave_linge_power_outage_memory': {
          show: true,
          name: 'Power outage memory',
          power: false,
        },
        'select.nous_lave_linge_indicator_mode': {
          show: true,
          name: 'Indicator mode',
          power: false,
        },
        'sensor.nous_seche_linge_power': {
          show: false,
          name: 'Puissance',
          power: true,
        },
        'sensor.nous_lave_linge_energy': {
          show: true,
          name: 'Énergie',
          power: false,
        },
        'lock.nous_lave_linge_child_lock': {
          show: true,
          name: 'Child lock',
          power: false,
        },
        'update.nous_lave_linge': {
          show: false,
          name: 'Nous Lave Linge',
          power: false,
        },
        'binary_sensor.cycle_lave_linge': {
          show: true,
          name: 'Cycle',
          power: false,
        },
      },
    },
    {
      device_id: 'a041422639f495ca70ed05e3a74ff183',
      entity_id: 'switch.mureva_evlink',
      active_icon: 'sci:landspeeder-plugged',
      inactive_icon: 'sci:landspeeder-plugged-off',
      name: 'Mureva EVlink',
      sensors: {
        'select.mureva_evlink_power_on_behavior': {
          show: true,
          name: 'Power-on behavior',
          power: false,
        },
        'sensor.mureva_evlink_power': {
          show: false,
          name: 'Mureva EVlink Puissance',
          power: false,
        },
        'sensor.mureva_evlink_energy': {
          show: false,
          name: 'Mureva EVlink Énergie',
          power: false,
        },
        'sensor.mureva_evlink_energy_corrected': {
          show: true,
          name: 'Energy',
          power: false,
        },
        'sensor.mureva_evlink_power_corrected': {
          show: false,
          name: 'Power corrected',
          power: true,
        },
      },
    },
  ],
};
