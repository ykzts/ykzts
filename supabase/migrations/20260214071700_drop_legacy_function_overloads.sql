-- Migration: Drop legacy function overloads after p_version_date parameter was added
-- Phase 4.2: Cleanup old function signatures that are no longer needed
-- PR #3355 added p_version_date parameter but didn't drop the old signatures,
-- causing function overloads to exist in the database.

-- Drop the old create_post function (7 parameters, without p_version_date)
DROP FUNCTION IF EXISTS create_post(TEXT, TEXT, TEXT, JSONB, TEXT[], TEXT, TIMESTAMPTZ);

-- Drop the old update_post function (9 parameters, without p_version_date)
DROP FUNCTION IF EXISTS update_post(UUID, TEXT, TEXT, TEXT, JSONB, TEXT[], TEXT, TIMESTAMPTZ, TEXT);

-- Note: The new function signatures with p_version_date (optional, DEFAULT NULL)
-- are backward compatible and cover all previous use cases:
-- - create_post(..., p_version_date TIMESTAMPTZ DEFAULT NULL) - 8 parameters
-- - update_post(..., p_version_date TIMESTAMPTZ DEFAULT NULL) - 10 parameters
