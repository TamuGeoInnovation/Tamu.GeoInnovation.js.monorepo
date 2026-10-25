#!/usr/bin/env bash
# The listener's watcher, with a heartbeat. Pushes "<name>: heartbeat - idle" now and every 30 minutes, and exits as soon as
# a commit touches <name>/TASKS.md or DIRECTOR.md (DIRECTOR.md "Every listener"). Run it in the background; when it exits,
# pull, read DIRECTOR.md and your TASKS.md, do the batch, then start it again.
# Usage: tools/listen.sh <name> [heartbeat-minutes]
set -u
name=${1:?name}; every=${2:-30}
git fetch -q origin work-mailbox
old=$(git rev-parse origin/work-mailbox)
beat=0
while true; do
  now=$(date +%s)
  if [ $((now - beat)) -ge $((every * 60)) ]; then
    bash tools/heartbeat.sh "$name" idle $((every + 15)) && beat=$now
    old=$(git rev-parse HEAD)   # our own heartbeat is not news
  fi
  sleep 120
  git fetch -q origin work-mailbox || continue
  if [ -n "$(git log --format=%h "$old"..origin/work-mailbox -- "$name/TASKS.md" DIRECTOR.md)" ]; then
    echo "new commit for $name: $(git log -1 --format='%h %s' origin/work-mailbox -- "$name/TASKS.md" DIRECTOR.md)"
    exit 0
  fi
done
