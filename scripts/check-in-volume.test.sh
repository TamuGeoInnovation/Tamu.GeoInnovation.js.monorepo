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

# The free-space guard (#3400). A check that cannot run must say so itself, rather than arriving as
# Docker's exit 125, which reads as a failing branch.
free_space_check . 1 >/dev/null 2>&1
expect "a disk with room lets the check start" "0" "$?"
free_space_check . 99999999 >/dev/null 2>&1
expect "a disk without room stops the check" "1" "$?"
msg="$(free_space_check . 99999999 2>&1 >/dev/null)"
case "$msg" in *"GiB free"*) r=yes ;; *) r=no ;; esac
expect "the refusal names the free space" "yes" "$r"
case "$msg" in *"99999999 GiB"*) r=yes ;; *) r=no ;; esac
expect "the refusal names what the check needs" "yes" "$r"
case "$msg" in *"tidy.sh"*) r=yes ;; *) r=no ;; esac
expect "the refusal says what to do about it" "yes" "$r"
CHECK_MIN_FREE_GB=99999999 free_space_check . >/dev/null 2>&1
expect "CHECK_MIN_FREE_GB sets the threshold" "1" "$?"
free_space_check /no/such/path/at/all >/dev/null 2>&1
expect "an unreadable path stops the check rather than passing it" "1" "$?"

# The sweep watermark sits above the refusal threshold, so a machine clears itself while it still has room
# rather than at the moment a check is blocked (#3400).
sweep_needed . 1 && r=sweep || r=no
expect "a disk with room needs no sweep" "no" "$r"
sweep_needed . 99999999 && r=sweep || r=no
expect "a disk running low asks for a sweep" "sweep" "$r"
CHECK_SWEEP_FREE_GB=99999999 sweep_needed . && r=sweep || r=no
expect "CHECK_SWEEP_FREE_GB sets the watermark" "sweep" "$r"

# The container is named after its volume, and a second check in the same volume is refused rather than run on top of
# the first (#3406). Docker is replaced by a stub that answers from $states and records what it was asked to remove.
states=""
removed=""
docker() {
  case "$1" in
    inspect)
      local s
      s="$(printf '%s\n' "$states" | awk -v n="${*: -1}" '$1 == n { print $2 }')"
      [ -n "$s" ] && echo "$s" || return 1
      ;;
    rm) removed="$removed ${*: -1}" ;;
  esac
}
container_free check-tamu-js-1 && r=free || r=refused
expect "no container of that name: the check may start" "free" "$r"
states="check-tamu-js-1 running"
msg="$(container_free check-tamu-js-1 2>&1)" && r=free || r=refused
expect "a running check in that volume refuses a second" "refused" "$r"
case "$msg" in *"check-tamu-js-1"*"docker ps"*) r=yes ;; *) r=no ;; esac
expect "and says which container, and how to see it" "yes" "$r"
states="check-tamu-js-1 exited"
removed=""
container_free check-tamu-js-1 && r=free || r=refused
expect "a stopped leftover does not block the check" "free" "$r"
expect "and is removed first" " check-tamu-js-1" "$removed"
unset -f docker
grep -q -- '--name "$container"' "$(dirname "$0")/check-in-volume.sh" && r=yes || r=no
expect "the check's docker run is named" "yes" "$r"

exit "$failed"
