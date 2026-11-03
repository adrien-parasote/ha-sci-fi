// @vitest-environment happy-dom
import { expect, describe, it, afterEach } from 'vitest';

import '../../../src/cards/water/sci-fi-water-management.js';
import { setLocale } from '../../../src/locales/localization.js';
import { makeMockHass } from '../../fixtures/mock-hass.js';

describe('water log panel strings', () => {
  afterEach(async () => {
    document.body.replaceChildren();
    await setLocale('fr');
  });

  it('have English msg() sources and French catalogue wordings', async () => {
    const el = document.createElement('sci-fi-water-management') as any;
    el.config = { type: 'custom:sci-fi-water-management', filter_label: 'water' };
    el.hass = makeMockHass({});
    document.body.appendChild(el);
    await el.updateComplete;
    el._rawLogs = [];
    el._historyLogsLoading = false;

    const { render } = await import('lit');
    const draw = async (): Promise<string> => {
      const temp = document.createElement('div');
      render(el._renderHistoryLogs(['automation.watering']), temp);
      return temp.textContent ?? '';
    };

    await setLocale('en');
    const en = await draw();
    expect(en).toContain('No events recorded.');
    expect(en).not.toContain('Aucun événement');

    await setLocale('fr');
    expect(await draw()).toContain('Aucun événement enregistré.');
  });
});
