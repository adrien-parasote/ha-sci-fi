import {
  defineCustomCard,
  defineCustomElement,
} from '../../helpers/utils/import.js';
import {SciFiClimates} from './card.js';
import {DESCRIPTION, NAME, PACKAGE} from './const.js';
import {SciFiClimatesEditor} from './editor.js';

defineCustomElement(PACKAGE, SciFiClimates);
defineCustomElement(PACKAGE + '-editor', SciFiClimatesEditor);
defineCustomCard(PACKAGE, NAME, DESCRIPTION);
