// @vitest-environment happy-dom
// The converted strings follow the locale (spec i18n-hardcoded-fr FR-2..FR-8, FR-11).
import { describe, it, expect, afterEach, vi } from 'vitest';
import { render } from 'lit';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import '../../src/cards/lights/sci-fi-lights.js';
import '../../src/cards/climates/sci-fi-climates.js';
import '../../src/cards/hexa-tiles/sci-fi-hexa-tiles.js';
import '../../src/cards/weather/sci-fi-weather.js';
import '../../src/cards/tv/sci-fi-tv-editor.js';
import '../../src/components/editor-inputs/sf-editor-action.js';
import '../../src/components/editor-inputs/sf-editor-source-list.js';
import { SciFiLightsCard } from '../../src/cards/lights/sci-fi-lights.js';
import { SciFiClimatesCard } from '../../src/cards/climates/sci-fi-climates.js';
import { SciFiHexaTilesCard } from '../../src/cards/hexa-tiles/sci-fi-hexa-tiles.js';
import { SciFiWeatherCard } from '../../src/cards/weather/sci-fi-weather.js';
import { SciFiVehiclesCard } from '../../src/cards/vehicles/sci-fi-vehicles.js';
import { SciFiTVEditor } from '../../src/cards/tv/sci-fi-tv-editor.js';
import { SfEditorAction } from '../../src/components/editor-inputs/sf-editor-action.js';
import { SfEditorSourceList } from '../../src/components/editor-inputs/sf-editor-source-list.js';
import { tvLabels, tvButtonLabel } from '../../src/cards/tv/labels.js';
import { setLocale } from '../../src/locales/localization.js';
import { makeMockHass, makeMockEntity } from '../fixtures/mock-hass.js';

const settle = () => new Promise((r) => setTimeout(r, 10));
const ROOT = `${resolve(__dirname, '../..')}/`;

afterEach(async () => {
  document.body.replaceChildren();
  await setLocale('fr'); // the mock hass default; never leave the suite moved
});

if (!customElements.get('sf-toast')) {
  customElements.define('sf-toast', class extends HTMLElement { addMessage() {} });
}

type Lang = 'en' | 'fr';
const LANGS: Lang[] = ['en', 'fr'];

/** Collects what reaches sf-toast. */
function captureToasts(el: HTMLElement): Array<{ text: string; error: boolean }> {
  const messages: Array<{ text: string; error: boolean }> = [];
  const toast = el.shadowRoot!.querySelector('sf-toast') as any;
  toast.addMessage = (text: string, error: boolean) => { messages.push({ text, error }); };
  return messages;
}

