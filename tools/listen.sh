#!/usr/bin/env bash
# The listener's watcher, with a heartbeat. Pushes "<name>: heartbeat - idle" now and every 30 minutes, and exits as soon as
# there is work: at start, if tools/queued.sh lists any batch for <name>; later, when a commit touches <name>/TASKS.md or
# DIRECTOR.md, or when that list changes (DIRECTOR.md "Every listener"). Run it in the background; when it exits, pull, read
# DIRECTOR.md and your TASKS.md, do every batch it named, then start it again.
#
# Why the list and not only new commits (8 November 2026): a batch written while the listener is busy is a commit it has
# already passed, so a watcher that waits only for the next commit can sit idle beside queued work. Checking the list at start
# means a listener never goes idle with something waiting for it.
# Usage: tools/listen.sh <name> [heartbeat-minutes]
set -u
name=${1:?name}; every=${2:-30}
git fetch -q origin work-mailbox
old=$(git rev-parse origin/work-mailbox)
queue=$(bash tools/queued.sh "$name" | paste -sd ' ' -)
if [ -n "$queue" ]; then echo "work waiting for $name: $queue"; exit 0; fi
beat=0
while true; do
  now=$(date +%s)
  if [ $((now - beat)) -ge $((every * 60)) ]; then
    # Keep whatever state the listener last set: a batch in progress stays "running batch N" (it sets "idle" itself when it
    # reports). Before 26 October this always said "idle", so a busy machine showed "takes work: yes" (home's batch 3 report).
    state=$(git show "origin/work-mailbox:$name/HEARTBEAT.md" 2>/dev/null | tr -d '\r' | sed -n 's/^state: //p')
    bash tools/heartbeat.sh "$name" "${state:-idle}" $((every + 15)) && beat=$now
    old=$(git rev-parse HEAD)   # our own heartbeat is not news
  fi
  sleep 120
  git fetch -q origin work-mailbox || continue
  if [ -n "$(git log --format=%h "$old"..origin/work-mailbox -- "$name/TASKS.md" DIRECTOR.md)" ]; then
    echo "new commit for $name: $(git log -1 --format='%h %s' origin/work-mailbox -- "$name/TASKS.md" DIRECTOR.md)"
    exit 0
  fi
  now_queue=$(bash tools/queued.sh "$name" | paste -sd ' ' -)
  if [ -n "$now_queue" ] && [ "$now_queue" != "$queue" ]; then echo "work waiting for $name: $now_queue"; exit 0; fi
  queue=$now_queue
done
