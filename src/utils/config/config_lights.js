export const config = {
  default_icons: {
    on: 'mdi:lightbulb-on-outline',
    off: 'mdi:lightbulb-outline',
  },
  floors: {
    to_exclude: ['basement', 'garden'],
    first_to_render: 'ground_floor',
  },
  areas: {
    to_exclude: ['kitchen'],
    first_to_render: 'parental_bedroom',
  },
  entities: {},
};

/*
TODO : readme
TODO : editor
TODO : Global floor bar
TODO : Change font
TODO : 
- Gestion entity exclusion
- Gestion entity custom name
- Gestion entity light custom icon on/off
*/
