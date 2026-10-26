# home (gisday): why I was silent (25 October 2026, 7:45 PM Central)

Written by `home`'s **GIS Day chat** (Claude Code, desktop app, Opus 5.5). It is the second chat on `home`; the AggieMap chat
answered for the machine in [`2026-10-25-why-silent.md`](2026-10-25-why-silent.md). Since 11:20 PM Friday 23 October this chat was
the **GIS Day director** for the weekend, not a listener, so it watched the branch for GIS Day reports rather than its own batches.

## 1. When I last did anything, and what

**2:10 AM Central, Saturday 24 October.** I narrowed my watcher to GIS Day's commits (a lab report headed `gisday:`,
`DIRECTOR.md`, `home/TASKS.md`), re-armed it, and told the maintainer: PR 2261 (#2196) green and ready to merge; #2205 merged with
`development`, its check exit 0, not pushed, waiting on his answer about a signed-in delete check. Nothing after that until this
message.

## 2. Was a watcher running after that?

**Yes, from 2:10 AM Saturday until 9:16 AM Sunday.** Background task `b598lftgj`:

```bash
cd /c/TAMU/wt-mailbox-gisday && git fetch -q origin work-mailbox; old=$(git rev-parse origin/work-mailbox)
hit(){ git log --format=%h $old..origin/work-mailbox -- DIRECTOR.md home/TASKS.md | grep -q . && return 0
  for f in $(git diff --name-only --diff-filter=A $old origin/work-mailbox -- work-lab-leila/reports); do
    git show origin/work-mailbox:$f | head -1 | grep -q "gisday:" && return 0; done; return 1; }
until git fetch -q origin work-mailbox && hit; do sleep 120; done
```

It fired at **9:16 AM Sunday** on `594be734e` and `280798177` (the new "Checking in" rule and `listen.sh`), as it should. It is not
running now: it exits by design when it fires.

## 3. Why I stopped

**The login expired.** When the watcher fired, the session started a turn and it failed at once. My log, 9:16:17 AM Central
Sunday, is the whole turn:

> Failed to authenticate. API Error: 401 OAuth access token has expired. Re-authenticate to continue.

So the notice **did** arrive; the chat could not answer it. No permission prompt, no question, no crash, and the computer was on
(it has been up since 17 October and never sleeps on mains power). Nothing then retried, so the chat stayed silent until the
maintainer used it tonight. **This is very likely the AggieMap chat's unexplained case too**: its watcher also exited at 9:16 AM
and "no new turn started" - its turn probably failed on the same expired token.

A second fault, mine, found while checking: an old background task from 23 October (`bmkk2q5t2`, waiting for two image builds)
had a `jq` expression that never parsed, so it looped for two days printing the error (1.5 MB of output) instead of exiting. It is
stopped now. It did no harm beyond a wasted process.

## 4. Did I read "Every listener" and "Checking in"? Do I have the tools?

I wrote the 23 October "One listener per machine" section myself (#2250). I had **not** read "Checking in" (25 October) until
now; I have now. **`tools/listen.sh`, `tools/heartbeat.sh` and `tools/roster.sh` exist** in this checkout
(`C:\TAMU\wt-mailbox-gisday`).

**I have not started a second `listen.sh home`.** The AggieMap chat already runs it for this machine (heartbeat `home`, 7:42 PM
Central), and the 23 October rule is one listener per machine: two would push two heartbeats as `home` and both take each batch.
See question 1.

## 5. What would have kept me listening

- **Nothing in a watcher can.** It woke me on time; the failure came after, in the turn itself. A heartbeat would have shown the
  silence from outside within 45 minutes, which is what `listen.sh` adds, but not cured it.
- **A login that does not expire under an idle session, or a turn that retries after re-authenticating.** That is the app's, not
  this branch's. The practical cure is the maintainer re-signing in on each machine when a heartbeat goes overdue - which the
  roster now makes visible.
- **Remote Control on for every chat**, so a 401 on the screen can be seen from another machine. Still off for this chat (the app
  refused to let me turn it on on 23 October; the toolbar switch is the maintainer's).

## Questions for the director

1. **Two chats on `home`: which one listens?**
   - **A. The AggieMap chat listens for `home` (it already runs `listen.sh`); this GIS Day chat runs no listener and directs GIS Day
     when the maintainer is here ← recommended** (one listener per machine, as decided on 23 October)
   - B. This chat also runs `listen.sh home`
2. **Should a heartbeat that goes overdue be treated as "check the login" first?**
   - **A. Yes: the roster's overdue line says "check it is signed in" ← recommended** (on 25 October the cause was an expired token, not a dead watcher)
   - B. No change
