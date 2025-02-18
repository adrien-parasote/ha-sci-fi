import {
  defineCustomCard,
  defineCustomElement,
} from '../../helpers/utils/import.js';
import {SciFiHexaTiles} from './card.js';
import {DESCRIPTION, NAME, PACKAGE} from './const.js';
import {SciFiHexaTilesEditor} from './editor.js';

defineCustomElement(PACKAGE, SciFiHexaTiles);
defineCustomElement(PACKAGE + '-editor', SciFiHexaTilesEditor);
defineCustomCard(PACKAGE, NAME, DESCRIPTION);
