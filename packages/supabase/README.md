# @ykzts/supabase

Supabase database type definitions for ykzts applications.

## Purpose

This package contains TypeScript type definitions generated from the Supabase database schema. It provides type-safe access to database tables and ensures consistency across all applications that interact with the Supabase database.

## Usage

```typescript
import type { Database } from '@ykzts/supabase'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)
```

## Type Generation

The types in this package are generated from the Supabase database schema using:

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > packages/supabase/src/database.types.ts
```

## Tables

- **profiles**: User profile information
- **works**: Portfolio work entries with Portable Text content
- **posts**: Blog post entries

## Internal Dependencies

This package has no dependencies and can be used by any application in the monorepo.
