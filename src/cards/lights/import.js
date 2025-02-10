import {
  defineCustomCard,
  defineCustomElement,
} from '../../helpers/utils/import.js';
import {SciFiLights} from './card.js';
import {DESCRIPTION, NAME, PACKAGE} from './const.js';
import {SciFiLightsEditor} from './editor.js';

defineCustomElement(PACKAGE, SciFiLights);
defineCustomElement(PACKAGE + '-editor', SciFiLightsEditor);
defineCustomCard(PACKAGE, NAME, DESCRIPTION);
