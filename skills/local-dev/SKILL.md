---
name: local-dev
description: >
  Bootstrap and run this monorepo locally: Node/pnpm, Supabase, env files,
  ports, Turbo dev/build/test, and common troubleshooting. Use when the user
  asks to set up the environment, start dev servers, configure .env, run
  supabase start, fix local setup, or runs /local-dev.
---

# Local development

Canonical **agent** workflow for installing, configuring, and running the
ykzts monorepo on a developer machine. Human-oriented prose and PR/migration
CI details also live in `CONTRIBUTING.md`. Prefer this skill for step-by-step
local bootstrap and day-to-day commands.

Secrets and trust boundaries: `skills/repo-security` (`/repo-security`).
Architecture overview: `docs/architecture.md`.

## Prerequisites

| Requirement | Notes |
| --- | --- |
| **Node.js** | **24** (see `AGENTS.md` / project tooling) |
| **pnpm** | Via Corepack or install; repo `packageManager` pins the version |
| **Docker** | Required for local Supabase |
| **jq** | Required by `scripts/setup-env.sh` |
| **Supabase CLI** | `supabase` on PATH, or `npx supabase` |

Use **pnpm only** (not npm/yarn). Install from the **repository root**.

```bash
node --version    # expect v24.x
pnpm --version
docker info       # daemon must be running for Supabase
```

## Bootstrap (first time or clean machine)

Run from the repository root:

1. **Install dependencies**

```bash
pnpm install
```

`prepare` installs lefthook git hooks when possible.

2. **Start local Supabase** (needed for admin, portfolio, blog, memo data paths)

```bash
npx supabase start
# or: supabase start
```

- Applies migrations automatically
- Prints API URL and keys

Typical local endpoints (confirm with `npx supabase status`):

| Service | URL |
| --- | --- |
| API | `http://127.0.0.1:54321` |
| Database | `postgresql://postgres:postgres@127.0.0.1:54322/postgres` |
| Studio | `http://127.0.0.1:54323` |

Useful commands:

```bash
npx supabase status
npx supabase stop
npx supabase db reset --local    # wipe + reapply migrations + seed
npx supabase migration up        # pending migrations only (no full reset)
```

3. **Generate app `.env` files from local Supabase**

```bash
./scripts/setup-env.sh
# non-interactive overwrite: ./scripts/setup-env.sh -f
```

This fills Supabase URL / anon / service-role into each app that has
`.env.example`. **Other secrets** (cron, draft, revalidate, Resend, etc.) still
come from each app's `.env.example` — copy or set manually.

4. **Start development servers**

```bash
pnpm dev
```

Turbo runs app `dev` tasks (persistent, cache disabled).

5. **Optional verification**

```bash
pnpm check
pnpm typegen
pnpm test
pnpm build
```

## Dev server ports

| App | Package | Port / entry | Role |
| --- | --- | --- | --- |
| **portfolio** | `@ykzts/portfolio` | **3000** (microfrontends shell) | Public site; hosts blog routes in composition |
| **blog** | `@ykzts/blog` | **3001** (microfrontends local) | Blog + `/api/blog/*`; composed under portfolio |
| **admin** | `@ykzts/admin` | **3100** | CMS (`http://localhost:3100/admin`) |
| **memo** | `@ykzts/memo` | **3101** | Memos (standalone) |
| **blog-legacy** | `@ykzts/blog-legacy` | **3102** | Legacy 301 redirector |

Microfrontends: `apps/portfolio/microfrontends.json` — local portfolio **3000**,
blog **3001**. In dev, use the portfolio origin for integrated `/blog` paths
when the MFE proxy is up; blog alone still listens on 3001.

Admin revalidate allowlist example (local):

```text
REVALIDATE_URLS=http://localhost:3001/api/blog/revalidate,http://localhost:3000/api/revalidate
```

(see `apps/admin/.env.example`)

Filter a single app when needed:

```bash
pnpm --filter @ykzts/admin dev
pnpm --filter @ykzts/portfolio dev
pnpm --filter @ykzts/blog dev
```

## Environment files

