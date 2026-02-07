# Content Migration Guide: Sanity to Supabase

This document provides step-by-step instructions for migrating content from Sanity CMS to Supabase.

## Prerequisites

1. Access to your Sanity CMS project dashboard
2. A Supabase project set up with the database tables created (see `docs/supabase-migration.sql`)
3. Supabase credentials:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Migration Steps

### 1. Export Content from Sanity

You can export your content from Sanity using the Sanity CLI:

```bash
# Install Sanity CLI if not already installed
npm install -g @sanity/cli

# Login to your Sanity account
sanity login

# Export your dataset
sanity dataset export <dataset-name> sanity-export.tar.gz
```

Alternatively, you can use the Sanity Management API or manually copy content from the Sanity Studio.

### 2. Set Up Supabase Database

Run the SQL migration script in your Supabase project:

1. Open your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy the contents of `docs/supabase-migration.sql`
4. Execute the SQL script

This will create:
- `profiles` table
- `works` table  
- `posts` table
- Appropriate indexes and RLS policies

### 3. Transform and Import Content

The main difference between Sanity and Supabase is how content is stored:

**Sanity Format:**
```json
{
  "_id": "work-1",
  "_type": "work",
  "title": "Project Title",
  "slug": {
    "current": "project-slug"
  },
  "content": [...],
  "startsAt": "2024-01-01"
}
```

**Supabase Format:**
```json
{
  "id": "uuid-here",
  "title": "Project Title",
  "slug": "project-slug",
  "content": [...],
  "starts_at": "2024-01-01"
}
```

#### Key Transformations:

1. **Slug field**: Extract `slug.current` → `slug`
2. **Date fields**: Convert `startsAt` → `starts_at` 
3. **Content field**: Keep Portable Text format as-is (stored as JSONB)

#### Example Migration Script (Node.js):

**Important:** This script uses the Service Role Key which has full database access and should NEVER be committed to version control or exposed in client-side code. Run this script in a secure server environment only.

```javascript
// migration-script.js - Run this SERVER-SIDE ONLY
import { createClient } from '@supabase/supabase-js'
import sanityExport from './sanity-export.json'

// WARNING: Use Service Role Key (not anon key) for write operations
// Store this in a .env file and NEVER commit it to version control
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Service role key for admin operations
)

async function migrateWorks() {
  const works = sanityExport.filter(doc => doc._type === 'work')
  
  for (const work of works) {
    const { error } = await supabase
      .from('works')
      .insert({
        title: work.title,
        slug: work.slug.current,
        content: work.content,
        starts_at: work.startsAt
      })
    
    if (error) {
      console.error('Error migrating work:', work.title, error)
    } else {
      console.log('Migrated:', work.title)
    }
  }
}

migrateWorks()
```

### 4. Manual Data Entry via Supabase Dashboard

For smaller datasets, you can manually enter content through the Supabase Dashboard:

1. Navigate to Table Editor in Supabase Dashboard
2. Select the `works` table
3. Click "Insert row"
4. Fill in the fields:
   - **title**: Work title (text)
   - **slug**: URL-friendly slug (text, unique)
   - **content**: Portable Text as JSON (jsonb)
   - **starts_at**: Start date (date)

**Example Portable Text JSON:**
```json
[
  {
    "_type": "block",
    "children": [
      {
        "_type": "span",
        "text": "Your content here"
      }
    ],
    "markDefs": [],
    "style": "normal"
  }
]
```

### 5. Verify Migration

After importing content, verify it's working:

1. Set environment variables in `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

2. Start the development server:
   ```bash
   pnpm dev
   ```

3. Visit your portfolio site and check that works are displaying correctly

### 6. Test Content Editing

Use the Supabase Dashboard to:
- Add new works
- Edit existing works
- Delete works (if needed)

All changes should be immediately reflected in your Next.js application (with caching considerations).

## Portable Text Compatibility

The migration preserves the Portable Text format, so `@portabletext/react` continues to work without changes. The content is stored as JSONB in Supabase, which:

- Allows for efficient querying
- Maintains the structure needed for rendering
- Is fully compatible with the existing PortableText renderer

## Troubleshooting

### Content not displaying

- Check that environment variables are set correctly
- Verify RLS policies are enabled for public read access
- Check browser console for errors

### Migration script fails

- Ensure you're using the Service Role Key (not the anon key) for write operations
- Check that all required fields are present
- Verify date formats are correct (YYYY-MM-DD)

### TypeScript errors

Generate fresh TypeScript types from your Supabase schema:
```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > apps/portfolio/lib/database.types.ts
```

## Rollback Plan

If you need to rollback to Sanity:

1. Reinstall Sanity dependencies:
   ```bash
   cd apps/portfolio
   pnpm add @sanity/client
   ```

2. Revert the changes:
   ```bash
   git revert <commit-hash>
   ```

3. Restore Sanity environment variables

## Support

For issues with:
- **Supabase**: Check [Supabase Documentation](https://supabase.com/docs)
- **Portable Text**: See [@portabletext/react docs](https://github.com/portabletext/react-portabletext)
- **Migration**: Open an issue in the repository