describe('lights card (FR-2)', () => {
  async function mount(lang: Lang, hassOverrides: Record<string, unknown> = {}, config: Record<string, unknown> = {}) {
    await setLocale(lang);
    const el = document.createElement('sci-fi-lights') as SciFiLightsCard;
    (el as any).setConfig({ type: 'custom:sci-fi-lights', ...config });
    el.hass = makeMockHass({ language: lang, callService: vi.fn().mockResolvedValue({}), ...hassOverrides });
    document.body.appendChild(el);
    await el.updateComplete;
    return el;
  }
  const text = (el: HTMLElement) => el.shadowRoot!.textContent!.replace(/\s+/g, ' ');
  const titles = (el: HTMLElement) => [...el.shadowRoot!.querySelectorAll('button.power-btn')].map((b) => b.getAttribute('title'));

  const EXPECTED = {
    en: {
      noFloor: 'No floor configured', header: 'Lights', allOn: 'Turn all on', allOff: 'Turn all off',
      floorOn: 'Turn this floor on', floorOff: 'Turn this floor off', roomOn: 'Turn the room on', roomOff: 'Turn the room off',
      lightOff: 'Light turned off', lightOn: 'Light turned on', roomT: ['Room turned off', 'Room turned on'],
      floorT: ['Floor turned off', 'Floor turned on'], allT: ['All turned off', 'All turned on'],
      noLights: 'No lights',
    },
    fr: {
      noFloor: 'Aucun étage configuré', header: 'Lumières', allOn: 'Tout allumer', allOff: 'Tout éteindre',
      floorOn: 'Allumer cet étage', floorOff: 'Éteindre cet étage', roomOn: 'Allumer la pièce', roomOff: 'Éteindre la pièce',
      lightOff: 'Lumière éteinte', lightOn: 'Lumière allumée', roomT: ['Pièce éteinte', 'Pièce allumée'],
      floorT: ['Étage éteint', 'Étage allumé'], allT: ['Tout éteint', 'Tout allumé'],
      noLights: 'Aucune lumière',
    },
  } as const;

  it.each(LANGS)('TC-I18N-U-04 empty states, header, titles and eight toasts in %s', async (lang) => {
    const x = EXPECTED[lang];
    expect(text(await mount(lang, { floors: {} }))).toContain(x.noFloor);
    document.body.replaceChildren();

    const el = await mount(lang);
    expect(text(el)).toContain(x.header);
    // house has one light on (living room): the header button turns all off, floor and room likewise
    const t = titles(el);
    expect(t).toContain(x.allOff);
    expect(t).toContain(x.floorOff);
    expect(t).toContain(x.roomOff);
    const toasts = captureToasts(el);
    const btns = [...el.shadowRoot!.querySelectorAll('button')] as HTMLButtonElement[];
    const byTitle = (title: string) => btns.find((b) => b.getAttribute('title') === title)!;
    byTitle(x.allOff).click(); await settle();
    byTitle(x.floorOff).click(); await settle();
    byTitle(x.roomOff).click(); await settle();
    (el.shadowRoot!.querySelector('.light-btn') as HTMLButtonElement).click(); await settle();
    expect(toasts.map((m) => m.text)).toEqual([x.allT[0], x.floorT[0], x.roomT[0], x.lightOff]);
  });

  it.each(LANGS)('TC-I18N-U-04 the "on" side of every pair, and the room empty states, in %s', async (lang) => {
    const x = EXPECTED[lang];
    const el = await mount(lang, {
      states: {
        'light.salon': makeMockEntity({ entity_id: 'light.salon', state: 'off' }),
        'light.cuisine': makeMockEntity({ entity_id: 'light.cuisine', state: 'off' }),
      },
    });
    const t = titles(el);
    expect(t).toEqual([x.allOn, x.floorOn, x.roomOn]);
    const toasts = captureToasts(el);
    const btns = [...el.shadowRoot!.querySelectorAll('button')] as HTMLButtonElement[];
    for (const title of [x.allOn, x.floorOn, x.roomOn]) { btns.find((b) => b.getAttribute('title') === title)!.click(); await settle(); }
    (el.shadowRoot!.querySelector('.light-btn') as HTMLButtonElement).click(); await settle();
    expect(toasts.map((m) => m.text)).toEqual([x.allT[1], x.floorT[1], x.roomT[1], x.lightOn]);
  });

  it.each(LANGS)('TC-I18N-U-04 "no lights" and "select a room" empty states in %s', async (lang) => {
    const noLightsFloor = await mount(lang, { entities: {}, states: {} });
    expect(text(noLightsFloor)).toContain(lang === 'en' ? 'No lights configured for this floor' : 'Aucune lumière configurée pour cet étage');
    document.body.replaceChildren();

    const el = await mount(lang);
    const panel = (areaId: string | null) => {
      (el as any)._activeAreaId = areaId;
      const host = document.createElement('div');
      render((el as any)._renderAreaContent([]), host);
      return host.textContent!;
    };
    expect(panel(null)).toContain(lang === 'en' ? 'Select a room' : 'Sélectionnez une pièce');
    expect(panel('living_room')).toContain(EXPECTED[lang].noLights);
  });

  it('TC-I18N-U-04 header_message still wins over the default', async () => {
    const el = await mount('en', {}, { header_message: 'House Lights' });
    expect(el.shadowRoot!.querySelector('.header-text')!.textContent).toBe('House Lights');
  });

  it('IT-I18N-I-01 French then English hass, same element, no re-mount', async () => {
    const el = await mount('fr', { floors: {} });
    expect(text(el)).toContain('Aucun étage configuré');
    el.hass = makeMockHass({ language: 'en', floors: {} });
    await el.updateComplete; await settle(); await el.updateComplete;
    expect(text(el)).toContain('No floor configured');
    expect(document.querySelectorAll('sci-fi-lights')).toHaveLength(1);

    const el2 = await mount('fr');
    expect(el2.shadowRoot!.querySelector('.header-text')!.textContent).toBe('Lumières');
    el2.hass = makeMockHass({ language: 'en' });
    await el2.updateComplete; await settle(); await el2.updateComplete;
    expect(el2.shadowRoot!.querySelector('.header-text')!.textContent).toBe('Lights');
  });
});

