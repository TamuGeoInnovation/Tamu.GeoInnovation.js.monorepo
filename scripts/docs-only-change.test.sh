#!/usr/bin/env bash
# Tests scripts/docs-only-change.sh, which decides whether Azure skips a pull request's build (#1429). No Docker, no
# network; runs in under a second:
#
#   bash scripts/docs-only-change.test.sh
#
# Exits non-zero, naming each failed case.
set -uo pipefail

script="$(dirname "$0")/docs-only-change.sh"
failed=0
expect() { # <description> <expected exit and output> <stdin>
  local got
  got="$(printf '%b' "$3" | bash "$script")"
  got="$? $got"
  if [ "$2" = "$got" ]; then echo "ok   $1"; else echo "FAIL $1: expected [$2], got [$got]"; failed=1; fi
}

expect "a release-notes entry and its screenshot are docs-only" "0 docs-only" \
  'docs/releases/unreleased/1429-x.md\ndocs/screenshots/x/after.png\n'
expect "a Markdown file anywhere is docs-only" "0 docs-only" 'CLAUDE.md\ntest/smoke/aggiemap/README.md\n'
expect "one code file means a build" "1 builds: apps/aggiemap-angular/src/main.ts is not documentation" \
  'docs/a.md\napps/aggiemap-angular/src/main.ts\ndocs/b.md\n'
expect "the pipeline itself is not documentation" "1 builds: azure-pipelines.yml is not documentation" \
  'azure-pipelines.yml\n'
expect "a folder merely named docs, outside the top level, is not documentation" \
  "1 builds: libs/x/docs/data.json is not documentation" 'libs/x/docs/data.json\n'
expect "a file ending md without the dot is not documentation" "1 builds: libs/x/cmd is not documentation" 'libs/x/cmd\n'
expect "no changed files means a build, so a failed diff never skips one" "1 builds: no changed files" ''
expect "blank lines alone are no changed files" "1 builds: no changed files" '\n\n'
expect "a last line without a newline is still read" "1 builds: package.json is not documentation" 'docs/a.md\npackage.json'
expect "Windows line endings are tolerated" "0 docs-only" 'docs/a.md\r\nREADME.md\r\n'

exit "$failed"
