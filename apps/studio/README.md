# @ykzts/studio

Sanity CMS studio application for content management of portfolio and blog entries.

## Purpose

This application provides the content management interface for the ykzts monorepo, built with Sanity Studio and Next.js. It enables the creation, editing, and management of blog posts, portfolio work entries, and profile information that powers the main website and blog applications.

## Usage

### Development

```bash
pnpm dev        # Start development server on port 10000
pnpm build      # Build for production  
pnpm start      # Start production server on port 10000
pnpm typegen    # Generate TypeScript types from Next.js
```

### Content Types

The studio manages three main content types:
- **Posts**: Blog post entries with title and content
- **Profile**: User profile information and biography
- **Work**: Portfolio entries with title, content, slug, and timeline data

### Studio Features

- **Vision Tool**: GraphQL query playground for content exploration
- **Structure Tool**: Organized content management interface
- **React Compiler**: Enhanced performance with React 19 optimizations
- **TypeScript Support**: Full type safety for content schemas

## Dependencies

### Internal Dependencies
- `@ykzts/schemas`: Content schema definitions
- `@ykzts/tsconfig`: TypeScript configuration (next.json preset)

### External Dependencies
- `next`: Framework for the studio application (v15.6.0)
- `sanity`: Headless CMS platform (v4.0.0)
- `@sanity/vision`: Query tool for content exploration
- `@sanity/ui`: Design system components
- `next-sanity`: Next.js integration for Sanity
- `react`: UI framework (v19.0.0)

### Dev Dependencies
- `typescript`: Type checking and development tooling
- `babel-plugin-react-compiler`: Performance optimizations for React 19
- `@types/react`: React type definitions

## Configuration

- **Port**: 10000 (development and production)
- **Build Tool**: Turbopack for faster builds
- **Environment Variables**: Requires `NEXT_PUBLIC_SANITY_PROJECT_ID` and `NEXT_PUBLIC_SANITY_DATASET`
- **Schemas**: Imported from `@ykzts/schemas` package
