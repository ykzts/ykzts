#!/bin/bash

# Type generation script for Supabase database schema
# This script generates TypeScript types from the Supabase database schema.
# It falls back to `npx supabase` (like scripts/setup-env.sh) if no global
# `supabase` is in PATH. If Supabase CLI is unavailable, it gracefully skips
# (types are committed in the repo).

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PACKAGE_DIR="$(dirname "$SCRIPT_DIR")"
OUTPUT_FILE="$PACKAGE_DIR/src/database.types.ts"
TEMP_FILE="$OUTPUT_FILE.tmp"

# Detect supabase CLI (with npx fallback, matching scripts/setup-env.sh)
if command -v supabase &>/dev/null; then
  SUPABASE_CMD=(supabase)
elif command -v npx &>/dev/null; then
  SUPABASE_CMD=(npx --yes supabase)
else
  echo "Skipping typegen: Supabase CLI not found (neither 'supabase' nor 'npx' available). Types are already committed."
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

echo "✓ Types generated successfully at $OUTPUT_FILE"
