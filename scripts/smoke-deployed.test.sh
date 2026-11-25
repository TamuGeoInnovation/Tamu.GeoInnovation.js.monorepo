#!/usr/bin/env bash
# Tests smoke-deployed.sh (#3539) against a throwaway repository with tagged builds. No Docker, no network:
#
#   bash scripts/smoke-deployed.test.sh
#
# The case that matters most is the second: a change the deployed tag already carries must NOT be listed, because a
# check that skips when its feature is really there, or really gone, hides the failure it exists to catch.
set -uo pipefail

script="$(cd "$(dirname "$0")" && pwd)/smoke-deployed.sh"

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

commit 'the build on dev'
git -C "$repo" tag -a dev-2026-01-01 -m 'dev build'
built=$(git -C "$repo" rev-parse HEAD)
commit 'a fix and its check, merged after that build'
fix=$(git -C "$repo" rev-parse HEAD)

registry="$repo/changes.json"
printf '[\n  {\n    "change": "#1",\n    "what": "the fix",\n    "commit": "%s"\n  }\n]\n' "$fix" >"$registry"

run() { SMOKE_DEPLOYED_REPO="$repo" bash "$script" "$@" 2>&1; }

failed=0
expect() { # <description> <expected> <actual>
  if [ "$2" = "$3" ]; then echo "ok   $1"; else echo "FAIL $1: expected [$2], got [$3]"; failed=1; fi
}
contains() { # <description> <needle> <haystack>
  case "$3" in *"$2"*) echo "ok   $1" ;; *) echo "FAIL $1: [$3] does not contain [$2]"; failed=1 ;; esac
}

out=$(run development "$registry")
expect 'a change merged after the deployed tag is listed as not deployed' \
  "AGGIEMAP_SMOKE_DEPLOYED_TAG=dev-2026-01-01
AGGIEMAP_SMOKE_UNDEPLOYED_COMMITS=$fix" "$out"

git -C "$repo" tag -a dev-2026-01-02 -m 'dev build with the fix' "$fix"
# Tags made in the same second sort by name otherwise; be sure the newer one is newest by date.
GIT_COMMITTER_DATE='2030-01-01T00:00:00' git -C "$repo" tag -f -a dev-2026-01-02 -m 'dev build with the fix' "$fix" >/dev/null
out=$(run development "$registry")
expect 'once a tag carries the change, nothing is listed, so its checks run and can fail' \
  "AGGIEMAP_SMOKE_DEPLOYED_TAG=dev-2026-01-02
AGGIEMAP_SMOKE_UNDEPLOYED_COMMITS=" "$out"

out=$(AGGIEMAP_SMOKE_DEPLOYED_TAG=dev-2026-01-01 run development "$registry")
contains 'a tag named beforehand is the one compared with' "AGGIEMAP_SMOKE_UNDEPLOYED_COMMITS=$fix" "$out"

out=$(run production "$registry")
contains 'with no prod-* tag there is nothing to compare, so nothing is printed for the suite' \
  'No refs/tags/prod-* tag' "$out"
expect '... and no variable is set' '' "$(printf '%s\n' "$out" | grep '^AGGIEMAP_' || true)"

printf '[\n  {\n    "change": "#2",\n    "what": "not here",\n    "commit": "%s"\n  }\n]\n' 0123456789abcdef0123456789abcdef01234567 >"$registry"
out=$(run development "$registry")
contains 'a commit this clone does not have is not listed, so its checks run' 'is not in this clone' "$out"
contains '... and the list is empty' 'AGGIEMAP_SMOKE_UNDEPLOYED_COMMITS=' "$out"
expect '... with nothing after the equals sign' 'AGGIEMAP_SMOKE_UNDEPLOYED_COMMITS=' \
  "$(printf '%s\n' "$out" | grep '^AGGIEMAP_SMOKE_UNDEPLOYED_COMMITS=')"

out=$(run staging "$registry"); status=$?
expect 'an environment it does not know is refused' 2 "$status"

if [ "$failed" -eq 0 ]; then echo "All cases passed."; fi
exit "$failed"
