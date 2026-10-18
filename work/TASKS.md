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

## Batch 2 (prepared 18 October 2026, afternoon)

Batch 1 is done (report `work/reports/2026-10-18-1.md`). This machine has no `AZURE_DEVOPS_PAT`, so identify the build
from what dev serves, as batch 1 did. Name the commit, not a release number.

1. **#1849: the release tier on dev's build after the signals and OnPush pages**
   - Goal: clear the dev build of `development` at **`3cb5b6fdb`** (#1866) or later, for production. Since
     `dev-2026-10-18` it carries #1864 (OnPush on AggieMap's ten pages), #1865 (every remaining decorator input,
     output and query made a signal), #1866 (four new smoke checks that the view follows an interaction) and #1863 (docs).
   - Run:
     - Confirm dev serves a build of `3cb5b6fdb` or later. `git fetch` and read `development`'s head, then check that dev's
       deployed bundles differ from the `dev-2026-10-18` build: for example, a chunk name the earlier run recorded is no
       longer served. If dev still serves `f800c2edf`'s build, say so in the report and stop.
     - Put the commit dev serves in its own worktree and run `test/smoke/aggiemap/run-local.sh development release` from
       there. Nothing else heavy should run on this machine meanwhile.
   - Report on: #1849, as a new section headed "Release tier on the build after #1866". Comment when it starts
     (commit, how the build was identified) and when it finishes.
   - Then: **if it passed**, run `scripts/tag-build.sh dev <full commit>` and `git push origin <tag>`. Today's tag
     `dev-2026-10-18` already exists, so the script will choose the next name; record what it chose. **If anything
     failed**, tag nothing; explain each failure by layer and cause, and say whether it also fails on
     `dev-2026-10-18`'s commit (`run-local.sh development release --grep <test>` from a worktree at `f800c2edf`).
     The four new interaction tests (`legend.spec.ts` "a layer switched off and on…", `popup.spec.ts` "clicking one
     building after another…", `search.spec.ts` "searching "Wehner" then "Bonfire"…", `basemap-gallery.spec.ts`)
     run on dev for the first time here; report each one's result by name.
   - Also: compare this run's duration with batch 1's 41.6 minutes, to answer batch 1's decision 1.

