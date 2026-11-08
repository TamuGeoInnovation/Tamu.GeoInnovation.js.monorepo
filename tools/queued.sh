#!/usr/bin/env bash
# What is waiting for a listener: the batches in <name>/TASKS.md, written in the last N days, that the listener has not
# reported done, and that nothing marks withdrawn or moved. Read only.
#
#   tools/queued.sh <name> [days]     prints "<n> queued" or "<n> unfinished" per line, newest first; nothing when none
#
# Why (8 November 2026): a batch written while a listener is busy is a commit its watcher has already passed, so a watcher that
# waits only for the next commit can sit idle beside queued work; and a director moving work between machines needs to see what
# is really waiting, not guess from the log (on 30 October two finished batches were redone elsewhere). tools/listen.sh,
# tools/roster.sh and every director use this one list.
#
# A batch counts when its heading is "## Batch <n> (...)" with a date ("<d> <Month> <yyyy>") at most N days old (default 7).
# Older headings are history nobody closed out, which tools/board.sh calls "ended".
#   queued      no "<name>: ... batch <n> ..." commit at all
#   unfinished  a commit names it, but none says it is done
# "done" is matched as tools/board.sh matches it. "withdrawn" or "moved" in the heading, or a note saying "batch(es) ... <n> ...
# withdrawn/moved", drops it.
set -u
name=${1:?name}; days=${2:-7}
tasks=$(git show "origin/work-mailbox:$name/TASKS.md" 2>/dev/null | tr -d '\r') || exit 0
mine=$(git log --format=%s origin/work-mailbox 2>/dev/null | grep -E "^$name: " || true)
cutoff=$(date -u -d "-$days days" +%s)
printf '%s\n' "$tasks" | grep -E '^## Batch [0-9]+' | while IFS= read -r h; do
  n=$(printf '%s' "$h" | sed -E 's/^## Batch ([0-9]+).*/\1/')
  printf '%s' "$h" | grep -qiE 'withdrawn|moved' && continue
  printf '%s\n' "$tasks" | grep -qiE "batch(es)? ([0-9]+ (and|,) )*$n\b[^.]*(withdrawn|moved)" && continue
  d=$(printf '%s' "$h" | grep -oE '[0-9]{1,2} (January|February|March|April|May|June|July|August|September|October|November|December) [0-9]{4}' | head -1)
  [ -n "$d" ] || continue
  t=$(date -u -d "$d" +%s 2>/dev/null) || continue
  [ "$t" -ge "$cutoff" ] || continue
  if printf '%s\n' "$mine" | grep -qiE "(batch $n (done|finished|complete|reported)|finished batch $n\b|batches [0-9 ,and]*\b$n\b[0-9 ,and]* (again )?(done|finished))"; then
    continue
  elif printf '%s\n' "$mine" | grep -qiE "\bbatch(es)? ([0-9]+ (and|,) )*$n\b"; then
    echo "$n unfinished"
  else
    echo "$n queued"
  fi
done
