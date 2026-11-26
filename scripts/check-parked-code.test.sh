#!/usr/bin/env bash
# Tests what scripts/check-parked-code.mjs accepts and rejects, against fixture repositories. No network:
#
#   bash scripts/check-parked-code.test.sh
#
# Exits non-zero, naming each failed case, if the check would pass a register that disagrees with the parked/* tags,
# or fail one that agrees.
set -uo pipefail

here="$(cd "$(dirname "$0")" && pwd)"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT
failed=0

# A fixture repository with a register and whatever tags the case wants. Built fresh per case: tags are the thing
# under test, so they must not leak between cases.
#   $1 the register's table rows (the header is added here)
#   $2.. each remaining argument is "<tag>:<annotated|lightweight>"
build() {
  local rows="$1"
  shift
  rm -rf "$tmp/repo"
  mkdir -p "$tmp/repo/docs" "$tmp/repo/scripts"
  cp "$here/check-parked-code.mjs" "$tmp/repo/scripts/check-parked-code.mjs"
  {
    echo '| Tag | What it was | Why it went | What has to be true to bring it back | Issue |'
    echo '| --- | --- | --- | --- | --- |'
    printf '%s\n' "$rows"
  } >"$tmp/repo/docs/parked-code.md"
  (
    cd "$tmp/repo"
    git init -q .
    git -c user.email=t@t -c user.name=t commit -q --allow-empty -m base
    for spec in "$@"; do
      [ -n "$spec" ] || continue
      local name="${spec%%:*}" kind="${spec##*:}"
      if [ "$kind" = annotated ]; then
        git -c user.email=t@t -c user.name=t tag -a "$name" -m "parked: a fixture" HEAD
      else
        git tag "$name" HEAD
      fi
    done
  )
}

# Node where there is one (CI, and the pre-PR check's container), otherwise in Docker: these machines have no host
# Node (CLAUDE.md). The container needs git too, which the node image carries.
run_check() {
  if command -v node >/dev/null 2>&1 && command -v git >/dev/null 2>&1; then
    (cd "$tmp/repo" && node scripts/check-parked-code.mjs 2>&1)
  else
    MSYS_NO_PATHCONV=1 docker run --rm \
      -v "$(cd "$tmp/repo" && pwd -W 2>/dev/null || pwd):/t" -w /t \
      node:24.22.3 sh -c 'git config --global --add safe.directory /t; node scripts/check-parked-code.mjs' 2>&1
  fi
}

# $1 case name, $2 expected exit (0 pass, 1 fail), $3 a string the output must contain (may be empty), then the
# register rows, then the tag specs.
expect() {
  local name="$1" want="$2" needle="$3" rows="$4"
  shift 4
  build "$rows" "$@"
  local out code
  out="$(run_check)"
  code=$?
  if [ "$code" -ne "$want" ]; then
    echo "FAIL $name: exit $code, expected $want"
    echo "$out" | sed 's/^/      /'
    failed=1
    return
  fi
  if [ -n "$needle" ] && ! printf '%s' "$out" | grep -qF "$needle"; then
    echo "FAIL $name: exit $code as expected, but the output did not mention '$needle'"
    echo "$out" | sed 's/^/      /'
    failed=1
    return
  fi
  echo "ok   $name"
}

complete_row='| `parked/bus-api` | the bus timetable | its API is retired | the bus data is available again | [#3704](https://github.com/x/y/issues/3704) |'

expect "a complete entry passes" 0 "1 parked entry" \
  "$complete_row" "parked/bus-api:annotated"

expect "a tag with no row fails" 1 "no row in" \
  "$complete_row" "parked/bus-api:annotated" "parked/orphan:annotated"

# A non-parked tag so the repository is not tagless: a tagless one is a shallow clone and skips (last case below).
expect "a row whose tag is missing fails" 1 "does not exist" \
  "$complete_row" "dev-2026-11-26:annotated"

expect "a row with no issue fails" 1 "no issue in its last column" \
  '| `parked/bus-api` | the bus timetable | its API is retired | the bus data is available again | none yet |' \
  "parked/bus-api:annotated"

expect "a lightweight tag fails" 1 "lightweight tag" \
  "$complete_row" "parked/bus-api:lightweight"

# The register may hold a row for something restored and removed again later; two entries must both be held.
expect "two complete entries pass" 0 "2 parked entries" \
  "$complete_row
| \`parked/other\` | something else | its service went | the service returns | [#1](https://github.com/x/y/issues/1) |" \
  "parked/bus-api:annotated" "parked/other:annotated"

# A repository with no tags at all cannot be checked, and must not report every row as broken: that is a shallow
# clone, not a fault in the register.
expect "no tags at all skips rather than failing every row" 0 "cannot be checked" \
  "$complete_row"

if [ "$failed" -ne 0 ]; then
  echo "check-parked-code.test.sh: failures above"
  exit 1
fi

echo "check-parked-code.test.sh: all cases passed"
