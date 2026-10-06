#!/usr/bin/env bash
# Captures one screenshot of a deployed page, straight into the repository.
#
#   scripts/capture-screenshot.sh <url> <output.png> [selector] [wait-ms]
#
#   scripts/capture-screenshot.sh https://dev.aggiemap.tamu.edu/map/d \
#     docs/screenshots/1418-remove-last-150th/before-layer-list.png 'tamu-gisc-layer-list'
#
# Why this exists: every pull request with a visible result needs before and after images, and a
# "before" stops being obtainable the moment the fix is on disk - recovering one means stashing the
# change, rebuilding and re-capturing. Taking one has to be cheap enough to do while the state still
# exists, even when it may never be used. See CLAUDE.md.
#
# Runs in the same Playwright image as the smoke suite, so a capture needs no host browser and no
# host Node. Output is written relative to the repository root, which is bind-mounted.
#
# `selector` clips the shot to one element, which is usually what a reviewer wants: a layer list, a
# popup, one section of a page. Omit it for the whole viewport.

set -euo pipefail

url=${1:-}
output=${2:-}
selector=${3:-}
wait_ms=${4:-15000}

if [ -z "$url" ] || [ -z "$output" ]; then
  echo "usage: $0 <url> <output.png> [selector] [wait-ms]" >&2
  exit 2
fi

cd "$(git rev-parse --show-toplevel)"

mkdir -p "$(dirname "$output")"

# The Playwright image ships the browsers, not the module, so it resolves `playwright-core` from this
# checkout. A fresh worktree has no `node_modules` and would fail inside the container with a bare
# MODULE_NOT_FOUND, which says nothing about the cause. `smoke-scoped.sh` guards its ts-node the same
# way.
if [ ! -d node_modules/playwright-core ]; then
  echo "node_modules/playwright-core is missing here. Run npm ci in this checkout first," >&2
  echo "or run this from the main checkout. (A git worktree needs its own install; see CLAUDE.md.)" >&2
  exit 2
fi

pw_version=$(sed -n 's/.*"@playwright\/test": *"[^0-9]*\([0-9][0-9.]*\)".*/\1/p' package.json)
image="mcr.microsoft.com/playwright:v${pw_version}-noble"

export MSYS_NO_PATHCONV=1
mount=$(pwd -W 2>/dev/null || pwd)

echo "Capturing $url -> $output${selector:+ (clipped to $selector)}"

docker run --rm -i \
  -v "$mount:/work" -w /work \
  -e CAPTURE_URL="$url" -e CAPTURE_OUTPUT="$output" -e CAPTURE_SELECTOR="$selector" -e CAPTURE_WAIT="$wait_ms" \
  "$image" node -e '
const { chromium } = require("playwright-core");
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
    timezoneId: "America/Chicago"
  });

  await page.goto(process.env.CAPTURE_URL, { waitUntil: "load" });

  // The maps take their time: Esri draws for 20 to 40 seconds, and a layer list is not populated
  // until its layers have loaded. Waiting on the probe where there is one, and on the clock where
  // there is not, is what makes a capture reproducible rather than a race.
  await page.waitForTimeout(Number(process.env.CAPTURE_WAIT));

  const selector = process.env.CAPTURE_SELECTOR;
  const target = selector ? page.locator(selector).first() : page;

  if (selector) {
    await target.waitFor({ state: "visible", timeout: 30000 });
  }

  await target.screenshot({ path: process.env.CAPTURE_OUTPUT });
  await browser.close();
})().catch((error) => { console.error(error.message); process.exit(1); });
'

echo "Wrote $output"
