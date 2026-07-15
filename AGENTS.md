# AI Agent Instructions

This repository is a monorepo containing the personal website and blog of Yamagishi Kazutoshi (@ykzts), a Japanese software developer specializing in full-stack web applications.

**Important note for AI agents**: Before making changes involving auth, data, secrets, or cross-app concerns, read [docs/architecture.md](docs/architecture.md) for the overall architecture and the internal skill [skills/repo-security](skills/repo-security/SKILL.md) (`/repo-security`) for the canonical security model (CSP, secrets, RLS, service role, draft/cron/revalidate).

**Workflow skills** (prefer these over inventing process):

- [skills/create-pr](skills/create-pr/SKILL.md) (`/create-pr`) — feature branches, Conventional Commits, `Assisted-by` trailer, push, PR
- [skills/local-dev](skills/local-dev/SKILL.md) (`/local-dev`) — install, Supabase, env, ports, `pnpm dev` / test / build
- [skills/repo-security](skills/repo-security/SKILL.md) (`/repo-security`) — security model

See [docs/architecture.md](docs/architecture.md) for the detailed repository structure and architecture.

## Technology Stack

- **Package Manager**: pnpm
- **Build System**: Turbo (monorepo build orchestration)
- **Language**: TypeScript (modern/strict configuration)
- **Frontend Frameworks**:
  - Next.js (portfolio, blog, and blog-legacy redirector)
  - React 19 across all applications
- **Content Management**: Supabase (PostgreSQL database with Dashboard)
- **Styling**: CSS Modules, modern CSS features
- **Linting/Formatting**: Biome (replaces ESLint + Prettier)

## Code Style and Standards

### Biome Configuration
- **Quotes**: Single quotes for JavaScript/CSS
- **Semicolons**: As needed (ASI-safe)
- **Trailing Commas**: None
- **Formatting**: Uses .editorconfig
- **Import Sorting**: Enabled with sorted attributes/keys/properties
- **CSS**: CSS Modules support, single quotes

### TypeScript Guidelines
- Use strict TypeScript configuration
- Prefer type imports (`import type`)
- Use modern ESM syntax (`"type": "module"`)
- Leverage Next.js and React 19 features

### React Guidelines
- Use React 19 features (modern JSX transform, React Compiler)
- Prefer function components with hooks
- Use Next.js App Router conventions
- CSS Modules for component styling

## Development Workflow

### Always-on rules
- Use `pnpm` exclusively (not npm/yarn); `workspace:*` for internal packages; install from root
- **Feature branch first** — never commit directly to `main` (details: `/create-pr`)
- **Conventional Commits** for subjects and PR titles; AI commits use `Assisted-by` trailer (`/create-pr`)
- Run `pnpm check` before committing when code changed

### Common commands
(See `/local-dev` for bootstrap, ports, env, and troubleshooting.)

- `pnpm install` — install dependencies
- `pnpm dev` — development servers
- `pnpm build` — build all
- `pnpm check` / `pnpm fix` — Biome via Ultracite
- `pnpm typegen` — generate TypeScript types
- `pnpm test` / `pnpm validate` — tests and validation

### Turbo
- Tasks are orchestrated through Turbo
- `dev` is persistent with cache disabled

## Content and Localization

- Primary language: Japanese.
- Content focus: technical blog posts and portfolio projects by Yamagishi Kazutoshi (@ykzts).
- See the apps and `profile/` package for actual content.

## Deployment and Infrastructure (high-level)

See [docs/architecture.md](docs/architecture.md) for the authoritative overview.

Summary:
- Vercel hosting. `portfolio` + `blog` use Vercel Microfrontends (single `ykzts.com` origin).
- `admin`, `memo`, `blog-legacy` are standalone.
- Content in Supabase. Secrets managed per Vercel project + local `.env` files (`/repo-security`, `/local-dev`).

## Best Practices for Contributors

1. **Branching first** — `/create-pr`; never commit to `main`
2. **Commit messages** — Conventional Commits; `/create-pr`
3. **Formatting** — `pnpm check` before committing
4. **Dependencies** — add to the appropriate workspace package
5. **TypeScript** — strict types, proper imports
6. **React** — React 19 and Next.js App Router patterns
7. **Performance** — image optimization, bundle size
8. **Accessibility** — semantic HTML and ARIA labels
9. **Internationalization** — respect Japanese content and formatting
10. **Local setup** — `/local-dev` when env or servers are involved

## File Naming Conventions

- Components: PascalCase (`MyComponent.tsx`)
- Pages: kebab-case or Next.js conventions
- Styles: `component.module.css` for CSS Modules
- Types: Descriptive names, use `type` imports
- Content: ISO date prefixes for blog posts

## Environment and Configuration

- **Node.js**: Version 24
- **Package Manager**: pnpm
- **Editor**: VSCode configuration included
- **Git**: Main branch, proper ignore files
- **CI/CD**: GitHub Actions with Node.js workflow
- **Local env / Supabase**: `/local-dev`
