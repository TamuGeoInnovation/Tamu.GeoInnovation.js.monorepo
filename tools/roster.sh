#!/usr/bin/env bash
# Who is up and able to take work: one row per participant, from each <name>/HEARTBEAT.md on origin/work-mailbox.
# Usage: tools/roster.sh        (read only; changes nothing)
# A heartbeat older than its own next_utc is "late"; 2 hours past it, "gone". No file at all is "never checked in".
#
# A RECENT REAL PUSH OUTRANKS A STALE HEARTBEAT (#3270). The heartbeat says a background task is alive, not that the
# machine is: those are different claims, and when they disagree the pushes are the stronger evidence. On 23 November 2026
# this printed "gone: check it is signed in" beside "last real push 137 min ago" on one line, for a machine that had
# reported six batches that morning and whose STATUS.md was current - its heartbeat task simply had not restarted after a
# reboot (the #2901/#2902 pattern). A director read the row, told the maintainer the lab had been gone eight days, and got
# agreement to move its queue elsewhere. Nothing needed moving. A flag that is wrong in the direction of taking work off a
# working machine is worse than no flag, because it is acted on. So a participant that pushed work inside PUSH_IS_ALIVE_MIN
# is never called gone or late: the row says the heartbeat task is the thing that stopped, and "takes work" is left as the
# participant itself declared it.
#
# AND THE OTHER WAY ROUND: a heartbeat that says "idle" proves nothing either. copilot-home heartbeated every twenty minutes
# for 24 days - cycling "running (agent-runner)" to "idle" - having last pushed real work on 30 October, and this printed it
# as "up", "takes work: yes", with nothing waiting: a healthy idle machine ready for a batch. It was not; its runner was
# starting, doing nothing and marking itself idle (the #2901/#2902 pattern again). A director reading that row gives it work
# that is never done. So a participant that has pushed nothing for longer than STALE_WORK_HOURS, while claiming to be up,
# says so in its Health and does not offer to take work.
# Late or gone says "check it is signed in" first: on 25 October two chats on home went silent because the session's login
# had expired ("401 OAuth access token has expired"), with their watchers working.
set -u
git fetch -q origin work-mailbox
central() {  # UTC ISO -> "Sun 25 Oct 9:10 AM" in US Central, when PowerShell is there to do it right
  if command -v powershell >/dev/null 2>&1; then
    powershell -NoProfile -Command "[System.TimeZoneInfo]::ConvertTimeFromUtc([DateTime]::Parse('$1').ToUniversalTime(),[System.TimeZoneInfo]::FindSystemTimeZoneById('Central Standard Time')).ToString('ddd d MMM h:mm tt')" | tr -d '\r'
  else echo "$1 UTC"; fi
}
now=$(date -u +%s)
# DIRECTOR.md asks a listener to push at least every 60 minutes while a batch is open, so a push inside that window is
# proof the machine is working whatever its heartbeat says.
push_is_alive_min=${PUSH_IS_ALIVE_MIN:-60}
# How long a participant may push nothing at all before "up" stops meaning anything. A day: long enough to cover a quiet
# night and a weekend's gap, short enough that 24 days of silence can never read as healthy again.
stale_work_hours=${STALE_WORK_HOURS:-24}
# Where each participant runs comes from the maintainer's private repository, when gh here can read it; never from this branch.
private=${PRIVATE_ROSTER_REPO:-danielgoldbergtamu/danielgoldbergtamu-tamu-geography-machine-ip-report}
addr() { command -v gh >/dev/null 2>&1 && gh api "repos/$private/contents/listeners/$1.md" -H 'Accept: application/vnd.github.raw' 2>/dev/null |
  tr -d '\r' | sed -n 's/^- [^|]*| //p' | head -1; }
