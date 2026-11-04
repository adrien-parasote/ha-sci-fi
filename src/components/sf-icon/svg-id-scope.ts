/**
 * Makes the ids of an animated SVG icon unique to one rendered instance.
 *
 * <sf-icon> renders in light DOM, so two weather icons in one card share an id
 * scope: `<use xlink:href="#b">` or `url(#x1)` in the second one would resolve to
 * the first one's element (bead ha-sci-fi-rq0). Every id under `root` gets
 * `suffix` appended, and every local reference to it — `href` / `xlink:href`
 * equal to `#id`, and `url(#id)` in any attribute — is rewritten to match.
 * Idempotent: an id already carrying the suffix is left alone.
 */

const URL_REF = /url\(#([^)]+)\)/g;

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
