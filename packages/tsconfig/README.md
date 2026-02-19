# @ykzts/tsconfig

Shared TypeScript configuration presets for Node.js and Next.js projects.

## Purpose

This package provides centralized TypeScript configuration presets that ensure consistent compiler settings across all projects in the ykzts monorepo. It includes optimized configurations for both Node.js backend services and Next.js frontend applications.

## Usage

Import the appropriate configuration preset in your project's `tsconfig.json`:

### For Next.js Applications

```json
{
  "extends": ["@ykzts/tsconfig/next.json"]
}
```

Used by:
- `@ykzts/admin`
- `@ykzts/blog`
- `@ykzts/blog-legacy`
- `@ykzts/portfolio`

### For Node.js Projects

```json
{
  "extends": "@ykzts/tsconfig/basic.json"
}
```

Used by:
- `@ykzts/supabase`

### For React Component Libraries

```json
{
  "extends": "@ykzts/tsconfig/react-library.json"
}
```

Used by:
- `@ykzts/pagination-utils`
- `@ykzts/portable-text-utils`
- `@ykzts/ui`

## Available Configurations

### `basic.json`
- Target: ES2023
- Module: NodeNext with NodeNext module resolution
- Strict mode enabled
- Library support: DOM, DOM iterable, ES2023
- Optimized for Node.js and modern ESM-compatible environments

### `react-library.json`
- Target: ES2023
- Module: ESNext with bundler module resolution
- JSX: react-jsx (for component libraries)
- Strict mode enabled
- Library support: DOM, DOM iterable, ES2023

### `next.json`
- Target: ES2023
- Module: ESNext with bundler module resolution
- JSX: preserve (for React components)
- Includes incremental compilation and isolated modules
- Optimized for Next.js applications with React

## Dependencies

### Internal Dependencies
None - this is a foundational package

### External Dependencies
None - provides configuration only

## Features

- Consistent TypeScript settings across the monorepo
- Optimized configurations for different runtime environments
- Strict type checking enabled by default
- Modern ES2023 target for better performance
- JSON schema validation support
