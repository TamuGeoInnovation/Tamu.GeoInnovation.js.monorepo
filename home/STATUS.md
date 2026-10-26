# Home machine: status

- **Agent:** Claude Code (AggieMap chat), the only listener on this machine
- **Machine:** home

Written only by the home session, while it listens (see `DIRECTOR.md`).

## Running now
**`home (aggiemap)`: a listener, nothing running** (7:45 AM Central, Friday 23 October 2026, as the maintainer leaves for work;
the work computer directs AggieMap when he gets there). No uncommitted work in its worktrees. The last batch it did was the
production watch: Release-490 (`36b962a04`) reached production by 7:06 AM Thursday 22 October.

The `home:` commits on 23 October (lab batch 14, codex-home batch 3, work batch 24, #2118) are the GIS Day chat's, which directs
GIS Day from home.

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
- 23 October, 11:20 PM (to the GIS Day chat, now home): **home directs GIS Day for the weekend.** Home was not down on 23 October; no chat on it was taking batches (#2250). From now on one listener per machine, and a handover names its running watcher and says Remote Control is on.
- 23 October, 7:40 AM (to the GIS Day chat): the maintainer is going to work; **home becomes a worker (listener)** and `work` becomes the director when he gets there. Everything is committed; `feat/2057-gisday-local-static` and `fix/1474-gisday-template-a11y` pushed to the fork.
- 22 October, 6:55 AM (to the GIS Day chat): **the work computer's GIS Day chat directs GIS Day**; this home GIS Day chat stays a listener and acts only on home batches headed "(gisday: ...)". Home's local GIS Day stack (UCGIS on 4201, txgisday.org on 4202) stays running.
- **7:45 AM Central, 21 October:** the maintainer set #2063's priority to Low (the handover's one open question). Done.
- 7:47 AM: become the listener now; carry on with `<arcgis-map>` as far as possible and report progress here.

## Findings
