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

/** Le rapport nommé `Spec N: fichier, fichier` de chaque collision. */
export function collisionReport(c: Map<number, string[]>): string[] {
  return [...c.entries()].map(([n, fs]) => `Spec ${n}: ${fs.join(', ')}`);
}
