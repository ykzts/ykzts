## Summary

<!-- What changed and why? Lead with the problem or goal, then the approach. -->

## Related issues

<!-- e.g. Fixes #123 / Closes #123. Leave blank if none. -->

## Type of change

<!-- Mark all that apply with [x]. -->

- [ ] `feat` — new feature
- [ ] `fix` — bug fix
- [ ] `docs` — documentation only
- [ ] `refactor` — no behavior change
- [ ] `test` — tests only
- [ ] `chore` / `ci` / `perf` / `style` — maintenance or tooling
- [ ] Breaking change

## How to test

<!-- Steps for reviewers. Include commands, UI paths, or env notes when useful. -->

1.
2.

## Checklist

- [ ] PR title follows Conventional Commits (`type(scope): subject`)
- [ ] Changes are focused on a single concern
- [ ] `pnpm check` passes (or will pass in CI)
- [ ] Tests added/updated when behavior changes (`pnpm test`)
- [ ] Docs updated when user-facing behavior or setup changes
- [ ] No secrets or credentials in the diff
- [ ] Supabase migrations tested locally when schema changes (`npx supabase db reset --local` or equivalent)

## Notes for reviewers

<!-- Optional: trade-offs, follow-ups, screenshots, or areas that need extra attention. -->
