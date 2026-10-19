# Work machine: status

Written only by the work machine (see `work/TASKS.md`, "Who does what"). Push it the moment anything starts or
finishes. The director reads it before writing a batch or asking the maintainer anything.

Last written **7:05 PM Central, 19 October 2026**. **This machine is a listener again** — it handed the director
role back to home at 6:35 PM, when the maintainer left the office, and is waiting to be told it is the worker bee.
Clock times here are read from PowerShell or from a commit timestamp, not estimated.

**Last batch done: 13. Batch 14 is taken and waiting on its build.**

## Running now

**Batch 14 (#1935): the quick tier on Release-485.** Taken at 7:05 PM Central, **not started** — its two conditions
are not both met yet.

| | |
| --- | --- |
| Release | Release-485, build 20261019.13, `0f69d3bac` |
| `GIS-1D Development` | **inProgress** at 7:03 PM |
| Dev serves | `main-CR5DN6UQ.js`, already different from Release-484's `main-5IW7YA32.js` |

**The bundle changed before the stage finished**, so the new hash alone is not proof the deploy is done — a deploy
can swap files and still be running. A waiter is polling for *both* the succeeded stage and a new bundle, and the
tier starts the moment both hold. `work: started` is pushed before anything runs.

Nothing heavy will run beside it, as the batch says.

The AVP poller is still watching Transportation Services' service and will say so when it answers 20 of
20.

**`fix/1954-deep-link-respects-filter` passed its check here: exit 0**, lint 5 projects, test 5, build 2, all run.
It is merged with `development` and has **no pull request** — this machine had already handed the director role
back when the result landed, so it did not open one. That is a one-line decision for the director.

## Where today's release stands

- **Nothing is tagged.** `dev-2026-10-19` was created on `8951a6364` and then **deleted**: the maintainer merged
  four more commits afterwards, so the tag would have named a build that was never made. The next `dev-*` tag
  belongs on the commit tonight's build actually comes from.
- The maintainer is building dev from `development`'s head (`0f69d3bac`) and releasing to dev; at home he will
  merge PR 1950 and do a release test run, and if that looks good **that** build goes to production, not this one.
- **He decided to ship despite #1951**, the AVP outage, which production already has. That decision was made about
  the `8951a6364` build; the four newer commits are individually CI-green but untested together.
- **He asked for the quick tier against the new dev release before production.** It has not run. It is this
  machine's job and needs a batch.

## What this machine holds

| | |
| --- | --- |
| Comparison page | `C:/TAMU/visual-baselines/compare/dev-8951a6364-vs-prod-2026-10-16-corrected/review.html` |
| Dev set | `development-as-production/8951a6364`, 848 shots, 0 failed |
| Production baseline | `production/prod-2026-10-16-corrected`, 848 shots, two mid-load ones re-taken; the original is untouched beside it |
| Screenshots | only this machine can take them until the Kubernetes visual compare exists |

**The final comparison found nothing above 20%**, and the layer-order problem from yesterday is fixed.

## Today's pull requests and issues

| | |
| --- | --- |
| Merged | 1958 (#1952), 1956, 1959 (#1953), 1965 |
| **1966** (#1960, lactation rooms) | open, checked here exit 0, before/after images committed, Pending Approval |
| 1950 | open, held for the maintainer's own release test run at home |
| #1954 | branch ready, merged with `development`, check running, **no PR** |

Issues filed today: #1951 (High, their server), #1952, #1953 (Medium), #1954 (Medium), #1957 (CLAUDE.md's Node 22
dev-server commands), #1960 (High, lactation), #1961 (Low), #1963 (home's, **no priority set**), #1964 (closed as a
duplicate of #1963 — this machine and home filed the same issue minutes apart).

## Findings

Recorded, not requests. Nothing here is started without a batch.

- **The watchdog this machine wrote is not trustworthy yet.** Three false alarms, no real catch: it flagged a
  director's own push, an idle listener, and a listener that had finished. The one real stall today, codex-home,
  was found by reading a status file. Treat its warnings as a prompt to look.
- **`CLAUDE.md`'s dev-server commands still say Node 22** and now fail with a message blaming the lock file
  (#1957). The documented fix path for a quick bug fix is broken until that lands.
- **The Vite dev server would not serve a page at all** on the Node 24 workspace — `goto` timed out at 600 s and
  the probe never appeared. A production build served statically worked first time, and is how #1960's after image
  was taken. Related in spirit to PR 1956.
- **#1960's after image needed `local-production`**, because the new service is only on the production GIS host
  (#1963). The same will be true of anything touching that layer until it is published on dev.

## Told directly

- **19 October, 6:55 PM** — the maintainer is home, reaching this machine over RDP. **This machine is the worker;
  home is the director.** Said directly to this machine, so the director does not need to ask again. Its branch
  watcher is running and it will take the next batch in `work/TASKS.md` without being asked.
- **19 October, 6:30 PM** — the maintainer is going home; make sure everything is checked in, update the handoff,
  and **wait to be told this machine is the worker bee**. Home becomes the director.
- **19 October, afternoon** — ship the release despite #1951, recording it as an external outage production already
  has; re-run the quick tier against the new dev release before production; #1961 is Low; #1954's merge is home's.
- **19 October, morning** — a new batch in `work/TASKS.md` is this machine's instruction: start it without waiting.
