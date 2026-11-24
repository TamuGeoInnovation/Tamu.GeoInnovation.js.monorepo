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

# Prints the advice for a Docker disk image of <size GiB> against <threshold GiB>, or nothing when it is
# under. REMOVING A VOLUME NEVER SHRINKS THE IMAGE: the file only grows, every check adding about 2.6 GiB
# to it for good, and only a compaction gives the space back to C:. That is why 975 GB sat unnoticed for
# months while the disk filled (#3400). Tested by scripts/tidy.test.sh.
image_advice() {
  local size="$1" threshold="${2:-300}"
  awk -v s="$size" -v t="$threshold" 'BEGIN { exit !(s > t) }' || return 0
  printf 'The Docker disk image is %s GiB, over the %s GiB threshold, and removing volumes does NOT shrink it.
' "$size" "$threshold"
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
  '') ;;
  *) echo "usage: $0 [--yes|--compact]" >&2; exit 2 ;;
esac

tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

main="$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")"

echo "Reading merged pull requests and closed issues from $repo..."
gh pr list --repo "$repo" --state merged --limit 1000 --json headRefName --jq '.[].headRefName' | sort -u > "$tmp/merged"
gh issue list --repo "$repo" --state closed --limit 4000 --json number --jq '.[].number' | sort -u > "$tmp/closed"

git -C "$main" worktree list --porcelain > "$tmp/porcelain"
worktree_candidates "$tmp/merged" "$tmp/porcelain" > "$tmp/worktrees"

# A worktree with uncommitted changes is kept, merged branch or not. On 24 November 2026, 7 of 367
# candidates were dirty: one held a real edit to a release-notes file and five held only check logs.
: > "$tmp/worktrees-clean"
while IFS= read -r path; do
  [ -d "$path" ] || continue
  if [ -n "$(git -C "$path" --no-optional-locks status --porcelain 2>/dev/null)" ]; then
    echo "  keeping $path (uncommitted changes)"
  else
    echo "$path" >> "$tmp/worktrees-clean"
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
  advice="$(image_advice "$size" "${TIDY_IMAGE_MAX_GB:-300}")"
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
