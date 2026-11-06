# Code review — fix lot stove-wear-counters (wear stats view, one-decimal rounding)

VERDICT: APPROVE

AUDITOR: subagent
SPEC: docs/specs/stove-wear-counters/spec.md (FR-6 to FR-9), docs/specs/cards/stove.md § « Usure — compteurs fumis »
Packet: .sc/review/ddec5df-b52b0726

The change matches the spec and no correctness or security defect was found. Five LOW and MEDIUM findings follow; none is CRITICAL or HIGH. The stove tests pass (161 of 161) and the typecheck passes. The no-counter snapshot is unchanged, so the card renders as before when no counter is configured.

COVERAGE:
| file | read |
|---|---|
| src/cards/stove/wear-counters.ts | full (124 lines) |
| src/cards/stove/sci-fi-stove.ts | diff, renderCard, _renderHeader, and every `nothing`/header use (grep) |
| src/cards/stove/styles.ts | diff, plus `.header` and `.diagnostic-badge` |
| src/cards/stove/state-label.ts | full (outside the diff, read for rawState and formattedState) |
| tests/cards/stove/sci-fi-stove-wear-counters.test.ts | lines 72–100, 120–140, 300–392 |
| docs/specs/stove-wear-counters/spec.md | FR-2.1 to FR-13, tests table, error matrix |
| docs/specs/cards/stove.md | F-STOVE-D12, § Usure, § L'en-tête rendu |

FINDINGS:

[MEDIUM] Card doc still says the header holds only the name
File: docs/specs/cards/stove.md:334
Issue: the doc shows the old one-argument `_renderHeader(name)` and the `.header` CSS without `position: relative`. The section says it was "measured on the shipped code", which is now false whenever a counter is configured; the lot amended this file but left the section stale (FR-13).
RESOLUTION: fixed — section « L'en-tête rendu » of docs/specs/cards/stove.md now shows `_renderHeader(name, toggle)` and the `.header` CSS with `position: relative` and `padding: 5px 32px`; TC-SWC-U-08 reads the doc.

[LOW] Toggle button taller than the header, long names run under it
File: src/cards/stove/styles.ts:384
Issue: the header is about 25 px tall and the button about 32 px (24 px icon plus 2×4 px padding), so it spills about 4 px past the header and reaches the corner of `.content` where `.diagnostic-badge` sits; the header has no right padding, so a long centred `friendly_name` runs under the button. Fixing it needs an FR-9 amendment first.
RESOLUTION: fixed — spec FR-9 amended (`.header` `padding: 5px 32px`; `.wear-toggle` `padding: 0`, `line-height: 0`, `--icon-width/--icon-height: 16px`), styles.ts updated, TC-SWC-U-08 green.

[LOW] A closed-by-config wear view can reopen by itself
File: src/cards/stove/sci-fi-stove.ts:215
Issue: `_wearOpen` is never reset when the counters disappear, only `showWear` hides the view. In the dashboard editor preview (`setConfig` reuses the element): open the view, remove every counter, then add one back; the card lands on the stats view instead of starting closed.
RESOLUTION: fixed — spec FR-8 amended (`setConfig` resets `_wearOpen` to false when no counter is configured), `setConfig` override added in sci-fi-stove.ts, test_O1_a_config_that_loses_its_counters_closes_the_wear_view green.

[LOW] A hex, binary or signed state is shown as a different number
File: src/cards/stove/wear-counters.ts:83
Issue: `Number(raw)` accepts `'0x10'` (shown 16), `'0b11'` (3), `'+3'`, `'.5'`; FR-7 defined "numeric" with that test. Fumis sensors never send these forms, so the impact is cosmetic. A decimal-only check would close it but needs FR-7 amended.
RESOLUTION: fixed — spec FR-7 amended (decimal form only), `DECIMAL` check added in wear-counters.ts, test_O2_only_plain_decimals_are_rounded green.

[LOW] The spec still describes the old collapsible section in five places
File: docs/specs/stove-wear-counters/spec.md:21
Issue: the lines 21, 28, 84, 94 and 129 still said "section repliable", "la section est rendue", "section non rendue" and AR-1 "repliée" after the D1 and FR-6 amendment.
RESOLUTION: fixed — those lines now speak of the header button and the stats view, closed by default; no occurrence of the old wording remains in the spec.

NOTES:
- Rounding edge cases checked against the exact expression: `'-0.04'` shows `0`; `'-3.25'` shows `-3.3`; `'0.05'` shows `0.1`; `'1e21'` shows `1e+21`; `'  12  '` shows `12`; `'Infinity'` and `'NaN'` are not numeric and go to HA's formatter, else the raw text; whitespace-only is rejected earlier by `readable()`.
- Numeric states no longer go through `hass.formatEntityState`: a French user sees `104.5 h` where HA itself shows `104,5 h`, and `display_precision` is ignored. FR-7 and the amended D2 decide this explicitly; it is an upstream choice, worth confirming with the user.
- XSS: every value is bound safely (Lit text bindings for label and value, attribute bindings for `title`, `aria-label`, `icon`; the class comes from the constant `WEAR_COUNTERS` key); nothing uses `unsafeHTML` or `innerHTML`.
- No-counter case: `renderWearToggle` returns `nothing` and the body renders as before; the snapshot file is untouched.
- Removing the `sf-editor-accordion` import is safe: no other file under `src/cards/stove` uses that element.
- The toggle has `aria-expanded` but no `aria-controls`; the spec does not require it.
