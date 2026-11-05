// @vitest-environment happy-dom
import { expect, describe, it, afterEach } from 'vitest';

import '../../../src/cards/water/sci-fi-water-management.js';
import { setLocale } from '../../../src/locales/localization.js';
import { makeMockHass, makeMockFloor, makeMockArea, makeMockEntityEntry, makeMockEntity } from '../../fixtures/mock-hass.js';

describe('sci-fi-water-management', () => {
  afterEach(() => {
    document.body.replaceChildren();
  });

  describe('Automation History Logs (Spec 16)', () => {
    it('TC-WATER-HISTORY-U-006: filters alerts and success logs correctly', async () => {
      const el = document.createElement('sci-fi-water-management') as any;
      el.config = { type: 'custom:sci-fi-water-management', filter_label: 'water' };
      el.hass = makeMockHass({});
      
      // Inject mock raw logs
      el._rawLogs = [
        { entity_id: 'switch.valve_1', state: 'on', when: '2026-06-01T08:00:00Z', name: 'Valve 1' }, // Success
        { entity_id: 'sensor.leak_sensor', state: 'on', when: '2026-06-01T08:15:00Z', name: 'Leak Sensor', device_class: 'moisture' }, // Alert
        { entity_id: 'switch.valve_1', state: 'unavailable', when: '2026-06-01T08:20:00Z', name: 'Valve 1' } // Alert
      ];
      
      const ids = ['switch.valve_1', 'sensor.leak_sensor'];
      el._activeFilter = 'all';
      expect(el._visibleLogs(ids).length).to.equal(3);

      el._activeFilter = 'alerts';
      const alerts = el._visibleLogs(ids);
      expect(alerts.length).to.equal(2);
      expect(alerts[0].state).to.equal('unavailable');
    });

    it('TC-WATER-HISTORY-U-007: never fetches when expanded becomes true', async () => {
      const el = document.createElement('sci-fi-water-management') as any;
      el.config = { type: 'custom:sci-fi-water-management', filter_label: 'water' };
      el.hass = makeMockHass({});
      el.entityIds = ['switch.valve_1'];
      
      let fetchCount = 0;
      el._fetchHistoryLogs = () => { fetchCount++; };
      
      document.body.appendChild(el);
      el.expanded = false;
      await el.updateComplete;
      fetchCount = 0; // the mount itself is a floor load

      el.expanded = true;
      el.requestUpdate('expanded', false);
      await el.updateComplete;
      expect(fetchCount).to.equal(0);
    });

    // Helpers for the cases below. _renderHistoryLogs returns a Lit template,
    // so it must be rendered before anything can be asserted.
    const renderLogs = async (el: any, filterEntityIds: string[]) => {
      // The empty-state source is English; its French wording is the catalogue's.
      await setLocale('fr');
      const temp = document.createElement('div');
      const { render } = await import('lit');
      render(el._renderHistoryLogs(filterEntityIds), temp);
      return temp;
    };

    // State has to be set AFTER the first update cycle: connecting the card
    // kicks off _fetchHistoryLogs, whose settling sets _historyLogsLoading to
    // false — it would override whatever the test arranged.
    const mountCard = async () => {
      const el = document.createElement('sci-fi-water-management') as any;
      el.config = { type: 'custom:sci-fi-water-management', filter_label: 'water' };
      el.hass = makeMockHass({});
      document.body.appendChild(el);
      await el.updateComplete;
      return el;
    };

    const A_LOG = {
      entity_id: 'automation.watering',
      when: '2026-06-01T08:26:35Z',
      name: 'Arrosage',
      state: 'on',
    };

    it('TC-WATER-HISTORY-U-003: renders empty message if logs list is empty', async () => {
      const el = await mountCard();
      // _renderHistoryLogs filters _rawLogs — it never reads _historyLogs,
      // which only _applyFiltersAndLimit feeds. And the argument is mandatory:
      // called with none, `new Set(undefined)` is empty, every log is filtered
      // out and the empty state renders unconditionally, which is why this case
      // used to pass no matter what.
      el._rawLogs = [];
      el._historyLogsLoading = false;

      const temp = await renderLogs(el, ['automation.watering']);
      expect(temp.textContent).to.include('Aucun événement enregistré');
    });

    it('TC-WATER-HISTORY-U-008: renders the timeline, not the empty message, when logs match the filter', async () => {
      // The counterpart that makes the case above mean something: same call,
      // same filter, populated _rawLogs — the empty state must NOT appear.
      const el = await mountCard();
      el._rawLogs = [A_LOG];
      el._historyLogsLoading = false;

      const temp = await renderLogs(el, ['automation.watering']);
      expect(temp.textContent).to.not.include('Aucun événement enregistré');
      expect(temp.querySelector('.log-timeline')).to.not.be.null;
    });

    it('TC-WATER-HISTORY-U-003: filters out logs whose entity is not in filterEntityIds', async () => {
      // Proves the filter itself, which the argument-less call could never do.
      const el = await mountCard();
      el._rawLogs = [A_LOG];
      el._historyLogsLoading = false;

      const temp = await renderLogs(el, ['automation.other']);
      expect(temp.textContent).to.include('Aucun événement enregistré');
    });

    it('TC-WATER-HISTORY-U-004: renders loading state placeholder when loading is true', async () => {
      const el = await mountCard();
      // Logs that WOULD render a timeline, so the assertion shows the loading
      // branch winning over present data rather than over an empty list.
      el._rawLogs = [A_LOG];
      el._historyLogsLoading = true;

      const temp = await renderLogs(el, ['automation.watering']);
      expect(temp.querySelector('.log-scanner')).to.not.be.null;
      expect(temp.querySelector('.log-timeline')).to.be.null;
    });

    it('TC-WATER-HISTORY-U-005: formats timestamps correctly', () => {
      const el = document.createElement('sci-fi-water-management') as any;
      // The input is built in LOCAL time, so its own components ARE the
      // expected output whatever the runner's timezone — no TZ pinning, and no
      // re-derivation of the implementation's getDate/padStart chain, which is
      // what made this case green for any format the code might pick.
      const localInput = new Date(2026, 5, 1, 8, 26, 35);
      expect(el._formatTimestamp(localInput.toISOString())).to.equal('01/06 08:26');

      // The date is part of the contract: the card fetches a 7-day window, so
      // HH:MM alone would not say which day. See bead ha-sci-fi-o5p.
      expect(el._formatTimestamp(new Date(2026, 11, 25, 23, 5, 0).toISOString())).to.equal(
        '25/12 23:05',
      );
      // Unparseable input falls back, it never throws.
      expect(el._formatTimestamp('not-a-date')).to.equal('00/00 00:00');
    });


    it('IT-WATER-HISTORY-I-004: invokes hass.callWS with logbook/get_events and correct payload on primary failure', async () => {
      const el = document.createElement('sci-fi-water-management') as any;
      el.entityIds = ['switch.valve_1'];
      
      let wsPayload: any = null;
      el.hass = {
        callWS: (payload: any) => {
          if (payload.type === 'history/history_during_period') {
            return Promise.reject(new Error('History API failed'));
          }
          wsPayload = payload;
          return Promise.resolve([]);
        }
      };
      
      await el._fetchHistoryLogs();
      expect(wsPayload).to.not.be.null;
      expect(wsPayload.type).to.equal('logbook/get_events');
      expect(wsPayload.entity_ids).to.deep.equal(['switch.valve_1']);
    });

    it('IT-WATER-HISTORY-I-005: invokes hass.callWS with history/history_during_period as primary', async () => {
      const el = document.createElement('sci-fi-water-management') as any;
      el.entityIds = ['switch.valve_1'];
      
      let wsPayload: any = null;
      el.hass = {
        callWS: (payload: any) => {
          wsPayload = payload;
          return Promise.resolve({});
        }
      };
      
      await el._fetchHistoryLogs();
      expect(wsPayload).to.not.be.null;
      expect(wsPayload.type).to.equal('history/history_during_period');
      expect(wsPayload.entity_ids).to.deep.equal(['switch.valve_1']);
    });

    it('IT-WATER-HISTORY-I-006: triggers a new log fetch when entityIds change', async () => {
      const el = document.createElement('sci-fi-water-management') as any;
      el.config = { type: 'custom:sci-fi-water-management', filter_label: 'water' };
      el.hass = makeMockHass({});
      el.entityIds = ['switch.valve_1'];
      
      let fetchCount = 0;
      el._fetchHistoryLogs = () => { fetchCount++; };
      
      document.body.appendChild(el);
      await el.updateComplete;
      
      fetchCount = 0; // Reset count to focus strictly on update trigger
      
      el.entityIds = ['switch.valve_2'];
      el.requestUpdate('entityIds', ['switch.valve_1']);
      await el.updateComplete;
      expect(fetchCount).to.equal(1);
    });

    it('IT-WATER-HISTORY-I-007: triggers a new log fetch when _activeFloorId changes', async () => {
      const el = document.createElement('sci-fi-water-management') as any;
      el.config = { type: 'custom:sci-fi-water-management', filter_label: 'water' };
      el.hass = makeMockHass({});
      el._activeFloorId = 'floor_1';
      
      let fetchCount = 0;
      el._fetchHistoryLogs = () => { fetchCount++; };
      
      document.body.appendChild(el);
      await el.updateComplete;
      
      fetchCount = 0;
      
      el._activeFloorId = 'floor_2';
      el.requestUpdate('_activeFloorId', 'floor_1');
      await el.updateComplete;
      expect(fetchCount).to.equal(1);
    });

    it('IT-WATER-HISTORY-I-008: a fetch keeps the old logs while it runs', async () => {
      const el = document.createElement('sci-fi-water-management') as any;
      el.config = { type: 'custom:sci-fi-water-management', filter_label: 'water' };
      el.hass = makeMockHass({});
      el.entityIds = ['switch.valve_1'];
      el._rawLogs = [{ entity_id: 'switch.valve_1', state: 'on', when: '2026-06-01T08:00:00Z', name: 'Valve 1' }];
      
      const fetchPromise = el._fetchHistoryLogs();
      // Right after the synchronous invocation the previous rows are still there (water-offline FR-1)
      expect(el._rawLogs).to.deep.equal([{ entity_id: 'switch.valve_1', state: 'on', when: '2026-06-01T08:00:00Z', name: 'Valve 1' }]);
      
      await fetchPromise;
    });

    it('IT-WATER-HISTORY-I-009: filters entityIds to only include standalone (no-device) entities listed in the Automations accordion', async () => {

      const el = document.createElement('sci-fi-water-management') as any;
      el.config = { type: 'custom:sci-fi-water-management', filter_label: 'water' };
      el.hass = makeMockHass({
        floors: {
          'basement': makeMockFloor({ floor_id: 'basement', name: 'Basement', level: -1 }),
        },
        areas: {
          'utility': makeMockArea({ area_id: 'utility', name: 'Utility Room', floor_id: 'basement' }),
        },
        entities: {
          'automation.gestion_chauffe_eau': makeMockEntityEntry({ entity_id: 'automation.gestion_chauffe_eau', area_id: 'utility', labels: ['water'] }), // standalone
          'switch.pump': makeMockEntityEntry({ entity_id: 'switch.pump', area_id: 'utility', labels: ['water'], device_id: 'pump_device' }), // belongs to device
        },
        states: {
          'automation.gestion_chauffe_eau': makeMockEntity({ entity_id: 'automation.gestion_chauffe_eau', state: 'on' }),
          'switch.pump': makeMockEntity({ entity_id: 'switch.pump', state: 'off' }),
        }
      });
      
      el._activeFloorId = 'basement';
      // Trigger willUpdate manually
      el.willUpdate(new Map([['_activeFloorId', null]]));
      
      // Should contain all water entities present on the basement floor
      expect(el.entityIds).to.deep.equal(['automation.gestion_chauffe_eau', 'switch.pump']);
    });
  });
});