describe('climates card toasts (FR-3)', () => {
  it.each([
    ['en', ['Mode applied', 'Temperature changed', 'HVAC mode changed', 'Preset changed']],
    ['fr', ['Mode appliqué', 'Température modifiée', 'Mode HVAC modifié', 'Preset modifié']],
  ] as Array<[Lang, string[]]>)('TC-I18N-U-05 four toasts in %s', async (lang, expected) => {
    await setLocale(lang);
    const el = document.createElement('sci-fi-climates') as SciFiClimatesCard;
    (el as any).setConfig({ type: 'custom:sci-fi-climates' });
    el.hass = makeMockHass({ language: lang, callService: vi.fn().mockResolvedValue({}) });
    document.body.appendChild(el);
    await el.updateComplete;
    const toasts = captureToasts(el);
    const e = (detail: Record<string, unknown>) => ({ detail: { id: 'climate.salon', ...detail } });
    (el as any).__globalOnOffClimates([{ entity_id: 'climate.salon' }], true);
    (el as any)._changeTemperature(e({ temperature: 20 })); await settle();
    (el as any)._changeHvacMode(e({ mode: 'heat' })); await settle();
    (el as any)._changePresetMode(e({ mode: 'eco' })); await settle();
    expect(toasts.map((m) => m.text)).toEqual(expected);
  });
});

describe('hexa-tiles card (FR-4)', () => {
  const TEXT = {
    en: { header: 'Hey, Welcome Back!', banner: '⚠️ Weather alert: canicule', weather: 'Weather' },
    fr: { header: 'Hey, bon retour !', banner: '⚠️ Alerte météo : canicule', weather: 'Météo' },
  } as const;

  async function mount(lang: Lang, config: Record<string, unknown> = {}) {
    await setLocale(lang);
    const el = document.createElement('sci-fi-hexa-tiles') as SciFiHexaTilesCard;
    el.setConfig({
      type: 'custom:sci-fi-hexa-tiles',
      weather: { activate: true, weather_entity: 'weather.home', weather_alert_entity: 'sensor.alert',
        state_green: 'Vert', state_yellow: 'Jaune', state_orange: 'Orange', state_red: 'Rouge' },
      ...config,
    } as any);
    el.hass = makeMockHass({
      language: lang,
      states: {
        'weather.home': makeMockEntity({ entity_id: 'weather.home', state: 'cloudy', attributes: {} }),
        'sensor.alert': makeMockEntity({ entity_id: 'sensor.alert', state: 'Jaune', attributes: { canicule: 'Jaune', vent: 'Vert' } }),
      },
    });
    document.body.appendChild(el);
    await el.updateComplete;
    return el;
  }
  const banner = (el: HTMLElement) => el.shadowRoot!.querySelector('.weather-alert')!.textContent!.replace(/\s+/g, ' ').trim();

  it.each(LANGS)('TC-I18N-U-06 header, banner and weather tile name in %s', async (lang) => {
    const el = await mount(lang);
    expect(el.shadowRoot!.querySelector('.header-message')!.textContent).toBe(TEXT[lang].header);
    expect(banner(el)).toBe(TEXT[lang].banner);
    expect(el.shadowRoot!.querySelector('.weather-tile')!.getAttribute('aria-label')).toBe(TEXT[lang].weather);
  });

  it('TC-I18N-U-06 header_message still wins over the default', async () => {
    const el = await mount('en', { header_message: 'Custom' });
    expect(el.shadowRoot!.querySelector('.header-message')!.textContent).toBe('Custom');
  });

  it('IT-I18N-I-03 banner switches from French to English on the same element', async () => {
    const el = await mount('fr');
    expect(banner(el)).toBe('⚠️ Alerte météo : canicule');
    el.hass = makeMockHass({
      language: 'en',
      states: {
        'weather.home': makeMockEntity({ entity_id: 'weather.home', state: 'cloudy', attributes: {} }),
        'sensor.alert': makeMockEntity({ entity_id: 'sensor.alert', state: 'Jaune', attributes: { canicule: 'Jaune', vent: 'Vert' } }),
      },
    });
    await el.updateComplete; await settle(); await el.updateComplete;
    expect(banner(el)).toBe('⚠️ Weather alert: canicule');
  });
});

