#!/usr/bin/env bash
# Runs the AggieMap smoke suite from a workstation, in the Playwright container, with the same
# per-environment settings as the scheduled workflow (environments.json in this folder).
#
#   test/smoke/aggiemap/run-local.sh development   # dev.aggiemap.tamu.edu
#   test/smoke/aggiemap/run-local.sh production    # aggiemap.tamu.edu
#   test/smoke/aggiemap/run-local.sh local         # a dev server running in the aggiemap-dev container
#   test/smoke/aggiemap/run-local.sh local-production
#                                     # the same dev server as production renders it: 127.0.0.1 is not
#                                     # a dev host, so development-only features are hidden
#
# Anything after the environment is passed to `playwright test`, e.g. `--grep "gameday"`.
#
# A local run checks a release, so framing.spec.ts opens one route per map (#1426). The scheduled
# workflow on GitHub checks all of them; to do the same here, set AGGIEMAP_SMOKE_FRAMING=full.
# Needs only Docker and bash (Git Bash on Windows); Node runs inside the container. The first run
# downloads the Playwright image, about 2 GB.
#
# The checkout's node_modules is not used, so a checkout or worktree without an install can run the
# suite (#1459). The suite needs three packages: @playwright/test, pngjs and esri-loader. They live in
# the Docker volume tamu-js-smoke-nm, mounted over /work/node_modules, at the versions package-lock.json
# records. The first run installs them, in a few seconds, and so does any run after those versions
# change. Docker leaves an empty node_modules folder in a checkout that had none.
#
# Each run writes a small file into docs/build-times/runs/ in this checkout (scripts/run-times.sh, #1593):
# when it started, in US Central, the machine (BUILD_TIMES_MACHINE), what ran, Playwright's totals and the
# elapsed time. Commit the file with your work.
set -euo pipefail

env_name="${1:-}"
case "$env_name" in
  development | production | local | local-production) shift ;;
  *)
    echo "usage: $0 development|production|local|local-production [playwright args...]" >&2
    exit 2
    ;;
esac

cd "$(git rev-parse --show-toplevel)"
# shellcheck source=../../../scripts/run-times.sh
. scripts/run-times.sh
started="$(run_times_now)"
SECONDS=0

# The image must match the installed @playwright/test, or its browsers will not be the ones the
# library expects. The container checks that package-lock.json records the same version.
pw_version=$(sed -n 's/.*"@playwright\/test": *"[^0-9]*\([0-9][0-9.]*\)".*/\1/p' package.json)
image="mcr.microsoft.com/playwright:v${pw_version}-noble"

# Git Bash rewrites Unix-looking paths such as /work; Docker Desktop wants a Windows path to mount.
export MSYS_NO_PATHCONV=1
mount=$(pwd -W 2>/dev/null || pwd)

# A local run shares the dev server container's network so the browser reaches it on localhost,
# which is the address the Angular dev server and the dining API's CORS allowlist accept. See the
# README's local section.
network_args=()
if [ "$env_name" = local ] || [ "$env_name" = local-production ]; then
  if ! docker ps --format '{{.Names}}' | grep -qx aggiemap-dev; then
    echo "No aggiemap-dev container is running. Start the dev server first (GETTING_STARTED.md, Path 5)." >&2
    exit 1
  fi
  network_args=(--network container:aggiemap-dev)
fi

volume=tamu-js-smoke-nm

echo "Smoke suite: $env_name, $image"

# The output is copied to a file for Playwright's totals, which go into the run's record.
output="$(mktemp)"
trap 'rm -f "$output"' EXIT
set +e
docker run --rm ${network_args[@]+"${network_args[@]}"} -v "$mount:/work" -v "$volume:/work/node_modules" -w /work \
  -e SMOKE_ENV="$env_name" -e SMOKE_VOLUME="$volume" -e PW_VERSION="$pw_version" -e NPM_CONFIG_UPDATE_NOTIFIER=false -e UPDATE_FRAMING_BASELINE \
  -e AGGIEMAP_SMOKE_FRAMING="${AGGIEMAP_SMOKE_FRAMING:-release}" "$image" \
  node -e '
    const fs = require("fs");

    // Install the three packages into the volume unless it already holds the versions the lock records.
    const lock = require("./package-lock.json").packages;
    const wanted = ["@playwright/test", "pngjs", "esri-loader"]
      .map((name) => `${name}@${lock["node_modules/" + name].version}`)
      .join(" ");
    if (!wanted.startsWith(`@playwright/test@${process.env.PW_VERSION} `)) {
      console.error(`The image is Playwright ${process.env.PW_VERSION}, but package-lock.json records ${wanted}.`);
      process.exit(2);
    }
    const stamp = "node_modules/.smoke-packages";
    if (!fs.existsSync(stamp) || fs.readFileSync(stamp, "utf8") !== wanted) {
      console.log(`Installing ${wanted} into the ${process.env.SMOKE_VOLUME} volume`);
      // In an empty folder, so npm does not read the checkout package.json and install all of it.
      const dir = fs.mkdtempSync("/tmp/smoke-");
      const steps = [
        ["npm", ["install", "--no-save", "--no-package-lock", "--no-audit", "--no-fund", ...wanted.split(" ")], dir],
        ["find", ["node_modules", "-mindepth", "1", "-delete"], "/work"],
        ["cp", ["-a", `${dir}/node_modules/.`, "node_modules/"], "/work"]
      ];
      for (const [command, args, cwd] of steps) {
        const step = require("child_process").spawnSync(command, args, { stdio: "inherit", cwd });
        if (step.status !== 0) process.exit(step.status === null ? 1 : step.status);
      }
      fs.writeFileSync(stamp, wanted);
    }

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
  ' -- "$@" 2>&1 | tee "$output"
code=${PIPESTATUS[0]}
set -e
run_times_record docs/build-times/runs "$started" smoke \
  "$env_name framing=${AGGIEMAP_SMOKE_FRAMING:-release}${*:+ $*}" "$code" "$(run_times_smoke_summary "$output")" "$SECONDS"
exit "$code"
