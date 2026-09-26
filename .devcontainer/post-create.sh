#!/bin/bash

set -euxo pipefail

sudo apt-get update
sudo apt-get install -y fonts-noto-cjk

# Named volumes are often created as root; ensure the container user owns them.
[ -d /home/node/.claude/ ] && sudo chown -R node:node /home/node/.claude/
[ -d /home/node/.grok/ ] && sudo chown -R node:node /home/node/.grok/
[ -d node_modules/ ] && sudo chown -R node:node node_modules/

# Install Grok Build CLI (https://x.ai/cli)
curl -fsSL https://x.ai/cli/install.sh | bash

pnpm install

# Agents rely on gh for GitHub access (issues, PRs, API); remind when it is not logged in.
if ! gh auth status >/dev/null 2>&1; then
  echo 'GitHub CLI is not authenticated. Run `gh auth login` before starting agent workflows.' >&2
fi
