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
