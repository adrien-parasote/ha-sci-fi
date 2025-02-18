export const PACKAGE = 'sci-fi-weather';
export const NAME = 'Sci-fi weather card';
export const DESCRIPTION = 'Render sci-fi weather card.';

export const CHART_BG_COLOR = 'rgba(105, 211, 251, 0.5)';
export const CHART_BORDER_COLOR = 'rgb(102, 156, 210)';
export const SENSORS_MAP = {
  temperature: {
    dropdown: {
      label: 'Température',
      icon: 'thermometer-glass',
    },
    chartTitle: {
      label: 'Températures prévisionnelles',
      icon: 'thermometer',
    },
    chartDataKind: 'line',
    chartDatafill: true,
    chartOptionsScales: {
      y: {
        suggestedMin: null,
        suggestedMax: 30,
      },
    },
  },
  precipitation: {
    dropdown: {
      label: 'Précipitations',
      icon: 'raindrop-measure',
    },
    chartTitle: {
      label: 'Précipitations prévisionnelles',
      icon: 'raindrops',
    },
    chartDataKind: 'bar',
    chartDatafill: true,
    chartOptionsScales: {
      y: {
        suggestedMin: 0,
        suggestedMax: 10,
      },
    },
  },
  wind_speed: {
    dropdown: {
      label: 'Vitesses du vent',
      icon: 'windy-day',
    },
    chartTitle: {
      label: 'Vitesses du vent prévisionnelles',
      icon: 'windsock',
    },
    chartDataKind: 'line',
    chartDatafill: false,
    chartOptionsScales: {
      y: {
        suggestedMin: 0,
        suggestedMax: 90,
      },
    },
  },
};
export const MAP_STATES_TO_STRING = {
  clear: 'c',
  'clear-night': 'cn',
  cloudy: 'c',
  exceptional: 'e',
  fog: 'F',
  hail: 'h',
  lightning: 'l',
  'lightning-rainy': 'lr',
  partlycloudy: 'l',
  pouring: 'p',
  rainy: 'r',
  snowy: 's',
  'snowy-rainy': 'sr',
  sunny: 's',
  windy: 'w',
  'windy-variant': 'wv',
};
