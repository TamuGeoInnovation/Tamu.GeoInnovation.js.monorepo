# copilot-home: status

Written only by copilot-home (see `DIRECTOR.md`). Clock times are read from the clock, US Central.

Last written **5:30 PM Central, 30 October 2026**. A listener; job: not yet assigned.

## What this is

- **Machine:** the maintainer's home computer (Windows), working in `C:\TAMU\copilot-home`.
- **Agent:** GitHub Copilot CLI (Claude Sonnet 5.5). Named `copilot-home` by the maintainer.
- **Docker:** yes, Docker 28.3.2; 
ode:24.22.1` runs; `scripts/check-in-volume.sh` passed from Git Bash (batch 2). `bash` on PATH is WSL's, so use `C:\Program Files\Git\bin\bash.exe`.
- **Fork remote:** yes, `fork` = `danielgoldbergtamu/Tamu.GeoInnovation.js.monorepo`; code branches go there only.
- **`gh` CLI:** on PATH; by instruction it opens no pull requests and merges nothing.
- **Takes batches only from** `copilot-home/TASKS.md` written by the `work (security)` director.
- **Cannot / will not:** handle tokens or passwords; push anything but `work-mailbox` to origin; work outside
  `C:\TAMU\copilot-home` or worktrees beside it.

## Running now

Idle: nothing running. Last batch done: 52 (aggiemap: #2580 hide car and bus modes), 30 October 2026.

**Clock note:** this machine's clock is right (Central Standard Time; PowerShell said 12:02 AM Central, 28 October). My batch 35 report's "11:40 PM to about 1:00 AM" was an estimate, not a reading, and the 1:00 AM end was wrong: it finished about 11:55 PM. Do not trust elapsed times in my earlier reports to better than about an hour.

## Finished

- **Batch 52, aggiemap: #2580 hide the car and bus modes** (about 1:30 to 3:10 PM Central, 30 October 2026): branch `feat/2580-hide-car-bus-modes` at `50c7e21fd24af75d3d3dffbe3780f11002877667` on the fork; modes 3,4,5,6,8 hidden by one list, 1,2,7 remain; a hidden-mode link opens as walking; red first (4 failed), check exit 0; before/after screenshots; release note. Report `copilot-home/reports/2026-10-30-52.md`.

- **Batch 51, aggiemap: #659 routing on Megan's new network** (30 October 2026): branch `feat/659-routing-new-network` at `cbf323dda479732f6f69a332e09944f6b6f59c82` on the fork; development only, planner modes matched to the network's by name; a whole trip with directions works in a local dev run, production shows none; check exit 0. #659 not closed. Report `copilot-home/reports/2026-10-30-51-aggiemap.md`.

- **Batch 51, security: deepmerge, the last vulnerability** (read only, 30 October 2026): no upstream (jest-config 30.5.2, fork-ts-checker 9.1.0, @nx 24.0.2) has dropped deepmerge and no fixed version exists; three call sites in our code; recommend deepmerge-ts for those and a patch or vetted override for dev paths. Nothing pushed but the report `copilot-home/reports/2026-10-30-51.md`.

- **Batch 50, gisday: #2496 poster gallery** (7:54 to about 8:24 AM Central, 30 October 2026): fixed. The gallery's route `GET user-submissions/posters` was swallowed by the guarded `:guid` route (401); a public route now returns title, authors, link and year of accepted posters, and the gallery has a season list. Branch `fix/2496-gisday-poster-gallery` at `3947c8f3b40e17a3e096af07287d7db89ce53658` on the fork; red first, check exit 0; before and after screenshots. Nothing closed. Report `copilot-home/reports/2026-10-30-50.md`.

- **Batch 49, aggiemap: #2521 Road Closures legend has no symbol** (7:54 AM Central, 30 October 2026): does not reproduce on development or production (the legend draws the hatch swatch; the service was edited after the issue was filed); no code fix. Branch `fix/2521-road-closures-legend` at `a9502d70d18d665edd03c32770da77b90cc2552f` on the fork removes the four stale known-failure entries; layers check passes on both environments without them; check exit 0. Nothing closed. Report `copilot-home/reports/2026-10-30-49.md`.

- **Batch 48, aggiemap: #2034 linked feature showing its template text** (12:48 to about 1:10 PM Central, 28 October): does not reproduce on a local production build of `development`, dev or production, for the building, lots and accessible layers and `?lot=`; the Team Bus layer was removed in #2468 and the `sp_sh_notes` template is dead code. Nothing pushed, nothing closed. Report `copilot-home/reports/2026-10-28-48.md`.

- **Batch 47, aggiemap: #1540 controls dead while a popup is open** (12:30 to about 12:50 PM Central, 28 October): does not reproduce on development or production, desktop or phone; it is #1806, fixed by PR 1813 (panel ownership, not pointer events). Nothing pushed, nothing closed. Report `copilot-home/reports/2026-10-28-47.md`.

- **Batch 46, aggiemap: #2536 pink sprite after switching basemaps** (about 11:15 to 11:40 AM Central, 28 October): branch `fix/2536-basemap-switch-sprite` at `e385db2bbca266c2085c8b910d7219c8a3f6730b` on the fork; the gallery's copy now goes through `makeBaseLayer` and carries every base layer; unit test red (4 failed) then green; smoke round-trip test red on a development build, green on this branch; check exit 0; before/after screenshots. Report `copilot-home/reports/2026-10-28-46.md`.

- **Batch 45, aggiemap: controls a keyboard cannot reach (read only)** (about 11:15 AM Central, 28 October): 212 template hits, 81 without key handling, 34 real or arguable plus 13 host-click components and 48 
outerLink on non-anchors; rules are off in six projects and blind to host listeners, 
outerLink and mousedown. One issue filed: #2535 (Task, bug). Nothing pushed but the report copilot-home/reports/2026-10-28-45.md.

- **Batch 43, aggiemap: #2398 and the live check on #1539** (9:35 AM Central, 28 October): branch `chore/2398-remove-womens-parking-url` at `63401716cd2b5c5e72b3537158fd34dd637cbef7` on the fork; nothing else reads the property; services.spec.ts green on development (177 passed) and production (180 passed, 1 unrelated flaky) with no allowed-failure entry; check exit 0. #1539 had a visible marker, so it is closed as obsolete. Report `copilot-home/reports/2026-10-28-43.md`.

- **Batch 42, aggiemap: triage the October issues (read only)** (9:13 AM Central, 28 October): 18 issues checked, none closed (the count was 0 on purpose); #2075 is not clean (production nightly red every night since 15 Oct) and #2398 is still live; needs-maintainer: #2039, #2275, #1600. Nothing pushed but the report `copilot-home/reports/2026-10-28-42.md`.

- **Batch 41, aggiemap: the label goes above on desktop too** (8:53 AM Central, 28 October): no new commit; batch 40's redo already did it. Branch `fix/2458-campus-labels-above` at `f31551ae86bece781eb0593a631e8778c78b8c47` on the fork; desktop re-measured (campus page row pitch 218 to 250 px, above-the-fold count unchanged at 6). Report `copilot-home/reports/2026-10-28-41.md`.
- **Batch 40, aggiemap: #2458 campus names above their pictures at every width** (about 8:36 to 8:52 AM Central, 28 October; redone after the director's 8:43 note): branch `fix/2458-campus-labels-above` at `f31551ae86bece781eb0593a631e8778c78b8c47` on the fork; name first in the markup, above its picture on both pages at every width; campus page desktop rows 218 to 250 px pitch, picture to next name 4.8 to 36.8 px, cards on /all-maps 16 to 32 px on a phone; red (2 failed) then green; check exit 0; release note rewritten. Report `copilot-home/reports/2026-10-28-40.md`.
- **Batch 39, aggiemap: #2514 measuring a map that is blank only sometimes** (about 7:30 to 7:45 AM Central, 28 October): branch `docs/2514-measuring-blank-maps` at `a55d6bed7d616d03efe8132c79301a227a1caca8` on the fork; new section and callout in `docs/testing-maps.md`; release-notes check exit 0; LF. Report `copilot-home/reports/2026-10-28-39.md`.
- **Batch 38, aggiemap: #2511 services that describe themselves inconsistently** (about 2:30 to 2:49 AM Central, 28 October): branch `test/2511-service-self-consistency` at `a95506a82e718f73892b99d220235db77ce4d626` on the fork (stacked on PR 2504's branch); new `service-metadata.spec.ts` (objectIdField, displayField, count query); #2510 is a tracked known failure; production reports exactly `baseballParkingUrl/2`, development clean; check exit 0. Report `copilot-home/reports/2026-10-28-38.md`.
- **Batch 37, aggiemap: #2458 the right page (/all-maps/campus)** (12:23 AM to 12:37 AM Central, 28 October): branch `fix/2458-campus-name-spacing` at `125b14169f424ad05baf6df8acd7bcbd90495890` on the fork; name-to-next-picture 5 px to 21 px on a phone, desktop geometry identical; check exit 0; no test, with the reason. Report `copilot-home/reports/2026-10-28-37.md`.
- **Batch 36, aggiemap: #2458 campus map name spacing on a phone** (12:05 AM to 12:18 AM Central, 28 October): branch `fix/2458-campus-name-spacing` at `d18d8dcaea400d916266aae749e800991d8e4818` on the fork; check exit 0; before/after screenshots at phone and desktop width (desktop identical to the pixel); no test, with the reason. The issue's diagnosis was slightly off (the 12 px is to the description, not the previous card). Report `copilot-home/reports/2026-10-28-36.md`.
- **Batch 35, aggiemap: #2500 baseball portal renderers** (11:40 PM to about 1:00 AM Central, 27 to 28 October): branch `fix/2500-portal-renderer-fields` at `458864a3290f3e8893910953a3367cc73484de1e` on the fork; red (5 failed) then green; check exit 0; smoke spec on production 81 passed, fails on exactly the three baseball layers with the allow-list removed; development 81 passed. Report `copilot-home/reports/2026-10-27-35.md`.
- **Batch 34, aggiemap: #2487 blank-map smoke check** (10:30 PM to 11:05 PM Central, 27 October): branch `test/2487-blank-map-smoke` at `26c9123a4360f758c617ddee3814eaae9ae263e1` on the fork; red 6 of 6 with 2481 merged, green 12 of 12 on development locally, 1 of 18 blank on shipped dev. Report `copilot-home/reports/2026-10-27-34.md`.
- **Batch 33, aggiemap: #2494**: branch `fix/2494-sort-campus-list` at `af0c384705ad4cffbbe8e0bf4b5b63e30885db28` on the fork. Report `copilot-home/reports/2026-10-27-33.md`.
- **Batch 32, gisday: #2497** (= the work reported as batch 31, renumbered): branch `fix/2497-gisday-eligibility-dates` at `b763e3ac210d7a190e9e5768b2300500e9c11544` on the fork. Report `copilot-home/reports/2026-10-27-32.md`.

- **Batch 31, gisday: #2497 eligibility dates** (about 7:57 to 8:20 PM Central, 27 October): branch `fix/2497-gisday-eligibility-dates` at `b763e3ac210d7a190e9e5768b2300500e9c11544` on the fork, from `fix/2460-gisday-vgi-dates` because PR 2495 had not merged; red (1 failed) then green; check exit 0; before/after screenshots. Report `copilot-home/reports/2026-10-27-31.md`.
- **Batch 30, aggiemap: #2476 HSC Dallas as two campus maps** (2:57 to about 3:50 PM Central, 27 October): branch `feat/2476-hsc-dallas` at `15978cf844c7edb353eb685c4a6a15a08b5185ff` on the fork; red then green (search lib 2 failed, campus specs 3 failed); check exit 0 (4 projects, adding ui-kits-ngx-search for the new `fixedWhere`); screenshots of both maps and eleven campuses. Report `copilot-home/reports/2026-10-27-30.md`.

- **Batch 29, aggiemap: four satellite campuses (#2455, #2456, #2457, #2464)** (12:21 PM to about 2:30 PM Central, 27 October): branch `feat/2455-2457-2464-four-campuses` at `d668b56c3f5850fdf7a7c1510a5f51c9a8e2663c` on the fork; red (5 failed) then green (57 passed); check exit 0; screenshots. Campuses not added to DEVELOPMENT_ONLY_SERVICES (production loads them on a direct URL); see report `copilot-home/reports/2026-10-27-29.md`.

- **Batch 28, gisday: #2460 VGI competition dates** (11:50 AM to about 12:35 PM Central, 27 October): branch `fix/2460-gisday-vgi-dates` at `9260c265b68e26ea5ba75abce979398c0a6af0e1` on the fork; red (4 failed) then green (4 passed); check exit 0; before/after screenshots and release note. Report `copilot-home/reports/2026-10-27-28.md`.

- **Batch 27, security: #2122 the 10 dependencies knip calls unused (read only)** (5:35 to about 6:30 PM Central, 26 October): 3 removable (@angular/language-service, @nx/web, @oxc-project/runtime; full check exit 0 without them), 7 needed (jest-environment-jsdom removal failed 16 test targets). Nothing pushed but this report copilot-home/reports/2026-10-26-27.md.

- **Batch 26, gisday: #2431 Texas A&M site drops three Explore Events links** (12:40 PM to about 1:10 PM Central, 26 October): branch `feat/2431-gisday-tamu-home-links` at `fafc7614c324fedced9835c0ed15ef377668abd7` on the fork; red (1 failed) then green; four screenshots; check exit 0 (only with a lower-memory copy of the script; the stock one was OOM-killed three times). Report `copilot-home/reports/2026-10-26-26.md`.
- **Batch 25, gisday: remove 19 unused GIS Day files** (12:35 to about 1:25 PM Central, 26 October): branch `chore/gisday-remove-unused-files` at `ff19d196776ec77a9d72d9cd97e75a3d22191f99` on the fork; full check exit 0; public routes 11 passed on the local build. Report `copilot-home/reports/2026-10-26-25.md`.
- **Batch 24, gisday: #2426 photo never larger** (11:55 AM to about 12:30 PM Central, 26 October): branch `fix/2426-gisday-photo-never-larger` at `2f56a66703a09225adaf050caacc9925fe85ddc5` on the fork; red (274,491 to 696,745 bytes) then green (141,556); check exit 0. Report `copilot-home/reports/2026-10-26-24.md`.
- **Batch 23, gisday: #2422 speaker photo preview** (10:05 to about 10:35 AM Central, 26 October): branch `fix/2422-gisday-speaker-photo-preview` at `e9e95440db8ae0df4039f59c8844f6eb7ab010ad` on the fork; red (3 failed) then green (7 passed); check exit 0. Report `copilot-home/reports/2026-10-26-23.md`.

- **Batch 6, security: #1218 second review of the chart.js 4 branch (read only)** (9:01 to 9:05 PM Central, 25 October): branch already merged as PR 2332; registrations and colour rules match, lock clean, 14-day rule met; latent differences only (line fill/tension, colour persistence). Report `copilot-home/reports/2026-10-25-6.md`. Batches 4 and 5 were withdrawn by the director.

- **Batch 17, security: #2122 stale references** (12:20 to 12:40 AM Central, 26 October): branch `chore/2122-stale-references` at `1017882b54b85d22db9aae6a54595d6f20015487` on the fork; check exit 0. Report `copilot-home/reports/2026-10-25-17.md`.
- **Batch 16, security: #2388 workflow injection and actionlint** (11:30 PM to 12:15 AM Central, 25 to 26 October): branch `ci/2388-workflow-injection` at `c713627a231f03909e4d0ef5e800b8a7a2756cc4` on the fork; actionlint red (exit 1) then green; check exit 0. Report `copilot-home/reports/2026-10-25-16.md`.
- **Batch 15, security: #2341 PublishPipelineArtifact plan (read only)** (10:55 to 11:25 PM Central, 25 October): one-step change in build.yml, keep artifact name; release-side checks and a dev end-to-end test listed. Report `copilot-home/reports/2026-10-25-15.md`.
- **Batch 14, security: #1896 evidence (read only)** (10:25 to 10:50 PM Central, 25 October): viewer's 12 uses are all in comments; partner page unrouted, form complete; removal = 10 files + 16 commented lines; options listed. Report `copilot-home/reports/2026-10-25-14.md`.
- **Batch 19, security: #2122 evidence for knip's 40 unused files (read only)** (6:56 to 7:25 AM Central, 26 October): geoprocessing-v4 and feature-highlight are wholly dead; gisday check-in admin tree is a dead island; signage-angular is already unbuildable. Report `copilot-home/reports/2026-10-26-19.md`.
- **Batch 18, security: runner check (read only)** (6:48 to 6:55 AM Central, 26 October): development e9581cdc; audit 11 total (9 high), prod 9 high. Report `copilot-home/reports/2026-10-26-18.md`.
- **Batch 13, security: second review of PR 2383 (read only)** (9:50 to 10:20 PM Central, 25 October): PR already merged (`9ea0d7a60`); one dead route that now throws, a stale nx.json glob, stale prose. Report `copilot-home/reports/2026-10-25-13.md`.
- **Batch 12, security: second review of PR 2386 (read only)** (9:22 to 9:48 PM Central, 25 October): all 16 removed packages safe; PR was already merged (`100c1c4e9`). Report `copilot-home/reports/2026-10-25-12.md`.
- **Batch 11, security: #2351 raster basemap test** (8:55 to 9:20 PM Central, 25 October): branch `fix/2351-raster-basemap-test` at `f9ed1dad36efd56ba78a618c5b75b4d4883e42bf` on the fork; red then green on production; check exit 0. Report `copilot-home/reports/2026-10-25-11.md`.
- **Batch 10, security: #2379 upload-limit timeout** (8:15 to 8:50 PM Central, 25 October): branch `fix/2379-upload-limit-timeout` at `f16d98fed296856fe93d677f6e74dcf12da2a27f` on the fork; check exit 0; 10 runs under load max 134 ms. Report `copilot-home/reports/2026-10-25-10.md`.
- **Batch 9, security: #2385 knip configuration** (7:50 to 8:05 PM Central, 25 October): branch `chore/2385-knip-config` at `4f5141b9100294d70252ba5ef6ba4b235dbdb505` on the fork; check exit 0; unused files 787 to 40. Report `copilot-home/reports/2026-10-25-9.md`.

- **Batch 8, security: #2335 what every CI token can reach** (7:47 to 7:52 PM Central, 25 October): branch `ci/2335-least-privilege` at `4be2feaf61ab2bde84e9a463611adae9f2ecacb4` on the fork; check exit 0. Report `copilot-home/reports/2026-10-25-8.md`.
- **Batch 7, security: #2334 malware scanner comparison (report only)** (7:43 to 7:47 PM Central, 25 October): report `copilot-home/reports/2026-10-25-7.md`. Recommends OSV-Scanner `MAL-` records in the daily scan; Socket app optional.
- **Batch 3, security: #1218 second review of ngx-datatable 25 (read only)** (6:23 to 6:30 AM Central, 24 October): report `copilot-home/reports/2026-10-24-3.md`. One likely cosmetic finding (dead `datatable-selection .empty-row` selector).
- **Batch 2, security: Docker check and build agent README fix** (6:19 to 6:22 AM Central, 24 October): `fork/docs/build-agent-readme-sizes` at `5d23d905c7adb9e6531f70d3d9aa1b7caf3402b4`; check exit 0; Docker 28.3.2 works. Report `copilot-home/reports/2026-10-24-2.md`.
- **Batch 1, security: #1218 second review of marked 18 (read only)** (6:17 to 6:18 AM Central, 24 October): report `copilot-home/reports/2026-10-24-1.md`. Findings: the branch carries 28 commits beyond development; marked 18.1.1 is 12 days old (#2292).

## Queued

None.

## Findings

None.

## Told directly

- Listen until the maintainer says to stop.

Last batch done: 51
