# Security review — icon-contract (round 1)

AUDITOR: subagent
PACKET: .sc/review/868b0fe-5df0069a (dirty 868b0fe..worktree; must_read.txt is EMPTY: no entry point was packaged)

COVERAGE:
| file | lines read | total (wc -l) | full read? |
|---|---|---|---|
| src/components/sf-icon/sf-icon.ts | 1-231 | 231 | yes |
| src/components/sf-icon/icon-names.ts | 1-21 | 21 | yes |
| src/components/sf-icon/sci-icon.ts | full via diff (new body is the whole file) | 35 | yes |
| src/components/sf-icon/icon-cache.ts | 1-152 | 152 | yes |
| src/components/sf-icon/sf-iconset.ts | 1-54 via diff hunks + 55-95 | 95 | yes |
| src/components/sf-toast.ts | diff hunk + 110-135 (render sink) | 141 | no (sink and import only) |
| src/components/editor-inputs/sf-editor-dropdown-icon.ts | diff hunk + grep of render/innerHTML sinks | 169 | no (changed lines and sinks only) |
| docs/specs/icon-contract/spec.md | 1-113 | 113 | yes |
| tests/*, docs/* (other) | diff only | — | no (not a runtime surface) |

VERDICT: DEPLOY

SURFACES CHECKED:
- User-controlled input: the card-config `icon` string ("prefix:name"), reaching `lookupCustomIcon` (sf-icon.ts:55-62), `getIconForIconsets` / `getIconForPicker` (sf-iconset.ts), and `resolveIcon` -> `fetchMdiFromHass` (icon-cache.ts:96-109).
- Inherited keys: `ownValue` (icon-names.ts:19-21) is `Object.prototype.hasOwnProperty.call`, so `constructor`, `toString`, `__proto__`, `hasOwnProperty` on the NAME are unknown names in all built-in maps and in `window.customIcons[prefix]`. The PREFIX segment is not own-checked (finding 1).
- DOM sinks: the path string goes to `svg\`<path d="${...}">\`` (sf-icon.ts:217), a Lit attribute binding (setAttribute, no markup parsing), so no SVG/HTML injection from a path string. viewBox is a constant '0 0 24 24' everywhere; no user value reaches it. A template is rendered only from the module-local `WEATHER_ICONS` (sf-icon.ts:57); foreign objects in `window.customIcons` are now dropped (sf-icon.ts:61), which closes the previous "any page script can inject a TemplateResult" path. No innerHTML / unsafeHTML / unsafeSVG in the files in scope.
- window.customIcons mutation: now filled in place (sf-icon.ts:40-45) instead of replaced; helpers on sciMap stay non-enumerable (sf-iconset.ts:73-84). Page-global and same-origin by nature; any script able to write it already runs in the page.
- Fetch/URL: icon-cache.ts builds no URL and calls no CDN; one fixed websocket message `{type:'frontend/get_icons', category:'mdi'}` per connection (icon-cache.ts:83-86). The icon name is used only as a key into the HA response.
- Log injection: `logName` (sf-iconset.ts) strips non-printable ASCII and caps at 64 chars.
- Dependency: sf-toast.ts now imports `render` from 'lit' (declared `"lit": "^3.3.3"` in package.json); lit/index.d.ts re-exports lit-element, which re-exports lit-html, so no new package and no undeclared import. No package.json / lockfile change in the diff; npm audit not run (no dependency change in this lot). sf-toast `message` is a text child binding (escaped).
- Secrets: none in the diff.

FINDINGS:
- [LOW] src/components/sf-icon/sf-icon.ts:60 — an icon like `constructor:name` renders a broken `<path d="Object">` instead of the help-circle fallback and the unknown-namespace warning — the prefix is read with a plain property access `window.customIcons?.[prefix]`, so an inherited prefix (`constructor`, `__proto__`, `toString`) resolves to `Object` / `Object.prototype` / a function, and `ownValue` then returns that object's own string property (`Object.name` === "Object"). Attribute binding keeps it harmless (no injection), but it breaks the own-key rule FR-1.1 (string paths in window.customIcons[prefix] resolve by own key) states for the lookup. Fix: `const map = ownValue(window.customIcons ?? {}, prefix); const foreign = map && typeof map === 'object' ? ownValue(map, name) : undefined;`.
  RESOLUTION: fixed — lookupCustomIcon reads the prefix by own key and requires an object; TC-ICC-U-09 'an inherited prefix (constructor:name) falls back' (vitest 91/91)
- [LOW] src/components/sf-icon/icon-cache.ts:102 — OUT-OF-DIFF: (lines unchanged by this lot; only the header comment moved) an icon like `mdi:constructor` or `mdi:__proto__` (outside live HA, with no `ha-icon` registered) caches and renders a non-string — `Object`'s source text as path data, or `Object.prototype` rendered as "[object Object]" text — because `response.resources[iconName]` is a plain property read with no own-key or `typeof === 'string'` check. Lit binds it as attribute/text, so no injection; it also poisons memCache for that key and fails the IndexedDB write (caught). A bead for the author, not a fix in this lot.
  RESOLUTION: fixed — icon-cache.ts file is in this lot's diff; fetchMdiFromHass reads own string keys only; TC-ICC-U-01 'the mdi registry read is by own string key' (vitest 91/91)

NOTES:
- window.customIcons is a page-global writable by any same-origin script; FR-1.1 (foreign objects never rendered as templates) is defense in depth, not a trust boundary. A foreign string path is still drawn, by design (spec FR-1.1), through a safe attribute binding.
- FR-10 (shared SVG id scope in light DOM) is a rendering-collision risk the user accepted; it is not a security defect (ids come from bundled data, not from input).
- Card config is written by the dashboard admin, so the attacker for the `icon` string is low-privilege at most; both findings are robustness against inherited keys, not exploitable injection.
- I judged static text only; no runtime/browser execution, and no infra in this diff.
