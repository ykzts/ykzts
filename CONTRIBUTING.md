# Contributing to ykzts

Thank you for your interest in contributing to this project! This repository contains the personal website and blog of Yamagishi Kazutoshi (@ykzts), built as a modern monorepo with multiple applications.

## Repository Overview

This is a pnpm workspace monorepo with the following structure:

```
├── apps/
│   ├── blog-legacy/    # Docusaurus-based blog (ykzts.blog)
│   ├── portfolio/      # Next.js portfolio site (ykzts.com)  
│   └── blog/           # (Future blog implementation)
├── packages/
│   ├── supabase/       # Supabase database type definitions
│   └── tsconfig/       # Shared TypeScript configurations
```

## Technology Stack

- **Package Manager**: pnpm (v10.17.1)
- **Build System**: Turbo (monorepo build orchestration)
- **Language**: TypeScript (modern/strict configuration)
- **Frontend Frameworks**: Next.js 15, Docusaurus 3, React 19
- **Styling**: Tailwind CSS v4 (portfolio), CSS (blog-legacy)
- **Content Management**: Supabase (PostgreSQL database with Dashboard)
- **Linting/Formatting**: Biome (replaces ESLint + Prettier)

## Development Environment Setup

### Prerequisites

- **Node.js**: Latest LTS version recommended (check with `node --version`)
- **Corepack**: Enable with `corepack enable` after installing Node.js
- **Docker**: Required for Supabase local development (admin and portfolio apps)

### Getting Started

1. **Clone the repository**:
   ```bash
   git clone https://github.com/ykzts/ykzts.git
   cd ykzts
   ```

2. **Enable pnpm**:
   ```bash
   corepack enable
   ```

3. **Install dependencies**:
   ```bash
   pnpm install
   ```

