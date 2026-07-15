---
name: create-pr
description: >
  Branch, commit (Conventional Commits + Assisted-by), push, and create a
  GitHub pull request for this repository using gh CLI and the project PR
  template. Use when the user asks to commit, create a branch, open a PR,
  submit changes for review, push and create a PR, or runs /create-pr.
---

# Git workflow, commits, and pull requests

Canonical agent workflow for **feature branches**, **commit messages**, and
**pull requests** in this monorepo. Do not commit directly to `main`. Prefer
small, focused commits and one PR per logical change.

Human-oriented contribution notes also live in `CONTRIBUTING.md` (hooks,
migration CI, review process). When rules conflict on commit/PR mechanics,
follow this skill.

## Hard rules

- Never commit or push to `main`. Never open a PR from `main`.
- Create and switch to a feature branch **before** making changes that will be committed.
- Commit subjects and PR titles use Conventional Commits: `type(scope): subject`.
- Do not force-push unless the user explicitly asks (`--force-with-lease` only).
- Do not skip the repository PR template when one exists.
- Do not discard user changes without explicit approval.
- Prefer `pnpm check` (and relevant tests) before commit/push when the tree changed meaningfully.
- Remind the user that CI must pass before merge.

---

## 1. Branch first

If already on a feature branch for this work, keep it. Otherwise:

```bash
git checkout main
git pull --ff-only origin main   # if needed
git checkout -b <type>/<scope>-<short-description>
# or, when addressing a specific issue:
git checkout -b <issue-number>/<short-description>
```

### Branch naming (aligns with Conventional Commits)

| Prefix | Use |
| --- | --- |
| `feat/` | New features |
| `fix/` | Bug fixes |
| `docs/` | Documentation |
| `refactor/` | Refactors |
| `chore/` | Tooling, config, maintenance |
| `ci/` | CI/CD |
| `perf/` | Performance |
| `test/` | Tests |
| `style/` | Formatting-only / style |

Examples:

- `docs/4015-clarify-product-architecture-security`
- `feat/portfolio-contact-form-validation`
- `fix/admin-service-role-leak`

`main` is only updated through passing, reviewed PRs. This applies to both humans and agents — including documentation-only work.

---

## 2. Commit message standards

