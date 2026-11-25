#!/usr/bin/env bash
# Stamps the build banner's tokens into built JavaScript: stamp-build.sh <dist/apps> <commit> <build type> <date>
#
# `libs/common/ngx/environment/.../build-traceability.constants.ts` ships ___BUILD_DATE___, ___GIT_COMMIT___ and the
# rest, and `tokenSubstitute.sh` replaces them in the Dockerfile. Dev and production serve AggieMap from IIS, from the
# Azure build's artifact, not from the image, so that never ran there and the banner printed its placeholders (#1306).
# A deployed build could not say which commit it came from, so a passing smoke run could not tag what it tested
# (#1148). The Azure build now runs this on the artifact before publishing it.
#
# GIT_TAG names the commit's tag when it has one (otherwise "untagged"). An IIS build has no container or node, and
# says "iis" for both. Only the banner's six tokens are replaced; any other ___TOKEN___ (the release's per-stage
# values) is left for whatever fills it. Fails, changing nothing, on a missing argument, and when no file carries the
# banner: that means the tokens moved, and the banner would quietly go back to printing them.
# Tested by scripts/stamp-build.test.sh.
set -euo pipefail

dir="${1:-}" commit="${2:-}" mode="${3:-}" date="${4:-}"
tag="${GIT_TAG:-untagged}"

if [ -z "$dir" ] || [ -z "$commit" ] || [ -z "$mode" ] || [ -z "$date" ]; then
  echo "Usage: stamp-build.sh <dist/apps> <commit> <build type> <date>; every argument is required." >&2
  exit 1
fi
if [ ! -d "$dir" ]; then
  echo "stamp-build.sh: $dir is not a folder." >&2
  exit 1
fi

# Values go into a JavaScript string between double quotes and into a sed replacement, so they are kept to the
# characters a commit, a tag, a build type and an ISO date use.
for value in "$commit" "$tag" "$mode" "$date"; do
  case "$value" in
    *[!A-Za-z0-9._:+-]*)
      echo "stamp-build.sh: '$value' has a character a build stamp does not use." >&2
      exit 1
      ;;
  esac
done

files=()
while IFS= read -r -d '' file; do
  files+=("$file")
done < <(grep -rlZ --include='*.js' -e '___GIT_COMMIT___' "$dir" || true)

if [ "${#files[@]}" -eq 0 ]; then
  echo "stamp-build.sh: no JavaScript under $dir carries ___GIT_COMMIT___, so there is no build banner to stamp." >&2
  exit 1
fi

sed -i \
  -e "s/___BUILD_DATE___/$date/g" \
  -e "s/___GIT_COMMIT___/$commit/g" \
  -e "s/___GIT_TAG___/$tag/g" \
  -e "s/___CONTAINER_NAME___/iis/g" \
  -e "s/___NODE_NAME___/iis/g" \
  -e "s/___ENVIRONMENT_MODE___/$mode/g" \
  "${files[@]}"

echo "Stamped ${#files[@]} file(s) under $dir: commit $commit, tag $tag, $mode, built $date."
