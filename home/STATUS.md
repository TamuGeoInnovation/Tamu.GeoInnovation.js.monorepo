# Home machine: status

Written only by the home session, while it listens (see `DIRECTOR.md`).

## Running now
**Batch 6: the release tier against production.** Started about 9:30 AM Central, from `C:\TAMU\wt-prod` at `8463ac6af`.
Production confirmed: `prod-2026-10-20` resolves to `8463ac6af`; production serves `main-AYJ2SDWT.js` (was `main-TK2R62YY.js`).
Nothing else heavy on home while it runs: **#1974's second half is parked** (`chore/1974-nestjs-12`, local commit `279d945ba`,
unchecked, not pushed; its check was stopped).

**Batch 6 task 3 done:** opened **PR 1984** (#1972, Nx 23.3; `dependencies`, `no-visible-change` with its reason in a comment)
and **PR 1985** (NestJS 10 to 11; `dependencies`, `bug`; `Closes #1978` - the sign-out fix and its test are in it - and "Part of
#1974", so #1974 stays open for 12). Both ready for review, assignee set, both projects (Pending Approval / In Progress). Merge
1984 first: 1985 and #1973 then need `development` merged in for the lock file.

**branch ready:** `feat/1975-tailgating-kiosk` (`9bfb6a3e9`, report 1) - its PR is work's, with the images.

## Finished
- **Batch 4** (reports 5 and 6): #1954 merged with development; #1960 pushed, red-first tests, check exit 0. Filed #1961.
- **Batch 3** (report `home/reports/2026-10-19-4.md`): #1954 pushed, red-first tests, check exit 0.
- **Batch 2: the release notes updated** (`docs/releases/2026-10-19.md`, branch `docs/release-2026-10-18`, commit
  `498a24076`, in `C:\TAMU\wt-notes`; not pushed, no PR, not merged). Release-484 / build 20261019.5 / `8951a6364`; the
  tier as handed over, written from the idle re-run, with the contention named as a testing-machine fault; held on
  #1951; no `dev-*` tag claimed; gaps marked TO COME for the comparison and a clean rerun; #1950/#1952/#1953 not listed.
  Links and LF checked. Commented on #1935. Batch 2 task 2 (#1949) needs nothing: it is PR 1950 already.
- **Batch 1** (report `home/reports/2026-10-19-3.md`): #1952 and #1953 pushed, checks exit 0, red-first tests.
- **#1949, Esri's map components** (report `home/reports/2026-10-19-2.md`): PR 1950 open for the next round; full check
  exit 0; one question for the director.
- **The event popup directions failure** (report `home/reports/2026-10-19-1.md`): not the release. Transportation
  Services' map server fails about half its queries, production included. No code changed. Four questions for the director.

## Told directly
- 7:47 AM: become the listener now; carry on with `<arcgis-map>` as far as possible and report progress here.

## Findings
