# Build times

How long things take here, recorded as they are run, so that a change meant to make the work faster
can be shown to have done it.

**Since #1593 the scripts record their own runs**, one small file each, in
[`build-times/runs/`](build-times/runs): `scripts/check-in-volume.sh` and
`test/smoke/aggiemap/run-local.sh` write the start in US Central, the machine
(`BUILD_TIMES_MACHINE`, or `unspecified`), what ran, the exit code and totals, the elapsed time and, for
a check, the clone and `npm ci` times. Commit the file each run writes with your work, and read them as
one table with `bash scripts/run-times-report.sh`. This page keeps the runs nothing
records by itself, and the context and analysis: what a comparison shows and why. The tables below are
the history recorded by hand before that.

**The rule: every check, build, install or deploy records its elapsed time**, whatever its length
(#1415): in `build-times/runs/` when a script wrote it, here otherwise. Recording everything is deliberate for now, and can be trimmed back if the table
becomes unwieldy. The scripts already print the elapsed time, so the measurement is free; what is
not free is remembering a number that was only ever on screen.

A single duration says very little. The same run measured before and after a change is what shows
whether the work paid off, so **record the "before" even when nothing is being optimised** - that is
the measurement that cannot be taken later.

## How to record one

Add a row. Keep the newest at the top of its section.

- **Date** - the day it ran.
- **Machine** - office or home. They differ: the home machine has 20 CPUs and 31 GB.
- **What ran** - the command or the step, specifically enough to repeat it.
- **Approach** - what makes this run different from another of the same thing: bind mount or Docker
  volume, cold or warm, webpack or esbuild, contended or quiet.
- **Elapsed** - wall clock. Say if the machine was doing something else at the time; a contended run
  is still worth recording, but it is not comparable.

**Any clock time written here is US Central**, with the zone named — a start, a finish, or the time
of day a run was taken. Elapsed durations are just durations and need no zone. `TZ=America/Chicago`
does not work in Git Bash on these machines and silently returns UTC; CLAUDE.md gives the PowerShell
call that does convert (#1423).

Anything unusual goes in a note under the table rather than being squeezed into a cell.

## Checks and builds

| Date | Machine | What ran | Approach | Elapsed |
| --- | --- | --- | --- | ---: |
| 9 Oct 2026 | home | `check-in-volume.sh fix/1475-check-script-lint-and-smoke` (affected; nothing affected, no tasks), 7:25 PM Central | volume, fresh clone 38 s, `npm ci` 67 s | 1 min 56 s |
| 9 Oct 2026 | home | The new script on a throwaway branch touching `oidc-provider-nest`: lint ran (CI lints it), test and build excluded | volume, warm | 10 s |
| 9 Oct 2026 | home | `check-in-volume.sh feat/1587-football-lots-live-status ts-events-ngx,ts-events-angular,aggiemap-angular` (bug-fix style) | volume | Nx 42.7 s |
| 9 Oct 2026 | home | `check-in-volume.sh chore/1545-remove-cypress` (affected, 108 projects), lock without Cypress, 6:53 PM Central | volume, clean `npm ci` 62 s (2,245 packages) | **6 min 39 s** (Nx 5 min 32 s) |
| 9 Oct 2026 | home | The same, first lock resync, which still installed Cypress as an optional peer, 6:45 PM Central | volume, fresh clone, clean `npm ci` 93 s (2,307 packages) | 7 min 15 s |
| 8 Oct 2026 | home | `check-in-volume.sh chore/1236-remove-ring-day-app` (affected, 110 projects, 230 tasks), 3:57 to 4:03 PM Central | volume, cold clone and `npm ci` (59 s) | 6 min (Nx 4 min 28 s) |
| 8 Oct 2026 | home | `check-in-volume.sh fix/1577-basemap-max-zoom` (5 projects) | volume, cold clone | passed |
| 8 Oct 2026 | home | `check-in-volume.sh fix/1576-dining-aggieprint-icons` (3 projects) | volume, cold clone | passed |
| 8 Oct 2026 | Kaleb's laptop | `check-in-volume.sh feat/tailgating-readable-links` (affected: ts-events-ngx, aggiemap-ngx-discover, aggiemap-ngx-core, aggiemap-angular, ts-events-angular, ts-events-angular-e2e), 14:20 Central | volume, warm, 6 projects | **1 min 13 s** |
| 8 Oct 2026 | home | `check-in-volume.sh refactor/1568-prune-ng-modules` (affected, 67 projects, 140 tasks), rebased on `development` after #1572 | volume, cold cache | **2 min 55 s** |
| 8 Oct 2026 | home | NgModule prune (`--mode=prune-ng-modules`) over the whole workspace, one run | volume | ~6 min |
| 8 Oct 2026 | home | NgModule prune run library by library, 16 paths (abandoned: it missed importers outside each path) | volume | 27 min |
| 8 Oct 2026 | home | `check-in-volume.sh refactor/standalone-bootstrap-rest` (#1567, affected, 54 projects, 114 tasks) | volume, cold cache | 2 min 8 s |
| 8 Oct 2026 | home | `check-in-volume.sh refactor/1563-standalone-bootstrap` (affected, 45 projects) | volume, cold cache | 2 min 22 s |
| 8 Oct 2026 | home | `check-in-volume.sh refactor/1564-standalone-remaining` (affected, 48 projects) | volume | 1 min 56 s |
| 8 Oct 2026 | home | Standalone bootstrap migration (`--mode=standalone-bootstrap`), per app | volume | ~1 min 40 s each |
| 7 Oct 2026 | Kaleb's laptop | `check-in-volume.sh fix/tailgating-simpson-tents ts-events-ngx,aggiemap-angular` (lint, test, build), 12:45 Central | volume, cold clone and `npm ci` (27 s of it), 2 projects | **55 s** |
| 6 Oct 2026 | office | `check-in-volume.sh feat/1508-service-symbology` (affected), deleting 90 hard-coded renderers across 42 files, 17:12 Central | volume, cold clone and `npm ci` | 6 min, **failed**: a scripted edit dropped three `commonLayerProps` imports still in use (8 suites, `ReferenceError`) |
| 6 Oct 2026 | office | The same check after the import fix, plus 71 titles removed, 17:35 Central | volume, warm | 5 min, **failed**: `LayerSource.title` was required, so TS2322 in `aggiemap-angular` and `ts-events-angular` |
| 6 Oct 2026 | office | `check-in-volume.sh feat/1508-service-symbology aggiemap-angular,ts-events-angular,common-types`, confirming the optional-title fix before repeating the full run, 17:41 Central | volume, warm, 3 projects | **1 min** |
| 6 Oct 2026 | office | The full affected check, passing: 47 projects, 99 tasks, 17:44 Central | volume, warm | **5 min** |
| 6 Oct 2026 | office | The same check again after merging the day's four merged PRs into the branch, 17:52 Central | volume, warm | **4 min** (nx run duration 4 min 15 s) |
| 6 Oct 2026 | office | Full smoke suite against dev, the 6 October release (`0c8b12df`, `main-QFOMWXNR.js`, `dev-2026-10-06-3`), 6 workers, 11:51:12 to 12:20:47 Central | 421 passed, 1 failed, 14 skipped of 436 | **29 min 24 s** |
| 6 Oct 2026 | office | The same suite's one failure re-run alone, machine quiet: `/map loads and serves its layers` | passed in 43.8 s; it had timed out at 120 s under the full run's load | **1 min 42 s** |
| 6 Oct 2026 | office | `check-in-volume.sh fix/1497-portal-symbology` (affected), a shared-library change: 87 tasks, 41 projects, 0/87 cache hits | all passing | **3 min 5 s** |
| 6 Oct 2026 | office | `check-in-volume.sh batch/2026-10-06-verify` (affected), the 8-change batch: 29 tasks, lint+test+build, 14 projects, 0/29 cache hits, 09:39 Central | volume, warm clone, cold Nx cache | **1 min 25 s** |
| 6 Oct 2026 | office | The same check, second of three runs, 09:05 Central (one spec failing: a test fixture, not the app) | volume, warm clone | 1 min 25 s |
| 6 Oct 2026 | office | `npm ci` into the dev server's `tamu-js-dev-nm` volume, 2,318 packages, after it was found two upgrades stale (Angular 19.2.9 against the checkout's 22.1.8) | bind-mounted source, volume `node_modules` | **1 min 28 s** |
| 6 Oct 2026 | office | `nx build aggiemap-angular`, to serve a built app for before/after captures because `nx serve` cannot boot it (#1485) | bind-mounted source, volume `node_modules` | **30 s**, and 33 s on a second run |
| 6 Oct 2026 | home | `check-in-volume.sh chore/1469-angular-22 all`, Angular 22 after its fixes (246 tasks, 0 failed) | volume, warm cache | **3 min 38 s** |
| 6 Oct 2026 | home | `check-in-volume.sh chore/1469-angular-22 all`, run 3 (18 lint failed: rules still on in 15 projects) | volume | 3 min 36 s |
| 6 Oct 2026 | home | `check-in-volume.sh chore/1469-angular-22 all`, first run to reach the tasks (77 failed: 74 lint, 3 build; 0 test) | volume, Nx cache cold | **3 min 1 s** |
| 6 Oct 2026 | home | `nx migrate --run-migrations`, Angular 22 (47 migrations, 1,037 files) | volume, machine otherwise idle | **28 min 50 s** |
| 6 Oct 2026 | home | `nx migrate 23.2.1` | volume | 46 s |
| 5 Oct 2026 | home | `check-in-volume.sh chore/1456-angular-21 all`, Angular 21 after its fixes (246 tasks, 0 failed) | volume, warm cache | **3 min 5 s** |
| 5 Oct 2026 | home | `check-in-volume.sh chore/1456-angular-21 all`, run 4 (3 failed: lightgallery under Jest 30) | volume | 4 min 11 s |
| 5 Oct 2026 | home | `check-in-volume.sh chore/1456-angular-21 all`, run 2 (24 failed: a fix script's own mistake) | volume | 5 min 1 s |
| 5 Oct 2026 | home | `check-in-volume.sh chore/1456-angular-21 all`, Angular 21 after its migrations (246 tasks; 41 failed) | volume, Nx cache cold; a full dev smoke run going | **7 min 7 s** |
| 5 Oct 2026 | home | `nx migrate --run-migrations`, Angular 21 (25 migrations, 447 files) | volume; a full dev smoke run sharing the machine | **39 min 45 s** |
| 5 Oct 2026 | home | `nx migrate 22.7.12` | volume | 40 s |
| 5 Oct 2026 | home | Smoke `--grep "development-only"` on production after the #1460 fix (6 passed) | Playwright container, `node_modules` in a volume; alongside the dev run below | **1 min 37 s** |
| 5 Oct 2026 | home | Smoke `--grep "development-only"` on dev after the #1460 fix (6 passed) | Playwright container, `node_modules` in a volume; alongside the production run above | **1 min 29 s** |
| 5 Oct 2026 | home | Smoke `--grep "development-only"` on dev before the #1460 fix (3 passed, 2 failed on the Tailgating zones, each retried twice) | Playwright container, `node_modules` in a volume; a full dev smoke run going | **6 min 6 s** |
| 5 Oct 2026 | home | `check-in-volume.sh chore/1447-angular-20 all` after the fixes (246 tasks, 0 failed; 70 from cache) | volume, warm | **4 min 9 s** |
| 5 Oct 2026 | home | `check-in-volume.sh chore/1447-angular-20 all`, Angular 20 after its migrations (246 tasks; 71 failed) | volume, Nx cache cold; a GitHub smoke run going | **6 min 22 s** |
| 5 Oct 2026 | home | `nx migrate --run-migrations`, Angular 20 (28 migrations, 371 files) | volume | **8 min 55 s** |
| 5 Oct 2026 | home | `nx migrate 21.6.11` | volume | 39 s |
| 5 Oct 2026 | home | `check-in-volume.sh chore/1448-prettier-3 affected` (lint, test, build; 118 projects, 246 tasks, 0 failed) | volume, Nx cache cold; `npm ci` (60 s) included; a GitHub smoke run going, nothing heavy locally | **6 min 24 s** |
| 5 Oct 2026 | home | Prettier 3.9.9 `--list-different` over the whole repository (400 files would change) | volume | 23-27 s |
| 5 Oct 2026 | home | Prettier 2.8.8 `--list-different` over the whole repository (241 files would change) | volume | 26 s |
| 5 Oct 2026 | home | Prettier 3.9.9 `--write` on the 160 files only it changes | volume | 3 s |
| 5 Oct 2026 | office (GEOG-CSA305C-02) | `check-in-volume.sh feat/tailgating-map` (affected: lint, test, build, 17 projects, 3 apps) | volume, cold: clone and `npm ci` (28 s) included | 1 min 54 s |
| 5 Oct 2026 | office | `check-in-volume.sh … aggiemap-ngx-common` (lint, test) | volume, warm, after a one-line change | **12 s** |
| 5 Oct 2026 | office | `check-in-volume.sh … aggiemap-ngx-common` (lint, test) | volume, cold: clone and `npm ci` included | 2 min 23 s |
| 5 Oct 2026 | office | `check-in-volume.sh … aggiemap-angular` (lint, test, build) | volume, warm | 2 min 06 s |
| 5 Oct 2026 | office | `aggiemap-angular` production build alone, inside the run above | esbuild `application` builder | 11.7 s |
| 5 Oct 2026 | office | `check-in-volume.sh … affected` on a docs-only branch | volume, cold; 0 projects affected | 2 min 02 s |
| 2 Oct 2026 | office | `nx affected -t lint,test,build`, 4 projects | bind-mounted Windows checkout | 12 min 08 s |

The 12-second row is the one that changed how the work feels: a real edit-to-verdict cycle on a
library, against a 12-minute affected run three days earlier. The two are not the same scope - 1
project against 4 - so the controlled comparison is the `npm ci` pair below, not these.

The docs-only row is worth keeping as a reminder that **exit 0 with "No tasks were run" is not a
pass**. That run was correct, because a branch touching only `docs/*.md` affects no projects, but the
same output appears when the graph fails to compute. Read the log, not the exit code.

## Installs

| Date | Machine | What ran | Approach | Elapsed |
| --- | --- | --- | --- | ---: |
| 6 Oct 2026 | home | `npm ci` after the Angular 22 migrations (lock unchanged) | clean, from only `package.json` and the lock | 51 s |
| 6 Oct 2026 | home | `npm ci`, Angular 22 install proof | clean, from only `package.json` and the lock | 48 s |
| 6 Oct 2026 | home | `npm install`, Angular 22's new versions | into the `tamu-js-ng22` Docker volume | **53 s** |
| 6 Oct 2026 | home | `npm ci`, Angular 21 baseline before the Angular 22 migrate | volume | 1 min 4 s |
| 5 Oct 2026 | home | `npm ci` into the new `tamu-js-1456` volume, Angular 21 | check script, clean volume | 1 min 42 s |
| 5 Oct 2026 | home | `npm ci` after the Angular 21 migrations (lock unchanged) | clean, from only `package.json` and the lock | 1 min 35 s |
| 5 Oct 2026 | home | `npm ci`, Angular 21 install proof | clean, from only `package.json` and the lock | 47 s |
| 5 Oct 2026 | home | `npm install`, Angular 21's new versions | into the `tamu-js-ng21` Docker volume | **60 s** |
| 5 Oct 2026 | home | `npm ci`, Angular 20 baseline before the Angular 21 migrate | volume | 54 s |
| 5 Oct 2026 | home | `npm ci` from the resynced lock after the Angular 20 migrations | clean, from only `package.json` and the lock | 68 s |
| 5 Oct 2026 | home | `npm ci`, Angular 20 install proof | clean, from only `package.json` and the lock | 55 s |
| 5 Oct 2026 | home | `npm install`, Angular 20's new versions | into the `tamu-js-1447` Docker volume | **58 s** |
| 5 Oct 2026 | home | `npm ci` after the Prettier 3 bump (lock proof and install) | into the `tamu-js-1448` Docker volume | **59 s** |
| 5 Oct 2026 | home | `npm ci`, Angular 19 baseline for the Angular 20 upgrade (#1447) | into the `tamu-js-1447` Docker volume | **62 s** |
| 5 Oct 2026 | office | `npm ci` | into the `tamu-js-dev-nm` Docker volume | **4 min 45 s** |
| 5 Oct 2026 | office | `npm ci` | into the bind-mounted Windows checkout | **13 min 56 s** |

Those two ran on the same machine, from the same lock file, within the same hour: **2.9 times
faster** in a volume, with everything else held constant. This is the cleanest before-and-after on
record for the volume work (#1402), because nothing but the destination differed.

## Dev servers

| Date | Machine | What ran | Approach | Elapsed |
| --- | --- | --- | --- | ---: |
| 5 Oct 2026 | office | `nx serve aggiemap-angular` to first answer on `:4200` | Angular 19, Vite dev server, volume `node_modules` | 5 min 02 s |

## Azure builds

Recorded per stage rather than as one number, because a single total cannot show where the time
goes or which change moved it. **No Azure DevOps access is needed** - GitHub carries a start and an
end for every stage:

```
gh api repos/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/commits/<sha>/check-runs \
  --jq '.check_runs[] | "\(.name)  \(.started_at)  \(.completed_at)"'
```

### 5 October 2026, build on `7e1aa0fc` (the release candidate carrying #1413 and #1415)

| Stage | Elapsed |
| --- | ---: |
| **Monorepo, the whole build** | **5 min 47 s** |
| Setup Last SHA | 14 s |
| Dependencies Cache or Restore | 37 s |
| Lint Lint Affected | 1 min 23 s |
| Build development | 3 min 19 s |
| Build production | 3 min 24 s |
| Tag Add Build Tags | 48 s |
| GitHub `Lint / Affected` | 31 s |
| GitHub `Build / Affected` | 1 min 31 s |

**Do not add the stage times up.** Build development and Build production start one second apart and
run in parallel, as do the two GitHub checks, so the whole build is well under their sum.

This is the first build recorded with the esbuild `application` builder (#1403). The next one
recorded here can be compared stage by stage: a change to how the apps are built should move Build
development and Build production and leave Setup and Dependencies alone.

### The whole history, from Azure directly

Per-build totals can be pulled from Azure DevOps with the read-only PAT on the work machines. This
is how the table below was produced, and how to regenerate it rather than typing numbers by hand:

```bash
PAT=$(tr -d '\r\n' < /c/TAMU/gsvcs-local-secrets/ado_pat.txt)
AUTH=$(printf ":%s" "$PAT" | base64 -w0)
ORG=tamugeoinnovation
PROJ=d752bbdb-b2f5-492d-b50c-8817f8804ce8
curl -s -H "Authorization: Basic $AUTH" \
  "https://dev.azure.com/$ORG/$PROJ/_apis/build/builds?definitions=19&\$top=200&queryOrder=finishTimeDescending&api-version=7.1"
```

`$top` caps at 200, so older history needs `minTime` and `maxTime` windows. Azure retains about two
weeks; 21 September is as far back as it goes.

**287 successful builds, 21 September to 5 October**, median 5.6 minutes
overall, fastest 1.8, slowest 28.5:

| Day | Builds | Median | Fastest | Slowest |
| --- | ---: | ---: | ---: | ---: |
| 2026-09-21 | 2 | 9.6 | 5.6 | 13.7 |
| 2026-09-22 | 2 | 8.6 | 8.3 | 8.9 |
| 2026-09-23 | 2 | 10.3 | 5.5 | 15.1 |
| 2026-09-24 | 6 | 9.0 | 5.9 | 14.3 |
| 2026-09-25 | 20 | 5.9 | 2.9 | 13.0 |
| 2026-09-26 | 5 | 8.3 | 3.0 | 8.6 |
| 2026-09-27 | 9 | 8.8 | 3.7 | 12.3 |
| 2026-09-28 | 48 | 4.6 | 1.9 | 14.7 |
| 2026-09-29 | 11 | 4.9 | 1.8 | 9.1 |
| 2026-09-30 | 33 | 4.8 | 2.2 | 10.0 |
| 2026-10-01 | 28 | 7.6 | 2.6 | 18.9 |
| 2026-10-02 | 44 | 6.0 | 2.1 | 28.5 |
| 2026-10-03 | 6 | 11.7 | 2.1 | 15.5 |
| 2026-10-04 | 33 | 2.9 | 2.0 | 13.9 |
| 2026-10-05 | 38 | 4.9 | 2.1 | 15.4 |

**This is not a trend line, and should not be read as one.** A build's duration depends on what that
commit affected, so a day's median mostly reflects what was being worked on. Reading an esbuild win
into 4 October against 5 October would be wrong in both directions: esbuild only merged on
5 October, and 5 October is the slower of the two by that measure.

What the table is good for is spotting a day that is out of character, and giving a baseline that a
deliberate change can be measured against stage by stage.

**Cross-checked against a second source.** Azure reports build 20261005.12 as 5.8 minutes; the same
build derived from GitHub's check-runs came to 5 min 47 s. Two independent routes agreeing is what
makes both methods here trustworthy.

## Releases

The Azure DevOps release that puts a build on dev or on production. These are **not** visible in
GitHub's checks - only the build is.

They cannot currently be pulled from Azure either. The Release Management API answers **HTTP 401**
with the PAT described above:

```
https://vsrm.dev.azure.com/tamugeoinnovation/<project>/_apis/release/deployments?definitionId=13
```

The PAT carries Build (read) but not **Release (read)**. Adding that scope would let these be
pulled directly and is the one thing standing between this table and filling itself in. Until then
the numbers have to come from whoever ran the release.

| Date | Release | Build | Elapsed |
| --- | --- | --- | ---: |
| 5 Oct 2026 | to dev | 5 October candidate on `7e1aa0fc` | to record |
| 5 Oct 2026 | to production | the same build | to record |

## Smoke suite runs

The longest-running thing here. A run against a deployed environment loads every map and checks
every layer, so its duration says as much about the GIS services as about this code.

| Date | Machine | Environment | Result | Elapsed |
| --- | --- | --- | --- | ---: |
| 9 Oct 2026 | home | production, `build-banner.spec.ts` only, from a worktree with no `node_modules` (#1459): first run installing the three packages into the volume / packages already there / a brand-new volume | 1 passed each time | 19 s / 14 s / 16 s |
| 8 Oct 2026 | home | **production**, `a4e04a7b` (build 20261008.15: the standalone work, #1571, #1579, #1580), release scope, 6 workers, 4:07:46 PM to 4:27:25 PM Central; cleared the 8 October release, tagged `dev-` and `prod-2026-10-08` | 397 passed, 0 failed, 0 flaky, 24 skipped, of 421 | **19 min 39 s** |
| 8 Oct 2026 | home | local dev server, #1568 branch rebased on `development` (all the standalone work and #1571), release scope, 6 workers, about 11:25 AM to 11:55 AM Central | 428 passed, 1 failed (build banner, local only), 1 flaky (bus route 48), 30 skipped | **28.2 min** |
| 8 Oct 2026 | home | local dev server, #1563 branch (AggieMap bootstrapped standalone), release scope, 6 workers, morning | 405 passed, 1 failed (build banner, local only), 30 skipped | 22.1 min |
| 7 Oct 2026 | cloud (4 CPUs) | dev; **`bus.spec.ts` alone, #1473 branch**, one test per route, **2 workers**, 11:09:26 to 11:20:02 PM Central; CPU load about 10 | 26 passed, 0 failed; 48 s median per route test (23 to 61 s) | **10 min 36 s** |
| 7 Oct 2026 | cloud (4 CPUs) | dev; `bus.spec.ts` alone, #1473 branch, 6 workers, 11:00:10 to 11:09:06 PM Central; CPU load about 35 | 24 passed, 2 flaky (routes 01 and NW4041 timed out at 120 s twice, passed on the third try), 0 failed; 80 to 130 s per route test | 8 min 56 s |
| 7 Oct 2026 | cloud (4 CPUs) | dev; **`bus.spec.ts` alone, `development` (`300a3ff9`)**, one test for every route, 6 workers (2 tests), 10:51:25 to 11:00:04 PM Central | 2 passed; the every-route test took 8.5 min | **8 min 39 s** |
| 6 Oct 2026 | home | dev, `8c7a9765` (#1526 service symbology, #1529), release scope, 6 workers, 18:58:07 to 19:20:00 Central; cleared the second 6 October release, tagged `dev-2026-10-06-4` | 421 passed, 0 failed, 1 flaky (bus routes: one route did not draw within 30 s, passed on retry; #1473), 14 skipped, of 436. Men's Basketball passes again after #1434 | **21 min 53 s** |
| 6 Oct 2026 | office | dev, **Angular 22.1.8** (`279853c1`, build 20261006.6, tagged `dev-2026-10-06-2`), release scope, 6 workers, 07:43:33 to 08:09:54 Central | 404 passed, 2 failed (Men's Basketball, #1431), 1 flaky, 14 skipped, of 420 | **26 min 21 s** |
| 6 Oct 2026 | home | dev, Angular 21 (`4d7f1d7a`), **#1426 release scope**, 6 workers, 06:51:57 to 07:14:41 Central | 404 passed, 3 failed (Men's Basketball, #1431), 0 flaky, 14 skipped, of 421 | **22 min 44 s** |
| 6 Oct 2026 | cloud (4 CPUs) | dev, Angular 21; **#1426 branch**, framing only, the 70 release routes, 2 workers, 3:29 to 3:37 AM Central | 62 passed, 1 failed (#1431), 7 skipped; 9.9 s per passing test | **7.7 min** |
| 6 Oct 2026 | cloud (4 CPUs) | dev, Angular 21; **`development`**, framing only, the same 70 routes, 2 workers, 3:18 to 3:29 AM Central | 62 passed, 1 failed (#1431), 7 skipped; 17.0 s per passing test | **11.3 min** |
| 6 Oct 2026 | cloud (4 CPUs) | dev, Angular 21; #1426 branch, release scope, **4 workers**, 2:40 to 3:17 AM Central; CPU load median 21 | 421 tests: 399 passed, 3 failed (#1431), 5 flaky, 14 skipped | 37 min |
| 6 Oct 2026 | cloud (4 CPUs) | dev, Angular 21; #1426 branch, release scope, **6 workers**, 2:03 to 2:39 AM Central | 421 tests: 395 passed, 4 failed (3 #1431, 1 load), 8 flaky, 14 skipped | 35 min |
| 5-6 Oct 2026 | cloud | dev, Angular 21 (`4d7f1d7a`), full suite as on `development`, 2 workers, 23:58 to 01:56 Central | 748 passed, 3 failed (#1431, also on production), 5 flaky, 15 skipped, of 771 | **1 h 58 min** |
| 5 Oct 2026 | home | dev, Angular 20 (`ea4d52e0`; `045f1faf` from about 23:00), 22:10:54 to 23:41:23 Central, 2 workers. **Stopped** when Angular 21 was about to replace it on dev | 582 passed, 5 failed of 770 (2 development-only, fixed by #1461; 2 Men's Basketball, #1431; 1 move-in, during a release swap). 164 min of test time; framing 113 min of it (#1426) | stopped at **1 h 31 min** |
| 5 Oct 2026 | GitHub | production, run 37399982131, 20:36 to 21:53 Central | 712 passed, 3 failed (Men's Basketball, #1431), 1 flaky, 23 skipped | **1 h 17 min** |
| 5 Oct 2026 | home | dev, build 20261005.6 | 743 passed, 0 failed, 14 skipped | ~1.3 h |
| 5 Oct 2026 | home | dev, build 20261004.44 | 743 passed, 0 failed, 14 skipped | ~1.9 h |
| 5 Oct 2026 | office | dev, build 20261005.12 on `7e1aa0fc` | 743 passed, 0 failed, 14 skipped, 0 flaky | **1 h 36 min** |

The two home figures are reported to one decimal place because that is how they were recorded at the
time; they are not precise to the minute. Record the clock times from now on, not a rounded total.

Even allowing for that, the same suite against the same environment differed by something like half
an hour between those two runs, so treat a single number as weak evidence. Much of what it measures
is how fast the hosted GIS services answer that morning, not anything in this repository.

The 5 October office run is the first measured to the minute: 12:07 PM to 1:43 PM Central, two
workers, 743 tests. Its counts are identical to the home machine's run on the previous candidate,
which is what cleared the release.

**The same suite is two to three times faster on GitHub's runners than on a workstation.** Six
scheduled workflow runs, wall clock: 25, 32, 36, 37, 42 and 43 minutes, against 1.3 to 1.6 hours
locally. Development and production jobs run in parallel inside one workflow run, so a run's
duration is the slower of the two. Which of the two should gate a release is #1421.

Only a run on GitHub opens or closes a health issue. A local run, however it goes, does neither.

### Making a release check faster (#1426)

Three changes: a release check opens one framing route per map (70 on dev, against 421), the ArcGIS
SDK is downloaded once per worker instead of once per test, and the framing waits poll every 250 ms
instead of sleeping a second. Measured on 6 October from the cloud session's container, which has 4
CPUs, against dev serving Angular 21:

- **The code alone**, with everything else equal (the same 70 framing routes, 2 workers, back to back):
  **17.0 s to 9.9 s per test**, 42% less, and 11.3 to 7.7 minutes of wall clock. Same failure on both
  sides (`/events/mens-basketball`, #1431).
- **The whole release check**, 421 tests: 35 minutes at 6 workers and 37 at 4, against about two hours
  for the full 771 tests at 2 workers in the same container that night. Framing fell from 139 minutes of
  test time to 20.
- **That container cannot show the 10 to 15 minute target.** At 4 and 6 workers its CPU load sat at
  about 21 on 4 CPUs, every test slowed, framing included, and 6 workers were no faster than 4. The run
  measured the container, not the suite. A workstation measurement at 6 workers is still to be taken.
- **What is left is mostly `maps.spec.ts`** (71 tests, about 50 minutes of test time at 2 workers),
  event dates (13) and `bus.spec.ts`, whose every-route test took 7 to 11 minutes on its own and so is a
  floor that more workers cannot lower ([#1473](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1473)).

### One bus test per route (#1473)

Splitting the every-route bus test made it parallel, and more expensive in total. Each route now loads
its own map, about 48 s a test with the machine quiet, where the old test loaded the map once and spent
about 20 s on each route. So 25 routes cost about 20 minutes of test time instead of 8.5.

What is gained is the floor. The old test could only run on one worker, so no run could finish in less
than its 7 to 11 minutes. Now the longest bus test is about a minute, and the 20 minutes spread across
whatever workers there are: about 3.5 minutes on 6 workers with the CPUs to run them.

**The cloud container could not show that.** At 2 workers the split took 10 min 36 s against 8 min 39 s
before. At 6 workers its 4 CPUs were saturated (load about 35), every test slowed to 80 to 130 s, two
timed out before passing, and the run took 8 min 56 s. A workstation run at 6 workers is the
measurement still to take. In a full release check the bus tests share the workers with everything
else, so what matters there is that none of them is 8 minutes long.

## Where the other records are

This file is for runs as they happen. Two existing records keep their own shape and are not folded
in here:

- [`docs/upgrades/angular.md`](upgrades/angular.md) - every Angular upgrade broken into eleven steps,
  with a duration for each, across Angular 16, 17, 18 and 19 (#1375). That per-step detail is what
  makes the forecast for Angular 20 to 22 possible, and a flat table would lose it.
- **CLAUDE.md**, under "Why checks run in a volume" - the per-task comparison that justified moving
  checks into a Docker volume (#1402, #1405).

A release's own timings - build, suite, deploy - belong in that release's notes under
`docs/releases/`, which is where someone looks when asking how long a release took.
