/** Fix lot stove-bridge, O3 (bead ha-sci-fi-e9r): the editor spec describes the shipped stove editor. */
import { describe, it, expect } from 'vitest';
import * as fs from 'fs';

const spec = fs.readFileSync('docs/specs/10_card_editors.md', 'utf8');
const editor = fs.readFileSync('src/cards/stove/sci-fi-stove-editor.ts', 'utf8');

describe('O3', () => {
  it('test_O3_editor_spec_matches_the_shipped_stove_editor', () => {
    const start = spec.indexOf('### `sci-fi-stove-editor`');
    expect(start).toBeGreaterThan(-1);
    const section = spec.slice(start, spec.indexOf('\n---', start));
    // the spec prescribes no _climates state, which the editor does not have
    expect(section).not.toMatch(/_climates:/);
    expect(editor).not.toContain('_climates');
    // and it lists the free-text entity field the editor renders
    expect(section).toContain('input-stove-entity');
    expect(editor).toContain("'input-stove-entity'");
  });
});
