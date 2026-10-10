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
#     A list of projects runs exactly those projects for every target, with no exclusions.
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

# Sourced (by the test): stop here, with only the functions defined.
[ "${BASH_SOURCE[0]}" = "$0" ] || return 0

set -euo pipefail

usage() {
  echo "usage: $0 <branch> [affected|all|<project>[,<project>...]] [<log file>]" >&2
  exit 2
}

branch="${1:-}"
mode="${2:-affected}"
[ -n "$branch" ] || usage
[ $# -le 3 ] || usage

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

# The container's own script. Arguments: <branch> <mode>, then the runs' pairs.
inner='
set -u
branch="$1"; mode="$2"; shift 2
step() { echo "=== $1 $(date +%T)"; shift; "$@"; c=$?; echo "=== exit $c $(date +%T)"; return $c; }
git config --global --add safe.directory "*"
cd /w
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
# Every run goes ahead even when an earlier one failed, so one check reports every failure; the exit
# code is the first failing run'"'"'s.
code=0
while [ $# -ge 2 ]; do
  targets="$1"; excluded="$2"; shift 2
  exclude=""; [ -z "$excluded" ] || exclude="--exclude=$excluded"
  case "$mode" in
    affected) step "affected $targets excluding [$excluded]" $nx affected -t "$targets" --base=origin/development $exclude --parallel=8 ;;
    all) step "run-many $targets excluding [$excluded]" $nx run-many -t "$targets" --all $exclude --parallel=8 ;;
    *) step "run-many $targets -p $mode" $nx run-many -t "$targets" -p "$mode" --parallel=8 ;;
  esac
  c=$?; [ "$code" -ne 0 ] || code=$c
done
exit "$code"
'

# Git Bash would otherwise rewrite /w, /src and the volume paths into Windows paths.
export MSYS_NO_PATHCONV=1
src="$(cd "$main" && pwd -W)"

echo "Checking $branch ($mode) in volume $volume; log: $log"
for ((i = 0; i < ${#runs[@]}; i += 2)); do echo "  ${runs[i]}: excluding [${runs[i+1]}]"; done
set +e
# Every `docker run` is a new machine as far as Nx can tell, so it would refuse the cache the previous
# check left in the volume ("was not generated on this machine") and fail the run. Only this script's
# containers ever write that cache, so it is trusted.
docker run --rm -m 16g \
  -v "$volume:/w" -v "$src:/src:ro" -w /w \
  -e NX_DAEMON=false -e NX_REJECT_UNKNOWN_LOCAL_CACHE=0   node:22.23.3 sh -c "$inner" check "$branch" "$mode" "${runs[@]}" >"$log" 2>&1
code=$?
set -e
echo "Exit $code ($branch, $mode). Log: $log"
exit "$code"
