#!/usr/bin/env bash
# Tests which worktrees and volumes scripts/tidy.sh would remove, against fixture lists. No Docker, no
# network, no real worktrees; runs in a second:
#
#   bash scripts/tidy.test.sh
#
# Exits non-zero, naming each failed case, if tidy.sh would remove something it must not - above all the
# main checkout (#3400) or a named volume such as tamu-js-dev-nm.
set -uo pipefail

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

# The shape git worktree list --porcelain prints: the MAIN checkout first, then the worktrees.
cat >"$tmp/porcelain" <<'EOF'
worktree C:/TAMU/Tamu.GeoInnovation.js.monorepo
HEAD 1111111111111111111111111111111111111111
branch refs/heads/docs/2828-work-in-flight

worktree C:/TAMU/wt-merged
HEAD 2222222222222222222222222222222222222222
branch refs/heads/fix/1-merged

worktree C:/TAMU/wt-open
HEAD 3333333333333333333333333333333333333333
branch refs/heads/fix/2-still-open

worktree C:/TAMU/wt-detached
HEAD 4444444444444444444444444444444444444444
detached
EOF

# Every one of these branches has a merged pull request, the main checkout's included.
printf '%s\n' 'docs/2828-work-in-flight' 'fix/1-merged' >"$tmp/merged"

got="$(worktree_candidates "$tmp/merged" "$tmp/porcelain" | tr '\n' ' ')"
check 'the worktree of a merged branch is removable' 'C:/TAMU/wt-merged ' "$got"

# THE CASE THAT MATTERS: the main checkout is listed first and its branch HAS merged. A filter that only
# asks "has this branch merged?" deletes the repository. This happened for real on 24 November 2026.
case "$got" in
  *Tamu.GeoInnovation.js.monorepo*) check 'the MAIN CHECKOUT is never removable' 'excluded' 'INCLUDED' ;;
  *) check 'the MAIN CHECKOUT is never removable' 'excluded' 'excluded' ;;
esac

case "$got" in
  *wt-open*) check 'an unmerged branch is kept' 'kept' 'removable' ;;
  *) check 'an unmerged branch is kept' 'kept' 'kept' ;;
esac

case "$got" in
  *wt-detached*) check 'a detached worktree is kept' 'kept' 'removable' ;;
  *) check 'a detached worktree is kept' 'kept' 'kept' ;;
esac

# A main checkout sitting on a branch nobody merged must still never be offered.
printf '%s\n' 'fix/1-merged' >"$tmp/merged-no-main"
got="$(worktree_candidates "$tmp/merged-no-main" "$tmp/porcelain" | tr '\n' ' ')"
check 'the main checkout is excluded whatever its branch did' 'C:/TAMU/wt-merged ' "$got"

# Volumes.
printf '%s\n' 'tamu-js-100' 'tamu-js-200' 'tamu-js-dev-nm' 'tamu-js-chk-development' 'tamu-js-1623-nm' 'some-other-volume' >"$tmp/volumes"
printf '%s\n' '100' '1623' >"$tmp/closed"

got="$(volume_candidates "$tmp/closed" "$tmp/volumes" | tr '\n' ' ')"
check 'a closed issue'\''s volume is removable' 'tamu-js-100 ' "$got"

# THE OTHER CASE THAT MATTERS: tamu-js-dev-nm holds the dev server's node_modules, and tamu-js-1623-nm is
# named after an issue that IS closed - only the trailing -nm keeps it. Neither may ever match.
for keep in tamu-js-dev-nm tamu-js-chk-development tamu-js-1623-nm some-other-volume; do
  case "$got" in
    *"$keep"*) check "$keep is never removable" 'excluded' 'INCLUDED' ;;
    *) check "$keep is never removable" 'excluded' 'excluded' ;;
  esac
done

case "$got" in
  *tamu-js-200*) check 'an open issue'\''s volume is kept' 'kept' 'removable' ;;
  *) check 'an open issue'\''s volume is kept' 'kept' 'kept' ;;
esac

# The Docker disk image (#3400). Removing volumes never shrinks it, so a sweep has to say so.
got="$(image_advice 500 300 | head -n 1)"
case "$got" in
  *"500 GiB"*"300 GiB"*"does NOT shrink"*) r=yes ;;
  *) r=no ;;
