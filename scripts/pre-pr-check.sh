#!/usr/bin/env bash
# Checks a branch the way its pull request will be checked, before the pull request opens (#3508):
#
#   scripts/pre-pr-check.sh <branch> <title> <body file> [projects] [--label <name>]...
#
# From Git Bash, in the main checkout or any worktree, with the branch committed (only what is committed is checked).
# <body file> is the drafted body, usually `.pr-body.md`. [projects] is passed to scripts/check-in-volume.sh as its
# project list (comma-separated); without it the check is `affected`. --label names a label the pull request will
# carry, such as no-visible-change, and may be given more than once.
#
# It runs, in order, and reports every failure rather than stopping at the first:
#   1. the pull-request checks on the drafted title and body, with the code CI runs: the title (check-pr-title.mjs),
#      a closing reference to an issue (as require-linked-issue.yml reads it), a release-notes entry or the
#      no-visible-change label (require-release-notes.mjs), and before/after images for a visible change
#      (require-screenshots.mjs);
#   2. the scripts' own test suites when the branch changes scripts/ or a workflow, and the tools' when it changes tools/;
#   3. scripts/check-in-volume.sh for the branch: lint, test, build and lint.yml's other steps, docs-only changes included.
#
# No pull request opens until this exits 0 (CLAUDE.md, the maintainer's 1A of 24 November 2026), and its last line goes
# in the pull request body. It cannot catch a flaky test; those get an issue and a fix the day one is found (2A, #3506).
# Tested by scripts/pre-pr-check.test.sh.
set -uo pipefail

here="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# A path Docker can mount: on Windows, Git Bash's /c/... and /tmp/... mean nothing to Docker, so they are given as
# C:/... (cygpath -m); elsewhere the path is already right.
docker_path() {
  if command -v cygpath >/dev/null 2>&1; then cygpath -m "$1"; else printf '%s\n' "$1"; fi
}

# Prints GitHub's word for a `git diff --name-status` letter: added, modified, removed, renamed or copied.
status_word() {
  case "$1" in
    A*) echo added ;;
    D*) echo removed ;;
    R*) echo renamed ;;
    C*) echo copied ;;
    *) echo modified ;;
  esac
}

# Prints `<status>\t<file>` for every file <branch> changes since its merge base with <base>, as GitHub lists a pull
# request's files.
changed_files() {
  local repo="$1" base="$2" branch="$3"
  git -C "$repo" diff --name-status "$base...$branch" | while IFS=$'\t' read -r letter first second; do
    printf '%s\t%s\n' "$(status_word "$letter")" "${second:-$first}"
  done
}

# Succeeds when <body file> closes an issue the way require-linked-issue.yml reads it: a closing keyword then #N or an
# issue URL. A body with none fails "Has a linked issue" on the pull request.
has_closing_reference() {
  grep -qiE '(close[sd]?|fix(e[sd])?|resolve[sd]?)[[:space:]]*:?[[:space:]]*(#[0-9]+|https://github\.com/[^/]+/[^/]+/issues/[0-9]+)' "$1"
}

# Prints which of the scripts' and tools' suites <changed list> calls for: `scripts` when a script or a workflow
# changed (several scripts read the workflows), `tools` when a tool did.
suites_for() {
  local list="$1"
  awk -F'\t' '
    $2 ~ /^scripts\// || $2 ~ /^\.github\/workflows\// || $2 ~ /^test\/smoke\/aggiemap\/environments\.json$/ { s = 1 }
    $2 ~ /^tools\// { t = 1 }
    END { if (s) print "scripts"; if (t) print "tools" }
  ' "$list"
}

# Sourced (by the test): stop here, with only the functions defined.
[ "${BASH_SOURCE[0]}" = "$0" ] || return 0

if [ "$#" -lt 3 ]; then
  echo "Usage: scripts/pre-pr-check.sh <branch> <title> <body file> [projects] [--label <name>]..." >&2
  exit 2
fi
branch="$1" title="$2" body="$3"
shift 3
projects=""
labels=()
while [ "$#" -gt 0 ]; do
  case "$1" in
    --label) labels+=("$2"); shift 2 ;;
    *) projects="$1"; shift ;;
  esac
done

if [ ! -f "$body" ]; then
  echo "No body file at $body. Draft the pull request's body from .github/pull_request_template.md first." >&2
  exit 2
fi
if ! git -C "$here" rev-parse -q --verify "$branch" >/dev/null; then
  echo "No branch $branch here. Commit it first: only what is committed is checked." >&2
  exit 2
fi

