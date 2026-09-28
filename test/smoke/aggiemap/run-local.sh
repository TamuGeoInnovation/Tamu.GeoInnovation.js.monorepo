#!/usr/bin/env bash
# Runs the AggieMap smoke suite from a workstation, in the Playwright container, with the same
# per-environment settings as the scheduled workflow (environments.json in this folder).
#
#   test/smoke/aggiemap/run-local.sh development   # dev.aggiemap.tamu.edu
#   test/smoke/aggiemap/run-local.sh production    # aggiemap.tamu.edu
#   test/smoke/aggiemap/run-local.sh local         # a dev server running in the aggiemap-dev container
#
# Anything after the environment is passed to `playwright test`, e.g. `--grep "gameday"`.
# Needs only Docker and bash (Git Bash on Windows); Node runs inside the container. The first run
# downloads the Playwright image, about 2 GB.
set -euo pipefail

env_name="${1:-}"
case "$env_name" in
  development | production | local) shift ;;
  *)
    echo "usage: $0 development|production|local [playwright args...]" >&2
    exit 2
    ;;
esac

cd "$(git rev-parse --show-toplevel)"

# The image must match the installed @playwright/test, or its browsers will not be the ones the
# library expects.
pw_version=$(sed -n 's/.*"@playwright\/test": *"[^0-9]*\([0-9][0-9.]*\)".*/\1/p' package.json)
image="mcr.microsoft.com/playwright:v${pw_version}-noble"

# Git Bash rewrites Unix-looking paths such as /work; Docker Desktop wants a Windows path to mount.
export MSYS_NO_PATHCONV=1
mount=$(pwd -W 2>/dev/null || pwd)

# A local run shares the dev server container's network so the browser reaches it on 127.0.0.1,
# which is the address the Angular dev server and the dining API's CORS allowlist accept. See the
# README's local section.
network_args=()
if [ "$env_name" = local ]; then
  if ! docker ps --format '{{.Names}}' | grep -qx aggiemap-dev; then
    echo "No aggiemap-dev container is running. Start the dev server first (GETTING_STARTED.md, Path 5)." >&2
    exit 1
  fi
  network_args=(--network container:aggiemap-dev)
fi

echo "Smoke suite: $env_name, $image"

docker run --rm ${network_args[@]+"${network_args[@]}"} -v "$mount:/work" -w /work -e SMOKE_ENV="$env_name" "$image" \
  node -e '
    const settings = require("./test/smoke/aggiemap/environments.json")[process.env.SMOKE_ENV];
    const env = {
      ...process.env,
      AGGIEMAP_SMOKE_BASE_URL: settings.baseUrl,
      AGGIEMAP_SMOKE_ALLOWED_LAYER_FAILURES: settings.allowedLayerFailures.join(",")
    };
    if (settings.gtag) env.AGGIEMAP_EXPECTED_GTAG_ID = settings.gtag;
    const run = require("child_process").spawnSync(
      "npx",
      ["playwright", "test", "--config=playwright.aggiemap-smoke.config.ts", ...process.argv.slice(1)],
      { stdio: "inherit", env }
    );
    process.exit(run.status === null ? 1 : run.status);
  ' -- "$@"
