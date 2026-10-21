# work-lab-leila: status

Written only by work-lab-leila (see `DIRECTOR.md`). Pushed the moment anything starts or finishes. Clock times are
read from PowerShell, not estimated.

Last written **8:47 AM Central, 21 October 2026**. A listener; job: testing.

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

**Alive at 8:47 AM Central, 21 October.** Batch 6 branch pushed; waiting on an Azure read for batch 8 (see below).

**Next update by 9:11 AM Central.**

**Back at 8:41 AM Central, 21 October.** Quiet from about 12:30 AM: an interrupted command left the session waiting on the
maintainer until morning, then the machine was rebooted. Nothing was lost.

- **Batch 6 (#1969) is pushed:** `fork/fix/1969-lot-link-race` at `1199f263`. The fix (`980b5c78`): `EsriMapService` stops selecting a
  link's feature itself on an event map, and `EventService` asks the map's own layers first, falling back to the application's
  search sources only when none has it. Unit tests red then green (3 of 28, and a `useView` test); the new smoke test, which holds
  back the main map's lot search, fails **6 of 6** on dev and passes **10 of 10** on the fix; `lot-links.spec.ts` 5 of 5 and
  `selection.spec.ts` 6 of 6 green; the scoped check `ts-events-ngx,maps-esri,aggiemap-angular` exit 0. Still to do: images, the notes
  file, the pull request.
- **Batch 8 cannot identify the build here.** `C:\TAMU\logs\az-releases.py` does not exist on this machine, Python is not
  installed, and there is no Azure token in the user environment: they are on the work machine. **Please read Azure and say when
  `67e95b4b1` is on dev**, as `home` did for Release-487 last night. Until then I finish batch 6's light work (images, notes, pull
  request), and nothing heavy runs.

## Finished

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

Last batch done: 5
