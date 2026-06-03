# 🛸 Release Process — ha-sci-fi

> **Prerequisites:** Local tests and workbench validation already completed (ADR-007).
> The git working tree must be clean before starting.

---

## Trigger

**Everything is delegated to the agent.** Just say:

> *"Release X.Y.Z"*

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
git merge --no-ff <branch-name> -m "chore(release): merge <branch-name> into main for X.Y.Z"
```

> If already on `main`, this step is skipped.

---

## Step 3 — Production Build (Automated)

> 🤖 **GitHub Actions now handles this automatically.**

The `release.yml` workflow will automatically run the type checks, tests, and build the production bundle (`dist/sci-fi.min.js`) once the tag is pushed to GitHub.

---

## Step 4 — Commit, Tag & Push (`ha-sci-fi`)

> ⛔ **Tag convention: NO `v` prefix.** All tags use bare `X.Y.Z` (e.g. `1.3.1`), NOT `v1.3.1`. Every existing tag confirms this: `1.2.2`, `1.2.3`, `1.3.0`. Using `v` prefix is a violation.

The agent runs:

```bash
git add package.json CHANGELOG.md
cat > /tmp/commit_msg.txt << 'EOF'
chore(release): bump version to X.Y.Z
EOF
./scripts/sc-commit.sh -F /tmp/commit_msg.txt && rm /tmp/commit_msg.txt
git tag X.Y.Z
git push origin main
git push origin X.Y.Z
```

Pushing the tag triggers the `release.yml` GitHub Action, which builds the code and creates the release automatically.

---

## Step 5 — Create Release on GitHub (Automated)

> 🤖 **GitHub Actions now handles this automatically.**

Once the tag is pushed in Step 4, the `release.yml` workflow automatically:
1. Extracts the exact release notes from `CHANGELOG.md` for the current tag.
2. Creates the GitHub Release.
3. Attaches the `dist/sci-fi.min.js` asset to the release.

The release is published automatically and becomes visible to HACS users immediately.

---

## Step 6 — Update the Wiki (`ha-sci-fi-wiki`)

The agent reads `../ha-sci-fi-wiki/Release-plan.md`, checks the matching line (`- [ ]` → `- [x]`), moves it from `## 🛸 Next` to `## 🚀 Launched`, then commits and pushes to `origin/master`.

```bash
cd ../ha-sci-fi-wiki
git add Release-plan.md
git commit -m "docs(wiki): check X.Y.Z as launched in release plan"
git push origin master
```

---

## Summary

| Step | Who | Action |
|------|-----|--------|
| 1a | **Agent** | Receives version from prompt → updates `package.json` |
| 1b | **Agent** | Reads commits since last tag → inserts entry into `CHANGELOG.md` |
| 2 | **Agent** | If on a branch: `git checkout main && git merge --no-ff <branch>` |
| 3 | **GitHub** | `npm run build` (Triggered automatically) |
| 4 | **Agent** | `git add package.json CHANGELOG.md` + `sc-commit.sh` + `git tag` + `git push` |
| 5 | **GitHub** | GitHub API call → create release with CHANGELOG body + asset |
| 6 | **Agent** | Checks + moves line in `Release-plan.md`, commit + push wiki |
