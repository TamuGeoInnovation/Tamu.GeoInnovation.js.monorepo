#!/usr/bin/env bash
# Tests tools/queued.sh against a throwaway repository with a work-mailbox branch of its own, so every case is exact.
# Usage: bash tools/queued.test.sh      (writes only inside its own temporary directory)
#
# Written 23 November 2026, after queued.sh dropped laptop's security batch 7 because a gisday batch 7 shared its number and
# "finished batch 7" closed both. Case 5 is that bug. Case 9 is the grep -i with -F abort that hid the first fix.
set -u
here=$(cd "$(dirname "$0")" && pwd)
tmp=$(mktemp -d); trap 'rm -rf "$tmp"' EXIT
pass=0; fail=0
ok()   { pass=$((pass+1)); printf 'ok    %s\n' "$1"; }
no()   { fail=$((fail+1)); printf 'FAIL  %s\n       wanted: %s\n       got:    %s\n' "$1" "$2" "$3"; }
check() { # <label> <expected lines, newline separated> <actual>
  if [ "$2" = "$3" ]; then ok "$1"; else no "$1" "$(printf '%s' "$2" | tr '\n' '/')" "$(printf '%s' "$3" | tr '\n' '/')"; fi
}

today=$(date -u +'%-d %B %Y' 2>/dev/null || date -u +'%d %B %Y')
old=$(date -u -d '-30 days' +'%-d %B %Y' 2>/dev/null || date -u -d '-30 days' +'%d %B %Y')

# A repository whose origin is itself, with one listener folder and the commit subjects as the history.
repo=$tmp/repo; mkdir -p "$repo/m"; cd "$repo"
git init -q -b work-mailbox .; git config user.email t@t; git config user.name t
write_tasks() { printf '%s' "$1" > m/TASKS.md; git add -A >/dev/null; git commit -qm 'tasks'; }
say() { git commit -q --allow-empty -m "$1"; }
sync() { git remote remove origin 2>/dev/null; git remote add origin "$repo"; git fetch -q origin work-mailbox; }
run() { bash "$here/queued.sh" m; }

tasks="# m
## Batch g12 (gisday: a prefixed id nobody has reported; $today, from \`work (gisday)\`)
## Batch a11 (aggiemap: a prefixed id already done; $today, from \`work (aggiemap)\`)
## Batch 9 (aggiemap: a bare id that was started; $today, from \`work (aggiemap)\`)
## Batch 8 (aggiemap: WITHDRAWN, moved to home batch 4; $today, from \`work (aggiemap)\`)
## Batch 7 (security: the batch that was dropped; $today, from \`work (security)\`)
## Batch 7 (gisday: the batch that shared its number; $today, from \`work (gisday)\`)
## Batch 2 (aggiemap: older than the window; $old, from \`work (aggiemap)\`)
"
write_tasks "$tasks"; sync

check "nothing reported: every live batch is queued, withdrawn and old ones are not" \
  "g12 queued
a11 queued
9 queued
7 queued (security; another batch shares this id)
7 queued (gisday; another batch shares this id)" "$(run)"

say 'm: started batch 9'; sync
check "a start report makes a bare id unfinished" "9 unfinished" "$(run | sed -n '3p')"

say 'm: batch a11 done - branch pushed'; sync
check "a prefixed id reported done drops off" "" "$(run | grep '^a11 ' || true)"

say 'm: finished batch 7'; sync
check "an unattributed report of a shared id drops neither, and says so" \
  "7 unfinished (security; another batch shares this id), and no report says which
7 unfinished (gisday; another batch shares this id), and no report says which" "$(run | grep '^7 ')"

say 'm: security batch 7 done - PR checked'; sync
check "THE BUG: a report naming one director closes only that director's batch" \
  "7 unfinished (gisday; another batch shares this id), and no report says which" "$(run | grep '^7 ')"

say 'm: gisday batch 7 done'; sync
check "and the other closes when its own director is named" "" "$(run | grep '^7 ' || true)"

check "a withdrawn heading is never listed" "" "$(run | grep '^8 ' || true)"
check "a heading older than the window is never listed" "" "$(run | grep '^2 ' || true)"

# grep -i with -F aborts (exit 134) on GNU grep 3.0 in Git Bash, and in a -q test that reads as "no match".
# Comments are stripped first, because the warning against it is itself a line saying "grep -iF".
hits=$(for f in queued.sh board.sh roster.sh listen.sh heartbeat.sh; do
  [ -f "$here/$f" ] || continue
  sed 's/#.*//' "$here/$f" | grep -nE "grep[^|;]*-[A-Za-z]*(iF|Fi)" | sed "s|^|$f:|"
done)
if [ -n "$hits" ]; then no "no grep -i with -F in the tools" "none" "$(printf '%s' "$hits" | tr '\n' '/')"
else ok "no grep -i with -F in the tools"; fi
if printf 'x\n' | grep -qiF x 2>/dev/null; then ok "this machine's grep survives -i with -F (the abort is gone)"
else printf 'note  this machine aborts or fails on grep -qiF, as Git Bash GNU grep 3.0 does\n'; fi

printf '\n%d passed, %d failed\n' "$pass" "$fail"
[ "$fail" -eq 0 ]