describe('weather card (FR-5)', () => {
  it.each([['en', 'Weather entity not found'], ['fr', 'Entité météo non trouvée']] as Array<[Lang, string]>)(
    'TC-I18N-U-07 missing entity message in %s', async (lang, expected) => {
      await setLocale(lang);
      const el = document.createElement('sci-fi-weather') as SciFiWeatherCard;
      (el as any).setConfig({ type: 'custom:sci-fi-weather', weather_entity: 'weather.absent', alert: { entity_id: 'sensor.alert' } });
      el.hass = makeMockHass({
        language: lang,
        states: { 'sensor.alert': makeMockEntity({ entity_id: 'sensor.alert', state: 'Vert', attributes: {} }) },
      });
      document.body.appendChild(el);
      await el.updateComplete;
      expect(el.shadowRoot!.textContent).toContain(expected);
    });
});

describe('vehicles stub config (FR-8)', () => {
  it.each([['en', 'My vehicle'], ['fr', 'Mon véhicule']] as Array<[Lang, string]>)(
    'TC-I18N-U-10 stub vehicle name in %s', async (lang, expected) => {
      await setLocale(lang);
      expect(SciFiVehiclesCard.getStubConfig().vehicles?.[0]?.name).toBe(expected);
    });
});

describe('tv editor labels (FR-6)', () => {
  const EXPECTED = {
    en: { volume: 'Volume entity', app: 'Application entity', optional: '(optional)', custom: 'Custom actions', button: 'Button home' },
    fr: { volume: 'Entité Volume', app: 'Entité Application', optional: '(optionnel)', custom: 'Actions personnalisées', button: 'Bouton home' },
  } as const;

  it.each(LANGS)('TC-I18N-U-08 dictionary and tvButtonLabel in %s', async (lang) => {
    await setLocale(lang);
    const x = EXPECTED[lang];
    expect(tvLabels()['input-volume-entity']).toBe(x.volume);
    expect(tvLabels()['input-app-entity']).toBe(x.app);
    expect(tvButtonLabel('home')).toBe(x.button);
  });

  async function mountEditor(lang: Lang) {
    await setLocale(lang);
    const el = document.createElement('sci-fi-tv-editor') as SciFiTVEditor;
    document.body.appendChild(el);
    el.setConfig({
      type: 'custom:sci-fi-tv', entity: 'media_player.tv', sources: [{ name: 'HDMI', action: 'call-service' }],
      custom_actions: { home: { action: 'call-service', service: 'x.y' } },
    } as any);
    el.hass = makeMockHass({ language: lang });
    await el.updateComplete;
    return el;
  }
  const labelsOf = (el: SciFiTVEditor) => ({
    volume: (el.shadowRoot!.querySelector('[element-id="volume_entity"]') as any).label as string,
    app: (el.shadowRoot!.querySelector('[element-id="app_entity"]') as any).label as string,
    custom: (el.shadowRoot!.querySelector('sf-editor-accordion[element-id="custom_actions"]') as any).title as string,
    home: (el.shadowRoot!.querySelector('sf-editor-action[element-id="home"]') as any).label as string,
  });

  it.each(LANGS)('TC-I18N-U-08 rendered editor labels in %s', async (lang) => {
    const x = EXPECTED[lang];
    const l = labelsOf(await mountEditor(lang));
    expect(l).toEqual({
      volume: `${x.volume} ${x.optional}`, app: `${x.app} ${x.optional}`, custom: x.custom, home: x.button,
    });
  });

  it('TC-I18N-U-08 the editor source holds neither dead fallback', () => {
    const src = readFileSync(`${ROOT}src/cards/tv/sci-fi-tv-editor.ts`, 'utf8');
    expect(src).not.toContain("?? 'Sources'");
    expect(src).not.toContain("?? 'Configuration TV'");
  });

  it('IT-I18N-I-02 editor and child component labels switch language, no element re-created', async () => {
    const el = await mountEditor('fr');
    const homeAction = el.shadowRoot!.querySelector('sf-editor-action[element-id="home"]') as SfEditorAction;
    const sourceList = el.shadowRoot!.querySelector('sf-editor-source-list') as SfEditorSourceList;
    await homeAction.updateComplete; await sourceList.updateComplete;
    const childLabels = (a: SfEditorAction, s: SfEditorSourceList) => [
      ...a.shadowRoot!.querySelectorAll('sf-editor-input'),
      ...s.shadowRoot!.querySelectorAll('sf-editor-input'),
      s.shadowRoot!.querySelector('.delete-btn')!,
    ].map((n) => n.getAttribute('label') ?? n.getAttribute('title'));
    expect(childLabels(homeAction, sourceList)).toContain('Nom de la source');
    expect(labelsOf(el).volume).toBe('Entité Volume (optionnel)');

    await setLocale('en');
    await el.updateComplete; await homeAction.updateComplete; await sourceList.updateComplete;
    expect(labelsOf(el).volume).toBe('Volume entity (optional)');
    expect(childLabels(homeAction, sourceList)).toContain('Source name');
    expect(el.shadowRoot!.querySelector('sf-editor-action[element-id="home"]')).toBe(homeAction);
    expect(el.shadowRoot!.querySelector('sf-editor-source-list')).toBe(sourceList);
  });
});

