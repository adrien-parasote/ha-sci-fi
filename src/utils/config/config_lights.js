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
TODO : revoir hexa_tiles with helpers entities
TODO : 
- area content
- action on click
- Gestion entity exclusion
- Gestion entity custom name
- Gestion entity light custom icon on/off
*/
