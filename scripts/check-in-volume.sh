#!/usr/bin/env bash
# Runs lint, test and build for a branch in a Linux clone kept in a Docker named volume (#1402).
#
#   scripts/check-in-volume.sh <branch>                          # nx affected, against origin/development
#   scripts/check-in-volume.sh <branch> all                      # every project
#   scripts/check-in-volume.sh <branch> <project>[,<project>...] # only these projects (a bug fix)
#   scripts/check-in-volume.sh <branch> affected <log file>      # write the log somewhere else
#
# Run it from Git Bash on the host, in the main checkout or any worktree. It exits with the check's exit
# code; the output goes to the log file only (default: check-<volume>-<mode>.log at the top of the
# checkout it was run from), so read the exit code, then the log.
#
# Why a volume: with the source and node_modules bind-mounted from Windows, every file read crosses the
# Windows-to-Linux boundary. On 4 October the same Jest suite took 180 s bind-mounted and 15 s in a
# volume. See "Why checks run in a volume" in CLAUDE.md.
#
# How it works:
#   - Each branch gets its own volume, tamu-js-<the first number in the branch name>, or
#     tamu-js-<branch> when the name has none. Docker creates it on first use.
#   - The main checkout is mounted read-only at /src. Not a worktree: a worktree's .git is a file
#     pointing at a Windows path the container cannot follow. A worktree's branches live in the main
#     repository's refs anyway, so fetching the branch by name from the main checkout finds them.
#   - The volume holds a clone of /src. Each run fetches <branch> and the main checkout's
#     origin/development (run `git fetch origin` first if that is old; an old base only makes more
#     projects affected, never fewer).
#   - npm ci runs only when package.json or package-lock.json changed since the last install, and then
#     installs from the committed files alone, as CI does, so it also proves the lock file.
#   - The Nx cache stays in the volume between runs, so an unchanged task replays in about a second.
#   - Each target skips the projects its own CI workflow skips: lint those in lint.yml, test those in
#     test.yml, build those in build.yml (EXCLUDED_PROJECTS, read from the checked branch; a workflow
#     with no list skips nothing). Targets whose lists match share one nx run; the others get their
#     own, one after another, and the check fails if any of them fails. Until #1475, build.yml's list
#     was used for all three, so ten projects CI lints were never linted here.
#     A list of projects runs exactly those projects for every target, with no exclusions. Each must
#     be a project (`nx show projects`): an unknown name stops the check with exit 2, naming it and the
#     nearest real one, because nx would otherwise run nothing and pass (#2291).
#   - Then, in every mode, each `run:` step of lint.yml that is not nx or the install (today
#     `npx tsc -p test/smoke/aggiemap`), and the check fails if any does (#2286). A step it cannot run
#     as CI does (a multi-line block, or `${{ }}`) stops the check before it starts, naming the step.
#
# With BUILD_TIMES_RECORD=1, a run writes a small file into docs/build-times/runs/ in the checkout it was
# run from (scripts/run-times.sh, #1593): when it started, in US Central, the machine
# (BUILD_TIMES_MACHINE), what ran, the result, the elapsed time, and the clone and npm ci times when it
# did those. Use it when measuring something; it is off otherwise.
#
# ONLY COMMITTED WORK IS CHECKED. Uncommitted edits in the Windows checkout are not seen; commit first.
# For the same reason, editing files while a check runs is safe.
#
# Two runs on the same volume at once would trip over each other; run one check per branch at a time.

# Prints the projects CI excludes from <target>: EXCLUDED_PROJECTS in .github/workflows/<target>.yml at
# <rev> of <repo>, comma-separated, or nothing when that workflow has no list. Fails when the workflow
# itself is missing. Tested by scripts/check-in-volume.test.sh, which sources this file.
excluded_projects() {
  local repo="$1" rev="$2" target="$3" yml
  # Git Bash would otherwise read refs/heads/<branch>:<path> as a list of paths and rewrite it, so
  # nothing is rewritten and the repository is given as a Windows path.
  repo="$(cd "$repo" && { pwd -W 2>/dev/null || pwd; })"
  yml="$(MSYS_NO_PATHCONV=1 git -C "$repo" show "$rev:.github/workflows/$target.yml")" || return 1
  printf '%s
' "$yml" | sed -n 's/^ *EXCLUDED_PROJECTS://p' | head -n 1 | tr -dc 'A-Za-z0-9_,-'
}

