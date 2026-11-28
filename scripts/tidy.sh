#!/usr/bin/env bash
# Removes what a finished branch leaves behind: its git worktree and its tamu-js-<issue> Docker volume.
#
#   bash scripts/tidy.sh              # report what would go, remove nothing
#   bash scripts/tidy.sh --yes        # remove it
#   bash scripts/tidy.sh --remove-orphans  # remove only the wt-* folders with no .git that git does not list (#3678)
#
# Why this exists. CLAUDE.md documents creating both of these and removing neither, so growth is monotonic
# by construction. On 24 November 2026 the work computer reached 0 bytes free of 1,907 GB: 460 worktrees at
# 589 MiB each (about 271 GB) and 323 tamu-js-* volumes at 2.7 GiB each (about 853 GB, inside the WSL2 disk
# image). No check of any kind could run on that machine until space was freed by hand (#3365, #3400).
#
# What is removable, and what is deliberately not:
#   - A worktree whose branch is the head of a MERGED pull request. The work is in development; the folder
#     is residue. A worktree with uncommitted changes is kept whatever its branch has done.
#   - A tamu-js-<issue> volume whose issue is CLOSED. A volume is pure cache - a clone and an npm install -
#     and the next check rebuilds it. The Nx cache inside is a speed-up, not a record.
#   - NEVER the main checkout, and never a volume whose name is not tamu-js-<number>: tamu-js-dev-nm is the
#     dev server's node_modules and removing it costs a reinstall.
#
# Removing a volume frees space INSIDE the WSL2 disk image, which does not shrink on its own. To give the
# space back to C:, stop Docker, `wsl --shutdown`, and compact docker_data.vhdx with diskpart.
#
# Needs `gh` for the merged and closed lists. Tested by scripts/tidy.test.sh.
set -uo pipefail

repo="${TIDY_REPO:-TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo}"

# Prints the worktree paths whose branch appears in <merged list file>, one per line, EXCEPT the main
# checkout. `git worktree list --porcelain` lists the main repository FIRST and it is a worktree like any
# other, so a filter that only asks "has this branch merged?" removes the repository itself. That is not
# hypothetical: on 24 November 2026 the main checkout was sitting on a docs branch whose pull request had
# merged, and it appeared in the raw candidate list. Tested by scripts/tidy.test.sh.
worktree_candidates() {
  local merged="$1" porcelain="$2"
  awk -v merged="$merged" '
    BEGIN { while ((getline line < merged) > 0) if (line != "") is[line] = 1 }
    /^worktree / { path = substr($0, 10); is_main = (++seen == 1); next }
    /^branch refs\/heads\// {
      branch = substr($0, 8); sub(/^refs\/heads\//, "", branch)
      if (!is_main && (branch in is)) print path
    }
  ' "$porcelain"
}

# Prints `<path> <commit>` for every DETACHED worktree but the main checkout, one per line (#3438). A worktree made
# with --detach, which is how a smoke tier is run at a build's exact commit, has no `branch` line in the porcelain,
# only `detached`, so worktree_candidates can never offer it: 34 of 122 on the work machine on 24 November. Whether
# one is removable is a question about its commit, not a branch; detached_merged answers it.
detached_worktrees() {
  local porcelain="$1"
  awk '
    /^worktree / { path = substr($0, 10); is_main = (++seen == 1); head = ""; next }
    /^HEAD / { head = $2; next }
    /^detached$/ { if (!is_main && head != "") print path " " head }
  ' "$porcelain"
}

# Prints the paths of the detached worktrees in <detached list> (as detached_worktrees prints it) whose commit is
# already in <base>, so they hold nothing unmerged. <ancestor> is the command that answers "is this commit in
# <base>?" (`git merge-base --is-ancestor` by default), replaceable so the test needs no repository. A detached
# worktree on a commit that is not in <base> is kept. Tested by scripts/tidy.test.sh.
detached_merged() {
  local list="$1" base="$2" ancestor="${3:-git_is_ancestor}" path commit
  while read -r path commit; do
    [ -n "$commit" ] || continue
    if "$ancestor" "$commit" "$base"; then
      printf '%s\n' "$path"
    fi
  done < "$list"
}

git_is_ancestor() {
  git -C "$main" merge-base --is-ancestor "$1" "$2" 2>/dev/null
}

