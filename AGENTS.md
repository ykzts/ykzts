# AI Agent Instructions

This repository is a monorepo containing the personal website and blog of Yamagishi Kazutoshi (@ykzts), a Japanese software developer specializing in full-stack web applications.

## Repository Structure

This is a pnpm workspace monorepo with the following structure:

```
├── apps/
│   ├── blog-legacy/    # Docusaurus-based blog (ykzts.blog)
│   ├── portfolio/      # Next.js portfolio site (ykzts.com)  
│   ├── studio/         # Sanity CMS studio
│   └── blog/           # (Future blog implementation)
├── packages/
│   ├── schemas/        # Sanity schema definitions
│   ├── supabase/       # Supabase database type definitions
│   └── tsconfig/       # Shared TypeScript configurations
```

## Technology Stack

- **Package Manager**: pnpm (v10.17.1)
- **Build System**: Turbo (monorepo build orchestration)
- **Language**: TypeScript (modern/strict configuration)
- **Frontend Frameworks**: 
  - Next.js 15 (with Turbopack) for portfolio and studio
  - Docusaurus 3 for blog-legacy
  - React 19 across all applications
- **Content Management**: Supabase (PostgreSQL database with Dashboard) for portfolio; Sanity CMS for studio
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

## Application-Specific Guidelines

### Portfolio App (`apps/portfolio/`)
- **Framework**: Next.js 15 with App Router
- **Features**: SSG, React Compiler, MDX, Supabase integration
- **Styling**: CSS Modules with modern CSS
- **Performance**: Image optimization, Vercel Analytics
- **Build**: Uses Turbopack for faster builds

### Blog Legacy (`apps/blog-legacy/`)  
- **Framework**: Docusaurus 3
- **Content**: MDX files in `blog/` directory
- **Features**: Japanese localization, Algolia search, RSS feeds
- **Plugins**: Vercel Analytics plugin
- **Theme**: Custom theme with dark mode support

### Studio (`apps/studio/`)
- **Framework**: Next.js 15 + Sanity Studio
- **Purpose**: Content management for portfolio/blog
- **Port**: Runs on port 10000 in development
- **Schemas**: References `@ykzts/schemas` package

### Shared Packages
- **schemas**: Sanity schema definitions (built with tsup)
- **supabase**: Supabase database TypeScript type definitions
- **tsconfig**: Shared TypeScript configurations

## Content and Localization

- **Primary Language**: Japanese (ja)
- **Content**: Technical blog posts, portfolio projects
- **Author**: Yamagishi Kazutoshi (ykzts)
- **Themes**: Software development, open source, web technologies

## Deployment and Infrastructure

- **Hosting**: Vercel (inferred from analytics integration)
- **Analytics**: Vercel Analytics integrated
- **Content**: Supabase PostgreSQL database with Dashboard for portfolio content; Sanity CMS for studio
- **Domains**: ykzts.com (portfolio), ykzts.blog (blog)

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
- `refactor(studio): simplify Sanity schema definitions`

### Scope Guidelines
- Use app names for application-specific changes: `portfolio`, `blog-legacy`, `studio`
- Use package names for shared packages: `schemas`, `supabase`, `tsconfig`
- Omit scope for repository-wide changes

## Best Practices for Contributors

1. **Commit Messages**: Follow Conventional Commits specification strictly
2. **Formatting**: Run `pnpm check` before committing
3. **Dependencies**: Add new dependencies to the appropriate workspace
4. **TypeScript**: Ensure type safety, use proper imports
5. **React**: Follow React 19 and Next.js 15 patterns
6. **Performance**: Consider image optimization, bundle size
7. **Accessibility**: Maintain semantic HTML and ARIA labels
8. **Internationalization**: Respect Japanese content and formatting

## File Naming Conventions

- Components: PascalCase (`MyComponent.tsx`)
- Pages: kebab-case or Next.js conventions
- Styles: `component.module.css` for CSS Modules
- Types: Descriptive names, use `type` imports
- Content: ISO date prefixes for blog posts

## Environment and Configuration

- **Node.js**: Version 22.20.0
- **Package Manager**: pnpm with Corepack
- **Editor**: VSCode configuration included
- **Git**: Main branch, proper ignore files
- **CI/CD**: GitHub Actions with Node.js workflow
