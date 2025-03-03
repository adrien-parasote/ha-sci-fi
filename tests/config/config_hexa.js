export default {
  header_message: 'Welcome back!',
  weather: {
    activate: true,
    weather_entity: 'weather.la_chapelle_sur_erdre',
    link: '?component=weather',
  },
  tiles: [
    {
      standalone: false,
      entity_kind: 'light',
      entities_to_exclude: [],
      active_icon: 'mdi:lightbulb-on-outline',
      inactive_icon: 'mdi:lightbulb-outline',
      name: 'Ligths',
      state_on: ['on'],
      state_error: null,
      link: '?component=lights',
    },
    {
      standalone: true,
      entity: 'binary_sensor.captur_ii_en_charge',
      active_icon: 'mdi:car-multiple',
      inactive_icon: 'mdi:car-multiple',
      name: 'Cars',
      state_on: ['on'],
      state_error: null,
      link: '?component=vehicles',
    },
    {
      standalone: true,
      entity: 'climate.clou',
      active_icon: 'sci:stove-heat',
      inactive_icon: 'sci:stove-off',
      name: 'Stove',
      state_on: ['heat', 'cool'],
      state_error: null,
      link: '?component=stove',
    },
    {
      standalone: true,
      entity: 'vacuum.dobby',
      active_icon: 'mdi:robot-vacuum',
      inactive_icon: 'sci:vacuum-sleep',
      name: 'Dobby',
      state_on: ['cleaning', 'returning'],
      state_error: 'error',
      link: '#',
    },
    {
      standalone: false,
      entity_kind: 'climate',
      entities_to_exclude: ['climate.clou'],
      active_icon: 'sci:radiator-heat',
      inactive_icon: 'sci:radiator-waiting',
      name: 'Radiators',
      state_on: ['auto', 'heat'],
      state_error: null,
      link: '?component=climate',
    },
  ],
};
