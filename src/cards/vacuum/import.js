import {
  defineCustomCard,
  defineCustomElement,
} from '../../helpers/utils/import.js';
import {SciFiVacuum} from './card.js';
import {DESCRIPTION, NAME, PACKAGE} from './const.js';
import {SciFiVacuumEditor} from './editor.js';

defineCustomElement(PACKAGE, SciFiVacuum);
defineCustomElement(PACKAGE + '-editor', SciFiVacuumEditor);
defineCustomCard(PACKAGE, NAME, DESCRIPTION);
