# @ykzts/schemas

Sanity CMS schema definitions for blog posts, profiles, and work portfolio content.

## Purpose

This package provides TypeScript schema definitions for Sanity CMS content types used across the ykzts monorepo. It defines the structure and validation rules for blog posts, user profiles, and portfolio work entries that power the content management system.

## Usage

The schemas are imported and used in the Sanity Studio configuration:

```typescript
import {
  localeString,
  localeText,
  post as postSchema,
  profile as profileSchema,
  work as workSchema
} from '@ykzts/schemas'

export default defineConfig({
  schema: {
    types: [localeString, localeText, postSchema, profileSchema, workSchema]
  }
})
```

### Available Schemas

- **`localeString`**: Localized string type with `en` and `ja` fields for internationalization
- **`localeText`**: Localized text type with `en` and `ja` fields for internationalization
- **`post`**: Blog post content with title field
- **`profile`**: User profile information including:
  - **name** (required): Localized string with English (`en`) and Japanese (`ja`) fields
  - **email** (required): Contact email address
  - **tagline**: Localized text for professional tagline/subtitle
  - **bio**: Localized text for full biography
  - **socialLinks**: Array of social media links with platform, URL, and localized labels
- **`work`**: Portfolio work entries with title, content, slug, and start date

## Dependencies

### Internal Dependencies
- `@ykzts/tsconfig`: Shared TypeScript configuration (basic.json)

### External Dependencies
- `sanity`: Core Sanity CMS library for schema definition utilities
- `tsup`: Build tool for compiling TypeScript to ESM modules

### Dev Dependencies
- `@types/node`: Node.js type definitions
- `typescript` (inherited): TypeScript compiler

## Build

The package is built using tsup and outputs ESM modules with TypeScript declarations:

```bash
pnpm build  # Builds to dist/ directory
pnpm dev    # Builds in watch mode
```

## Output

- `dist/index.js`: Main ESM export
- `dist/index.d.ts`: TypeScript declarations