# Prints the `wt-*` folders in <parent> that <porcelain> does not list, one per line (#3438). Git only knows the
# worktrees it was told about, so a folder whose registration was pruned, or a worktree of ANOTHER repository
# (four of six on the work machine were kubernetes-config's), is invisible to every other check here. These are
# reported, never removed: deciding that a folder is nobody's is a person's call.
unregistered_folders() {
  local porcelain="$1" parent="$2" dir
  for dir in "$parent"/wt-*; do
    [ -d "$dir" ] || continue
    if ! awk -v want="$dir" '/^worktree / { p = substr($0, 10); gsub(/\\/, "/", p); if (tolower(p) == tolower(want)) found = 1 } END { exit !found }' "$porcelain"; then
      printf '%s\n' "$dir"
    fi
  done
}

# Which of two kinds an unlisted folder is (#3678): `orphaned` when it has no `.git` at all, `own-git` when it has one,
# file or directory, readable or not. An orphan is a worktree whose registration and `.git` file are both gone, so it
# cannot be anybody's live work - but nothing proves it was this repository's either. A folder with a `.git` is another
# repository's worktree or a clone (four on the work machine were kubernetes-config's), and is never removed here.
# Reporting the two under one heading made a warning about three folders of residue read as one about seven.
unregistered_kind() {
  if [ -e "$1/.git" ]; then echo own-git; else echo orphaned; fi
}

# A size in KiB as people say it: GiB to one decimal from 1 GiB up, then MiB, then KiB, so a near-empty folder is not "0".
kib_human() {
  awk -v k="$1" 'BEGIN { if (k >= 1048576) printf "%.1f GiB\n", k / 1048576; else if (k >= 1024) printf "%.0f MiB\n", k / 1024; else printf "%d KiB\n", k }'
}

# True when <dir> may be removed by --remove-orphans: a `wt-*` folder directly in <parent>, which the worktree list in
# <porcelain> does not name, with no `.git` of any kind. Otherwise false, printing why. Each condition is checked again
# at the moment of removal, not trusted from the report: a folder that has gained a `.git` since is somebody's.
orphan_removable() {
  local dir="$1" parent="$2" porcelain="$3"
  case "$(basename "$dir")" in wt-*) ;; *) echo "not named wt-*"; return 1 ;; esac
  if [ "$(cd "$(dirname "$dir")" 2>/dev/null && pwd)" != "$(cd "$parent" 2>/dev/null && pwd)" ]; then
    echo "not directly in $parent"
    return 1
  fi
  if [ -e "$dir/.git" ]; then
    echo "it has a .git, so it is a repository's working copy"
    return 1
  fi
  if [ -n "$(unregistered_folders "$porcelain" "$parent" | awk -v d="$dir" '$0 == d')" ]; then
    return 0
  fi
  echo "git lists it as a worktree"
  return 1
}

# Removes <dir> if orphan_removable allows it, and otherwise prints why not and leaves it.
remove_orphan() {
  local dir="$1" parent="$2" porcelain="$3" why
  if ! why="$(orphan_removable "$dir" "$parent" "$porcelain")"; then
    echo "  NOT removing $dir: $why"
    return 1
  fi
  rm -rf -- "$dir"
}

# True when every uncommitted change in <git status --porcelain output> is an untracked leftover, and there is at
# least one. The leftovers are the files a finished piece of work leaves behind and nobody comes back for:
#   - `.pr-body.md`, a drafted pull request body, deliberately never committed. On 24 November 2026, 68 of the 69
#     worktrees this script had kept held nothing else, about 40 GiB no sweep could reclaim (#3432);
#   - `check.out` and `check-tamu-js-*.log`, what a check writes beside the checkout it was run from;
#   - `.b<number>/`, a listener's scratch folder for a batch: its scripts, logs and working captures (#3707).
#
# Deliberately narrow: those exact names at the top of the worktree, untracked, and nothing else on the line. A
# worktree holding anything else is still kept, screenshots above all - a capture stops being obtainable the moment the
# code changes, so an untracked `docs/screenshots/` folder is possibly irreplaceable work and is exactly what keeping
# dirty worktrees is for. Tested by scripts/tidy.test.sh.
only_leftovers() {
  local status="$1"

  [ -n "$status" ] || return 1

  printf '%s\n' "$status" | awk '
    $0 == "" { next }
    $0 !~ /^\?\? (\.pr-body\.md|check\.out|check-tamu-js-[^ \/]+\.log|\.b[0-9]+\/)$/ { other = 1 }
    { seen = 1 }
    END { exit (seen && !other) ? 0 : 1 }
  '
}

