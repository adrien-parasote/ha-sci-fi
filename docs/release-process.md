# 🛸 Release Process — ha-sci-fi

> **Prerequisites:** Local tests and workbench validation already completed (ADR-007).
> The git working tree must be clean before starting.

---

## Trigger

**Everything is delegated to the agent.** Just say:

> *"Release vX.Y.Z"*

The agent runs all steps below in order.

---

## Step 1 — Versioning & Changelog

### 1a. `package.json`

The target version is provided in the prompt. The agent updates the `"version"` field following SemVer.

### 1b. `CHANGELOG.md`

The agent reads the git commits on the current branch since the last tag, categorizes them by type (`feat`, `fix`, `refactor`, `docs`...) and generates the formatted entry inserted at the top of the file.

Expected output format:

```markdown
# [X.Y.Z](https://github.com/adrien-parasote/ha-sci-fi/releases/tag/X.Y.Z) - YYYY-MM-DD

## 🆕 What's New
- ...

## 💫 Enhancements
- ...

## 🐛 Fixes
- ...

## 🛠️ Technical
- ...
```

---

## Step 2 — Merge Branch to Main

If the work was done on a feature/release branch, the agent merges it into `main` before building.

```bash
git checkout main
git merge --no-ff <branch-name> -m "chore(release): merge <branch-name> into main for vX.Y.Z"
```

> If already on `main`, this step is skipped.

---

## Step 3 — Production Build

The agent runs:

```bash
# 1. Type check (Vitest does NOT typecheck)
npx tsc --noEmit

# 2. Full test suite — must be 100% green before building
npx vitest run

# 3. Production bundle
npm run build
```

This generates `dist/sci-fi.min.js` with the exact signature of version `X.Y.Z`.

---

## Step 4 — Commit, Tag & Push (`ha-sci-fi`)

The agent runs:

```bash
git add package.json CHANGELOG.md dist/sci-fi.min.js
./scripts/sc-commit.sh "chore(release): bump version to vX.Y.Z"
git tag vX.Y.Z
git push origin main
git push origin vX.Y.Z
```

HACS automatically detects the new release from the GitHub tag.

---

## Step 5 — Create Draft Release on GitHub

The agent calls the GitHub API using the `GITHUB_TOKEN` from `.env`.

### Release Naming Rules

| Rule | Example |
|------|---------|
| **Major/minor release** (`X.Y.0`) | Title = thematic name + icons from `Release-plan.md` → `"Bridge Overview 🛸🎛️"` |
| **Patch release** (`X.Y.Z`, Z > 0) | Title = same thematic name as the `X.Y.0` release → `"Bridge Overview 🛸🎛️"` |
| **Body content** | Always accumulates **all** changelogs since `X.Y.0` inclusive. `1.2.2` body = changelog of `1.2.2` + `1.2.1` + `1.2.0`. |

To find the thematic name for a patch: read `Release-plan.md` and match the `X.Y` minor version entry.

```bash
source .env
curl -s -X POST \
  -H "Authorization: Bearer $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/adrien-parasote/ha-sci-fi/releases \
  -d "$(jq -n \
    --arg tag 'vX.Y.Z' \
    --arg name '<Thematic name + icons>' \
    --arg body '<Accumulated CHANGELOG from X.Y.0 to X.Y.Z>' \
    '{tag_name: $tag, name: $name, body: $body, draft: true}')" 
```

> Publishing the release (`"draft": false`) makes it visible to HACS users.
> Publish only after validating in real conditions if needed.

---

## Step 6 — Update the Wiki (`ha-sci-fi-wiki`)

The agent reads `../ha-sci-fi-wiki/Release-plan.md`, checks the matching line (`- [ ]` → `- [x]`), moves it from `## 🛸 Next` to `## 🚀 Launched`, then commits and pushes to `origin/master`.

```bash
cd ../ha-sci-fi-wiki
git add Release-plan.md
git commit -m "docs(wiki): check vX.Y.Z as launched in release plan"
git push origin master
```

---

## Summary

| Step | Who | Action |
|------|-----|--------|
| 1a | **Agent** | Receives version from prompt → updates `package.json` |
| 1b | **Agent** | Reads commits since last tag → inserts entry into `CHANGELOG.md` |
| 2 | **Agent** | If on a branch: `git checkout main && git merge --no-ff <branch>` |
| 3 | **Agent** | `npm run build` |
| 4 | **Agent** | `git add` + `sc-commit.sh` + `git tag` + `git push` |
| 5 | **Agent** | GitHub API call → draft release with CHANGELOG body |
| 6 | **Agent** | Checks + moves line in `Release-plan.md`, commit + push wiki |
