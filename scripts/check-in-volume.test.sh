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
  EXCLUDED_PROJECTS: 'app-e2e,oidc-provider-nest,geoservices-nest'
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
expect "test uses test.yml's list" "app-e2e,oidc-provider-nest,geoservices-nest" "$(excluded_projects "$repo" HEAD~1 test)"
expect "build uses build.yml's list, double-quoted" "app-e2e,oidc-provider-nest" "$(excluded_projects "$repo" HEAD~1 build)"
# The script names the branch as refs/heads/<branch>; Git Bash once rewrote that <rev>:<path>
# argument into a Windows path list.
expect "a branch with slashes, as the script names it" "app-e2e" "$(excluded_projects "$repo" refs/heads/fix/1-a lint)"
expect "a workflow with no list excludes nothing" "" "$(excluded_projects "$repo" HEAD lint)"
excluded_projects "$repo" HEAD test >/dev/null 2>&1
expect "a missing workflow is an error" "1" "$?"

# lint.yml's steps outside nx (#2286), in the shape of development on 24 October, plus the forms CI could grow.
cat >"$repo/.github/workflows/lint.yml" <<'YML'
jobs:
  lint:
    steps:
      - uses: actions/checkout@v7
      - name: Install Dependencies
        if: steps.npm-cache.outputs.cache-hit != 'true'
        run: npm ci
      - name: Typecheck the AggieMap smoke suite
        run: npx tsc -p test/smoke/aggiemap
      - name: Lint Affected
        run: npx nx affected:lint --configuration=production --base=${{ inputs.base }} --parallel=2
YML
git -C "$repo" add -A && git -C "$repo" -c user.name=t -c user.email=t@t commit -qm steps
expect "runs the smoke typecheck, not nx or the install" "run npx tsc -p test/smoke/aggiemap" "$(lint_steps "$repo" HEAD)"

cat >>"$repo/.github/workflows/lint.yml" <<'YML'
      - run: 'node scripts/collate-release-notes.mjs --check'
      - run: node node_modules/nx/dist/bin/nx.js format:check
      - run: |
          echo one
          echo two
      - run: echo ${{ github.sha }}
YML
git -C "$repo" add -A && git -C "$repo" -c user.name=t -c user.email=t@t commit -qm more
expect "a quoted step is unquoted, nx.js is skipped, and a block or \${{ }} cannot be run" \
  "run npx tsc -p test/smoke/aggiemap
run node scripts/collate-release-notes.mjs --check
cannot |
cannot echo \${{ github.sha }}" "$(lint_steps "$repo" HEAD)"
expect "lint.yml with no run: steps runs nothing" "" "$(lint_steps "$repo" HEAD~2)"
git -C "$repo" rm -q .github/workflows/lint.yml
git -C "$repo" -c user.name=t -c user.email=t@t commit -qm gone
lint_steps "$repo" HEAD >/dev/null 2>&1
expect "a missing lint.yml is an error" "1" "$?"

# A project list is checked against `nx show projects` (#2291), here a fixture of it.
printf '%s\n' common-ngx-pipes maps-esri aggiemap-angular gisday-nest >"$repo/projects.txt"
expect "real projects pass" "" "$(unknown_projects common-ngx-pipes,aggiemap-angular "$repo/projects.txt")"
expect "a misspelt project is named, with the nearest real one" "common-ngx-pipez (did you mean common-ngx-pipes?)" \
  "$(unknown_projects common-ngx-pipez "$repo/projects.txt")"
expect "a name nothing is close to is named alone, and each unknown one is listed" "maps-esri-x (did you mean maps-esri?)
nothing-like-it" "$(unknown_projects maps-esri-x,gisday-nest,nothing-like-it "$repo/projects.txt")"
expect "a trailing comma is not a project" "" "$(unknown_projects gisday-nest, "$repo/projects.txt")"

# The container's memory and Nx's parallel count come from the environment (#2498).
expect "16g and 8 when neither is set" "16g 8" "$(unset CHECK_MEMORY CHECK_PARALLEL; check_limits)"
expect "each honoured when set" "24g 12" "$(CHECK_MEMORY=24g CHECK_PARALLEL=12 check_limits)"
expect "a CHECK_PARALLEL that is not a number is refused, saying so" \
  "CHECK_PARALLEL must be a whole number above zero, not 'lots'." "$(CHECK_PARALLEL=lots check_limits 2>&1 >/dev/null)"
CHECK_PARALLEL=0 check_limits >/dev/null 2>&1
expect "a CHECK_PARALLEL of 0 is refused" "1" "$?"

exit "$failed"
