# Supabase Database Setup

This directory contains Supabase configuration, migrations, and seed data for the portfolio application.

## Overview

The portfolio application uses Supabase as a PostgreSQL database to store:
- **Profile Information**: User profile with multilingual support (name, tagline, email, social links, technologies)
- **Works**: Portfolio projects and accomplishments
- **Posts**: Blog posts and articles (future)

## Database Schema

### Profiles Table

The `profiles` table stores user profile information with the following structure:

```sql
profiles (
  id UUID PRIMARY KEY,
  name TEXT,                    -- Full name (legacy field)
  name_en TEXT,                 -- Name in English
  name_ja TEXT,                 -- Name in Japanese
  tagline_en TEXT,              -- Bio/tagline in English
  tagline_ja TEXT,              -- Bio/tagline in Japanese
  email TEXT,                   -- Contact email address
  social_links JSONB,           -- Array of social media links
  technologies JSONB,           -- Array of technology/skill names
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

**Social Links Structure:**
```json
[
  {
    "icon": "github",
    "label": "山岸和利のGitHubアカウント",
    "url": "https://github.com/ykzts"
  }
]
```

**Technologies Structure:**
```json
["TypeScript", "JavaScript", "React", "Next.js"]
```

### Works Table

The `works` table stores portfolio projects:

```sql
works (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content JSONB NOT NULL,       -- Portable Text format
  starts_at DATE NOT NULL,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

## Setup Instructions

### 1. Install Supabase CLI (Optional)

```bash
# Install Supabase CLI globally
npm install -g supabase

# Or use npx
npx supabase --version
```

### 2. Run Migrations

To apply migrations to your Supabase database:

**Option A: Using Supabase Dashboard**
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of each migration file in order:
   - `migrations/20260207000000_initial_schema.sql`
   - `migrations/20260208000000_add_profile_fields.sql`
4. Execute each migration

**Option B: Using Supabase CLI**
```bash
# Link to your project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

### 3. Insert Seed Data

To populate the database with initial data:

**Using Supabase Dashboard:**
1. Go to SQL Editor
2. Copy and paste the contents of `seed.sql`
3. Execute the SQL

**Using Supabase CLI:**
```bash
supabase db reset --seed
```

## Environment Variables

The portfolio application requires the following environment variables:

```bash
# Required for Supabase connection
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Getting Your Credentials

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Copy the **Project URL** and **anon/public key**
4. Add them to your `.env.local` file

## Security

### Row Level Security (RLS)

All tables have Row Level Security enabled with public read access policies:

```sql
-- Allow anyone to read profiles
CREATE POLICY "Enable read access for all users" ON profiles
  FOR SELECT USING (true);

-- Allow anyone to read works
CREATE POLICY "Enable read access for all users" ON works
  FOR SELECT USING (true);
```

**Note:** Write access is restricted by default. To modify data, use the Supabase Dashboard or add appropriate RLS policies.

## Data Management

### Updating Profile Information

To update profile information in production:

1. **Using Supabase Dashboard:**
   - Navigate to Table Editor
   - Select `profiles` table
   - Edit the single profile row

2. **Using SQL Editor:**
   ```sql
   UPDATE profiles
   SET 
     name_ja = '新しい名前',
     tagline_ja = '新しいタグライン',
     technologies = '["新しい技術"]'::jsonb
   WHERE id = '00000000-0000-0000-0000-000000000001';
   ```

### Adding Works

```sql
INSERT INTO works (title, slug, content, starts_at)
VALUES (
  'New Project',
  'new-project',
  '[{"_type": "block", "children": [{"_type": "span", "text": "Description"}]}]'::jsonb,
  '2024-01-01'
);
```

## Application Integration

### Data Fetching

The portfolio application fetches profile data using the `getProfile()` function:

```typescript
import { getProfile } from '@/lib/supabase'

// In a Server Component
const profile = await getProfile()
```

Features:
- ✅ Type-safe with Zod validation
- ✅ Cached with Next.js cache tags
- ✅ Graceful error handling and fallbacks
- ✅ Automatic null handling

### Caching

The application uses Next.js cache tags for optimal performance:

```typescript
// Profile data is cached with 'profile' tag
cacheTag('profile')

// Works data is cached with 'works' tag
cacheTag('works')
```

To revalidate cache after updates:
```typescript
revalidateTag('profile')
revalidateTag('works')
```

## Migration History

- **20260207000000_initial_schema.sql**: Initial database schema with profiles, works, and posts tables
- **20260208000000_add_profile_fields.sql**: Extended profiles table with multilingual support and structured data fields

## Troubleshooting

### Profile Not Loading

1. Check environment variables are set correctly
2. Verify Supabase project is active
3. Check browser console for errors
4. Verify profile data exists in database:
   ```sql
   SELECT * FROM profiles LIMIT 1;
   ```

### RLS Policy Issues

If you can't read data:
```sql
-- Check existing policies
SELECT * FROM pg_policies WHERE tablename = 'profiles';

-- Recreate read policy if needed
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
CREATE POLICY "Enable read access for all users" ON profiles
  FOR SELECT USING (true);
```

## Best Practices

1. **Always validate data**: Use Zod schemas to validate data from Supabase
2. **Use cache tags**: Implement proper caching for performance
3. **Handle errors gracefully**: Always provide fallback values
4. **Test migrations locally**: Test migrations in a development environment first
5. **Backup before changes**: Always backup your database before running migrations

## Support

For issues with:
- **Supabase**: Check [Supabase documentation](https://supabase.com/docs)
- **Portfolio app**: See `apps/portfolio/README.md`
- **Migrations**: Review migration files and error logs
