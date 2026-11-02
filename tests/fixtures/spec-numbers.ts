/** Contrôle d'unicité des numéros de spec (lot spec-12-renumber, bead ha-sci-fi-b8g). */

/** Les specs titrées : docs/specs/*.md et docs/specs/cards/*.md. */
export const isTitledSpec = (f: string): boolean => /^docs\/specs\/(cards\/)?[^/]+\.md$/.test(f);

export type SpecText = { path: string; text: string };

/** Numéro (entier) du premier titre `# Spec N` de chaque fichier ; sans titre numéroté, ignoré. */
export function specNumbers(files: SpecText[]): Map<number, string[]> {
  const out = new Map<number, string[]>();
  for (const { path, text } of files) {
    const m = /^#[ \t]+Spec[ \t]+(\d+)/m.exec(text);
    if (m === null) continue;
    const n = parseInt(m[1]!, 10);
    out.set(n, [...(out.get(n) ?? []), path]);
  }
  return out;
}

/** Les numéros partagés par deux fichiers ou plus. */
export function collidingNumbers(files: SpecText[]): Map<number, string[]> {
  return new Map([...specNumbers(files)].filter(([, fs]) => fs.length > 1));
}

/** Vrai si la seule collision est Spec 07 entre hexa-tiles.md et tv.md (bead ha-sci-fi-13j). */
export function pinnedOnly(c: Map<number, string[]>): boolean {
  if (c.size !== 1 || !c.has(7)) return false;
  const fs = c.get(7)!.slice().sort();
  return fs.length === 2 && fs[0] === 'docs/specs/cards/hexa-tiles.md' && fs[1] === 'docs/specs/cards/tv.md';
}

/** Le rapport nommé `Spec N: fichier, fichier` des collisions hors Spec 07. */
export function collisionReport(c: Map<number, string[]>): string[] {
  return [...c.entries()].filter(([n]) => n !== 7).map(([n, fs]) => `Spec ${n}: ${fs.join(', ')}`);
}
