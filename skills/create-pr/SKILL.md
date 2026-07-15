---
name: create-pr
description: >
  Create a GitHub pull request for this repository using gh CLI and the
  project PR template. Use when the user asks to create a PR, open a pull
  request, submit changes for review, push and create a PR, or runs /create-pr.
---

# Create Pull Request

Create a focused GitHub pull request that follows this repository's conventions.

## Prerequisites

1. **`gh` CLI** — `gh --version`. If missing, point the user to https://cli.github.com/
2. **Auth** — `gh auth status`. If not authenticated, ask the user to run `gh auth login`
3. **Not on `main`** — `git branch --show-current`. Never open a PR from `main`. If on `main`, stop and ask for a feature branch
4. **Working tree** — Prefer a clean tree. If there are uncommitted changes, ask whether to commit, stash, or leave them out of the PR. Do not discard changes without explicit approval

## Gather context

Run these from the repository root:

```bash
git branch --show-current
git status
git remote show origin | grep 'HEAD branch'
git log origin/main..HEAD --oneline --no-decorate
git diff origin/main...HEAD --stat
```

If `origin/main` is missing, `git fetch origin` first. Use the remote default branch when it is not `main`.

Infer from branch name, commits, and diff:

- **Title** — Conventional Commits style (same as commit subjects): `type(scope): subject`
  - Types: `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `style`, `perf`, `ci`
  - Scopes: app names (`portfolio`, `blog`, `admin`, `memo`, `blog-legacy`) or package names (`editor`, `layout`, `site-config`, `supabase`, `tsconfig`, `ui`, `utils`); omit scope for repo-wide changes
- **Related issues** — `#123`, `fixes #123`, `closes #123` in commits or branch name
- **Summary** — what changed and why (reviewer-facing, not a commit dump)

If the title or purpose cannot be determined confidently, ask the user.

## Branch and push

1. Ensure commits for this PR are on the current branch
2. Push if needed:

```bash
git push -u origin HEAD
```

3. Do **not** force-push unless the user explicitly asks. Prefer `--force-with-lease` only when they request a force push after rebase

## Build the PR body

Read the repository Pull Request Template, if present. Common locations:

- `.github/PULL_REQUEST_TEMPLATE.md` / `.github/pull_request_template.md`
- `PULL_REQUEST_TEMPLATE.md` / `pull_request_template.md`
- `docs/PULL_REQUEST_TEMPLATE.md` / `docs/pull_request_template.md`
- `.github/PULL_REQUEST_TEMPLATE/*.md` / `.github/pull_request_template/*.md` (and the same under `docs/` or the repo root)

When a directory has multiple templates, use the one the user names, or ask if several apply. If none exists, write a short body with summary and how to test.

Fill the template from the diff and commits:

1. Keep every section heading from the template
2. Replace placeholders with concrete content
3. Mark applicable checklist items with `[x]`; leave unknown or not-applicable items unchecked or note N/A
4. Link issues with `Fixes #N` / `Closes #N` when known; do not invent issue numbers
5. Prefer short, complete sentences. Lead with **why**, then **what**, then validation

Write the filled body under a temp directory. Name the file so the change is obvious from the basename alone (kebab-case, derived from the PR subject — not a fixed generic name):

```bash
tmpdir=$(mktemp -d)
# e.g. "$tmpdir/add-create-pr-skill.md", "$tmpdir/fix-rss-feed-encoding.md"
body_file="$tmpdir/<change-derived-name>.md"
```

Do not leave this file in the working tree. Do not commit it.

## Create the PR

```bash
GH_PAGER=cat gh pr create \
  --base main \
  --title "<conventional-commit-title>" \
  --body-file "$body_file"
```

- Override `--base` only when the user names a different base branch
- Add `--draft` when the user asks for a draft PR
- After create/edit (or on abort once the body is no longer needed): `rm -rf "$tmpdir"`
- Return the PR URL to the user

## Existing PR on this branch

If a PR already exists for the branch:

- Do not open a second one
- Show its URL (`gh pr view --json url -q .url`)
- Update the body only when the user asks, or when it is still unfilled template text:

```bash
GH_PAGER=cat gh pr edit --body-file "$body_file"
```

## Hard rules

- Never push to `main` or open a PR from the wrong head branch
- Never skip the repository PR template when one exists
- Never force-push without explicit user approval
- Never ship empty or placeholder-only sections when the diff already supplies context
- Always `rm -rf "$tmpdir"` when finished
- Remind the user that CI must pass before merge
