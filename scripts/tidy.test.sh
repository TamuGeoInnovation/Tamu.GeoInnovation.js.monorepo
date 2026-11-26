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

# Detached worktrees (#3438): no branch line, so worktree_candidates never offers one; detached_worktrees lists them
# with their commit, and detached_merged keeps only those whose commit is already in the base. The "is it an ancestor?"
# answer comes from a stub: 4444 (wt-detached) is merged, 5555 (wt-detached-open) is not.
cat >>"$tmp/porcelain" <<'EOF'

worktree C:/TAMU/wt-detached-open
HEAD 5555555555555555555555555555555555555555
detached
EOF
stub_ancestor() { [ "$1" = 4444444444444444444444444444444444444444 ]; }

detached_worktrees "$tmp/porcelain" >"$tmp/detached"
check 'detached worktrees are listed with their commit' \
  'C:/TAMU/wt-detached 4444444444444444444444444444444444444444|C:/TAMU/wt-detached-open 5555555555555555555555555555555555555555|' \
  "$(tr '\n' '|' <"$tmp/detached")"

got="$(detached_merged "$tmp/detached" origin/development stub_ancestor | tr '\n' ' ')"
check 'a detached worktree on a merged commit is removable' 'C:/TAMU/wt-detached ' "$got"
case "$got" in
  *wt-detached-open*) check 'a detached worktree on an unmerged commit is kept' 'kept' 'removable' ;;
  *) check 'a detached worktree on an unmerged commit is kept' 'kept' 'kept' ;;
esac

# The main checkout, detached on a merged commit, must still never be offered: the guard is "the first worktree line",
# and detachment does not change which line is first.
cat >"$tmp/porcelain-main-detached" <<'EOF'
worktree C:/TAMU/Tamu.GeoInnovation.js.monorepo
HEAD 4444444444444444444444444444444444444444
detached

worktree C:/TAMU/wt-detached
HEAD 4444444444444444444444444444444444444444
detached
EOF
detached_worktrees "$tmp/porcelain-main-detached" >"$tmp/detached-main"
got="$(detached_merged "$tmp/detached-main" origin/development stub_ancestor | tr '\n' ' ')"
check 'a DETACHED MAIN CHECKOUT is never removable' 'C:/TAMU/wt-detached ' "$got"

# Folders git does not list (#3438): reported, never offered for removal. One registered, one not.
parent="$tmp/parent"
mkdir -p "$parent/wt-registered" "$parent/wt-orphan" "$parent/not-a-worktree"
printf 'worktree %s\nHEAD 1\nbranch refs/heads/main\n\nworktree %s\nHEAD 2\ndetached\n' "$parent/main" "$parent/wt-registered" >"$tmp/porcelain-folders"
check 'a wt-* folder git does not list is reported' "$parent/wt-orphan" "$(unregistered_folders "$tmp/porcelain-folders" "$parent")"
got="$(detached_merged "$tmp/detached" origin/development stub_ancestor; worktree_candidates "$tmp/merged" "$tmp/porcelain")"
case "$got" in
  *wt-orphan*) check 'and is never offered for removal' 'not offered' 'offered' ;;
  *) check 'and is never offered for removal' 'not offered' 'not offered' ;;
esac

# The two kinds of unlisted folder (#3678). An orphan has no .git at all: a worktree whose registration and .git file
# are both gone, which nothing else here can see. A folder with its own .git is another repository's worktree or a
# clone - four on the work machine were kubernetes-config's - and is never this script's to remove.
mkdir -p "$parent/wt-other-worktree" "$parent/wt-clone/.git" "$parent/wt-broken"
printf 'gitdir: C:/elsewhere/.git/worktrees/wt-other-worktree\n' >"$parent/wt-other-worktree/.git"
printf 'gitdir: C:/TAMU/gone/.git/worktrees/wt-broken\n' >"$parent/wt-broken/.git"
check 'a folder with no .git is an orphan' 'orphaned' "$(unregistered_kind "$parent/wt-orphan")"
check 'a folder whose .git file points elsewhere is not' 'own-git' "$(unregistered_kind "$parent/wt-other-worktree")"
check 'nor is a clone with a .git directory' 'own-git' "$(unregistered_kind "$parent/wt-clone")"
check 'nor is one whose .git points at nothing' 'own-git' "$(unregistered_kind "$parent/wt-broken")"

