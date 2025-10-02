# @ykzts/portfolio

Next.js portfolio website showcasing projects, skills, and professional experience.

## Purpose

This application powers [ykzts.com](https://ykzts.com/), a professional portfolio website that showcases software development projects, technical skills, and professional experience. Built with Next.js 15 and featuring modern web technologies, it provides a fast, responsive, and accessible platform for professional presentation.

## Usage

### Development

```bash
pnpm dev        # Start development server with Turbopack
pnpm build      # Build for production
pnpm start      # Start production server
pnpm typegen    # Generate TypeScript types from Next.js
pnpm lighthouse # Run Lighthouse CI performance audit
```

### Testing

```bash
pnpm test       # Run unit tests with Vitest
pnpm test:a11y  # Run accessibility tests with Playwright
pnpm lighthouse # Run Lighthouse CI performance audit
```

### Key Features

- **App Router**: Next.js 15 with modern routing and layouts
- **React Compiler**: Enhanced performance with React 19 optimizations
- **MDX Support**: Rich content authoring with React components
- **Sanity Integration**: Dynamic content management for portfolio entries
- **Vercel Analytics**: Performance monitoring and user analytics
- **Responsive Design**: Mobile-first design with CSS Modules

### Content Integration

- **Portfolio Works**: Dynamic content from Sanity CMS
- **About Section**: MDX-based content with interactive components
- **Contact Information**: Social links and professional contact details
- **Go Package Redirects**: Special routing for Go package documentation

## Dependencies

### Internal Dependencies
- `@ykzts/tsconfig`: TypeScript configuration (next.json preset)

### External Dependencies
- `next`: React framework with App Router (v15.6.0)
- `react`: UI framework (v19.0.0)
- `@mdx-js/react`: MDX component rendering
- `@portabletext/react`: Sanity rich text rendering
- `@sanity/client`: Headless CMS client
- `@vercel/analytics`: Performance and user analytics
- `react-icons`: Icon components library
- `react-intersection-observer`: Viewport-based animations
- `clsx`: Utility for conditional CSS classes
- `zod`: Runtime type validation

### Dev Dependencies
- `typescript`: Type checking and development tooling
- `@next/mdx`: Next.js MDX integration
- `@mdx-js/loader`: MDX compilation for Webpack
- `babel-plugin-react-compiler`: React 19 performance optimizations
- `@types/mdx`: TypeScript definitions for MDX
- `@lhci/cli`: Lighthouse CI for automated performance auditing
- `@playwright/test`: End-to-end and accessibility testing
- `@axe-core/playwright`: Accessibility testing integration
- `vitest`: Fast unit testing framework

## Architecture

- **Static Generation**: Pre-rendered pages for optimal performance
- **Image Optimization**: Next.js Image component with automatic optimization
- **CSS Modules**: Scoped styling with modern CSS features
- **TypeScript**: Full type safety throughout the application
- **Component-Based**: Reusable UI components with proper separation of concerns

## Performance & Quality

This application maintains high performance and quality standards through:

### Lighthouse CI Integration
- **Automated Audits**: Lighthouse CI runs on every PR via GitHub Actions
- **Performance Thresholds**: Minimum score of 95 for Performance, Best Practices, SEO, and Accessibility
- **Continuous Monitoring**: Ensures no performance regressions over time

### Optimization Strategies
- **Image Optimization**: AVIF and WebP formats with Next.js Image component
- **Font Loading**: Optimized Google Fonts with `font-display: swap`
- **Code Splitting**: Automatic with CSS Modules and Next.js
- **Lazy Loading**: Suspense boundaries for non-critical content
- **Security Headers**: CSP, Permissions-Policy, and other security headers
- **React Compiler**: Enhanced performance with React 19 compiler
- **Partial Prerendering (PPR)**: Next.js experimental feature for improved performance

### CI/CD Quality Gates
- **Node.js CI**: Runs build, tests, and linting on every PR
- **Accessibility Testing**: Automated WCAG compliance checks with axe-core
- **Lighthouse CI**: Performance, Best Practices, SEO, and Accessibility audits
