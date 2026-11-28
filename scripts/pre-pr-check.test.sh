#!/usr/bin/env bash
# Tests scripts/pre-pr-check.sh's own logic (#3508): how it lists a branch's files as GitHub does, how it reads a
# closing reference, and which test suites a change calls for. No Docker, no network; runs in a second:
#
#   bash scripts/pre-pr-check.test.sh
#
# The checks it runs (the title, release-notes and image rules, check-in-volume.sh) have their own tests.
set -uo pipefail

# shellcheck source=pre-pr-check.sh
. "$(dirname "$0")/pre-pr-check.sh"

tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT
failed=0
expect() { # <description> <expected> <actual>
  if [ "$2" = "$3" ]; then echo "ok   $1"; else echo "FAIL $1: expected [$2], got [$3]"; failed=1; fi
}

# Git's status letters become GitHub's words, which require-release-notes.mjs reads.
expect "A is added" added "$(status_word A)"
expect "M is modified" modified "$(status_word M)"
expect "D is removed" removed "$(status_word D)"
expect "R100 is renamed" renamed "$(status_word R100)"
expect "C075 is copied" copied "$(status_word C075)"

# A branch's files, from a throwaway repository: an added file, a modified one, a deleted one and a renamed one.
repo="$tmp/repo"
git init -q "$repo"
git -C "$repo" config user.email t@t
git -C "$repo" config user.name t
git -C "$repo" config core.autocrlf false
printf 'a\n' >"$repo/keep.txt"
printf 'b\n' >"$repo/gone.txt"
printf 'c\nc\nc\nc\n' >"$repo/old-name.md"
git -C "$repo" add -A
git -C "$repo" commit -qm base
git -C "$repo" branch base
git -C "$repo" switch -q -c feature
printf 'a2\n' >"$repo/keep.txt"
git -C "$repo" rm -q gone.txt
git -C "$repo" mv old-name.md docs-new.md
mkdir -p "$repo/docs/releases/unreleased"
printf 'x\n' >"$repo/docs/releases/unreleased/1-a.md"
git -C "$repo" add -A
git -C "$repo" commit -qm change
got="$(changed_files "$repo" base feature | sort | tr '\t\n' ' |')"
expect "a branch's files are listed as GitHub lists them" \
  "added docs/releases/unreleased/1-a.md|modified keep.txt|removed gone.txt|renamed docs-new.md|" "$got"

# A closing reference, as require-linked-issue.yml reads it.
printf 'Closes #3508\n\n## What this changes\n' >"$tmp/body1"
has_closing_reference "$tmp/body1" && r=yes || r=no
expect "Closes #N is a closing reference" yes "$r"
printf 'Fixes https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/12\n' >"$tmp/body2"
has_closing_reference "$tmp/body2" && r=yes || r=no
expect "an issue URL after a keyword is one too" yes "$r"
printf 'Refs #1977\n\nThe first step of the epic.\n' >"$tmp/body3"
has_closing_reference "$tmp/body3" && r=yes || r=no
expect "Refs #N is not (PR 3499 opened with only this, and failed Has a linked issue)" no "$r"

# A committed .pr-body.md, which pr-title.yml fails and this script did not look for (#3702). PR 3697 opened
# with pre-pr-check: Exit 0 and failed that check at once.
printf 'added\t.pr-body.md\n' >"$tmp/b1"
tracked_body_in "$tmp/b1" && r=yes || r=no
expect "a branch that adds .pr-body.md has a committed body" yes "$r"
printf 'modified\t.pr-body.md\n' >"$tmp/b2"
tracked_body_in "$tmp/b2" && r=yes || r=no
expect "so does one that changes a copy already committed" yes "$r"
printf 'removed\t.pr-body.md\n' >"$tmp/b3"
tracked_body_in "$tmp/b3" && r=yes || r=no
expect "a branch that removes it again does not, which is how a draft is cleaned up" no "$r"
printf 'modified\tscripts/tidy.sh\n' >"$tmp/b4"
tracked_body_in "$tmp/b4" && r=yes || r=no
expect "nor does a branch with no body at all - the usual case, drafted on disk only" no "$r"
printf 'added\tdocs/.pr-body.md\n' >"$tmp/b5"
tracked_body_in "$tmp/b5" && r=yes || r=no
expect "and the name must be exactly .pr-body.md at the top, as CI greps for it" no "$r"
# Which suites a change calls for.
printf 'modified\tscripts/tidy.sh\n' >"$tmp/c1"
expect "a script change runs the scripts' suites" scripts "$(suites_for "$tmp/c1")"
printf 'modified\t.github/workflows/lint.yml\n' >"$tmp/c2"
expect "a workflow change does too, since scripts read the workflows" scripts "$(suites_for "$tmp/c2")"
printf 'added\ttools/security-findings/x.mjs\nmodified\tscripts/a.sh\n' >"$tmp/c3"
expect "a tools change runs the tools' suites as well" "scripts tools" "$(suites_for "$tmp/c3" | tr '\n' ' ' | sed 's/ $//')"
printf 'modified\tlibs/gisday/platform/ngx/core/src/x.ts\nmodified\tCLAUDE.md\n' >"$tmp/c4"
expect "an app or docs change runs neither" "" "$(suites_for "$tmp/c4")"

exit "$failed"
