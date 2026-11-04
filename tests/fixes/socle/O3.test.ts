/** Fix lot socle, O3 (bead ha-sci-fi-oyir.3 / ha-sci-fi-kw1): HassEntityEntry.domain is optional — HA does not send it. */
import { describe, it, expect } from 'vitest';
import ts from 'typescript';
import { readFileSync } from 'node:fs';

describe('O3', () => {
  it('test_O3_entity_entry_domain_is_optional', () => {
    const sf = ts.createSourceFile('ha.ts', readFileSync('src/types/ha.ts', 'utf8'), ts.ScriptTarget.Latest, true);
    let member: ts.PropertySignature | undefined;
    sf.forEachChild((n) => {
      if (ts.isInterfaceDeclaration(n) && n.name.text === 'HassEntityEntry') {
        member = n.members.find(
          (m): m is ts.PropertySignature => ts.isPropertySignature(m) && m.name.getText(sf) === 'domain',
        );
      }
    });
    expect(member, 'HassEntityEntry.domain must exist').toBeDefined();
    expect(member!.questionToken).toBeDefined();
  });
});