# Sizes are added up and said as one number, because the number is the point.
check 'a total in KiB reads as GiB' '2.2 GiB' "$(kib_human 2306867)"
check 'a small total reads as MiB' '512 MiB' "$(kib_human 524288)"
check 'a near-empty folder is not 0' '12 KiB' "$(kib_human 12)"

# Removal: only an orphan, only a wt-* folder directly in the parent, never a listed one, never one with a .git.
check 'an orphan may be removed' 'yes' "$(orphan_removable "$parent/wt-orphan" "$parent" "$tmp/porcelain-folders" >/dev/null && echo yes || echo no)"
check 'a folder with a .git file is refused' 'no' "$(orphan_removable "$parent/wt-other-worktree" "$parent" "$tmp/porcelain-folders" >/dev/null && echo yes || echo no)"
check 'a clone is refused' 'no' "$(orphan_removable "$parent/wt-clone" "$parent" "$tmp/porcelain-folders" >/dev/null && echo yes || echo no)"
mkdir -p "$parent/wt-registered-no-git"
printf 'worktree %s\nHEAD 3\ndetached\n' "$parent/wt-registered-no-git" >>"$tmp/porcelain-folders"
check 'a folder git lists is refused, .git or not' 'no' "$(orphan_removable "$parent/wt-registered-no-git" "$parent" "$tmp/porcelain-folders" >/dev/null && echo yes || echo no)"
check 'a folder not named wt-* is refused' 'no' "$(orphan_removable "$parent/not-a-worktree" "$parent" "$tmp/porcelain-folders" >/dev/null && echo yes || echo no)"
mkdir -p "$tmp/elsewhere/wt-orphan"
check 'a wt-* folder outside the parent is refused' 'no' "$(orphan_removable "$tmp/elsewhere/wt-orphan" "$parent" "$tmp/porcelain-folders" >/dev/null && echo yes || echo no)"

# And it really removes only what it may: the orphan goes, the folder with a .git stays, with its reason given.
remove_orphan "$parent/wt-orphan" "$parent" "$tmp/porcelain-folders" >/dev/null
check 'removing an orphan removes it' 'gone' "$([ -e "$parent/wt-orphan" ] && echo there || echo gone)"
reason="$(remove_orphan "$parent/wt-other-worktree" "$parent" "$tmp/porcelain-folders")"
check 'removing a folder with a .git refuses and keeps it' 'there' "$([ -e "$parent/wt-other-worktree/.git" ] && echo there || echo gone)"
case "$reason" in
  *'.git'*) check 'and says why' 'says .git' 'says .git' ;;
  *) check 'and says why' 'says .git' "$reason" ;;
esac

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
check 'a worktree holding only an untracked .pr-body.md is removable' 'yes'   "$(only_leftovers '?? .pr-body.md' && echo yes || echo no)"

# The whole point of keeping dirty worktrees. A capture stops being obtainable the moment the code changes, so
# an untracked screenshots folder is possibly irreplaceable work: wt-2459 held exactly this.
check 'a worktree holding untracked screenshots is kept' 'no'   "$(only_leftovers '?? docs/screenshots/' && echo yes || echo no)"

check 'a worktree holding a tracked edit is kept' 'no'   "$(only_leftovers ' M libs/maps/esri/src/index.ts' && echo yes || echo no)"

# Both together must keep it: the real edit is what matters, and finding the disposable file first must not
# short-circuit the decision.
check 'a .pr-body.md beside a real edit still keeps the worktree' 'no'   "$(printf '%s' '?? .pr-body.md
 M libs/maps/esri/src/index.ts' | { read -r -d '' status || true; only_leftovers "$status" && echo yes || echo no; })"

# A clean worktree is already removable by the caller; this function must not claim it, so that "no changes"
# and "only a disposable change" stay distinguishable in the output.
check 'a clean worktree is not claimed by this check' 'no'   "$(only_leftovers '' && echo yes || echo no)"

# A TRACKED .pr-body.md is a commit someone made, not a leftover draft.
check 'a tracked .pr-body.md edit is kept' 'no'   "$(only_leftovers ' M .pr-body.md' && echo yes || echo no)"

