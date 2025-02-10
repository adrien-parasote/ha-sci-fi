import {PACKAGE_NAME, VERSION} from './build/const.js';
import './cards/import.js';
import './components/import.js';

console.info(
  `%c🛸 ${PACKAGE_NAME.toUpperCase()} 🛸 - v${VERSION}`,
  'color: rgb(105, 211, 251); text-shadow: 0px 0px 5px rgb(102, 156, 210); background-color: black; font-weight: 700;'
);
