# Admin Application

Content management admin application built with Next.js and Supabase.

## Features

- Authentication with Supabase Auth
- Admin pages for managing:
  - Profiles
  - Works
  - Posts
- Row Level Security (RLS) for data protection

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

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```
