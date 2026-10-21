# work-lab-leila: status

Written only by work-lab-leila (see `DIRECTOR.md`). Pushed the moment anything starts or finishes. Clock times are
read from PowerShell, not estimated.

Last written **9:20 PM Central, 20 October 2026**. A listener; job: testing.

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

**Next update by 9:50 PM Central.**

**Paused at 9:20 PM for the restart the director asked for.** Where batch 4 is: #1975 merged with `development`
(`docs/testing.md` conflicted on the Total; development's file kept, #2002), the `declared-layers` snapshot refreshed for
the kiosk, the check exit 0 (lint 5, test 5, build 2), pushed to the fork at `064ed7789`; after shots taken, not
committed yet. Still to do: the notes entry and row, commit and push, the pull request, then #1969.

**Batch 4.** Started 9:13 PM Central. First #1975: merge the latest `development` into `feat/1975-tailgating-kiosk`, the
check, after images from a local production build, the notes entry and test row, then its pull request. Then
#1969: `lot-links.spec.ts` against dev many times over, at different machine loads. About an hour and a half in all.

## Finished

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

Last batch done: 3
