# Work machine: current tasks

You're on the `work-mailbox` branch of TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo, in a Claude Code session
on the maintainer's **work machine**. Its job is testing, so the home machine's resources stay free for
development (#1862). Read this file, do the current batch, report, and stop. The home session rewrites the batch for
each round; git history keeps the old ones.

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
  Put decisions for the maintainer as numbered decisions with lettered options, each with a recommendation.
- **Say "work report ready: <file>"** when done. The maintainer relays that to the home session.

## Template for each task (the home session fills it in)

    N. **#<issue>: <one-line title>**
       - Goal: <what "done" looks like>
       - Run: <exact commands, environment, commit or how to find it>
       - Report on: <issue for live status and result>
       - Then: <tag or not, and anything else that follows>

## Batch 3 (prepared 18 October 2026, afternoon)

Batch 2 is done (report `work/reports/2026-10-18-2.md`). Its finding, that the suite passed on an empty legend, is
answered by #1870, which is in this build. This machine has `AZURE_DEVOPS_PAT`: name the release, build and commit.

1. **#1849: clear the dev build of `86893756c` for production**
   - Goal: the dev build of `development` at **`86893756c`** (#1873) passes, gets a `dev-*` tag, and is the build
     the maintainer promotes. Since `3cb5b6fdb` it carries #1869 (All Maps: choosing a search result opens the map),
     #1870 (the main map's legend lists layers switched on) and #1873 (the `one` option for `run-local.sh`).
   - Run, from a worktree at `86893756c`, in this order:
     1. Wait until dev serves that build: Azure release definition 13 lists a release at `86893756c` with its dev
        stage succeeded, and dev's main bundle is no longer `main-LUOZGHMK.js`. If it is not there within two hours,
        report that and stop.
     2. The two fixes first, alone, so a failure is seen in minutes rather than after the whole tier:
        - `test/smoke/aggiemap/run-local.sh development one "loads hidden is listed"` (#1870's check; it failed on
          all three attempts against the previous build, as it should have);
        - `test/smoke/aggiemap/run-local.sh development one all-maps-search.spec.ts` (#1869's two checks).
        If either fails, report it and stop: do not run the tier.
     3. `test/smoke/aggiemap/run-local.sh development release`. Nothing else heavy on this machine meanwhile.
   - Report on: #1849, a new section headed "Release tier on the build after #1873": when it starts (release, build,
     commit), the two fixes' results, then the tier's result.
   - Then: **if everything passed**, `scripts/tag-build.sh dev <full commit>` and `git push origin <tag>`; record the
     tag name it chose. **If anything failed**, tag nothing; explain each failure by layer and cause.
   - Also report:
     - `popup.spec.ts` "clicking one building after another…": did it pass first time? It was flaky on batch 2's run
       (#1866 has the note); the maintainer chose to watch one more run before changing anything.
     - any test flaky again on `/map?bldg=0468`, and whether `perspective.spec.ts` was flaky a third time.
   - The duration needs no comparison; the question was dropped.
