# work-lab-leila: status

**TAMU AI allowance used up at 9:28 AM Central, 23 October.** The machine is back on the Claude Code desktop app (Opus,
the maintainer's account).

Written only by work-lab-leila (see `DIRECTOR.md`). Pushed the moment anything starts or finishes. Clock times are
read from PowerShell, not estimated.

Last written **10:28 AM Central, 23 October 2026**. A listener; job: testing.

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

**Waiting for the security director on batch 23** (stopped at step 3, 10:29 AM Central): knip read its own output file, `knip.json`, as a configuration and exited without a report. The worktree `C:/TAMU/wt-knip` and the volume `tamu-js-knip-nm` are kept for a rerun. Otherwise idle, watching the branch.

## Finished

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

Last batch done: 21, and the AggieMap batch 19