This repository **strictly** follows [Conventional Commits](https://www.conventionalcommits.org/).
Messages are enforced by **commitlint** via the lefthook `commit-msg` hook.
Invalid subjects are rejected locally.

### Format

```
type(scope): subject
```

- **type** — required (see table below)
- **scope** — optional; use when the change is scoped to one app or package
- **subject** — imperative, concise; no trailing period

### Types

| Type | Meaning |
| --- | --- |
| `feat` | New features |
| `fix` | Bug fixes |
| `docs` | User-facing documentation |
| `chore` | Internal workflow, configuration, or maintenance |
| `refactor` | Neither fix nor feature |
| `test` | Adding or updating tests |
| `style` | Formatting, missing semicolons, etc. |
| `perf` | Performance improvements |
| `ci` | CI/CD configuration |

### Scopes

- **Apps**: `portfolio`, `blog`, `blog-legacy`, `admin`, `memo`
- **Packages**: `editor`, `layout`, `site-config`, `supabase`, `tsconfig`, `ui`, `utils`
- **Omit scope** for repository-wide changes (e.g. root docs, monorepo chore, CI)

### Examples

- `feat(portfolio): add new project showcase component`
- `fix(blog): resolve RSS feed generation issue`
- `chore: set up Copilot instructions for repository`
- `docs: update README with installation instructions`
- `refactor(portfolio): simplify component structure`

### AI-assisted provenance trailer

For commits that involved AI assistance, add a Linux Kernel-style trailer:

```
Assisted-by: <AI System>
```

Use Git trailers (do not invent custom footer formats):

```bash
git commit --trailer "Assisted-by: <AI System>" -m "feat(ui): ..."
```

Optional local alias:

```bash
git config alias.commit-ai '!git commit --trailer "Assisted-by: <AI System>"'
# then: git commit-ai -m "feat(ui): ..."
```

commitlint (conventional preset) accepts these trailers. Whether the trailer is
present is contributor discipline and review — not a hard commitlint rule.

When this agent creates a commit, include an appropriate `Assisted-by` trailer
unless the user asks to omit it.

### Committing changes

Only create commits when the user asks to commit (or explicitly asks for a full
PR flow that includes committing). Follow the repository's commit protocol:

1. Run in parallel: `git status`, `git diff`, `git log -5 --oneline` (and
   `git diff --cached` if staging is partial)
2. Stage relevant files only — never `git add .` / `git add -A` unless the user
   explicitly wants everything. Avoid secrets (`.env`, credentials)
3. Draft a Conventional Commits subject (and body if needed)
4. Commit with HEREDOC for the message; add `--trailer` for Assisted-by when applicable:

```bash
git commit --trailer "Assisted-by: Grok" -m "$(cat <<'EOF'
type(scope): subject

Optional body explaining why.
EOF
)"
```

5. Verify with `git status` after commit
6. If commitlint/hooks fail, fix the message or code and create a **new** commit
   (do not amend unless the user explicitly requests amend and HEAD was created
   by you in this conversation, not yet pushed)

Do not push unless the user asks to push or to open a PR (push is part of PR flow below).

---

## 3. Create a pull request

### Prerequisites

1. **`gh` CLI** — `gh --version`. If missing: https://cli.github.com/
2. **Auth** — `gh auth status`. If not authenticated: `gh auth login`
3. **Not on `main`** — if on `main`, stop and create/switch to a feature branch
4. **Working tree** — Prefer a clean tree. If there are uncommitted changes, ask
   whether to commit, stash, or leave them out of the PR

### Gather context

From the repository root:

```bash
git branch --show-current
git status
git remote show origin | grep 'HEAD branch'
git log origin/main..HEAD --oneline --no-decorate
git diff origin/main...HEAD --stat
```

If `origin/main` is missing, `git fetch origin` first. Use the remote default
branch when it is not `main`.

Infer:

- **Title** — Conventional Commits style (same rules as commit subjects above)
- **Related issues** — from commits/branch (`#123`, `fixes #123`)
- **Summary** — what changed and why (reviewer-facing, not a commit dump)

If title or purpose is unclear, ask the user.

### Push

```bash
git push -u origin HEAD
```

Do **not** force-push unless the user explicitly asks.

### Build the PR body

Read the repository Pull Request Template, if present. Common locations:

- `.github/PULL_REQUEST_TEMPLATE.md` / `.github/pull_request_template.md`
- `PULL_REQUEST_TEMPLATE.md` / `pull_request_template.md`
- `docs/PULL_REQUEST_TEMPLATE.md` / `docs/pull_request_template.md`
- `.github/PULL_REQUEST_TEMPLATE/*.md` / `.github/pull_request_template/*.md`

When multiple templates exist, use the one the user names, or ask. If none
exists, write a short body with summary and how to test.

Fill the template:

1. Keep every section heading from the template
2. Replace placeholders with concrete content
3. Mark applicable checklist items with `[x]`; leave unknown/N/A unchecked or note N/A
4. Link issues with `Fixes #N` / `Closes #N` when known; do not invent issue numbers
5. Prefer short, complete sentences. Lead with **why**, then **what**, then validation

Write the body under a temp directory (not the working tree; do not commit it):

```bash
tmpdir=$(mktemp -d)
body_file="$tmpdir/<change-derived-name>.md"
```

### Create the PR

```bash
GH_PAGER=cat gh pr create \
  --base main \
  --title "<conventional-commit-title>" \
  --body-file "$body_file"
```

- Override `--base` only when the user names a different base branch
- Add `--draft` when the user asks for a draft PR
- After create/edit (or on abort once the body is unused): `rm -rf "$tmpdir"`
- Return the PR URL to the user

### Existing PR on this branch

- Do not open a second PR
- Show URL: `gh pr view --json url -q .url`
- Update body only when the user asks, or when it is still unfilled template text:

```bash
GH_PAGER=cat gh pr edit --body-file "$body_file"
```

### PR hard rules (additional)

- Never ship empty or placeholder-only sections when the diff already supplies context
- Always `rm -rf "$tmpdir"` when finished

---

## Related

- Local setup / ports / env: `skills/local-dev` (`/local-dev`)
- Security-sensitive changes: `skills/repo-security` (`/repo-security`)
- Human contribution guide: `CONTRIBUTING.md`