# Prints `prune <why>` or `keep <why>` for one local branch, from what is known about it (#3707, #3756):
#   <name> <protected> <in development> <commits on no remote> <a remote has it> <merged-at epoch or -> <tip epoch>
#   <published>
# <protected> is 1 for a branch held by a worktree that is kept, checked out where the sweep runs, or named by the check
# that runs the sweep. <published> is 1 for a branch that was pushed (it has an upstream) or has a merged pull request.
#
# A branch any remote still has is open work, whatever else is true: a Dependabot branch lives on origin and was never
# on the fork, and reading "not on the fork" as "gone" deleted one from under its own check (#3756). Otherwise a finished
# branch goes when it was published and its tip is in origin/development, when its pull request merged and nothing was
# committed after the merge (a squash merge leaves the branch's own commits on no remote, so without that rule almost
# nothing would ever go: 425 of 452 on home, 26 November), or when every commit is on a remote and no remote has the
# branch any more. Anything with commits on no remote is kept and listed: this machine holds the only copy. So is a
# branch never pushed at all, whose tip can still be on development because nobody has committed to it yet. Never
# development, master or a mailbox branch, or a local copy of one (`mb-<name>`, as home kept `mb-gisday`).
# Tested by scripts/tidy.test.sh.
branch_verdict() {
  local name="$1" protected="$2" in_dev="$3" only_here="$4" on_remote="$5" merged_at="$6" tip="$7" published="${8:-1}"

  case "$name" in
    development | master | *mailbox* | mb-*) echo "keep a branch this sweep never touches"; return ;;
  esac
  if [ "$protected" = 1 ]; then
    echo "keep its worktree is kept, the sweep is running in it, or the check is checking it"
  elif [ "$on_remote" = 1 ]; then
    echo "keep a remote still has it, so it is open work"
  elif [ "$in_dev" = 1 ] && [ "$published" = 1 ]; then
    echo "prune its tip is in origin/development"
  elif [ "$merged_at" != - ] && [ "$tip" -le "$merged_at" ]; then
    echo "prune its pull request merged, and nothing was committed after"
  elif [ "$only_here" -gt 0 ]; then
    echo "keep only on this machine: $only_here commit(s) on no remote"
  elif [ "$published" != 1 ]; then
    echo "keep never pushed: started here, and not yet committed to"
  else
    echo "prune every commit is on a remote, and no remote has the branch any more"
  fi
}

# True when any remote has a branch named <name> in the repository at <main>: origin as well as the fork (#3756).
on_a_remote() {
  git -C "$1" for-each-ref --format='%(refname)' refs/remotes |
    awk -v want="$2" '{ ref = $0; sub(/^refs\/remotes\/[^\/]+\//, "", ref) } ref == want { found = 1 } END { exit !found }'
}

# True when <name> was published from the repository at <main>: its upstream is a branch of the same name, which
# `git push -u` sets. A branch only started from origin/development tracks `development`, so it does not count.
was_published() {
  [ "$(git -C "$1" config --get "branch.$2.merge" 2>/dev/null)" = "refs/heads/$2" ]
}

# True when <name> is the branch the caller is about to use, passed as TIDY_KEEP_BRANCH: check-in-volume.sh sweeps
# before its container fetches the branch, and must not remove what it is about to check (#3756).
kept_by_caller() {
  [ -n "${TIDY_KEEP_BRANCH:-}" ] && [ "$1" = "$TIDY_KEEP_BRANCH" ]
}

# Prints what removing a branch takes, in order: its worktree first (`worktree <path>`), then the branch
# (`branch <name>`). Git will not delete a branch a worktree has checked out, which is why the first cleanup on home on
# 26 November failed on most branches and needed a second command. <worktree> is `-` for none.
prune_steps() {
  local name="$1" worktree="$2"

  [ "$worktree" = - ] || echo "worktree $worktree"
  echo "branch $name"
}

# Prints the paths in <list file> except <path>, compared without regard to case or slash direction, as Windows does.
# The sweep never removes the worktree it is run from: on 26 November, run from wt-preprcheck, it counted
# wt-preprcheck as removable, since that worktree sat clean on a commit in development.
without_path() {
  local list="$1" self="$2"
  awk -v self="$self" '
    function norm(p) { gsub(/\\/, "/", p); sub(/\/$/, "", p); return tolower(p) }
    BEGIN { s = norm(self) }
    norm($0) != s
  ' "$list"
}

