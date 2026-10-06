# Cloud session: current tasks

You're on the `cloud-mailbox` branch of TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo. Read this file, do
the current batch, then report and stop. The desktop session rewrites the batch for each round; git history
keeps the old ones.

**The rules are in CLAUDE.md on `development`, section "The cloud session".** Read it first; it's the only
place they're kept. In short:
- do only this batch;
- file what you find as issues right away;
- no comments, PRs or merges;
- one `cloud/<issue>-<topic>` branch per issue, from the latest `development`, with a `.pr-body.md` last commit;
- no `development` merges;
- no `Claude-Session:` lines in commit messages;
- the repo is public: no customer names, keys, server names or internal addresses anywhere;
- **write your report here:** `cloud/reports/<yyyy-mm-dd>-batch-<letter>.md`, committed and pushed to
  `cloud-mailbox` (only that file). Cover each branch, its state and checks, the issues you filed with suggested
  priorities, anything you couldn't do, and the questions for Dan, as numbered decisions with lettered options
  (each saying in plain words what happens) and a recommendation. The desktop session reads it there;
- say "branch ready: <names>".

## Template for each item (the desktop session fills it in)

    N. **#<issue> (<priority>): <one-line title>**
       - Goal: <one or two sentences: what "done" looks like>
       - Where: <apps, libs, files, earlier PRs to follow>
       - Decided: <Dan's decisions that apply; "none" if none>
       - Tests: <tests expected>
       - Don't touch: <files or areas other work is changing>

## Batch A (prepared 5 October 2026)

Write your report to `cloud/reports/<yyyy-mm-dd>-batch-a.md` on this branch when done (see the header).
Times in the report are US Central, with the zone named.

1. **#1426 (Medium): Make the AggieMap smoke suite fast enough to gate a release**
   - Goal: the full suite against dev in about 10 to 15 minutes of wall clock instead of about 1 h 45 min,
     with the same checks before a release and the same failures caught. Measured before and after.
   - Where: `test/smoke/aggiemap/` (above all `framing.spec.ts` and its settle and probe waits),
     `playwright.aggiemap-smoke.config.ts`, `test/smoke/aggiemap/environments.json`,
     `.github/workflows/aggiemap-smoke.yml`, `docs/testing.md`, `docs/build-times.md` ("Smoke suite runs").
     Read #1426 and #1380 first.
   - Decided:
     - **Framing covers one route per map when a release is checked** (about 52 of the 412 routes; the
       other ~360 are the same maps opened with different builder choices). **The scheduled daily run on
       GitHub keeps all 412.** Choose by an environment variable or a project in the config, the way the
       suite already chooses by environment; don't fork the spec.
     - **6 workers for local runs** (CI stays 4 unless the measurements say otherwise). If 6 makes the GIS
       services time out on dev, compared with the "before" run below, drop to 4 and say so.
     - **Cache the ArcGIS SDK between tests** (`page.route` serving `js.arcgis.com` from a cache), and
       **replace the fixed 1000 ms waits with polling** (the settle loop's three readings, and the probe-ready
       wait). Test isolation stays: a fresh context per test is fine; only the SDK download is shared.
   - Before (measured 5 October 2026, 22:10 Central, home workstation, 2 workers, against dev): about
     770 tests; 164 min of test time; framing 416 tests, 113 min (69%), 16.3 s each; maps 35 tests,
     17 min; event-dates 68 tests, 13 min. Wall clock about 1 h 50 min.
   - Tests: run the suite against dev (`https://dev.aggiemap.tamu.edu`) after the change, with the same
     settings `test/smoke/aggiemap/run-local.sh` takes from `environments.json` (it passes them as
     environment variables to `playwright test --config=playwright.aggiemap-smoke.config.ts`; you may not
     have Docker, so run Playwright directly). Record start and end clock times, workers, test counts and
     failures in `docs/build-times.md`. Every failure must be one that also fails on plain `development`
     (run that spec there to show it), or explained.
   - Don't touch: anything outside the files above.

2. **#1456 (High): Run the full smoke suite on dev for the Angular 21 upgrade**
   - Goal: the full suite, as it is on `development` (not your #1426 branch), against dev once dev serves
     Angular 21, with every failure explained. This clears Angular 21 for the dev tag.
   - Where: check first that dev serves Angular 21: one of the JavaScript chunks linked from
     `https://dev.aggiemap.tamu.edu/` contains `ng-version` and a `"21.` version string. If it is still
     `"20.`, don't run the suite: say so in the report and stop on this item.
   - Decided: known failures, not caused by the upgrade: `/events/mens-basketball` (its service answers
     "499 Token Required", #1431), in both the framing and maps specs. Anything else is new.
   - Tests: the whole suite, settings as in item 1. Report passed/failed/flaky/skipped, the start and end
     clock times, and each failure with its error and whether it also fails on production
     (`https://aggiemap.tamu.edu`, by rerunning just that test there). Run this item **before** item 1's
     after-run, so the two runs don't share dev at once. Don't commit anything for this item except the
     report; the desktop session records the timing.
   - Don't touch: no branch for this item.

**Don't touch, for the whole batch:** `chore/1456-angular-21` (PR #1465), `feat/1463-campus-building-popup`
(the satellite campus building popup), and everything under `libs/` and `apps/`.
