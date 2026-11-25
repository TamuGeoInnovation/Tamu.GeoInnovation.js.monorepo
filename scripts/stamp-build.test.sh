#!/usr/bin/env bash
# Tests scripts/stamp-build.sh (#1306, #1148) on a throwaway copy of built files. No Docker, no network; runs in a
# second:
#
#   bash scripts/stamp-build.test.sh
#
# Exits non-zero, naming each failed case.
set -uo pipefail

script="$(dirname "$0")/stamp-build.sh"
dir="$(mktemp -d)"
trap 'rm -rf "$dir"' EXIT

failed=0
expect() { # <description> <expected> <actual>
  if [ "$2" = "$3" ]; then echo "ok   $1"; else echo "FAIL $1: expected [$2], got [$3]"; failed=1; fi
}

# A built app as Angular writes it: the banner's tokens in a hashed chunk, and an unrelated token the release fills
# in per stage, which this script must leave alone.
fresh() {
  rm -rf "$dir/dist"
  mkdir -p "$dir/dist/apps/aggiemap-angular/browser" "$dir/dist/apps/gisday-angular/browser"
  cat >"$dir/dist/apps/aggiemap-angular/browser/chunk-BtQ5jLvY.js" <<'JS'
const m={buildDate:"___BUILD_DATE___",gitCommit:"___GIT_COMMIT___",gitTag:"___GIT_TAG___",containerName:"___CONTAINER_NAME___",nodeName:"___NODE_NAME___",environment:"___ENVIRONMENT_MODE___"};
JS
  cat >"$dir/dist/apps/aggiemap-angular/browser/main-ALWI4YUM.js" <<'JS'
const e={cms_api:"___CMS_API___"};
JS
  printf '<html>___GIT_COMMIT___</html>\n' >"$dir/dist/apps/aggiemap-angular/browser/index.html"
  cp "$dir/dist/apps/aggiemap-angular/browser/chunk-BtQ5jLvY.js" "$dir/dist/apps/gisday-angular/browser/chunk-A.js"
}

fresh
out="$(bash "$script" "$dir/dist/apps" 0123456789abcdef0123456789abcdef01234567 production "2026-11-24T21:00:00Z" 2>&1)"
status=$?
chunk="$(cat "$dir/dist/apps/aggiemap-angular/browser/chunk-BtQ5jLvY.js")"
expect "stamping succeeds" "0" "$status"
case "$chunk" in *'gitCommit:"0123456789abcdef0123456789abcdef01234567"'*) r=yes ;; *) r=no ;; esac
expect "the commit replaces ___GIT_COMMIT___" "yes" "$r"
case "$chunk" in *'buildDate:"2026-11-24T21:00:00Z"'*) r=yes ;; *) r=no ;; esac
expect "the date replaces ___BUILD_DATE___" "yes" "$r"
case "$chunk" in *'environment:"production"'*) r=yes ;; *) r=no ;; esac
expect "the build type replaces ___ENVIRONMENT_MODE___" "yes" "$r"
case "$chunk" in *'containerName:"iis"'*'nodeName:"iis"'*) r=yes ;; *) r=no ;; esac
expect "an IIS build names no container or node, and says so" "yes" "$r"
case "$chunk" in *'gitTag:"untagged"'*) r=yes ;; *) r=no ;; esac
expect "a commit with no tag says untagged" "yes" "$r"
case "$chunk" in *___*) r=left ;; *) r=none ;; esac
expect "no banner token is left in the chunk" "none" "$r"
case "$(cat "$dir/dist/apps/gisday-angular/browser/chunk-A.js")" in *___GIT_COMMIT___*) r=left ;; *) r=stamped ;; esac
expect "every app under the folder is stamped" "stamped" "$r"
expect "a token the release fills in is left alone" 'const e={cms_api:"___CMS_API___"};' "$(cat "$dir/dist/apps/aggiemap-angular/browser/main-ALWI4YUM.js")"
expect "only JavaScript is touched" "<html>___GIT_COMMIT___</html>" "$(cat "$dir/dist/apps/aggiemap-angular/browser/index.html")"
case "$out" in *"2 file"*) r=yes ;; *) r=no ;; esac
expect "it says how many files it stamped" "yes" "$r"

# A tag, when the commit has one.
fresh
GIT_TAG=dev-2026-11-24 bash "$script" "$dir/dist/apps" abc123 development "2026-11-24T21:00:00Z" >/dev/null 2>&1
case "$(cat "$dir/dist/apps/aggiemap-angular/browser/chunk-BtQ5jLvY.js")" in *'gitTag:"dev-2026-11-24"'*) r=yes ;; *) r=no ;; esac
expect "GIT_TAG names the tag when there is one" "yes" "$r"

# A build with no banner in it is an error: it means the token moved or the build changed, and the banner would go
# back to printing placeholders without anyone noticing.
rm -rf "$dir/dist"; mkdir -p "$dir/dist/apps/x"; echo 'const a=1;' >"$dir/dist/apps/x/main.js"
bash "$script" "$dir/dist/apps" abc123 production "2026-11-24T21:00:00Z" >/dev/null 2>&1
expect "a build with no banner token fails" "1" "$?"

# Missing arguments are an error, not a stamp of empty values.
fresh
bash "$script" "$dir/dist/apps" "" production "2026-11-24T21:00:00Z" >/dev/null 2>&1
expect "an empty commit fails" "1" "$?"
case "$(cat "$dir/dist/apps/aggiemap-angular/browser/chunk-BtQ5jLvY.js")" in *___GIT_COMMIT___*) r=untouched ;; *) r=changed ;; esac
expect "and changes nothing" "untouched" "$r"

exit "$failed"
