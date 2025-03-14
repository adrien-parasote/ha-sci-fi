import {
  defineCustomCard,
  defineCustomElement,
} from '../../helpers/utils/import.js';
import {SciFiVehicles} from './card.js';
import {DESCRIPTION, NAME, PACKAGE} from './const.js';
import {SciFiVehiclesEditor} from './editor.js';

defineCustomElement(PACKAGE, SciFiVehicles);
defineCustomElement(PACKAGE + '-editor', SciFiVehiclesEditor);
defineCustomCard(PACKAGE, NAME, DESCRIPTION);
