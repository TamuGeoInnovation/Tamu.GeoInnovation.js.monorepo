#!/usr/bin/env bash
# Tests which GIS service differences scripts/check-gis-differences.mjs treats as missing from the
# register, against fixture sources. No network; runs in a second:
#
#   bash scripts/check-gis-differences.test.sh
#
# Exits non-zero, naming each failed case, if the check would pass a difference recorded in code with no row
# in docs/gis-service-differences.md, or fail a register that is complete.
set -uo pipefail

here="$(cd "$(dirname "$0")" && pwd)"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT
failed=0

node_in_docker() {
  MSYS_NO_PATHCONV=1 docker run --rm -v "$(cd "$tmp" && pwd -W 2>/dev/null || pwd):/t" -w /t node:24.22.1 node "$@"
}

# The repository has no host node (CLAUDE.md), so the harness runs the module in the same container image
# the checks use, importing the functions rather than the CLI.
run_case() {
  local source="$1" register="$2"
  printf '%s' "$source" >"$tmp/connections.ts"
  printf '%s' "$register" >"$tmp/register.md"
  cp "$here/check-gis-differences.mjs" "$tmp/check.mjs"
  cat >"$tmp/run.mjs" <<'JS'
import { readFileSync } from 'node:fs';
import { missingFromRegister, recordedDifferences } from './check.mjs';
const source = readFileSync('connections.ts', 'utf8');
const register = readFileSync('register.md', 'utf8');
console.log(JSON.stringify({ recorded: recordedDifferences(source), missing: missingFromRegister(source, register) }));
JS
  node_in_docker run.mjs 2>&1 | tail -n 1
}

check() {
  local name="$1" want="$2" got="$3"
  if [ "$want" = "$got" ]; then
    printf 'ok   %s\n' "$name"
  else
    printf 'FAIL %s\n       want: %s\n        got: %s\n' "$name" "$want" "$got"
    failed=$((failed + 1))
  fi
}

SOURCE='export const READ_FROM_PRODUCTION_ON_DEVELOPMENT: Partial<Record<string, string>> = {
  // A comment naming aCommentedUrl, which is not an entry.
  alphaUrl: SOME_CONSTANT,
  /* betaUrl appears in a block comment too */
  betaUrl:
    "a value on the next line, which is how three real entries are written",
  gammaUrl: `${TOKEN_REQUIRED} (#1)`
};
'

COMPLETE='| Key | Reported? |
| --- | --- |
| `alphaUrl` | unknown |
| `betaUrl` | unknown |
| `gammaUrl` | not applicable |
'

got="$(run_case "$SOURCE" "$COMPLETE")"
check "a complete register passes" '{"recorded":["alphaUrl","betaUrl","gammaUrl"],"missing":[]}' "$got"

PARTIAL='| Key | Reported? |
| --- | --- |
| `alphaUrl` | unknown |
'
got="$(run_case "$SOURCE" "$PARTIAL")"
check "a difference with no row is named" '{"recorded":["alphaUrl","betaUrl","gammaUrl"],"missing":["betaUrl","gammaUrl"]}' "$got"

# A value on the following line is how tsParkingLotsUrl and constructionUrl are really written; a key-count
# that reads only `key: value` lines misses them, and reported 24 entries where there are 27.
got="$(run_case "$SOURCE" "$COMPLETE" | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>console.log(JSON.parse(s).recorded.length))" 2>/dev/null)"
check "a value on the next line is still one entry" "3" "$got"

# A row whose key has gone from the code is NOT an error: it is the record of a difference that was fixed.
EXTRA="$COMPLETE"'| `deltaUrl` | yes, 1 Jan 2026 |
'
got="$(run_case "$SOURCE" "$EXTRA")"
check "a register row with no code entry is kept, not flagged" '{"recorded":["alphaUrl","betaUrl","gammaUrl"],"missing":[]}' "$got"

# A key named only in a comment must not count as registered or as recorded.
COMMENT_ONLY='| Key | Reported? |
| --- | --- |
| `alphaUrl` | unknown |
| `betaUrl` | unknown |
| `gammaUrl` | unknown |

A paragraph mentioning `deltaUrl` in prose, which is not a row.
'
got="$(run_case "$SOURCE" "$COMMENT_ONLY")"
check "prose mentioning a key is not a row" '{"recorded":["alphaUrl","betaUrl","gammaUrl"],"missing":[]}' "$got"

if [ "$failed" -ne 0 ]; then
  printf '\n%d case(s) failed.\n' "$failed" >&2
  exit 1
fi
printf '\nAll cases passed.\n'
