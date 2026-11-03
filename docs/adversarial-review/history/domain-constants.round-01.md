# Adversarial review — domain-constants

Spec: `docs/specs/domain-constants/spec.md` (main `35f1020`). Regime: fan-out (user's pick), 3 lenses (Security, User, Scope), each on `opus`, a model other than the spec's author, one message, foreground. Round 1 of max 2.

## Summary

Verdicts: Security CLAIM_OVERSTATED, User CLAIM_BROKEN, Scope CLAIM_OVERSTATED. Two independent lenses (User, Scope) found the same real miss: `'counter'` at `sci-fi-bridge-editor.ts:777`, absent from `DOMAIN`, from the 110 and from the allow-list, so FR-2 (typecheck) and FR-5 (guard) cannot both be satisfied. Scope's own AST re-measure: prefix 27, fullid 21, exact 97 = 82 + 1 + 12 + 2 (`counter`, and `text` at `sf-editor-input.ts:30`, an HTML input type that the guard's universe would flag). All else reconciles (24 files, G0..G5 sum, 12 allow-listed, 21 full ids).

Counts after resolution: replaceable 111 (cards 109 in 22 files, selectors 2), allow-list 13 tokens, `DOMAIN` 24 keys (23 to 24, a correction under user decisions D1/D3), 115 `DOMAIN.` references with the 4 computed icon keys.

## Stress-test

Hostile reading of the lens signals. Convergence (all three lenses): the allow-list counts a literal per file, so an allowed literal can stand in for a real one (swap); and nothing proves each site received the RIGHT key (FR-8 mutates a key's value, it does not check which key a site uses; Assumption 2 is unmeasured). Pattern: the guard is a literals-only instrument whose universe was never written down. Blind spot found by this pass: the probe is validated by its own mechanism only (the primary AST scan and the cross-check both trust one parse; a silent parser failure on a file type reads as clean, L888). Verdict: the spec is NOT settled as written: two HIGH defects (counter, universe) change counts and the key set, one HIGH (site-to-key) needs an automated per-file per-key table. All are absorbable in the spec; none needs a new user decision, except two points the user should know (counter makes `DOMAIN` 24 keys; hexa-tiles kind comparisons stay allow-listed under D2).

## Findings

[HIGH] — F-01 `counter` is a real domain literal missing from DOMAIN, the 110 and the allow-list; FR-2 and FR-5 contradict each other on it (Scope, User) [CONTRACT] [RESOLVED: TC-DC-U-01, IT-DC-I-01] — `COUNTER` added, 24 keys, 111 sites, spec 02 AP#5 corrected
[HIGH] — F-02 Nothing proves each site got the right key: a wrong key compiles, passes the guard, keeps the count, and FR-8 passes while any other site of that key is tested (Security, User) [RESOLVED: TC-DC-U-08] — committed per-file per-key table
[HIGH] — F-03 The guard's universe ("the broad HA domain list") is never defined; every reasonable reading breaks IT-DC-I-01 (`text` HTML input type) or the `'fan'` control (Scope, Security) [RESOLVED: TC-DC-U-10] — universe pinned in the test, `text` allow-listed
[MEDIUM] — F-04 The allow-list keyed `file -> literal -> max` lets an allowed literal stand in for a real domain literal (swap at same count): `lock` action vs domain in sf-bridge-access, hexa-tiles kinds (Security, User, Scope) [RESOLVED: TC-DC-U-04] — `context` field per entry
[MEDIUM] — F-05 "Fewer than max" is told to delete the line; the right fix is to lower `max`; TC-DC-U-04 says "raise" (User) [RESOLVED: TC-DC-U-04] — messages corrected
[MEDIUM] — F-06 Adding a domain is defined only through three successive failures; the unknown-domain message has no key to name (User) [RESOLVED: TC-DC-U-05] — message names the key to add
[MEDIUM] — F-07 Allow-list drifts from D2 without a flag: `renault` named by the user but dropped, `lock` action and `light` CSS class added (Scope) [RESOLVED: TC-DC-U-09] — `renault` is outside the universe (no entry), `lock` and `light` class recorded in FR-9 and Assumption 7
[MEDIUM] — F-08 hexa-tiles `kind === 'light'/'switch'/'climate'` allow-listed as config kind hides a comparison against a parsed domain (Scope) [ACCEPTED: spec FR-9] — user decision D2 names the config-kind vocabulary; the hybrid is recorded in FR-9
[MEDIUM] — F-09 sf-bridge-automations unquoted icon keys are the same domain dispatch as the replaced `case` labels, left as is (Scope) [RESOLVED: TC-DC-U-08] — four computed keys `[DOMAIN.X]`, behaviour pinned by the card's existing test, counted in the table
[MEDIUM] — F-10 Runtime-built strings (`'li'+'ght'`, `Object.keys`, `String(x) as Domain`) slip past a literal-only guard and nothing says the guard is not a full integrity control (Security) [RESOLVED: TC-DC-U-03] — FR-5 states the limit, negative fixture asserts it
[MEDIUM] — F-11 FR-8 is MANUAL: a gate the suite cannot run, no lasting regression check, and the new value-table test could itself be the red test (Security, User) [RESOLVED: TC-DC-U-08] — the mutation loop stays a scratch script excluding the two new tests (TC-DC-U-07), the table test is the lasting automation
[MEDIUM] — F-12 The probe is validated by its own mechanism: no proof the AST scan is not silently blind (a file type dropped by the parser reads as zero flagged) (stress-test, L882/L888) [RESOLVED: TC-DC-U-11] — stubbed-AST control and visited-file calibration against `git ls-files`
[LOW] — F-13 Domains from user YAML (`sc.service.split`, `entity_kind`) stay unchecked strings reaching `callService`; the risk is not recorded (Security) [FALSE: pre-existing user-YAML domains keep `string` per FR-2; the refactor changes no validation, and FR-2 now records the risk as unchanged] — nothing in this lot touches that path
[LOW] — F-14 The parallel build depends on G0 for every group, not only G3 (User) [RESOLVED: TC-DC-U-08] — Build plan reworded: G1-G5 branch from G0's merged commit, the table is committed in G0
[LOW] — F-15 Assumption 6 and References cite `token-scan.ts` as an AST precedent while calling it "AST-free"; TC-DC-U-05's double-quote case is flagged by the AST scan too, so it tests nothing it claims (Security, Scope, User) [RESOLVED: TC-DC-U-05] — real precedents cited (`repo-wide-ids-guard.test.ts`, `french-literals.ts`), the divergence case is now a comment and a type literal

## Hostile-Input Checklist

HIC-1 N/A — a constants module and a test-time scan: no range, count, size or loop a caller controls
HIC-2 N/A — no user-supplied string is stored or emitted by this lot; only constants replace literals
HIC-3 FINDING F-13 — domains parsed from user YAML still reach `callService`; unchanged by the lot, recorded
HIC-4 N/A — no bootstrap, no route, no authorization surface; a refactor of a client-side card library
HIC-5 N/A — no endpoint or parser of external input; the guard parses repo source only and never executes it
HIC-6 N/A — no numeric or enum field is introduced; `Domain` is a closed string union

## Builder check

(filled after the fixes — see below)
