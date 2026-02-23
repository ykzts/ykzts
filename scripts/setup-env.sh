#!/bin/bash
# scripts/setup-env.sh
# Generates .env files for each app using Local Supabase credentials.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

# Parse flags
FORCE=false
for arg in "$@"; do
  case "$arg" in
    -f|--force) FORCE=true ;;
  esac
done

# Detect supabase CLI
if command -v supabase &>/dev/null; then
  SUPABASE_CMD=(supabase)
elif command -v npx &>/dev/null; then
  SUPABASE_CMD=(npx supabase)
else
  echo "Error: supabase CLI not found. Install it or ensure npx is available." >&2
  exit 1
fi

# Check for jq
if ! command -v jq &>/dev/null; then
  echo "Error: jq is required. Install it with your package manager." >&2
  exit 1
fi

# Fetch Supabase credentials
echo "Fetching Supabase credentials..."
SUPABASE_STATUS=$("${SUPABASE_CMD[@]}" status -o json 2>/dev/null) || {
  echo "Error: Failed to get Supabase status. Make sure Local Supabase is running." >&2
  echo "Start it with: ${SUPABASE_CMD[*]} start" >&2
  exit 1
}

# Support both flat (.API_URL) and nested (.api.url) JSON formats across CLI versions
SUPABASE_URL=$(echo "$SUPABASE_STATUS" | jq -r '.API_URL // .api.url // empty')
SUPABASE_ANON_KEY=$(echo "$SUPABASE_STATUS" | jq -r '.ANON_KEY // .api.anon_key // empty')
SUPABASE_SERVICE_ROLE_KEY=$(echo "$SUPABASE_STATUS" | jq -r '.SERVICE_ROLE_KEY // .api.service_role_key // empty')

if [ -z "$SUPABASE_URL" ]; then
  echo "Error: Could not retrieve Supabase URL from status output." >&2
  exit 1
fi
if [ -z "$SUPABASE_ANON_KEY" ]; then
  echo "Error: Could not retrieve Supabase Anon Key from status output." >&2
  exit 1
fi
if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
  echo "Error: Could not retrieve Supabase Service Role Key from status output." >&2
  exit 1
fi

# Portable sed -i (macOS requires an explicit backup extension)
sed_inplace() {
  if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' "$@"
  else
    sed -i "$@"
  fi
}

# Generate .env for each app that has a .env.example
NEEDS_MANUAL=()

for app_dir in "$ROOT_DIR"/apps/*/; do
  if [ ! -f "${app_dir}.env.example" ]; then
    continue
  fi

  env_file="${app_dir}.env"

  if [ -f "$env_file" ] && [ "$FORCE" = false ]; then
    read -r -p "⚠  ${env_file} already exists. Overwrite? [y/N] " confirm || true
    if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
      echo "Skipped ${env_file}"
      continue
    fi
  fi

  cp "${app_dir}.env.example" "$env_file"
  sed_inplace "s|<SUPABASE_URL>|${SUPABASE_URL}|g" "$env_file"
  sed_inplace "s|<SUPABASE_ANON_KEY>|${SUPABASE_ANON_KEY}|g" "$env_file"
  sed_inplace "s|<SUPABASE_SERVICE_ROLE_KEY>|${SUPABASE_SERVICE_ROLE_KEY}|g" "$env_file"
  echo "✓ Generated $env_file"

  # Collect any remaining unfilled placeholders (values starting with "your-")
  remaining=$(grep -E '^[A-Z_]+=your-' "$env_file") || true
  if [ -n "$remaining" ]; then
    NEEDS_MANUAL+=("$env_file")
  fi
done

if [ ${#NEEDS_MANUAL[@]} -gt 0 ]; then
  echo ""
  echo "Note: The following .env files contain values that require manual configuration:"
  for f in "${NEEDS_MANUAL[@]}"; do
    echo "  $f"
    grep -E '^[A-Z_]+=your-' "$f" | cut -d= -f1 | while read -r var; do
      echo "    - ${var}"
    done
  done
  echo ""
  echo "Please update these values in the respective .env files."
fi
