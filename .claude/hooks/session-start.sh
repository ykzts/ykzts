#!/bin/bash
# SessionStart hook for Claude Code cloud sessions: install the pnpm declared
# in `devEngines.packageManager` with the official install script, then install
# dependencies. pnpm provides Node.js from `devEngines.runtime`.
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR"

export PNPM_HOME="$HOME/.local/share/pnpm"
export PATH="$PNPM_HOME/bin:$PATH"

curl -fsSL https://get.pnpm.io/install.sh |
  env PNPM_VERSION="$(node -p 'require("./package.json").devEngines.packageManager.version')" PNPM_NO_MODIFY_PATH=1 sh -

echo "export PNPM_HOME=\"$PNPM_HOME\" PATH=\"$PNPM_HOME/bin:\$PATH\"" >> "$CLAUDE_ENV_FILE"

pnpm install