# Prints the `run:` steps of .github/workflows/lint.yml at <rev> of <repo> that are not Nx, one per line:
# `run <command>` for a one-line command this script runs as CI does, or `cannot <command>` for one it
# cannot (a multi-line `run: |` block, or one using `${{ }}`, which only GitHub can expand). Nx's own steps
# and the install are left out, because the nx runs and npm ci already cover them. Fails when lint.yml is
# missing. CI's lint once ran `npx tsc -p test/smoke/aggiemap` outside nx, and a branch that broke it
# passed this check and failed CI (#2286). Tested by scripts/check-in-volume.test.sh.
lint_steps() {
  local repo="$1" rev="$2" yml cmd
  repo="$(cd "$repo" && { pwd -W 2>/dev/null || pwd; })"
  yml="$(MSYS_NO_PATHCONV=1 git -C "$repo" show "$rev:.github/workflows/lint.yml")" || return 1
  printf '%s\n' "$yml" | sed -n 's/^[[:space:]]*\(- \)\{0,1\}run:[[:space:]]*//p' | while IFS= read -r cmd; do
    cmd="$(printf '%s' "${cmd%$'\r'}" | sed "s/^'\(.*\)'\$/\1/; s/^\"\(.*\)\"\$/\1/")"
    case "$cmd" in
      *nx[[:space:]]* | *nx.js* | 'npm ci'* | 'npm install'*) ;;
      '' | '|'* | '>'* | *'${{'*) printf 'cannot %s\n' "$cmd" ;;
      *) printf 'run %s\n' "$cmd" ;;
    esac
  done
}

# Prints each name in the comma-separated <projects> that is not a line of <known file> (the output of
# `nx show projects`), one per line, with the nearest real name when one is within a few letters:
# `common-ngx-pipez (did you mean common-ngx-pipes?)`. Prints nothing when every name is a project.
# `nx run-many -p` with a name that is not a project prints "No tasks were run" and exits 0, so a typo
# in a bug fix's list passed a check that checked nothing (#2291). Runs in the container as well, so it
# keeps to POSIX sh and awk. Tested by scripts/check-in-volume.test.sh.
unknown_projects() {
  printf '%s\n' "$1" | tr ',' '\n' | awk -v known="$2" '
    function distance(a, b,   i, j, la, lb, d, cost, best) {
      la = length(a); lb = length(b)
      for (i = 0; i <= la; i++) d[i, 0] = i
      for (j = 0; j <= lb; j++) d[0, j] = j
      for (i = 1; i <= la; i++)
        for (j = 1; j <= lb; j++) {
          cost = substr(a, i, 1) == substr(b, j, 1) ? 0 : 1
          best = d[i - 1, j] + 1
          if (d[i, j - 1] + 1 < best) best = d[i, j - 1] + 1
          if (d[i - 1, j - 1] + cost < best) best = d[i - 1, j - 1] + cost
          d[i, j] = best
        }
      return d[la, lb]
    }
    BEGIN { while ((getline line < known) > 0) if (line != "") { names[++n] = line; is[line] = 1 } }
    $0 == "" || ($0 in is) { next }
    {
      nearest = ""; nearestDistance = 4
      for (i = 1; i <= n; i++) {
        dist = distance($0, names[i])
        if (dist < nearestDistance) { nearestDistance = dist; nearest = names[i] }
      }
      if (nearest != "") print $0 " (did you mean " nearest "?)"; else print $0
    }'
}

# Prints `<memory> <parallel>`: the container's memory limit from CHECK_MEMORY (default 16g) and Nx's
# --parallel from CHECK_PARALLEL (default 8), so a smaller machine can run the check (#2498). Fails, saying
# why, when CHECK_PARALLEL is not a whole number above zero. Tested by scripts/check-in-volume.test.sh.
check_limits() {
  local memory="${CHECK_MEMORY:-16g}" parallel="${CHECK_PARALLEL:-8}"
  case "$parallel" in
    '' | *[!0-9]* | 0*)
      echo "CHECK_PARALLEL must be a whole number above zero, not '$parallel'." >&2
      return 1
      ;;
  esac
  printf '%s %s\n' "$memory" "$parallel"
}