# True when <branch>'s tip is in origin/development in the repository at <main>. Always origin/development, never the
# checkout's HEAD or the commit the sweep's own copy of this script came from: home's main checkout sat on a commit from
# before tidy.sh existed (26 November), and a finished branch is finished whatever that checkout has.
branch_in_development() {
  git -C "$1" merge-base --is-ancestor "refs/heads/$2" refs/remotes/origin/development 2>/dev/null
}

# Prints the volume names in <volume list file> that are tamu-js-<number> for a CLOSED issue, one per line.
# The name must be entirely digits after the prefix, so tamu-js-dev-nm, tamu-js-chk-development and the
# other named volumes are never matched however the issue list reads. Tested by scripts/tidy.test.sh.
#
# This is the other half of scripts/volume-name.sh's rule, and the two have to mean the same thing: this
# decides a volume is removable, that decides which volume a check runs in. When they disagree a sweep
# removes a volume somebody is using, which is what #3802 was. volume_for_branch there produces a bare
# number here only for a branch that names an issue, and scripts/volume-name.test.sh asserts that over a
# table of real branch names, from both sides. Change either rule and that test fails.
volume_candidates() {
  local closed="$1" volumes="$2"
  awk -v closed="$closed" '
    BEGIN { while ((getline line < closed) > 0) if (line != "") is[line] = 1 }
    /^tamu-js-[0-9]+$/ { issue = substr($0, 9); if (issue in is) print }
  ' "$volumes"
}

# True when a sweep is due: no stamp, an unreadable one, or one older than <hours>. The stamp is a file
# whose mtime is the last run; <now> and <stamp mtime> are epoch seconds so the test can drive it.
#
# Why this is in the script rather than in whatever calls it: the sweep only ever ran when a check ran, and a
# machine that is not running checks never cleaned up at all. That is how a machine sat at 856 GiB while idle
# (#3454). A caller can now ask "is it due?" cheaply and often, and the expensive part - two GitHub queries
# and a Docker listing - happens only when the answer is yes. Tested by scripts/tidy.test.sh.
sweep_due() {
  local last="$1" now="$2" hours="${3:-12}"

  [ -n "$last" ] || return 0
  awk -v l="$last" -v n="$now" -v h="$hours" 'BEGIN { exit !((n - l) >= h * 3600) }'
}

# Prints the advice for a Docker disk image of <size GiB> against <threshold GiB>, or nothing when it is
# under. REMOVING A VOLUME NEVER SHRINKS THE IMAGE: the file only grows, every check adding about 2.6 GiB
# to it for good, and only a compaction gives the space back to C:. That is why 975 GB sat unnoticed for
# months while the disk filled (#3400). Tested by scripts/tidy.test.sh.
image_advice() {
  local size="$1" threshold="${2:-300}" gain="${3:-}"
  awk -v s="$size" -v t="$threshold" 'BEGIN { exit !(s > t) }' || return 0
  printf 'The Docker disk image is %s GiB, over the %s GiB threshold, and removing volumes does NOT shrink it.
' "$size" "$threshold"

  # What a compaction is worth RIGHT NOW, so the recommendation can be weighed instead of obeyed. The
  # threshold is about the file being large; it says nothing about how much is reclaimable, and the two come
  # apart. On 24 November 2026 a sweep that freed 13 GiB recommended the same 40-minute outage as the one
  # that freed about 700 (#3452).
  if [ -n "$gain" ]; then
    printf 'This sweep freed about %s GiB inside it. A compaction takes Docker down for roughly 40 minutes on an
' "$gain"
    printf 'image this size, so weigh that against %s GiB before doing it now rather than at the next sweep.
' "$gain"
  fi

  printf 'To give the space back to C:, with no check running:
'
  printf '  1. Stop Docker Desktop   2. wsl --shutdown   3. compact the image with diskpart   4. start Docker Desktop
'
  printf 'Run this script with --compact to do it, which refuses while any check container is up (#3406).
'
}

# Sourced (by the test): stop here, with only the functions defined.
[ "${BASH_SOURCE[0]}" = "$0" ] || return 0

set -e
act=no
compact=no
remove_orphans=no
branches_only=no
case "${1:-}" in
  --yes) act=yes ;;
  --branches) act=yes; branches_only=yes ;;
  --compact) act=yes; compact=yes ;;
  --if-due) ;;
  --remove-orphans) remove_orphans=yes ;;
  '') ;;
  *) echo "usage: $0 [--yes|--branches|--compact|--if-due|--remove-orphans]" >&2; exit 2 ;;
