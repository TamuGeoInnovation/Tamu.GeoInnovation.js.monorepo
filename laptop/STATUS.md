# Laptop: status

- **Agent:** Claude Code (desktop app), the chat "js.monorepo - Laptop - GIS Day"; the only listener on this machine
- **Machine:** laptop

Written only by the laptop session, while it listens (see `DIRECTOR.md`).

Last batch done: 2

## What this is

**Job:** development, any project (the maintainer, 23 November 2026). It takes branches for GIS Day, AggieMap or security
from any director. It was set up by batch 1; see `laptop/reports/2026-11-23-1.md`.

| Can do | Detail |
| --- | --- |
| Docker | 14 CPUs and **23.5 GB** (`.wslconfig` `memory=24GB`, of 31.5 GB) |
| Checks | `scripts/check-in-volume.sh` at its defaults (`-m 16g`, `--parallel=8`); exit 0 for `aggiemap-angular` and for `gisday-angular,gisday-nest` |
| Git and GitHub | `fork` = `danielgoldbergtamu` and `origin`, both HTTPS; `gh` signed in, with `project`; admin on the main repository. Opening pull requests is still the director's |
| AggieMap dev server | `aggiemap-dev` on 4200 from `tamu-js-dev-nm` (node 24.22.1, current lock) |
| GIS Day local, signed in | `scripts/gisday-local.sh` end to end; `auth0-dev.local.env` for **txgisday-dev** only; hosts has `gisday.local.test`. Sign in at `http://gisday.local.test:4201` (no consent screen) with Chromium's `--unsafely-treat-insecure-origin-as-secure` |
| Smoke | Playwright `v1.64.1-noble` pulled; AggieMap `run-local.sh` works (dev); GIS Day spec runs (locally; no GIS Day dev site, #1525) |
| kubernetes-config | clone at `C:\TAMU\kubernetes-config` on `master` (HTTPS). Its work still goes to `work` |
| `BUILD_TIMES_MACHINE` | `laptop` |

**Cannot:**
- **Full screenshot sets.** These stay on `work`.
- **GIS Day smoke on dev.** No GIS Day dev site exists yet (#1525).
- **No host Python.**
- **Pushing to kubernetes-config is not yet proven by an actual push.** The API reports push permission.
- **The AggieMap dev server and GIS Day local share 23.5 GB.** Run one at a time beside a check.
- **It is a laptop, and it sleeps.** It slept from about 3:26 PM to 4:30 PM Central on 23 November, with everything frozen. That includes the watcher, so the heartbeat lapsed for 78 minutes. The app's keep-awake setting prevents idle sleep only; a closed lid still sleeps. **A heartbeat that is late here usually means asleep, not stuck.** Do not give it a long measurement whose loss would cost something.

## Running now
- **Batch 3 (aggiemap: #3279)**, started 4:43 PM Central. Next update by 5:50 PM Central.
  Progress (5:07 PM): #3279 proven on a local server: no sign-in dialog, no token-required answer, September gone from the gallery; before and after images taken, release entry written. The check exits 1 only at `npm audit signatures` (registry answers this machine OK for oxc-parser@0.156.0's attestations). Now: #3225's smoke test on the local merge with PR 3282 (first try timed out in global setup on the dev server's cold start; rerunning warm).

## Finished
- **Batch 2 (aggiemap: #3223, #3225)** (report `laptop/reports/2026-11-23-2.md`): both branches are ready on the fork with `.pr-body.md`; no pull requests opened.
  - **#3223:** `fix/3223-nature-spaces` at `6677e94a2`. Check exit 0. Red first.
  - **#3225:** `feat/3225-basemap-20261119` at `be4f1c367`. Check exit 0. Red first.
  - **#3279 filed** (dev's gallery raises a portal sign-in dialog). It blocks #3225's new smoke test on dev.
  - Nothing failed because of setup. **Three questions.**
- **Batch 1 (gisday: complete setup)** (report `laptop/reports/2026-11-23-1.md`): set up for any development batch. Proofs:
  - **Bug-fix check:** `gisday-angular,gisday-nest`, exit 0.
  - **Signed in on txgisday-dev:** exit 0.
  - **AggieMap `legend.spec.ts` on dev:** exit 1, failing on dev's data, not setup. Filed #3271.
  - **GIS Day smoke, run locally:** 3 of 4 passed. The link-preview test can only pass on a deployed site.
  - **One question.**

## Queued
- Batch 4 (gisday: #3244 counts table on a phone), after batch 3.

## Findings
- `work/tools/gisday-release-check.cjs` clicks Auth0's Accept by itself. A read-only sign-in check would suit machines that only need to prove sign-in.
- After a dev server starts, the first browser request waits minutes for Vite's dependency bundling, with no log line when it finishes. A check run right after it needs a longer first timeout.
- The existing gallery smoke test ("choosing a basemap changes the map") is probably blocked on dev by #3279 as well. It was not run on its own, so this is not confirmed.
- One dev server serves one checkout. Before and after captures for a branch mean restarting `aggiemap-dev` on its worktree, about 2 minutes plus the first-load bundling. The same `tamu-js-dev-nm` volume serves any checkout with the same lock.

## Told directly
- Name `laptop`; job development, any project (the maintainer, 23 November 2026, when it joined).
- Set up GIS Day local here (CLAUDE_SETUP.md phase 6) (the maintainer, 23 November 2026, about 12:40 PM Central).
- Batch 1: ask the maintainer directly, in this chat, for every command this setup needs that the laptop cannot run (the maintainer, relayed by `work (gisday)` in batch 1, 23 November 2026).
