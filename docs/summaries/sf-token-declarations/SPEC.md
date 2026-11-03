# SPEC — sf-token-declarations (stage summary)

**Decided:**
- Declare 12 tokens in common.ts at current rendered values (px, no rem): 11 of the 36 undeclared names plus new --sf-bg-tile (#101626); --sf-border-light is a declared alias of --sf-bg-tertiary.
- 36 = 11 declared + 4 hooks (HOOKS) + 21 open card names (OPEN_CARD_NAMES, --sf-glow-cyan keyed once: 3z0j, also yj6).
- TC-307 hardened: reports undeclared --sf-* with or without fallback; allow-lists are ratchets, bounded (src/cards keys only, family bead, exact max).
- Drift guard FR-4/FR-5: inclusion by inheritance chain, class-less sheets resolved through importers; sf-dropdown stays live.
- FR-11 = user-accepted card-mod ancestor-override limit (also for nested sf-* components).
- Headless build-mode, spike-offer no (user answers).

**Artifacts:**
- docs/specs/sf-token-declarations/spec.md
- docs/adversarial-review/sf-token-declarations.md

**Intent items touched:** none.

**Open/risky:**
- IT-SFT-I-02 canary: happy-dom may not resolve var() through :host; fallback is folding CSS text (Error Handling row).
- BUILD stops and amends the spec if a name falls outside 11/4/21 or an open name is read by a socle file.
- Real bead existence checked by bd show at BUILD, recorded in the commit message.

**Dead ends:** rename --sf-text-* to --sf-font-size-* (rem renders 18px).

**Next action:** BUILD TDD from TC-SFT-U-01..08, IT-SFT-I-01..05; declare the expected-diff files before the first write.
