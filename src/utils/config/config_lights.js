export const config = {
  default_icons: {
    on: 'mdi:lightbulb-on-outline',
    off: 'mdi:lightbulb-outline',
  },
  first_floor_to_render: 'floor_1',
  first_area_to_render: 'toilette',
  custom_entities: {
    'light.light_parental_bedroom_0': {
      name: 'custom name 0',
      icon_on: 'mdi:ceiling-light-outline',
      icon_off: 'mdi:ceiling-light',
    },
    'light.light_parental_bedroom_1': {
      icon_on: 'mdi:floor-lamp-outline',
      icon_off: 'mdi:floor-lamp',
    },
    'light.light_parental_bedroom_2': {
      name: 'custom name 2',
    },
  },
};
