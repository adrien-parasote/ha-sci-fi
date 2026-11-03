import { describe, it, expect } from 'vitest';
import { blankComments } from './blank-comments.js';

// Counts the css tagged templates left after the comments are blanked.
const cssCount = (src: string): number => (blankComments(src).match(/css`/g) ?? []).length;

describe('blankComments', () => {
  // Mutant: a line-regex blanker (`//.*$`) returns 0 here — the `//` sits in a string.
  it('TC-BTG-U-35 keeps a css template that follows a // inside a string, blanks real comments, keeps a URL in a template', () => {
    expect(cssCount("const s = '//'; const t = css`a`;")).toBe(1);
    expect(cssCount('// css`x`')).toBe(0);
    expect(cssCount('/* css`x` */')).toBe(0);
    expect(cssCount('/* multi\n css`x`\n */ const a = 1;')).toBe(0);

    const tpl = 'const u = `http://x ${a} // still text`; // gone';
    const blanked = blankComments(tpl);
    expect(blanked).toContain('http://x');
    expect(blanked).toContain('// still text');
    expect(blanked).not.toContain('gone');
    expect(blanked.length).toBe(tpl.length);

    // a nested template inside ${...} and a // after a double-quoted string
    expect(cssCount('const q = "a//b"; const t = `${ `x` } ${ css`y` }`;')).toBe(1);

    // comments INSIDE ${...} are blanked too (the scanner re-enters code mode there)
    expect(cssCount('const t = `${ /* css`y` */ 1 }`;')).toBe(0);
    expect(cssCount('const t = `${ 1 // css`y`\n }`;')).toBe(0);
  });
});
