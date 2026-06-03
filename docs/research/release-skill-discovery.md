# Research: Release Manager Skill Discovery

## 1. Intent Capture
The objective is to transform the existing static `release-process.md` documentation into an executable Stream Coding skill (`release-manager`). Additionally, this new skill must handle two new capabilities during the release cycle:
- Allow selecting a specific branch to merge into `main` for the release.
- Automatically close linked Feature Requests and Bugs associated with that branch.

## 2. Existing Landscape & Methodology
- **Current Process (`docs/release-process.md`)**: Defines 6 steps, largely manual git and bash commands, with reliance on GitHub Actions for the build step. 
- **Skill Pattern (`skill-creator`)**: A skill in SC consists of a `SKILL.md` (with YAML frontmatter) and optional `scripts/` or `references/`. Converting the markdown guide into an executable skill means writing instructions the agent can parse and execute autonomously when the user types a trigger like *"Release 1.4.0 from branch feat/43-add-widget"*.

## 3. Handling Branch Merging & Issue Closing
### The Challenge
When a branch is merged locally and pushed, GitHub can automatically close linked issues if the commit message contains specific keywords (e.g., `Closes #123`, `Fixes #456`). Since the `gh` CLI isn't installed locally in the environment, we must rely on git commit messages to trigger GitHub's native issue closure.

### Proposed Solution
1. **Branch Selection**: The skill will parse the user's prompt to identify the target branch (or use the currently checked-out branch).
2. **Issue Extraction**: 
    - The skill will attempt to extract the issue number from the branch name (e.g., `issue-43-fix` -> `#43`).
    - If the branch name doesn't contain an issue number, the skill will explicitly ask the user for any issues that should be closed before proceeding.
3. **Merge Commit Crafting**: The skill will craft a merge commit message that includes the closing keywords.
   ```bash
   git merge --no-ff <branch-name> -m "chore(release): merge <branch-name> into main for X.Y.Z. Closes #<issue-id>"
   ```

## 4. Adopt/Adapt/Build Decision
**Decision: ADAPT**
We will adapt the existing `release-process.md` into `.agents/skills/release-manager/SKILL.md`.

### Proposed Skill Structure
```
.agents/skills/release-manager/
├── SKILL.md
```
- **Frontmatter**: `name: release-manager`, `description: Trigger when the user wants to release a new version. Handles version bumping, changelog generation, branch merging with issue closure, tagging, and wiki updates.`
- **Body**: The 6 steps from `release-process.md`, updated to include the branch and issue closure logic.

## 5. Next Steps
Move to the **STRATEGY** phase to align on the exact skill boundaries, or jump straight to the **SPEC** phase to define the `SKILL.md` architecture and validate it via `spec-gate`.