# Sourced (by the test): stop here, with only the functions defined.
[ "${BASH_SOURCE[0]}" = "$0" ] || return 0

set -euo pipefail
# shellcheck source=run-times.sh
. "$(dirname "${BASH_SOURCE[0]}")/run-times.sh"

usage() {
  echo "usage: $0 <branch> [affected|all|<project>[,<project>...]] [<log file>]" >&2
  exit 2
}

branch="${1:-}"
mode="${2:-affected}"
[ -n "$branch" ] || usage
[ $# -le 3 ] || usage
limits="$(check_limits)" || exit 2
memory="${limits% *}"
parallel="${limits#* }"

here="$(git rev-parse --show-toplevel)"
main="$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")"
git -C "$main" rev-parse --verify -q "refs/heads/$branch" >/dev/null || {
  echo "No branch '$branch' in $main. Only committed branches can be checked." >&2
  exit 2
}

issue="$(printf '%s' "$branch" | grep -o '[0-9]\+' | head -n 1 || true)"
volume="tamu-js-${issue:-$(printf '%s' "$branch" | tr -c 'A-Za-z0-9_.-' '-')}"
log="${3:-$here/check-$volume-$(printf '%s' "$mode" | tr -c 'A-Za-z0-9_.-' '-').log}"

if [ "$(git -C "$here" rev-parse --abbrev-ref HEAD)" = "$branch" ] && [ -n "$(git -C "$here" status --porcelain)" ]; then
  echo "Note: $here has uncommitted changes. They are not part of this check." >&2
fi

# Which nx runs to make, as pairs of arguments: <targets> <excluded projects>. Targets with the same
# exclusions share a run, so today's workflows make two: lint, then test and build together.
runs=()
case "$mode" in
  affected|all)
    declare -A targets_for=()
    keys=()
    for target in lint test build; do
      excluded="$(excluded_projects "$main" "refs/heads/$branch" "$target")" || {
        echo "No .github/workflows/$target.yml on $branch, so no CI exclusions for $target." >&2
        exit 2
      }
      key="x$excluded"
      [ -n "${targets_for[$key]+set}" ] || keys+=("$key")
      targets_for[$key]="${targets_for[$key]:+${targets_for[$key]},}$target"
    done
    for key in "${keys[@]}"; do runs+=("${targets_for[$key]}" "${key#x}"); done
    ;;
  *) runs+=(lint,test,build "") ;;
esac

# lint.yml's steps outside nx, run after the nx runs in every mode. One this script cannot run stops the
# check before it starts: passing without it would claim more than was checked.
extra=""
if steps="$(lint_steps "$main" "refs/heads/$branch" 2>/dev/null)"; then
  if printf '%s\n' "$steps" | grep -q '^cannot '; then
    echo "lint.yml on $branch has a step this script cannot run as CI does:" >&2
    printf '%s\n' "$steps" | sed -n 's/^cannot /  /p' >&2
    echo "Make it a one-line run: without \${{ }}, or teach lint_steps in $0 to run it." >&2
    exit 2
  fi
  extra="$(printf '%s\n' "$steps" | sed -n 's/^run //p')"
fi

# The container's own script. Arguments: <branch> <mode>, then the runs' pairs.
inner='
set -u
branch="$1"; mode="$2"; shift 2
step() { echo "=== $1 $(date +%T)"; shift; "$@"; c=$?; echo "=== exit $c $(date +%T)"; return $c; }
git config --global --add safe.directory "*"
cd /w
echo "memory $CHECK_MEMORY, parallel $CHECK_PARALLEL"
if [ ! -d .git ]; then step "clone" git clone -q /src /w || exit 3; fi
step "fetch development" git fetch -q -f /src refs/remotes/origin/development:refs/remotes/origin/development || exit 3
step "fetch $branch" git fetch -q /src "refs/heads/$branch" || exit 3
git checkout -q -f -B check FETCH_HEAD && git clean -fdq || exit 3
git log --oneline -1
sum=$(cat package.json package-lock.json | sha1sum | cut -c1-40)
if [ "$(cat node_modules/.check-sum 2>/dev/null)" != "$sum" ]; then
  step "npm ci" npm ci --no-audit --no-fund || exit 4
  echo "$sum" > node_modules/.check-sum
