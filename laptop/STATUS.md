# Laptop: status

- **Agent:** Claude Code (desktop app), the chat "js.monorepo - Laptop - GIS Day"; the only listener on this machine
- **Machine:** laptop

Written only by the laptop session, while it listens (see `DIRECTOR.md`).

Last batch done: 9

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
- **`npm audit signatures` fails from here** since about 4:55 PM Central on 23 November: the registry answers this machine `OK` for `oxc-parser@0.156.0`'s attestations, where CI verified them at 4:40 PM. Every check here exits 1 at that step until it is resolved, so read the step that failed, not only `Exit` (batch 3's report, Question 1).
- **It is a laptop, and it sleeps.** It slept from about 3:26 PM to 4:30 PM Central on 23 November, with everything frozen. That includes the watcher, so the heartbeat lapsed for 78 minutes. The app's keep-awake setting prevents idle sleep only; a closed lid still sleeps. **A heartbeat that is late here usually means asleep, not stuck.** Do not give it a long measurement whose loss would cost something.

## Running now
- **Batches 11 and 12 (gisday: #2893 admin images, #3244 phone images)**, together, on the signed-in GIS Day stack, started 9:37 PM Central. Next update by 10:07 PM Central.

## Finished
- **Batch 9 (aggiemap: #3150, #3149)** (report `laptop/reports/2026-11-23-9.md`): two branches ready, `fix/3150-bus-route-phone` (`a3f5220c5`) and `fix/3149-phone-directions` (`fa868e398`). Both proven on a phone first, red first, with images; #3149 check exit 0. **Found and filed #3319**: the stop search's back arrow (the issue's "correct" `./trip`) went to the main map; fixed with #3149's link. **Two questions.**
- **Batch 7 (security: #3265)** (report `laptop/reports/2026-11-23-7-security.md`): branch ready, `fix/3265-basemap-source-scan` on the fork at `2ff127da9`.
  - **Fix:** the source scan runs once, in the describe's `beforeAll`. Assertions unchanged.
  - **Timing:** same load both ways (a mounted checkout). Before: 85.7 s and 83.5 s, both timed out. After: 9 ms and 10 ms, 17 passed.
  - **Check:** a pass under the rule. **One question** (two batches numbered 7).
- **Batch 8 (gisday: #3090)** (report `laptop/reports/2026-11-23-8.md`): branch ready, `feat/3090-submission-file-preview` on the fork at `bd745d682`. Built: the PDF preview (an admin-only inline route; Preview with Previous and Next on the review page), red first, with images. **Step 2 stopped:** LibreOffice adds about 426 MB to the API image (one 10-slide conversion takes about 0.4 s). The full check was killed for memory twice; the failed projects pass alone at `CHECK_PARALLEL=2`. **Two questions.**
- **Batch 7 (gisday: #2363)** (report `laptop/reports/2026-11-23-7.md`): branch ready, `test/2363-query-checking-provider-specs` on the fork at `fa072e279`.
  - **Specs:** 28 query-checking specs, about 160 tests.
  - **Bug found:** typeorm refused `SeasonService.clonePreviousSeason`. Filed as **#3302** and fixed on `fix/3302-clone-season-where` (`fda4e8b01`), red first.
  - **Checks:** both pass under the audit rule. **Merge #3302 first**, then flip one `it.failing`. **One question.**
- **Batch 6 (gisday: #3292 Winners images)** (report `laptop/reports/2026-11-23-6.md`): **images pushed (3292): `d9f17420f`**, a fast-forward.
  - **Images:** before (merge-base) and after at 1280 and 390, from made-up entries. `collate --check` exit 0.
  - **The main author now leads.** On a long title the co-authors are what gets cut now. **One question.**
- **Batch 5 (aggiemap: #3161 remote campus names)** (report `laptop/reports/2026-11-23-5.md`): branch ready, `fix/3161-remote-campus-names` on the fork at `49cb10736`, no PR.
  - **Changed:** only the five strings the issue gives: three sidebar headings (`applicationName`) and two Campus Maps descriptions. Ids and routes are untouched, and a test now pins them.
  - **Red first.** Before and after images for all four pages.
  - **Check:** a pass under the audit-signatures rule.
  - **No logo was supplied.** **Three questions.**
- **Batch 4 (gisday: #3244 counts table on a phone)** (report `laptop/reports/2026-11-23-4.md`): **it still does not fit.**
  - **Widths:** 428 px on a 360 px phone and 429 px on a 390 px phone, the same as before the fix. The counts table needs 377 px because its cells are single words. It fits at 1280.
  - **Images pushed: none.** Nothing was changed or pushed; the branch is still at `f458eb400`.
  - **Recommended:** the shared `DashboardScrollComponent`, moved to a shared library. **One question.**
- **Batch 3 (aggiemap: #3279)** (report `laptop/reports/2026-11-23-3.md`): branch ready, `fix/3279-september-cache` on the fork at `61196417b`, no PR.
  - **Fix:** the September cache is out of the gallery and the smoke list. Red first. The dialog is gone on a local server.
  - **#3225's smoke test is green for the first time**, on a local merge with PR 3282: 1 passed, layers back exactly.
  - **Check:** exit 1 from `npm audit signatures` only. Nx targets and the smoke tsc all pass.
  - **Conflicts with PR 3282** in three files. **Two questions.**
- **Batch 2 (aggiemap: #3223, #3225)** (report `laptop/reports/2026-11-23-2.md`): both branches are ready on the fork with `.pr-body.md`; no pull requests opened.
  - **#3223:** `fix/3223-nature-spaces` at `6677e94a2`. Check exit 0. Red first.
  - **#3225:** `feat/3225-basemap-20261119` at `be4f1c367`. Check exit 0. Red first.
  - **#3279 filed** (dev's gallery raises a portal sign-in dialog). It blocks #3225's new smoke test on dev.
  - Nothing failed because of setup. **Three questions.**
- **Batch 1 (gisday: complete setup)** (report `laptop/reports/2026-11-23-1.md`): set up for any development batch. Proofs:
  - **Bug-fix check:** `gisday-angular,gisday-nest`, exit 0.
  - **Signed in on txgisday-dev:** exit 0.
  - **AggieMap `legend.spec.ts` on dev:** exit 1, failing on dev's data, not setup. Filed #3271.
- Four batches, after 11 and 12, in the order they arrived: 13 (gisday: #3314 hourly check-ins chart), a11 (aggiemap: #3271), g14 (gisday: #1756), g15 (gisday: backlog #521 to #567). Batch 10 was withdrawn, moved to home a1.
  - **One question.**

## Queued
- Four batches, after security's 7, in the order they arrived: 9 (aggiemap: #3150, #3149, High), 10 (aggiemap: #3285, High). Order of arrival puts gisday 7 and 8 and security 7 first; the aggiemap 9 says after 5 and is High, so if a director wants it ahead of 7 and 8, say so in TASKS.md.

## Findings
- `work/tools/gisday-release-check.cjs` clicks Auth0's Accept by itself. A read-only sign-in check would suit machines that only need to prove sign-in.
- After a dev server starts, the first browser request waits minutes for Vite's dependency bundling, with no log line when it finishes. A check run right after it needs a longer first timeout.
- The existing gallery smoke test ("choosing a basemap changes the map") is probably blocked on dev by #3279 as well. It was not run on its own, so this is not confirmed.
- One dev server serves one checkout. Before and after captures for a branch mean restarting `aggiemap-dev` on its worktree, about 2 minutes plus the first-load bundling. The same `tamu-js-dev-nm` volume serves any checkout with the same lock.

## Told directly
- Name `laptop`; job development, any project (the maintainer, 23 November 2026, when it joined).
- Set up GIS Day local here (CLAUDE_SETUP.md phase 6) (the maintainer, 23 November 2026, about 12:40 PM Central).
- Batch 1: ask the maintainer directly, in this chat, for every command this setup needs that the laptop cannot run (the maintainer, relayed by `work (gisday)` in batch 1, 23 November 2026).
