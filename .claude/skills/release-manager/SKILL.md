---
name: release-manager
description: Trigger whenever the user wants to release a new version or merge a release branch for the project. Handles version bumping, changelog generation, branch merging with GitHub issue closure, tagging, and updating the wiki. Use this whenever the user says "release version X", "publish a new release", "merge and release", etc.
---

# Release Manager Skill

This skill automates the entire release process for `ha-sci-fi`.

## Prerequisites
- The git working tree MUST be clean before starting.
- Ensure all local tests and workbench validation have passed (ADR-007).

## Execution Steps

Always execute the following steps in order.

### Step 1 — Input Collection & Verification
⛔ **MANDATORY STOP**: You must explicitly ask the user for the following information before proceeding to any other step. Do NOT guess or proceed without explicit user confirmation for:
1. **Target Version**: The exact SemVer version (e.g., `1.4.0`).
2. **Branch**: The branch to merge. Even if you detect the current branch, ask the user to confirm it.
3. **Linked Issues**: Which feature requests or bugs this release closes (e.g., `#43`). Even if the branch name contains an issue number, you MUST ask the user to confirm if it should be closed.

Present a summary of these 3 points to the user and **wait for their explicit approval** before moving to Step 2.

### Step 2 — Merge Branch to Main & Close Issues
If the user specified a branch, you MUST merge it into `main` FIRST.
```bash
git checkout main
git merge --no-ff <branch-name> -m "chore(release): merge <branch-name> into main for X.Y.Z. Closes #<issue-id>"
```
*Note: Include `Closes #XXX` for each linked issue to trigger GitHub's automatic issue closure. If already on `main` and no branch was specified, skip the merge.*

### Step 3 — Versioning & Changelog (Done on `main`)
Now that you are on `main` and the branch is merged:
1. **package.json**: Update the `"version"` field to the target version.
2. **CHANGELOG.md**: Read the git commits since the last tag. Categorize them (`feat`, `fix`, `refactor`, `docs`) and generate a formatted entry inserted at the top.
   *Format:*
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

### Step 4 — Commit, Tag & Push
> ⛔ **Tag convention: NO `v` prefix.** All tags use bare `X.Y.Z` (e.g. `1.3.1`), NOT `v1.3.1`. Every existing tag confirms this.

```bash
git add package.json CHANGELOG.md
cat > /tmp/commit_msg.txt << 'EOF'
chore(release): bump version to X.Y.Z
EOF
./ha-sci-fi/scripts/sc-commit.sh -F /tmp/commit_msg.txt && rm /tmp/commit_msg.txt
git tag X.Y.Z
git push origin main
git push origin X.Y.Z
```
*Pushing the tag triggers the `release.yml` GitHub Action, which builds the code and creates the release automatically.*

### Step 5 — Update the Wiki (`ha-sci-fi-wiki`)
Read `../ha-sci-fi-wiki/Release-plan.md`, check the matching line (`- [ ]` → `- [x]`), move it from `## 🛸 Next` to `## 🚀 Launched`, then commit and push to `origin/master`.
```bash
cd ../ha-sci-fi-wiki
git add Release-plan.md
cat > /tmp/commit_msg.txt << 'EOF'
docs(wiki): check X.Y.Z as launched in release plan
EOF
../ha-sci-fi/scripts/sc-commit.sh -F /tmp/commit_msg.txt && rm /tmp/commit_msg.txt
git push origin master
```
