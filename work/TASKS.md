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

## Batch 6 (prepared 18 October 2026, afternoon) — after batch 5

**Decided:** ArcGIS 5.1 ships with this round (#1894 merged). A dev build and quick tier follow it.

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
