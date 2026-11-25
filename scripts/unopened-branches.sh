#!/usr/bin/env bash
# Lists the branches on a fork that hold work nobody can see (#3505): ahead of `development`, never opened as a pull
# request, and named for an issue. Read-only: it asks GitHub and prints two tables, the branches whose issue is still
# open (look at them) and those whose issue is closed (most can be deleted).
#
#   bash scripts/unopened-branches.sh                 the `fork` remote's owner
#   bash scripts/unopened-branches.sh <owner>         another fork of this repository
#
# Why. A branch that stopped one command short of a pull request is invisible: its issue looks unstarted, the board
# says the same, and `gh pr list` shows nothing. On 24 November 2026, 131 of the fork's 528 branches had never had a
# pull request, and 18 of them were ahead of `development` with their issue still open. Two were fixed visitor-facing
# bugs that had not shipped.
#
# What a row means: somebody should look, not that the branch is ready. Of the first eighteen, some were complete and
# some were superseded, already shipped, or wrong about a service that had since changed (#3505's comments). A branch
# carrying `.pr-body.md` was drafted as finished, so the column says so, and it is still only a reason to look.
#
# Each branch is named for its issue by the first number after the prefix: `fix/2816-empty-popup-rows` is #2816.
# A branch with no such number is counted and not listed, since it has no issue to be open.

UP="TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo"

# The issue a branch is named for, or nothing: the number that starts the part after the first slash.
issue_of() {
  printf '%s\n' "$1" | sed -nE 's#^[^/]+/([0-9]+)([-_./].*)?$#\1#p'
}

# Which table a branch goes in: `open` or `closed` by its issue's state, or nothing when it is not ahead of development
# or GitHub has no such issue.
table_of() {
  local ahead="$1" state="$2"
  [ "${ahead:-0}" -gt 0 ] || return 0
  case "$state" in
    OPEN) echo open ;;
    CLOSED) echo closed ;;
  esac
}

# Whether a branch has had a pull request, given the file of `<owner>:<branch>` heads: its own, or one opened from
# `<branch>-pr`, the copy a director makes without the drafted body (DIRECTOR.md on work-mailbox).
opened() {
  local owner="$1" branch="$2" heads="$3"
  grep -qxF "$owner:$branch" "$heads" || grep -qxF "$owner:$branch-pr" "$heads"
}

# The owner in a GitHub remote URL (git@github.com:<owner>/... or https://github.com/<owner>/...).
owner_of_url() {
  printf '%s\n' "$1" | sed -nE 's#^(git@github\.com:|https://github\.com/)([^/]+)/.*$#\2#p'
}

main() {
  set -uo pipefail
  local owner="${1:-}"
  if [ -z "$owner" ]; then
    owner="$(owner_of_url "$(git remote get-url fork 2>/dev/null)")"
  fi
  if [ -z "$owner" ]; then
    echo "Name the fork's owner: bash $0 <owner> (there is no 'fork' remote to read it from)." >&2
    return 2
  fi
  local fork="$owner/${UP#*/}"
  local tmp
  tmp="$(mktemp -d)"
  trap 'rm -rf "$tmp"' RETURN

  gh api --paginate "repos/$fork/branches?per_page=100" --jq '.[].name' >"$tmp/branches" || return 1
  gh pr list -R "$UP" --state all --limit 100000 --json headRefName,headRepositoryOwner \
    --jq '.[] | "\(.headRepositoryOwner.login):\(.headRefName)"' >"$tmp/heads" || return 1

  local total unopened=0 unnamed=0 b n ahead behind date state title body t
  total="$(wc -l <"$tmp/branches" | tr -d ' ')"
  declare -A issues=()
  : >"$tmp/open"
  : >"$tmp/closed"
  while IFS= read -r b; do
    [ -n "$b" ] || continue
    opened "$owner" "$b" "$tmp/heads" && continue
    unopened=$((unopened + 1))
    n="$(issue_of "$b")"
    if [ -z "$n" ]; then
      unnamed=$((unnamed + 1))
      continue
    fi
    if [ -z "${issues[$n]:-}" ]; then
      issues[$n]="$(gh issue view "$n" -R "$UP" --json state,title --jq '.state + "	" + .title' 2>/dev/null || printf 'NONE	')"
    fi
    IFS=$'	' read -r state title <<<"${issues[$n]}"
    IFS=$'	' read -r ahead behind date < <(gh api "repos/$UP/compare/development...$owner:$b"       --jq '[.ahead_by, .behind_by, (.commits[-1].commit.committer.date // "" | .[0:10])] | @tsv' 2>/dev/null)
    t="$(table_of "${ahead:-0}" "$state")"
    [ -n "$t" ] || continue
    if gh api "repos/$fork/contents/.pr-body.md?ref=$b" --silent 2>/dev/null; then body=yes; else body=no; fi
    title="${title//|/\|}"
    printf '%s	| `%s` | %s | %s | %s | #%s %s | %s |
' "$date" "$b" "$ahead" "$behind" "$date" "$n" "$title" "$body" >>"$tmp/$t"
  done <"$tmp/branches"

  local nopen nclosed
  nopen="$(wc -l <"$tmp/open" | tr -d ' ')"
  nclosed="$(wc -l <"$tmp/closed" | tr -d ' ')"
  echo "Fork $fork: $total branches, $unopened never opened as a pull request ($unnamed not named for an issue)."
  echo "Ahead of development: $nopen with their issue open, $nclosed with it closed."
  echo "Behind is how far the branch is from development: a branch cut before a workflow change runs the old workflow"
  echo "from its own tree, so merge the latest development into it before judging its CI."
  for t in open closed; do
    [ -s "$tmp/$t" ] || continue
    echo
    if [ "$t" = open ]; then echo '## Issue open: somebody should look'; else echo '## Issue closed: most can be deleted'; fi
    echo
    echo '| Branch | Ahead | Behind | Last commit | Issue | `.pr-body.md` |'
    echo '| --- | ---: | ---: | --- | --- | --- |'
    sort -r "$tmp/$t" | cut -f2-
  done
}

# Sourced by its test for the functions alone.
if [ "${BASH_SOURCE[0]}" = "$0" ]; then
  main "$@"
fi
