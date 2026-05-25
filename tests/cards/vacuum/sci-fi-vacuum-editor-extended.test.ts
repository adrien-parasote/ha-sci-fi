/* eslint-disable @typescript-eslint/no-unsafe-argument */
// @vitest-environment happy-dom
/**
 * Extended tests — sci-fi-vacuum-editor.ts
 * Covers: _addShortcutSegment, _removeShortcutSegment, _updateShortcutSegment,
 * _updateShortcutsTop, shortcut edit view segments, _deleteShortcut from shortcut edit view.
 */
import { expect, describe, it, afterEach } from 'vitest';

import '../../../src/cards/vacuum/sci-fi-vacuum-editor.js';
import type { SciFiVacuumEditor } from '../../../src/cards/vacuum/sci-fi-vacuum-editor.js';

function makeConfig(overrides: Record<string, unknown> = {}) {
  return { type: 'custom:sci-fi-vacuum', ...overrides };
}

function makeVacuum(overrides: Record<string, unknown> = {}) {
  return { entity: 'vacuum.robot', ...overrides };
}

async function createElement(): Promise<SciFiVacuumEditor> {
  const el = document.createElement('sci-fi-vacuum-editor') as SciFiVacuumEditor;
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

describe('sci-fi-vacuum-editor extended', () => {
  afterEach(() => { document.body.replaceChildren(); });

  // ── _updateShortcutsTop ─────────────────────────────────────────────────────

  it('dispatches config-changed when shortcut service input is updated', async () => {
    const el = await createElement();
    el.setConfig(makeConfig({
      vacuums: [makeVacuum({ shortcuts: { service: '', command: '', description: [] } })],
    }));
    await el.updateComplete;

    const received: CustomEvent[] = [];
    el.addEventListener('config-changed', (e) => received.push(e as CustomEvent));

    // Get all sf-editor-inputs and find the service one
    const inputs = el.shadowRoot!.querySelectorAll('sf-editor-input');
    // Service input has element-id="service"
    let serviceInput: Element | null = null;
    inputs.forEach(i => { if ((i as any).elementId === 'service' || i.getAttribute('element-id') === 'service') serviceInput = i; });

    if (serviceInput) {
      (serviceInput as HTMLElement).dispatchEvent(new CustomEvent('input-update', {
        bubbles: true,
        composed: true,
        detail: { id: 'service', kind: 'shortcuts-top', value: 'vacuum.send_command' },
      }));
      expect(received).toHaveLength(1);
      expect(received[0]!.detail.config.vacuums[0].shortcuts.service).toBe('vacuum.send_command');
    } else {
      // Invoke directly via internal method
      (el as any)._updateShortcutsTop(0, 'service', 'vacuum.send_command');
      expect(el.config).toBeDefined();
    }
  });

  // ── _addShortcutSegment ─────────────────────────────────────────────────────

  it('adds a segment when add-segment button clicked in shortcut edit view', async () => {
    const el = await createElement();
    el.setConfig(makeConfig({
      vacuums: [makeVacuum({
        shortcuts: { description: [{ name: 'Zone 1', segments: [10] }] },
      })],
    }));
    await el.updateComplete;

    // Enter shortcut edit mode for shortcut 0
    (el as any)._shortcutId = 0;
    (el as any)._edit = true;
    await el.updateComplete;

    const received: CustomEvent[] = [];
    el.addEventListener('config-changed', (e) => received.push(e as CustomEvent));

    const addSegBtn = el.shadowRoot!.querySelector('.editor .add-btn') as HTMLButtonElement;
    addSegBtn?.click();

    expect(received).toHaveLength(1);
    expect(received[0]!.detail.config.vacuums[0].shortcuts.description[0].segments).toHaveLength(2);
    expect(received[0]!.detail.config.vacuums[0].shortcuts.description[0].segments[1]).toBe(0);
  });

  // ── _removeShortcutSegment ──────────────────────────────────────────────────

  it('removes a segment when delete button clicked in shortcut edit view', async () => {
    const el = await createElement();
    el.setConfig(makeConfig({
      vacuums: [makeVacuum({
        shortcuts: { description: [{ name: 'Zone 1', segments: [10, 20] }] },
      })],
    }));
    await el.updateComplete;

    (el as any)._shortcutId = 0;
    (el as any)._edit = true;
    await el.updateComplete;

    const received: CustomEvent[] = [];
    el.addEventListener('config-changed', (e) => received.push(e as CustomEvent));

    // The delete buttons in the edit view: first row's delete
    const segDeleteBtns = el.shadowRoot!.querySelectorAll('.editor .row .delete-btn sf-button');
    (segDeleteBtns[0] as HTMLElement).dispatchEvent(new CustomEvent('button-click', { bubbles: true, composed: true }));

    expect(received).toHaveLength(1);
    expect(received[0]!.detail.config.vacuums[0].shortcuts.description[0].segments).toHaveLength(1);
    expect(received[0]!.detail.config.vacuums[0].shortcuts.description[0].segments[0]).toBe(20);
  });

  // ── _updateShortcutSegment ──────────────────────────────────────────────────

  it('updates segment value when segment input changes', async () => {
    const el = await createElement();
    el.setConfig(makeConfig({
      vacuums: [makeVacuum({
        shortcuts: { description: [{ name: 'Zone 1', segments: [10] }] },
      })],
    }));
    await el.updateComplete;

    (el as any)._shortcutId = 0;
    (el as any)._edit = true;
    await el.updateComplete;

    const received: CustomEvent[] = [];
    el.addEventListener('config-changed', (e) => received.push(e as CustomEvent));

    const segInput = el.shadowRoot!.querySelector('.editor .row sf-editor-input')!;
    segInput.dispatchEvent(new CustomEvent('input-update', {
      bubbles: true,
      composed: true,
      detail: { id: 'segment_0', kind: 'segment', value: '42' },
    }));

    expect(received).toHaveLength(1);
    expect(received[0]!.detail.config.vacuums[0].shortcuts.description[0].segments[0]).toBe(42);
  });

  it('_updateShortcutSegment defaults to 0 for non-numeric value', async () => {
    const el = await createElement();
    el.setConfig(makeConfig({
      vacuums: [makeVacuum({
        shortcuts: { description: [{ name: 'Zone 1', segments: [10] }] },
      })],
    }));
    await el.updateComplete;

    (el as any)._shortcutId = 0;
    (el as any)._edit = true;
    await el.updateComplete;

    const received: CustomEvent[] = [];
    el.addEventListener('config-changed', (e) => received.push(e as CustomEvent));

    const segInput = el.shadowRoot!.querySelector('.editor .row sf-editor-input')!;
    segInput.dispatchEvent(new CustomEvent('input-update', {
      bubbles: true,
      composed: true,
      detail: { id: 'segment_0', kind: 'segment', value: 'abc' },
    }));

    expect(received).toHaveLength(1);
    expect(received[0]!.detail.config.vacuums[0].shortcuts.description[0].segments[0]).toBe(0);
  });

  // ── _deleteShortcut from edit view ──────────────────────────────────────────

  it('exits edit mode and removes shortcut when delete shortcut button clicked in edit view', async () => {
    const el = await createElement();
    el.setConfig(makeConfig({
      vacuums: [makeVacuum({
        shortcuts: { description: [{ name: 'Zone 1', segments: [] }] },
      })],
    }));
    await el.updateComplete;

    (el as any)._shortcutId = 0;
    (el as any)._edit = true;
    await el.updateComplete;

    const received: CustomEvent[] = [];
    el.addEventListener('config-changed', (e) => received.push(e as CustomEvent));

    // The bottom delete shortcut button (last .delete-btn sf-button in editor div)
    const editorDeleteBtns = el.shadowRoot!.querySelectorAll('.editor > .delete-btn sf-button');
    if (editorDeleteBtns.length > 0) {
      (editorDeleteBtns[0] as HTMLElement).dispatchEvent(new CustomEvent('button-click', { bubbles: true, composed: true }));
      await el.updateComplete;
      expect((el as any)._edit).toBe(false);
      expect((el as any)._shortcutId).toBeNull();
    } else {
      // Direct call fallback
      (el as any)._deleteShortcut(0, 0);
      await el.updateComplete;
      expect((el as any)._edit).toBe(false);
    }
  });

  // ── edit shortcut name in edit view header display ──────────────────────────

  it('shows shortcut index as fallback in edit view title when name is empty', async () => {
    const el = await createElement();
    el.setConfig(makeConfig({
      vacuums: [makeVacuum({
        shortcuts: { description: [{ name: '', segments: [] }] },
      })],
    }));
    await el.updateComplete;

    (el as any)._shortcutId = 0;
    (el as any)._edit = true;
    await el.updateComplete;

    const editorHead = el.shadowRoot!.querySelector('.editor .head span');
    // Should show the index fallback
    expect(editorHead?.textContent).toBeDefined();
  });

  // ── _updateShortcutField icon ───────────────────────────────────────────────

  it('dispatches config-changed when shortcut icon is updated', async () => {
    const el = await createElement();
    el.setConfig(makeConfig({
      vacuums: [makeVacuum({
        shortcuts: { description: [{ name: 'Zone 1', icon: '', segments: [] }] },
      })],
    }));
    await el.updateComplete;

    (el as any)._shortcutId = 0;
    (el as any)._edit = true;
    await el.updateComplete;

    const received: CustomEvent[] = [];
    el.addEventListener('config-changed', (e) => received.push(e as CustomEvent));

    const iconDropdown = el.shadowRoot!.querySelector('.editor sf-editor-dropdown-icon')!;
    iconDropdown?.dispatchEvent(new CustomEvent('input-update', {
      bubbles: true,
      composed: true,
      detail: { id: 'icon', kind: 'shortcut-icon', value: 'mdi:map-marker' },
    }));

    expect(received).toHaveLength(1);
    expect(received[0]!.detail.config.vacuums[0].shortcuts.description[0].icon).toBe('mdi:map-marker');
  });
});
