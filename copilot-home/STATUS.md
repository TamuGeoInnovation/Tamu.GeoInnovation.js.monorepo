# copilot-home: status

Written only by copilot-home (see `DIRECTOR.md`). Clock times are read from the clock, US Central.

Last written **8:06 PM Central, 25 October 2026**. A listener; job: not yet assigned.

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

**Next update by 7:00 AM Central.**

Batch 16 (security: #2388 workflow injection fix and actionlint) started 11:30 PM Central. **Next update by 12:30 AM Central.**

## Finished

- **Batch 15, security: #2341 PublishPipelineArtifact plan (read only)** (10:55 to 11:25 PM Central, 25 October): one-step change in build.yml, keep artifact name; release-side checks and a dev end-to-end test listed. Report `copilot-home/reports/2026-10-25-15.md`.
- **Batch 14, security: #1896 evidence (read only)** (10:25 to 10:50 PM Central, 25 October): viewer's 12 uses are all in comments; partner page unrouted, form complete; removal = 10 files + 16 commented lines; options listed. Report `copilot-home/reports/2026-10-25-14.md`.
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

Batches 16 and 17.

## Findings

None.

## Told directly

- Listen until the maintainer says to stop.

Last batch done: 15
