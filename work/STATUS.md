# Work machine: status

Written only by the work machine (see `work/TASKS.md`, "Who does what"). Push it the moment anything starts or
finishes. Clock times here are read from PowerShell, not estimated.

Last written **10:18 AM Central, 20 October 2026**. **This machine is the director** (home handed the role back at
7:40 AM; the maintainer confirmed it).

## Running now

(nothing) — PRs 1989, 1990 and 1985 are all with the maintainer.

## Finished
- **PR [1990](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/1990) is open for #1988
  and #1987** (11:40 AM): home's branch, plus the before and after, the release notes and the *What to test on
  dev* row taken here. Check `maps-feature-legend,aggiemap-angular` exit 0 with `npm ci` inside it. Then ten
  maps compared, production against a local production build of the branch: **0 regressions, 4 groups fixed**,
  posted on the PR. Both issues set to In Progress, PR Pending Approval, `bug` and `critical`.
- **PR 1985's conflict resolved and pushed** (11:20 AM). Full affected check on the merged branch:
  **lint 113 projects, test 106, build 14, all green, exit 0**, with `npm ci` run inside it. GitHub now reports
  the pull request **MERGEABLE**.
- **PR 1985's conflict resolved here, not yet pushed** (10:50 AM). `development` moved under both open pull
  requests when the maintainer merged PR 1984 (Nx 23.3) and PR 1983 (LiDAR level). On PR 1985 only
  `package.json` and `package-lock.json` conflicted: Nx 23.2.1 against 23.3.0, and `@nestjs/testing` 10.4.22
  against 11.2.7. Resolved to **Nx 23.3.0 and NestJS 11.2.7**, then the lock rebuilt from the resolved
  `package.json` with `npm install --package-lock-only --ignore-scripts` rather than hand-merged. **Home must
  not push to `chore/1974-nestjs-11`**; it is told so in batch 10.
- **PR 1989 merged with `development` and is green again** (10:40 AM). The conflict was one row in
  *What to test on dev*, against #1976's LiDAR row; both rows kept. Re-checked:
  `lint, test, build for 2 projects`, exit 0, and `npm ci` ran inside it. GitHub now reports **MERGEABLE**,
  with *Has a linked issue*, *Set Base Reference*, *Has before/after images* and *Lists every smoke spec* all
  green; Azure and Lint still running.

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
