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
```

### Key Features

- **App Router**: Next.js 15 with modern routing and layouts
- **React Compiler**: Enhanced performance with React 19 optimizations
- **MDX Support**: Rich content authoring with React components
- **Sanity Integration**: Dynamic content management for portfolio entries
- **Contact Form**: Secure contact form with Resend email service and Cloudflare Turnstile spam prevention
- **Vercel Analytics**: Performance monitoring and user analytics
- **Responsive Design**: Mobile-first design with CSS Modules

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
CONTACT_EMAIL=ykzts@desire.sh
RESEND_FROM_EMAIL=contact@ykzts.com

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
- `clsx`: Utility for conditional CSS classes
- `zod`: Runtime type validation

### Dev Dependencies
- `typescript`: Type checking and development tooling
- `@next/mdx`: Next.js MDX integration
- `@mdx-js/loader`: MDX compilation for Webpack
- `babel-plugin-react-compiler`: React 19 performance optimizations
- `@types/mdx`: TypeScript definitions for MDX

## Architecture

- **Static Generation**: Pre-rendered pages for optimal performance
- **Image Optimization**: Next.js Image component with automatic optimization
- **CSS Modules**: Scoped styling with modern CSS features
- **TypeScript**: Full type safety throughout the application
- **Component-Based**: Reusable UI components with proper separation of concerns
