#!/usr/bin/env bash
# Runs only the part of the smoke suite a change can affect (#1427).
#
#   scripts/smoke-scoped.sh <environment> [base-ref]
#
#   scripts/smoke-scoped.sh development                  # against origin/development
#   scripts/smoke-scoped.sh development origin/main      # against another base
#
# Why: the full suite is about 757 tests and an hour and a half, and it gates every release. A
# change to one map's definitions cannot affect the other sixty-eight. For the Men's Basketball
# parking fix (#1431) this is roughly 36 tests instead of 757.
#
# It decides nothing itself. The decision lives in test/smoke/aggiemap/scope.ts, which has its own
# tests, so the shell script and the tests cannot drift apart.
#
# **It fails open.** Anything scope.ts does not confidently understand means the whole suite runs,
# and the run says why. The dangerous failure here is the quiet one: silently testing less.
#
# **This does not replace the scheduled full run.** The suite exists because maps break *without* a
# release - a hosted GIS service is republished and no commit is involved - which scoping by what
# changed cannot see. The daily run against dev and production keeps running everything.

set -euo pipefail

env_name=${1:-}
base=${2:-origin/development}

case "$env_name" in
  development | production | local | local-production) ;;
  *)
    echo "usage: $0 development|production|local|local-production [base-ref]" >&2
    exit 2
    ;;
esac

cd "$(git rev-parse --show-toplevel)"

pw_version=$(sed -n 's/.*"@playwright\/test": *"[^0-9]*\([0-9][0-9.]*\)".*/\1/p' package.json)
image="mcr.microsoft.com/playwright:v${pw_version}-noble"

export MSYS_NO_PATHCONV=1
mount=$(pwd -W 2>/dev/null || pwd)

if ! git rev-parse --verify --quiet "$base" >/dev/null; then
  echo "Base ref '$base' is unknown here. Fetch it first, or pass one that exists." >&2
  exit 2
fi

changed=$(git diff --name-only "$base"...HEAD)

echo "Changed against $base:"
if [ -z "$changed" ]; then
  echo "  (nothing)"
else
  echo "$changed" | sed 's/^/  /'
fi

if [ ! -d node_modules/ts-node ]; then
  echo "node_modules/ts-node is missing here. Run npm ci in this checkout first." >&2
  echo "(A git worktree needs its own install; see CLAUDE.md.)" >&2
  exit 2
fi

# scope.ts decides; this only reports and obeys.
#
# `node node_modules/ts-node/...` rather than `npx ts-node`: npx quietly downloads a different
# ts-node when the local one is not found, and that copy cannot see this repository's typescript, so
# it fails with an error about `fileExists` that has nothing to do with the cause. CLAUDE.md makes
# the same point about `npx nx`.
scope=$(printf '%s\n' "$changed" | docker run --rm -i -v "$mount:/work" -w /work "$image" \
  node node_modules/ts-node/dist/bin.js --transpile-only --compiler-options '{"module":"commonjs"}' \
  test/smoke/aggiemap/scope-cli.ts)

eval "$scope"

echo
echo "Scope: $REASON"

if [ "$SCOPABLE" != "yes" ]; then
  echo "Running the whole suite."
  exec test/smoke/aggiemap/run-local.sh "$env_name"
fi

status=0

if [ -n "$ROUTES" ]; then
  echo "Phase 1: the affected routes, and the checks that cannot be selected by spec file."
  test/smoke/aggiemap/run-local.sh "$env_name" --grep "$GREP" || status=$?
else
  echo "Phase 1: skipped, nothing that reaches a deployed map changed."
fi

echo
echo "Phase 2: the checks that always run."
# shellcheck disable=SC2086
test/smoke/aggiemap/run-local.sh "$env_name" $ALWAYS || status=$?

echo
if [ "$status" -eq 0 ]; then
  echo "Scoped run passed. This is not the full suite: $REASON"
else
  echo "Scoped run failed (exit $status)."
fi

exit "$status"
