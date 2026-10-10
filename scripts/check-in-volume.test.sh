#!/usr/bin/env bash
# Tests check-in-volume.sh's choice of CI exclusions per target (#1475), against fixture workflows
# committed to a throwaway repository. No Docker, no network; runs in a second:
#
#   bash scripts/check-in-volume.test.sh
#
# Exits non-zero, naming each failed case, if the script would skip a project CI checks or check one
# CI skips.
set -uo pipefail

# shellcheck source=check-in-volume.sh
. "$(dirname "$0")/check-in-volume.sh"

repo="$(mktemp -d)"
trap 'rm -rf "$repo"' EXIT
git init -q "$repo"
git -C "$repo" config core.autocrlf false
mkdir -p "$repo/.github/workflows"

# The shape of development on 9 October: lint.yml skips only the e2e projects, test and build skip more.
cat >"$repo/.github/workflows/lint.yml" <<'YML'
env:
  EXCLUDED_PROJECTS: 'app-e2e'
YML
cat >"$repo/.github/workflows/test.yml" <<'YML'
env:
  EXCLUDED_PROJECTS: 'app-e2e,oidc-provider-nest,signage-angular'
YML
cat >"$repo/.github/workflows/build.yml" <<'YML'
env:
  EXCLUDED_PROJECTS: "app-e2e,oidc-provider-nest"
jobs:
  build:
    steps:
      - run: npx nx affected:build --exclude=${{ env.EXCLUDED_PROJECTS }}
YML
git -C "$repo" add -A && git -C "$repo" -c user.name=t -c user.email=t@t commit -qm before
git -C "$repo" branch fix/1-a

# The shape after #1588: lint.yml has no list at all, and test.yml is gone.
sed -i '/^env:/d; /EXCLUDED_PROJECTS/d' "$repo/.github/workflows/lint.yml"
git -C "$repo" rm -q .github/workflows/test.yml
git -C "$repo" add -A && git -C "$repo" -c user.name=t -c user.email=t@t commit -qm after

failed=0
expect() { # <description> <expected> <actual>
  if [ "$2" = "$3" ]; then echo "ok   $1"; else echo "FAIL $1: expected [$2], got [$3]"; failed=1; fi
}

expect "lint uses lint.yml's list" "app-e2e" "$(excluded_projects "$repo" HEAD~1 lint)"
expect "test uses test.yml's list" "app-e2e,oidc-provider-nest,signage-angular" "$(excluded_projects "$repo" HEAD~1 test)"
expect "build uses build.yml's list, double-quoted" "app-e2e,oidc-provider-nest" "$(excluded_projects "$repo" HEAD~1 build)"
# The script names the branch as refs/heads/<branch>; Git Bash once rewrote that <rev>:<path>
# argument into a Windows path list.
expect "a branch with slashes, as the script names it" "app-e2e" "$(excluded_projects "$repo" refs/heads/fix/1-a lint)"
expect "a workflow with no list excludes nothing" "" "$(excluded_projects "$repo" HEAD lint)"
excluded_projects "$repo" HEAD test >/dev/null 2>&1
expect "a missing workflow is an error" "1" "$?"

exit "$failed"
