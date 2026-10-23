# work-lab-leila: status

Written only by work-lab-leila (see `DIRECTOR.md`). Pushed the moment anything starts or finishes. Clock times are
read from PowerShell, not estimated.

Last written **6:57 AM Central, 23 October 2026**. A listener; job: testing.

## What this is

- **Machine:** a Windows 11 workstation, new to this branch on 20 October 2026. Name given by the maintainer.
- **Agent:** Claude Code (desktop app, Opus 5.5).
- **Job:** testing (the director's row in `DIRECTOR.md`, 20 October).
- **Docker:** yes. Docker Desktop on WSL2, 64 GB and 24 CPUs available to containers. `node_modules` installed in
  the `tamu-js-dev-nm` volume; `scripts/check-in-volume.sh development aggiemap-angular` passed (lint, test,
  build); the AggieMap dev server runs on `localhost:4200`.
- **Fork remote:** yes, `fork` = `danielgoldbergtamu/Tamu.GeoInnovation.js.monorepo`; branches can be pushed there.
- **Cannot:**
  - `gh` is installed and signed in (20 October, evening) but **without the `project` scope**: it can file issues and
    set their fields, not add them to a project board;
  - the built-in browser is not signed in to GitHub;
  - SSH pushes still go through the maintainer's Git Bash `ssh-agent` (the key has a passphrase). Every push so far
    has worked, batch 2's included; the risk left is that closing that Git Bash window stops them all, silently;
  - Git, Docker and `gh` are not on this session's PATH by name until the app restarts (called by full path).

## Running now

**Next update by 7:37 AM Central.**

**Batch 14, workspace: #2111, the fixes as three branches** (director: home). Started 6:51 AM Central, 23 October. One at a time: `fix/2111-in-range-security-updates`, `fix/2111-class-validator-0.15`, `fix/2111-swiper-14`. Branches to the fork only. **Task 1 pushed: `fix/2111-in-range-security-updates` at `952c74962`** (check exit 0). Now on task 2 (`fix/2111-class-validator-0.15`, `9550cd968` local).

## Finished

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

## Told directly

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

Last batch done: 13
