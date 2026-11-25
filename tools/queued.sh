#!/usr/bin/env bash
# What is waiting for a listener: the batches in <name>/TASKS.md, written in the last N days, that the listener has not
# reported done, and that nothing marks withdrawn or moved. Read only.
#
#   tools/queued.sh <name> [days]     prints "<id> queued" or "<id> unfinished" per line, newest first; nothing when none
#
# Why (8 November 2026): a batch written while a listener is busy is a commit its watcher has already passed, so a watcher that
# waits only for the next commit can sit idle beside queued work; and a director moving work between machines needs to see what
# is really waiting, not guess from the log (on 30 October two finished batches were redone elsewhere). tools/listen.sh,
# tools/roster.sh and every director use this one list.
#
# A batch counts when its heading is "## Batch <id> (...)" with a date ("<d> <Month> <yyyy>") at most N days old (default 7).
# An id is its director's letter and that director's own number for this listener - a9, g7, s7 (DIRECTOR.md, "Batch ids carry
# their director's letter", 23 November 2026). A bare number is an id too: every batch written before that date has one.
# Older headings are history nobody closed out, which tools/board.sh calls "ended".
#   queued      no "<name>: ... batch <id> ..." commit at all
#   unfinished  a commit names it, but none says it is done
#   held        nothing has started it and it says it is waiting on a pull request that has not merged
#
# A HELD BATCH IS NOT WORK ITS LISTENER CAN TAKE, and saying so is the whole point of the third state. A batch whose own
# section opens a line with "Held until PR 3587 merges" (or "Hold until", or "Only once ... PR 3587 ...") is checked against
# GitHub: merged releases it and it goes back to being queued, anything else keeps it held, with the reason in brackets. So a
# gate opens by itself, with nobody awake to notice - which is what it is for. Before this, a gated batch read as plain
# queued, and tools/listen.sh exits the moment anything is queued, so every listener restart fired at once and spun on work
# it had been told not to start (home, 25 November 2026). The check needs `gh`; without it, or with GitHub unreachable, the
# batch stays held and says it could not ask, because starting work early is the harm this prevents and a parked machine is
# visible in tools/roster.sh while a wrongly started one is not.
# "done" is matched as tools/board.sh matches it. "withdrawn", "cancelled" or "moved" in the heading, or a note saying
# "batch(es) ... <id> ... withdrawn/cancelled/moved", drops it. "cancelled" is matched because directors write it: on
# 19 November a batch headed "CANCELLED, do not run" went on being reported as outstanding, and on 23 November that
# made a working machine look like it had a backlog (#3268).
#
# TWO LIVE BATCHES WITH THE SAME ID are each reported, tagged with their own director, and each judged only by the commits
# that name that director - because "batch 77 done" cannot say which of two batch 77s is meant, and reading it as both
# silently closes one. Not hypothetical: on 23 November laptop held a gisday batch 7 and a security batch 7, reported
# "finished batch 7" for the gisday one, and this script dropped the security one from the list. laptop noticed and said so
# in a commit ("security's batch 7 is still queued though queued.sh drops it"); nothing else would have. When a shared id
# has reports but none names a director, it stays listed as "and no report says which", because nobody can tell. The
# letters are what stops this happening; this is the backstop while batches numbered before them are still live.
set -u
name=${1:?name}; days=${2:-7}
pr_repo=${QUEUED_PR_REPO:-TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo}

# The batch's own section: its heading, and every line to the next "## ". Needed because a hold belongs to one batch, and a
# whole-file search would let one held batch hold all of them.
section() { # <id> <director word, may be empty>
  awk -v id="$1" -v dir="$2" '
    /^## / { if (inb) exit }
    /^## Batch / { if (match($0, "^## Batch " id "([^0-9A-Za-z]|$)") && (dir == "" || index($0, dir) > 0)) inb = 1 }
    inb { print }
  '
}