esac

# `--if-due` is what a listener calls on a schedule. It returns immediately and silently unless a sweep is
# due, so it can be called as often as a heartbeat without costing a GitHub query; when it is due it removes
# only if the disk is low enough to need it, and otherwise just reports (#3454).
stamp="${TIDY_STAMP:-${TMPDIR:-/tmp}/tamu-tidy-last}"
if [ "${1:-}" = --if-due ]; then
  last=""
  [ -f "$stamp" ] && last="$(date -r "$stamp" +%s 2>/dev/null || echo '')"
  sweep_due "$last" "$(date +%s)" "${TIDY_EVERY_HOURS:-12}" || exit 0
  : > "$stamp"

  # Removing is reserved for a machine that is actually short of room; above the watermark a scheduled sweep
  # reports and leaves the worktrees alone, because somebody may be about to use one.
  here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
  free="$(df -Pk "$here" 2>/dev/null | awk 'NR == 2 { printf "%.0f", $4 / 1024 / 1024 }')"
  if [ -n "$free" ] && awk -v f="$free" -v w="${TIDY_AUTO_FREE_GB:-100}" 'BEGIN { exit !(f < w) }'; then
    echo "Scheduled sweep: ${free} GiB free, below the ${TIDY_AUTO_FREE_GB:-100} GiB watermark, so removing."
    act=yes
  else
    echo "Scheduled sweep: ${free:-unknown} GiB free, so reporting only."
  fi
fi

tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

main="$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")"
# The worktree this sweep runs in is never removed, and neither is its branch (#3707).
self="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
self_branch="$(git branch --show-current 2>/dev/null || true)"

# What finished means is decided against the remotes as they are now, not as this clone last saw them: a branch whose
# fork branch has gone, or that merged since the last fetch, is only finished after a fetch (#3707). A failed fetch
# leaves the old refs, which only makes fewer branches removable, never more.
for remote in origin fork; do
  if git -C "$main" remote get-url "$remote" >/dev/null 2>&1; then
    git -C "$main" fetch -q --prune "$remote" || echo "  Could not fetch $remote; deciding on what this clone last saw." >&2
  fi
done

if [ "$branches_only" = yes ]; then
  echo "Reading merged pull requests from $repo..."
else
  echo "Reading merged pull requests and closed issues from $repo..."
fi
# `<head branch> <merged at, epoch>`, the latest merge first when a branch name was used twice.
gh pr list --repo "$repo" --state merged --limit 4000 --json headRefName,mergedAt \
  --jq '.[] | "\(.headRefName) \(.mergedAt | fromdate)"' | sort -k1,1 -k2,2nr | awk '!seen[$1]++' > "$tmp/merged-at"
cut -d ' ' -f 1 "$tmp/merged-at" > "$tmp/merged"
if [ "$branches_only" = yes ]; then
  : > "$tmp/closed"
else
  gh issue list --repo "$repo" --state closed --limit 4000 --json number --jq '.[].number' | sort -u > "$tmp/closed"
fi

git -C "$main" worktree list --porcelain > "$tmp/porcelain"
worktree_candidates "$tmp/merged" "$tmp/porcelain" > "$tmp/worktrees"

# Detached worktrees: removable when their commit is already in origin/development (#3438). A stale
# origin/development only makes fewer of them removable, never more. Not on the every-check branch sweep: a detached
# worktree belongs to no branch, and several are tools other sessions keep and reuse (a pre-pull-request checkout,
# another listener's own), so they wait for the free-space sweep as before (#3707).
detached_worktrees "$tmp/porcelain" > "$tmp/detached"
if [ "$branches_only" != yes ] && git -C "$main" rev-parse -q --verify origin/development >/dev/null; then
  detached_merged "$tmp/detached" origin/development >> "$tmp/worktrees"
fi
echo "  $(grep -c . "$tmp/detached" || true) detached worktree(s); those whose commit is in origin/development are considered."

# Folders git does not list (#3438), in two kinds with their sizes added up (#3678). Neither is touched by --yes. An
# orphan, with no .git at all, is removed only by --remove-orphans; a folder with its own .git, never.
unregistered_folders "$tmp/porcelain" "$(dirname "$main")" > "$tmp/unregistered"
: > "$tmp/orphaned"
: > "$tmp/own-git"
while IFS= read -r dir; do
  [ -n "$dir" ] || continue
  printf '%s\t%s\n' "$(du -sk "$dir" 2>/dev/null | cut -f1)" "$dir" >> "$tmp/$(unregistered_kind "$dir")"
