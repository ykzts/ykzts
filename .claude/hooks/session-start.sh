#!/bin/bash
# SessionStart hook for Claude Code cloud sessions.
#
# The cloud image ships an older pnpm whose automatic version switch leaves a
# shebang-less shim on PATH, which breaks turbo (`Exec format error`). Install
# the pnpm version declared in `devEngines.packageManager` globally, then
# install dependencies. Node.js comes from `devEngines.runtime` via pnpm.
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "${CLAUDE_PROJECT_DIR:-.}"

pnpm_version="$(node -p 'require("./package.json").devEngines.packageManager.version')"

# `pnpm --version` is not a reliable check: an older pnpm switches to the
# declared version and reports it, so compare the globally installed package.
global_pnpm="$(npm root --global)/pnpm/package.json"
if [ "$(node -p "require('${global_pnpm}').version" 2>/dev/null || true)" != "$pnpm_version" ]; then
  npm install --global "pnpm@${pnpm_version}"
fi

# Run the install only if a file that decides what gets installed has changed
# since the install last succeeded.
hashes=node_modules/.session-start.sha256
if ! sha256sum --check --status "$hashes" 2>/dev/null; then
  rm -f "$hashes"

  pnpm install

  {
    sha256sum .claude/hooks/session-start.sh package.json pnpm-lock.yaml pnpm-workspace.yaml
    git ls-files -z -- '*/package.json' | xargs -0 sha256sum
  } > "$hashes" || rm -f "$hashes"
fi
