# Admin Application

Content management admin application built with Next.js and Supabase.

## Features

- Authentication with Supabase Auth
- Admin pages for managing:
  - Profiles
  - Works
  - Posts
- Row Level Security (RLS) for data protection
- **AI-Powered Slug Generation**: Automatically generates SEO-friendly URL slugs using OpenAI's GPT-4o-mini
  - Supports Japanese content translation to English slugs
  - Content-aware generation based on title and article body
  - Automatic duplicate checking via tool calling
  - Fallback to traditional slugify for reliability

## Development

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev
```

Visit http://localhost:3001/admin

## Environment Variables

Copy `.env.example` to `.env.local` and set the following values:

```dotenv
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Cache Revalidation
# Comma-separated list of full revalidation endpoint URLs
REVALIDATE_SECRET=your-secret-key
REVALIDATE_URLS=http://localhost:3002/api/blog/revalidate,http://localhost:3000/api/revalidate

# Cron Job Security
CRON_SECRET=your-cron-secret

# Draft Preview
DRAFT_SECRET=your-draft-secret

# Site Identity
NEXT_PUBLIC_SITE_ORIGIN=http://localhost:3024
NEXT_PUBLIC_SITE_NAME=example.com

# Optional AI provider key (depending on your AI Gateway/provider setup)
OPENAI_API_KEY=
```

AI features (slug generation, embeddings) use Vercel AI Gateway.