| App | `.env.example` | Notes |
| --- | --- | --- |
| admin | yes | Supabase + service role, `REVALIDATE_*`, `CRON_SECRET`, `DRAFT_SECRET` |
| blog | yes | Supabase + service role, revalidate, cron, draft |
| portfolio | yes | Supabase anon, revalidate, Resend / mail |
| memo | yes | Supabase URL + anon only (minimal) |
| blog-legacy | no | No secrets |

After `setup-env.sh`, ensure capability secrets are set for the apps you run
(admin/blog at minimum for full CMS → publish/preview flows). Never commit
`.env` / `.env.local`. See `/repo-security` for variable meanings.

`NEXT_PUBLIC_SITE_ORIGIN` in examples may show a placeholder host; for local
MFE work, align with the portfolio dev origin (typically `http://localhost:3000`)
when testing absolute URLs.

## Common monorepo commands

All from repo root unless noted:

| Command | Purpose |
| --- | --- |
| `pnpm install` | Install workspace deps |
| `pnpm dev` | All app dev servers (Turbo) |
| `pnpm build` | Build all |
| `pnpm check` | Ultracite/Biome lint + format check |
| `pnpm fix` | Auto-fix lint/format |
| `pnpm test` | Vitest (Turbo) |
| `pnpm test:a11y` | Playwright a11y (where configured, e.g. portfolio) |
| `pnpm typegen` | Generate types (incl. Supabase) |
| `pnpm typecheck` | TypeScript check |
| `pnpm validate` | Validation tasks |
| `pnpm lighthouse` | Lighthouse (portfolio pipeline) |

Package-scoped:

```bash
pnpm --filter @ykzts/portfolio test
pnpm --filter @ykzts/blog test
```

## Local database / types workflow

After changing SQL under `supabase/migrations/`:

```bash
npx supabase db reset --local   # or migration up
pnpm typegen
```

Commit regenerated types under `packages/supabase/` when they change.
New tables need RLS + policies + GRANTs — follow `/repo-security`.

Production migration deploy is CI-only after merge; see `CONTRIBUTING.md`.

## App quick map (what needs what)

| App | Needs Supabase local? | Auth | Notes |
| --- | --- | --- | --- |
| portfolio | Yes (content) | No (public) | MFE shell; contact form needs Resend vars to send mail |
| blog | Yes | Draft via secret link | Cron/draft/revalidate secrets for those features |
| admin | Yes | Supabase Auth | Full CMS; revalidate URLs must point at local blog/portfolio |
| memo | Yes | Auth for edit/private | Minimal env |
| blog-legacy | No | No | Redirects only |

Per-app detail: `apps/*/README.md`.

## Troubleshooting

**`setup-env.sh` fails: Supabase not running**

```bash
npx supabase start
npx supabase status -o json
./scripts/setup-env.sh -f
```

**`jq: command not found`** — install jq; required by setup-env.

**Docker / Supabase won't start** — ensure Docker daemon is up; free ports
54321–54323 (and DB 54322).

**App can't read data / auth broken** — confirm `.env` has local URL and keys
from `supabase status`, not production placeholders; restart `pnpm dev` after
env changes.

**Revalidate from admin does nothing** — check `REVALIDATE_SECRET` matches
blog/portfolio and `REVALIDATE_URLS` uses the ports above.

**Types out of date** — `pnpm typegen` after migrations; commit
`packages/supabase` type outputs if required by the change.

**Port already in use** — stop the other process or run a single app with
`pnpm --filter ... dev`.

**Hooks / commitlint failed** — use Conventional Commits; see `/create-pr`.
Do not use `--no-verify` to silence failures unless the user explicitly asks.

**pnpm install rejects a package** — workspace may enforce `minimumReleaseAge`
(see `pnpm-workspace.yaml` / `CONTRIBUTING.md`).

## Related

- Git / commits / PRs: `skills/create-pr` (`/create-pr`)
- Security model: `skills/repo-security` (`/repo-security`)
- Architecture: `docs/architecture.md`
- Human guide: `CONTRIBUTING.md`
