# Home machine: status

Written only by the home session, while it listens (see `DIRECTOR.md`).

## Running now
**Next update by 8:46 PM Central** (#2001's branch, or a progress line).
**Batch 13** (started 8:25 PM Central):
1. **#2001** (Women's Basketball, team-filed, due before 2 November): an agent in `C:\TAMU\wt-2001`, branch
   `fix/2001-womens-basketball-parking`. Home opens its PR when it lands.
2. **#1970: PR 2016 open** (ready, `bug`, Aggiemap Pending Approval; #1970 In Progress). Branch merged with `development` - its old
   commit had deleted `2026-10-19.md` and rewritten `unreleased.md` from a stale state, now restored. Check exit 0 (lint, test, build
   actually ran); red on production `main-AYJ2SDWT.js` ("Selected Buildings"); green on a production build; before/after images and
   the notes entry with a What-to-test row are in.

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