# A heartbeat says the session's background task is alive, not that the session is doing anything: on 25 October the lab's
# heartbeat ran every 30 minutes for three hours while the session sat in a wait that could never end. So the roster also shows
# when the participant last pushed real work (its STATUS.md or a report), and flags it when that is over 60 minutes old while it
# says it is running a batch (DIRECTOR.md, "When a listener stops": some push at least every 60 minutes).
worked() { git log -1 --format=%ct origin/work-mailbox -- "$1/STATUS.md" "$1/reports" 2>/dev/null; }
# What is waiting for it (tools/queued.sh): "idle" beside a queued batch, or "blocked", is a machine wasting its time, and the
# director who next runs this fixes that before anything else (DIRECTOR.md, "No machine idle beside work", 8 November 2026).
waiting() { bash tools/queued.sh "$1" | paste -sd ',' - | sed 's/,/, /g'; }
printf '| %s | %s | %s | %s | %s | %s | %s | %s | %s |\n' Participant Agent State 'Takes work?' 'Last seen (Central)' 'Last real push' 'Waiting for it' Health 'Where (private)'
printf '| --- | --- | --- | --- | --- | --- | --- | --- | --- |\n'
for d in $(git ls-tree -d --name-only origin/work-mailbox); do
  git cat-file -e "origin/work-mailbox:$d/TASKS.md" 2>/dev/null || continue
  hb=$(git show "origin/work-mailbox:$d/HEARTBEAT.md" 2>/dev/null | tr -d '\r')
  w=$(worked "$d"); wl=""; [ -n "$w" ] && wl="$(( (now - w) / 60 )) min ago"
  q=$(waiting "$d")
  if [ -z "$hb" ]; then printf '| %s | | | | | %s | %s | never checked in | %s |\n' "$d" "$wl" "$q" "$(addr "$d")"; continue; fi
  f() { printf '%s\n' "$hb" | sed -n "s/^$1: //p" | head -1; }
  seen=$(f seen_utc); due=$(f next_utc)
  late=$(( now - $(date -u -d "$due" +%s) ))
  # Did it push real work recently? That outranks a stale heartbeat (#3270).
  pushed_recently=no
  [ -n "$w" ] && [ $(( (now - w) / 60 )) -le "$push_is_alive_min" ] && pushed_recently=yes
  acc=$(f accepting)
  # Has it pushed anything at all lately? "up" with weeks of silence is the claim that wasted copilot-home's 24 days.
  work_is_stale=no
  { [ -z "$w" ] || [ $(( (now - w) / 3600 )) -ge "$stale_work_hours" ]; } && work_is_stale=yes
  if [ $late -le 0 ] && [ "$work_is_stale" = yes ]; then
    if [ -z "$w" ]; then
      health="heartbeat says up, but it has NEVER pushed work: check its agent actually runs (#2901)"
    else
      health="heartbeat says up, but it has pushed NOTHING for $(( (now - w) / 3600 )) h: check its agent actually runs (#2901)"
    fi
    acc=no
  elif [ $late -le 0 ]; then
    health=up
  elif [ "$pushed_recently" = yes ]; then
    # Working, but its heartbeat task is not. Say which one stopped, and do not take work off it.
    health="up (pushed $(( (now - w) / 60 )) min ago); its HEARTBEAT is $((late / 60)) min stale, so restart its heartbeat task (#2901) - the machine is fine"
  elif [ $late -le 7200 ]; then
    health="late $((late / 60)) min: check it is signed in"; acc=no
  else
    health="gone: check it is signed in"; acc=no
  fi
  case "$(f state)" in
    running*) [ "$pushed_recently" = no ] && [ -n "$w" ] && [ $(( now - w )) -gt 3600 ] && health="$health, but no work pushed for $(( (now - w) / 60 )) min: stuck?" ;;
    idle*) [ -n "$q" ] && health="$health, but IDLE WITH WORK WAITING: wake it" ;;
    blocked*) health="BLOCKED: $(f state | sed 's/^blocked: *//')" ;;
  esac
  printf '| %s | %s | %s | %s | %s | %s | %s | %s | %s |\n' "$d" "$(f agent)" "$(f state)" "$acc" "$(central "$seen")" "$wl" "$q" "$health" "$(addr "$d")"
done
