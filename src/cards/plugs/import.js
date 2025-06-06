import {
  defineCustomCard,
  defineCustomElement,
} from '../../helpers/utils/import.js';
import {SciFiPlugs} from './card.js';
import {DESCRIPTION, NAME, PACKAGE} from './const.js';
import {SciFiPlugsEditor} from './editor.js';

defineCustomElement(PACKAGE, SciFiPlugs);
defineCustomElement(PACKAGE + '-editor', SciFiPlugsEditor);
defineCustomCard(PACKAGE, NAME, DESCRIPTION);
