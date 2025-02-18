import {
  defineCustomCard,
  defineCustomElement,
} from '../../helpers/utils/import.js';
import {SciFiWeather} from './card.js';
import {DESCRIPTION, NAME, PACKAGE} from './const.js';
import {SciFiWeatherEditor} from './editor.js';

defineCustomElement(PACKAGE, SciFiWeather);
defineCustomElement(PACKAGE + '-editor', SciFiWeatherEditor);
defineCustomCard(PACKAGE, NAME, DESCRIPTION);
