# Work machine: current tasks

You're on the `work-mailbox` branch of TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo, in a Claude Code session
on the maintainer's **work machine**. Its job is testing, so the home machine's resources stay free for
development (#1862). Read this file, do the current batch, report, and stop. The home session rewrites the batch for
each round; git history keeps the old ones.

**Read `DIRECTOR.md` at the top of this branch first, every time the branch changes.** It says which machine directs
(home, today) and what every listener does; its rules win over anything older below. In short, as the listener this
machine: never asks the maintainer anything, never offers or suggests work, and takes no decisions from him (if he
tells it something anyway, it does only that and records it under **Told directly**); files issues without a
priority, suggesting one in its report; starts every commit message with `work:`; and ends each turn with a
one-line status. The director's commits start with its own machine's name (`home:` today).

**Who does what (18 October, after both machines asked the maintainer the same questions):**
- **Only the home session asks the maintainer to decide anything.** This machine never asks him. Anything that
  needs a decision goes in the report under **Questions for the director**, each with options and a
  recommendation; the home session asks him once, and the answers come back in the next batch, under **Decided**.
- **`work/STATUS.md` says what this machine is doing, and only this machine writes it.** Update it and push it
  the moment anything starts or finishes: what is running, from which commit, started when (US Central), and for
  which task. The home session reads it before writing a batch or asking anything, and never runs or queues what it
  lists. The home session writes only `work/TASKS.md`; this machine writes only `work/STATUS.md` and its reports.
- **If the maintainer tells this machine something directly,** do it, and record it in `STATUS.md` straight away
  under **Told directly**: what he said, and when. Then the home session knows it has been answered and does not
  ask again.

**Say when you start, before anything runs (18 October).** The first thing for any batch, task, or anything the
maintainer asks for directly, is to update `STATUS.md` under **Running now** (what, which commit, started when in US
Central, for which task) and push it, with a commit message starting `work: started`. Only then start the run.
When it finishes, the same with `work: finished`. The home session watches this branch and tells the maintainer from
those two commits, so he never has to relay that something started or finished. A run that starts without that
push is invisible to the home session, which may then queue it again.

**Watch mode (18 October): keep checking for work until told to stop.** After a batch is done and its report
and `STATUS.md` are pushed, don't end the session. Watch this branch instead:
- Record in `STATUS.md` the number of the last batch done (`Last batch done: N`).
- Wait for the branch to change with one background command that exits on its own, for example
  `old=$(git ls-remote origin refs/heads/work-mailbox | cut -f1); until [ "$(git ls-remote origin refs/heads/work-mailbox | cut -f1)" != "$old" ]; do sleep 120; done`.
  When it exits, pull and read this file.
- A batch numbered higher than the last one done is new: do it, report, push, update `STATUS.md`, and watch again.
  Anything else (your own pushes, a change to an old batch) means watch again.
- **A heading `## Stop` in this file means stop:** finish nothing new, write `Stopped at <time>` in `STATUS.md`,
  push it, and end. The home session adds it only when the maintainer says the day's work is done.
- The home session watches the same branch, so a pushed report is read without the maintainer relaying it.
  He no longer needs to say "work report ready".

**Rules:**
- **Read CLAUDE.md on `development` first.** Its rules apply here as everywhere, in particular:
  - times in US Central, computed with PowerShell;
  - never pipe `nx` or a test run into `tail` or `grep`;
  - the repository is public: no customer names, keys, server names or internal addresses anywhere.
- **Do only this batch, then report and stop.** Don't start other work, or offer to.
- **Never touch production:** no deploy, no promotion, no approval. Production is the maintainer's.
- **Run tests from a checkout of the exact commit a task names,** in a worktree, not the main checkout.
- **Tags:** push a `dev-*` tag only when a task says so, with `scripts/tag-build.sh`, to `origin`. Push no other branches or tags.
- **On GitHub:** post status and results as comments on the issue a task names, and nowhere else. No pull requests, no merges.
- **Report here:** write `work/reports/<yyyy-mm-dd>-<n>.md` (n counts from 1 each day), then commit and push it to
  `work-mailbox`. Commit only that file. Never merge `work-mailbox` into anything, or anything into it.

  Cover each task: what ran, from which commit, the result per environment (passed, failed, flaky, skipped),
  each failure explained by layer and cause, the issue comments posted, and anything that could not be done.
  Put anything that needs deciding under **Questions for the director**, numbered, with lettered options and a
  recommendation. Don't ask the maintainer; the home session does.
- **Say "work report ready: <file>"** when done, then go back to watching (see Watch mode).

## Template for each task (the home session fills it in)

    N. **#<issue>: <one-line title>**
       - Goal: <what "done" looks like>
       - Run: <exact commands, environment, commit or how to find it>
       - Report on: <issue for live status and result>
       - Then: <tag or not, and anything else that follows>

## Batch 16 (20 October 2026, 12:25 AM Central) — after the capture, the release tier again on Release-486

Your #1951 note is read: the service answered 20 of 20 at 00:14. The maintainer has not answered tonight's questions
yet, so this follows the standing rule only: **a `dev-*` tag needs a clean release tier.**

**Decided** (the maintainer, 12:35 AM): **1A** Release-486 goes to production tonight once the notes (PR 1968) merge and
this re-run passes, without waiting to read batch 15's comparison; **3A** the Motorcycle Parking lot-link flake is #1969
(Medium), not a blocker; **4A** `TS_Main/6` is added to #1951 (done). So push this re-run's result the moment it lands.

**Changed at 12:40 AM:** the maintainer checks Release-486 by hand **in the morning** and promotes then if all is
well, so nothing is promoted tonight. This batch still runs overnight as written (the comparison, then the re-run,
tag on a clean pass): both results are wanted by morning. No hurry beyond that.

1. **When batch 15's capture and review have finished** (not before: nothing heavy beside it), re-poll the AVP query
   once. If it answers 20 of 20 again, run `test/smoke/aggiemap/run-local.sh development release` on Release-486
   (`8463ac6af`, still on dev; check the bundle is still `main-IORMDVQQ.js`). If it does not, skip the tier and say so.
   Report on: #1935.
2. **Tag only on a clean pass** (0 failed; flaky is acceptable if each flaky test is named with its cause):
   `scripts/tag-build.sh dev 8463ac6af99774e299cdaace8ce389b03af9d151`, then `git push origin <tag>`. Otherwise no tag.
3. Report both results together, whatever the hour. No production stage, no approval of anything in Azure.

## Batch 15 (19 October 2026, 9:20 PM Central) — the screenshot comparison on Release-486, now

Batch 14's report is read. **Batch 14 had a task 3** (added at 8:20 PM, after you took the batch): the maintainer's 1A,
the full screenshot comparison after the tier. It has not run, so it is this batch. Your three questions go to the
maintainer now; the answers come in the next batch.

1. **The full screenshot comparison** (report on: #1949)
   - `capture.mjs --env development --as production --release 8463ac6af`, then `review.mjs` against
     **`prod-2026-10-16-corrected`**, as for `8951a6364` this morning. Nothing else heavy beside it.
   - PR 1950 changes how every map is hosted, so the question is whether any map *looks* different: list every shot
     above 20%, and for each say whether it is the change, a mid-animation capture (re-take it), or the service.
   - Push the report when it lands, whatever the hour.

## Batch 14 (19 October 2026, 7:10 PM Central, replacing the 7:00 PM version) — #1954's images now, then one release tier tonight

**Decided** (the maintainer, at home, 7:05 PM):
- **1B: tonight's production build carries PR 1966 (#1960), #1954's PR and PR 1950 (#1949, `<arcgis-map>`), cleared by one
  release tier.** So **no quick tier on Release-485** (`0f69d3bac`, deploying to dev now): it is not the build going to
  production. He is checking Release-485 by hand meanwhile. **No tag on `0f69d3bac`.**
- **2A: #1954's pull request opens now**, and this machine adds its before/after images.
- #1963 is High; #1957 is Medium.

1. **#1954's before/after images** (report on: #1954)
   - Before: dev, once Release-485 is up, `https://dev.aggiemap.tamu.edu/parking/motorcycle-parking/map?lot=100j` - it selects
     space 26692, an `H/C` space the map does not draw. Crop to the map and popup.
   - After: a local production build of `fork/fix/1954-deep-link-respects-filter` (head `f02d607f0`), served as you served
     #1960's (nginx with `try_files`): the same link selects 32270, an `M/C` space.
   - Commit them to `docs/screenshots/1954-deep-link-respects-filter/` on that branch, add the `unreleased.md` entry and the
     What-to-test row, push to the fork, and put the pinned raw URLs on the PR (home opens it now; its number will be in
     `home/STATUS.md`). Same as you did for 1966.
   - **Where the notes go (7:35 PM), so tonight's three PRs merge without conflicts:** 1966's entry is first under
     Summary and its row first in What to test; 1950's are now just above "A Football Tailgating tent or zone link" and
     at the end of the table. Put #1954's **entry just above "### Campus maps load only their own campus"** and its **row
     directly after the "Tailgating tent and zone links finish drawing" row** - not at the top. The PR is **1967**; merge
     `origin/development` into the branch before you add them.
2. **When the maintainer has merged all three and the build reaches dev: the release tier** (report on: #1935)
   - home will add the commit and release number here when they exist; **don't start before that line appears.**
   - **The final build (8:15 PM): commit `8463ac6af99774e299cdaace8ce389b03af9d151`** (`development` with PRs 1950, 1966
     and 1967 merged). The maintainer's Azure build is running and he will release it to dev. **Start when a release
     whose build is from `8463ac6af` shows `GIS-1D Development` succeeded** (`az-releases.py`; probably Release-486), and dev
     serves a `main-*.js` other than Release-485's `main-CR5DN6UQ.js`. Push `work: started` first. Name the release in the report.
   - `test/smoke/aggiemap/run-local.sh development release`. Nothing else heavy beside it.
   - Tag `dev-*` on that commit only on a clean pass; #1951's AVP popup failing alone is not clean - report, don't tag.
3. **After the tier, the full screenshot comparison** (the maintainer's 1A, 8:20 PM; report on: #1949)
   - Only once task 2 has finished: nothing else heavy beside the tier.
   - `capture.mjs --env development --as production --release 8463ac6af`, then `review.mjs` against
     **`prod-2026-10-16-corrected`**, as for `8951a6364` this morning. PR 1950 changes how every map is hosted, so the
     question is whether any map *looks* different: say every shot above 20%, and for each whether it is the change, a
     mid-animation capture (re-take it), or the service.
   - Push the report when it lands, whatever the hour.

## Batch 13 (prepared 19 October 2026, morning) — pre-merge checks for today's release, as the director asks

**Decided** (the maintainer, 19 October): everything open goes into today's release, and the long tests run once,
on the final build. This machine takes over the **pre-merge full checks** from the home machine, so home's code work
and these checks run in parallel.

1. **Full checks of branches the director names, one at a time**
   - The director appends a line to this batch for each branch to check: `CHECK <branch>` (pushed to the
     maintainer's fork). For each, in order:
     `git fetch https://github.com/danielgoldbergtamu/Tamu.GeoInnovation.js.monorepo.git <branch>:<branch>`, then
     `git fetch origin`, then from Git Bash `scripts/check-in-volume.sh <branch>` (full affected), and read its exit code.
   - Push `work: checked <branch> exit <code>` to STATUS.md as soon as each finishes (with the failing targets if not
     0). The director acts on that line at once, so push each result immediately, not at the end.
   - `CHECK development` means: `git fetch origin` and check `origin/development`'s head the same way (make a local
     branch `chk/development` at it first). That is the check before the final build.
   - This batch stays open: after each check, watch for the next `CHECK` line. Batch 9 (the final test) still waits
     for the release the director names.

Queue:
- ~~CHECK refactor/1478-zoneless~~ withdrawn (the maintainer, 19 October): the remaining four PRs go in as one combined branch, `chore/1479-vitest`; its CHECK comes next. If this check has already started, finish it and report.
- CHECK chore/1479-vitest  (PR #1948, at b77b61426: Vitest + zoneless + Node 24 + the TypeScript 6.0 deprecations, combined; it runs on Node 24.22.0 as the branch's check script says)
- CHECK development  (at `8951a6364`, #1948 merged: the final release's code. The maintainer is already building it; report at once, since a failure stops the release to dev)

## Batch 12 (prepared 18 October 2026, about 9:30 PM) — now

**Decided** (the maintainer, on batch 11's question 1): don't move anything. Make a corrected **copy** of production's
set and compare against it. Batch 11's question 2 went onto #1937 as what the fix should be.

1. **#1937: a corrected copy of production's set**
   - Copy `production/prod-2026-10-16` to `production/prod-2026-10-16-corrected` (copy, never move or delete), then
     copy the four shots from `production/prod-2026-10-16-retake` over their counterparts in the copy, and its
     manifest with a note naming the four re-taken shots and why.
   - Re-run `review.mjs` for batch 10's comparison against the corrected copy, and say where the new page is.
   - **Batch 9's comparison uses `prod-2026-10-16-corrected` as its "before".**
   - Report on: #1937, briefly. Then watch for batch 9's release, which the director will name.

## Batch 11 (prepared 18 October 2026, about 9:15 PM) — now

**Decided** (the maintainer, on batch 10's questions): **1** the layer order on the parking maps is being checked on
the home machine now; if it is ours, it is fixed before the final build. **2** filed as #1936, High: a capture records
an error page as a good shot. **3** filed as #1937, Medium: two production shots were taken before the map drew, and
those two are re-taken now while production has not moved.

1. **#1937: re-take the two mid-load shots in production's set**
   - Run: production still serves `264eebb42` (`main-TK2R62YY.js`; confirm). Move the two mid-load shots (both
     viewports where affected) out of `production/prod-2026-10-16` into a `superseded/` folder beside it, then run the
     capture with `--env production --release prod-2026-10-16 --only <those routes>` so it re-takes only what is
     missing. Look at each new shot: the map drawn, nothing spinning. If one is still caught mid-load, wait and
     re-take it once more, and say so.
   - Then re-run `review.mjs` for batch 10's comparison so the page reflects the corrected shots.
   - Report on: #1937. Which pages, before and after, and the corrected difference for each.
   - Do not touch dev's set: dev has moved on from Release-482, so its three 404 shots cannot be re-taken under the
     same release; note them as known in the report.

## Batch 10 (prepared 18 October 2026, about 5:40 PM) — now, while batch 9 is held

**Decided:** the maintainer wants this machine used while the final build is prepared. Release-482 (`70f0e424b`,
tagged `dev-2026-10-18-3`) is on dev and carries nearly everything tonight's release will. The final build adds only
small changes (a legend fix, the parking maps' filter, the trip planner on dev only, an experiments back arrow,
Angular 22.2). So compare **now**, and anything significant is found hours before the final build.

1. **#1849: preview of the final comparison, on Release-482**
   - Run, from a worktree at `70f0e424b`:
     1. Dev's screenshot set as production renders it: the `tools/visual-baselines` capture with
        `--env development --as production --release dev-2026-10-18-3`.
     2. `node tools/visual-baselines/review.mjs` against production's `prod-2026-10-16` set (batch 5).
   - Report on: #1849, a section "Preview comparison on Release-482": how many shots differ, sorted by how much; for
     each of the most changed, what moved (layer, symbol, basemap, text, layout) and whether this release explains it
     (ArcGIS 4.27 to 5.1, Esri's zoom and locate buttons and our compass, campus maps without College Station's layers,
     the legend now listing switched-on layers). Put the comparison page where the maintainer can open it, and say
     where. List anything unexplained under **Questions for the director**.
   - Then: nothing to tag. If batch 9 is released (the director names its release) while this runs, finish this
     first; batch 9's own capture then only needs comparing against this set and production's.

## Batch 9 (prepared 18 October 2026, about 5:10 PM) — the final test, after batch 8 passes

**Decided** (the maintainer, 18 October): production waits for this. The final dev build is compared with what
production serves now; there should be no significant differences, and any there are, he wants to see.

1. **#1849: clear Release-482 (build 20261018.33, `70f0e424b`) for production**
   - **THE FINAL RELEASE (the director, 19 October morning): the release of `8951a6364` or later** — everything for today:
     #1944 and #1940–#1943, and #1948 (Vitest, zoneless, Node 24, the TypeScript 6.0 deprecations). Run this whole batch
     on it as soon as Azure lists it with its dev stage succeeded and the CHECK development above has passed, and
     **tag it** if the full tier passes outright. This replaces the rehearsal and the holds below.
   - **Overnight rehearsal (the director, about 9:40 PM, the maintainer asleep):** the build of `33da307ff` (#1930 and #1931
     merged) may reach dev tonight; the layer-order fix (#1939) will follow it in the morning. **If a release at `33da307ff`
     or later reaches dev tonight, run this whole batch on it now, as a rehearsal: the full tier, the capture and the
     comparison, exactly as below, but do not tag it** (it is not the build that ships). Report it as
     "Rehearsal on Release-<n>". The final clearance runs again on the release with #1939 in the morning, as its own
     batch. If no new release reaches dev tonight, wait.
   - **Still held (the maintainer, about 6 PM): the final build will carry #1912 (the trip planner on dev) and #1923
     (Angular 22.2.3) as well, about 1.5 hours away. The release building now (`af33dc01e`) is not the final one:
     do nothing with it. The director names the final release here.**
   - **Held (the maintainer, about 5:20 PM): do not start on Release-482.** A legend fix (#1871) goes into this
     release, so batch 9 runs on the release that carries it. The director will name that release here; until then,
     after batch 8, wait.
   - Run, from the worktree at `70f0e424b`, one after another, nothing else on this machine meanwhile:
     1. **The full tier:** `test/smoke/aggiemap/run-local.sh development full`. Report passed, failed, flaky and
        skipped, the duration, every failure by layer and cause, and whether the three `@heavy` tests passed on
        their first attempt.
     2. **Dev's screenshot set, as production renders it:** the `tools/visual-baselines` capture with
        `--env development --as production --release <the dev-* tag name step 4 will use, or the commit>` (#1885,
        merged as #1887). Not while the tier runs.
     3. **The comparison:** `node tools/visual-baselines/review.mjs <production/prod-2026-10-16-corrected> <development-as-production/...> <diffDir> <out.html>`.
        Report how many shots differ, sorted by how much, and for each of the most changed say what moved (layer,
        symbol, basemap, text, layout) and whether it is expected from this release (ArcGIS 4.27 to 5.1, Esri's zoom
        and locate buttons and our compass, campus maps without College Station's layers, the legend fix). Put the
        comparison page and its images where the maintainer can open them, and say where.
   - Report on: #1849, a new section "Final test of Release-482".
   - Then: **if the full tier passed outright**, `scripts/tag-build.sh dev 70f0e424b...` (full commit) and push the
     tag. Do not tag on a tier with failures, known or not; report them for the director. The comparison does not
     gate the tag; the maintainer judges it.

## Batch 8 (prepared 18 October 2026, about 4 PM) — after batch 7

**Decided:** #1673 (OnPush on the map, UES included, PR #1908) and #1905 (UES in CI, PR #1907) are merged.
- Batch 7's questions (the maintainer, about 4:20 PM): **1** filed as #1910, High: satellite campus maps load all of
  College Station's 26 layers, RNS Spaces' 44,980 points among them, which is what 5.1 is slow with; a fix is being
  made on the home machine. **2** not a probe fault: the probe lists all 26 layers on that page from a browser
  (`snapshot().layers`); the batch 7 script read the wrong field, so the suite's layer checks stand. **3** skipped.
- So in batch 8, a DC Bush School failure is #1910's, already known.
- (Added about 5 PM.) **#1910's fix (PR #1911) is merged at `70f0e424b`, and the maintainer is building it.** The build
  at `dfba74033` is being released to dev first. **Run batch 8 on the release at `70f0e424b`, not on `dfba74033`**: wait
  for it. On `70f0e424b` the DC Bush School test must pass; if it fails, it is a new failure, not a known one, and so
  are `campus-layers.spec.ts`'s three campus tests. A dev
build and the quick tier follow, then the maintainer looks at the map by hand on dev.

1. **#1673: the quick tier on dev's build with OnPush on the map**
   - Goal: the dev build of `development` at **`dfba74033`** or later passes the quick tier.
   - Run: when Azure lists a release at `dfba74033` or later with its dev stage succeeded (the maintainer is building it),
     from a worktree at that release's commit: `test/smoke/aggiemap/run-local.sh development quick`. Say what it
     chose to run.
   - Known: `/campus/dc-bush-school` and possibly `/map/d?bldg=0468` do not finish drawing on ArcGIS 5.1 under
     headless Chromium (batch 6, batch 7, #1867). If those are the only failures, report them as the known 5.1
     failures, separately from anything new.
   - Report on: #1673. Results; each failure by layer and cause; whether the `@heavy` tests passed first attempt.
   - Then: tag with `scripts/tag-build.sh dev <full commit>` only if the tier passed outright. If the only failures
     are the known 5.1 ones, do not tag; say so, and the director brings it to the maintainer.

## Batch 7 (prepared 18 October 2026, 3:40 PM) — next, before resuming batch 5 at full speed

**Decided:** batch 6's failure needs its cause before #1673 builds on 5.1. Short runs, minutes each.

1. **#1867: why `/campus/dc-bush-school` never finished drawing on Release-480 (ArcGIS 5.1)**
   - Goal: say whether it is ArcGIS 5.1 (software WebGL, #1867/#1897) or that campus's services (#1247, #1464,
     #1248), with evidence.
   - Run, from the worktree at `98c2056be`, pausing the capture as you did for batch 6:
     1. `test/smoke/aggiemap/run-local.sh development one "dc-bush-school" --retries=0` twice.
     2. `test/smoke/aggiemap/run-local.sh production one "dc-bush-school" --retries=0` once (production is on
        ArcGIS 4.34 and production's GIS services).
     3. On dev, load `/campus/dc-bush-school` once in the Playwright container and record, every 10 s for
        3 minutes, the map probe's `drawing` and which layer views are `updating`, with their feature counts
        (as the #1867 reproduction did), and the network requests that fail or never finish.
   - Report on: #1867. Which layer holds the view, and whether it is 5.1-specific.
   - Then: nothing to tag. Resume batch 5.

## Batch 6 (prepared 18 October 2026, afternoon) — after batch 5

**Decided:** ArcGIS 5.1 ships with this round (#1894 merged). A dev build and quick tier follow it.
- (Added 3:25 PM.) **The build is on dev: Release-480, build 20261018.27, `98c2056be`.** Besides 5.1 it carries #1892,
  #1893, #1900 (the zoom, locate and compass buttons found on ArcGIS 4.x or 5.x) and #1901 (the three contended
  tests, tagged `@heavy`, run last in their own project, two at a time). Run the tier from a worktree at
  `98c2056be`, so those suite changes are in it. Report whether the heavy tests passed on their first attempt and
  ran after everything else: that is #1716's first proof.

1. **#1867: the quick tier on dev's first ArcGIS 5.1 build**
   - Goal: the dev build of `development` at **`c03c56144`** (#1894) or later passes the quick tier.
   - Run: wait until Azure lists a release at `c03c56144` or later with its dev stage succeeded (the maintainer
     builds it; it may not exist yet when you read this; keep watching, as for a new batch). Then, from a worktree at
     that release's commit: `test/smoke/aggiemap/run-local.sh development quick`. Say what it chose to run.
   - Report on: #1867. Results, and each failure by layer and cause. Note any map that was slow to finish drawing:
     5.1 is known to be slow under software WebGL with large layers (#1867, #1897).
   - Then: **if it passed**, `scripts/tag-build.sh dev <full commit>` and push the tag.

## Batch 5 (prepared 18 October 2026, afternoon) — after batch 4

**Decided** (the maintainer, 18 October):
- (Added after batch 4's report.) **Start this batch now.** It was always the plan; nothing runs against
  production. This machine has had `AZURE_DEVOPS_PAT` since this morning: name releases and build numbers from
  Azure, and drop the older notes saying otherwise. Batch 4's three-attempt measurement is not needed for now.
- Production waits. Today's remaining modernization steps (ArcGIS 5.1, dead-code deletions, the #1716 fixes and
  OnPush on the map, #1673) merge first. **A dev build and quick tier follow each risky step** (5.1, then #1673);
  the home session will add each as its own batch when the build is on dev.
- **The final check compares the final dev build with what production serves now.** There should be no
  significant differences; any there are, the maintainer wants to see.

1. **Capture production's complete screenshot set now, as the "before"**
   - Goal: a full `tools/visual-baselines` set of production at `prod-2026-10-16` (production serves `264eebb42`,
     and will until the final promotion), so the final dev build can be compared with it tonight.
   - Run: from a worktree at `origin/development`, after batch 4 has finished (never while a suite runs against
     the same environment; see the tool's README): the README's capture command with `--env production`, no
     `--routes-only`. Let it default the release to `prod-2026-10-16`; confirm the manifest's bundle hash is
     production's. About two hours; it resumes if interrupted.
   - Report on: #1849, one comment when it starts and one when it finishes: shot count, any page that failed.
   - Then: nothing to tag. Keep the set; tonight's batch will compare against it.
   - Put it in `STATUS.md` while it runs.

## Batch 4 (prepared 18 October 2026, afternoon)

Batch 3 is done (report `work/reports/2026-10-18-3.md`): Release-479 passed and is tagged `dev-2026-10-18-2`.

**Decided** (the maintainer, on batch 3's questions):
- Batch 3's 1A: the popup and 3D records go on #1716, which becomes the next thing worked on. The home session
  posts that note; don't post it again.
- Batch 3's 2A: run the three flaky tests alone, with `one`, against `f800c2edf` and `86893756c` on this machine.
  **This machine is already running it**, so this batch only adds it to the record.
- Earlier, told to this machine directly: the production-stage cancellations are deliberate (`eb6318c2a`).

1. **#1716: the three flaky tests against two commits**
   - Goal: tell a slow machine from slow code for `popup.spec.ts` "clicking one building after another…",
     `perspective.spec.ts` "3D on every campus basemap" and `basemap-zoom.spec.ts` "…deepest zoom".
   - Run: as already started. If not started, for each commit (`f800c2edf`, `86893756c`), in its own worktree:
     `test/smoke/aggiemap/run-local.sh development one "<test name>"` for each of the three, one at a time,
     **with `--retries=0`**, three times each, so every attempt counts. Note: dev serves `86893756c`'s build, so
     both checkouts test the same deployed code; the comparison is of the tests and the machine, not of builds.
     Say so in the report.
   - Report on: #1716. Per test and commit: attempts passed of attempts run, and each failure's message.
   - Then: nothing to tag. Put `STATUS.md` in place first (see the rules) with this run in it.
