# Contributing to ykzts

Thank you for your interest in contributing to this project! This repository contains the personal website and blog of Yamagishi Kazutoshi (@ykzts), built as a modern monorepo with multiple applications.

## Repository Overview

This is a pnpm workspace monorepo with the following structure:

```
├── apps/
│   ├── blog-legacy/    # Docusaurus-based blog (ykzts.blog)
│   ├── portfolio/      # Next.js portfolio site (ykzts.com)  
│   ├── studio/         # Sanity CMS studio
│   └── blog/           # (Future blog implementation)
├── packages/
│   ├── schemas/        # Sanity schema definitions
│   └── tsconfig/       # Shared TypeScript configurations
```

## Technology Stack

- **Package Manager**: pnpm (v10.17.1)
- **Build System**: Turbo (monorepo build orchestration)
- **Language**: TypeScript (modern/strict configuration)
- **Frontend Frameworks**: Next.js 15, Docusaurus 3, React 19
- **Content Management**: Sanity CMS
- **Linting/Formatting**: Biome (replaces ESLint + Prettier)

## Development Environment Setup

### Prerequisites

- **Node.js**: Version 22.20.0 (check with `node --version`)
- **Corepack**: Install with `npm install -g corepack@0.34.0`

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

4. **Run development servers**:
   ```bash
   pnpm dev
   ```

5. **Build all applications**:
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
- `refactor(studio): simplify Sanity schema definitions`

### Scope Guidelines

- Use app names for application-specific changes: `portfolio`, `blog-legacy`, `studio`
- Use package names for shared packages: `schemas`, `tsconfig`
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
- **Schemas**: Schema validation tests
- **Studio**: No tests currently configured

## CI/CD Checks

All pull requests must pass the following automated checks:

1. **Linting**: `pnpm exec biome ci`
2. **Type Generation**: `pnpm typegen`
3. **Tests**: `pnpm test`
4. **Validation**: `pnpm validate`

These checks run automatically on:
- Pull request creation and updates
- Pushes to the main branch

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
- Styled with CSS Modules
- Integrated with Sanity CMS

#### Blog Legacy (`apps/blog-legacy/`)
- Docusaurus 3 with MDX content
- Japanese localization
- Custom theme with dark mode

#### Studio (`apps/studio/`)
- Sanity Studio for content management
- Runs on port 10000 in development

### Content Guidelines

- **Primary Language**: Japanese (ja)
- **Content Focus**: Technical topics, software development, open source
- **Respect existing content style** and formatting

## File Naming Conventions

- **Components**: PascalCase (`MyComponent.tsx`)
- **Pages**: kebab-case or Next.js conventions
- **Styles**: `component.module.css` for CSS Modules
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