# The name has to be exact: a file that merely ends in it is somebody else's.
check 'a differently named body file is kept' 'no'   "$(only_leftovers '?? docs/.pr-body.md' && echo yes || echo no)"


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

# A sweep that only runs when a check runs never runs on a machine that is not running checks - which is how
# one sat at 856 GiB while idle (#3454). `--if-due` has to be cheap to call often and honest about when.
check 'with no stamp at all a sweep is due' 'yes'   "$(sweep_due '' 1000000 12 && echo yes || echo no)"

check 'an unreadable stamp counts as due rather than silently never' 'yes'   "$(sweep_due '' 0 12 && echo yes || echo no)"

# 12 hours exactly is due: the boundary belongs to the sweep, or a 12-hourly caller drifts a cycle later
# every day and eventually never fires at the same time twice.
check 'exactly the interval is due' 'yes'   "$(sweep_due 0 43200 12 && echo yes || echo no)"

check 'a second under the interval is not due' 'no'   "$(sweep_due 0 43199 12 && echo yes || echo no)"

check 'well under the interval is not due' 'no'   "$(sweep_due 1000000 1003600 12 && echo yes || echo no)"

check 'well over the interval is due' 'yes'   "$(sweep_due 1000000 1090000 12 && echo yes || echo no)"

# The interval is configurable, so a machine that fills fast can sweep hourly.
check 'a shorter interval is honoured' 'yes'   "$(sweep_due 0 3600 1 && echo yes || echo no)"

check 'a longer interval is honoured' 'no'   "$(sweep_due 0 43200 24 && echo yes || echo no)"

# #3707: the leftovers a finished worktree is allowed to hold. A check writes check.out and its log beside the
# checkout, a listener its scratch in .b<n>/, and a drafted body is .pr-body.md; none of them is work. Anything else,
# screenshots above all, still keeps the worktree.
check 'a worktree holding only check.out is removable (#3707)' 'yes' \
  "$(only_leftovers '?? check.out' && echo yes || echo no)"
check 'a worktree holding only a check log is removable' 'yes' \
  "$(only_leftovers '?? check-tamu-js-3474-affected.log' && echo yes || echo no)"
check 'a worktree holding only a listener scratch folder is removable' 'yes' \
  "$(only_leftovers '?? .b40/' && echo yes || echo no)"
check 'all the leftovers together are still only leftovers' 'yes' \
  "$(only_leftovers "$(printf '%s\n' '?? .pr-body.md' '?? check.out' '?? .b47/' '?? check-tamu-js-1-affected.log')" && echo yes || echo no)"
check 'a .b folder that is not .b<number> is kept' 'no' \
  "$(only_leftovers '?? .build/' && echo yes || echo no)"
check 'a leftover beside screenshots still keeps the worktree' 'no' \
  "$(only_leftovers "$(printf '%s\n' '?? check.out' '?? docs/screenshots/')" && echo yes || echo no)"
check 'a tracked check.out edit is kept' 'no' \
  "$(only_leftovers ' M check.out' && echo yes || echo no)"
check 'the .pr-body.md rule still holds (#3432)' 'yes' \
  "$(only_leftovers '?? .pr-body.md' && echo yes || echo no)"
check 'and a clean worktree is still not claimed' 'no' \
  "$(only_leftovers '' && echo yes || echo no)"