done < "$tmp/unregistered"
orphans="$(grep -c . "$tmp/orphaned" || true)"
if [ -s "$tmp/orphaned" ]; then
  echo "  $orphans folder(s) with no .git and not listed by git, $(kib_human "$(awk -F '\t' '{ s += $1 } END { print s + 0 }' "$tmp/orphaned")") in all."
  echo "  Old worktrees whose registration and .git are gone; nothing in them can be checked, and --yes never sees them:"
  while IFS="$(printf '\t')" read -r kib dir; do
    echo "    $dir ($(kib_human "${kib:-0}"))"
  done < "$tmp/orphaned"
fi
if [ -s "$tmp/own-git" ]; then
  echo "  $(grep -c . "$tmp/own-git") folder(s) with their own .git, $(kib_human "$(awk -F '\t' '{ s += $1 } END { print s + 0 }' "$tmp/own-git")") in all: another repository's worktrees or clones. Never removed here:"
  while IFS="$(printf '\t')" read -r kib dir; do
    echo "    $dir ($(kib_human "${kib:-0}"))"
  done < "$tmp/own-git"
fi
if [ "$remove_orphans" = yes ] && [ "$orphans" -gt 0 ]; then
  echo "Removing $orphans orphaned folder(s), checking each again first."
  removed=0
  while IFS="$(printf '\t')" read -r kib dir; do
    remove_orphan "$dir" "$(dirname "$main")" "$tmp/porcelain" && removed=$((removed + 1)) && echo "    removed $dir"
  done < "$tmp/orphaned"
  echo "  Removed $removed of $orphans."
fi

# Never the worktree this sweep runs in (#3707).
without_path "$tmp/worktrees" "$self" > "$tmp/worktrees-not-self"
mv "$tmp/worktrees-not-self" "$tmp/worktrees"

# A worktree with uncommitted changes is kept, merged branch or not. On 24 November 2026, 7 of 367
# candidates were dirty: one held a real edit to a release-notes file and five held only check logs.
: > "$tmp/worktrees-clean"
while IFS= read -r path; do
  [ -d "$path" ] || continue
  # A folder git lists but cannot read (its .git file is gone) used to end the whole sweep under `set -e`, with exit
  # 128 and nothing removed; it is kept and named instead, since what it holds cannot be checked (#3438).
  if ! status="$(git -C "$path" --no-optional-locks status --porcelain 2>/dev/null)"; then
    echo "  keeping $path (git cannot read it: its .git is missing or broken; check it by hand)"
    continue
  fi

  if [ -z "$status" ]; then
    echo "$path" >> "$tmp/worktrees-clean"
  elif only_leftovers "$status"; then
    echo "  $path holds only leftovers (a drafted .pr-body.md, check output or batch scratch), which are not work (#3432, #3707)"
    echo "$path" >> "$tmp/worktrees-clean"
  else
    echo "  keeping $path (uncommitted changes)"
  fi
done < "$tmp/worktrees"

# Branches (#3707). Each local branch, by branch_verdict: `<name>\t<its worktree, or ->` for those that go, in
# branches-prune, and `<name>: <why>` for those kept with commits on no remote, in branches-kept. A branch whose worktree
# is removed above needs nothing more; one held by another worktree goes with it only when that worktree holds no work.
awk '
  /^worktree / { path = substr($0, 10); is_main = (++seen == 1); next }
  /^branch refs\/heads\// { b = substr($0, 8); sub(/^refs\/heads\//, "", b); print b "\t" path "\t" is_main }
