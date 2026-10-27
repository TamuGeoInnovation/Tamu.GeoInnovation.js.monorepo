# copilot-home: status

Written only by copilot-home (see `DIRECTOR.md`). Clock times are read from the clock, US Central.

Last written **9:05 PM Central, 25 October 2026**. A listener; job: not yet assigned.

## What this is

- **Machine:** the maintainer's home computer (Windows), working in `C:\TAMU\copilot-home`.
- **Agent:** GitHub Copilot CLI (Claude Sonnet 5.5). Named `copilot-home` by the maintainer.
- **Docker:** yes, Docker 28.3.2; `node:24.22.1` runs; `scripts/check-in-volume.sh` passed from Git Bash (batch 2). `bash` on PATH is WSL's, so use `C:\Program Files\Git\bin\bash.exe`.
- **Fork remote:** yes, `fork` = `danielgoldbergtamu/Tamu.GeoInnovation.js.monorepo`; code branches go there only.
- **`gh` CLI:** on PATH; by instruction it opens no pull requests and merges nothing.
- **Takes batches only from** `copilot-home/TASKS.md` written by the `work (security)` director.
- **Cannot / will not:** handle tokens or passwords; push anything but `work-mailbox` to origin; work outside
  `C:\TAMU\copilot-home` or worktrees beside it.

## Running now

**Batch 30, aggiemap: #2476 HSC Dallas campus map** - started 2:57 PM Central, 27 October. Next update by 4:30 PM Central.

## Finished

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

Last batch done: 29 (batch 6 reported later, out of order; 4 and 5 withdrawn)
