# Adversarial review — stove-wear-counters

Regime: fan-out, 3 lenses (Security, User, Scope) on sonnet (author: opus). Packet `.sc/review/c7d02fb-9925391d`.
Verdict of the three lenses: CLAIM_OVERSTATED, with no HIGH finding. All findings below are UNRESOLVED (the fixes are made in a fresh context).
User decisions already taken, not re-raised: the collapsible « Usure » section, collapsed by default below the card; HA-formatted values; no graph; the stove-diagnostics precedents.

## Findings

- [MEDIUM] — F-01 Entity id not bounded: an id of any length or format is accepted (FR-2, FR-10 free text) and goes into getRelevantEntities. Proposed fix: a TC with a very long id that expects no row and no exception. [RESOLVED] FR-2.1 (255 max, entity_id pattern, never read nor declared, row « — ») — TC-SWC-U-06
- [MEDIUM] — F-02 Unit and formatted value not bounded in length (FR-7): only the CSS ellipsis limits them. Proposed fix: cap wearValue and add a TC. [RESOLVED] FR-5 value = capText (200), full text in title (FR-6) — TC-SWC-U-05
- [MEDIUM] — F-03 Accessibility of sf-editor-accordion on the card face is unproven (keyboard, aria-expanded, focus). IT-SWC-I-01 only checks a mouse click. [RESOLVED] Assumption 5 (native focusable checkbox, label[for], no aria-expanded, component unchanged) — IT-SWC-I-04
- [MEDIUM] — F-04 A configured counter that is unavailable, or whose id has a typo, is silently omitted (FR-5) and cannot be told apart from « not configured ». This omission was an agent choice and is being challenged. [RESOLVED] user decision D5: configured row kept with « — », section as soon as one counter is configured (FR-5, FR-6) — TC-SWC-U-03, TC-SWC-U-04, TC-SWC-U-06
- [MEDIUM] — F-05 The state-label.ts extraction is justified by the 790-line cap, but that arithmetic is unproven (FR-12: about 12 lines removed, 20 added). Proposed fix: justify the extraction by the single-copy rule, or derive the cap from a measured `wc -l`. [RESOLVED] FR-1 justified by the single-copy rule; FR-12 shows 775 − 14 + 10 ≈ 771 ≤ 790 — TC-SWC-U-09
- [MEDIUM] — F-06 Reusing sf-editor-accordion outside the editor rests only on « water already does it » (Assumption 2). Proposed fix: assert the element is defined and renders in the card's shadow DOM, and cite the water file:line. [RESOLVED] Assumption 2 cites sci-fi-water-management.ts:14/653/668 and its test :301; FR-3 imports the element — IT-SWC-I-01
- [MEDIUM] — F-07 TC-SWC-U-00 / FR-0 is a process proof (git log ordering), not an automated test. The way the snapshot key is read after FR-1 is not specified. [RESOLVED] FR-0 names the exact key and the preLotContainer() regex reader — TC-SWC-U-00
- [LOW] — F-08 The own-property guard covers entities but not `attributes.unit_of_measurement` (FR-7). [RESOLVED] FR-7 Object.hasOwn on attributes — TC-SWC-U-05
- [LOW] — F-09 wearValue is exported but its precondition (a row already filtered by FR-5) is not stated (FR-7). [RESOLVED] FR-7 precondition stated (readable entity only, FR-5) — TC-SWC-U-03
- [LOW] — F-10 Truncated values and labels have no full text (no title attribute) (FR-9). [RESOLVED] FR-6 title on .wear-label and .wear-value — TC-SWC-U-04, TC-SWC-U-05
- [LOW] — F-11 The unit fallback uses an ordinary space instead of U+00A0, and rawState replaces « _ » with spaces (FR-7). [RESOLVED] FR-7 U+00A0; rawState kept shared (numeric states carry no « _ », FR-1) — TC-SWC-U-05
- [LOW] — F-12 The open state of the section is lost whenever Lovelace re-instantiates the card. This is not documented in stove.md (FR-8/FR-13). [RESOLVED] FR-8 + AR-1, documented in stove.md (FR-13) — IT-SWC-I-03, TC-SWC-U-08
- [LOW] — F-13 TC-SWC-U-08 checks the styles by reading the source text, not the rendered result (FR-9). [RESOLVED] TC-SWC-U-08 reads the cssText of SciFiStoveCard.styles (adopted sheets) — TC-SWC-U-08
- [LOW] — F-14 The editor offers no domain hint: a `binary_sensor.x` id produces an empty section with no feedback (FR-10, consistent with the stove-diagnostics precedent D8). [ACCEPTED: spec FR-10] (AR-2) user decision 2026-11-05; the card now shows a « — » row (D5)

## Cross-synthesis

- Convergence (User + Scope): F-03 and F-06, the accordion on the card face, is the shared weak point and should be fixed first.
- Convergence (User + Scope + Security): F-04 and F-14, the silent loss of a misconfigured id, with no feedback anywhere.
- Pattern (Security): F-01, F-02 and F-08, no bound or guard on what comes from the integration or the config.
- Tension: F-04 (show a « — » row) against the stove-diagnostics precedent of omission (alerts). The precedent concerns transient alerts, not persistent counters.
- Blind spot: no lens measured the cost of re-rendering on every hass tick. Low risk, since the values are read only.

## Stress-test

A short pass over the top arguments. No finding reaches HIGH. Nothing endangers the user's data or security: the values are rendered as Lit text only, and nothing is written or piloted.
F-04 is the only one that needs a product decision (omit, or show unavailable). F-03 and F-06 are fixable within the spec (a TC to add). F-05 must be corrected in place, because the arithmetic as written cannot be verified.
Verdict: the spec holds after fixes; there is no blocker for BUILD once the 14 findings are resolved.

## Hostile-Input Checklist

HIC-1 FINDING F-01
HIC-2 covered ("Libellé et valeur sont des liaisons de texte Lit, jamais du HTML")
HIC-3 covered ("Libellé et valeur sont des liaisons de texte Lit, jamais du HTML")
HIC-4 N/A — read-only card over hass.states the user already holds; no endpoint, write or service call
HIC-5 FINDING F-02
HIC-6 N/A — the value is an opaque string that is never parsed; unavailable/unknown are filtered (FR-5)

## Builder check

One cold builder (sonnet, foreground) read docs/specs/stove-wear-counters/ only. Five questions.

### Answered

- Where `.container` is built, so where the section goes: `renderCard()` (`sci-fi-stove.ts:209-218`), one new line after `_renderBottom`, the "entity not found" branch unchanged. Written in FR-6.
- Where the B-1 normalisation comes from: a local function in the test file, copied from `tests/cards/stove/sci-fi-stove-diagnostics.test.ts:34`; the test file exists from the first step and its other tests fail until the lot's code exists. Written in FR-0.
- Whether `element-id="wear"` must be unique on the page: no, each card has its own shadow root. No spec change needed (FR-6 as written).

### My calls

- A raw state `'1_234'` shown as `1 234` is accepted, and `rawState` is reused as is (D2). Marked as agent's call in FR-7.
- A string the formatter returns is shown as is, whatever it says (HA is the source of the text). Marked as agent's call in FR-7.

### Theirs

none
