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

## Batch 1 (prepared 18 October 2026)

1. **#1849: the release tier on dev's ArcGIS 5.0 build**
   - Goal: clear the dev build that carries ArcGIS 5.0.19 (#1861), with everything since `prod-2026-10-16`, for production.
   - Run:
     - Find dev's newest AggieMap build: the first release after Release-476 on Azure DevOps release definition 13. Read it
       with the `AZURE_DEVOPS_PAT` user environment variable if this machine has one; never print the token. Its commit
       must be `f800c2edf` (#1861) or later on `development`. If no such build is on dev yet, say so in the report and stop.
     - Put that commit in its own worktree and run `test/smoke/aggiemap/run-local.sh development release` from there.
       Nothing else heavy should run on this machine meanwhile.
   - Report on: #1849. Comment when it starts (release, build, commit), and post the result when it finishes. A
     status comment every few minutes while it runs is welcome.
   - Then: **if it passed**, run `scripts/tag-build.sh dev <full commit>` and `git push origin <tag>`. **If anything
     failed**, tag nothing; explain each failure by layer and cause, and say whether it also fails on production
     (`run-local.sh production` with `--grep` for just those tests) or appeared with this build.
