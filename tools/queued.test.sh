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

# #3517: a heading with no date in it. The AggieMap director writes them that way ("## Batch a20 (aggiemap: #2719, ...)"),
# and every one was dropped, so the lab sat beside a20, a21 and a23 with this script printing nothing. Such a batch takes the
# date of the commit that wrote its heading: today's is live, and an old one still falls outside the window.
write_tasks "$tasks## Batch a20 (aggiemap: #2719, a heading with no date) (Medium) - **after a18**
"; sync
check "#3517: an undated heading written today is queued" "a20 queued" "$(run | grep '^a20 ' || true)"
git commit -q --allow-empty -m 'm: started batch a20'; sync
check "#3517: and is judged by its reports like any other" "a20 unfinished" "$(run | grep '^a20 ' || true)"
GIT_COMMITTER_DATE="$(date -u -d '-30 days' +%Y-%m-%dT%H:%M:%SZ)" GIT_AUTHOR_DATE="$(date -u -d '-30 days' +%Y-%m-%dT%H:%M:%SZ)" \
  write_tasks "$(cat m/TASKS.md)
## Batch a5 (aggiemap: an undated heading written a month ago) (Low)
"; sync
check "#3517: an undated heading written before the window is not listed" "" "$(run | grep '^a5 ' || true)"

# #3650: the per-heading work was moved into one pass, so the rules it carried are held here. A note anywhere in the file
# drops the batches it names, not only one inside their own sections; an id that merely starts the same does not count; an
# undated heading edited later keeps the date it was written; and a date that does not exist drops its heading, as
# `date -d` did.
moved_tasks="# m
- Batches 30 and 31 were moved to the lab this morning.
- Batch 123 was withdrawn too.
## Batch 30 (aggiemap: moved by the note above; $today, from work (aggiemap))
## Batch 31 (aggiemap: moved by the same note; $today, from work (aggiemap))
## Batch 12 (aggiemap: shares its first digits with the 123 in the note; $today, from work (aggiemap))
## Batch 13 (aggiemap: a date that does not exist; 31 November $(date -u +%Y), from work (aggiemap))
## Batch a40 (aggiemap: an undated heading, edited after it was written) (Low)
- First version of the body.
"
write_tasks "$moved_tasks"; sync
write_tasks "${moved_tasks/First version/Second version}"; sync
check "#3650: a note elsewhere in the file drops every batch it names, and only those" \
  "12 queued
a40 queued" "$(run | grep -E '^(30|31|12|13|a40) ' || true)"

# Holds (25 November 2026). A batch that says it is waiting on a pull request is not work its listener may take, and the
# gate opens by itself when the pull request merges. gh is stubbed here, so these cases are offline and exact: PRSTATE says
# what GitHub would answer, and an empty PRSTATE stands for gh failing.
mkdir -p "$tmp/bin"
cat > "$tmp/bin/gh" <<'GH'
#!/usr/bin/env bash
# Stands in for: gh pr view <n> -R <repo> --json state --jq .state
[ -n "${PRSTATE:-}" ] || exit 1
echo "$PRSTATE"
GH
chmod +x "$tmp/bin/gh"
PATH="$tmp/bin:$PATH"; export PATH

held_tasks="# m
## Batch a33 (aggiemap: the gated batch; $today, from work (aggiemap))
- **Held until** PR 3587 merges, because this batch edits what that pull request is changing.
- Do not touch PR 3591's branch either.

## Batch a34 (aggiemap: its neighbour, which is not gated; $today, from work (aggiemap))
- Ordinary work. Mentions PR 3587 in passing and is not held by it.
"
write_tasks "$held_tasks"; sync

PRSTATE=OPEN check "a hold on an open pull request is held, not queued"   "a33 held - PR 3587 has not merged" "$(PRSTATE=OPEN run | grep '^a33 ')"
check "the hold belongs to its own batch: its neighbour is still queued"   "a34 queued" "$(PRSTATE=OPEN run | grep '^a34 ')"
check "a mention of a pull request is not a hold"   "a34 queued" "$(PRSTATE=OPEN run | grep '^a34 ')"
check "THE POINT: when the pull request merges the gate opens by itself"   "a33 queued" "$(PRSTATE=MERGED run | grep '^a33 ')"
check "a pull request closed without merging stays held, and says so"   "a33 held - PR 3587 was closed without merging" "$(PRSTATE=CLOSED run | grep '^a33 ')"
check "gh failing keeps it held rather than releasing it early"   "a33 held - PR 3587: could not ask GitHub" "$(run | grep '^a33 ')"

# What tools/listen.sh does with that list: it drops the held lines and exits only for the rest, so a gated batch alone
# means no work. Tested through the same contract listen.sh relies on - the state is the second word on the line.
check "a held batch alone offers a listener nothing" ""   "$(PRSTATE=OPEN run | awk '$2 != "held"' | grep '^a33 ' || true)"
check "and the batch beside it is still offered" "a34 queued"   "$(PRSTATE=OPEN run | awk '$2 != "held"' | grep '^a34 ')"
if [ -f "$here/listen.sh" ] && grep -q '\$2 != "held"' "$here/listen.sh"; then
  ok "tools/listen.sh filters on that same second word"
else no "tools/listen.sh filters on that same second word" 'awk $2 != "held"' "not found in listen.sh"; fi

# A started batch is reported as started even if it carries a hold: the listener is past the gate, and saying "held" would
# hide work in progress.
say 'm: started batch a33'; sync
PRSTATE=OPEN check "a hold never overrides a report that the batch has started"   "a33 unfinished" "$(PRSTATE=OPEN run | grep '^a33 ')"

write_tasks "$tasks"; sync

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
