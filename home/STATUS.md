# Home machine: status

- **Agent:** Claude Code (Listener chat), the only listener on this machine
- **Machine:** home

Written only by the home session, while it listens (see `DIRECTOR.md`).

## Running now
**Batch 8** (aggiemap: #2459, the construction hatch as a layer instead of a sprite; a prototype), started 10:10 PM Central, Tuesday 27 October 2026, from `work (aggiemap)`.
Next update by 10:25 PM Central (progress every 15 minutes).

Progress (10:11 PM): prototype built (the hatch as a FeatureLayer with a CIM grid hatch in the vector basemap, 8 buildings from TAMU_Basemap_20261008/2; the sprite override not applied). The control build of today's development is compiling; then 15 plain loads of each, as the lab measured.
Progress (10:11 PM): control build still compiling; measurement script written (lab's method: warm-up, then 15 loads, 30 s of 700 x 700 samples after ready).
Progress (10:15 PM): read the 10:35 PM note. Measuring now: the first prototype (hatch layer over the published fill; its layer loads 8 buildings), then the control. Added the fill-hiding half (setStyleLayerVisibility on .../Currently Under Construction/1, the outline /0 kept); 'hide only' and 'hide + hatch' are built and measured next.
Progress (10:24 PM): first prototype, 12 of 15 loads measured so far, 0 blank.
Progress (10:39 PM): prototype: 0 of 15 blank. Control (today's development, sprite override on): 12 loads so far, 0
0 blank.
Progress (10:54 PM): served as a static build, neither blanks here: the first prototype 0 of 15, the control (sprite override on) 0 of 15 as well. So static-build numbers prove nothing; measuring the control on the dev server, as the lab did, to see whether it reproduces: 11 loads so far, 0 blank.
Progress (11:07 PM): the full prototype draws what was asked: 1524 with an orange grid hatch, grass between the lines, black outline (picture taken). The control does not reproduce the lab's blanks here, on a static build or the dev server (0 of 15 each). From dev.localhost, CORS blocks more than ten of the map's layers, so loads are not like dev's. Re-measuring with the measuring browser's CORS off, so every layer loads.
Progress (11:09 PM): control with every layer loading: 1 of 15 loads so far, 0 blank.
Progress (11:24 PM): control with every layer loading: 0 of 15 blank. Now measuring deployed dev from this machine, to tell this machine from the local setup: 5 loads so far, 0 blank. Then: do the two datasets agree, building by building.
Progress (11:38 PM): **pushed: `feat/2459-hatch-layer` on the fork at `6ce2722d4`** (prototype `6a24e887b`, pictures `6ce2722d4`). Build it like any branch; it needs no config. The picture is `docs/screenshots/2459-construction-hatch/prototype-1524.png` on the branch: 1524 with an orange grid hatch, grass between the lines, black outline. Beside it `hide-only-1524.png` (fill hidden, no hatch) and `control-1524.png` (today's development, pink). Here nothing blanks: deployed dev 0 of 15, the control 0 of 15, the prototype 0 of 15; this machine does not reproduce it. Report to follow.
## Finished
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
