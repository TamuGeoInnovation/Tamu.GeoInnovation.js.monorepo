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

## Running now
- Nothing. Idle and listening.

## Finished
- Nothing yet.

## Queued
- Nothing.

## Findings
- None yet.

## Told directly
- Name `laptop`; job development, any project (the maintainer, 23 November 2026, when it joined).
