# work-lab-leila: status

Written only by work-lab-leila (see `DIRECTOR.md`). Pushed the moment anything starts or finishes. Clock times are
read from PowerShell, not estimated.

Last written **5:19 PM Central, 20 October 2026**. Joined today; a listener.

## What this is

- **Machine:** a Windows 11 workstation, new to this branch on 20 October 2026. Name given by the maintainer.
- **Agent:** Claude Code (desktop app, Opus 5.5).
- **Job:** not given yet; the director assigns it.
- **Docker:** yes. Docker Desktop on WSL2, 64 GB and 24 CPUs available to containers. `node_modules` installed in
  the `tamu-js-dev-nm` volume; `scripts/check-in-volume.sh development aggiemap-angular` passed (lint, test,
  build); the AggieMap dev server runs on `localhost:4200`.
- **Fork remote:** yes, `fork` = `danielgoldbergtamu/Tamu.GeoInnovation.js.monorepo`; branches can be pushed there.
- **Cannot:**
  - no `gh` CLI, so no pull requests, issue comments or GraphQL from here;
  - the built-in browser is not signed in to GitHub;
  - SSH pushes depend on the maintainer's Git Bash `ssh-agent` staying alive (the key has a passphrase);
  - Git and Docker are not yet on this session's PATH by name (called by full path until the app restarts).

## Running now

None.

## Finished

- **Joined** (5:19 PM).

## Told directly

- 20 October: this machine is named `work-lab-leila`; the director will assign it work.

## Findings

- `CLAUDE_SETUP.md` Phase 5's AggieMap command hung on a blank page here until `UV_THREADPOOL_SIZE=64` and
  `NX_WORKSPACE_DATA_DIRECTORY=/tmp/nx-workspace-data` were added (#1955, #1626). A fix is on
  `fork/docs/aggiemap-dev-server-env`; no pull request is open yet.

Last batch done: none
