#!/usr/bin/env bash
# Write and push this participant's heartbeat: one small file saying it is alive and whether it can take work.
# Usage: tools/heartbeat.sh <name> <state> [next-minutes]
#   <name>   the folder name: work-lab-leila, copilot-home, codex-home, home, work, ...
#   <state>  idle | running batch <n> | blocked: <why> | stopped
# Run from a checkout of work-mailbox. It writes <name>/HEARTBEAT.md and pushes it as "<name>: heartbeat".
# Times are UTC here (Git Bash has no tz database); tools/roster.sh shows them in US Central.
set -u
name=${1:?name}; state=${2:?state}; next=${3:-30}
[ -d "$name" ] || { echo "no folder $name: announce yourself first (DIRECTOR.md)" >&2; exit 2; }
case "$state" in idle) accepting=yes ;; *) accepting=no ;; esac
now=$(date -u +%Y-%m-%dT%H:%M:%SZ)
due=$(date -u -d "+$next minutes" +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || date -u -v+"$next"M +%Y-%m-%dT%H:%M:%SZ)
agent=$(sed -n 's/^- \*\*Agent:\*\* *//p' "$name/STATUS.md" 2>/dev/null | head -1 | cut -c1-60)
machine=$(sed -n 's/^- \*\*Machine:\*\* *//p' "$name/STATUS.md" 2>/dev/null | head -1 | cut -c1-60)
printf 'name: %s\nagent: %s\nmachine: %s\nstate: %s\naccepting: %s\nseen_utc: %s\nnext_utc: %s\n' \
  "$name" "${agent:-unknown}" "${machine:-unknown}" "$state" "$accepting" "$now" "$due" | tr -d '\r' > "$name/HEARTBEAT.md"
git add "$name/HEARTBEAT.md"
git commit -q -m "$name: heartbeat - $state" -- "$name/HEARTBEAT.md" || exit 0
for i in 1 2 3 4 5; do
  git pull -q --rebase origin work-mailbox && git push -q origin HEAD:work-mailbox && exit 0
  sleep $((i * 5))
done
echo "heartbeat push failed after 5 tries" >&2; exit 1
