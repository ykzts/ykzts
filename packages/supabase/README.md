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

The types in this package are generated from the Supabase database schema and are committed to the repository. **You only need to regenerate types when the database schema changes.**

### When CI Runs

The `typegen` script is safe to run in CI - it will skip type generation if Supabase CLI is not installed, since the types are already committed to the repository.

### Regenerating Types Locally

To regenerate types after schema changes:

### Using Local Supabase Instance

If you have Supabase running locally with `supabase start`:

```bash
cd packages/supabase
pnpm typegen
```

This runs: `supabase gen types typescript --local > src/database.types.ts`

### Using Remote Supabase Project

If you want to generate types from a remote Supabase project:

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > packages/supabase/src/database.types.ts
```

Or using the project reference from your linked project:

```bash
npx supabase gen types typescript --linked > packages/supabase/src/database.types.ts
```

## Tables

- **profiles**: User profile information
- **works**: Portfolio work entries with Portable Text content
- **posts**: Blog post entries

## Development Workflow

1. Make schema changes in `supabase/migrations/`
2. Apply migrations: `supabase db push` (or `supabase migration up` for local)
3. Regenerate types: `cd packages/supabase && pnpm typegen`
4. Commit the updated `database.types.ts` file

## Internal Dependencies

- `@ykzts/tsconfig` (dev dependency for TypeScript configuration)
