# @ykzts/blog-legacy

Docusaurus-based blog application featuring Japanese technical content and modern web development topics.

## Purpose

This application powers [ykzts.blog](https://ykzts.blog/), a technical blog focused on software development, open source contributions, and web technologies. Built with Docusaurus 3, it provides a fast, accessible, and SEO-optimized platform for sharing knowledge and insights about modern web development.

## Usage

### Development

```bash
pnpm dev        # Start development server
pnpm build      # Build for production
pnpm serve      # Serve built files locally
```

### Features

- **Japanese Localization**: Native support for Japanese content and formatting
- **Algolia Search**: Integrated search functionality for easy content discovery
- **RSS Feeds**: Automatic generation of Atom feeds for content syndication
- **Dark Mode**: Responsive theme with automatic dark mode support
- **Vercel Analytics**: Integrated analytics for performance monitoring

### Content Management

Blog posts are authored in MDX format in the `blog/` directory with automatic:
- Date-based URL routing
- Reading time estimation
- Last update tracking
- Archive page generation

## Dependencies

### Internal Dependencies
None - this is a standalone application

### External Dependencies
- `@docusaurus/core`: Core Docusaurus framework (v3.8.1)
- `@docusaurus/preset-classic`: Classic theme and plugins
- `@docusaurus/faster`: Performance optimizations
- `@docusaurus/plugin-vercel-analytics`: Analytics integration
- `react`: UI framework (v19.0.0)
- `prism-react-renderer`: Syntax highlighting for code blocks

### Dev Dependencies
- `typescript`: Type checking and development tooling
- `@docusaurus/types`: TypeScript definitions for Docusaurus
- `@types/react`: React type definitions

## Configuration

- **Base URL**: `/` (root domain)
- **Language**: Japanese (ja) as default locale
- **Search**: Powered by Algolia with index `posts`
- **Analytics**: Google Analytics (UA-97395750-2) and Vercel Analytics
- **Theme**: Light/dark mode with system preference detection
