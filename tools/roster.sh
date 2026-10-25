#!/usr/bin/env bash
# Who is up and able to take work: one row per participant, from each <name>/HEARTBEAT.md on origin/work-mailbox.
# Usage: tools/roster.sh        (read only; changes nothing)
# A heartbeat older than its own next_utc is "late"; 2 hours past it, "gone". No file at all is "never checked in".
set -u
git fetch -q origin work-mailbox
central() {  # UTC ISO -> "Sun 25 Oct 9:10 AM" in US Central, when PowerShell is there to do it right
  if command -v powershell >/dev/null 2>&1; then
    powershell -NoProfile -Command "[System.TimeZoneInfo]::ConvertTimeFromUtc([DateTime]::Parse('$1').ToUniversalTime(),[System.TimeZoneInfo]::FindSystemTimeZoneById('Central Standard Time')).ToString('ddd d MMM h:mm tt')" | tr -d '\r'
  else echo "$1 UTC"; fi
}
now=$(date -u +%s)
printf '| %s | %s | %s | %s | %s | %s |\n' Participant Agent State 'Takes work?' 'Last seen (Central)' Health
printf '| --- | --- | --- | --- | --- | --- |\n'
for d in $(git ls-tree -d --name-only origin/work-mailbox); do
  git cat-file -e "origin/work-mailbox:$d/TASKS.md" 2>/dev/null || continue
  hb=$(git show "origin/work-mailbox:$d/HEARTBEAT.md" 2>/dev/null | tr -d '\r')
  if [ -z "$hb" ]; then printf '| %s | | | | | never checked in |\n' "$d"; continue; fi
  f() { printf '%s\n' "$hb" | sed -n "s/^$1: //p" | head -1; }
  seen=$(f seen_utc); due=$(f next_utc)
  late=$(( now - $(date -u -d "$due" +%s) ))
  if [ $late -le 0 ]; then health=up; elif [ $late -le 7200 ]; then health="late $((late / 60)) min"; else health=gone; fi
  acc=$(f accepting); [ "$health" = up ] || acc=no
  printf '| %s | %s | %s | %s | %s | %s |\n' "$d" "$(f agent)" "$(f state)" "$acc" "$(central "$seen")" "$health"
done
