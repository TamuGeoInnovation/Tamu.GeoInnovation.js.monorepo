#!/usr/bin/env bash
# One board for all the work: every listener's batches, with project, director and state, from what is on origin/work-mailbox.
# Usage: tools/board.sh [N]     (read only; changes nothing). N = how many done batches to show per listener (default 3).
# State comes from the listeners' own commit subjects: "<name>: batch N done" (done), "<name>: started batch N" / "batch N started" /
# "batch N running" (running), a heading or note saying the batch is withdrawn (withdrawn), otherwise queued. A batch heading should read
# "## Batch N (<project>: <issue and what>; <date and time> Central, from `<director>`)" (DIRECTOR.md, "Batch headings").
# Generated, never edited by hand, so it cannot drift from what the listeners actually pushed. PROJECTS.md says who directs what.
set -u
keep=${1:-3}
git fetch -q origin work-mailbox 2>/dev/null
subjects=$(git log --format=%s origin/work-mailbox 2>/dev/null)
printf '| %s | %s | %s | %s | %s |\n' Listener Batch Project Director State
printf '| --- | --- | --- | --- | --- |\n'
for d in $(git ls-tree -d --name-only origin/work-mailbox); do
  tasks=$(git show "origin/work-mailbox:$d/TASKS.md" 2>/dev/null | tr -d '\r') || continue
  [ -z "$tasks" ] && continue
  mine=$(printf '%s\n' "$subjects" | grep -E "^$d: " || true)
  # every numbered batch heading, newest first as the files keep them
  printf '%s\n' "$tasks" | grep -E '^## Batch [0-9]+' | while IFS= read -r h; do
    n=$(printf '%s' "$h" | sed -E 's/^## Batch ([0-9]+).*/\1/')
    inner=$(printf '%s' "$h" | sed -nE 's/^## Batch [0-9]+ *\((.*)\).*$/\1/p')
    project=$(printf '%s' "$inner" | sed -nE 's/^([^:;]+):.*/\1/p')
    director=$(printf '%s' "$h" | grep -oE 'from `[^`]+`' | sed -E 's/from `([^`]+)`/\1/' | head -1)
    if printf '%s\n' "$mine" | grep -qiE "(batch $n (done|finished|complete|reported)|finished batch $n\b|batches [0-9 ,and]*\b$n\b[0-9 ,and]* (done|finished))"; then state=done
    elif printf '%s' "$h" | grep -qi withdrawn || printf '%s\n' "$tasks" | grep -qiE "batch(es)? ([0-9]+ (and|,) )*$n\b[^.]*withdrawn|withdrawn[^.]*batch(es)? ([0-9]+ (and|,) )*$n\b"; then state=withdrawn
    elif printf '%s\n' "$mine" | grep -qiE "(started batch $n\b|batch $n (started|running)|running batch $n\b)"; then state=running
    else state=queued; fi
    printf '%s\t%s\t%s\t%s\t%s\n' "$d" "$n" "${project:-?}" "${director:-?}" "$state"
  done | awk -F'\t' -v keep="$keep" '
    # Newest first. Anything older than a batch already done that never said "done" is history nobody closed out: shown as "ended".
    # Only the newest few closed batches are shown per listener, so the board stays a board.
    { st=$5; if (st=="done") seen=1; else if (seen && (st=="running" || st=="queued")) st="ended"
      if (st=="done" || st=="withdrawn" || st=="ended") { if (++old > keep) next }
      printf "| %s | %s | %s | %s | %s |\n", $1, $2, $3, $4, (st=="running" ? "**running**" : st) }'
done
