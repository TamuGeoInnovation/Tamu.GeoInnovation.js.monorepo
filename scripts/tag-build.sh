#!/usr/bin/env bash
# Tags the commit a build was made from, so the repository records what was tested and what shipped.
#
#   scripts/tag-build.sh dev              # tag HEAD of development as tested on dev today
#   scripts/tag-build.sh prod             # tag the same commit as shipped to production today
#   scripts/tag-build.sh dev <sha>        # tag a specific commit
#   scripts/tag-build.sh prod <sha> --date 2026-09-30
#
# Why this exists: a build is identified by an Azure DevOps build number, which nobody outside the
# pipeline can resolve. These questions are otherwise unanswerable from the repository alone:
#
#   - which commit is production running?
#   - which build did the team test on dev on a given day?
#   - was the build promoted to production the one that passed on dev?
#
# One build serves both environments - `azure-pipelines.yml` runs the build template twice in a
# single run, publishing `js-monorepo-development` and `js-monorepo-production` from the same commit.
# So the unit being tagged is the build, and the same commit is expected to carry both tags.
#
# `prod` refuses a commit that was never tagged for dev. That is the check worth having: it is the
# difference between "we shipped what we tested" being true and being assumed.
#
# Overriding it is allowed and sometimes right - on 22 October 2026 the commit that shipped carried
# three GIS Day changes on top of the tested one, and promoting it was correct. But `--force` used to
# leave a tag indistinguishable from one that passed its check, so the question this script exists to
# answer read as "yes" for a release where the answer was "no" (#2098). So `--force` takes a reason
# and writes it into the tag: a forced promotion says so, and says why, from the tag alone.
set -euo pipefail

usage() {
  echo "usage: $0 dev|prod [<sha>] [--date YYYY-MM-DD] [--force <reason>]" >&2
  exit 2
}

env_name="${1:-}"
case "$env_name" in
  dev | prod) shift ;;
  *) usage ;;
esac

sha=""
date_override=""
force=false
force_reason=""

while [ $# -gt 0 ]; do
  case "$1" in
    --date) date_override="${2:-}"; shift 2 ;;
    # The reason is --force's argument rather than a flag of its own, so it cannot be left off. Taken
    # only when there is an argument and it is not another flag: `--force` last, or `--force --date`,
    # must reach the refusal below rather than swallowing the next option or dying on `shift 2`.
    --force)
      force=true
      if [ $# -ge 2 ] && [ "${2#-}" = "$2" ]; then
        force_reason="$2"
        shift 2
      else
        shift
      fi
      ;;
    -*) usage ;;
    *) sha="$1"; shift ;;
  esac
done

# A reason given later is a reason invented later: the only person who knows why a promotion was
# forced is the one forcing it, at the moment they do.
if [ "$force" = true ] && [ -z "${force_reason// /}" ]; then
  echo "error: --force needs a reason, which is written into the tag." >&2
  echo "       e.g. $0 prod <sha> --force 'only GIS Day commits differ from the build that passed'" >&2
  exit 2
fi

cd "$(git rev-parse --show-toplevel)"

# Default to whatever development points at on the main repository, not to the local checkout, which
# may be behind or on another branch.
git fetch origin development --quiet --tags

day="${date_override:-$(date +%Y-%m-%d)}"

# `prod` defaults to the commit its `dev-` tag points at, not to development's head.
#
# By the time production is tagged, the release notes have merged (step 4 of the sequence), so
# development's head is the notes commit rather than the build that shipped. Defaulting to the head
# would tag a commit that was never built, tested or deployed. The refusal below catches that, but
# only by failing - and the answer it wants is always the same commit, so take it directly.
#
# The latest tag for the day wins, because a second build is suffixed (`dev-2026-09-30-2`).
if [ -z "$sha" ] && [ "$env_name" = prod ]; then
  dev_tag=$(git tag -l "dev-${day}" "dev-${day}-*" | sort -V | tail -1)

  if [ -n "$dev_tag" ]; then
    sha=$(git rev-list -n1 "$dev_tag")
    echo "defaulting to $dev_tag -> $(git rev-parse --short "$sha")" >&2
  fi
fi

sha="${sha:-$(git rev-parse origin/development)}"

if ! git cat-file -e "${sha}^{commit}" 2>/dev/null; then
  echo "error: $sha is not a commit in this repository" >&2
  exit 1
fi

sha=$(git rev-parse "$sha")
short=$(git rev-parse --short "$sha")
subject=$(git log -1 --format='%s' "$sha")

# A commit that is not on development was never built by the pipeline, which only builds deployable
# branches. Tagging one would record something that never happened.
if ! git merge-base --is-ancestor "$sha" origin/development; then
  echo "error: $short is not on origin/development, so no pipeline build exists for it" >&2
  exit 1
fi

tag="${env_name}-${day}"

# More than one build a day is normal on dev. Suffix rather than refuse, so the second build of a day
# is recorded rather than lost.
if git rev-parse -q --verify "refs/tags/$tag" >/dev/null; then
  existing=$(git rev-list -n1 "$tag")

  if [ "$existing" = "$sha" ]; then
    echo "$tag already points at $short. Nothing to do."
    exit 0
  fi

  n=2
  while git rev-parse -q --verify "refs/tags/${env_name}-${day}-${n}" >/dev/null; do
    n=$((n + 1))
  done
  tag="${env_name}-${day}-${n}"
fi

# The check this script exists for. Promoting a build that was never tested on dev is the failure
# worth catching, and it is invisible without this.
if [ "$env_name" = "prod" ] && [ "$force" != true ]; then
  if ! git tag --points-at "$sha" | grep -q '^dev-'; then
    echo "error: $short carries no dev-* tag, so nothing records it having been tested on dev." >&2
    echo "       Tag the dev build first, or pass --force '<reason>' if this is deliberate." >&2
    exit 1
  fi
fi

# A forced tag says so in its first line, so it is legible as forced in `git tag -n` and in any log
# that shows only the subject - not only to someone who reads the whole message.
message=$(printf '%s build, %s%s\n\n%s\n%s' \
  "$([ "$env_name" = prod ] && echo Production || echo Development)" "$day" \
  "$([ "$force" = true ] && echo ' (FORCED)' || true)" "$short" "$subject")

if [ "$force" = true ]; then
  message=$(printf '%s\n\nForced past the dev-tag check. Reason given: %s' "$message" "$force_reason")
fi

git tag -a "$tag" "$sha" -m "$message"

echo "created $tag -> $short  $subject"
echo
echo "push it with:"
echo "  git push origin $tag"
