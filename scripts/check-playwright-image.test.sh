#!/usr/bin/env bash
# Tests scripts/check-playwright-image.mjs on fixture trees, so each case is exact (#3301).
# Usage: bash scripts/check-playwright-image.test.sh      (needs node; writes only in its own temp dir)
#
# The last case runs it on this checkout, which is the one that would have caught the real break: six READMEs
# naming an image Playwright had moved past, found by hand hours later.
#
# Every version here is COMPOSED, never written out, so this file does not trip the check it tests - and so it
# shows the pattern the check wants anyone writing a command to use: derive the version, do not restate it.
set -u
here=$(cd "$(dirname "$0")" && pwd)
repo=$(cd "$here/.." && pwd)
check=$here/check-playwright-image.mjs
if ! command -v node >/dev/null 2>&1; then
  echo "node is not on PATH. These machines run Node in Docker, so run this as:"
  echo '  MSYS_NO_PATHCONV=1 docker run --rm -v "$PWD:/w" -w /w node:24.22.1 bash scripts/check-playwright-image.test.sh'
  exit 2
fi

tmp=$(mktemp -d); trap 'rm -rf "$tmp"' EXIT
pass=0; fail=0
ok() { pass=$((pass+1)); printf 'ok    %s\n' "$1"; }
no() { fail=$((fail+1)); printf 'FAIL  %s\n       %s\n' "$1" "$2"; }

img() { printf 'mcr.microsoft.com/playwright:v%s-%s' "$1" "${2:-noble}"; }
NOW=1.65.1; OLD=1.64.1; OLDER=1.63.0; ANCIENT=1.0.0

build() { # build <case> <@playwright/test version, or - for a lock without it> [playwright version]
  d=$tmp/$1; mkdir -p "$d"
  if [ "$2" = "-" ]; then printf '{"packages":{}}\n' > "$d/package-lock.json"
  elif [ -n "${3:-}" ]; then
    printf '{"packages":{"node_modules/@playwright/test":{"version":"%s"},"node_modules/playwright":{"version":"%s"}}}\n' \
      "$2" "$3" > "$d/package-lock.json"
  else printf '{"packages":{"node_modules/@playwright/test":{"version":"%s"}}}\n' "$2" > "$d/package-lock.json"; fi
  echo "$d"
}
run() { ( cd "$1" && node "$check" 2>&1 ); }

d=$(build matching "$NOW")
printf 'Run it:\n\n    docker run %s node x.js\n' "$(img "$NOW")" > "$d/README.md"
out=$(run "$d"); rc=$?
[ $rc -eq 0 ] && ok "a README naming the locked version passes" || no "a README naming the locked version passes" "exit $rc: $out"

d=$(build stale "$NOW")
printf 'Run it:\n\n    docker run %s node x.js\n' "$(img "$OLD")" > "$d/README.md"
out=$(run "$d"); rc=$?
if [ $rc -ne 0 ] && printf '%s' "$out" | grep -q 'README.md,line=3' &&
   printf '%s' "$out" | grep -q "v$OLD" && printf '%s' "$out" | grep -q "v$NOW"; then
  ok "a stale version fails, naming the file, the line, what it found and what the lock says"
else
  no "a stale version fails, naming the file, the line, what it found and what the lock says" "exit $rc: $out"
fi

d=$(build derived "$NOW")
printf 'image="mcr.microsoft.com/playwright:v${pw_version}-noble"\n' > "$d/run-local.sh"
out=$(run "$d"); rc=$?
[ $rc -eq 0 ] && ok "a command that derives the version from the lock is left alone" ||
  no "a command that derives the version from the lock is left alone" "exit $rc: $out"

d=$(build skipped "$NOW"); mkdir -p "$d/node_modules/somepkg" "$d/dist"
printf '%s\n' "$(img "$ANCIENT")" > "$d/node_modules/somepkg/README.md"
printf '%s\n' "$(img "$ANCIENT")" > "$d/dist/notes.md"
out=$(run "$d"); rc=$?
[ $rc -eq 0 ] && ok "node_modules and dist are not read" || no "node_modules and dist are not read" "exit $rc: $out"

d=$(build variant "$NOW")
printf '%s\n' "$(img "$NOW" jammy)" > "$d/README.md"
out=$(run "$d"); rc=$?
[ $rc -eq 0 ] && ok "another image variant passes on the same version" ||
  no "another image variant passes on the same version" "exit $rc: $out"

d=$(build nolock -)
printf '%s\n' "$(img "$NOW")" > "$d/README.md"
out=$(run "$d"); rc=$?
if [ $rc -ne 0 ] && printf '%s' "$out" | grep -qi 'does not record a version'; then
  ok "a lock without @playwright/test says so rather than passing"
else
  no "a lock without @playwright/test says so rather than passing" "exit $rc: $out"
fi

d=$(build twice "$NOW")
printf 'a %s\nb\nc %s\n' "$(img "$OLD")" "$(img "$OLDER")" > "$d/README.md"
out=$(run "$d"); rc=$?
if [ $rc -ne 0 ] && [ "$(printf '%s\n' "$out" | grep -c '^::error')" = 2 ]; then
  ok "every stale reference is reported, not only the first"
else
  no "every stale reference is reported, not only the first" "exit $rc: $out"
fi

d=$(build siblings_agree "$NOW" "$NOW")
printf '%s\n' "$(img "$NOW")" > "$d/README.md"
out=$(run "$d"); rc=$?
[ $rc -eq 0 ] && ok "playwright declared directly at the same version passes" ||
  no "playwright declared directly at the same version passes" "exit $rc: $out"

# #2122 made playwright a direct dependency, so a bump of one and not the other is now possible.
d=$(build siblings_drift "$NOW" "$OLD")
printf '%s\n' "$(img "$NOW")" > "$d/README.md"
out=$(run "$d"); rc=$?
if [ $rc -ne 0 ] && printf '%s' "$out" | grep -q 'package-lock.json' &&
   printf '%s' "$out" | grep -q "v$NOW" && printf '%s' "$out" | grep -q "v$OLD"; then
  ok "playwright and @playwright/test at different versions fails, naming both"
else
  no "playwright and @playwright/test at different versions fails, naming both" "exit $rc: $out"
fi

out=$( cd "$repo" && node "$check" 2>&1 ); rc=$?
[ $rc -eq 0 ] && ok "this checkout passes" || no "this checkout passes" "exit $rc: $out"

printf '\n%d passed, %d failed\n' "$pass" "$fail"
[ "$fail" -eq 0 ]
