#!/usr/bin/env bash
# Tests which issue a branch names, and so which Docker volume its check runs in. No Docker, no network;
# runs in well under a second:
#
#   bash scripts/volume-name.test.sh
#
# Exits non-zero, naming each failed case, if a branch would take an issue's volume that is not its
# issue - above all a dated branch taking tamu-js-2026 (#3802) - or if scripts/tidy.sh and
# scripts/volume-name.sh stop agreeing about which volumes belong to an issue.
set -uo pipefail

# shellcheck source=volume-name.sh
. "$(dirname "$0")/volume-name.sh"
# shellcheck source=tidy.sh
. "$(dirname "$0")/tidy.sh"

tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT
failed=0

check() {
  local name="$1" want="$2" got="$3"
  if [ "$want" = "$got" ]; then
    printf 'ok   %s\n' "$name"
  else
    printf 'FAIL %s\n       want: %s\n        got: %s\n' "$name" "$want" "$got"
    failed=$((failed + 1))
  fi
}

# An issue branch, the shape CONTRIBUTING.md asks for.
check 'a branch for an issue takes that issue' '3802' "$(branch_issue fix/3802-volume-name-from-issue)"
check 'and its volume is the issue number' 'tamu-js-3802' "$(volume_for_branch fix/3802-volume-name-from-issue)"
check 'the issue number alone is enough' '3802' "$(branch_issue fix/3802)"
check 'any type, including the cloud session' '3907' "$(branch_issue cloud/3907-topic)"
check 'a dot in the topic does not end the number early' '3738' "$(branch_issue chore/3738-nx-24.0.7)"
check 'two issues in a name take the first' '2716' "$(branch_issue fix/2716-2717-nature-rx-popup)"

# The fault. Every one of these is a real branch name from one checkout on 26 November 2026, and under
# the old rule - the first run of digits anywhere - every one of them became tamu-js-2026.
for branch in \
  docs/release-notes-2026-11-26 \
  batch/2026-10-06-verify \
  check/2026-10-27-batch-2 \
  verify/green-batch-2026-11-23 \
  slone/family-weekend-2026; do
  check "a dated branch names no issue: $branch" '' "$(branch_issue "$branch")"
  check "so it gets its own volume: $branch" "tamu-js-$(printf '%s' "$branch" | tr -c 'A-Za-z0-9_.-' '-')" \
    "$(volume_for_branch "$branch")"
done

# #3802's third point: the rule is structural, not a range test on the number. A branch for the real
# issue #2026 must still get tamu-js-2026, because issue numbers reach 2026-shaped values and beyond.
check 'a branch for the real issue 2026 still takes it' '2026' "$(branch_issue fix/2026-accessible-spaces)"
check 'and so would a five-digit issue' '12026' "$(branch_issue fix/12026-some-topic)"

# A name with no type segment is not an issue branch, however its digits read. mb-a81 would otherwise
# have taken issue 81's volume.
check 'a branch with no type segment names no issue' '' "$(branch_issue mb-a81)"
check 'nor does a plain branch name' '' "$(branch_issue development)"
check 'and development gets its own volume' 'tamu-js-development' "$(volume_for_branch development)"
check 'a topic that merely contains digits names no issue' '' "$(branch_issue release/v2-rc1)"

# tidy.sh and volume-name.sh have to mean the same thing by "this volume belongs to an issue": one
# decides what a check runs in, the other what a sweep may remove. #3802 was the two disagreeing, so
# this asserts it from both sides over the table above. Issue 2026 is CLOSED, which is what made the
# collision dangerous rather than merely wasteful.
printf '%s\n' 2026 > "$tmp/closed"
# branch, and whether a sweep of closed issue 2026 may remove that branch's volume. Written out rather
# than derived from branch_issue, because a table computed from the thing under test agrees with it
# however wrong it is - the old rule's run of this suite passed all six of these cases while failing
# twelve others (CLAUDE.md, "do not draw a test's sample from the rows under test").
while read -r branch removable; do
  volume="$(volume_for_branch "$branch")"
  printf '%s\n' "$volume" > "$tmp/volumes"
  want=''
  [ "$removable" = yes ] && want="$volume"
  check "a sweep of closed 2026: $branch" "$want" "$(volume_candidates "$tmp/closed" "$tmp/volumes")"
done <<'TABLE'
fix/2026-accessible-spaces yes
docs/release-notes-2026-11-26 no
batch/2026-10-06-verify no
check/2026-10-27-batch-2 no
verify/green-batch-2026-11-23 no
slone/family-weekend-2026 no
mb-a81 no
fix/3802-volume-name-from-issue no
TABLE

# The named volumes a sweep must never touch, whatever the closed list says, as tidy.sh's own tests
# cover - repeated here because the rule they depend on now lives in volume-name.sh.
printf '%s\n' tamu-js-dev-nm tamu-js-tables tamu-js-chk-development > "$tmp/volumes"
printf '%s\n' 2026 3802 > "$tmp/closed"
check 'the shared and named volumes are never candidates' '' "$(volume_candidates "$tmp/closed" "$tmp/volumes")"

if [ "$failed" -ne 0 ]; then
  printf '\n%d case(s) failed.\n' "$failed" >&2
  exit 1
fi
printf '\nAll cases passed.\n'