# #3707: which local branches go. Arguments: name, protected (1 when held by a kept worktree or the checkout the sweep
# runs in), tip in origin/development, commits on no remote, fork branch still there, merged-at epoch or -, tip epoch.
verdict() { branch_verdict "$@" | cut -d ' ' -f 1; }
check 'a branch whose tip is in development goes' 'prune' "$(verdict fix/1-a 0 1 0 0 - 100)"
check 'a branch whose commits are all on a remote and whose fork branch is gone goes' 'prune' "$(verdict fix/2-b 0 0 0 0 - 100)"
check 'one whose fork branch is still there stays: it is open work' 'keep' "$(verdict fix/3-c 0 0 0 1 - 100)"
check 'a squash-merged branch, nothing committed after the merge, goes' 'prune' "$(verdict fix/4-d 0 0 3 0 200 150)"
check 'one with a commit after its merge stays: that commit is on no remote' 'keep' "$(verdict fix/5-e 0 0 3 0 200 250)"
check 'a branch with commits on no remote and no merged pull request stays' 'keep' "$(verdict fix/6-f 0 0 2 0 - 100)"
r=no; case "$(branch_verdict fix/6-f 0 0 2 0 - 100)" in *'only on this machine'*) r=yes ;; esac
check 'and says it is only on this machine' 'yes' "$r"
check 'development never goes, merged or not' 'keep' "$(verdict development 0 1 0 0 - 100)"
check 'nor master' 'keep' "$(verdict master 0 1 0 0 - 100)"
check 'nor a mailbox branch' 'keep' "$(verdict work-mailbox 0 1 0 0 - 100)"
check 'nor a local copy of one, however it is named' 'keep' "$(verdict mb-gisday 0 0 0 0 - 100)"
check 'nor a branch with mailbox anywhere in its name' 'keep' "$(verdict mailbox-copy 0 1 0 0 - 100)"
check 'nor a branch held by a worktree that is kept' 'keep' "$(verdict fix/7-g 1 1 0 0 - 100)"

# #3756: "on a remote" means any remote, not only the fork. Dependabot's branches live on origin and were never on the
# fork, so the sweep read them as "fork branch gone" and deleted one a moment before its own check fetched it.
check 'a branch origin still has stays: open work (#3756)' 'keep' "$(verdict dependabot/npm_and_yarn/x 0 0 0 1 - 100 1)"
check 'even when its pull request has merged, while a remote still has it' 'keep' "$(verdict fix/8-h 0 1 0 1 200 150 1)"
# #3756: a branch never pushed anywhere is never pruned. With commits, they are on no remote; with none yet (just
# started, its tip still on development), "tip in development" must not read as "merged".
check 'a branch never pushed, with commits, stays' 'keep' "$(verdict fix/9-i 0 0 2 0 - 100 0)"
check 'a branch never pushed and not yet committed to stays' 'keep' "$(verdict fix/10-j 0 1 0 0 - 100 0)"
r=no; case "$(branch_verdict fix/10-j 0 1 0 0 - 100 0)" in *'never pushed'*) r=yes ;; esac
check 'and says it was never pushed' 'yes' "$r"
check 'one that was pushed and whose tip is in development still goes' 'prune' "$(verdict fix/11-k 0 1 0 0 - 100 1)"

# #3756: whether any remote has a branch, and whether a branch was published, read from a real repository.
remotes_repo="$tmp/remotes"
git init -q -b development "$remotes_repo"
git -C "$remotes_repo" -c user.name=t -c user.email=t@t commit -q --allow-empty -m base
tip_sha="$(git -C "$remotes_repo" rev-parse HEAD)"
git -C "$remotes_repo" update-ref refs/remotes/origin/dependabot/npm_and_yarn/x "$tip_sha"
git -C "$remotes_repo" update-ref refs/remotes/fork/fix/1-mine "$tip_sha"
check 'a branch origin has is on a remote' 'yes' "$(on_a_remote "$remotes_repo" dependabot/npm_and_yarn/x && echo yes || echo no)"
check 'a branch the fork has is on a remote' 'yes' "$(on_a_remote "$remotes_repo" fix/1-mine && echo yes || echo no)"
check 'a branch no remote has is not' 'no' "$(on_a_remote "$remotes_repo" fix/2-gone && echo yes || echo no)"
check 'a name that only ends the same is not' 'no' "$(on_a_remote "$remotes_repo" x && echo yes || echo no)"
git -C "$remotes_repo" branch fix/3-tracked
git -C "$remotes_repo" config branch.fix/3-tracked.remote fork
git -C "$remotes_repo" config branch.fix/3-tracked.merge refs/heads/fix/3-tracked
git -C "$remotes_repo" branch fix/4-local
check 'a branch with an upstream was published' 'yes' "$(was_published "$remotes_repo" fix/3-tracked && echo yes || echo no)"
check 'a branch made here and never pushed was not' 'no' "$(was_published "$remotes_repo" fix/4-local && echo yes || echo no)"
git -C "$remotes_repo" branch fix/5-from-development
git -C "$remotes_repo" config branch.fix/5-from-development.remote origin
git -C "$remotes_repo" config branch.fix/5-from-development.merge refs/heads/development
check 'a branch only started from origin/development, never pushed, was not' 'no' "$(was_published "$remotes_repo" fix/5-from-development && echo yes || echo no)"

