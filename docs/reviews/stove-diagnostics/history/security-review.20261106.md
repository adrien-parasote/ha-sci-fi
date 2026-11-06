# Security review — stove-diagnostics, round 1

AUDITOR: subagent
Packet: .sc/review/3c93ef9-0b3f20a7 (must_read.txt empty: no entry point packaged)

COVERAGE:
| file | lines read | total (wc -l) | full read? |
| src/cards/stove/diagnostics.ts | 1-94 | 94 | yes |
| src/cards/stove/number-wheel.ts | 1-127 | 127 | yes |
| src/cards/stove/sci-fi-stove.ts | diff hunks | 775 | no (diff only) |
| src/cards/stove/config.ts | diff hunks | 47 | no (diff only) |
| src/cards/stove/sci-fi-stove-editor.ts | diff hunks | - | no (diff only) |
| src/types/ha.ts | diff hunks | 111 | no (diff only) |

VERDICT: DEPLOY

SURFACES CHECKED:
- Untrusted input: HA entity state and attributes.code (set by the integration or anyone with HA write access), config entity ids (user's YAML), the output of hass.formatEntityState.
- Sinks: every value reaches the DOM through Lit text bindings (`${l.text}`) or quoted attribute bindings (title, aria-label, icon). Lit escapes these. No unsafeHTML, innerHTML, eval or URL sink is added (I grepped the src diff for them).
- Class binding `diagnostic ${l.kind}` takes its value from the fixed DiagnosticKind union, never from entity data.
- Lookups: readDiagnostic does an own-property check (hasOwnProperty) plus a domain-prefix check, so a `__proto__`-style id cannot reach the prototype.
- Type confusion: `alert.state.trim()` runs only after isReported has confirmed the state is a string. errorCode accepts only a string or a finite number. The formatter is wrapped in try/catch and its result is type-checked.
- DoS: title/aria-label text is capped at 200 characters (FR-14 in the spec: title and aria-label text is capped). The visible text is not capped, but it is still escaped text.
- No service calls, auth or secrets are added. The number-wheel code is moved without change from sci-fi-stove.ts, and its set_value path does not change.

FINDINGS:
(none)

NOTES:
- The visible diagnostic text is not capped. This is a layout matter, not a security one, and it is safe because the text is escaped.
- For sci-fi-stove.ts and the editor I read the changed hunks only. The parts I did not read are unchanged by this lot.

---

# Security review — stove-diagnostics, round 2 (re-review)

AUDITOR: subagent
Packet: .sc/review/37da8a2-186abce0 (re-review: delta.txt present; must_read.txt empty)

COVERAGE:
| file | lines read | total (wc -l) | full read? |
| src/cards/stove/diagnostics.ts | 60-95 (delta and the capping helpers it calls) and the delta.patch hunk | 95 | no (delta and callees; lines 1-59 read in full in round 1, unchanged) |
| tests/cards/stove/diagnostics.test.ts | delta.patch hunk (TC-SDG-U-13) | 66 | no (delta only) |

VERDICT: DEPLOY

SURFACES CHECKED:
- The delta is one early return in capErrorText (src/cards/stove/diagnostics.ts:93), taken only when label.length + suffix.length <= TEXT_CAP, so output stays <= 200; suffix uses code.slice(0, CODE_CAP). Fallback still returns exactly 200: the round-1 DoS bound holds.
- Sink unchanged: title and aria-label bindings, escaped by Lit. No new sink, no new input.
- Round-1 findings to close: none.

FINDINGS:
(none)

NOTES:
- TC-SDG-U-13 at tests/cards/stove/diagnostics.test.ts:63-65 covers the functional fix; not a security control.
