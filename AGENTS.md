# AI Agent Instructions

This repository is a monorepo containing the personal website and blog of Yamagishi Kazutoshi (@ykzts), a Japanese software developer specializing in full-stack web applications.

**Important note for AI agents**: Before making changes involving auth, data, secrets, or cross-app concerns, read [docs/architecture.md](docs/architecture.md) for the overall architecture and [docs/security.md](docs/security.md) for security implementation details.

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

### Package Management
- Use `pnpm` exclusively (not npm/yarn)
- Workspace packages use `workspace:*` for internal dependencies
- Install dependencies from root: `pnpm install`

### Build System
- `pnpm build` - Build all applications
- `pnpm dev` - Start development servers
- `pnpm check` - Run Biome linting/formatting
- `pnpm typegen` - Generate TypeScript types
- `pnpm validate` - Run validation tasks

### Turbo Tasks
- All tasks are orchestrated through Turbo
- Build dependencies are properly configured
- Development tasks run persistently with cache disabled

### Git Workflow and Branching
- **Modern standard practice**: Always create a feature branch at the very beginning of any work. Never commit directly to `main`.
- Before writing any code, documentation, or configuration changes that will be committed, the first step is:
  ```sh
  git checkout -b <type>/<scope>-<short-description>
  # or, when addressing a specific issue:
  git checkout -b <issue-number>/<short-description>
  ```
- Recommended branch naming conventions (aligns with Conventional Commits):
  - `feat/...` for new features
  - `fix/...` for bug fixes
  - `docs/...` for documentation
  - `refactor/...`, `chore/...`, `ci/...`, `perf/...`, `test/...`, `style/...`
- Examples:
  - `docs/4015-clarify-product-architecture-security`
  - `feat/portfolio-contact-form-validation`
  - `fix/admin-service-role-leak`
- Push the branch and open a Pull Request for review. `main` is only updated through passing, reviewed PRs.
- This rule applies to both human contributors and AI agents. Direct commits to `main` (even for documentation) are not acceptable.

See [docs/architecture.md](docs/architecture.md) for the detailed product architecture and security implementation.

## Content and Localization

- Primary language: Japanese.
- Content focus: technical blog posts and portfolio projects by Yamagishi Kazutoshi (@ykzts).
- See the apps and `profile/` package for actual content.

## Deployment and Infrastructure (high-level)

See [docs/architecture.md](docs/architecture.md) for the authoritative overview.

Summary:
- Vercel hosting. `portfolio` + `blog` use Vercel Microfrontends (single `ykzts.com` origin).
- `admin`, `memo`, `blog-legacy` are standalone.
- Content in Supabase. Secrets managed per Vercel project + local `.env` files.

## Commit Message Standards

This repository strictly follows the **Conventional Commits** specification. All commit messages must adhere to the `type(scope): subject` format.

### Commit Types
- **feat**: New features
- **fix**: Bug fixes
- **docs**: Documentation changes (user-facing documentation)
- **chore**: Internal workflow, configuration, or maintenance tasks
- **refactor**: Code changes that neither fix bugs nor add features
- **test**: Adding or updating tests
- **style**: Code style changes (formatting, missing semicolons, etc.)
- **perf**: Performance improvements
- **ci**: Changes to CI/CD configuration

### Examples
- `feat(portfolio): add new project showcase component`
- `fix(blog): resolve RSS feed generation issue`
- `chore: set up Copilot instructions for repository`
- `docs: update README with installation instructions`
- `refactor(portfolio): simplify component structure`

### Scope Guidelines
- Use app names for application-specific changes: `portfolio`, `blog-legacy`, `blog`, `admin`, `memo`
- Use package names for shared packages: `editor`, `layout`, `site-config`, `supabase`, `tsconfig`, `ui`, `utils`
- Omit scope for repository-wide changes (e.g. `docs`, `chore`, `ci`)

### Trailers for AI-assisted commits
For commits involving AI assistance, document the provenance using a Linux Kernel-style trailer (this is the current recommended form):

```
Assisted-by: <AI System>
```

Add it using Git's built-in trailer support (keeps the workflow simple for humans):

```sh
git commit --trailer "Assisted-by: <AI System>"
```

For convenience, you can set up a local alias once:

```sh
git config alias.commit-ai '!git commit --trailer "Assisted-by: <AI System>"'
# then use: git commit-ai -m "feat(ui): ..."
```

This approach follows the project's preference for riding established conventions (Conventional Commits + git trailers) rather than heavy custom tooling or strict enforcement in commitlint. commitlint (via the conventional preset) accepts these trailers without issue. The presence of the trailer for "AI cases" is handled by contributor discipline and review, keeping the commitlint configuration minimal and close to the de-facto preset.

## Best Practices for Contributors

1. **Branching first**: Always create and switch to a feature branch *before* making any changes (see "Git Workflow and Branching" above). Never commit directly to `main`.
2. **Commit Messages**: Follow Conventional Commits specification strictly
3. **Formatting**: Run `pnpm check` before committing
4. **Dependencies**: Add new dependencies to the appropriate workspace
5. **TypeScript**: Ensure type safety, use proper imports
6. **React**: Follow React 19 and Next.js patterns
7. **Performance**: Consider image optimization, bundle size
8. **Accessibility**: Maintain semantic HTML and ARIA labels
9. **Internationalization**: Respect Japanese content and formatting

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