git -C "$here" fetch -q origin development 2>/dev/null || echo "Could not fetch origin; comparing with the origin/development already here." >&2
base=origin/development
common="$(git -C "$here" rev-parse --path-format=absolute --git-common-dir)"

tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT
changed_files "$here" "$base" "$branch" >"$tmp/changed.tsv"
cp "$body" "$tmp/body.md"
printf '%s\n' "${labels[@]+"${labels[@]}"}" | awk 'NF' | awk 'BEGIN { printf "[" } { printf "%s\"%s\"", (NR > 1 ? "," : ""), $0 } END { print "]" }' >"$tmp/labels.json"

failed=()
step() { # <name> <command...>
  local name="$1"
  shift
  echo "== $name"
  if "$@"; then echo "   ok"; else echo "   FAILED: $name"; failed+=("$name"); fi
}

# The pull-request checks, in node:24.22.3 as CI runs them, reading the drafted title and body.
pr_checks() {
  MSYS_NO_PATHCONV=1 docker run --rm -v "$(docker_path "$here/.github/scripts"):/scripts:ro" -v "$(docker_path "$tmp"):/pr:ro" -w /pr \
    -e TITLE="$title" node:24.22.3 sh -c '
      node /scripts/check-pr-title.mjs || exit 1
      node --input-type=module -e "
        import { readFileSync } from \"node:fs\";
        import { evaluate as notes } from \"/scripts/require-release-notes.mjs\";
        import { evaluate as images } from \"/scripts/require-screenshots.mjs\";
        const files = readFileSync(\"/pr/changed.tsv\", \"utf8\").split(\"\n\").filter(Boolean)
          .map((line) => { const [status, filename] = line.split(\"\t\"); return { status, filename }; });
        const labels = JSON.parse(readFileSync(\"/pr/labels.json\", \"utf8\"));
        const body = readFileSync(\"/pr/body.md\", \"utf8\");
        let bad = 0;
        const n = notes({ files, labels });
        console.log((n.ok ? \"Release notes: \" : \"Release notes FAIL: \") + n.reason);
        if (!n.ok) { bad = 1; for (const f of n.visible) console.log(\"  \" + f); }
        const i = images({ files: files.map((f) => f.filename), body, labels });
        console.log((i.ok ? \"Images: \" : \"Images FAIL: \") + i.reason);
        if (!i.ok) bad = 1;
        process.exit(bad);
      "'
}

linked_issue() {
  if has_closing_reference "$tmp/body.md"; then
    echo "   Closes: $(grep -oiE '(close[sd]?|fix(e[sd])?|resolve[sd]?)[[:space:]]*:?[[:space:]]*#[0-9]+' "$tmp/body.md" | head -n 3 | tr '\n' ' ')"
  else
    echo "   The body has no closing reference (Closes #N): the pull request would fail Has a linked issue."
    return 1
  fi
}

suite() { # scripts | tools
  case "$1" in
    # In node:24.22.3, as tools-tests.yml and scripts-tests.yml run them (these machines have no host Node), on a clone of
    # the committed branch, as check-in-volume.sh does: a worktree's .git is a file naming a Windows path, so a copy of
    # the worktree is not a repository inside the container, and the suites that read git fail.
    scripts) MSYS_NO_PATHCONV=1 docker run --rm -v "$(docker_path "$common"):/repo.git:ro" node:24.22.3 sh -c \
      "git clone -q -b '$branch' /repo.git /w && cd /w && bash scripts/run-script-tests.sh" ;;
    tools) MSYS_NO_PATHCONV=1 docker run --rm -v "$(docker_path "$common"):/repo.git:ro" node:24.22.3 sh -c \
      "git clone -q -b '$branch' /repo.git /w && cd /w && node --test 'tools/**/*.test.mjs'" ;;
  esac
}

echo "Checking $branch as its pull request will be checked: $(grep -c . "$tmp/changed.tsv") file(s) changed since $base."
step "Has a linked issue" linked_issue
step "Pull request title, release notes and images" pr_checks
for s in $(suites_for "$tmp/changed.tsv"); do
  step "The $s test suites" suite "$s"
done
step "check-in-volume.sh (lint, test, build, lint.yml's steps)" bash "$here/scripts/check-in-volume.sh" "$branch" ${projects:+"$projects"}

if [ "${#failed[@]}" -gt 0 ]; then
  echo "pre-pr-check: Exit 1 ($branch). Failed: $(IFS=';'; echo "${failed[*]}"). Do not open the pull request yet."
  exit 1
fi
echo "pre-pr-check: Exit 0 ($branch): ready to open."
