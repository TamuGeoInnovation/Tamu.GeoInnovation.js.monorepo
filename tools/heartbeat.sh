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
# Where to reach this machine (host and LAN addresses, for RDP) goes ONLY to the maintainer's private repository, never to this
# branch: work-mailbox is public, and CLAUDE.md keeps internal addresses out of it. One file per participant,
# listeners/<name>.md, beside the repository's own ip-report.md (which its own script writes; this never touches it). It is
# committed only when the host or addresses change, so the private history is a record of moves, not of every check-in.
# Skipped quietly where the private repository cannot be reached. PRIVATE_ROSTER overrides it.
private=${PRIVATE_ROSTER:-git@github.com:danielgoldbergtamu/danielgoldbergtamu-tamu-geography-machine-ip-report.git}
pdir="${HOME:-/tmp}/.tamu-machine-ip-report"
if { [ -d "$pdir/.git" ] || git clone -q "$private" "$pdir" 2>/dev/null; } && git -C "$pdir" pull -q --rebase 2>/dev/null; then
  if command -v ipconfig >/dev/null 2>&1; then
    ips=$(ipconfig | tr -d '\r' | sed -n 's/.*IPv4[^:]*: *//p' | grep -v '^127\.' | paste -sd ',' -)
  else
    ips=$(hostname -I 2>/dev/null | tr ' ' '\n' | grep -E '^[0-9.]+$' | grep -v '^127\.' | paste -sd ',' -)
  fi
  host=$(hostname)
  mkdir -p "$pdir/listeners"
  line="host=$host | lan=${ips:-unknown}"
  if ! grep -qF -- "$line" "$pdir/listeners/$name.md" 2>/dev/null; then
    { printf '# %s\n\nWhere this participant runs, for RDP. Newest first; a line is added only when the host or address changes.\n\n' "$name"
      printf -- '- %s | %s\n' "$now" "$line"
      sed -n 's/^- /- /p' "$pdir/listeners/$name.md" 2>/dev/null; } > "$pdir/listeners/$name.md.new"
    mv "$pdir/listeners/$name.md.new" "$pdir/listeners/$name.md"
    git -C "$pdir" add "listeners/$name.md" && git -C "$pdir" commit -q -m "$name: $line" 2>/dev/null && git -C "$pdir" push -q 2>/dev/null ||
      echo "private address report push failed; the public heartbeat goes on" >&2
  fi
fi

git add "$name/HEARTBEAT.md"
git commit -q -m "$name: heartbeat - $state" -- "$name/HEARTBEAT.md" || exit 0
for i in 1 2 3 4 5; do
  git pull -q --rebase origin work-mailbox && git push -q origin HEAD:work-mailbox && exit 0
  sleep $((i * 5))
done
echo "heartbeat push failed after 5 tries" >&2; exit 1
