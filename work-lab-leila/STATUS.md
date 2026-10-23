# work-lab-leila: status

**TAMU AI allowance used up at 9:28 AM Central, 23 October.** The machine is back on the Claude Code desktop app (Opus,
the maintainer's account).

Written only by work-lab-leila (see `DIRECTOR.md`). Pushed the moment anything starts or finishes. Clock times are
read from PowerShell, not estimated.

Last written **1:53 PM Central, 23 October 2026**. A listener; job: testing.

## What this is

- **Machine:** a Windows 11 workstation, new to this branch on 20 October 2026. Name given by the maintainer.
- **Agent:** Claude Code desktop app (Opus, the maintainer's account). On the CLI with the TAMU AI key for part of
  23 October, until its allowance ran out at 9:28 AM Central; back on the desktop app since (see **Told directly**).
- **Job:** testing (the director's row in `DIRECTOR.md`, 20 October).
- **Docker:** yes. Docker Desktop on WSL2, 64 GB and 24 CPUs available to containers. `node_modules` installed in
  the `tamu-js-dev-nm` volume; `scripts/check-in-volume.sh development aggiemap-angular` passed (lint, test,
  build); the AggieMap dev server runs on `localhost:4200`.
- **Fork remote:** yes, `fork` = `danielgoldbergtamu/Tamu.GeoInnovation.js.monorepo`; branches can be pushed there.
- **git, gh and Docker are on PATH** (CLI session, 23 October).
- **Pushes go over HTTPS through `gh`'s login** — no longer depends on a Git Bash `ssh-agent` window (23 October).
- **TAMU AI allowance is $20/day.** If the gateway starts refusing requests mid-batch, write
  "TAMU AI allowance used up at &lt;time, US Central&gt;" at the top of this file with the batch and step
  reached, and stop. The director will ask the maintainer to switch back.
- **Cannot:**
  - `gh` is installed and signed in but **without the `project` scope**: it can file issues and set their fields,
    not add them to a project board;
  - the built-in browser is not signed in to GitHub.

## Running now

**Nothing running.** Batches 41 to 43 are done (42 stopped at step 2). Watching the branch.

## Finished

- **Batch 43, security: #1218 survey of TypeScript 7, ESLint 10, typeorm 1 (read-only)** (1:42 to 1:51 PM, 23 October): **TypeScript 7 is blocked** (Angular 22, next included, and typescript-eslint 8 require `<6.1`); **ESLint 10 installs**, with 5 lint errors from 2 new recommended rules (small); **typeorm 1 installs only with `mssql` 12 and `ts-node` 10.9.2**, then 69 type errors (63 are `relations` string arrays) plus a runtime risk from the null/undefined-`where` change (medium). Recommended order: ESLint, typeorm, TypeScript. Report `work-lab-leila/reports/2026-10-23-32.md`.

- **Batch 42, security: Nx 24 probe - stopped at step 2** (1:40 to 1:42 PM): `nx migrate 24.0.0` ran, then `npm install` hit `ERESOLVE` (the lock's `@nx/*` 23.3.0 set vs `@nx/angular@24.0.0`'s peer `@nx/webpack@24.0.0`), the same as batch 39. Nothing committed; worktree removed. Suggests a re-run with batch 41's lock-entry method. Report `work-lab-leila/reports/2026-10-23-31.md`.

- **Batch 41, security: angular-eslint 22.6.0 by re-resolving only its own lock entries - pushed** (1:36 to 1:40 PM, 23 October; director: work, security chat): deleted the nine `angular-eslint`/`@angular-eslint/*` lock keys and re-resolved them, with no ERESOLVE; the lock diff is only those eight packages to 22.6.0 plus their nested `ignore` 7.0.8 → 7.0.12. Full check exit 0, lint 104 / test 100 / build 14, no cache hits. **`chore/2168-angular-eslint-22-6` at `6457deb77`** on the fork. Report `work-lab-leila/reports/2026-10-23-30.md`.

- **Batch 39, security: angular-eslint 22.6.0 on its own - stopped at step 2** (1:32 to 1:34 PM, 23 October; director: work, security chat): the lock-only install hits **the same `ERESOLVE`** as batch 36 with Nx untouched, so the conflict is in the `angular-eslint` set itself (the lock's 22.5.0 `schematics` pins `eslint-plugin-template@22.5.0`). Lock unchanged; nothing committed. **Batch 40 not started**, as it says; its step 4 (Jest and webpack working unconverted on Nx 24) looks impossible, since Nx 24 removes those executors. Report `work-lab-leila/reports/2026-10-23-29.md`.

- **Batch 38, security: #2117 part 2 rebased onto PR 2173** (1:22 to 1:32 PM, 23 October; director: work, security chat): **`chore/2117-api-own-deps` `e46ac6e0c`** force-with-lease pushed. One conflict per Dockerfile, the last line; the builder stage and 2173's npm removal both kept. Every package at the root lock's version; npm gone; `gisday-nest` 200 and 401; Trivy 0 critical, 0 high on all four (as is `:stable` `6eac6d637` now); 205 to 312 packages and 355 to 478 MB against 493 and about 1.35 GB; the check ran 4 projects. Report `work-lab-leila/reports/2026-10-23-28.md`.

- **Batch 37, security: #2138, Dependabot version updates** (1:11 to 1:14 PM, 23 October; director: work, security chat): **`ci/2138-dependabot` `bc3e292b1`** pushed. `.github/dependabot.yml`: weekly, Mondays 6 AM Central, into `development`; npm grouped by family (majors only in the named families), the API images in one PR, the front ends in another, Actions in one. Valid against SchemaStore's schema (which rejects a broken copy); every directory exists; a `CLAUDE.md` paragraph. The check ran nothing, as expected. Report `work-lab-leila/reports/2026-10-23-27.md`.

- **Batch 36, security: #2168, Nx 23 to 24 - stopped at step 1** (1:06 to 1:11 PM, 23 October; director: work, security chat): `nx migrate 24` resolves to **24.0.0** with 12 migrations, but **`npm install` fails** (`ERESOLVE`, `angular-eslint` 22.5.0 against 22.6.0, then Nx's own packages), so nothing ran. **Nx 24 removes the executors behind 105 lint targets, 35 Jest targets and the 6 API webpack builds**, and makes `withNx` an inert stub. Nothing committed; worktree `C:/TAMU/wt-2168` kept. Questions in report `work-lab-leila/reports/2026-10-23-26.md`.

- **Batch 35, security: #2117 part 2, each API image its own packages at the root lock's versions** (12:50 to 1:06 PM, 23 October; director: work, security chat): **`chore/2117-api-own-deps` `360e453da`** pushed. Install from the root pair, put the root's overrides back (Nx drops `form-data`'s), prune; `mssql` added for `gisday-nest` and `mailroom-nest` (TypeORM loads it by name). Every package left matches the root lock; 205 to 329 packages and 355 to 483 MB against 497 and about 1.35 GB; `gisday-nest` 200 and 401 against a real database; the check ran 4 projects. **Conflicts with batch 34 in the four Dockerfiles.** Report `work-lab-leila/reports/2026-10-23-25.md`.

- **Batch 34, security: #2117 part 1, npm out of the API images** (12:39 to 12:50 PM, 23 October; director: work, security chat): **`chore/2117-no-npm-in-api-images` `2d53d4f4e`** pushed. All four new images **0 critical, 0 high** (each `:stable` 4 high, all in the base image's npm); all start, none on a missing module; `gisday-nest` 200 and 401 against a real database; the check ran lint, test and build for 4 projects. Report `work-lab-leila/reports/2026-10-23-24.md`.

- **Batch 32, security: #2154, npm test and npm run coverage** (12:18 to 12:24 PM, 23 October; director: work, security chat): **`fix/2154-root-test-scripts` `93e031a2a`** pushed. The root `jest.config.ts` is deleted; `test` and `coverage` now run `nx run-many -t test`. Proven on a Jest and a Vitest project, and coverage reports. **The pre-push check ran nothing** (`No tasks were run`), so its exit 0 is not a pass; said plainly in the report. Report `work-lab-leila/reports/2026-10-23-23.md`.

- **Batch 33, security: #2155 again, after the gisday-nest fix** (12:13 to 12:18 PM, 23 October; director: work, security chat): `248d79ab5` as required; `check-in-volume.sh` **exit=0** (lint 104, test 100, build 14; `gisday-nest` builds now). `gisday-angular`'s production build has no mail code (`build=0`, grep empty). Report `work-lab-leila/reports/2026-10-23-22.md`.

- **Batch 31, security: #2117, each API image its own packages - not pushed** (12:05 to 12:13 PM, 23 October; director: work, security chat): change committed locally as `7c25ba6a0` in `C:/TAMU/wt-2117` (left for the director). All four APIs build with their own `package.json` and lock, and the check is exit 0; **but 3 of 4 images fail `npm ci`**, because Nx's generated lock gets nested copies wrong. `geoservices-nest` builds and starts: 192 packages against 623. **The three accepted findings are in the base image's own npm**, not the APIs'. Report `work-lab-leila/reports/2026-10-23-21.md`.

- **Batch 30, security: #2155, libs/oidc/common retired** (11:58 to 12:04 PM, 23 October; director: work, security chat): `200529d3a` as required. **Check exit=1**: lint 104 and test 100 pass; **`gisday-nest:build` fails on one error**, `libs/common/types/src/lib/common-types.ts:1` `TS2503: Cannot find namespace '__esri'` (the moved types bring that file into an API without the ArcGIS types). **`gisday-angular`'s production build has no mail code left** (`build=0`, grep empty). Report `work-lab-leila/reports/2026-10-23-20.md`.

- **Batch 29, security: #2158, the retired IdP removed** (11:52 to 11:56 AM, 23 October; director: work, security chat): `3250d965e` as required; `check-in-volume.sh` **exit=0**: clean `npm ci` of **2,237** packages (72 fewer than #2122's branch), lint 105, test 101, build 14, nothing failed, nothing names the removed libraries or packages. Report `work-lab-leila/reports/2026-10-23-19.md`.

- **Batch 28, gisday: #2133, the production gisday-nest image locally** (11:52 to 11:55 AM, 23 October; director: work, GIS Day chat): **`docs/2133-gisday-nest-image-locally` `fdcf6ad9a`** on the fork, one entry in `docs/gisday-local.md`. Both halves reproduced with `sha-ee1a9e4`; the sample alone stops even earlier, on a blank `TYPEORM_PASSWORD`, which the entry also says. Report `work-lab-leila/reports/2026-10-23-18.md`.

- **Batch 27, security: #1218, what is out of date** (11:44 to 11:46 AM, 23 October; director: work, security chat): `origin/development` `ac476bd73`. `npm outdated`: **89** packages, **15** in-range updates, **49** a major behind (Nx 11 at 23 → 24, TypeScript 6 → 7, ESLint 9 → 10, and 31 others). Furthest: `marked` 9 majors, `angular-auth-oidc-client`, `dotenv` and `ngx-highlightjs` 8. Angular, NestJS, ArcGIS, Jest and Vitest are on their latest major. Node v24.22.1, no `engines`. Report `work-lab-leila/reports/2026-10-23-17.md`.

- **Batch 26, security: #2122, eleven unused dependencies removed** (11:21 to 11:25 AM, 23 October; director: work, security chat): `cc819f1c5` as required; `check-in-volume.sh` **exit=0**: clean `npm ci` of **2,309** packages (37 fewer), lint 113, test 106, build 14, no failures, no missing-module errors. Report `work-lab-leila/reports/2026-10-23-16.md`.

- **Batch 25, security: #2115 on its fixed head, and batch 23's knip report** (11:08 to 11:13 AM, 23 October; director: work, security chat). **#2115 `6116951f5` check exit=0** (lint 113, test 106, build 14; the organization upload test passed this time). **knip ran with Jest off**: 27 unused dependencies, 32 unused devDependencies, 20 unlisted imports, 0 binaries; of the nine packages, only `oidc-provider`, `node-jose` (both `libs/oidc/provider`) and `passport-jwt` are imported. The root `jest.config.ts` breaks `npm test` and `npm run coverage`. Report `work-lab-leila/reports/2026-10-23-15.md`.

- **Batch 24, security: #2115, nodemailer 10** (10:53 to 10:59 AM, 23 October; director: work, security chat): head `42826d479` as required. **Check exit=1**: lint 113 passed; **4 builds fail on the same two nodemailer 10 type errors in `libs/oidc/common/.../mailer.util.ts`** (mailroom-nest, mailroom-helper-nest, gisday-nest, gisday-angular); 1 test timed out (`gisday-platform-data-api`, an upload-limit test). **The real send passed**: plain message accepted, `/etc/passwd` attachment refused, exactly one message in Mailpit. Cleaned up. Report `work-lab-leila/reports/2026-10-23-14.md`.

- **Batch 23 resumed - stopped at step 3 again** (10:52 to 10:53 AM, 23 October): with the output renamed, knip 5.88.1 now fails loading the root `jest.config.ts`: `getJestProjects` is not exported by `@nx/jest` 23.3.0 (only `getJestProjectsAsync`), so that file cannot load at all. Not rerun. Report `work-lab-leila/reports/2026-10-23-13.md`.

- **Batch 23, security: a knip report for #2122 - stopped at step 3** (10:26 to 10:28 AM, 23 October; director: work, security chat): `origin/development` `89aed53ae`, install exit 0 (2,344 packages), knip 5.88.1. **No report**: knip loads a file named `knip.json` as its configuration, and the output redirect creates that file empty before knip starts. Not rerun, as the batch says; question for the director in report `work-lab-leila/reports/2026-10-23-12.md`.

- **Batch 21 again, on its new head** (10:06 to 10:09 AM, 23 October; director: work, security chat): `fork/security/check-2112b` at `b94d3985e` as required; `check-in-volume.sh` **exit=0**: lint 113, test 106, build 14, nothing from the cache, no failures. No `npm ci`, because the lock is byte-identical to the 9:51 run's. Report `work-lab-leila/reports/2026-10-23-11.md`.

- **Batch 19 (aggiemap): #2134 and #2144** (10:01 to 10:04 AM, 23 October; director: work, AggieMap chat). On the fork: **`ci/2134-publish-yml-quoting` `3b1bd31d4`** (actionlint: 4 SC2086 before, exit 0 and none after) and **`fix/2144-baseline-commit-from-worktree` `aed8a072a`** (a worktree's `gitdir:` is followed, and a missing commit is printed and recorded with its reason; tests red then green, 14 of 14). No pull requests. Report `work-lab-leila/reports/2026-10-23-10.md`.

- **Batch 21, security: the full pre-push check for #2112's second round** (9:51 to 9:54 AM, 23 October; director: work, security chat): `fork/security/check-2112b` at `753027755` as required; `check-in-volume.sh` **exit=0**: clean `npm ci`, lint 113, test 106, build 14, nothing from the cache, no failures. Worktree and branch removed. Report `work-lab-leila/reports/2026-10-23-9.md`.

- **Batch 20, security: the pre-push check and a scan for #2119** (9:40 to 9:48 AM, 23 October; director: work, security chat): `fix/2119-nginx-base-1.30` at `762ad6a74` as required. Check **exit=0** (4 projects and 3 dependencies, 0 of 15 from the cache). Trivy on `nginx-base:sha-09b7e41`: **0** critical or high. `gisday-angular`, built for production, runs on it: no placeholders left, `/` and a deep link 200, `Server: nginx/1.30.6`. Cleaned up. Report `work-lab-leila/reports/2026-10-23-8.md`.

- **Batch 19, security: the full pre-push check for 2129** (9:35 to 9:39 AM, 23 October, 10 minutes late; director: work, security chat): `fork/security/check-2129` at `1568148d8` as required; `check-in-volume.sh` **exit=0**: clean `npm ci`, lint 113, test 106, build 14, nothing from the cache, no failures. Worktree removed, volume left. Report `work-lab-leila/reports/2026-10-23-7.md`.

- **Batch 18, security: the pre-push check for #2136** (8:43 to 8:45 AM, 23 October; director: work, security chat): `fix/2136-pin-nginx-base` at `f0ce79757`, `check-in-volume.sh` for the four front ends **exit 0**: lint, test, build for 4 projects and 3 dependencies, 0 of 15 from the cache. Report `work-lab-leila/reports/2026-10-23-6.md`.

- **Batch 17, gisday: checks after the `sha-8ee8c6e` release** (8:28 to 8:43 AM, 23 October; director: work, GIS Day chat): **all passed.** Browser tests 33 of 33 on txgisday.org; `presenter-cards.spec.ts` passes on all four addresses, and every real card is 255 × 366 (60, 60, 60 and 58 on UCGIS). Photo sets of 86, 86 and 22 shots, 0 failed. `/api/seasons/active` 200, 2026, on all four. Report `work-lab-leila/reports/2026-10-23-5.md`.

- **Batch 15, workspace: #2119, a new nginx-base proved locally** (8:16 to 8:25 AM, 23 October; director: home): `nginx:1.30.6-alpine` has no critical or high findings (current base: 4 critical, 27 high). All four front ends build and run on it unchanged, with substitution, `/` and a deep link, and `nginx -t` all passing. The two diffs are given as text in the report; nothing pushed. Report `work-lab-leila/reports/2026-10-23-4.md`.

- **Batch 14, workspace: #2111, the fixes as three branches** (6:51 to 7:49 AM, 23 October; director: home). On the fork, each with `check-in-volume.sh` exit 0 (lint 113, test 106, build 14): **`fix/2111-in-range-security-updates` `952c74962`** (lock only, 41 packages; audit 68 → 64, critical 6 → 5, high 28 → 19); **`fix/2111-class-validator-0.15` `248cf85dc`** (the upgrade needed no code change; plus #2113: `forbidUnknownValues` and `whitelist` on gisday-nest's and competitions' pipes, `POST /classes` left unvalidated; undeclared fields dropped and not stored); **`fix/2111-swiper-14` `c0ef4fb81`** (no code change; before and after images and the release-notes file; only the arrows move a few pixels). No pull requests. Report `work-lab-leila/reports/2026-10-23-3.md`.

- **Batch 13, workspace: #2111, which advisories reach each deployed app** (6:38 to 6:45 AM, 23 October; director: home): 68 packages, 37 with advisories of their own (141 advisories). Of the 24 critical or high: 7 build-only, 17 in all four API images (13 loaded by API code, 4 unused), and only `swiper` (aggiemap, ues-operations) and `axios` (geoservices) in a front-end bundle. Summary on #2111. Report `work-lab-leila/reports/2026-10-23-2.md`.

- **Batch 12, workspace: #2107, the four API images on Node 24.22.1** (6:03 to 6:14 AM, 23 October; director: home): all four `docker build` exit 0, `node -v` `v24.22.1`, the constant `-17` (`undefined` on 24.22.0). `gisday-nest` on a throwaway database: `/api/seasons/active` 200, and malformed Brotli gets a **400 "Decompression failed" with the process still up**. Posted on #2107; everything made has been removed. Report `work-lab-leila/reports/2026-10-23-1.md`.

- **Batch 11, aggiemap: #2101, the paging refusals measured again** (3:53 to 4:13 PM, 22 October, after the reboots): **a standing fault.** `arc.ts.tamu.edu` refuses two paged requests in every eight on a fixed cycle (Motorcycle 6 of 25 both ways; Business Parking too), the same as batch 10; `gis.tamu.edu` basemap 4 refused 3 of 50. Spec on production three times: 162/0/0, 161/0/1, 161/0/1, both flakes on `arc.ts`. Report `work-lab-leila/reports/2026-10-22-3.md`.

- **Batch 10, aggiemap: #2101, the service-completeness check** (2:18 to 2:43 PM, 22 October): `task/2101-service-completeness` at `209e74cf3` on the fork, no pull request. Production: 266 layers on 69 services, 31 over their cap, all paged; spec 41.6 s to 1.3-2.7 min. Red by stub tests and a live mutation (exit 1, 16 failed). **Paging past the cap is refused about one time in ten on `gis.tamu.edu` and `arc.ts.tamu.edu`.** Report `work-lab-leila/reports/2026-10-22-2.md`.

- **Batch 9, aggiemap: the release tier against production** (Release-490, `36b962a04`, `main-YTDVM4VX.js`, 8:30 to 8:47 AM,
  22 October): **545 passed, 2 failed, 14 flaky, 56 skipped**. Every failure is Accessible Building Entrances (#2080), nothing else;
  #2075's maps all pass. No tag. Report `work-lab-leila/reports/2026-10-22-1.md`.

- **Batch 8, aggiemap: the release tier on Release-489** (`61161ce1b`, `main-T7LYF72R.js`, 9:55 to 10:14 AM): **618 passed, 0
  failed, 0 flaky, 44 skipped**; tagged **`dev-2026-10-21`**, pushed. A run begun on Release-488 at 9:52 was stopped after 48 tests
  and discarded. Report `work-lab-leila/reports/2026-10-21-2.md`.

- **Batch 6, aggiemap: #1969** (11:55 PM to 8:50 AM, silent 12:30 to 8:40 AM): **PR 2064** open, `fix/1969-lot-link-race` at `25c3c1daf`.
  Two lookups were racing; the fix is in `EsriMapService` and `EventService`. Smoke test red 6 of 6 on dev, green 10 of 10;
  unit tests red then green; scoped check exit 0. Report `work-lab-leila/reports/2026-10-21-1.md`.

- **Batch 5, aggiemap: the release tier on Release-487** (`b78942631`, dev serving `main-MQDQOFSZ.js`, 11:35 to 11:53 PM): **613
  passed, 0 failed, 0 flaky, 44 skipped**; tagged **`dev-2026-10-20-2`**, pushed; posted on #1935. Report
  `work-lab-leila/reports/2026-10-20-5.md`.

- **Batch 4** (9:13 to 9:52 PM, paused 9:20 to 9:23 for the restart): **#1975** PR 2030 open, `feat/1975-tailgating-kiosk` at
  `0eddaf0c2`, check exit 0; **#1969** reproduced (0% quiet, 5% at six workers, 12 to 14% under load) and made to fail
  every time by delaying the event map's own service 4 s. Report `work-lab-leila/reports/2026-10-20-4.md`. Pushed late:
  the `git push origin` deny in `.claude/settings.json` refused every push to this branch after the restart.

- **Batch 3, the images and notes for the three parking fixes** (6:33 to 9:12 PM): branches ready for PRs,
  `fix/1991` `73c3315a7`, `fix/1992-accessible` `141795928`, `fix/1992-legend` `5df94223b`. Report
  `work-lab-leila/reports/2026-10-20-3.md`.

- **Batch 2, the three parking fixes together** (5:37 to 5:47 PM): merged clean, pushed to the fork as
  `check/2026-10-20-three-parking-fixes`; check exit 1 on one `ts-events-ngx` snapshot that `fix/1991` fails alone;
  `map-layers.spec.ts` on a local production build 58 passed, 12 skipped, 0 failed. Report
  `work-lab-leila/reports/2026-10-20-2.md`.

- **Batch 1, #2008** (5:27 to 5:37 PM): Maintenance Parking passed on production every time, in 41.5 and
  46.6 s with six workers and 43.4 s alone; the limit tracks machine load, not the map. Report
  `work-lab-leila/reports/2026-10-20-1.md`.

- **Joined** (5:19 PM).

## Questions for the director (gisday)

1. **Running unattended on the TAMU AI key.** The $20 TAMU AI allowance lasted about 25 minutes on the Claude Code CLI,
   most of it apparently spent on 34 failed auto-mode safety checks. Auto mode's classifier cannot run through the TAMU
   gateway, so an allowlist, or skipping permissions, is the only way to run unattended on that key.

## Told directly

- 23 October 2026, 9:28 AM Central: the TAMU AI allowance is used up. Back on the desktop app (Opus, the maintainer's
  account).

- 23 October 2026: moved to the Claude Code CLI on the TAMU AI key (`protected.Claude Sonnet 4.6`). git now
  reaches GitHub over HTTPS through `gh`'s login; git, gh and Docker are on PATH. No longer on the desktop app
  (Opus).

- 20 October, evening: file the setup-docs issue for the missing `gh`, priority Low. Filed as #2015 (Task, `documentation`).

- 20 October: this machine is named `work-lab-leila`; the director will assign it work.

## Findings

- **Stopped on an approval popup, 21 October, about 8:45 AM, in bypass permissions mode** (the maintainer saw it; I cannot
  see popups, only refusals). The command was one Bash call taking batch 6's images: `docker rm -f aggiemap-dev`, then
  `docker run -d --name aggiemap-dev -p 4200:4200 -v "C:/TAMU/wt-1969:/w" ... nx serve`, then `rm -f
  docs/screenshots/1969-lot-link-race/*.png` and two `docker run ... mcr.microsoft.com/playwright ... node /cap/lotshot.js`
  (one with `--network container:aggiemap-dev`). **Nothing in `.claude/settings.json` explains it**: it has no `ask` rules and
  no `deny` that matches. So it came from outside the checked-in rules (the app itself, a user-level rule, or the compound
  command), and an allow line will not cover it. Suggest the maintainer note which part the popup named, if it said.

- **`.claude/settings.json` (#2017, `2c1651c9b`) is in the main checkout, and two things in it will stop this machine:**
  1. It **denies `Bash(git push origin:*)`**. Every listener's join, status and report is `git push origin work-mailbox`;
     a deny usually holds even under bypass permissions, so once it loads this machine may not be able to report at
     all. Suggest allowing `git push origin work-mailbox` explicitly, ahead of the deny.
  2. It has **only `Bash(...)` rules**. A Windows session running commands through the PowerShell tool, as this one has
     all day, matches none of them.
  3. It loads only for a session opened **in** `C:TAMUTamu.GeoInnovation.js.monorepo`. This session was started
     with no folder, so a restart of it may not read the file at all; a new session opened in the repo will.

- `CLAUDE_SETUP.md` Phase 5's AggieMap command hung on a blank page here until `UV_THREADPOOL_SIZE=64` and
  `NX_WORKSPACE_DATA_DIRECTORY=/tmp/nx-workspace-data` were added (#1955, #1626). A fix is on
  `fork/docs/aggiemap-dev-server-env`; no pull request is open yet.

Last batch done: 43 (42 stopped at step 2; 39 stopped; 40 superseded)
