# Supabase Database Migrations

This directory contains SQL migration files for the ykzts database schema.

## Migration Files

### 20260207000000_initial_schema.sql
Initial database schema with:
- `profiles` table - User profile information
- `works` table - Portfolio work entries
- `posts` table - Blog post entries (basic structure)
- Row Level Security (RLS) policies
- Triggers for automatic timestamp updates

### 20260211055148_add_blog_schema.sql
Blog schema expansion and version management (Phase 1):
- Extended `posts` table with new columns:
  - `slug` - URL identifier (UNIQUE, NOT NULL after data migration)
  - `excerpt` - Post summary/description
  - `status` - Post status ('draft', 'scheduled', 'published')
  - `published_at` - Publication/scheduled date
  - `tags` - Array of tags
  - `redirect_from` - Legacy Tumblr redirect paths
  - `current_version_id` - Foreign key to current version
- New `post_versions` table for version tracking:
  - Version history with JSONB content (Portable Text format)
  - Snapshot of title, excerpt, tags
  - Change tracking with summary
  - Foreign keys to posts and profiles
- Indexes for performance optimization
- Updated RLS policies:
  - Public access to published posts
  - Authenticated access to all posts and versions

## How to Apply Migrations

### Local Development

1. **Start Supabase locally:**
   ```bash
   npx supabase start
   ```

2. **Apply migrations:**
   ```bash
   npx supabase db reset
   ```
   This will apply all migrations in order and seed the database.

3. **Generate TypeScript types:**
   ```bash
   cd packages/supabase
   pnpm typegen
   ```

### Production Deployment

Migrations are applied automatically when you push changes to the remote database:

```bash
npx supabase db push
```

Or apply specific migrations:

```bash
npx supabase migration up
```

## Creating New Migrations

1. **Create a new migration file:**
   ```bash
   npx supabase migration new <migration_name>
   ```

2. **Edit the generated SQL file** in `supabase/migrations/`

3. **Test locally:**
   ```bash
   npx supabase db reset
   ```

4. **Update TypeScript types:**
   ```bash
   cd packages/supabase
   pnpm typegen
   ```

5. **Commit both the migration file and updated types**

## Migration Naming Convention

Migrations use a timestamp-based naming convention:
- Format: `YYYYMMDDHHMMSS_description.sql`
- Example: `20260211055148_add_blog_schema.sql`

## RLS Policies

Row Level Security (RLS) is enabled on all tables:

- **profiles, works**: Public read access
- **posts**: 
  - Published posts (status='published' AND published_at<=now()) - public read
  - All posts - authenticated users
- **post_versions**: Authenticated users only

## Best Practices

1. **Always use IF NOT EXISTS** when creating tables/indexes
2. **Use transactions** for complex migrations
3. **Test migrations locally** before pushing to production
4. **Keep migrations idempotent** when possible
5. **Document breaking changes** in migration comments
6. **Backup before major schema changes**
7. **Update TypeScript types** after every migration

## Troubleshooting

### Migration fails to apply
- Check the SQL syntax in your migration file
- Ensure you're running migrations in order
- Verify that dependencies (other tables/columns) exist

### Types are out of sync
```bash
cd packages/supabase
pnpm typegen
```

### Reset local database
```bash
npx supabase db reset
```
This will drop all tables and reapply all migrations.

### View migration status
```bash
npx supabase migration list
```

## References

- [Supabase Local Development](https://supabase.com/docs/guides/local-development)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