' "$tmp/porcelain" > "$tmp/held"
git -C "$main" for-each-ref --format='%(refname:short) %(committerdate:unix)' refs/heads > "$tmp/branches"
: > "$tmp/branches-prune"
: > "$tmp/branches-why"
: > "$tmp/branches-kept"
while read -r name tip; do
  [ -n "$name" ] || continue
  protected=0
  worktree=-
  held="$(awk -F '\t' -v b="$name" '$1 == b { print $2 "\t" $3; exit }' "$tmp/held")"
  if [ -n "$held" ]; then
    path="${held%$'\t'*}"
    if [ "${held##*$'\t'}" = 1 ] || [ "$name" = "$self_branch" ] || [ -z "$(printf '%s\n' "$path" > "$tmp/one" && without_path "$tmp/one" "$self")" ]; then
      protected=1
    elif ! grep -qxF "$path" "$tmp/worktrees-clean"; then
      status="$(git -C "$path" --no-optional-locks status --porcelain 2>/dev/null)" || status="unreadable"
      if [ -z "$status" ] || only_leftovers "$status"; then worktree="$path"; else protected=1; fi
    fi
  fi
  kept_by_caller "$name" && protected=1
  in_dev=0
  branch_in_development "$main" "$name" && in_dev=1
  only_here="$(git -C "$main" rev-list --count "refs/heads/$name" --not --remotes 2>/dev/null || echo 1)"
  on_remote=0
  on_a_remote "$main" "$name" && on_remote=1
  merged_at="$(awk -v b="$name" '$1 == b { print $2; exit }' "$tmp/merged-at")"
  published=0
  { was_published "$main" "$name" || [ -n "$merged_at" ]; } && published=1
  verdict="$(branch_verdict "$name" "$protected" "$in_dev" "$only_here" "$on_remote" "${merged_at:--}" "$tip" "$published")"
  case "$verdict" in
    prune*)
      printf '%s\t%s\n' "$name" "$worktree" >> "$tmp/branches-prune"
      echo "$name: ${verdict#prune }" >> "$tmp/branches-why"
      ;;
    "keep only on this machine"*) echo "$name: ${verdict#keep }" >> "$tmp/branches-kept" ;;
  esac
done < "$tmp/branches"
branches="$(grep -c . "$tmp/branches-prune" || true)"
if [ -s "$tmp/branches-why" ]; then
  echo "  $branches finished branch(es):"
  sed 's/^/    /' "$tmp/branches-why"
fi
if [ -s "$tmp/branches-kept" ]; then
  echo "  $(grep -c . "$tmp/branches-kept") branch(es) kept because this machine holds their only copy:"
  sed 's/^/    /' "$tmp/branches-kept"
fi

if [ "$branches_only" = yes ]; then
  # Volumes stay behind the free-space watermark; this mode runs on every check (#3707).
  : > "$tmp/volumes-removable"
elif docker volume ls -q > "$tmp/volumes" 2>/dev/null; then
  volume_candidates "$tmp/closed" "$tmp/volumes" > "$tmp/volumes-removable"
else
  echo "  Docker is not answering, so no volume is considered." >&2
  : > "$tmp/volumes-removable"
fi

worktrees="$(grep -c . "$tmp/worktrees-clean" || true)"
volumes="$(grep -c . "$tmp/volumes-removable" || true)"
echo "Removable: $volumes volume(s) (about $((volumes * 27 / 10)) GiB inside the Docker disk image), $worktrees worktree(s) (about $((worktrees * 589 / 1024)) GiB on this disk), $branches branch(es)."

if [ "$act" != yes ]; then
  echo "Nothing removed. Run '$0 --yes' to remove them, or '$0 --branches' for the branches and worktrees alone."
  [ "$orphans" -gt 0 ] && [ "$remove_orphans" != yes ] && echo "The orphaned folders are kept by --yes as well. '$0 --remove-orphans' removes them, and only them."
  exit 0
fi

# Progress, because the slow phases used to be the silent ones. Prints how far through, how long it has
# taken and roughly how long is left, as scripts/check-in-volume.sh reports its own runs (#3400).
progress() {
  local done="$1" total="$2" what="$3" started="$4" elapsed left
  elapsed=$(( $(date +%s) - started ))
  left=$(( done > 0 ? elapsed * (total - done) / done : 0 ))
  printf '  [%d/%d] %s  %dm%02ds elapsed, ~%dm left
'     "$done" "$total" "$what" "$((elapsed / 60))" "$((elapsed % 60))" "$((left / 60))"
}

failures=0

# VOLUMES FIRST, deliberately. On 24 November 2026 the worktree phase ran first and 747 GiB of volumes sat
# behind 12 GiB of worktrees: volumes clear at roughly 6 GiB a minute and worktrees at 0.1, because a
# worktree is thousands of small files and Windows is slow at exactly that. Biggest win first (#3400).
if [ "$volumes" -gt 0 ]; then
  echo "Removing $volumes volume(s). Space is freed INSIDE the Docker disk image; compact it afterwards."
  started=$(date +%s)
  n=0
  while IFS= read -r volume; do
    [ -n "$volume" ] || continue
    n=$((n + 1))
    if docker volume rm "$volume" >/dev/null 2>&1; then
      progress "$n" "$volumes" "$volume" "$started"
    else
      progress "$n" "$volumes" "$volume - COULD NOT REMOVE (in use?)" "$started"
      failures=$((failures + 1))
    fi
  done < "$tmp/volumes-removable"
