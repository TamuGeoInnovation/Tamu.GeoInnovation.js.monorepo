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

# Sourced (by the test): stop here, with only the functions defined.
[ "${BASH_SOURCE[0]}" = "$0" ] || return 0

set -e
act=no
case "${1:-}" in
  --yes) act=yes ;;
  '') ;;
  *) echo "usage: $0 [--yes]" >&2; exit 2 ;;
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
echo "Removable: $worktrees worktree(s) (about $((worktrees * 589 / 1024)) GiB), $volumes volume(s) (about $((volumes * 27 / 10)) GiB inside the Docker disk image)."

if [ "$act" != yes ]; then
  echo "Nothing removed. Run '$0 --yes' to remove them."
  exit 0
fi

while IFS= read -r path; do
  [ -n "$path" ] || continue
  git -C "$main" worktree remove --force "$path" && echo "  removed worktree $path"
done < "$tmp/worktrees-clean"
git -C "$main" worktree prune

while IFS= read -r volume; do
  [ -n "$volume" ] || continue
  docker volume rm "$volume" >/dev/null && echo "  removed volume $volume"
done < "$tmp/volumes-removable"

echo "Done. Removing a volume frees space inside the Docker disk image; compact it to give the space back to C:."
