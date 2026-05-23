# Spec 01 — Infrastructure & Tooling

> Document Type: Implementation
> Covers: Step 1 (Infra) from [implementation_plan.md](../implementation_plan.md#L1)
> Branch: `v2`

---

## Blueprint Coverage

| Feature ID | Description | Covered here |
|---|---|---|
| F-INFRA-01 | TypeScript 5.x strict setup | ✅ `tsconfig.json` |
| F-INFRA-02 | Rollup 4 build pipeline | ✅ `rollup.config.mjs` |
| F-INFRA-03 | Automated dev server | ✅ `@web/dev-server` + watch |
| F-INFRA-04 | Test runner automatisé | ✅ `@web/test-runner` |
| F-INFRA-05 | ESLint TypeScript strict | ✅ `.eslintrc.json` |
| F-INFRA-06 | DevContainer HA dev instance | ✅ `.devcontainer/` |
| F-INFRA-07 | GitHub Actions CI | ✅ `.github/workflows/ci.yml` |
| F-INFRA-08 | HACS validation CI | ✅ `hacs.json` |

---

## File Tree

```
./
├── tsconfig.json                   [NEW] TypeScript config
├── .eslintrc.json                  [NEW] ESLint config
├── web-test-runner.config.mjs      [NEW] Test runner config
├── rollup.config.mjs               [MODIFY] Rollup 4 build config
├── package.json                    [MODIFY] dependency upgrades
├── hacs.json                       [MODIFY] HACS card integration metadata
├── .devcontainer/devcontainer.json [NEW] DevContainer settings
├── .devcontainer/docker-compose.yml[NEW] Home Assistant dev compose
├── .github/workflows/ci.yml        [NEW] GitHub Actions CI pipeline
└── docs/implementation_plan.md     [NEW] Project roadmap
```

---

## Assumptions

| # | Assumption | Risk | Validation |
|---|---|---|---|
| 1 | TypeScript 5.x is compatible with our dependencies | Low | → Run `npm info typescript` and `npm run typecheck` |
| 2 | Rollup 4 builds standalone IIFE bundles | Medium | → Run `npm run build` and inspect `dist/sci-fi.min.js` |
| 3 | `@web/test-runner` launches Chromium successfully | High | → Run `npm test` to verify Chromium executes the test suite |

---

## Cross-Spec Contracts
 ### Produces
| Artefact | Consumer | Description |
|---|---|---|
| `tsconfig.json` | Spec 02-06 | TypeScript strict compiler configuration |
| `rollup.config.mjs` | Spec 06 | Bundle compilation — **must pass `experimentalDecorators: true` + `useDefineForClassFields: false` explicitly to `@rollup/plugin-typescript` (Lit decorator contract)** |

 ### Consumes
| Artefact | Provider | Description |
|---|---|---|
| `docs/implementation_plan.md` | Master Spec | Feature lists and implementation order |

 ### Public Interface
| Element | Consumed by | Description |
|---|---|---|
| `npm run build` | Developer / CI | Build production single-file bundle |
| `npm run typecheck` | Developer / CI | Perform strict TypeScript static checks |
| `npm test` | Developer / CI | Execute Open-WC browser tests |
| `` | Browser | Source map for debugging |
| `` | Cards | Shared editor styles |
| `Constraints`, `DOMException`, `Error`, `Floor`, `HomeAssistant`, `LovelaceCardConfig`, `Map`, `PlugEntity`, `ReadonlyMap`, `TypeError` | Type System | Core exported types and utilities |

---

## Anti-Patterns

| # | Anti-Pattern | Violation | Correct Behavior |
|---|---|---|---|
| 1 | Hardcoded swap script | `npm run build` copies environment files | Use `@rollup/plugin-replace` for environment constants |
| 2 | Permissive compiler | `"strict": false` | Set `"strict": true` in `tsconfig.json` |
| 3 | EOL dev server | Using `es-dev-server` | Use `@web/dev-server` |
| 4 | Untested deployment | Shipping without unit tests | Execute `@web/test-runner` in the build pipeline |
| 5 | Silent compiler fail | Swallowing ts/eslint errors | Let Rollup exit with status code 1 on errors |
| 6 | Missing Rollup decorator flags | `@rollup/plugin-typescript` with default options — silently strips Lit `@property`/`@state` decorators | Instantiate plugin with `compilerOptions: { experimentalDecorators: true, useDefineForClassFields: false }` — see HIGH-02 |
| 7 | `output.format: 'es'` in Rollup | HA does not load ES modules directly from HACS resources | Always use `format: 'iife'` |

---

## Test Case Specifications

| Test ID | Type | Description | Input | Expected Output |
|---|---|---|---|---|
| TC-101 | Unit | Build succeeds cleanly | `npm run build` | Exit code 0, `dist/sci-fi.min.js` created |
| TC-102 | Unit | Build dev has sourcemaps | `npm run build:dev` | `` exists |
| TC-103 | Unit | Strict Typecheck passes | `npm run typecheck` | Exit code 0, zero type errors |
| TC-104 | Unit | Strict Lint passes | `npm run lint` | Exit code 0, zero lint warnings |
| TC-105 | Unit | HACS manifest is valid | `hacs.json` present | HACS validate workflow passes |
| IT-101 | Integration | CI runner runs the complete checks | Push to branch `v2` | GitHub Action passes successfully |
| IT-102 | Integration | Dev container mounts and compiles | VS Code container open | Full Node/Docker compiler mounts |
| IT-103 | Integration | Dev server serves active minified bundle | `npm run start` | `http://localhost:5000/sci-fi.min.js` returns 200 |

---

## Error Handling

| Error | Detection | Response | Fallback |
|---|---|---|---|
| TypeScript compilation error | Compiler stdout | Rollup aborts build immediately | Exit code 1, print detailed type error trace |
| ESLint validation warning | Linter output | CI blocks pull requests | Reject commit, block merge until warnings resolved |
| Browser test failure | Test runner stdout | Exit code 1 | CI fails, print spec trace in browser logs |
