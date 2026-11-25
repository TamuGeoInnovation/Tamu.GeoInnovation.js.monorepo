#!/usr/bin/env bash
# Removes what a finished branch leaves behind: its git worktree and its tamu-js-<issue> Docker volume.
#
#   bash scripts/tidy.sh              # report what would go, remove nothing
#   bash scripts/tidy.sh --yes        # remove it
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

# True when every uncommitted change in <git status --porcelain output> is an untracked `.pr-body.md`, and
# there is at least one. That file drafts a pull request body and is deliberately never committed to
# `development`, so a copy left in a worktree makes it look like someone is working there for ever: on
# 24 November 2026, 68 of the 69 worktrees this script had kept held nothing else, every one of them a merged
# branch, about 40 GiB no sweep could reclaim (#3432).
#
# Deliberately narrow: that exact path, untracked, and nothing else on the line. A worktree holding anything
# else is still kept, screenshots above all - a capture stops being obtainable the moment the code changes, so
# an untracked `docs/screenshots/` folder is possibly irreplaceable work and is exactly what keeping dirty
# worktrees is for. Tested by scripts/tidy.test.sh.
only_a_drafted_pr_body() {
  local status="$1"

  [ -n "$status" ] || return 1

  printf '%s
' "$status" | awk '
    $0 == "" { next }
    $0 != "?? .pr-body.md" { other = 1 }
    { seen = 1 }
    END { exit (seen && !other) ? 0 : 1 }
  '
}

# Prints the volume names in <volume list file> that are tamu-js-<number> for a CLOSED issue, one per line.
# The name must be entirely digits after the prefix, so tamu-js-dev-nm, tamu-js-chk-development and the
# other named volumes are never matched however the issue list reads. Tested by scripts/tidy.test.sh.
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
case "${1:-}" in
  --yes) act=yes ;;
  --compact) act=yes; compact=yes ;;
  --if-due) ;;
  '') ;;
  *) echo "usage: $0 [--yes|--compact|--if-due]" >&2; exit 2 ;;
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

echo "Reading merged pull requests and closed issues from $repo..."
gh pr list --repo "$repo" --state merged --limit 1000 --json headRefName --jq '.[].headRefName' | sort -u > "$tmp/merged"
gh issue list --repo "$repo" --state closed --limit 4000 --json number --jq '.[].number' | sort -u > "$tmp/closed"

git -C "$main" worktree list --porcelain > "$tmp/porcelain"
worktree_candidates "$tmp/merged" "$tmp/porcelain" > "$tmp/worktrees"

# Detached worktrees: removable when their commit is already in origin/development (#3438). A stale
# origin/development only makes fewer of them removable, never more.
detached_worktrees "$tmp/porcelain" > "$tmp/detached"
if git -C "$main" rev-parse -q --verify origin/development >/dev/null; then
  detached_merged "$tmp/detached" origin/development >> "$tmp/worktrees"
fi
echo "  $(grep -c . "$tmp/detached" || true) detached worktree(s); those whose commit is in origin/development are considered."

# Folders git does not list: named with their size, never removed (#3438).
unregistered_folders "$tmp/porcelain" "$(dirname "$main")" > "$tmp/unregistered"
if [ -s "$tmp/unregistered" ]; then
  echo "  Not worktrees of this repository as far as git knows, so not removed (another repository's, or a pruned registration); check each by hand:"
  while IFS= read -r dir; do
    echo "    $dir ($(du -sh "$dir" 2>/dev/null | cut -f1))"
  done < "$tmp/unregistered"
fi

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
  elif only_a_drafted_pr_body "$status"; then
    echo "  $path holds only a drafted .pr-body.md, which is not work (#3432)"
    echo "$path" >> "$tmp/worktrees-clean"
  else
    echo "  keeping $path (uncommitted changes)"
  fi
done < "$tmp/worktrees"

if docker volume ls -q > "$tmp/volumes" 2>/dev/null; then
  volume_candidates "$tmp/closed" "$tmp/volumes" > "$tmp/volumes-removable"
else
  echo "  Docker is not answering, so no volume is considered." >&2
  : > "$tmp/volumes-removable"
fi

worktrees="$(grep -c . "$tmp/worktrees-clean" || true)"
volumes="$(grep -c . "$tmp/volumes-removable" || true)"
echo "Removable: $volumes volume(s) (about $((volumes * 27 / 10)) GiB inside the Docker disk image), $worktrees worktree(s) (about $((worktrees * 589 / 1024)) GiB on this disk)."

if [ "$act" != yes ]; then
  echo "Nothing removed. Run '$0 --yes' to remove them."
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

if [ "$failures" -gt 0 ]; then
  echo
  echo "$failures could not be removed:"
  [ -s "$tmp/worktree-failures" ] && sed 's/^/  /' "$tmp/worktree-failures"
  echo "  A worktree whose longest path is over 260 characters needs 'git config --system core.longpaths true'."
fi

# The image is reported on EVERY sweep, so its size cannot quietly become 975 GB again.
image="${DOCKER_DISK_IMAGE:-$LOCALAPPDATA/Docker/wsl/disk/docker_data.vhdx}"
if [ -f "$image" ]; then
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
