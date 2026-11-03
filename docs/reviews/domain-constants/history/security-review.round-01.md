# Security review — domain-constants

AUDITOR: subagent
PACKET: .sc/review/0071389-1bd81957 (dirty 35f1020..worktree; hashes.txt re-checked against the worktree, no drift)

COVERAGE (must_read.txt is EMPTY: no entry point was packaged. Source files were judged on their diff hunks with surrounding context, which is the whole change surface of a literal-to-constant refactor):
| file | lines read | total (wc -l) | full read? |
|---|---|---|---|
| src/types/domains.ts | 1-33 | 33 | yes |
| tests/helpers/domain-scan.ts | 1-235 | 235 | yes |
| src/cards/water/sci-fi-water-management.ts | diff hunks + context (137-145, 268-340, 631-712) | 735 | no (diff) |
| src/cards/bridge/sci-fi-bridge-editor.ts | diff hunks | 947 | no (diff) |
| src/cards/bridge/sections/sf-bridge-access.ts | diff hunks + context | 225 | no (diff) |
| src/cards/bridge/sections/sf-bridge-actions.ts | diff hunks | 126 | no (diff) |
| src/cards/bridge/sections/sf-bridge-alerts.ts | diff hunks + context | 194 | no (diff) |
| src/cards/bridge/sections/sf-bridge-appliances.ts | diff hunks | 110 | no (diff) |
| src/cards/bridge/sections/sf-bridge-automations.ts | diff hunks | 177 | no (diff) |
| src/cards/climates/sci-fi-climates-editor.ts | diff hunks | 287 | no (diff) |
| src/cards/climates/sci-fi-climates.ts | diff hunks | 395 | no (diff) |
| src/cards/hexa-tiles/sci-fi-hexa-tiles-editor.ts | diff hunks | 502 | no (diff) |
| src/cards/hexa-tiles/sci-fi-hexa-tiles.ts | diff hunks | 480 | no (diff) |
| src/cards/lights/sci-fi-lights-editor.ts | diff hunks | 393 | no (diff) |
| src/cards/lights/sci-fi-lights.ts | diff hunks | 462 | no (diff) |
| src/cards/plugs/plug_const.ts | diff hunks + consumers grep | 20 | no (diff) |
| src/cards/plugs/sci-fi-plugs-editor.ts | diff hunks | 225 | no (diff) |
| src/cards/plugs/sci-fi-plugs.ts | diff hunks + context | 672 | no (diff) |
| src/cards/stove/sci-fi-stove.ts | diff hunks | 518 | no (diff) |
| src/cards/tv/sci-fi-tv-editor.ts | diff hunks | 259 | no (diff) |
| src/cards/tv/sci-fi-tv.ts | diff hunks | 612 | no (diff) |
| src/cards/vacuum/sci-fi-vacuum-editor.ts | diff hunks | 404 | no (diff) |
| src/cards/vacuum/sci-fi-vacuum.ts | diff hunks | 364 | no (diff) |
| src/cards/weather/sci-fi-weather-editor.ts | diff hunks | 183 | no (diff) |
| src/cards/weather/sci-fi-weather.ts | diff hunks | 647 | no (diff) |
| src/selectors/climate.ts | diff hunks | 51 | no (diff) |
| src/selectors/house.ts | diff hunks | 128 | no (diff) |
| src/selectors/light.ts | diff hunks | 53 | no (diff) |
| tests/types/domain-literals.test.ts | process/fs sinks (grep) | 179 | no (sinks) |
| tests/cards/water/water-history-aligned.test.ts | process sinks 265-280, 370-390 | 416 | no (sinks) |

VERDICT: DEPLOY

SURFACES CHECKED:
- Service-call routing: every `hass.callService(...)` and `bridgeCall(...)` domain argument in the diff (climates x4, stove x4, lights x4, plugs x2 + HASS_PLUG_SERVICE, tv x5, vacuum x2, bridge access lock/cover x3, bridge alerts switch, bridge actions mapping input_button/script/automation/homeassistant, water `_toggleEntity` and select handler). Each constant resolves to the exact literal it replaced (DOMAIN values checked one by one in src/types/domains.ts:6-30); no domain was swapped (e.g. SWITCH vs INPUT_BOOLEAN, SELECT vs INPUT_SELECT are each preserved at their site).
- Allow-lists that gate which service domain is called: src/cards/water/sci-fi-water-management.ts `_toggleEntity` — array `.includes` became `Set.has` over the same four members (switch, valve, automation, input_boolean) with the same `homeassistant` fallback; the user-config-derived `domain` still only passes through when it is a member. `select_option` routing still picks input_select only on exact match, else select. `MEANINGFUL_DOMAINS` membership unchanged (6 members).
- Entity prefix checks: every `startsWith('x.')` became `` startsWith(`${DOMAIN.X}.`) `` — the trailing dot is kept at every site (person, zone, climate, light, sensor, binary_sensor, switch, media_player, remote, vacuum, weather), so no prefix was widened (no `sensor` matching `sensor_foo.`).
- Water alert predicate extraction (`_isAlertLog`): the three inlined copies and `_getLogStatus` now share one function whose body is byte-equivalent to the previous inline logic; the result is used only for display filtering/status, not authorization.
- Weather sensor lookup `${DOMAIN.SENSOR}.${city}_${suffix}`: same key as before; read-only state lookup.
- Type narrowing (`Domain` on `getEntitiesByAreaAndDomain` and `_entitiesByDomain`): compile-time only, no runtime change.
- Secrets: no credential, token or URL added in src/types/domains.ts, the test helpers, or tests/specs/domain-site-table.json (grep for key/token/secret/password literals: none).
- New test scanner tests/helpers/domain-scan.ts: pure AST/regex analysis over in-memory text; no fs, process, network or eval. The regex is built from the constant UNIVERSE array only (no user input, no ReDoS-prone nesting). Callers spawn git/npx with argument arrays (`execFileSync`/`spawnSync`, no shell), cwd fixed to the repo root, inputs constant — no command injection. Test code is not shipped in the card bundle.
- XSS sinks: no `unsafeHTML`/`innerHTML` introduced by the diff (the one `innerHTML` read at src/cards/weather/sci-fi-weather.ts:587 is pre-existing and untouched).

FINDINGS: none

NOTES:
- The packet's must_read.txt is empty; source files were judged on their changed hunks, which is sufficient for a behaviour-preserving literal substitution, but the rows above are marked "no (diff)" honestly.
- The scanner states itself it is a drift probe, not an integrity control (runtime-built strings are invisible to it); that is a documented limit, not a defect.
- No dependency change in the diff, so no audit was run; no infrastructure in the diff.
- The pre-existing `homeassistant.turn_on/turn_off` fallback (water `_toggleEntity`, bridge actions default) lets a dashboard config target any entity domain via the generic service; this is unchanged by this lot and is bounded by the HA user's own permissions — not a defect of this change.
