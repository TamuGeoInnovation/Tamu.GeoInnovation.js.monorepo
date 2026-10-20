# Work machine: status

Written only by the work machine (see `work/TASKS.md`, "Who does what"). Push it the moment anything starts or
finishes. The director reads it before writing a batch or asking the maintainer anything.

Last written **1:35 AM Central, 20 October 2026**. **This machine is a listener again** — it handed the director
role back to home at 6:35 PM, when the maintainer left the office, and is waiting to be told it is the worker bee.
Clock times here are read from PowerShell or from a commit timestamp, not estimated.

**Last batch done: 13. Batch 14 is taken and waiting on its build.**

## Running now

Nothing, and **nothing is expected to run until production is promoted.** Batch 17 is answers only: when `prod-*`
is pushed, a batch will ask for the release tier against production.

**Last batch done: 17.** The branch watcher is running, as `DIRECTOR.md` requires of a listener.

## Every question this machine raised is now answered

| Question | Answer |
| --- | --- |
| The `lot-links` race, seen on two maps | **#1969**, Medium, filed 12:35 AM. The Visitor Parking sighting is on it |
| `TS_Main/6` failing like the AVP service | **Added to #1951** (the maintainer's 4A). **#1951 stays open**; telling the GIS team is his call in the morning |
| #1954's *What to test* row, one line out | **Left as it is** |
| #1963, #1957 priorities | High and Medium, set earlier |
| #1961 | Low |

Nothing this machine raised is still hanging.

## work: finished — a clean release tier, and TAGGED

**`dev-2026-10-20` on `8463ac6af99774e299cdaace8ce389b03af9d151`, pushed to origin.**

**546 passed, 0 failed, 1 flaky, 29 skipped of 576**, 36.8 minutes, exit 0. The AVP query was re-polled first and
answered 20 of 20; dev was still serving `main-IORMDVQQ.js`. Posted on #1935
([comment](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1935#issuecomment-6284498115)).

**The 9 PM failure is gone and the build did not change.** Both runs were on `8463ac6af`; `directions.spec.ts:72`
failed then and passed now, because #1951's service recovered at 00:14. The `TS_Main/6` flake went with it.

**The one flaky result is the same race as last night, on a different map.** `lot-links.spec.ts:109` on **Visitor
Parking** opened the main map's Lot 100j on its first attempt; at 9 PM the same test did it on **Motorcycle
Parking**. One map from each group of #1952's audit, so it is **not** about field names and not a regression in
that matcher — it looks like a race against the event map's layers loading.

## work: finished — the comparison on Release-486

**Nothing above 20%. Nothing above 10%.** 848 captured, 0 failed. Posted on #1949
([comment](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1949#issuecomment-6284037695)).

PR 1950 rehosts every map and **no map looks materially different for it**; the largest difference on the set is
9.87%, on a page that was 9.66% this morning before 1950 existed. The top desktop shot was a mid-load capture:
6.91% first, **2.94%** on a re-take.

`8463ac6af` now has a clean release tier, a `dev-*` tag, and a comparison against production. Promotion is the
maintainer's.

## A miss of this machine's own, worth recording

**Batch 14's task 3 — this comparison — was added at 8:20 PM and this machine did not do it.** It read the batch
again after the 8:15 PM amendment but only looked at the tail of the section, so the new task above it was never
seen, and the batch was reported finished with two tasks of three.

Reading a changed batch means reading **the whole batch**, not the part that changed. The director caught it; it
should not have needed catching.

## work: finished — the release tier on Release-486. NOT TAGGED.

**544 passed, 1 failed, 2 flaky, 29 skipped of 576**, 37.2 minutes, exit 1. Commit `8463ac6af`, dev serving
`main-IORMDVQQ.js`. Posted on #1935
([comment](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1935#issuecomment-6281784854)).

**No `dev-*` tag was pushed**, as the batch directs: the condition was a clean pass, and the AVP popup failing
alone is explicitly not clean.

**The first run covering PR 1950's `<arcgis-map>` rehost with 1966 and 1967. Nothing failed that is attributable
to any of the three.**

| | |
| --- | --- |
| Failed | `directions.spec.ts:72`, the AVP popup, all three attempts — **#1951**, their server |
| Flaky | `search-sources.spec.ts:512` — **`TS_Main/6` answered `400 Unable to complete operation.`**, a *different* service failing the same way |
| Flaky | `lot-links.spec.ts:109` — Motorcycle Parking's `?lot=100j` opened **the main map's** lot on its first attempt, the symptom #1952 fixed, on a map in the working group |

Three questions for the director are in the report, with options: whether the `lot-links` flake blocks the
release (recommend no, file it Medium), whether `TS_Main/6` joins #1951 (recommend yes), and the tag (recommend
leaving it untagged and letting the maintainer judge promotion).

## Batch 14 task 1's placement amendment arrived after the merge

Home asked at 8:15 PM for #1954's notes entry to sit just above "Campus maps load only their own campus" and its
row **directly after** the Tailgating row. **PR 1967 was already merged by then** — `development`'s head is the
final build commit — so the branch no longer exists to amend.

What actually landed on `development`:

- **The entry is where home wants it**, immediately above "Campus maps load only their own campus".
- **The row is one line out**: it sits immediately *before* the Tailgating row rather than after it.

**Not fixed, deliberately.** Correcting one row's order would need a new pull request on top of the final build,
which would not be in tonight's release and would put a cosmetic change between the tested commit and production.
It is the director's call whether that is worth a follow-up tomorrow.

## work: finished — batch 14 task 1, #1954's images

On **PR 1967**, [comment 6279973563](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/1967#issuecomment-6279973563),
and committed to the branch as `155d90c6` with an `unreleased.md` entry and a *What to test on dev* row.

| | |
| --- | --- |
| Before | dev on Release-485: `?lot=100j` selects **26692**, an `H/C` space; the marker sits in open ground with nothing drawn under it |
| After | a local production build of the branch: the same link selects **32270**, an `M/C` space, and the marker sits on it |
| Image links | pinned to the full commit sha, both verified 200 before posting |

**Two things said on the PR rather than left to be assumed:** the after was built from `f02d607f0`, before the
branch's latest `development` merge (that merge is #1953, a different method, and does not touch the lookup); and
a link shared before a map's filter changed may now select nothing, which is the deliberate consequence.

**The branch head had moved** to `98ccf71a8` while the images were being taken, so the images were committed on
top of that rather than on the commit they were built from — pushing from the older commit would have dropped
home's merge.

## Batch 14 task 2: the release tier, not started

It waits for home to add the final build's commit and release number to the batch. Nothing on `0f69d3bac` was
tagged, and no quick tier ran on it, as the rewritten batch directs.

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
