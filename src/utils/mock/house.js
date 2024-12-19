import {
  ClimateEntity,
  ClimateStoveEntity,
  LightEntity,
  VacuumEntity,
} from './entities.js';

export const HOUSE = [
  {
    id: 'basement',
    icon: 'mdi:home-floor-b',
    level: -1,
    name: 'Basement',
    areas: [
      {
        id: 'cellar',
        icon: 'mdi:storage-tank-outline',
        name: 'Cellar',
        devices: [LightEntity],
      },
      {
        id: 'storage',
        icon: 'mdi:server',
        name: 'Storage',
        devices: [LightEntity, LightEntity],
      },
    ],
  },
  {
    id: 'garden',
    icon: 'mdi:bird',
    level: 0,
    name: 'Garden',
    areas: [
      {
        id: 'terrace',
        icon: 'mdi:balcony',
        name: 'Terrace',
        devices: [LightEntity, LightEntity],
      },
    ],
  },
  {
    id: 'ground_floor',
    icon: 'mdi:home-floor-g',
    level: 0,
    name: 'Ground floor',
    areas: [
      {
        id: 'parental_bedroom',
        icon: 'mdi:bed-double-outline',
        name: 'Parental bedroom',
        devices: [
          LightEntity,
          LightEntity,
          LightEntity,
          LightEntity,
          ClimateEntity,
        ],
      },
      {
        id: 'corridor_ground',
        icon: 'mdi:door-sliding',
        name: 'Corridor',
        devices: [LightEntity, LightEntity, ClimateEntity],
      },
      {
        id: 'kitchen',
        icon: 'mdi:fridge-outline',
        name: 'Kitchen',
        devices: [LightEntity],
      },
      {
        id: 'dining_room',
        icon: 'mdi:table-chair',
        name: 'Dining room',
        devices: [LightEntity, LightEntity, ClimateEntity],
      },
      {
        id: 'living_room',
        icon: 'mdi:sofa',
        name: 'Living room',
        devices: [
          LightEntity,
          LightEntity,
          ClimateEntity,
          VacuumEntity,
          ClimateStoveEntity,
        ],
      },
    ],
  },
  {
    id: 'floor_1',
    icon: 'mdi:home-floor-1',
    level: 0,
    name: 'Floor 1',
    areas: [
      {
        id: 'cabinet',
        icon: 'mdi:desk',
        name: 'Cabinet',
        devices: [LightEntity, LightEntity, ClimateEntity],
      },
      {
        id: 'bedroom_1',
        icon: 'mdi:bed-outline',
        name: 'Bedroom 1',
        devices: [LightEntity, ClimateEntity],
      },
      {
        id: 'bedroom_2',
        icon: 'mdi:bed-outline',
        name: 'Bedroom 2',
        devices: [LightEntity, ClimateEntity],
      },
      {
        id: 'bathroom',
        icon: 'mdi:bathtub-outline',
        name: 'Bathroom',
        devices: [LightEntity, LightEntity, ClimateEntity],
      },
      {
        id: 'toilette',
        icon: 'mdi:toilet',
        name: 'Toilette',
        devices: [LightEntity],
      },
    ],
  },
];
