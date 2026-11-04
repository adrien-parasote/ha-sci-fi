// @vitest-environment happy-dom
/** Fix lot ui, O5 (bead ha-sci-fi-rskp.5 / ha-sci-fi-ecr): custom_actions.info leaves the contract; a dashboard carrying it still loads. */
import { describe, it, expect, afterEach } from 'vitest';
import { readFileSync } from 'node:fs';
import '../../../src/cards/tv/sci-fi-tv.js';
import type { SciFiTVCard } from '../../../src/cards/tv/sci-fi-tv.js';
import { makeMockHass, makeMockEntity } from '../../fixtures/mock-hass.js';

const ROOT = `${process.cwd()}/`;
const TV = 'media_player.bravia';

afterEach(() => { document.body.replaceChildren(); });

describe('O5', () => {
  it('test_O5_info_is_not_in_the_tv_contract_and_old_yaml_still_loads', async () => {
    const config = readFileSync(`${ROOT}src/cards/tv/config.ts`, 'utf8');
    const actions = /interface SciFiTVCustomActions \{([^}]*)\}/.exec(config);
    expect(actions).not.toBeNull();
    expect(actions![1]).not.toMatch(/\binfo\?/);

    const el = document.createElement('sci-fi-tv') as SciFiTVCard;
    expect(() => (el as any).setConfig({
      type: 'custom:sci-fi-tv',
      entity: TV,
      custom_actions: { info: { action: 'none' } },
    })).not.toThrow();
    el.hass = makeMockHass({ states: { [TV]: makeMockEntity({ entity_id: TV, state: 'on' }) } } as any);
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.dial-svg')).not.toBeNull();
  });
});
