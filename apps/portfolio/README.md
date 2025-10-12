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
- **Contact Form**: Secure contact form with Resend email service and Cloudflare Turnstile spam prevention
- **Vercel Analytics**: Performance monitoring and user analytics
- **Responsive Design**: Mobile-first design with Tailwind CSS

### Content Integration

- **Portfolio Works**: Dynamic content from Sanity CMS
- **About Section**: MDX-based content with interactive components
- **Contact Form**: Server-side form processing with email notifications
- **Go Package Redirects**: Special routing for Go package documentation

## Environment Variables

The application requires the following environment variables:

```bash
# Resend API Configuration
RESEND_API_KEY=your_resend_api_key_here
CONTACT_EMAIL="John Doe <test@example.com>"

# Cloudflare Turnstile Configuration
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your_turnstile_site_key_here
TURNSTILE_SECRET_KEY=your_turnstile_secret_key_here

# Sanity CMS Configuration
NEXT_PUBLIC_SANITY_PROJECT_ID=your_sanity_project_id
NEXT_PUBLIC_SANITY_DATASET=production
```

See `.env.example` for a complete list of required environment variables.

## Dependencies

### Internal Dependencies
- `@ykzts/tsconfig`: TypeScript configuration (next.json preset)

### External Dependencies
- `next`: React framework with App Router (v15.6.0)
- `react`: UI framework (v19.0.0)
- `@mdx-js/react`: MDX component rendering
- `@portabletext/react`: Sanity rich text rendering
- `@react-email/render`: Email template rendering for Resend
- `@sanity/client`: Headless CMS client
- `@vercel/analytics`: Performance and user analytics
- `react-hot-toast`: Toast notifications for form feedback
- `react-icons`: Icon components library
- `react-intersection-observer`: Viewport-based animations
- `react-turnstile`: Cloudflare Turnstile spam prevention
- `resend`: Email delivery service
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
- `tailwindcss`: Utility-first CSS framework (v4)
- `@tailwindcss/postcss`: PostCSS plugin for Tailwind v4
- `@tailwindcss/typography`: Typography plugin for Tailwind CSS
- `postcss`: CSS transformation tool
- `autoprefixer`: PostCSS plugin for vendor prefixes
- `@lhci/cli`: Lighthouse CI for automated performance auditing
- `@playwright/test`: End-to-end and accessibility testing
- `@axe-core/playwright`: Accessibility testing integration
- `vitest`: Fast unit testing framework

## Architecture

- **Static Generation**: Pre-rendered pages for optimal performance
- **Image Optimization**: Next.js Image component with automatic optimization
- **Tailwind CSS**: Utility-first styling with Tailwind v4
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