fi

if [ "$worktrees" -gt 0 ]; then
  echo "Removing $worktrees worktree(s)."
  started=$(date +%s)
  n=0
  : > "$tmp/worktree-failures"
  while IFS= read -r path; do
    [ -n "$path" ] || continue
    n=$((n + 1))
    if git -C "$main" worktree remove --force "$path" 2>"$tmp/err"; then
      progress "$n" "$worktrees" "$path" "$started"
    else
      # Windows refuses a path over 260 characters, and the ArcGIS runtime nests past it by a single
      # character, so git cannot delete what Windows will not open. Report it rather than scroll past it
      # (#3400); `git config --system core.longpaths true` is the general cure.
      progress "$n" "$worktrees" "$path - COULD NOT REMOVE" "$started"
      printf '%s: %s
' "$path" "$(tr -d '
' < "$tmp/err")" >> "$tmp/worktree-failures"
      failures=$((failures + 1))
    fi
  done < "$tmp/worktrees-clean"
  git -C "$main" worktree prune
fi

# Branches last, each one's own worktree first (prune_steps), since git will not delete a checked-out branch. A branch
# is deleted with -D because a squash-merged branch is never "merged" to git; branch_verdict is what decided it may go.
if [ "$branches" -gt 0 ]; then
  echo "Removing $branches branch(es)."
  while IFS="$(printf '\t')" read -r name worktree; do
    [ -n "$name" ] || continue
    ok=yes
    sha="$(git -C "$main" rev-parse --short "refs/heads/$name" 2>/dev/null || echo unknown)"
    while read -r kind what; do
      [ "$ok" = yes ] || break
      case "$kind" in
        worktree) git -C "$main" worktree remove --force "$what" 2>/dev/null || ok=no ;;
        branch) git -C "$main" branch -D "$what" >/dev/null 2>&1 || ok=no ;;
      esac
    done < <(prune_steps "$name" "${worktree:--}")
    if [ "$ok" = yes ]; then
      # The tip, so a branch removed in error is one `git branch <name> <sha>` away.
      echo "  removed $name ($sha)"
    else
      echo "  COULD NOT REMOVE $name"
      failures=$((failures + 1))
    fi
  done < "$tmp/branches-prune"
fi

if [ "$failures" -gt 0 ]; then
  echo
  echo "$failures could not be removed:"
  [ -s "$tmp/worktree-failures" ] && sed 's/^/  /' "$tmp/worktree-failures"
  echo "  A worktree whose longest path is over 260 characters needs 'git config --system core.longpaths true'."
fi

# The image is reported on EVERY sweep, so its size cannot quietly become 975 GB again.
image="${DOCKER_DISK_IMAGE:-$LOCALAPPDATA/Docker/wsl/disk/docker_data.vhdx}"
# Not on the every-check branch sweep, which touches no volume and would print it on every check.
if [ "$branches_only" != yes ] && [ -f "$image" ]; then
  size="$(awk -v b="$(wc -c < "$image")" 'BEGIN { printf "%.0f", b / 1073741824 }')"
  # The same 2.7 GiB per volume the removable line above reports, so the two numbers agree.
  gain="$(awk -v v="$volumes" 'BEGIN { printf "%.0f", v * 2.7 }')"
  advice="$(image_advice "$size" "${TIDY_IMAGE_MAX_GB:-300}" "$gain")"
  if [ -n "$advice" ]; then
    echo
    printf '%s
' "$advice"
    if [ "$compact" = yes ]; then
      # Never while a check is running: stopping Docker kills it, and a check killed mid-write leaves the
      # stale Vite cache and the Nx task record that hang the NEXT start, in another session's checkout
      # (#2650, #3406).
      running="$(docker ps --format '{{.Names}}' 2>/dev/null | grep -v -E '^(mongo|mssql|database)$' || true)"
      if [ -n "$running" ]; then
        echo "NOT compacting: these containers are running, and stopping Docker would kill them:" >&2
        printf '%s
' "$running" | sed 's/^/  /' >&2
        exit 1
      fi
      echo "Compacting is not done from this script: it needs Administrator. Run the four steps above." >&2
      exit 1
    fi
  fi
fi

echo "Done. Removing a volume frees space inside the Docker disk image; compact it to give the space back to C:."
