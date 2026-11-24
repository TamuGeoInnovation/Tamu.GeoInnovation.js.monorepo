# Laptop: status

- **Agent:** Claude Code (desktop app), the chat "js.monorepo - Laptop - GIS Day"; the only listener on this machine
- **Machine:** laptop

Written only by the laptop session, while it listens (see `DIRECTOR.md`).

Last batch done: g25

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
- Nothing (since 4:12 PM Central). Listening.

## Finished
- **Batch g25 (gisday: #3424, #3412)** (report `laptop/reports/2026-11-24-g25.md`): #3424 red Exit 1 / green Exit 0 against production. **branch ready: `fix/3412-papers-awards-sentence`** (`6bdccb57c`): the Papers awards sentence inside the session component, red first (1 test), check passes but for the registry audit step, images and `.pr-body.md`. No questions.
- **Batch a12 (aggiemap: release tier on dev, quiet)** (report `laptop/reports/2026-11-24-a12.md`): exit 1, **9 failed, 14 flaky, 1033 passed (1.4h)**. **One regression:** #3352's basemap scraper check fails every time on `NearmapCSBasemap`. Real on a quiet machine: indoor-track layer order (2 of 3 loads) and break-summer's Lot 100g popup. `basemap-requests` passes quiet. The Dining Locations and basemap-service failures are service hiccups (re-runs pass). Nothing tagged.
- **Batch g24 (gisday: images for 3387, 3349, 3367)** (report `laptop/reports/2026-11-24-g24.md`): **images pushed (3387): `3d2400c4c`; (3367): `7587ed1fc`**. **3349 has no visible change** (an unticked box stayed off before too); label it `no-visible-change`. Unblocked by the maintainer's go-ahead. No questions.
- **Batch g23: withdrawn while I was on it** (the work machine does the merges). **One merge is on the fork: `feat/3314-check-ins-by-hour` (PR 3375) at `5b059e806`**, development merged in, one conflict resolved, bug-fix check exit 0. Nothing else was pushed. My six other merges are set aside, not pushed, and still in this machine's reflog if wanted: 3360 `fdaba73f5`, 3380 `89f3e9ed0`, 3367 `cdc84dfd0`, 3390 `131bf4f03`, 3391 `2a8494f3b`, 3392 `03af646cb`. 3373 and 3380's lint failures are `npm audit signatures` FETCH_ERROR (the registry answered "OK"), so a re-run is the fix. Told the GIS Day director by session message (delivery not confirmed).
- **Batch g19 (gisday: #3329 images, triage of #498, #439, #466, #477)** (report `laptop/reports/2026-11-24-g19.md`): **images pushed (3329): `8b513bdaa`**. Triage: #498 done (a made-up speaker shaped the same way deletes cleanly; #2381), #439 done by PR 3344, #466 done (one height, 109 px; #2094), #477 done (Presenting At; #532). No questions.
- **Batch g22 (gisday: #434 images)** (report `laptop/reports/2026-11-24-g22.md`): **images pushed (434): `4b2238e9e`**, a fast-forward. The Organization choice lists the made-up North GIS Day's two sessions alone. Noticed: the choice is not kept in the address. No questions.
- **Batch g21 (gisday: #3382 images)** (report `laptop/reports/2026-11-24-g21.md`): **images pushed (3382): `650d0ffc0`**, a fast-forward. Title case shown for real (Update Season, Delete Event). A refused delete *with a reason* cannot be shown: the place and speaker deletes answer 500, never a 4xx. Noticed: the place form's delete button says "Delete Organization". No questions.
- **Batch g20 (gisday: #3354 and #3340 images)** (report `laptop/reports/2026-11-24-g20.md`): **images pushed (3354): `81fb42bbc`; (3340): `c75411969`**, both fast-forwards. #3354: a made-up hidden session, signed out, went from shown (200) to not shown (404); signed in, unchanged. Signed out, the page is now blank rather than "not found" (noted for home). #3340: the three toasts raised for real on made-up records. No questions.
- **Batch g17 (gisday: #3370, #3376, #545)** (report `laptop/reports/2026-11-24-g17.md`): three branches ready. `fix/3370-speakers-list-phone` (`5529e65dc`, check exit 0; 566 to 390 px at 390, desktop unchanged), `docs/3376-playwright-image` (`8c9a4bf9b`) and `feat/545-vgi-export-zip` (`85054bddb`; the streamed zip, downloaded through its button; every affected project passed, not in one run). No package changes; Bull stays, unused. No questions.
- **Batch g18 (gisday: #3328 images; now in PR 3381)** (report `laptop/reports/2026-11-24-g18.md`): **images pushed (3328): `9e5354bab`**, a fast-forward. 13 images: list, add and edit for each type, before and after, and the RSVP list at 390. No questions.
- **Batch g16 (gisday: #441 images)** (report `laptop/reports/2026-11-24-g16.md`): **images pushed (441): `f09e30433`**, a fast-forward on PR 3344's branch. Five images: the Sessions column, the no-session box, and 390. **Found and filed #3370**: the Speakers list is wider than a phone, before (566 px) and after (662 px). Priority not set; suggested Low. No questions.
- **Batch g15 (gisday: backlog #521 to #567)** (report `laptop/reports/2026-11-24-g15.md`): no branches. **Done already:** #521 (by #987) and #536 (by #1784, checked signed in). **Need the maintainer:** #541 (a check-in does not record in-person or online), #545 (the API export from #650 needs Redis, which the cluster does not have) and #567 (with #2072). **Two questions.**
- **Batch g14 (gisday: #1756 picker off screen on a phone)** (report `laptop/reports/2026-11-24-g14.md`): branch ready, `fix/1756-picker-on-screen` on the fork at `bf75db585`, from the latest `development`. The tooltip now slides a popup onto the screen when no spot around its trigger fits; where one fits, nothing moves. Red first (exactly 5 failed). Signed in, all 17 GIS Day pickers: 12 to 14 off screen at 390 before, 0 after, and 1280 unchanged. Check exit 0. Found: the READMEs still name Playwright `v1.64.1-noble` while `development` installs 1.65.1. No questions.
- **Batch 13 (gisday: #3314 check-ins by hour)** (report `laptop/reports/2026-11-23-13.md`): branch ready, `feat/3314-check-ins-by-hour` on the fork at `130797f00`, **stacked on #2893's branch**. The shared line chart gains an `interval` (day or hour) rather than a second chart. Red first (exactly 8 failed). Every affected project passed, though the full check lost five tasks to memory kills and they passed re-run alone. Images at 1280 and 390. No questions.
- **Batch 11 (gisday: #2893 images)** (report `laptop/reports/2026-11-23-11.md`): **images pushed (2893): `bd9fde1b7`**, a fast-forward. Five images (before and after at 1280, an opened event, after at 390), the release entry's table and `app: gisday`. Counts match the made-up seed; the outside-time mark shows once after, never before. No questions.
- **Batch 12 (gisday: #3244 phone images)** (report `laptop/reports/2026-11-23-12.md`): **images pushed (3244): `d60ebab0d`**, a fast-forward. The page is 360 and 390 wide at those widths; the table scrolls in its own box.
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

## Queued
- **a11 (aggiemap: #3271) is held**, not started: `work (aggiemap)` (the CSA 305 session) said at about 11:15 PM Central, by a session message because the work computer cannot write to git (disk full, #3365), that #3271 is very likely the dev parking-service split fixed by #3358, provable only once a build with #3358 reaches dev. A fresh batch will replace it.
- Batch 10 was withdrawn, moved to home a1.

## Findings
- **Full checks here lose the same three projects to memory kills** (24 November): `gisday-angular:build-app`, `gisday-competitions-data-api:test` and `gisday-platform-data-api:test`, even with nothing else running at `CHECK_PARALLEL=4` and 16 GB. They pass run alone with `CHECK_PARALLEL=1`. A full check here is two runs.
- **The watcher cannot run while a batch is held** (24 November, 12:22 AM Central). `tools/queued.sh laptop` lists the held a11 as `unfinished`, and `tools/listen.sh` exits at once whenever that list is non-empty ("work waiting for laptop: a11"). So laptop pushes no idle heartbeats until a11 is replaced or marked done. This session's 30-minute backstop still pulls and reads `laptop/TASKS.md`, so new work is still picked up. A held state `queued.sh` can read, or a director's note that ends a11, would fix it; I have not changed either tool.
- `work/tools/gisday-release-check.cjs` clicks Auth0's Accept by itself. A read-only sign-in check would suit machines that only need to prove sign-in.
- After a dev server starts, the first browser request waits minutes for Vite's dependency bundling, with no log line when it finishes. A check run right after it needs a longer first timeout.
- The existing gallery smoke test ("choosing a basemap changes the map") is probably blocked on dev by #3279 as well. It was not run on its own, so this is not confirmed.
- One dev server serves one checkout. Before and after captures for a branch mean restarting `aggiemap-dev` on its worktree, about 2 minutes plus the first-load bundling. The same `tamu-js-dev-nm` volume serves any checkout with the same lock.

## Told directly
- Name `laptop`; job development, any project (the maintainer, 23 November 2026, when it joined).
- Set up GIS Day local here (CLAUDE_SETUP.md phase 6) (the maintainer, 23 November 2026, about 12:40 PM Central).
- Batch 1: ask the maintainer directly, in this chat, for every command this setup needs that the laptop cannot run (the maintainer, relayed by `work (gisday)` in batch 1, 23 November 2026).
