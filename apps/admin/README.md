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

Copy `.env.example` to `.env.local` and fill in your Supabase credentials:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

AI features (slug generation, embeddings) use Vercel AI Gateway. Configure the OpenAI API key in your Vercel project settings.
