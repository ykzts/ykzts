#!/bin/bash

# Remove images that no container (running or stopped) uses and that were
# created more than a week ago. Docker Engine never garbage-collects images, so
# without this the Docker-in-Docker volumes grow until the host disk is full.
# Build cache is limited separately by the BuildKit GC policy in daemon.json.
#
# `until` filters on the image creation time, not its last use. Images of the
# local Supabase stack are kept while its containers exist; after
# `supabase stop` removes them, the images are pruned here and pulled again by
# the next `supabase start`.
#
# dockerd is started in the background by the docker-in-docker feature and may
# not be ready yet. Never fail or hang the container start because of it.

set -uo pipefail

readonly retention='168h'
readonly ready_timeout="${DOCKER_READY_TIMEOUT:-60}"

for ((elapsed = 0; elapsed < ready_timeout; elapsed++)); do
  if timeout 5 docker info >/dev/null 2>&1; then
    if ! docker image prune --all --force --filter "until=${retention}"; then
      echo 'warning: docker image prune failed; skipping.' >&2
    fi
    exit 0
  fi
  sleep 1
done

echo "warning: Docker daemon was not ready after ${ready_timeout}s; skipping image prune." >&2
exit 0
