# Work machine: current tasks

You're on the `work-mailbox` branch of TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo, in a Claude Code session
on the maintainer's **work machine**. Its job is testing, so the home machine's resources stay free for
development (#1862). Read this file, do the current batch, report, and stop. The home session rewrites the batch for
each round; git history keeps the old ones.

**Who does what (18 October, after both machines asked the maintainer the same questions):**
- **Only the home session asks the maintainer to decide anything.** This machine never asks him. Anything that
  needs a decision goes in the report under **Questions for the home session**, each with options and a
  recommendation; the home session asks him once, and the answers come back in the next batch, under **Decided**.
- **`work/STATUS.md` says what this machine is doing, and only this machine writes it.** Update it and push it
  the moment anything starts or finishes: what is running, from which commit, started when (US Central), and for
  which task. The home session reads it before writing a batch or asking anything, and never runs or queues what it
  lists. The home session writes only `work/TASKS.md`; this machine writes only `work/STATUS.md` and its reports.
- **If the maintainer tells this machine something directly,** do it, and record it in `STATUS.md` straight away
  under **Told directly**: what he said, and when. Then the home session knows it has been answered and does not
  ask again.

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
  Put anything that needs deciding under **Questions for the home session**, numbered, with lettered options and a
  recommendation. Don't ask the maintainer; the home session does.
- **Say "work report ready: <file>"** when done. The maintainer relays that to the home session.

## Template for each task (the home session fills it in)

    N. **#<issue>: <one-line title>**
       - Goal: <what "done" looks like>
       - Run: <exact commands, environment, commit or how to find it>
       - Report on: <issue for live status and result>
       - Then: <tag or not, and anything else that follows>

## Batch 5 (prepared 18 October 2026, afternoon) — after batch 4

**Decided** (the maintainer, 18 October):
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
