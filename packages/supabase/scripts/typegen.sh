#!/bin/sh

# Type generation script for Supabase database schema
# This script generates TypeScript types from the Supabase database schema.
# It gracefully handles the case where Supabase CLI is not installed.

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PACKAGE_DIR="$(dirname "$SCRIPT_DIR")"
OUTPUT_FILE="$PACKAGE_DIR/src/database.types.ts"
TEMP_FILE="$OUTPUT_FILE.tmp"

# Check if Supabase CLI is installed
if ! command -v supabase >/dev/null 2>&1; then
  echo "Skipping typegen: Supabase CLI not installed (types are already committed)"
  exit 0
fi

# Generate types to a temporary file
echo "Generating TypeScript types from Supabase schema..."
supabase gen types typescript --local > "$TEMP_FILE"

# Only overwrite the output file if generation succeeded
mv "$TEMP_FILE" "$OUTPUT_FILE"

echo "✓ Types generated successfully at $OUTPUT_FILE"
