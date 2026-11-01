# Spec 01 — Infrastructure & Tooling

> Document Type: Implementation
> Covers: Step 1 (Infra) from [MASTER.md](../MASTER.md#spec-gate-pre-checklist)
> Branch: `v2`

---

## Blueprint Coverage

| Feature ID | Description | Covered here | Covers |
|---|---|---|---|
| F-INFRA-01 | TypeScript 5.x strict setup | ✅ `tsconfig.json` | tests/infrastructure.test.ts :: TC-103 |
| F-INFRA-02 | Rollup 4 build pipeline | ✅ `rollup.config.mjs` | tests/infrastructure.test.ts :: TC-101, TC-102 |
| F-INFRA-03 | Automated dev server | ⬜ not delivered — pas de serveur de dev dédié : `npm run dev` est `rollup -c --watch` et sert `dev/workbench.html` (aucun `vite.config*` dans le dépôt) | ⬜ aucun cas de test — le cas d'intégration qui le couvrait a été retiré le 2026-08-12 (bead `ha-sci-fi-9xf`, note sous § Test Case Specifications) ; son id n'est pas réécrit ici, P14 le lirait comme une promesse à tenir |
| F-INFRA-04 | Test runner automatisé | ✅ `vitest` + `happy-dom` | ⬜ aucun cas de test — le runner est le moyen des TC, pas leur objet |
| F-INFRA-05 | ESLint TypeScript strict | ✅ `eslint.config.mjs` — configuration **plate** (ESLint 9) ; mesuré le 2026-11-01 : aucun `.eslintrc*` dans le dépôt, la ligne en nommait un | tests/infrastructure.test.ts :: TC-104 |
| F-INFRA-06 | DevContainer HA dev instance | ⬜ not delivered — `.devcontainer/` n'existe pas dans le dépôt | ⬜ aucun cas de test — le cas d'intégration qui le couvrait a été retiré le 2026-08-12 (bead `ha-sci-fi-9xf`, note sous § Test Case Specifications) ; son id n'est pas réécrit ici, P14 le lirait comme une promesse à tenir |
| F-INFRA-07 | GitHub Actions CI | ✅ `.github/workflows/ci.yml` | tests/infrastructure.test.ts :: IT-101 |
| F-INFRA-08 | HACS validation CI | ✅ `hacs.json` | tests/sci-fi.test.ts :: TC-105 |

---

## File Tree

```
./
├── tsconfig.json                   [NEW] TypeScript config
├── eslint.config.mjs               [NEW] ESLint flat config (ESLint 9)
├── vitest.config.ts                [NEW] Vitest runner config
├── tests/setup.ts                  [NEW] Vitest global setup (mocks, silence warnings)
├── rollup.config.mjs               [MODIFY] Rollup 4 build config
├── package.json                    [MODIFY] dependency upgrades
├── hacs.json                       [MODIFY] HACS card integration metadata
├── .github/workflows/ci.yml        [NEW] GitHub Actions CI pipeline
```

> Les deux entrées `.devcontainer/` ont été retirées de cet arbre le 2026-11-01 :
> elles portaient `[NEW]` alors que F-INFRA-06, deux tables plus haut, dit que le
> dossier n'existe pas. Un arbre de fichiers est lu comme un inventaire du livré,
> et il contredisait sa propre Blueprint Coverage. À réintroduire avec l'outillage,
> en même temps que F-INFRA-06.

---

## Assumptions

| ID | Assumption | Risk | Validation |
|---|---|---|---|
| 1 | TypeScript 5.x is compatible with our dependencies | Low | → Run `npm info typescript` and `npm run typecheck` |
| 2 | Rollup 4 builds standalone IIFE bundles | Medium | → Run `npm run build` and inspect `dist/sci-fi.min.js` |
| 3 | `vitest` with `happy-dom` correctly simulates Home Assistant DOM | High | → Run `npm test` to verify DOM interacts correctly |

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

 ### Public Interface
| Element | Consumed by | Description |
|---|---|---|
| `npm run build` | Developer / CI | Build production single-file bundle |
| `npm run typecheck` | Developer / CI | Perform strict TypeScript static checks |
| `npm test` | Developer / CI | Execute Vitest happy-dom tests |
| `npm run lint` | Developer / CI | ESLint sur `src/**/*.ts` et `tests/**/*.ts`, sous le budget de TC-104 |
| `dist/sci-fi.min.js.map` | Browser | Source map du build de développement (`sourcemap: dev` dans `rollup.config.mjs`) |

> **Les trois dernières lignes de cette table ont été réécrites le 2026-11-01.**
> Deux étaient vides en colonne « Element » — « Source map for debugging » et
> « Shared editor styles » — donc ne nommaient aucune interface. La seconde
> renvoyait de toute façon à `src/styles/editor-common.ts`, qui est produit par la
> [spec 03](./03_base_classes.md#cross-spec-contracts) et non par celle-ci : elle
> est supprimée plutôt que complétée. La troisième était une énumération générée
> (`Constraints`, `DOMException`, `Error`, `Map`, `TypeError`…) mêlant des types du
> langage à `Floor` et `PlugEntity`, dont aucun n'est exporté par cette spec.

---

## Anti-Patterns

| # | Anti-Pattern | Violation | Correct Behavior |
|---|---|---|---|
| 1 | Hardcoded swap script | `npm run build` copies environment files | Use `@rollup/plugin-replace` for environment constants |
| 2 | Permissive compiler | `"strict": false` | Set `"strict": true` in `tsconfig.json` |
| 3 | EOL dev server | Using `es-dev-server` | Use `npm run dev` (`rollup -c --watch`), which serves `dev/workbench.html` — mesuré le 2026-11-01 : aucun `vite.config*` dans le dépôt, cf. F-INFRA-03 |
| 4 | Untested deployment | Shipping without unit tests | Execute `vitest` in the build pipeline |
| 5 | Silent compiler fail | Swallowing ts/eslint errors | Let Rollup exit with status code 1 on errors |
| 6 | Missing Rollup decorator flags | `@rollup/plugin-typescript` with default options — silently strips Lit `@property`/`@state` decorators | Instantiate plugin with `compilerOptions: { experimentalDecorators: true, useDefineForClassFields: false }` — see HIGH-02 |
| 7 | `output.format: 'es'` in Rollup | HA does not load ES modules directly from HACS resources | Always use `format: 'iife'` |

---

## Test Case Specifications

| Test ID | Type | Description | Input | Expected Output |
|---|---|---|---|---|
| TC-101 | Unit | Build succeeds cleanly | `npm run build` | Exit code 0, `dist/sci-fi.min.js` created |
| TC-102 | Unit | Build dev has sourcemaps | `npm run build:dev` | `rollup.config.mjs` dérive `dev` de `process.env.NODE_ENV !== 'production'` et passe `sourcemap: dev`, et `build:dev` pose `NODE_ENV:development` — donc `dist/sci-fi.min.js.map` est émis par ce build et pas par `build`. Le cas lit la configuration, il ne lance pas rollup |
| TC-103 | Unit | Strict Typecheck passes | `npm run typecheck` | Exit code 0, zero type errors |
| TC-104 | Unit | Le script de lint couvre `src/` et `tests/`, sous un budget déclaré | `package.json` | `scripts.lint` appelle `eslint` sur `src/**/*.ts` **et** `tests/**/*.ts`. Le cas lit le script ; il ne lance pas ESLint |
| TC-105 | Unit | HACS manifest is valid | `hacs.json` present | HACS validate workflow passes |
| IT-101 | Integration | CI runner runs the complete checks | Push to branch `v2` | GitHub Action passes successfully |

> **Retirées le 2026-08-12** (bead `ha-sci-fi-9xf`) — les deux lignes d'intégration 102 et
> 103 : *Dev container mounts and compiles* et *Dev server serves active minified bundle
> (`npm run start`)*. (Les identifiants ne sont pas réécrits ici : le contrôle de
> couverture P14 lit tout ID présent dans une spec comme une promesse à tenir.)
> Ni `.devcontainer/` ni le script `start` n'existent dans ce dépôt : les deux lignes
> promettaient un outillage qui n'a jamais été mis en place. Le serveur de développement
> passe par `npm run dev` et sert `dev/workbench.html`. À réintroduire avec l'outillage
> le jour où il arrive, pas avant.

---

## Budget de lint

TC-104 exigeait « Exit code 0, zero lint warnings » jusqu'au 2026-11-01. C'était
faux dans les deux sens, et c'est la spec qui avait tort :

- `npm run lint` est `eslint --max-warnings 166` : le projet **autorise** 166
  avertissements, il n'en exige pas zéro ;
- le compte réel est exactement **166**, tous dans `src/` (mesuré le 2026-11-01 ;
  `tests/` en porte zéro) — donc le gate passe **à marge nulle** : un seul
  avertissement de plus casse la CI, où qu'il naisse ;
- et le cas de test qui porte TC-104 ne compte rien du tout : il vérifie que le
  script couvre `src/` et `tests/`. Une exigence que rien ne mesure n'est pas une
  exigence.

Les 166 se répartissent en deux règles, et aucune n'est du bruit :

| Règle | Compte | Ce que c'est |
|---|---|---|
| `@typescript-eslint/no-explicit-any` | 122 | La dette de typage, dont celle du socle que l'AP#3 de la [spec 02](./02_domain_selectors.md#anti-patterns) nomme |
| `@typescript-eslint/no-non-null-assertion` | 44 | Les `!` d'accès, essentiellement sur `shadowRoot` et les lookups de registre |

**Le budget est un plafond qui descend, jamais un quota à remplir.** Il se baisse
quand une dette est payée ; il ne se relève pas pour faire passer un lot. Un lot
qui ajouterait un `any` paie d'abord ailleurs. Le jour où le compte tombe à zéro,
`--max-warnings 0` remplace le nombre et cette section disparaît.

---

## Error Handling

| Error | Detection | Response | Fallback |
|---|---|---|---|
| TypeScript compilation error | Compiler stdout | Rollup aborts build immediately | Exit code 1, print detailed type error trace |
| ESLint warning au-delà du budget | `eslint --max-warnings 166` sort en 1 | CI bloque la pull request | Le build échoue ; sous le budget, les avertissements passent (cf. § Budget de lint) |
| Browser test failure | Test runner stdout | Exit code 1 | CI fails, print spec trace in vitest logs |