describe('shared editor components (FR-7)', () => {
  const ACTION = {
    en: ['Action type (e.g. call-service, navigate, none)', 'Service (e.g. media_player.play_media)', 'Entity ID (data.entity_id)', 'Navigation path'],
    fr: ["Type d'action (ex: call-service, navigate, none)", 'Service (ex: media_player.play_media)', "ID d'entité (data.entity_id)", 'Chemin de navigation'],
  } as const;
  const LIST = {
    en: { name: 'Source name', remove: 'Remove source', action: 'Action', add: 'Add source' },
    fr: { name: 'Nom de la source', remove: 'Supprimer la source', action: 'Action', add: 'Ajouter une source' },
  } as const;

  const labelsIn = (el: HTMLElement) => [...el.shadowRoot!.querySelectorAll('sf-editor-input')].map((n) => n.getAttribute('label'));

  async function mountAction(value: unknown) {
    const el = document.createElement('sf-editor-action') as SfEditorAction;
    el.value = value;
    document.body.appendChild(el);
    await el.updateComplete;
    return el;
  }
  async function mountList(values: unknown[]) {
    const el = document.createElement('sf-editor-source-list') as SfEditorSourceList;
    el.values = values;
    document.body.appendChild(el);
    await el.updateComplete;
    return el;
  }

  it.each(LANGS)('TC-I18N-U-09 sf-editor-action fallback labels in %s', async (lang) => {
    await setLocale(lang);
    const x = ACTION[lang];
    expect(labelsIn(await mountAction({ action: 'call-service' }))).toEqual([x[0], x[1], x[2]]);
    expect(labelsIn(await mountAction({ action: 'navigate' }))).toEqual([x[0], x[3]]);
  });

  it.each(LANGS)('TC-I18N-U-09 sf-editor-source-list labels in %s', async (lang) => {
    await setLocale(lang);
    const x = LIST[lang];
    const el = await mountList([{ name: 'A', action: 'none' }]);
    expect(labelsIn(el)).toEqual([x.name]);
    expect(el.shadowRoot!.querySelector('.delete-btn')!.getAttribute('title')).toBe(x.remove);
    expect(el.shadowRoot!.querySelector('sf-editor-action')!.getAttribute('label')).toBe(x.action);
    expect(el.shadowRoot!.querySelector('.add-btn')!.textContent!.trim()).toBe(x.add);
    document.body.replaceChildren();
    const empty = await mountList([]);
    expect(empty.shadowRoot!.querySelector('.add-btn')!.textContent!.trim()).toBe(x.add);
  });

  it('TC-I18N-U-09 labels follow setLocale with no new property', async () => {
    await setLocale('fr');
    const a = await mountAction({ action: 'navigate' });
    const l = await mountList([{ name: 'A', action: 'none' }]);
    expect(labelsIn(a)[1]).toBe('Chemin de navigation');
    expect(l.shadowRoot!.querySelector('.add-btn')!.textContent!.trim()).toBe('Ajouter une source');
    await setLocale('en');
    await a.updateComplete; await l.updateComplete;
    expect(labelsIn(a)[1]).toBe('Navigation path');
    expect(l.shadowRoot!.querySelector('.add-btn')!.textContent!.trim()).toBe('Add source');
  });
});

describe('makeMockHass language override (FR-11)', () => {
  it('TC-I18N-U-12 defaults to fr and takes the override, nothing else differs', () => {
    const base = makeMockHass();
    const en = makeMockHass({ language: 'en' });
    expect(base.locale.language).toBe('fr');
    expect(en.locale.language).toBe('en');
    expect(Object.keys(en)).toEqual(Object.keys(base));
    expect(en.locale).toEqual({ ...base.locale, language: 'en' });
    expect(en.states).toEqual(base.states);
    expect(en.floors).toEqual(base.floors);
    expect(en.areas).toEqual(base.areas);
  });
});
