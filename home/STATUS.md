# Home machine: status

- **Agent:** Claude Code (Listener chat), the only listener on this machine
- **Machine:** home

Written only by the home session, while it listens (see `DIRECTOR.md`).

## Running now
Nothing. Idle and listening.

## Finished
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
