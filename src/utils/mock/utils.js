export const NOW = new Date();

export function generateid() {
  let result = '';
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < 26; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

export function nameToId(kind, name) {
  return [kind, name.toLowerCase().replaceAll(' ', '_')].join('.');
}

export function pad(nb) {
  return (nb > 9 ? '' : '0') + nb;
}

export function getStrDatetime(date, full = false) {
  const firstPart = [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
  ].join('-');
  const hh = date.getHours();
  const secondPart = [
    pad(hh),
    full ? pad(date.getMinutes()) : '00',
    full ? pad(date.getSeconds()) : '00',
  ].join(':');

  return [firstPart, 'T', secondPart, '+01:00'].join('');
}

export const WEATHER_STATES = [
  'clear',
  'clear-night',
  'cloudy',
  'exceptional',
  'fog',
  'hail',
  'lightning',
  'lightning-rainy',
  'partlycloudy',
  'pouring',
  'rainy',
  'snowy',
  'snowy-rainy',
  'sunny',
  'windy',
  'windy-variant',
];
