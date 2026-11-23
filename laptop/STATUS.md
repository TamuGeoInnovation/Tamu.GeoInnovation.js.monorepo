# Laptop: status

- **Agent:** Claude Code (desktop app), the chat "js.monorepo - Laptop - GIS Day", the only listener on this machine
- **Machine:** laptop

Written only by the laptop session, while it listens (see `DIRECTOR.md`).

## What this is

- **Job:** development, any project (the maintainer, 23 November 2026): branches for GIS Day, AggieMap or security, whichever director sends them.
- **Set up today** from `CLAUDE_SETUP.md`, phases 0 to 5. Not yet set up: GIS Day local (phase 6).
- **Docker:** yes. Docker Desktop, 14 CPUs and about 15.4 GB for containers. Smaller than the lab (24 CPUs, 64 GB), so the full affected check's `-m 16g` is at this machine's limit.
- **`fork` remote:** yes, `danielgoldbergtamu`, over HTTPS. Branches go there.
- **`gh`:** yes, signed in, with the `project` scope. Admin on the main repository.
- **Checks:** `scripts/check-in-volume.sh development aggiemap-angular` exit 0 on `eff3713a3`.
- **Dev server:** `aggiemap-dev` on port 4200, serving the main checkout.
- **Remote Control:** on, for this chat and new chats on this machine.

**Cannot do yet:**
- **Signed-in GIS Day checks or screenshots.** There is no `C:/TAMU/gisday-local/auth0-dev.local.env` here.
- **Full screenshot sets.** Those stay on `work`.
- **No SSH key**, so no kubernetes-config pushes over SSH. Pushing there over HTTPS has not been tried.
- **No host Python.**

## Setup (batch 1)

Progress (12:58 PM Central): audit done; GIS Day API and site building; Playwright image pulling. Next update by 1:15 PM Central.

| Item | State | Whose |
| --- | --- | --- |
| CLAUDE_SETUP.md phases 0-5 (Docker, gh, fork, install, check, dev server) | done this morning; check exit 0 on `eff3713a3` | mine |
| `tamu-js-dev-nm` from the current lock, node 24.22.1; `aggiemap-dev` starts clean (200 in 165 s) | done; paused now so GIS Day has the memory | mine |
| GIS Day local: settings file, `db`, `restore` (with migrations) | done | mine |
| GIS Day local: `api`, `web` | building | mine |
| `auth0-dev.local.env` (txgisday-dev only) | missing | the maintainer's |
| `127.0.0.1 gisday.local.test` in the hosts file (admin) | missing | the maintainer's |
| Signed-in check on txgisday-dev as the made-up test admin | waits on the two above | mine |
| Playwright image `v1.64.1-noble` | pulling | mine |
| One AggieMap smoke spec on dev, one GIS Day smoke spec | to do | mine |
| kubernetes-config | cloned over HTTPS at `C:\TAMU\kubernetes-config` on `master`; push permission yes. No SSH key needed | mine, done |
| Docker memory | 15.4 GB of 31.5 GB (WSL's default half). `.wslconfig` `memory=24GB` would raise it | the maintainer's decision |
| `CHECK_MEMORY=12g`, `CHECK_PARALLEL=6` (user variables) until then | done | mine |
| `BUILD_TIMES_MACHINE=laptop` (user variable) | done | mine |
| Host Python | none; nothing in the batch needs it | - |
| Bug-fix check `gisday-angular,gisday-nest` | to do | mine |

## Running now
- **Batch 1 (gisday: complete setup)**, started 12:43 PM Central. Next update by 1:15 PM Central.

## Finished
- Nothing yet.

## Queued
- Nothing.

## Findings
- None yet.

## Told directly
- Name `laptop`; job development, any project (the maintainer, 23 November 2026, when it joined).
- Set up GIS Day local here (CLAUDE_SETUP.md phase 6) (the maintainer, 23 November 2026, about 12:40 PM Central).
- Batch 1: ask the maintainer directly, in this chat, for every command this setup needs that the laptop cannot run (the maintainer, relayed by `work (gisday)` in batch 1, 23 November 2026).
