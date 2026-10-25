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
# Where each participant runs comes from the maintainer's private repository, when gh here can read it; never from this branch.
private=${PRIVATE_ROSTER_REPO:-danielgoldbergtamu/danielgoldbergtamu-tamu-geography-machine-ip-report}
addr() { command -v gh >/dev/null 2>&1 && gh api "repos/$private/contents/listeners/$1.md" -H 'Accept: application/vnd.github.raw' 2>/dev/null |
  tr -d '\r' | sed -n 's/^- [^|]*| //p' | head -1; }
# A heartbeat says the session's background task is alive, not that the session is doing anything: on 25 October the lab's
# heartbeat ran every 30 minutes for three hours while the session sat in a wait that could never end. So the roster also shows
# when the participant last pushed real work (its STATUS.md or a report), and flags it when that is over 60 minutes old while it
# says it is running a batch (DIRECTOR.md, "When a listener stops": some push at least every 60 minutes).
worked() { git log -1 --format=%ct origin/work-mailbox -- "$1/STATUS.md" "$1/reports" 2>/dev/null; }
printf '| %s | %s | %s | %s | %s | %s | %s | %s |\n' Participant Agent State 'Takes work?' 'Last seen (Central)' 'Last real push' Health 'Where (private)'
printf '| --- | --- | --- | --- | --- | --- | --- | --- |\n'
for d in $(git ls-tree -d --name-only origin/work-mailbox); do
  git cat-file -e "origin/work-mailbox:$d/TASKS.md" 2>/dev/null || continue
  hb=$(git show "origin/work-mailbox:$d/HEARTBEAT.md" 2>/dev/null | tr -d '\r')
  w=$(worked "$d"); wl=""; [ -n "$w" ] && wl="$(( (now - w) / 60 )) min ago"
  if [ -z "$hb" ]; then printf '| %s | | | | | %s | never checked in | %s |\n' "$d" "$wl" "$(addr "$d")"; continue; fi
  f() { printf '%s\n' "$hb" | sed -n "s/^$1: //p" | head -1; }
  seen=$(f seen_utc); due=$(f next_utc)
  late=$(( now - $(date -u -d "$due" +%s) ))
  if [ $late -le 0 ]; then health=up; elif [ $late -le 7200 ]; then health="late $((late / 60)) min"; else health=gone; fi
  acc=$(f accepting); [ "$health" = up ] || acc=no
  case "$(f state)" in running*) [ -n "$w" ] && [ $(( now - w )) -gt 3600 ] && health="$health, but no work pushed for $(( (now - w) / 60 )) min: stuck?" ;; esac
  printf '| %s | %s | %s | %s | %s | %s | %s | %s |\n' "$d" "$(f agent)" "$(f state)" "$acc" "$(central "$seen")" "$wl" "$health" "$(addr "$d")"
done
