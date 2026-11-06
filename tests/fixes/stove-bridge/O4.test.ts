/** Fix lot stove-bridge, O4 (bead ha-sci-fi-jex): workbench stove fixtures use the core fumis integration. */
import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import { MOCK_STATES } from '../../../dev/modules/mock-data.js';
import stoveCard from '../../../dev/cards/stove.js';

const CORE_STATES = ['off', 'pre_heating', 'ignition', 'pre_combustion', 'combustion', 'eco', 'cooling',
  'cold_start', 'cold_start_off', 'hybrid_init', 'hybrid_start', 'wood_start', 'wood_combustion', 'wood_burning_off'];

describe('O4', () => {
  it('test_O4_workbench_stove_fixtures_use_core_fumis_entities', () => {
    const states = MOCK_STATES as Record<string, { state: string }>;
    const cfg = (stoveCard as any).config;
    const status: string = cfg.sensors.sensor_status;
    // HA localizes core entity ids: `_detailed_stove_status` in English, `_etat_detaille_du_poele` in French.
    expect(status).toMatch(/^sensor\..*(_detailed_stove_status|_etat_detaille_du_poele)$/);
    expect(CORE_STATES).toContain(states[status]?.state);
    expect(states[cfg.switch_eco_mode]?.state).toBeDefined();
    expect(cfg.switch_eco_mode).toMatch(/^switch\..*(_eco_mode|_mode_eco)$/);
    for (const f of ['dev/modules/mock-data.js', 'dev/cards/stove.js', 'dev/cards/bridge.js']) {
      expect(fs.readFileSync(f, 'utf8')).not.toContain('binary_sensor.clou_stove_status');
    }
  });
});