esac
check 'an image over the threshold is reported, with both numbers' 'yes' "$r"

check 'an image under the threshold says nothing' '' "$(image_advice 100 300)"
check 'an image exactly at the threshold says nothing' '' "$(image_advice 300 300)"

case "$(image_advice 500 300)" in
  *diskpart*) r=yes ;;
  *) r=no ;;
esac
check 'the advice names how to reclaim the space' 'yes' "$r"


# `.pr-body.md` drafts a pull request body and is deliberately never committed. A copy left behind made 68
# merged worktrees permanently un-removable on the home machine, about 40 GiB no sweep could reclaim (#3432).
check 'a worktree holding only an untracked .pr-body.md is removable' 'yes'   "$(only_a_drafted_pr_body '?? .pr-body.md' && echo yes || echo no)"

# The whole point of keeping dirty worktrees. A capture stops being obtainable the moment the code changes, so
# an untracked screenshots folder is possibly irreplaceable work: wt-2459 held exactly this.
check 'a worktree holding untracked screenshots is kept' 'no'   "$(only_a_drafted_pr_body '?? docs/screenshots/' && echo yes || echo no)"

check 'a worktree holding a tracked edit is kept' 'no'   "$(only_a_drafted_pr_body ' M libs/maps/esri/src/index.ts' && echo yes || echo no)"

# Both together must keep it: the real edit is what matters, and finding the disposable file first must not
# short-circuit the decision.
check 'a .pr-body.md beside a real edit still keeps the worktree' 'no'   "$(printf '%s' '?? .pr-body.md
 M libs/maps/esri/src/index.ts' | { read -r -d '' status || true; only_a_drafted_pr_body "$status" && echo yes || echo no; })"

# A clean worktree is already removable by the caller; this function must not claim it, so that "no changes"
# and "only a disposable change" stay distinguishable in the output.
check 'a clean worktree is not claimed by this check' 'no'   "$(only_a_drafted_pr_body '' && echo yes || echo no)"

# A TRACKED .pr-body.md is a commit someone made, not a leftover draft.
check 'a tracked .pr-body.md edit is kept' 'no'   "$(only_a_drafted_pr_body ' M .pr-body.md' && echo yes || echo no)"

# The name has to be exact: a file that merely ends in it is somebody else's.
check 'a differently named body file is kept' 'no'   "$(only_a_drafted_pr_body '?? docs/.pr-body.md' && echo yes || echo no)"


# The threshold says the file is large; it says nothing about how much a compaction would give back, and the
# two come apart. On 24 November 2026 a sweep that freed 13 GiB printed the same recommendation as the one
# that freed about 700, with no way to tell them apart (#3452).
r=no
case "$(image_advice 400 300 13)" in *"freed about 13 GiB"*) r=yes ;; esac
check 'the advice says how much this sweep freed' 'yes' "$r"

r=no
case "$(image_advice 400 300 13)" in *"40 minutes"*) r=yes ;; esac
check 'the advice says what a compaction costs, so it can be weighed' 'yes' "$r"

# A sweep that freed nothing must not imply it did.
r=no
case "$(image_advice 400 300 0)" in *"freed about 0 GiB"*) r=yes ;; esac
check 'a sweep that freed nothing says 0 rather than staying silent' 'yes' "$r"

# Called without a gain - as anything on an older call site would - it must still give the advice rather
# than breaking or printing an empty amount.
r=no
case "$(image_advice 400 300)" in *"over the 300 GiB threshold"*) r=yes ;; esac
check 'the advice still works with no gain given' 'yes' "$r"

r=no
case "$(image_advice 400 300)" in *"freed about"*) r=yes ;; esac
check 'with no gain given it claims nothing about the gain' 'no' "$r"

# Under the threshold it stays silent whatever the gain, as before.
check 'an image under the threshold says nothing even with a gain' '' "$(image_advice 100 300 50)"

if [ "$failed" -ne 0 ]; then
  printf '\n%d case(s) failed.\n' "$failed" >&2
  exit 1
fi
printf '\nAll cases passed.\n'
