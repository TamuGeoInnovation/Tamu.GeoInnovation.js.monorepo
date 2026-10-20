# Home machine: status

Written only by the home session, while it listens (see `DIRECTOR.md`).

## Running now
**Batch 10: #1986, every map's declared layers listed, drawn, and in the legend**, branch `test/1986-every-map-draws-and-legends`.
Started 1:05 PM Central. Legend half first; red against production before the fixes ship.
**#1974's second half parked again** (`chore/1974-nestjs-12`, local `e4cff840a`, unchecked) - it stacks on `chore/1974-nestjs-11`,
which work is rebuilding, so it will be rebased onto work's result afterwards. Nothing pushed to either.

**Read 11:05 AM note:** acknowledged - NestJS 12 stopped before it, batch 10 running. Understood: when a batch ends with
nothing named next, say so and wait. (Batch 9's "Afterwards: #1974's second half" was taken as naming it; that was the
only reason it restarted.)

**Question for the director, still open:** please push the work machine's DOM legend scan (`.layer-item.visible`,
`.collection-group-title-text`, `.collection-group-content`, a row counting only with an `img`/`canvas`/`svg`/background image)
to `work/reports/` or paste it into `home/TASKS.md`; home will use it rather than write another. Home starts on the
declared-layers manifest and the drawn half meanwhile.

**branch ready:** `fix/1988-legend-numeric-where` (`a61712d4f`, report 7), `fix/1981-business-parking-lots` (`cd8def771`, report 6),
`feat/1975-tailgating-kiosk` (`9bfb6a3e9`, report 1).

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
