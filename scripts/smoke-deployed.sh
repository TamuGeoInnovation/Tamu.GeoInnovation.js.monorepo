#!/usr/bin/env bash
# Says which of the smoke suite's tracked changes the build an environment serves does not carry yet (#3539):
#
#   scripts/smoke-deployed.sh <development|production> [registry]
#
# A smoke check merged with the change it checks fails against every deployed environment until a build carrying that
# change is deployed, and it fails as though the application were broken. The deployed page cannot say which commit it
# is (its build banner is unstamped on IIS, #1306), but the repository can: each build that reaches an environment is
# tagged, dev-* or prod-* (scripts/tag-build.sh, #1145). So the newest such tag is the build's commit, and a change is
# deployed when its commit is an ancestor of that tag.
#
# The registry (test/smoke/aggiemap/deployed-changes.json) names each change a check waits for and the commit it merged
# as. This prints two lines for the shell to export, which run-local.sh and aggiemap-smoke.yml pass to the suite:
#
#   AGGIEMAP_SMOKE_DEPLOYED_TAG=<the newest tag>
#   AGGIEMAP_SMOKE_UNDEPLOYED_COMMITS=<the registry's commits that tag lacks, comma-separated>
#
# AGGIEMAP_SMOKE_DEPLOYED_TAG, set beforehand, names the tag to compare with instead. When there is no tag to compare
# with, or a commit is not in this clone, it prints nothing for it: the suite then runs every check as before, because
# a check that cannot tell must not skip. Tested by scripts/smoke-deployed.test.sh.
set -uo pipefail

environment="${1:-}"
# C:/... in Git Bash (pwd -W), so Windows git can open it even under MSYS_NO_PATHCONV, which run-local.sh sets for Docker.
here="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && (pwd -W 2>/dev/null || pwd))"
registry="${2:-$here/test/smoke/aggiemap/deployed-changes.json}"
# The repository whose tags are read: this one, unless a test names another.
repo="${SMOKE_DEPLOYED_REPO:-$here}"

case "$environment" in
  development) pattern='refs/tags/dev-*' ;;
  production) pattern='refs/tags/prod-*' ;;
  *)
    echo "Usage: scripts/smoke-deployed.sh <development|production> [registry]" >&2
    exit 2
    ;;
esac

tag="${AGGIEMAP_SMOKE_DEPLOYED_TAG:-$(git -C "$repo" for-each-ref --count=1 --sort=-creatordate --format='%(refname:short)' "$pattern")}"

if [ -z "$tag" ] || ! git -C "$repo" rev-parse -q --verify "$tag^{commit}" >/dev/null; then
  echo "No $pattern tag to compare with, so every check runs as it would without this (#3539)." >&2
  exit 0
fi

undeployed=()
for commit in $(grep -oE '"commit": *"[0-9a-f]{7,40}"' "$registry" | grep -oE '[0-9a-f]{7,40}'); do
  if ! git -C "$repo" rev-parse -q --verify "$commit^{commit}" >/dev/null; then
    echo "$commit is not in this clone, so its checks run as they would without this (#3539)." >&2
    continue
  fi
  git -C "$repo" merge-base --is-ancestor "$commit" "$tag" || undeployed+=("$commit")
done

echo "AGGIEMAP_SMOKE_DEPLOYED_TAG=$tag"
echo "AGGIEMAP_SMOKE_UNDEPLOYED_COMMITS=$(IFS=,; echo "${undeployed[*]-}")"
