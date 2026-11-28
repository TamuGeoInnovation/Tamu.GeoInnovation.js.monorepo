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

# #1938, #2067: the build runs in the configuration build.yml builds with, read from it, so the two cannot drift apart.
# Without it the seven apps whose defaultConfiguration is "" were built with no budgets and no AOT, and CI found what
# this check let through.
expect "build uses the configuration this repository's build.yml builds with" "production" \
  "$(build_configuration "$(cd "$(dirname "$0")/.." && pwd)" HEAD)"
expect "a build.yml whose build names no configuration gives none" "" "$(build_configuration "$repo" HEAD~1)"
build_configuration "$repo" HEAD~9 >/dev/null 2>&1
expect "a missing build.yml is an error" "1" "$?"

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
      - name: Point origin/development at the base repository's, when this is a fork
        run: git fetch --no-tags "https://github.com/$UPSTREAM.git" '+refs/heads/development:refs/remotes/origin/development'
      - run: |
          echo one
          echo two
      - run: echo ${{ github.sha }}
YML
git -C "$repo" add -A && git -C "$repo" -c user.name=t -c user.email=t@t commit -qm more
# The fetch is setup, not a check: in a fork it points origin/development at the base repository's (#3557),
# and here the check's own clone has already fetched it. Skipped like the install, rather than run or refused.
expect "a quoted step is unquoted, nx.js and the fork fetch are skipped, and a block or \${{ }} cannot be run" \
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


# The log's name, from the mode (#1855). Built from every project in a bug fix's list, fifteen names passed the length
# Windows allows and the check died with "File name too long" before running anything.
expect "affected names its log affected" "affected" "$(log_label affected)"
expect "a short project list names its log as before" "gisday-nest-gisday-angular" "$(log_label gisday-nest,gisday-angular)"
long="$(printf 'gisday-platform-ngx-common-%s,' 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15)gisday-angular"
expect "a long project list's name is at most 80 characters" "yes" "$([ "${#long}" -gt 80 ] && [ "$(log_label "$long" | wc -c)" -le 81 ] && echo yes || echo no)"
expect "and still names its first project" "yes" "$(case "$(log_label "$long")" in gisday-platform-ngx-common-1-*) echo yes ;; *) echo no ;; esac)"
expect "and says how many there are" "yes" "$(case "$(log_label "$long")" in *16-projects*) echo yes ;; *) echo no ;; esac)"
other="${long%,gisday-angular},gisday-nest"
expect "two long lists that differ get different names" "yes" "$([ "$(log_label "$long")" != "$(log_label "$other")" ] && echo yes || echo no)"

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

# #3000: a check whose tasks were killed for memory says so, rather than leaving a failure that reads as the code's.
# The three ways a kill shows in a check's log, each as the laptop's and home's checks logged them on 23 November.
logs="$(mktemp -d)"
printf '%s\n' '> nx run gisday-angular:build-app' '' 'Killed' 'Warning: command "ng build" exited with non-zero status code' >"$logs/killed.log"
printf '%s\n' '    A jest worker process (pid=1180) was terminated by another process: signal=SIGKILL, exitCode=null.' >"$logs/sigkill.log"
printf '%s\n' 'npm error command failed' 'npm error signal SIGKILL' 'Process exited with code 137' >"$logs/137.log"
printf '%s\n' '  x should report a Killed status for the session (12 ms)' 'Tests: 1 failed, 497 passed' 'Exit 1' >"$logs/clean.log"
expect "Killed on its own line is a memory kill" "1" "$(memory_kills "$logs/killed.log")"
expect "a SIGKILLed Jest worker is a memory kill" "1" "$(memory_kills "$logs/sigkill.log")"
expect "exit code 137 is a memory kill" "2" "$(memory_kills "$logs/137.log")"
memory_kills "$logs/clean.log" >/dev/null && r=yes || r=no
expect "a failing test that merely says Killed is not" "no" "$r"
advice="$(memory_advice "$logs/sigkill.log" 1)"
case "$advice" in *memory*"CHECK_PARALLEL"*"CHECK_MEMORY"*) r=yes ;; *) r=no ;; esac
expect "a failed check with a kill says it was memory, and what to set" "yes" "$r"
expect "a passing check says nothing" "" "$(memory_advice "$logs/sigkill.log" 0)"
expect "a failure with no kill says nothing" "" "$(memory_advice "$logs/clean.log" 1)"
grep -q 'memory_advice "$log" "$code"' "$(dirname "$0")/check-in-volume.sh" && r=yes || r=no
expect "the check gives that advice after its run" "yes" "$r"