fi
# Nx 22 moved its entry point into dist/ (#1456); the old path still serves a branch from before it.
nx="node node_modules/nx/dist/bin/nx.js"
[ -f node_modules/nx/dist/bin/nx.js ] || nx="node node_modules/nx/bin/nx.js"
# A list of projects must name real ones, or nx runs nothing and passes (#2291). Exit 2, as for any
# other request this script cannot carry out, naming each.
case "$mode" in
  affected|all) ;;
  *)
    $nx show projects > /tmp/known-projects || exit 3
    unknown="$(unknown_projects "$mode" /tmp/known-projects)"
    if [ -n "$unknown" ]; then
      printf "%s\n" "$unknown" | sed "s/^/unknown project: /"
      exit 2
    fi
    ;;
esac
# Every run goes ahead even when an earlier one failed, so one check reports every failure; the exit
# code is the first failing run'"'"'s.
code=0
while [ $# -ge 2 ]; do
  targets="$1"; excluded="$2"; shift 2
  exclude=""; [ -z "$excluded" ] || exclude="--exclude=$excluded"
  case "$mode" in
    affected) step "affected $targets excluding [$excluded]" $nx affected -t "$targets" --base=origin/development $exclude --parallel="$CHECK_PARALLEL" ;;
    all) step "run-many $targets excluding [$excluded]" $nx run-many -t "$targets" --all $exclude --parallel="$CHECK_PARALLEL" ;;
    *) step "run-many $targets -p $mode" $nx run-many -t "$targets" -p "$mode" --parallel="$CHECK_PARALLEL" ;;
  esac
  c=$?; [ "$code" -ne 0 ] || code=$c
done
while IFS= read -r cmd; do
  [ -n "$cmd" ] || continue
  step "lint.yml: $cmd" sh -c "$cmd"
  c=$?; [ "$code" -ne 0 ] || code=$c
done <<EOF
$LINT_STEPS
EOF
exit "$code"
'

# Git Bash would otherwise rewrite /w, /src and the volume paths into Windows paths.
export MSYS_NO_PATHCONV=1
src="$(cd "$main" && pwd -W)"

started="$(run_times_now)"
SECONDS=0
echo "Checking $branch ($mode) in volume $volume, memory $memory, parallel $parallel; log: $log"
for ((i = 0; i < ${#runs[@]}; i += 2)); do echo "  ${runs[i]}: excluding [${runs[i+1]}]"; done
[ -z "$extra" ] || printf '%s\n' "$extra" | sed 's/^/  lint.yml: /'
set +e
# Every `docker run` is a new machine as far as Nx can tell, so it would refuse the cache the previous
# check left in the volume ("was not generated on this machine") and fail the run. Only this script's
# containers ever write that cache, so it is trusted.
docker run --rm -m "$memory" \
  -v "$volume:/w" -v "$src:/src:ro" -w /w \
  -e CHECK_MEMORY="$memory" -e CHECK_PARALLEL="$parallel" -e NX_DAEMON=false -e NX_REJECT_UNKNOWN_LOCAL_CACHE=0 -e LINT_STEPS="$extra" node:24.22.1 sh -c "$(declare -f unknown_projects)
$inner" check "$branch" "$mode" "${runs[@]}" >"$log" 2>&1
code=$?
set -e
grep "^unknown project: " "$log" | sed "s/^unknown project: /No such project: /" >&2 || true
echo "Exit $code ($branch, $mode). Log: $log"
run_times_record "$here/docs/build-times/runs" "$started" check "$branch $mode" "$code" \
  "$(run_times_check_summary "$log")" "$SECONDS" "$(run_times_check_setup "$log")"
exit "$code"
