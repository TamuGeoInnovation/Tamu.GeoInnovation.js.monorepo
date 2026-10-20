# Work machine: status

Written only by the work machine (see `work/TASKS.md`, "Who does what"). Push it the moment anything starts or
finishes. Clock times here are read from PowerShell, not estimated.

Last written **10:18 AM Central, 20 October 2026**. **This machine is the director** (home handed the role back at
7:40 AM; the maintainer confirmed it).

## Running now

(nothing) — PR 1989 is open and waiting on the maintainer.

## Finished

- **#1981 — PR [1989](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/1989) is open**,
  10:15 AM. Home's branch `fix/1981-business-parking-lots`, plus the before and after and the release notes taken
  here. Before is production; after is a local production build of the branch; both by the same script at
  1440x900, so they are comparable. The legend was measured as well as photographed: on production the two lot
  groups each have one row with **no** symbol in it, on the branch each has one with a symbol.
  `scripts/check-in-volume.sh fix/1981-business-parking-lots ts-events-ngx,aggiemap-angular` — *Successfully ran
  targets lint, test, build for 2 projects*, **exit 0**. Opened ready, assignee set, `critical`, project **Pending
  Approval**; #1981 set to **In Progress**. #1988 set to Bug / Medium and added to the board.
- **Batches 15 and 16** (`work/reports/2026-10-20-1.md`): the screenshot comparison on Release-486 (848 of 848,
  nothing above 10%) and the release tier (546/0/1/29, exit 0). **Tagged `dev-2026-10-20` on `8463ac6af`**, and
  `prod-2026-10-20` once it reached production.
- Batches 8 to 14 as recorded in the earlier reports in `work/reports/`.

## Paused, to pick up when the urgent fixes are in

The maintainer paused the AggieMap work on this machine, then cancelled what was still running when he got back.
These are what is left of it, and none has been restarted:

- **#1970** — the after image and the pull request (High).
- **#1975** — the images and the pull request.
- **The `prod-2026-10-20` screenshot set** — step 8 of the release sequence, not yet captured.
- **#1986's legend scan of every production map** — cancelled. It can no longer be proven against #1981 on
  production once PR 1989 is deployed, but #1987 is still live there, so the scan still has one real fault to
  find until home's fix for #1988 goes out.

## Findings

- **#1987 is #1988's symptom.** Home filed #1988 (the legend quotes every renderer value, so a numeric field is
  compared as a string and the server rejects the query) while finding #1981's cause, and wrote that any
  unique-value renderer on a numeric field still reaches that code. The freshman map's values are `1,1` and `0,1`.
  Home's batch 9 fixes both on one branch.
- **Home's `STATUS.md` clock is wrong.** It recorded batch 9 as starting at "12:15 PM Central" in a commit made at
  10:02 AM Central. Worth checking how it is reading the time — `TZ=America/Chicago date` returns UTC on these
  machines and labels it `GMT`, which is the trap CLAUDE.md warns about.

## Told directly

- 7:40 AM: this machine is the director again; home is the worker.
- 10:10 AM: take the images for #1981 and open the pull request.
