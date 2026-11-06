# Home machine: status

- **Agent:** Claude Code (Listener chat), the only listener on this machine
- **Machine:** home

Written only by the home session, while it listens (see `DIRECTOR.md`).

## For the director: batches 22 and 23 were already DONE (about 11:05 AM Central, 30 October)

**The withdrawal at 10:46 AM came after both were finished and reported, so the lab's batch 179 and copilot-home's batch 51 repeat finished work.**
- **Batch 22 (#2564):** `chore/2564-remove-unused-dependencies` on the fork at `8784a5384`, all four removed (chart.js included), full check exit 0 twice, audit 14 to 13 low. Report `home/reports/2026-10-30-22.md` (pushed about 8:35 AM).
- **Batch 23 (deepmerge):** read only, report `home/reports/2026-10-30-23.md` (pushed about 7:55 AM); the way to zero proven in a scratch copy. Its two questions are 15 and 16 in `home/reports/2026-10-30-questions.md`.

The lab has started branching `chore/2564-remove-unused-dependencies` too (10:47 AM), the same name as home's pushed branch: **a push from it would collide with home's on the fork.**

## Running now
- **Batch 30** (aggiemap, #2655: network routes against straight-line distance), started 6 Nov about 5:55 AM Central. Reading #2655 and the two tools it follows.
  - 5:45 AM (an earlier copy of this line said 6:45; the clock was read wrong): `tools/network-detour/` working on `feat/2655-network-detour` (reconciliation tests red first against a positional join, then 17 green). quick: 112 committed pairs in about 40 s; finds 4 buildings that reach nothing on foot (DPDC, BFC, YMCA, Cushing Stadium). full (303,031 pairs, Walk, 8 workers) running since 5:53, about 59 pairs a second, finish about 7:20 AM.
  - 5:57 AM: README, `quick-pairs.json` and a section on `docs/testing.md` committed; full at 13,700 of 303,031.
  - 5:59 AM: check-in-volume exit 0 on `52871a414` (no Nx project; node --test 17 pass); branch pushed to the fork. Full at 20,500 of 303,031, about 55 a second.
- **Batch 29** (aggiemap, #2653: `tsgisHost` obeys the environment flag), started 6:30 AM Central, 5 November. Reading #2653, then a branch from `origin/development`, red test first.
  - 7:05 AM: both hosts re-measured for every service (agrees with #2653 except: Muster is on dev as `MusterParking_view`, fields identical, so it moves; 12 hosted views plus TS_Main stay, not 16). Red test committed on `fix/2653-tsgis-dev-host`: 30 services named. Writing the fix.
  - 8:25 AM: fix committed (`d91d832e3`); full affected check exit 0 (10 projects); `services.spec` on dev from the branch: 178 passed, now probing `gis.dev.tamu.edu/.../TS/...`. Dev server stalled at the Vite optimizer (#1955 symptom) during the before captures; restarted it.
  - 6 Nov 4:08 AM: branch pushed to the fork (`fix/2653-tsgis-dev-host`, `20241ac80`); merged `origin/development` `97980e99e` (conflicts in `connections.ts` and `gis-hosts.ts` resolved against PR 2619); release note committed, `collate --check` exit 0; full affected check re-running. Captures not done: dev server stalled at the Vite optimizer again, so no before/after images yet. Report next.
  - 6 Nov ~4:45 AM: full affected check on `20241ac80` exit 0 (10 projects). Report `home/reports/2026-11-05-29.md` pushed; PR 2667 open (director). Captures running (Vite cache cleared, four maps); images will be pushed to the branch.
  - 6 Nov ~5:15 AM: before captures taken on unfixed development (Business, Visitor, Aggieland Saturday all read `arc.ts.tamu.edu`; Big Event timed out, retrying). Retaking with the event-passed dialog dismissed, then the dev server moves to the fix commit for the after set.
  - 6 Nov 5:33 AM: before set retaken (3 of 4 maps; Big Event never reaches ready on unfixed development). Dev server now on the fix commit `d91d832e3` (40-minute first compile, no stall); after capture running.
  - 6 Nov 5:50 AM: third stall (after set, fix commit): every map timed out on page.goto. Stopped as the director asked. Before images for 3 maps pushed to the branch (`1e7278818`); report amended. Batch 29 done from home.
  - 6:04 AM: the full run stopped twice at 33,000 pairs on a fourth hazard: a batch none of whose pairs can be routed comes back as a 400 listing a reason per pair ("No route for", "is unlocated"), not as an empty answer. Fixed in `joinRoutes` with tests (`3053a9a4f`, `e07aa50c0`, pushed); the run resumed from its progress file at 33,200.
  - 6:19 AM: full run (resumed after two fixes): 69400/303031 pairs, 41.0 a second, about 95 min left
  - 6:34 AM: full run (resumed after two fixes): 103700/303031 pairs, 39.9 a second, about 83 min left

## Finished
- **Batch 28** (aggiemap; report `home/reports/2026-10-30-28.md`): #2593 branch ready: `fix/2530-graduation-republish` at `5c309f666`. Event Parking reads `/3` (filter kept: production's `/3` repeats the two closures), Road Closures `/2`, dev reads the new hosted view; Fall and Spring share one definition. Inverted filter check, `1=0` and date windows exempt by form, Move-In listed against #2612. Red on both environments, green locally; check exit 0. Two questions.
- **Batch 27** (aggiemap; report `home/reports/2026-10-30-27.md`): #2581 branch ready: `feat/2581-event-refresh-switch` at `8bb43d72b`. `EventConfiguration.gameDayRefresh { enabled, layers }`, applied in `eventLayerSources`; football (5 lots) and men's (3) folded in, women's off with Megan's request recorded; helper parameter dropped, its strict guards kept. Red 3 then green; guards pass before and after; `affected` exit 0. No release note (no visible change, checked).
- **Batch 26** (aggiemap, STOPPED on Megan's word; report `home/reports/2026-10-30-26.md`): #2581. branch ready: `chore/2581-athletics-refresh-option` at `acc45cbc2`, the helper's optional refreshInterval and its two strict guards only; no women's change, no release note; check exit 0. The full batch is kept as `feat/2581-womens-basketball-refresh` at `9411f5ffa` (red then green, exit 0; refresh seen in a browser). Men's cannot use the helper (popups differ). Two questions.
- **Batch 24** (aggiemap; report `home/reports/2026-10-30-24.md`): #2573 branch ready: `fix/2573-hatch-opacity` at `195b08df4`. Hatch strokes alpha 153; red then green; check exit 0. Before and after at zoom 16-18 on 1524 and Fort Worth: the label reads as one number, and at zoom 16 the building stays identifiable (the black outline carries it); 60% holds, no need for 75%. #2459's note updated.
- **Batch 25** (gisday; report `home/reports/2026-10-30-25.md`): #2574 branch ready: `fix/2574-gisday-admin-users` at `7743f1425`. getUsers stops at 1,000 and returns `{ users, truncated }`; `GET users?q=` searches name and email (v3); the page has a debounced search box and the cut-off line. Red then green; check exit 0. Screenshots skipped (Auth0 hosted sign-in); the lab could capture them.
- **Batch 23** (security; report `home/reports/2026-10-30-23.md`): deepmerge is the only remaining finding (13 low after batch 22). Not exploitable here (all inputs are compile-time definitions). Way to zero, proven in a scratch copy: a small deepMerge helper in libs/common/utils/object for our two imports, plus an npm overrides alias to a patched 4.3.2 for the jest and fork-ts-checker paths. Read only; two questions.
- **Batch 22** (security; report `home/reports/2026-10-30-22.md`, amended for chart.js): #2564 branch ready: `chore/2564-remove-unused-dependencies` at `8784a5384` (.pr-body.md last). Four dependencies (chart.js added) and 18 transitive packages out; full check (clean npm ci, 92 projects) exit 0, run again after chart.js; audit 14 low to 13.
- **Batch 21** (aggiemap; report `home/reports/2026-10-30-21.md`): #2558 branch ready: `feat/2558-mens-basketball-refresh` at `8e0ff2360`. Icons, closures and parking refresh every minute; red 3 of 3 then green; refresh seen in a browser (a re-check a minute, refetch on lastEditDate). Check exit 0. Started late: the watcher was down when it arrived.
- **Batch 20** (aggiemap; report `home/reports/2026-10-28-20.md`): #2061 branch ready: `chore/2061-layer-index` at `720263f1a`. Every event layerIndex deleted after measuring each map before and after; three meant orders moved into references (muster, graduation, dining kiosk). Found and fixed #2552: the dining kiosk opened the building popup for a dining location (red on production first). Docs: essential layers are outside the enum order. Check exit 0.
- **Batch 19** (aggiemap; report `home/reports/2026-10-28-19.md`): branch ready: `chore/2510-clear-baseball-exceptions` at `e9ab841e1`. All five production baseball entries were stale; with them removed both specs pass on production. Production draws both modes: lots in two colours, symbols, 3 closures, no errors. Check exit 0.
- **Batch 18** (aggiemap; report `home/reports/2026-10-28-18.md`): #2532 branch ready: `feat/2532-campus-hatch` at `47eee6556`. One shared hatch symbol for all three campuses; the #2506 wash and styleLayerPaint deleted; layer order found in the browser (the first layer-id enum entry draws on top), checked on 5 of 5 loads each. Check exit 0. An early push went out before a failed check was read; fixed and re-pushed.
- **Batch 17** (aggiemap; report `home/reports/2026-10-28-17.md`): #1961 branch ready: `fix/1961-restroom-building-number` at `0ccf5b7fd`. The named popup was unused since #418; the layer now opens it, reading BldgNum and hiding empty rows. Tests red then green; check exit 0. Filed #2529 (wrong building numbers in the service).
- **Batch 16** (aggiemap; report `home/reports/2026-10-28-16.md`): decisions carried out (#1267 closing condition, #1034 closed and #2527 filed, #1005 Medium, #1204 Low). Last four looked at on dev: #163 closed; #71, #141 and #387 commented and left open. Nothing pushed.
- **Batch 15** (aggiemap; report `home/reports/2026-10-28-15.md`): 13 issues triaged. Closed 5 with evidence (#967, #1006, #1027, #1036, #1202); 5 still wanted, commented (#954, #1005, #1034, #1204, #1267); 3 left for the maintainer (#959, #960, #962). Nothing pushed.
- **Batch 14** (aggiemap; report `home/reports/2026-10-28-14.md`): #657 is a service fault, filed as #2520 (both services return lots without geometry). branch ready: `fix/657-nsc-popup` at `5a60281ec`: popup rows for both maps, red without listing, known failures tied to #2520. Check exit 0.
- **Batch 13** (aggiemap; report `home/reports/2026-10-28-13.md`): 30 issues triaged. Closed 8 with evidence (#458, #463, #552, #594, #656, #827, #881, #916); 16 still wanted, with a line each; 6 left for the maintainer (#497, #543, #546, #602, #867, #885). #659 is a live server-side defect.
- **Batch 12** (aggiemap; report `home/reports/2026-10-28-12.md`): #2515 branch ready: `feat/2515-vector-basemap-production` at `5d747fdfd`. Vector default everywhere, production gallery = vector + raster, VTBase3 off the dev-only list, view limit kept at 1:282 with the smoke check following every offered basemap. Maps open one level closer (1:9,028 to 1:4,514): question 1. Check exit 0.
- **Batch 11** (aggiemap; report `home/reports/2026-10-28-11.md`): #2506. `feat/2506-campus-construction` at `ec74b5e77` on the fork (stacked on #2459). Side-by-sides for both campuses: before, A, B 25%, B 45%. Recommend B 25%; A reads as missing buildings at Fort Worth Law. Tests red then green; check exit 0. No PR.
- **Batch 10** (aggiemap; report `home/reports/2026-10-28-10.md`): #2459 branch ready: `feat/2459-hatch-layer` at `e081cc7ed` on the fork. Our own black outline over the hatch; 2x crop continuous; tests red then green; check exit 0. The lab measured 0 of 45 on `337047b1e`, not this head.
- **Batch 9** (aggiemap; report `home/reports/2026-10-28-9.md`): #2459 branch ready: `feat/2459-hatch-layer` at `f1aa31ca9` on the fork (#2506 caveat in the release note). Sprite override deleted; tests red then green; check exit 0; all eight buildings hatched; release note; density recommendation: ship as is.
- **Batch 8** (aggiemap; report `home/reports/2026-10-27-8.md`): #2459. The no-sprite prototype, `feat/2459-hatch-layer` at `cb1ea9c8b` on the fork, draws 1524 with an orange grid over grass (picture on the branch). `feat/2459-hide-only` at `158d5c4fa` for measuring the hide alone. Nothing blanks on this machine (deployed dev 0 of 15 too), so the lab must measure both.
- **Batch 7** (gisday; report `home/reports/2026-10-27-7.md`): #2498. `chore/2498-check-memory-env` at `acfd556dc` on the fork; test red then green (18 ok); check exit 0.
- **Batch 6** (aggiemap; report `home/reports/2026-10-27-6.md`): #2472 reproduces on demand. `--poll` with an empty dependency cache stalls; the Node process is saturated and esbuild sits idle. A bigger thread pool or a longer interval does not help. Workaround: prime the cache without `--poll`. Nothing pushed.
- **Batch 5** (aggiemap; report `home/reports/2026-10-27-5.md`): #2453. branch ready: `fix/2453-baseball-republish` at `934da19f2` on the fork. Spec red then green, check exit 0, before/after committed. One question for the director.
- **Batch 4** (security; report `home/reports/2026-10-26-4.md`): #2425's clean branch pushed to the fork as `chore/2425-api-images-non-root-2` at `160f65e80`.
- **Batch 3** (security; report `home/reports/2026-10-26-3.md`): #2425. All four images run as `node` and the check exits 0 (`160f65e80`, on this machine only: the force-push to the fork was refused; question 1). The GIS Day volume must be writable by uid 1000 before deploying.
- **Batch 2** (security; report `home/reports/2026-10-26-2.md`): zod override on `chore/override-zod` (`29d2e1bc9`). Check exit 0, 13 image tests pass, resizing byte-identical to development on three photos. Admin-page upload not done (Auth0 sign-in); one question for the director.
- **Batch 1** (security; report `home/reports/2026-10-26-1.md`): security-findings tests at `be9581cdc`, 18 pass, 0 fail; roster table without its private column; one question for the director.
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
- 26 October, 6:32 AM (to the new Listener chat): **this chat is the only listener on `home`**, for task directions from whoever directs. The AggieMap chat's watcher (running since 8:34 PM 25 October) was stopped; that chat no longer listens.
- 23 October, 11:20 PM (to the GIS Day chat, now home): **home directs GIS Day for the weekend.** Home was not down on 23 October; no chat on it was taking batches (#2250). From now on one listener per machine, and a handover names its running watcher and says Remote Control is on.
- 23 October, 7:40 AM (to the GIS Day chat): the maintainer is going to work; **home becomes a worker (listener)** and `work` becomes the director when he gets there. Everything is committed; `feat/2057-gisday-local-static` and `fix/1474-gisday-template-a11y` pushed to the fork.
- 22 October, 6:55 AM (to the GIS Day chat): **the work computer's GIS Day chat directs GIS Day**; this home GIS Day chat stays a listener and acts only on home batches headed "(gisday: ...)". Home's local GIS Day stack (UCGIS on 4201, txgisday.org on 4202) stays running.
- **7:45 AM Central, 21 October:** the maintainer set #2063's priority to Low (the handover's one open question). Done.
- 7:47 AM: become the listener now; carry on with `<arcgis-map>` as far as possible and report progress here.

## Findings