# Empty when the batch is free to run; otherwise why it is held. A marker must OPEN its line (after a bullet, quote or bold
# marks) so that an ordinary mention cannot park a machine: "Don't touch PR 3587's branch" is not a hold, and is the kind of
# line every batch has.
hold_reason() { # reads the section on stdin
  line=$(grep -nE '^[-*>[:space:]]*\**([Hh]old|[Hh]eld) until|^[-*>[:space:]]*\**[Oo]nly once' | head -1)
  [ -n "$line" ] || return 0
  n=$(printf '%s' "$line" | grep -oE '([Pp][Rr]|[Pp]ull [Rr]equest)[[:space:]]*#?[0-9]+' | head -1 | grep -oE '[0-9]+$')
  if [ -z "$n" ]; then echo "it names no pull request to check"; return 0; fi
  if ! command -v gh >/dev/null 2>&1; then echo "PR $n: no gh here to ask"; return 0; fi
  st=$(gh pr view "$n" -R "$pr_repo" --json state --jq .state 2>/dev/null | tr -d '\r' | head -1)
  case $st in
    MERGED) return 0 ;;
    OPEN)   echo "PR $n has not merged" ;;
    CLOSED) echo "PR $n was closed without merging" ;;
    *)      echo "PR $n: could not ask GitHub" ;;
  esac
}
tasks=$(git show "origin/work-mailbox:$name/TASKS.md" 2>/dev/null | tr -d '\r') || exit 0
mine=$(git log --format=%s origin/work-mailbox 2>/dev/null | grep -E "^$name: " || true)
cutoff=$(date -u -d "-$days days" +%s)
months='(January|February|March|April|May|June|July|August|September|October|November|December)'

# Every live heading, newest first, as "<id><tab><director>".
live=$(printf '%s\n' "$tasks" | grep -E '^## Batch [A-Za-z]*[0-9]+' | while IFS= read -r h; do
  n=$(printf '%s' "$h" | sed -E 's/^## Batch ([A-Za-z]*[0-9]+).*/\1/')
  printf '%s' "$h" | grep -qiE 'withdrawn|cancelled|canceled|moved' && continue
  printf '%s\n' "$tasks" | grep -qiE "batch(es)? ([A-Za-z]*[0-9]+ (and|,) )*$n\b[^.]*(withdrawn|cancelled|canceled|moved)" && continue
  d=$(printf '%s' "$h" | grep -oE "[0-9]{1,2} $months [0-9]{4}" | head -1)
  if [ -n "$d" ]; then
    t=$(date -u -d "$d" +%s 2>/dev/null) || continue
  else
    # A heading with no date takes the date of the commit that wrote it (#3517). The AggieMap director's headings have none
    # ("## Batch a20 (aggiemap: #2719, ...)"), and every one used to be dropped here, so a listener sat beside a20, a21 and
    # a23 with this script printing nothing. Only commits inside the window are searched, so an old one stays out.
    t=$(git log --since="$days days ago" -S"$h" --format=%ct origin/work-mailbox -- "$name/TASKS.md" 2>/dev/null | tail -n 1)
    [ -n "$t" ] || continue
  fi
  [ "$t" -ge "$cutoff" ] || continue
  # The word the heading opens with, which is its director: "## Batch 7 (security: ...)", "## Batch 1 (gisday, for every ...)".
  p=$(printf '%s' "$h" | sed -nE 's/^## Batch [A-Za-z]*[0-9]+ *\(([^:;)]+)[:;)].*/\1/p' | sed -E 's/,.*//' | tr -d ' ')
  printf '%s\t%s\n' "$n" "$p"
done)
[ -n "$live" ] || exit 0
shared=$(printf '%s\n' "$live" | cut -f1 | sort | uniq -d)

printf '%s\n' "$live" | while IFS="$(printf '\t')" read -r n p; do
  [ -n "$n" ] || continue
  subjects=$mine; tag=""
  # Never write grep -iF here: GNU grep 3.0 in Git Bash ABORTS (exit 134, "core dumped") on -i together with -F, and inside
  # this test that reads as "no match". Written that way first, it hid home's four reports of 23 November. Each flag alone
  # is fine; it is the combination. The director words are plain letters, so -iE needs no quoting.
  if [ -n "$p" ] && printf '%s' "$p" | grep -qE '^[A-Za-z0-9-]+$' && printf '%s\n' "$shared" | grep -qxE -- "$n"; then
    subjects=$(printf '%s\n' "$mine" | grep -iE -- "$p" || true)
    tag=" ($p; another batch shares this id)"
  fi
  done_re="(batch $n (done|finished|complete|reported)|finished batch $n\b|batches [A-Za-z0-9 ,]*\b$n\b[A-Za-z0-9 ,]* (again )?(done|finished))"
  names_re="\bbatch(es)? ([A-Za-z]*[0-9]+ (and|,) )*$n\b"
  if printf '%s\n' "$subjects" | grep -qiE "$done_re"; then
    continue
  elif printf '%s\n' "$subjects" | grep -qiE "$names_re"; then
    echo "$n unfinished$tag"
  elif [ -n "$tag" ] && printf '%s\n' "$mine" | grep -qiE "$done_re|$names_re"; then
    echo "$n unfinished$tag, and no report says which"
  else
    why=$(printf '%s\n' "$tasks" | section "$n" "$p" | hold_reason)
    if [ -n "$why" ]; then echo "$n held$tag - $why"; else echo "$n queued$tag"; fi
  fi
done
