# Implementation Plan: CI/CD Automation & Automated Releases

## Goal Description
Automate the release process for the `ha-sci-fi` project using GitHub Actions, based on "Option A". This means the automated workflow will trigger when a new Git tag is pushed. We will also implement automated dependency updates (Dependabot) and security scanning (CodeQL). The existing manual release process documented in `release-process.md` will be updated to reflect this new division of labor between the Agent and GitHub Actions.

## Proposed Changes

### GitHub Actions (Workflows & Config)
#### [NEW] `.github/workflows/release.yml`
- **Trigger**: `on: push: tags: ['*.*.*']`
- **Steps**:
  1. Checkout code.
  2. Setup Node 20 & install dependencies (`npm ci`).
  3. Run Typecheck & Tests to ensure the tagged commit is stable.
  4. Build production bundle (`npm run build`).
  5. Extract changelog for the specific version using `sed` (same logic as before).
  6. Read `Release-plan.md` to get the thematic title.
  7. Create a GitHub Release using `gh release create`, attaching `dist/sci-fi.min.js` and the extracted release notes.

#### [NEW] `.github/dependabot.yml`
- **Configuration**:
  - `package-ecosystem: "npm"`
  - `directory: "/"`
  - `schedule: { interval: "weekly" }`
  - Target: Keep dependencies secure and updated automatically via PRs.

#### [NEW] `.github/workflows/codeql.yml`
- **Trigger**: `push` on `main`, `pull_request` on `main`, and scheduled weekly.
- **Steps**: Initialize CodeQL, analyze javascript/typescript codebase for security vulnerabilities.

### Documentation Updates
#### [MODIFY] `docs/release-process.md`
- **Step 3 (Production Build)**: Remove manual build instructions. Mention that GitHub Actions will handle the build automatically.
- **Step 4 (Commit, Tag & Push)**: Keep as is. The agent pushes the tag which triggers the release workflow.
- **Step 5 (Create Draft Release)**: Remove curl command. Replace with a note saying: "GitHub Actions automatically creates the release and attaches the build asset when the tag is pushed."
- **Step 6 (Wiki Update)**: Keep as is.

## User Review Required
> [!IMPORTANT]
> The automated release action will require `GITHUB_TOKEN` to have write permissions for "Contents" to create releases. Ensure your repository settings under **Settings > Actions > General > Workflow permissions** are set to **Read and write permissions**.

## Verification Plan

### Manual Verification
1. Review the generated `.github` workflow files.
2. Ensure the modifications in `docs/release-process.md` clearly redefine the Agent's role vs GitHub's role.
3. Once implemented, a test release (e.g., a mock tag or next minor version) can be performed to observe the workflow in action.
