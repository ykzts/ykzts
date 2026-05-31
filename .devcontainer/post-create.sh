#!/bin/sh

set -e

[ -d node_modules/ ] && sudo chown -R node node_modules/
pnpm install
