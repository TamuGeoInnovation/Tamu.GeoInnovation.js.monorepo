#!/usr/bin/env bash
# Tests tag-build.sh's prod guard and what a forced tag records (#2098), against a throwaway
# repository. No Docker, no network; runs in a second:
#
#   bash scripts/tag-build.test.sh
#
# The case that matters: a forced promotion must be legible as forced, from the tag alone. On 22
# October 2026 one was not, and the release record said production carried a commit it did not.
set -uo pipefail

script="$(cd "$(dirname "$0")" && pwd)/tag-build.sh"

repo="$(mktemp -d)"
trap 'rm -rf "$repo"' EXIT
git init -q -b development "$repo"
git -C "$repo" config core.autocrlf false
git -C "$repo" config user.name t
git -C "$repo" config user.email t@t

commit() { # <subject>
  echo "$1" >>"$repo/log.txt"
  git -C "$repo" add -A
  git -C "$repo" commit -qm "$1"
}

commit 'the tested build'
tested=$(git -C "$repo" rev-parse HEAD)
commit 'something after it'
later=$(git -C "$repo" rev-parse HEAD)

# The script fetches origin/development, so give it one that is itself.
git -C "$repo" remote add origin "$repo"
git -C "$repo" fetch -q origin development

run() { (cd "$repo" && bash "$script" "$@" 2>&1); }

failed=0
expect() { # <description> <expected> <actual>
  if [ "$2" = "$3" ]; then echo "ok   $1"; else echo "FAIL $1: expected [$2], got [$3]"; failed=1; fi
}
contains() { # <description> <needle> <haystack>
  case "$3" in *"$2"*) echo "ok   $1" ;; *) echo "FAIL $1: [$3] does not contain [$2]"; failed=1 ;; esac
}

out=$(run dev "$tested" --date 2026-10-21); status=$?
expect "dev tags a commit" "0" "$status"
contains "dev names the tag" "created dev-2026-10-21" "$out"

# The guard: --points-at, so a descendant of a tagged commit does not satisfy it.
out=$(run prod "$later" --date 2026-10-22); status=$?
expect "prod refuses an untagged commit" "1" "$status"
contains "and says why" "carries no dev-* tag" "$out"

# The reason is not optional, and the refusal is about the reason rather than the guard.
out=$(run prod "$later" --date 2026-10-22 --force); status=$?
expect "--force with no reason is refused" "2" "$status"
contains "and says what is missing" "--force needs a reason" "$out"

# A flag after --force is a flag, not a reason. Without this, `--force --date X` reads "--date" as
# the reason, forces the promotion on no reason at all, and tags the wrong day.
out=$(run prod "$later" --force --date 2026-10-22); status=$?
expect "a flag after --force is not taken as the reason" "2" "$status"
contains "and it still asks for one" "--force needs a reason" "$out"

out=$(run prod "$later" --date 2026-10-22 --force 'only GIS Day commits differ'); status=$?
expect "--force with a reason tags" "0" "$status"
message=$(git -C "$repo" tag -l --format='%(contents)' prod-2026-10-22)
contains "the tag says it was forced, in its first line" "Production build, 2026-10-22 (FORCED)" "$message"
contains "the tag carries the reason" "Reason given: only GIS Day commits differ" "$message"

# An ordinary promotion must not pick up either, or "forced" stops meaning anything.
out=$(run prod "$tested" --date 2026-10-23); status=$?
expect "prod accepts the dev-tagged commit" "0" "$status"
message=$(git -C "$repo" tag -l --format='%(contents)' prod-2026-10-23)
case "$message" in *FORCED*) echo "FAIL an unforced tag says FORCED: [$message]"; failed=1 ;; *) echo "ok   an unforced tag says nothing about forcing" ;; esac

exit "$failed"