# #3756: the branch a check is about to check is never removed by the sweep that check runs first.
check 'the branch a check names is kept by the sweep' 'yes' "$(TIDY_KEEP_BRANCH=fix/5-checked kept_by_caller fix/5-checked && echo yes || echo no)"
check 'and only that one' 'no' "$(TIDY_KEEP_BRANCH=fix/5-checked kept_by_caller fix/6-other && echo yes || echo no)"
grep -q 'TIDY_KEEP_BRANCH="$branch"' "$(dirname "$0")/check-in-volume.sh" && r=yes || r=no
check 'check-in-volume.sh tells the sweep which branch it is checking' 'yes' "$r"

# #3707: git will not delete a branch a worktree has checked out, which is why the first command on home failed on most
# branches (26 November). So a branch's worktree goes first.
check 'a branch with a worktree: the worktree goes first, then the branch' \
  'worktree C:/TAMU/wt-7|branch fix/7-g|' "$(prune_steps fix/7-g C:/TAMU/wt-7 | tr '\n' '|')"
check 'a branch with no worktree: just the branch' 'branch fix/8-h|' "$(prune_steps fix/8-h - | tr '\n' '|')"

# #3707: the sweep must not assume the checkout it is run from is current or removable. On 26 November home's main
# checkout predated tidy.sh, and run from wt-preprcheck the sweep counted wt-preprcheck itself as removable.
printf '%s\n' 'C:/TAMU/wt-preprcheck' 'C:/TAMU/wt-merged' > "$tmp/paths"
check 'the worktree the sweep runs from is never removed' 'C:/TAMU/wt-merged ' \
  "$(without_path "$tmp/paths" 'C:/TAMU/wt-preprcheck' | tr '\n' ' ')"
check 'whatever case Windows gives the path in' 'C:/TAMU/wt-merged ' \
  "$(without_path "$tmp/paths" 'c:/tamu/WT-PREPRCHECK' | tr '\n' ' ')"

# A real repository whose checked-out commit is OLD, with a branch merged only into a newer origin/development: the
# branch is finished, and the old HEAD must not hide that.
repo="$tmp/old-checkout"
git init -q -b development "$repo"
git -C "$repo" -c user.name=t -c user.email=t@t commit -q --allow-empty -m old
git -C "$repo" branch fix/9-merged
git -C "$repo" checkout -q fix/9-merged
git -C "$repo" -c user.name=t -c user.email=t@t commit -q --allow-empty -m work
git -C "$repo" checkout -q development
git -C "$repo" update-ref refs/remotes/origin/development "$(git -C "$repo" rev-parse fix/9-merged)"
check 'a branch merged into origin/development is in it, though the checkout is older' 'yes' \
  "$(branch_in_development "$repo" fix/9-merged && echo yes || echo no)"
git -C "$repo" branch fix/10-open development
git -C "$repo" checkout -q fix/10-open
git -C "$repo" -c user.name=t -c user.email=t@t commit -q --allow-empty -m open
git -C "$repo" checkout -q development
check 'a branch with work development does not have is not' 'no' \
  "$(branch_in_development "$repo" fix/10-open && echo yes || echo no)"

# #3707: branches and worktrees on every check, volumes still behind the watermark.
grep -q 'if \[ "$branches_only" != yes \] && git -C "$main" rev-parse -q --verify origin/development' "$(dirname "$0")/tidy.sh" && r=yes || r=no
check 'the every-check sweep leaves detached worktrees to the free-space sweep' 'yes' "$r"
grep -q 'tidy.sh" --branches' "$(dirname "$0")/check-in-volume.sh" && r=yes || r=no
check 'every check sweeps branches and worktrees' 'yes' "$r"

if [ "$failed" -ne 0 ]; then
  printf '\n%d case(s) failed.\n' "$failed" >&2
  exit 1
fi
printf '\nAll cases passed.\n'