# #3622: a check that failed with nothing in its log to say why. The silent log is the shape of the real one from
# 25 November 2026 - nine tasks green, ts-events-angular:build:production printing only Building... and then failing,
# with no error, no stack, no Killed and no mention of memory anywhere.
printf '%s\n' "> nx run ts-events-angular:build:production" "  Building..." " NX   Running target build for 6 projects and 4 tasks they depend on failed" "" "Failed tasks:" "- ts-events-angular:build:production" >"$logs/silent.log"
printf '%s\n' "ERROR: bundle initial exceeded maximum budget" "Failed tasks:" "- correction-lite-angular:build:production" >"$logs/budget.log"
expect "the failed tasks are read from Nx's list" "ts-events-angular:build:production" "$(failed_tasks "$logs/silent.log")"
silent_failure "$logs/silent.log" 1 && r=yes || r=no
expect "a failure whose log explains nothing is a silent failure" yes "$r"
silent_failure "$logs/silent.log" 0 && r=yes || r=no
expect "a passing run is not, whatever its log says" no "$r"
silent_failure "$logs/budget.log" 1 && r=yes || r=no
expect "a bundle budget explains itself, so it is not" no "$r"
silent_failure "$logs/killed.log" 1 && r=yes || r=no
expect "nor is a memory kill, which memory_advice already names" no "$r"
silent_failure "$logs/clean.log" 1 && r=yes || r=no
expect "nor is a failing test, which says Tests: 1 failed" no "$r"
advice="$(silent_failure_advice "$logs/silent.log" 1)"
case "$advice" in *"resource kill"*"ts-events-angular:build:production"*"CHECK_PARALLEL=8"*) r=yes ;; *) r=no ;; esac
expect "it says resource kill until proved otherwise, names the task and gives the defaults" yes "$r"
expect "and says nothing for a failure that did explain itself" "" "$(silent_failure_advice "$logs/budget.log" 1)"
grep -q 'silent_failure_advice "$log" "$code"' "$(dirname "$0")/check-in-volume.sh" && r=yes || r=no
expect "the check gives that advice after its run too" yes "$r"

# #3622: a failed run's log is kept, because the next run of the same branch truncates it.
grep -q 'kept="${log%.log}-failed-' "$(dirname "$0")/check-in-volume.sh" && r=yes || r=no
expect "a failed run's log is copied to a stamped name" yes "$r"
rm -rf "$logs"

# #3695: a read of the checkout that fails once with "Cannot allocate memory" is tried again, not reported as exit 3.
# `step` is the container's; a stand-in that runs the command is enough here.
step() { shift; "$@"; }
tries="$(mktemp)"
flaky() { echo x >>"$tries"; [ "$(wc -l <"$tries")" -ge 2 ]; }
CHECK_RETRY_DELAY=0 retry_once "clone" flaky >/dev/null && r=passed || r=failed
expect "a read that fails once and then succeeds passes" "passed" "$r"
expect "and was tried exactly twice" "2" "$(wc -l <"$tries" | tr -d ' ')"
: >"$tries"
broken() { echo x >>"$tries"; return 1; }
CHECK_RETRY_DELAY=0 retry_once "clone" broken >/dev/null && r=passed || r=failed
expect "a read that keeps failing still fails" "failed" "$r"
expect "after two tries, not a loop" "2" "$(wc -l <"$tries" | tr -d ' ')"
: >"$tries"
CHECK_RETRY_DELAY=0 retry_once "clone" true >/dev/null
expect "a read that works is not repeated" "" "$(cat "$tries")"
rm -f "$tries"
unset -f step flaky broken
for read in '"clone" clone_src' '"fetch development" git fetch' '"fetch $branch" git fetch'; do
  grep -qF "retry_once $read" "$(dirname "$0")/check-in-volume.sh" && r=yes || r=no
  expect "the container retries $read" "yes" "$r"
done
grep -q 'declare -f unknown_projects retry_once' "$(dirname "$0")/check-in-volume.sh" && r=yes || r=no
expect "and is given retry_once to do it" "yes" "$r"
logs="$(mktemp -d)"
printf '%s
' "=== clone 19:44:28" "warning: error reading directory '/src/.git/objects/08/': Cannot allocate memory"   "fatal: failed to iterate over '/src/.git/objects/'" "=== exit 128 19:44:29" >"$logs/clone.log"
advice="$(setup_advice "$logs/clone.log" 3)"
case "$advice" in *"before checking anything"*"file sharing"*"run the same command again"*) r=yes ;; *) r=no ;; esac
expect "an exit 3 with Cannot allocate memory says it is Docker file sharing, and to run it again" "yes" "$r"
printf '%s
' "fatal: couldn't find remote ref refs/heads/no-such-branch" >"$logs/branch.log"
advice="$(setup_advice "$logs/branch.log" 3)"
case "$advice" in *"before checking anything"*) r=yes ;; *) r=no ;; esac
expect "any exit 3 says nothing was checked" "yes" "$r"
case "$advice" in *"file sharing"*) r=yes ;; *) r=no ;; esac
expect "but blames file sharing only when the log does" "no" "$r"
expect "another exit says nothing" "" "$(setup_advice "$logs/clone.log" 1)"
grep -q 'setup_advice "$log" "$code"' "$(dirname "$0")/check-in-volume.sh" && r=yes || r=no
expect "the check gives that advice after its run" "yes" "$r"
rm -rf "$logs"

exit "$failed"
