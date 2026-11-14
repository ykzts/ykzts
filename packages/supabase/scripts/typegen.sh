#!/bin/bash

# Type generation script for Supabase database schema
# This script generates TypeScript types from the Supabase database schema.
#
# It uses the Supabase CLI pinned in this package's devDependencies so that
# the generated output is reproducible (an unpinned `npx supabase` resolves to
# whatever the latest release is, and newer generators change the output).
# A global `supabase` in PATH is only used as a fallback when dependencies are
# not installed. If no CLI is available, or local Supabase is not running, it
# gracefully skips (types are committed in the repo).

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PACKAGE_DIR="$(dirname "$SCRIPT_DIR")"
OUTPUT_FILE="$PACKAGE_DIR/src/database.types.ts"
TEMP_FILE="$OUTPUT_FILE.tmp"
REPO_ROOT="$(cd "$PACKAGE_DIR/../.." && pwd)"
LOCAL_SUPABASE="$PACKAGE_DIR/node_modules/.bin/supabase"
BIOME="$REPO_ROOT/node_modules/.bin/biome"

# Detect supabase CLI (prefer the version pinned in package.json)
if [ -x "$LOCAL_SUPABASE" ]; then
  SUPABASE_CMD=("$LOCAL_SUPABASE")
elif command -v supabase &>/dev/null; then
  SUPABASE_CMD=(supabase)
  echo "Warning: pinned Supabase CLI not installed (run 'pnpm install'); using global 'supabase' ($(supabase --version 2>/dev/null || echo unknown)). Output may differ from the committed types."
else
  echo "Skipping typegen: Supabase CLI not found (run 'pnpm install'). Types are already committed."
  exit 0
fi

# Generate types to a temporary file
echo "Generating TypeScript types from Supabase schema using ${SUPABASE_CMD[*]}..."
if ! "${SUPABASE_CMD[@]}" gen types typescript --local > "$TEMP_FILE"; then
  echo "Warning: Failed to generate types (is local Supabase running with 'supabase start'?). Keeping existing committed types."
  rm -f "$TEMP_FILE" || true
  exit 0
fi

# Only overwrite the output file if generation succeeded
mv "$TEMP_FILE" "$OUTPUT_FILE"

# The CLI emits unformatted TypeScript, so format it with the repository's
# Biome config to keep the committed file stable and reviewable.
if [ -x "$BIOME" ]; then
  (cd "$REPO_ROOT" && "$BIOME" format --write "$OUTPUT_FILE")
else
  echo "Warning: Biome not found at $BIOME (run 'pnpm install'); generated types are left unformatted."
fi

echo "✓ Types generated successfully at $OUTPUT_FILE"
