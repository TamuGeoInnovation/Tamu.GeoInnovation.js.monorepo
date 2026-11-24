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
  [ -n "$d" ] || continue
  t=$(date -u -d "$d" +%s 2>/dev/null) || continue
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
    echo "$n queued$tag"
  fi
done
