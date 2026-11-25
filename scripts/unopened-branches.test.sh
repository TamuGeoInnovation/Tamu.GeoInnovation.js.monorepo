#!/usr/bin/env bash
# Tests scripts/unopened-branches.sh's rules (#3505): which issue a branch is named for, which table a branch goes in, whether it has been opened,
# and reading the fork's owner from a remote. No network; runs in a second.
set -uo pipefail
# shellcheck source=unopened-branches.sh
source "$(dirname "$0")/unopened-branches.sh"

failed=0
check() {
  if [ "$2" = "$3" ]; then echo "ok   $1"; else echo "FAIL $1: expected '$3', got '$2'"; failed=$((failed + 1)); fi
}

check 'a branch names its issue after the prefix' "$(issue_of fix/2816-empty-popup-rows)" 2816
check 'any prefix will do' "$(issue_of ready/2212-git-mirror)" 2212
check 'two numbers: the first is the issue' "$(issue_of fix/2716-2717-nature-rx-popup)" 2716
check 'a version later in the name is not the issue' "$(issue_of chore/1218-node-24.22.3)" 1218
check 'a number alone after the prefix' "$(issue_of fix/1001)" 1001
check 'a branch with no number names no issue' "$(issue_of development)" ''
check 'a number not straight after the prefix names no issue' "$(issue_of chore/node-24)" ''
check 'a number inside a word names no issue' "$(issue_of fix/2816abc)" ''

check 'ahead with its issue open goes in the open table' "$(table_of 3 OPEN)" open
check 'ahead with its issue closed goes in the closed table' "$(table_of 3 CLOSED)" closed
check 'not ahead goes in neither' "$(table_of 0 OPEN)" ''
check 'no answer from GitHub about the branch goes in neither' "$(table_of '' OPEN)" ''
check 'no such issue goes in neither' "$(table_of 3 NONE)" ''

heads="$(mktemp)"
trap 'rm -f "$heads"' EXIT
printf '%s
' 'someone:fix/1-a' 'someone:ci/2-b-pr' 'other:fix/3-c' >"$heads"
yes_no() { if "$@"; then echo yes; else echo no; fi; }
check 'a branch with its own pull request has been opened' "$(yes_no opened someone fix/1-a "$heads")" yes
check 'a branch whose -pr copy has a pull request has been opened' "$(yes_no opened someone ci/2-b "$heads")" yes
check 'a pull request from another owner does not count' "$(yes_no opened someone fix/3-c "$heads")" no
check 'a branch with no pull request has not' "$(yes_no opened someone fix/4-d "$heads")" no

check 'the owner from an SSH remote' "$(owner_of_url git@github.com:someone/Tamu.GeoInnovation.js.monorepo.git)" someone
check 'the owner from an HTTPS remote' "$(owner_of_url https://github.com/someone/Tamu.GeoInnovation.js.monorepo)" someone
check 'no owner from something else' "$(owner_of_url /c/TAMU/somewhere)" ''

exit $((failed > 0))
