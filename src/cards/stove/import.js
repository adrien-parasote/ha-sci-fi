import {
  defineCustomCard,
  defineCustomElement,
} from '../../helpers/utils/import.js';
import {SciFiStove} from './card.js';
import {DESCRIPTION, NAME, PACKAGE} from './const.js';
import {SciFiStoveEditor} from './editor.js';

defineCustomElement(PACKAGE, SciFiStove);
defineCustomElement(PACKAGE + '-editor', SciFiStoveEditor);
defineCustomCard(PACKAGE, NAME, DESCRIPTION);
