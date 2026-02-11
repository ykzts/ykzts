# Database Schema Diagram

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────┐
│              profiles                        │
├─────────────────────────────────────────────┤
│ id (UUID, PK)                               │
│ name (TEXT)                                 │
│ email (TEXT)                                │
│ about (JSONB)                               │
│ tagline (TEXT)                              │
│ created_at (TIMESTAMPTZ)                    │
│ updated_at (TIMESTAMPTZ)                    │
└─────────────────────────────────────────────┘
              △                   △
              │                   │
              │                   │ created_by (FK)
              │                   │
┌─────────────┴───────────────────┴──────────────────────┐
│              post_versions                              │
├─────────────────────────────────────────────────────────┤
│ id (UUID, PK)                                           │
│ post_id (UUID, FK → posts.id) ──────┐                  │
│ version_number (INTEGER)             │                  │
│ content (JSONB)                      │                  │
│ title (TEXT)                         │                  │
│ excerpt (TEXT)                       │                  │
│ tags (TEXT[])                        │                  │
│ created_at (TIMESTAMPTZ)             │                  │
│ created_by (UUID, FK → profiles.id)  │                  │
│ change_summary (TEXT)                │                  │
│ UNIQUE(post_id, version_number)      │                  │
└──────────────────────────────────────┼──────────────────┘
                                       │
              ┌────────────────────────┘
              │
              ▽
┌─────────────────────────────────────────────────────────┐
│              posts                                       │
├─────────────────────────────────────────────────────────┤
│ id (UUID, PK)                                           │
│ title (TEXT)                                            │
│ slug (TEXT, UNIQUE)                                     │
│ excerpt (TEXT)                                          │
│ status (TEXT) CHECK('draft','scheduled','published')    │
│ published_at (TIMESTAMPTZ)                              │
│ tags (TEXT[])                                           │
│ redirect_from (TEXT[])                                  │
│ current_version_id (UUID, FK → post_versions.id) ◄──┐  │
│ created_at (TIMESTAMPTZ)                             │  │
│ updated_at (TIMESTAMPTZ)                             │  │
└──────────────────────────────────────────────────────┼──┘
                                                        │
                                                        │
                                    Circular reference  │
                                    (intentional)       │
                                                        └──
```

## Table Relationships

### posts ←→ post_versions (Circular)
- `posts.current_version_id` → `post_versions.id` (SET NULL on delete)
- `post_versions.post_id` → `posts.id` (CASCADE on delete)

**Note:** The circular reference is intentional and requires careful handling:
1. Create post with `current_version_id = NULL`
2. Create initial version with `post_id = post.id`
3. Update post with `current_version_id = version.id`

### post_versions → profiles
- `post_versions.created_by` → `profiles.id` (SET NULL on delete)
- One profile can create many versions

## Indexes

### posts table
```sql
CREATE INDEX posts_slug_idx ON posts(slug);
CREATE INDEX posts_status_idx ON posts(status);
CREATE INDEX posts_published_at_idx ON posts(published_at DESC);
```

### post_versions table
```sql
CREATE INDEX post_versions_post_id_idx ON post_versions(post_id);
CREATE INDEX post_versions_version_number_idx ON post_versions(post_id, version_number);
```

## RLS Policies

### posts
| Policy Name | Command | Rule |
|------------|---------|------|
| Enable read access for published posts | SELECT | `status = 'published' AND published_at <= now()` |
| Enable read access for authenticated users | SELECT | `auth.uid() IS NOT NULL` |
| Enable insert for authenticated users | INSERT | `auth.uid() IS NOT NULL` |
| Enable update for authenticated users | UPDATE | `auth.uid() IS NOT NULL` |
| Enable delete for authenticated users | DELETE | `auth.uid() IS NOT NULL` |

### post_versions
| Policy Name | Command | Rule |
|------------|---------|------|
| Enable read access for authenticated users | SELECT | `auth.uid() IS NOT NULL` |
| Enable insert for authenticated users | INSERT | `auth.uid() IS NOT NULL` |
| Enable update for authenticated users | UPDATE | `auth.uid() IS NOT NULL` |
| Enable delete for authenticated users | DELETE | `auth.uid() IS NOT NULL` |

## Data Flow for Creating a Post with Version

```
1. Create Post
   ┌─────────────────────────────────────┐
   │ INSERT INTO posts                    │
   │   (title, slug, excerpt, status,    │
   │    published_at, tags,              │
   │    current_version_id)              │
   │ VALUES                              │
   │   ('My Post', 'my-post', '...',     │
   │    'draft', null, '{tag1}',        │
   │    NULL)  ← initially NULL         │
   │ RETURNING id                        │
   └─────────────────────────────────────┘
              │
              ▽
2. Create Initial Version
   ┌─────────────────────────────────────┐
   │ INSERT INTO post_versions           │
   │   (post_id, version_number,         │
   │    content, title, excerpt, tags,   │
   │    created_by, change_summary)      │
   │ VALUES                              │
   │   (<post_id>, 1,                    │
   │    '<portable_text>',               │
   │    'My Post', '...', '{tag1}',     │
   │    <user_id>,                       │
   │    'Initial version')               │
   │ RETURNING id                        │
   └─────────────────────────────────────┘
              │
              ▽
3. Update Post with Current Version
   ┌─────────────────────────────────────┐
   │ UPDATE posts                        │
   │ SET current_version_id = <version_id>│
   │ WHERE id = <post_id>                │
   └─────────────────────────────────────┘
```

## Query Examples

### Get all published posts with latest version
```sql
SELECT 
  p.*,
  pv.content,
  pv.version_number,
  pv.created_at as version_created_at
FROM posts p
LEFT JOIN post_versions pv ON p.current_version_id = pv.id
WHERE p.status = 'published'
  AND p.published_at <= now()
ORDER BY p.published_at DESC;
```

### Get post version history
```sql
SELECT 
  pv.*,
  pr.name as created_by_name
FROM post_versions pv
LEFT JOIN profiles pr ON pv.created_by = pr.id
WHERE pv.post_id = '<post_id>'
ORDER BY pv.version_number ASC;
```

### Get drafts for authenticated user
```sql
SELECT 
  p.*,
  pv.content
FROM posts p
LEFT JOIN post_versions pv ON p.current_version_id = pv.id
WHERE p.status = 'draft'
ORDER BY p.updated_at DESC;
```

## Column Types Reference

| PostgreSQL Type | TypeScript Type | Description |
|----------------|-----------------|-------------|
| UUID | string | UUID v4 identifier |
| TEXT | string \| null | Variable-length text |
| TEXT[] | string[] \| null | Array of text values |
| TIMESTAMPTZ | string | ISO 8601 datetime with timezone |
| INTEGER | number | 32-bit integer |
| JSONB | Json | JSON binary format |

## Migration Files

| File | Purpose |
|------|---------|
| `20260207000000_initial_schema.sql` | Initial schema with basic posts table |
| `20260211055148_add_blog_schema.sql` | Blog expansion with versioning |

---

Generated: 2026-02-11
