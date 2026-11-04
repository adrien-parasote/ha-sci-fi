/**
 * Makes the ids of an animated SVG icon unique to one rendered instance.
 *
 * <sf-icon> renders in light DOM, so two weather icons in one card share an id
 * scope: `<use xlink:href="#b">` or `url(#x1)` in the second one would resolve to
 * the first one's element (bead ha-sci-fi-rq0). Every id under `root` gets
 * `suffix` appended, and every local reference to it — `href` / `xlink:href`
 * equal to `#id`, `url(#id)` in any attribute, the SMIL syncbases of `begin` /
 * `end` (`x1.end+.33s`, named without `#`) and the id lists of
 * `aria-labelledby` / `aria-describedby` — is rewritten to match.
 * Idempotent: an id already carrying the suffix is left alone.
 */

const URL_REF = /url\(#([^)]+)\)/g;
/** A SMIL syncbase or repeat token at the start of a `begin`/`end` list item: `x1.end`, `y3.begin`, `s2.repeat(1)`. */
const SYNCBASE_REF = /^(\s*)([^\s.;+-][^\s.;+]*)\.(begin|end|repeat\()/;
const TIMING_ATTRS = new Set(['begin', 'end']);
const IDREF_LIST_ATTRS = new Set(['aria-labelledby', 'aria-describedby']);

function rewriteTiming(value: string, renamed: Map<string, string>): string {
  return value
    .split(';')
    .map((item) => item.replace(SYNCBASE_REF, (whole, lead: string, ref: string, kind: string) => {
      const scoped = renamed.get(ref);
      return scoped ? `${lead}${scoped}.${kind}` : whole;
    }))
    .join(';');
}

export function scopeSvgIds(root: Element, suffix: string): void {
  const renamed = new Map<string, string>();
  for (const el of Array.from(root.querySelectorAll('[id]'))) {
    const id = el.getAttribute('id')!;
    if (id.endsWith(suffix)) continue;
    const scoped = `${id}${suffix}`;
    renamed.set(id, scoped);
    el.setAttribute('id', scoped);
  }
  if (renamed.size === 0) return;
  for (const el of Array.from(root.querySelectorAll('*'))) {
    for (const attr of Array.from(el.attributes)) {
      const value = attr.value;
      if (TIMING_ATTRS.has(attr.localName)) {
        const next = rewriteTiming(value, renamed);
        if (next !== value) el.setAttributeNS(attr.namespaceURI, attr.name, next);
        continue;
      }
      if (IDREF_LIST_ATTRS.has(attr.localName)) {
        const next = value.split(/\s+/).map((ref) => renamed.get(ref) ?? ref).join(' ');
        if (next !== value) el.setAttributeNS(attr.namespaceURI, attr.name, next);
        continue;
      }
      if (!value.includes('#')) continue;
      const isHref = attr.localName === 'href';
      const next = isHref && value.startsWith('#')
        ? `#${renamed.get(value.slice(1)) ?? value.slice(1)}`
        : value.replace(URL_REF, (whole, ref: string) => {
            const scoped = renamed.get(ref);
            return scoped ? `url(#${scoped})` : whole;
          });
      if (next !== value) el.setAttributeNS(attr.namespaceURI, attr.name, next);
    }
  }
}