4. **Setup Supabase local stack** (required for admin and portfolio apps):
   ```bash
   npx supabase start
   ```
   
   This command will:
   - Start local Supabase services (PostgreSQL, Studio, Auth, etc.)
   - Run all database migrations automatically
   - Display service URLs and credentials
   
   **Access local Supabase Dashboard**:
   - Studio UI: `http://127.0.0.1:54323`
   - Database: `postgresql://postgres:postgres@127.0.0.1:54322/postgres`
   - API URL: `http://127.0.0.1:54321`
   
   **Useful Supabase CLI commands**:
   - `npx supabase status` - Check running services status
   - `npx supabase stop` - Stop all services
   - `npx supabase db reset --local` - Reset database and rerun migrations
   
   For more information, see the [Supabase CLI documentation](https://supabase.com/docs/guides/local-development).

5. **Run development servers**:
   ```bash
   pnpm dev
   ```

6. **Build all applications**:
   ```bash
   pnpm build
   ```

## Code Standards

### Code Style

This project uses **Biome** for linting and formatting with the following standards:

- **Quotes**: Single quotes for JavaScript/CSS
- **Semicolons**: As needed (ASI-safe)
- **Trailing Commas**: None
- **Import Sorting**: Enabled with sorted attributes/keys/properties

### Dependency Management

This repository uses pnpm's built-in `minimumReleaseAge` setting (configured in `pnpm-workspace.yaml`) to prevent installing packages that were published too recently:

- **Setting**: `minimumReleaseAge: 1440` (1440 minutes = 24 hours)
- **Purpose**: Provides a safety layer against packages with critical bugs or security issues
- **Exceptions**: Next.js and related packages are excluded via `minimumReleaseAgeExclude` since we track canary releases
- **Comparison**: Renovate uses 3 days; this uses 24 hours for faster manual updates while still ensuring safety

pnpm will automatically enforce this when installing or updating packages.

### TypeScript Guidelines

- Use strict TypeScript configuration
- Prefer type imports (`import type`)
- Use modern ESM syntax (`"type": "module"`)
- Leverage Next.js and React 19 features

### React Guidelines

- Use React 19 features (modern JSX transform, React Compiler)
- Prefer function components with hooks
- Use Next.js App Router conventions
- Tailwind CSS for component styling

## Commit Message Standards

This repository **strictly follows** the [Conventional Commits](https://www.conventionalcommits.org/) specification. All commit messages must adhere to the `type(scope): subject` format.

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

- Use app names for application-specific changes: `portfolio`, `blog-legacy`, `blog`
- Use package names for shared packages: `supabase`, `tsconfig`
- Omit scope for repository-wide changes

## Pull Request Process

### Before Submitting

1. **Run all checks locally**:
   ```bash
   pnpm check          # Biome linting/formatting
   pnpm test          # Run tests
   pnpm validate      # Run validation tasks
   pnpm typegen       # Generate TypeScript types
   ```

2. **Build successfully**:
   ```bash
   pnpm build
   ```

3. **Follow commit message conventions** (see above)

### Pull Request Guidelines

1. **Create a focused PR**: Keep changes small and focused on a single feature or fix
2. **Write descriptive titles**: Use conventional commit format for PR titles
3. **Provide context**: Explain what changes you made and why
4. **Link issues**: Reference any related issues using `#issue-number`
5. **Update documentation**: If your changes affect usage, update relevant docs

### Review Process

- All PRs require review before merging
- PRs must pass all CI checks (linting, tests, build)
- Maintain backward compatibility unless breaking changes are justified
- Follow existing code patterns and architecture

## Testing Requirements

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests for specific app
pnpm --filter @ykzts/portfolio test

# Run tests in watch mode (for development)
cd apps/portfolio && pnpm test:watch
```

### Testing Standards

- Write tests for new features and bug fixes
- Maintain or improve test coverage
- Use existing testing patterns (Vitest, Testing Library)
- Tests should be fast and reliable

### Current Test Coverage

- **Portfolio**: Component and utility function tests

## CI/CD Checks

All pull requests must pass the following automated checks:

1. **Linting**: `pnpm exec biome ci`
2. **Type Generation**: `pnpm typegen`
3. **Tests**: `pnpm test`
4. **Validation**: `pnpm validate`
5. **Supabase Migration Dry-run**: Automatic check for migration changes

These checks run automatically on:
- Pull request creation and updates
- Pushes to the main branch

## Supabase Database Migrations

This project uses Supabase for content management and automatically applies database migrations through GitHub Actions.

### Migration Workflow

#### 1. Creating New Migrations

Migrations are stored in `supabase/migrations/` directory with timestamp-based naming:

```bash
# Example migration filename
20260211055148_add_blog_schema.sql
```

**Best Practices:**
- Use descriptive names that explain what the migration does
- Test migrations locally before committing
- Keep migrations focused on a single logical change
- Include both schema changes and necessary data migrations

#### 2. Pull Request Stage (Local Validation)

When you create or update a PR with migration changes:

1. **Automatic Local Validation**: GitHub Actions starts a local Supabase instance and applies migrations
   - Validates SQL syntax and schema changes
   - Checks for conflicts and errors in a safe local environment
   - Runs on `ubuntu-24.04` (requires Docker for local Supabase)
   - **Works for external contributors**: No secrets required, uses local Supabase

2. **PR Comment**: Results are posted as a comment on your PR
   - ✅ Success: Migration validated successfully
   - ❌ Failure: Review and fix errors before merging

3. **Review Output**: Check the validation output in the PR comment
   - Review schema changes
   - Verify expected tables/columns are created
   - Ensure no unintended side effects

#### 3. Production Deployment (After Merge)

When your PR is merged to the `main` branch:

1. **Automatic Application**: GitHub Actions applies migrations to production
   - Runs `supabase db push` on `ubuntu-24.04` (more stable)
   - Uses `concurrency` to prevent simultaneous migrations
   - Protected by GitHub `production` environment

2. **Idempotent Operations**: Already applied migrations are automatically skipped
   - Supabase CLI tracks migration history
   - Safe to re-run migrations

3. **Verification**: Check workflow logs to confirm successful application

#### 4. Rollback Procedures

If you need to rollback a migration:

1. **Manual Rollback via Supabase Dashboard**:
   - Log into [Supabase Dashboard](https://supabase.com/dashboard)
   - Navigate to SQL Editor
   - Write and execute rollback SQL manually

2. **Create Revert Migration** (Recommended):
   - Create a new migration file that reverts the changes
   - Follow the normal PR workflow
   - Automatic dry-run validation before production

**Note**: Automated rollbacks are not implemented to prevent accidental data loss.

### Required GitHub Secrets

The migration workflow requires the following secrets for **production deployment only**:

- `SUPABASE_ACCESS_TOKEN`: Personal access token from Supabase Dashboard
  - Generated at: Settings → Access Tokens
  - **Important**: Requires manual renewal (OIDC not supported)
  - **Used for**: Production deployment only (not required for PR validation)
  
- `SUPABASE_PROJECT_REF`: Your Supabase project reference ID
  - Found in: Project Settings → General → Project URL
  - Format: `abcdefghijklmnopqrst`
  - **Used for**: Production deployment only

**Note**: PR validation uses local Supabase and does not require any secrets, making it safe for external contributors.

### Local Development

To test migrations locally:

```bash
# Start local Supabase
supabase start

# Reset and reapply all migrations locally
supabase db reset

# Generate TypeScript types
pnpm typegen
```

**Note**: `supabase db reset` recreates the local database and reapplies all migrations. If you only want to apply pending migrations without resetting data, use `supabase migration up` instead.

### Migration File Structure

Example migration file:

```sql
-- Add user profile fields for enhanced user information
-- Author: @ykzts
-- Date: 2026-02-08

-- Create new table
CREATE TABLE IF NOT EXISTS table_name (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_name ON table_name(column_name);

-- Enable Row Level Security
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "policy_name" ON table_name
  FOR SELECT
  USING (true);
```


### Troubleshooting

**Migration validation fails in PR:**
- Review the error message in the PR comment
- Fix SQL syntax errors or schema conflicts
- Test locally with `supabase start` to reproduce the issue
- Push fixes to your PR branch

**Production deployment fails:**
- Check GitHub Actions logs for error details
- Verify secrets are correctly configured (`SUPABASE_ACCESS_TOKEN`, `SUPABASE_PROJECT_REF`)
- Ensure no manual changes conflict with migration
- Contact @ykzts if issues persist

**Type generation out of sync:**
- Run `pnpm typegen` after applying migrations
- Commit updated type files in `packages/supabase/`

## Issue Reporting

### Bug Reports

When reporting bugs, please include:

1. **Clear description** of the issue
2. **Steps to reproduce** the problem
3. **Expected vs actual behavior**
4. **Environment details** (OS, Node.js version, browser)
5. **Screenshots or logs** if applicable

### Feature Requests

For new features:

1. **Describe the feature** and use case
2. **Explain the motivation** behind the request
3. **Consider implementation** if you have ideas

### Security Issues

For security vulnerabilities, please contact @ykzts directly rather than opening a public issue.

## Project-Specific Guidelines

### Package Management

- Use `pnpm` exclusively (not npm/yarn)
- Install dependencies from root: `pnpm install`
- Use `workspace:*` for internal dependencies

### Turbo Tasks

All build tasks are orchestrated through Turbo:
- `pnpm build` - Build all applications
- `pnpm dev` - Start development servers
- `pnpm test` - Run tests with dependencies
- `pnpm validate` - Run validation tasks

### Application-Specific Notes

#### Portfolio App (`apps/portfolio/`)
- Uses Next.js 15 with App Router and React Compiler
- Styled with Tailwind CSS
- Integrated with Supabase for content management

#### Blog Legacy (`apps/blog-legacy/`)
- Docusaurus 3 with MDX content
- Japanese localization
- Custom theme with dark mode

### Content Guidelines

- **Primary Language**: Japanese (ja)
- **Content Focus**: Technical topics, software development, open source
- **Respect existing content style** and formatting

## File Naming Conventions

- **Components**: PascalCase (`MyComponent.tsx`)
- **Pages**: kebab-case or Next.js conventions
- **Styles**: Tailwind CSS utility classes in JSX/TSX files
- **Types**: Descriptive names, use `type` imports
- **Content**: ISO date prefixes for blog posts

## Getting Help

- **Questions**: Open a discussion on GitHub
- **Issues**: Use the issue tracker for bugs and feature requests
- **Documentation**: Check existing README files in each package/app

## License

This project is licensed under the MIT License. By contributing, you agree that your contributions will be licensed under the same license.

---

Thank you for contributing to make this project better! 🚀