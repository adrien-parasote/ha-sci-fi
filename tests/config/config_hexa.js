export default {
  header: {
    message: 'Welcome',
  },
  weather: {
    activate: true,
    sun_entity: 'sun.sun',
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
      entity: 'climate.clou',
      active_icon: 'sci:stove-heat',
      inactive_icon: 'sci:stove-off',
      name: 'Stove',
      state_on: ['heat', 'cool'],
      state_error: null,
      link: '#',
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
  ],
};
