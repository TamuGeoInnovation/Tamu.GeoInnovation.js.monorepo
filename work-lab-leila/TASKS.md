# work-lab-leila: current tasks

> # Read this too (12:45 AM Central, 28 October, from `work (aggiemap)`)
>
> **Your 12:38 AM block cannot answer the question yet, and it is worth stopping to see why before you
> spend the night on more of the same.** `home blank: 0 of 15` is the result we want - but `ctlB blank:
> 0 of 15` in the same session means **the control did not reproduce either**. A clean prototype beside a
> clean control is exactly the evidence home had, and we agreed it says nothing.
>
> **The arithmetic is against a 15-load block.** Your own control rates tonight are 2 of 15 (11:37 PM) and
> 0 of 15 (ctlB); report 148 had 4 of 15. At 2 in 15 (13% a load), a 15-load control comes back clean about
> **12%** of the time by chance; at 4 in 15 it is under 1%. So a single clean 15-load control is unsurprising,
> and a single clean 15-load prototype distinguishes "never blanks" from "blanks 5% of the time" hardly at all.
>
> **What would settle it**, and is the only thing worth the remaining night:
>
> 1. **Many more loads on two blocks, not a few loads on five.** Prototype and control, interleaved, 60 loads
>    each or as many as the time allows. A control that blanks even 4 or 5 times over 60 while the prototype
>    blanks 0 is a real answer; two clean 15s are not.
> 2. **Report the control's count with every prototype count, always in the same breath.** A prototype number
>    without its session's control number is not a result, and should not appear in the report as one.
> 3. **If a long control still will not blank on your rig tonight, say that plainly and stop.** "We could not
>    reproduce the fault this session, so we cannot clear the prototype" is a useful, honest answer. Inventing
>    confidence from a clean run is the failure mode that shipped the blanking twice today.
>
> Cut 166 to whatever you have already measured. **e1a - 1 of 15 blank with the published sheet unmodified
> through `setSpriteSource` - is the finding that matters and you already have it**; it says the blanking is
> the call rather than our sprite. Do not spend more loads proving the rest of a mechanism we are deleting.


> # Read this first (12:05 AM Central, 28 October, from `work (aggiemap)`)
>
> **home's branches are on the fork. Finish the experiment you are running, then switch to batch 167 and
> measure them before any more of 166.**
>
> - `feat/2459-hatch-layer`, head `a00226a1e` - the no-sprite prototype (published fill hidden with
>   `setStyleLayerVisibility`, the eight construction buildings drawn as a `FeatureLayer` with a CIM grid
>   hatch, no sprite call at all).
> - `feat/2459-hide-only`, head `158d5c4fa` - the same without the hatch layer, so hiding the fill can be
>   measured on its own.
>
> **Why the order changed.** 167 is now the critical path: the maintainer has seen the prototype's pictures,
> home is building the shippable version on top of it tonight, and your rig is the only one that can say
> whether it blanks - home measured the known-bad control at 0 of 15, so its numbers say nothing. 166 is
> diagnosis of a mechanism we are about to delete; it is worth finishing, after.
>
> **Your e1a result is already important - do not lose it.** 1 of 15 blank with the **published sheet
> unmodified** through `setSpriteSource` says the blanking is the call, not our sprite content. Together
> with home finding the override applying at 8711 and not at 1524 in one session, that is the case for
> deleting sprite overrides outright rather than fixing them. Put it in your report even if 166 is cut short.
>
> **If the prototype blanks on your rig, say so in `STATUS.md` the moment you know**, before the report.
> home is building on it right now and would be building on sand.


> **Next free batch number: 177.** Three directors write this file (`work (aggiemap)`, `work (gisday)`,
> `work (security)`) and the numbers are one sequence, this machine's. **Read this line and bump it when you
> queue a batch.** On 23 October two directors both used 19, and the file carried two "Batch 19" headings at
> once. The lab coped - it ran both and skipped nothing - but "started batch 19" then meant two different
> things, and no reader of this file could tell which.


Written only by the director (see `DIRECTOR.md`). You write `work-lab-leila/STATUS.md` and
`work-lab-leila/reports/`, never this file.

> ## Interim read wanted now, not at the end (from `work (aggiemap)`)
>
> **The maintainer is promoting this build to production.** So the names of what is failing are worth more
> to me now than a complete report later.
>
> Your attempt count has moved **1022 (10:10) -> 1023 (10:25) -> 1024 (10:40)**, with failures **19 -> 20 ->
> 21**. One attempt per fifteen minutes is the `@heavy` project grinding - two at a time, 60-second
> allowances, three attempts each - so I am reading this as near the end rather than stalled. **Say if it is
> actually stuck**, because then I would rather restart it than have him wait on a number that is not coming.
>
> **Put in `STATUS.md`, as soon as you can:**
>
> 1. **The distinct tests failing so far, by name** - not the attempt count. 21 attempts could be seven tests
>    retried three times.
> 2. **Whether `blank-map.spec.ts` is among them.** This is the one that matters: it is `@heavy`, each blank
>    load holds a worker for the full 60 seconds, and **it going red on the vector-default build would mean
>    #2518 reintroduced the blanking** - which is the thing we spent last night proving was gone. If it is
>    failing, say so immediately and on its own; everything else can wait.
> 3. **Whether `framing.spec.ts` is among them.** I expect it: every map now opens one scale level closer,
>    and framing is checked against a baseline recorded from production. **That would be the baseline being
>    stale, not the maps being wrong** - say so plainly if that is what you see, because a production push
>    is riding on how this run reads.
>
> Three of this morning's four failures were known development-only ones that pass on production. Say which
> of today's are the same and which are new - **that distinction is the whole value of the run right now.**

> ## One question, answerable without stopping your run (from `work (aggiemap)`)
>
> Your progress lines say *"release tier on development at `a8898934a`"*. **Is that something you verified,
> or the commit the batch told you to expect?** The maintainer pushed this build himself and **is not sure
> which commit it was**, and he is deciding on a production push from the answer - so the difference
> matters.
>
> If you confirmed it from the deployed code, **say how** in `STATUS.md` and that settles it. If you took it
> from the batch, say that too; a one-line honest "assumed, not verified" is worth more than a confident
> wrong commit, and this morning you verified it properly, so I expect you did again.
>
> **The two pictures are what he actually needs, and they do not need the run to finish:**
> Fort Worth Law School and Houston Space Institute on deployed dev. **Pink construction parcels = #2517 is
> not in this build; orange = it is.** Plus which basemap `/map/d` opens on, for #2518.
>
> Put those in `STATUS.md` as soon as you can take them - before the tier finishes. The full result can
> follow in the report as usual.

> # Dev has a new build - identify it before anything else (from `work (aggiemap)`)
>
> **The deployed bundle changed**: `main-BR3XGVVT.js` (this morning's `f2160a189`) is now
> **`main-ASZ473D2.js`**. So a build landed while you were polling.
>
> **Do not assume it is `a8898934a`.** The maintainer pushed it and is not certain which commit it was, and
> he is deciding whether to promote it to production on the answer. **Identify the build first and say so
> explicitly**, the way you did this morning - by what the deployed code contains, not the build banner,
> which still ships placeholders (#1306).
>
> Three string literals settle it, and they survive minification:
>
> | Marker | Means |
> | --- | --- |
> | `Aggieland raster` / `aggie_basemap_raster` | **#2518** is in: the vector basemap is production's default and the raster one is in production's gallery |
> | `HSI_Construction` or `Construction/1` | **#2517** is in: the two campus basemaps repaint their construction fill |
> | `VTBase3` | the vector basemap is referenced at all |
>
> My own attempt from outside was **inconclusive, not negative**: I could only reach the five scripts
> `index.html` names (0.54 MB) and the basemap code is in lazy route chunks I could not enumerate. `VTBase3`
> did not appear and `TAMU_Basemap_20261008` did, but **I do not trust that as evidence** and neither should
> you - crawl the chunks properly or read it from the running app.
>
> **Then answer the question he actually asked**, which is simpler than the commit:
>
> 1. **Open Fort Worth Law School and Houston Space Institute on deployed dev and photograph them.** Pink
>    construction means #2517 is not in; orange at 25% means it is. **That is the answer he needs**, and it
>    needs no commit archaeology.
> 2. **Open `/map/d` and say which basemap it opens on**, and whether the gallery offers two entries on a
>    production-shaped view. That settles #2518.
>
> Put both in `STATUS.md` as soon as you have them, before the full release tier - he is waiting on this to
> decide a production push, and a picture beats a commit hash for what he is asking.
>
> Then run batch 173's release tier on whatever the build turns out to be, naming it.


## Batch 176 (aggiemap: the release tier on the next dev build; 28 October 2026, from `work (aggiemap)`)
> ## Correction to batch 176: the build is `e43dc6897` and carries more than I listed
>
> I named four changes. **Fourteen commits are new since `dev-2026-10-28-2`**, because three merged after
> that tag was applied and I had already counted them. The ones that change what you will see:
>
> | Merged | What to watch |
> | --- | --- |
> | [#2543](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2543) | **The maintainer's own bug**: the gallery keeps every base layer on a round trip. `basemap-gallery.spec.ts` now counts the construction layer - **green expected; a red there is the bug returning** |
> | [#2541](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2541) | Fort Worth Law and Houston Space Institute draw the **hatch**, not the 25% wash |
> | [#2524](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2524) | **Every campus map's name is now above its picture, at every width** - `/all-maps/campus` and the Campus Maps section of `/all-maps`. New since the last tagged build |
> | [#2531](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2531) | The restroom popup shows its building number and hides the row when empty |
> | [#2534](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2534) | Nine copies of the directions button became one directive. **`directions-availability.spec.ts` must pass unchanged** - that is the whole guard on that refactor |
> | [#2525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2525) | NSC and Break popup rows, **recorded as known failures** against #2520 - annotated, not red |
> | [#2547](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2547) | **Five baseball known-failure entries removed.** `service-metadata` and `portal-renderers` must now pass on production **without** them. A red there means the GIS republish was not as complete as I told the maintainer |
> | [#2542](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2542), [#2519](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2519) | The 12 builder maps run on production |
> | [#2528](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2528) | `womensBasketballParkingUrl` and its three exceptions are gone - **one of this morning's three known dev-only failures should no longer appear** |
>
> **So expect fewer known failures than this morning, not the same three.** #2528 removes the
> `womensBasketballParkingUrl` one. If it still shows up, something did not take.
>
> Everything else in batch 176 stands.


**After batch 175.** That one is `work (gisday)`'s and I am not jumping it - finish it first.

**#1134 is PR 2542 and merged.** The builder-gated maps are checked on production now, and the pull request
says plainly that a live red could not be shown because the GIS team fixed both faults while you were
building it - your batch 172 run stands as the proof instead.

### The task

A dev build is going out carrying four changes. **Run the release tier on development** once dev serves it,
confirming the build from the deployed bundle rather than the banner, as you have all day.

| Merged | What to watch |
| --- | --- |
| [#2543](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2543) | The gallery keeps **every** base layer on a round trip. `basemap-gallery.spec.ts` now counts the construction layer - **it should be green, and a red there is the production bug returning** |
| [#2541](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2541) | Fort Worth Law and Houston Space Institute draw the **hatch**, not the 25% wash |
| [#2542](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2542) | **The 12 builder maps now run on production too.** On development nothing should change |
| [#2539](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2539) | Docs only |

### Lead your report with these

1. **The basemap round-trip test.** It is the one that failed on `development` builds this morning and
   passes on the fix. If it is red on the deployed build, say so immediately and on its own.
2. **Whether the builder maps now run on production** - count them by name, as in batch 172.
3. **Anything new against this morning's three known development-only failures.** Those three are expected;
   a fourth is the finding.

### Also

**Photograph Fort Worth Law and Houston Space Institute on deployed dev**, so #2541's hatch is seen on a
real deployment rather than only on home's machine. Those pictures are also what
[#2533](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2533) needs for the
campus tile images, so frame them at each campus's opening view.

**If it passes, say so plainly and name the commit** - production follows. **Do not tag.**

## Batch 175 (gisday: #2538 - before and after screenshots of adding a second class section; a branch; 28 October 2026, about 12:40 PM Central, from `work (gisday)`)

After the batch you are on. About 30 minutes. Questions go to `work (gisday)`.

The fix for [#2538](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2538) (PR 2540) is merged and on
production (`sha-97455f2`), and the maintainer confirmed it there. It went out without screenshots, at his choice, so they follow
in a small pull request.

1. Branch `docs/2538-class-sections-screenshots` from the latest `origin/development`.
2. **Before**, on a throwaway stack as in batch 164, with the published API **`gisday-nest:sha-8102616`** and a site build of
   `810261679`, signed in as the test admin, in Admin, Classes, season 2026: add GEOG 201, section 500, Breyer, "Introduction to
   Human Geography"; then add the same with section **501**. Capture the toast ("Class was successfully created.") and the list,
   which still shows only section 500: `before-second-section.png`.
3. **After**, the same stack with the published **`gisday-nest:sha-97455f2`** and a site build of `97455f2f8`: add section 501:
   the list shows both (`after-second-section.png`); then add an exact copy of section 500: the error toast says it is already in
   this season and nothing is added (`after-duplicate.png`).
4. Commit the three into `docs/screenshots/2538-class-sections/`, and link them from
   `docs/releases/unreleased/2538-gisday-class-sections.md` (it has no images yet), as the other entries do.
   `node scripts/collate-release-notes.mjs --check` must pass. Commit with `Refs #2538` (the issue is closed); push to the fork.
5. Leave the local stack as you found it.

Report as usual: branch, head, the three files. The director opens the pull request.

---

## Batch 174 (aggiemap: #1134, make the builder-map check work on production; 28 October 2026, from `work (aggiemap)`)

**Batch 173 cleared the release.** 910 passed, 3 failed - all three the known development-only ones -
framing green on dev **and** on a production-shaped build drawing VTBase3, the view limit green,
`development-only` 11 of 11, and the two campuses pale orange with no pink on deployed dev. The build is
tagged `dev-2026-10-28-2` and the maintainer has promoted it.

**I was wrong about framing and you were right to measure it:** I expected it to go red because every map
now opens a scale level closer against a baseline recorded from production. 63/0 and 62/0. Good thing
nobody acted on my prediction.

**PR 2519 merged**, so the builder-map check is on `development`.

### The task

[#1134](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1134): the check you
just proved works **does nothing on production**, because the builder inventory was captured against dev
and the loader ignores an inventory whose `baseUrl` is not the environment's. You measured both halves in
batch 172:

- production as it stands: **63 passed, 12 skipped** - every builder map skipped, the known baseball faults
  sailed past;
- with the inventory relabelled: **all 12 visited**, baseball red on exactly #2500 and #2510.

**This is the change that would have caught #2500 the night it went live.** Your own report named the
simplest option:

> - accept the dev inventory on production;
> - treat a destination that doesn't land as a skip with a note, not a failure;
> - say in the log which inventory was used.

Build that.

### What to be careful about

1. **A destination that does not land must not fail the run.** Dev's destinations worked on production
   right after a release, but the two environments can drift between releases, and a check that goes red
   because a builder choice moved teaches people to ignore it - which is #2507 all over again.
2. **Say which inventory was used, in the log.** Silently using dev's data to test production is the kind
   of thing that is fine until the day somebody is debugging a production failure at speed.
3. **Graduation's known-failure entry is already on `development`** (#2521, both environments). Production's
   will start firing once this lands - that is intended, and it should be annotated rather than failing.

### Prove it

- **Red first in the honest sense:** on production **before** the change, the baseball tests skip. **After**
  it, they run and go red on #2500 and #2510 - which are still live, since the GIS team has not republished.
  **Quote both runs.** The whole claim of this change is "it would have caught it", so show it catching it.
- All 12 builder maps visited on production, by name.
- Development unchanged: still 12 visited, baseball still passing.
- `scripts/check-in-volume.sh <branch> aggiemap-angular` - exit 0.
- `docs/testing.md` if its row needs a word; **leave every number alone** (#2002).

Push to `fork`, report `branch ready:`. No pull request.

## Batch 173 (aggiemap: the release tier on the second dev build of the day; 28 October 2026, from `work (aggiemap)`)

**Batch 172 was the most useful run of the day.** You found that PR 2519 checks **no** builder map on
production, so it would have merged as coverage that covers nothing - and then proved it catches #2500 and
#2510 exactly when it does reach them. #2521 is filed for Graduation's legend and its known-failure entry
is on the branch; 2519 is still open.

### What is being built

A second dev build is going out now, off **`a8898934a`**. Three more merged since `dev-2026-10-28`:

| Merged | What it changes for you |
| --- | --- |
| [#2517](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2517) | **Fort Worth Law and Houston Space Institute** repaint their construction fill orange at 25% instead of the opaque pink tile. Both campus basemaps are live on production already |
| [#2518](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2518) | **The vector basemap is production's default.** This is the big one |
| [#2516](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2516) | `service-metadata.spec.ts` is new in the suite |

**Run the release tier on development** once dev serves `a8898934a`, and confirm the build from the
deployed bundle rather than the banner, as you did this morning.

### What is different about this build, and what to lead with

**#2518 changes every map on production-shaped builds**, so this run is not routine:

1. **`service-metadata.spec.ts` is new and should be green on development.** On production it reports
   #2510's two entries as known failures. A *different* failure from it is a new fault - report that first.
2. **The view-limit test** was the one failure this morning that was ours. #2518 rewrote it to ask every
   basemap production offers. **It must be green now.** If it is not, that is the finding.
3. **`development-only.spec.ts`** - `Hosted/VTBase3/VectorTileServer` came off the development-only list in
   #2518. Confirm that spec is green, because getting that wrong would have turned the production run red
   for the thing we meant to ship.
4. **Every map opens one level closer** than it did on a production-shaped build (1:9,028 to 1:4,514).
   **Framing is checked against a baseline recorded from production** (`framing.spec.ts`, 71 tests). If
   that baseline is scale-sensitive, expect failures there - and **say so clearly rather than treating them
   as regressions**, because they would be the baseline being out of date, not the maps being wrong. This is
   the single thing most likely to go red on this build and it is worth getting the explanation right.

### Also

- **Photograph Fort Worth Law and Houston Space Institute** on the deployed dev build, so #2517's result is
  seen on a real deployment rather than only on home's local one. The maintainer has said the campus
  construction is the thing he needs most.

### Report

Lead with: framing, the view limit, development-only, and the new metadata spec. Then the usual per
environment. **If it passes, say so plainly and name the commit** - production follows straight after.

**Do not tag.**

## Batch 172 (aggiemap: prove #2467's builder-map check actually catches things; 28 October 2026, from `work (aggiemap)`)

**Your batch 171 triage found the loose end that matters: #2467's branch was never made a pull request.**
I rebased it onto `development` (it was based on `2117003e8`, four commits behind), dropped three of your
own smoke run-time CSVs that had been swept in with it, and opened **PR 2519**. Check exit 0.

**It has never been run against a deployed environment since the rebase, and that is the whole point of
this batch.** I have said so in the pull request rather than implying it was proven.

Branch: `test/2467-builder-map-layers-2` on the fork at `03c2cf200`.

### Two questions the run has to answer

1. **Does it reach all eleven builder-gated maps?** `builder-destinations.ts` works out where each builder
   choice lands. If a choice lands somewhere the logic does not expect, the check silently covers ten maps
   instead of eleven and we are back where we started. **Say how many it actually visited**, by name.
2. **Does it go red on the faults we already know about?** This is the important one. On **production**,
   #2500's three baseball layers draw nothing and #2510's `/2 Gate/Road Closure` answers HTTP 500 to every
   query. **A check that passes those is not doing its job.**

   If it passes them, that is the most valuable finding of the day and you should say so immediately rather
   than at the end - it would mean the check needs more work before it is worth merging, and I would rather
   know that than merge something that only looks like coverage.

### Run it

```
test/smoke/aggiemap/run-local.sh production one map-layers.spec.ts
test/smoke/aggiemap/run-local.sh development one map-layers.spec.ts
```

Read only, both environments. Development should be clean. Production should be red on baseball - and if it
is, **quote the failure text**, because that text is what someone will read when the next republish breaks
something.

### Report

- How many builder maps it visited, and which;
- what it found on each environment, with the failure text;
- **your verdict on whether PR 2519 should merge as it stands**, and if not, what it needs.

Nothing pushed; the branch is mine to update if your run says it needs changing.

## Batch 171 (aggiemap: triage the open `testing` issues; 28 October 2026, from `work (aggiemap)`)

**Batch 170's report is exactly what was needed** - the three numbers I asked you to lead with, and you
caught that the new failure is ours rather than the product's. The build is tagged `dev-2026-10-28` on
`f2160a189`. The view-limit check is already being rewritten by home as part of #2515; **do not touch it.**

### The task

The maintainer wants the 336 open issues worked through and closed one way or another. **The 23 labelled
`testing` are yours**, because deciding whether a testing issue is already satisfied means knowing what the
suite actually does - which nobody knows better than this machine.

```
#1091 #1134 #1137 #1159 #1160 #1161 #1173 #1243 #1400 #1421 #1442 #1512
#1719 #1849 #2111 #2122 #2212 #2215 #2241 #2263 #2363 #2467 #2511
```

For each, decide **one** of:

- **Done** - the suite already does this. **Close it**, with a comment naming the spec file and what it
  asserts. `gh issue close <n> --reason completed --comment "..."`. You have the scope for this.
- **Obsolete** - it describes something that no longer exists or no longer matters. **Close it**, saying
  what changed and why it cannot be acted on.
- **Still wanted** - leave it open, and **say in your report, in one line, what it would take**. That line
  is the useful output: it turns a stale wish into something somebody can pick up.
- **Needs the maintainer** - leave it open and list it separately. #1421 (whether the dev gate is the local
  suite or the GitHub workflow) and #2263 (whether spec tsconfigs are typechecked) read like decisions, not
  work. **Do not ask him; just list them.**

### How to do it well

- **Read the issue and then check the code**, in that order, and say which spec you checked. A close that
  says "this is covered by `maps.spec.ts`" and names the assertion is useful; one that says "looks done" is
  worse than leaving it open.
- **#2511 is already built** - it is PR 2516, open and green. Close nothing there; the pull request closes
  it on merge.
- **#2467 is the one with teeth**: the eleven builder-gated maps have no layer check, and that is why
  #2453 and #2500 were both missed. If it is still true, **say so plainly and leave it open** - it is the
  most valuable thing on this list.
- **Several are not AggieMap testing at all** (#2111, #2122, #2212, #2215, #2241, #2263, #2363 are
  workspace, CI, ops or GIS Day). **Leave those alone entirely** - say in your report that you skipped them
  and why. Another director owns that work and closing their issues from here would be wrong.

So the real list is: **#1091 #1134 #1137 #1159 #1160 #1161 #1173 #1243 #1400 #1421 #1442 #1512 #1719 #1849
#2467**.

### Report

A table: issue, verdict, the spec you checked, and the one-line "what it would take" for anything left
open. Then the count closed. **Nothing pushed, no branches** - this batch changes no code.

## Batch 170 (aggiemap: the release tier on the dev build going to production; 28 October 2026, from `work (aggiemap)`)

**A dev build of `f2160a189` is going out now, and it is going to production**, because production's
baseball maps draw nothing and [PR 2504](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2504)
is the fix. `tag-build.sh prod` refuses a commit with no `dev-*` tag, so this build is the only route.

**Run the release tier, not quick.** This build is being promoted, so the tier that clears production is
the one to run:

```
test/smoke/aggiemap/run-local.sh development release
```

Start it as soon as `dev.aggiemap.tamu.edu` is serving `f2160a189`. **Check it is actually that build
first** - the build banner still ships unsubstituted placeholders ([#1306](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1306)),
so confirm from the deployment rather than the page.

### What is different about this build, and what to look at

Six changes merged this morning. Three change what the suite will see:

| Merged | What to expect |
| --- | --- |
| [#2508](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2508) the hatch | The construction buildings draw as our own layer. **Your own blank-load finding is the thing to watch**: if the deployed build blanks where your local one did not, that is the most important result of the day |
| [#2502](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2502) the blank-map check | **New in the suite, and it may be red.** It was red 1 load in 18 on the *old* dev build. On this build it should be green; **a red here is a real blank map, not a flaky test**, and it is the one failure to report immediately rather than at the end |
| [#2509](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2509) Indoor Track | The three always-red `layer-order` failures should be **gone**. If they are still there, the rewrite did not take |

Expect the other three development-only failures you have reported before (the token-required
`womensBasketballParkingUrl`, the 3D globe, the `bldg=0468` popup). They pass on production and are not
blockers.

### Report

Per environment, what failed and why, as always - and **lead with these three**: did the blank-map check
pass, did the Indoor Track failures go, and is the total count of failures lower than report 150's six.

**If it passes, say so plainly and say the commit**, because the next thing that happens is a production
deploy and a `prod-*` tag, and the maintainer will act on your sentence.

**Do not tag anything.** The director handles tags.

## Batch 169 (aggiemap: the seven open pull requests, merged together; 28 October 2026, 2:30 AM Central, from `work (aggiemap)`)

**Report 153 closed the hatch out.** Your `e081cc7ed` block - 0 of 15 against a control of 5 of 15 - is
posted on PR 2508 and the caveat in its description is discharged. #2507 is PR 2509; I set its type,
priority and project, since your token has no project scope.

### Why this batch exists

CLAUDE.md: *"Before a batch is merged, check all of its PRs merged together: two PRs can each pass CI and
still fail together."* Seven are open and green, and **three of them touch the same two files**, which is
exactly the case that rule was written for:

| PR | Branch | Touches |
| --- | --- | --- |
| 2508 | `feat/2459-hatch-layer` | `basemap-layers.ts`, `map.service.ts`, the basemap definition; **deletes** `vector-tile-sprites.ts` |
| 2504 | `fix/2500-portal-renderer-fields` | `portal-symbology.ts`, `map.service.ts` |
| 2502 | `test/2487-blank-map-smoke` | the smoke suite, `paint.ts`, `scope.ts` |
| 2509 | `test/2507-indoor-track-layer-order` | `layer-order.spec.ts` |
| 2505 | `fix/2458-campus-name-spacing` | `discover-shared.scss`, `all-maps.component.scss` |
| 2501 | `fix/2494-sort-campus-list` | `all-maps.component.ts` |
| 2503 | `docs/2493-drop-reverted-hatch-note` | a release note |

**2508 and 2504 both edit `map.service.ts`.** Each passed CI against `development`, neither against the
other. And 2502's blank-map check is the first thing that would notice if the pair broke drawing - which is
the whole reason it exists.

### What to do

1. **Merge all seven into one branch** off the latest `development`, in a worktree. Resolve any conflict
   and **say exactly what conflicted and how you resolved it** - a `map.service.ts` conflict between the
   hatch and the portal fix is the one to describe carefully, because both are changing how a layer is set
   up and a wrong resolution would pass every test.
2. **`scripts/check-in-volume.sh <branch> affected`** - the full affected check, not a project list. This is
   the combined case, so the narrow form is not enough.
3. **A dev server on the combined branch, and your blank-load rig**: 15 plain loads with a control beside
   it. 2508 is the change that blanked maps twice; the combined tree is the one that will actually ship.
4. **2502's own check against the combined build** - `run-local.sh local one blank-map.spec.ts` or the
   equivalent for a local server. It should be green. If it is red on the combined tree while 2508 alone
   was clean, that is the finding of the night and you stop and say so immediately in `STATUS.md`.
5. **`portal-renderers.spec.ts` (2504's) against production**, read only, to confirm it still reports the
   three baseball layers and nothing else once 2508's changes are alongside it.

### What a good report says

Per item: conflicted or not, how resolved, and the measured result. **Do not push the combined branch** -
it exists to be tested, not merged; the maintainer merges the seven individually.

**If it is all clean, say so in one line at the top**, because that is the sentence that lets seven pull
requests be merged in the morning without wondering.

## Batch 168 (aggiemap: the permanently red test, then stand by for the hatch; 28 October 2026, 1:55 AM Central, from `work (aggiemap)`)

**Reports 151 and 152 are exactly what was needed.** The interleaved 45-against-60 design is what made the
prototype's 0 mean something, and you were right that a 15-load block clears nothing. The outline defect
you photographed is now home's batch 10.

### Decided - your questions from report 150 are all answered, do not ask again

1. **Baseball on production.** Filed as [#2500](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2500)
   (Bug, Urgent) and fixed in **PR 2504**: the front end now discards a portal renderer whose key fields the
   layer does not have, so the layer keeps its service symbology instead of drawing nothing. Note the part
   that is **not** fixed: production's own service renderers are `simple` where development's are
   `uniqueValue`, so production will draw uniform pale blue lots until the GIS team gives that service
   development's symbology. The three layers are on a new `allowedPortalRendererFailures` list in
   `environments.json` meanwhile.
2. **Other maps using portal symbology: swept, and the answer is only baseball.** Every athletics service's
   portal item was read against its layers' fields: three broken layers, all baseball. `IndoorTrackParking`
   `/1` `/2` and `MensBasketballParking` `/0` `/1` `/2` key on `type` and `name`, which still exist; the
   other eight have no `uniqueValue` portal override. PR 2504 also adds `portal-renderers.spec.ts`, which
   makes that sweep a permanent check and **covers builder-gated maps**, so this cannot come back quietly.
3. **Indoor Track's layer-order test** - that is this batch, below.

### Task 1: the test that is always red

`layer-order.spec.ts` on Indoor Track has failed on every run, on both environments, since at least report
148. **A test that is always red is worse than no test**: it trains everyone to skim past the one place a
real drawing-order fault would appear, and it cost three of production's three failures tonight.

Work out what it asserts, what the map actually does now, and which of the two is wrong. [#2059](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2059)
is the issue it was written for - Team Bus Parking drawn above the Indoor Track Building whose footprint it
is. **Team Bus Parking was removed from the athletics definitions on 27 October** when the ten sports moved
to the development schema, so the likeliest answer is that the test outlived its subject. If so it should
be deleted or rewritten against a layer that still exists, not left red.

**File the issue first** (Task, `test`/`bug` as fits, Priority **Low** - say so in your report and the
director will confirm), then the branch, then `branch ready:`. If it turns out to be a real drawing-order
fault rather than a stale test, stop and say so: that is a different answer and a different priority.

> **The hatch's final commit is ready (2:05 AM Central, 28 October).** `feat/2459-hatch-layer` at
> **`e081cc7ed`** on the fork - your outline defect is fixed, and home's 2x crop shows the edge as one
> continuous line. **Take task 2's confirming block on `e081cc7ed` now**, ahead of task 1: the pull request
> is open and its only outstanding evidence is your number.
>
> Since your `337047b1e`, two commits: a release note, and the outline (one more hidden style layer of the
> kind you already measured, plus a CIM stroke). Nothing new in kind, no sprite call - which is why one
> block of 15 with a 15-load control beside it is enough, not another 45.


### Task 2: stand by for one confirming block on the hatch

home's batch 10 fixes the outline. When it reports `branch ready:`, take **one block of 15 plain loads on
the final commit, with a 15-load control beside it**, to confirm the branch that will actually ship is the
one that does not blank. Not 45 again - deleting the sprite override can only reduce the risk, and your 0
of 45 on `337047b1e` is the result. This is a guard against a late mistake, not a re-proof.

Say in your report **which commit each number was taken on**. The pull request will quote you.

### Do not

Start more of 166. You have the finding that matters - the blanking is a race on `setSpriteSource`, present
even with the published sheet unmodified - and the mechanism is being deleted. Anything more is archaeology.

## Batch 167 (aggiemap: measure home's no-sprite hatch with your rig; 27 October 2026, about 11:15 PM Central, from `work (aggiemap)`)

> **The branches you were waiting for are on the fork** (note from `work (aggiemap)`, 11:52 PM Central, 27 October).
> Stop measuring filler and measure these:
>
> - **`feat/2459-hatch-layer`, head `cb1ea9c8b`** - the no-sprite prototype: the published construction fill hidden
>   with `setStyleLayerVisibility`, the eight construction buildings drawn as a `FeatureLayer` with a CIM grid hatch,
>   and `SPRITE_OVERRIDES_ENABLED = false` so no sprite call is made at all.
> - **`feat/2459-hide-only`, head `158d5c4fa`** - the same **without** the hatch layer, so the half that hides the
>   fill can be measured on its own. That tells us whether `setStyleLayerVisibility` is safe, which decides whether
>   the approach is sound or only looks sound.
>
> **Your rig is the only one that can answer this.** home measured both at 0 of 15 and also measured the known-bad
> control at 0 of 15, so its numbers say nothing. 15 plain loads each, your method from report 148, plus the
> control again in the same session so the three numbers are comparable.
>
> **Two findings from home worth having before you start:**
>
> 1. On the **control** build, in one session, the sprite override took effect at **8711** (orange) and **not** at
>    **1524** (still the published pink). So the override is a race even when it does not blank - which is more
>    evidence against it, and may be the same race.
> 2. From `dev.localhost` the browser's CORS check blocks more than ten of the map's layers, so a local measurement
>    is not like a deployed one unless the check is off. If your rig loads from a local origin, check this.
>
> **If the prototype blanks on your rig, that is the most important result of the night** - say so immediately in
> `STATUS.md` rather than waiting for the report, because home is building the shippable version on top of it right now.


**Do this before batch 166.** If this prototype is sound, 166 - why `setSpriteSource` blanks the map - stops
mattering, because nothing would call it.

### Why it has to be you

`home` has built the hatch **without a sprite**: a `FeatureLayer` over the vector basemap, drawing the
eight `Type = 'CONSTRUCTION'` buildings from `FCOR/TAMU_Basemap_20261008/MapServer/2` with a `CIMSymbol`
hatch, and the basemap's own construction fill hidden with `setPaintProperties` rather than
`setSpriteSource`. It reports the hatch drawing correctly: 1524 with an orange grid, grass between the
lines, black outline.

**But it cannot reproduce the blanking.** It measured the *control* - today's build with the sprite
override on, which you measured at **4 of 15** - at **0 of 15**. A machine that does not reproduce the
fault cannot clear a fix of it. **You are the only machine that has reproduced it**, so the number only
means something from your rig.

### What to do

1. **Take home's branch** from the fork - it will be pushed by the time you reach this; the name is in
   `home/STATUS.md` and its report. Ask in your own status if it is not there.
2. **Measure it exactly as in report 148**: one dev server, clean worktree, no `.angular` cache, started
   without `--poll`, 15 plain loads of `/map/d`, blank meaning essentially pure white for 30 seconds.
3. **Measure the control the same way in the same session** - today's `development` with the sprite
   override still on - so the pair is comparable on your machine tonight, not against this afternoon's
   number.
4. **Capture 1524** on the prototype: it should be an orange hatch with the grass showing between the
   lines and a black outline.

### What would settle it

- **The prototype at 0 of 15** while the control reproduces its 4 of 15, **and** the picture of 1524.

Both. One screenshot is not enough - there have been two of those today, each true at that instant and
wrong overall.

If the prototype also blanks, say so plainly: that would mean the fault is not sprites at all and
everything today has been chasing the wrong thing.

### Also worth your eye

`copilot-home` has a blank-map smoke check on `test/2487-blank-map-smoke` - red 6 of 6 with the bad change,
green 12 of 12 locally, 1 of 18 blank on shipped dev. Your rig measured 4 of 15 on the same build. **The
rate differs by machine**, which matters for whether that check is reliable or flaky. Say what you think
after seeing both numbers.


## Batch 166 (aggiemap: #2487 why the sprite override blanks the map; 27 October 2026, about 10:10 PM Central, from `work (aggiemap)`)

**Overnight, and the main thread of it.** The maintainer wants the construction symbology solved and all
three machines on it; you have the measuring rig, so you get the root cause.

### What is known, so nobody repeats it

Measured by work-lab-leila tonight (report 148), 15 plain loads of `/map/d` per build, headless
Chromium, "blank" meaning 100% pure white for 30 seconds:

| Build | Blank loads |
| --- | --- |
| `18d81e87b`, today's shipped build | 4 of 15 |
| plus `fix/2481-sprite-overrides-after-layerview` | **15 of 15** |
| plus `fix/2477-gallery-base-layer` | 4 of 15 |
| both | **15 of 15** |
| `18d81e87b` **with the sprite override switched off** | **0 of 15** |

So: **the hatch's sprite override is what blanks the map.** Applied after the layer view exists it blanks
every load; applied at layer load, as it is today, about one in four. `fix/2477` has no effect on it.

**The probe cannot see it.** It reports ready, every layer loaded and drawable, while the map is white.
That is why nothing caught any of this, and it is why screenshots and pixel sampling are the only
trustworthy evidence here.

**It is development-only.** The vector tile basemap is not published for production, which still draws
the raster basemap and never applies an override. Nothing here is a production emergency.

### What is wanted

**Why does `setSpriteSource` blank the map?** Not another attempt at the hatch - an explanation.

Things worth trying, in rough order:

1. **Narrow what blanks it.** Does the blanking need the patched canvas at all, or does calling
   `setSpriteSource` with the service's *own, unmodified* sheet blank it too? That one experiment
   separates "our image is wrong" from "the call is wrong".
2. **Watch what the renderer does.** `read_network_requests` for tile requests after the call; whether
   the layer view is recreated; whether WebGL throws. A layer that reports healthy and draws nothing is
   usually a renderer-side failure, and Esri logs more at higher verbosity.
3. **Is it a race?** One in four at load time and fifteen in fifteen after the layer view suggests timing.
   If so, what exactly is it racing - the sprite upload against first paint?
4. **Does `loadStyle` with a whole replacement style behave differently** from `setSpriteSource`? That is
   the other documented route to a changed sprite and it may not share the fault.

**Report an answer, not a patch.** If a safe approach falls out, say what it is and why you believe it,
with the 15-load measurement to back it. If the answer is "this API cannot do it safely", that is just as
useful and ends three attempts.

### Added 10:25 PM: the ordering nobody has tried, and the maintainer's position

**The front end has to fix this.** The GIS team cannot change the published sprite, and the team has
promised a front-end fix, so "ask them to republish it" is off the table. The hatch is also the last
thing holding the vector tile basemap back from production, so this is the critical path.

**And the hatch itself already works.** On today's dev build, when the map draws, building 1524 is the
orange hatch - you measured that yourself. The override is not broken; it blanks the map on some loads.
That is the only remaining problem, and it is narrower than it has looked all day.

**Both attempts so far applied the sprite while a renderer existed:**

| When the override is applied | Blank loads |
| --- | --- |
| After `view.whenLayerView()` - a layer view already exists | 15 of 15 |
| On `layer.when()` - loaded, being added to a map | 4 of 15 |
| Never | 0 of 15 |

The later the call, the worse it is. **Nobody has tried applying it before any renderer exists at all.**

A `VectorTileLayer` can be loaded on its own, without being in a map: `await layer.load()` populates
`currentStyleInfo`, which is all `setSpriteSource` needs. So the order could be

1. construct the layer,
2. `await layer.load()`,
3. `await layer.setSpriteSource(...)` - **no map, no view, no layer view yet**,
4. only then put it in the `Basemap` and hand that to the map.

The layer view is then created *after* the sprite source is already in place and never has to be
disturbed. If the fault is the renderer being changed under itself, this avoids it entirely; if it blanks
anyway, that is a strong result too, because it rules out timing and points at the sheet.

**This needs `makeBasemap` to become asynchronous** - it builds layers synchronously today - which is a
real change but a contained one, and `makeMap` that calls it is already `async`.

**Try this first**, before the broader investigation in the batch above: it is specific, it is quick to
measure with your 15-load rig, and it is the only untried point in the sequence. Report the number either
way, and the picture of 1524 if it draws.

### Don't

Push anything to `development`, tag, or touch production.


## Batch 165 (aggiemap: the release tier on what actually shipped, production first; 27 October 2026, about 8:10 PM Central, from `work (aggiemap)`)

**Renumbered from 164 and still not done.** Two batches were queued as 164 - this one and a GIS Day
release check - and you did the other. Nothing is wrong with your handling; the number was taken twice,
which `DIRECTOR.md` warns about. This is the AggieMap one, and it is the last thing outstanding tonight.

**After batch 163**, which is testing `18d81e87b`. That commit is now two builds stale: it predates the
baseball fix (`7451a14f6`) and the dashes and zoom build (`dad215775`). Its results are still worth
having - they describe the revert build - but **they do not cover what is live**, and in particular not
baseball, which was genuinely broken at that commit. The maintainer settled this at 8:05 PM: let 163
finish, then run again on what shipped.

### 1. The release tier on production, first

```
test/smoke/aggiemap/run-local.sh production release
```

**Production first, because production is live and has never been tested.** Today's release went out
without the dev suite: the GIS team republished the athletics services to the new schema before the
release was ready, which broke production, so it shipped immediately. Then baseball shipped again on
top. Nothing has run against it.

Report per failure what failed and why. **A failing GitHub run opens a health issue; a local run does
not**, so say so when reporting rather than leaving anyone to open a duplicate.

Pay particular attention to:

- **the athletics maps, all ten sports.** Every one moved to the republished schema today, and the
  services under them changed at the same time. This is the first time any of it has been tested against
  production;
- **baseball especially**: `?map-mode=event` must show **Lot 100j**, and `?map-mode=accessible` its
  icons, the shuttle over the lots, and no doubled lots. The suite's own layer check **skips** this map
  (it is builder-gated - [#2467](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2467)),
  so **look at it yourself and say what you see**. A pass from the suite here means very little: the same
  4 passed, 1 skipped came back both when baseball was broken and when it was fixed;
- **the ten campus maps**, listed on production for the first time today.

### 2. Then the same tier on development, at `dad215775`

```
test/smoke/aggiemap/run-local.sh development release
```

so the two environments can be compared and anything production-only is obvious.

### What not to do

**No tagging, no promotion, nothing on production but reading it.** Report and stop.

### Worth carrying over from today

Trust what you see over what anything reports. Every wrong conclusion today came from something that
reported healthy: a layer `loaded`, `visible`, right spatial reference, no errors, drawing nothing; and a
smoke run returning an identical pass whether the map worked or not.


## Batch 164 (gisday: the release check for `sha-8102616`, with this release's database migration; read only against production; 27 October 2026, about 8:25 PM Central, from `work (gisday)`)

**After batch 163, before anything else for GIS Day.** About 35 minutes. Your batch 161 cleared `sha-4e60f38`. Five more pull
requests merged after it, so production gets **`gisday-nest:sha-8102616`** and **`gisday-angular:sha-8102616`** instead (merge
`810261679`; the publish run was still going at 8:25 PM, so check `docker manifest inspect` first):

- **PR 2481 (#2474): the VGI scoring window. It has this release's one migration**, `AddCompetitionScoringWindow1793130952432`: two
  nullable `datetimeoffset` columns on `vgi_seasons`, `scoringOpensAt` and `scoringClosesAt`, plus Designer fields to set them.
- PR 2482 (#2166): the competition map shows where things were already found last season (`GET .../seasons/active/already-found`).
- PR 2484 (#1792): the public VGI map and a participant's own submission no longer carry the reviewer's id.
- PR 2434 (#2433): publishing VGI submissions to ArcGIS Online. **Off without its `VGI_ARCGIS_` settings; leave them unset.**
- PR 2495 (#2460): the VGI and Monument Trail pages give 14-20 November and the Friday 11:00 AM cutoff.

### What to do

1. A throwaway stack as in batch 161, but **migrated by `810261679`'s own code**: `migrate show` must list
   `AddCompetitionScoringWindow1793130952432` as pending; `migrate run`; `migrate show` again (applied). Then
   `migrate revert` and `migrate run` once more, to prove `down` works. Say what each printed.
2. **The old API on the new schema:** start the published `gisday-nest:sha-4e60f38` on that migrated database and load the competition
   pages and the VGI leaderboard: they must answer 200. This is what production runs between the migration and the new API.
3. The published **`gisday-nest:sha-8102616`** and a local site build of `810261679` on 4201. `gisday-release-check.cjs` and
   `gisday-release-check2.cjs`: every line PASS.
4. **What this release adds:**
   - **#2474:** in Admin, Competitions, Designer, set scoring to open 14 November 2026 00:00 and close 20 November 2026 11:00 (US
     Central) and save; reload: both kept, and the API stores them with the -06:00 offset (say what `vgi_seasons` holds). A close
     before the open is refused with a 400. Clear them again afterwards.
   - **#2166:** `GET .../seasons/active/already-found` answers 200 (a list, possibly empty on the seed; `?format=geojson` a
     FeatureCollection), with no user or submission ids in it.
   - **#1792:** a submission read as its owner (or the public map's JSON) has no `verifiedBy`.
   - **#2433:** with no `VGI_ARCGIS_` settings, **Publish to ArcGIS** says publishing is not set up, and the API log shows no call to
     arcgis.com.
   - **#2460:** `/competitions/vgi` and `/competitions/monuments` say November 14 and Friday, November 20, and not November 9 or 19.
5. `docker logs` of both APIs: count of `ERROR` lines; quote anything new.

### Then

Report with every PASS or FAIL line and the results above. Push `STATUS.md` when you start and finish. Nothing on GitHub, nothing
against production.

---

## Batch 163 (aggiemap: the release tier on the shipped build, and what actually blanks the map; 27 October 2026, about 6:15 PM Central, from `work (aggiemap)`)

Two jobs. The first is routine and the second matters more than it looks.

**Background, because today was unusual.** Production's athletics services were republished to the new
schema before the release shipped, so production was broken and the release went out **without the dev
suite running**. It is on dev now and going to production immediately. Nothing you find gates anything -
it is already out - but it is how we learn what skipping the testing cost.

### 1. The release tier on dev

`test/smoke/aggiemap/run-local.sh development release`, against `origin/development` **`18d81e87b`**.

Report per failure what failed and why, not just a count. Pay particular attention to:

- **the athletics maps**, all ten sports: they moved to one schema today and production's services were
  republished under them;
- **the baseball maps** ([#2453](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2453)): `?map-mode=event` must show **Lot 100j**; `?map-mode=accessible` must show its icons, the shuttle **over** the lots, and no doubled lots;
- **the campus maps**: **ten** of them, listed on both dev and `?as=production` ([#2473](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2473)).

**Do not tag.** Report and stop.

### 2. [#2487](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2487): does the basemap actually draw, and what stopped it

Today two changes were reverted (#2485, #2479) because the map appeared blank. **The evidence for that
is unreliable**: the browser the director was using turned out to show a blank canvas on builds the
maintainer could see drawing perfectly, including the current one. So the revert may have been
unnecessary, and the hatch work (#2459) may be recoverable.

**You have a working browser and a working dev server. You are the right machine to settle this.**

1. **Look at dev now** (`18d81e87b`): does `/map/d` draw the campus on a plain load, no nudging? Is
   building **1524** a solid pink block, confirming the revert took? Capture both.
2. **Then test the reverted work.** The branches are on the fork:
   `fix/2477-gallery-base-layer` and `fix/2481-sprite-overrides-after-layerview`. Build a worktree with
   `origin/development` plus **both**, run the dev server, and **look at the map**:
   - does the campus draw on a plain load?
   - is building 1524 orange hatch with the grass visible between the lines?
3. **Say plainly which it is.** If the map draws and the hatch is orange, the revert was unnecessary and
   the work goes back in - say so and push the branch. If the map is blank, say which of the two
   branches does it by testing them one at a time.

**Start the dev server without `--poll`** and clear `.angular/cache` first - both are on
[#2472](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2472); with `--poll`
and a cold cache it never finishes, and a stale `.angular` cache will serve you code you have deleted.

**Trust what you see over what anything reports.** Every wrong conclusion today came from a layer that
reported `loaded`, `visible`, right spatial reference, no errors - and drew nothing.

### Don't touch

Production, and any tagging.

## Note to the batch running now: progress every 15 minutes (27 October 2026, about 3:25 PM Central, from `work (aggiemap)`)

**Applies to the batch you are running right now, from this minute.** `DIRECTOR.md` now asks every listener for
a progress line in its own `STATUS.md` **at least every 15 minutes while a batch is running**.

The maintainer asked for this directly: a batch that started at 2:57 PM said "next update by 4:30 PM", and he
read that as how often he would hear anything. He wants to hear far more often.

The estimate stays - it is useful - but it answers "when will this finish", not "is it moving". Push a line
whenever a step finishes, even a short one:

```
Progress (3:31 PM): check running since 3:22; four of nine captures taken.
```

Nothing else about your batch changes. Do not restart anything or re-read your batch from the top: carry on and
start pushing progress.

## Batch 162 (aggiemap: #2467 give the builder-gated maps a layer check; 27 October 2026, about 1:50 PM Central, from `work (aggiemap)`)

After batch 161 if one is queued, otherwise now. **Not critical.** The maintainer: *"If they can make it in
by the time we finish with the campus maps, they can be included for the dev release. If not, we do later.
Neither are critical."* So: do it properly, and if it is not ready when the campus work is, it waits for the
next release. Do not cut corners to make a deadline that does not exist.

[#2467](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2467): `map-layers.spec.ts`
is the check that every layer a map lists also draws and keys. It skips any map that lands on a builder:

```ts
test.skip(page.url().includes('/builder/'), `${mapPath} is behind a builder; tools/builder-inventory covers it`);
```

Eleven maps are behind a builder, Baseball among them, so none of them has ever had its layers checked. That
is why [#2453](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2453) - the
republish that broke both baseball maps this morning - went unnoticed. Measured at 1:20 PM today:

```
test/smoke/aggiemap/run-local.sh development one baseball
  4 passed, 1 skipped
```

The one skipped is the layer check. The four that passed cannot see the fault.

**The skip message is also wrong**, which is probably why nobody noticed: `tools/builder-inventory` records
where each combination of choices *lands*, with a shareable link. It does not ask whether the layers at that
destination draw.

### What to do

1. **Give the spec the destinations rather than the builder's own URL.** The builder maps are reachable once
   a choice is made, and `tools/builder-inventory` already enumerates every destination, including the direct
   link. Baseball's two are `?map-mode=event` and `?map-mode=accessible`; `framing.spec.ts` already opens
   `/parking/baseball-parking/map/d?map-mode=accessible` directly, so the pattern exists in the suite.
2. **Prove it red first.** Against **`ca2ad502d`** on `origin/development` - the commit *before* #2469 merged -
   the baseball accessible destination should fail for the missing symbols. Then against current
   `origin/development`, which carries the fix, it should pass. That is the whole value of this change, so it
   is worth the extra run.
3. **Say what it costs.** Eleven maps with several destinations each is real time added to every tier. Report
   the added wall-clock for `release`, and if it is large, say so rather than quietly making the suite slower -
   there may be a case for the destinations only in `full`.
4. **`docs/testing.md`: add nothing and change no number** ([#2002](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2002)).
   If the spec count changes, that is a measurement taken at release, not a tally kept by hand.

Branch `test/2467-builder-map-layers` from `origin/development`, push to the fork, say
**"branch ready: test/2467-builder-map-layers"**. I open the pull request.

### Don't touch

`check/2026-10-27-batch` (a checking branch, not for merging) and anything campus-related: a change making
every campus map visible on production is being written now.

## Batch 161 (gisday: the release check for site and API `sha-4e60f38`, the next GIS Day release; read only against production; 27 October 2026, about 12:45 PM Central, from `work (gisday)`)

After batches 159 and 160. About 45 minutes. **Batch 159 must have left the local stack on `origin/development`** before you
start this.

The maintainer merged five GIS Day pull requests on 27 October; `development` at **`9ea3ccd2f`** carries all of them:
#2162 (score 2026 finds against 2025's, PR 2424), #2164 (automatic review of VGI submissions, PR 2428), #2431 (Texas A&M site
drops three links, PR 2461), #2426 (a resized speaker photo is never larger than the upload, PR 2462) and #2427 (19 unused
files removed, PR 2463), then **#2425: the API images run as the `node` user, uid 1000** (PR 2441, merge `4e60f38a6`; production's
volumes were given to uid 1000 by kubernetes-config PR 84). **No schema change** (the entity change is a TypeScript type only), so no migration. **The images:** **`gisday-angular:sha-4e60f38`** and **`gisday-nest:sha-4e60f38`**, both published (1:05 PM). `gisday-nest:sha-9ea3ccd`
was never published; ignore it. Production runs API `sha-eb0fe7d`.

### What to do

1. Your local stack (seed, migrated) with the **published `gisday-nest:sha-4e60f38`** as `gisday-api`, as in batch 155, and a
   local site build of `4e60f38a6` on 4201 (`web --static`).
2. `work/tools/gisday-release-check.cjs` and `gisday-release-check2.cjs`: every line should PASS, as in batch 155.
3. **What this release adds:**
   - **#2426:** upload, through Admin, Speakers, an opaque PNG photo over 840 px on its shorter side (a real photo saved as PNG,
     a few hundred KB or more): the stored file must be **smaller than the upload**. Say both sizes and the stored pixel size.
     Remove the test speaker afterwards.
   - **#2164 / #2162:** Admin, VGI Competition, Submissions loads with no API error, and the leaderboard the public page uses
     answers 200. The local data may have no 2026 submissions; say what it showed.
   - **#2431:** `web --static --site tamu` on 4202: the home page has no links under Explore Events; txgisday.org on 4201 still
     has all three.
   - **#2427:** `test/e2e/gisday/public-routes.spec.ts` against 4201: all pass.
   - **#2425:** `docker exec gisday-api id` shows uid 1000 (node), and the speaker upload above saved; if your local uploads
     folder is owned by root, say so and give it to 1000 first, as production's was.
4. `docker logs gisday-api`: count of `ERROR` lines during the run; quote anything new.
5. `nx run gisday-nest:fit-speaker-photos` **dry run only** against your local uploads with this commit (#2426 changed how it
   encodes): paste its summary, so the director can write the maintainer's production commands.
6. Put the local stack back on `origin/development` with the site build, as you found it.

### Then

Report with every PASS or FAIL line, the results above, the API errors and the dry run's summary. Push `STATUS.md` when you
start and finish. Nothing on GitHub, nothing against production.

---

## Batch 160 (aggiemap: #2459 under-construction buildings draw as a solid block; 27 October 2026, about 12:12 PM Central, from `work (aggiemap)`)

After batch 159. **High priority** - the maintainer is watching this one and has already changed the
specification twice. About 50 minutes. Questions go to `work (aggiemap)`. The work computer is saturated,
which is why this comes to you.

[#2459](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2459): on the October 2026
vector basemap, buildings under construction draw as a **solid block** instead of a hatch over the building.
The cause, measured from the service: the vector tile packager rasterized the authored hatch into a 30 x 27
sprite with **no transparent pixels at all** (42% of it opaque white), and the style uses it as a
`fill-pattern`.

The fix is written and pushed: branch **`fix/2459-construction-hatch`** on the fork (`danielgoldbergtamu`),
head **`75acf7ad6`**. It fetches the sheet the service publishes, draws one replacement tile into a copy of
it, and hands that back with `VectorTileLayer.setSpriteSource()`, so every other sprite stays exactly as
published. **No pull request is open**; it needs your checks and its images first, and I open it when you
report.

**What the maintainer settled, in his words**, because it moved and the final wording is what counts:

- *"The construction shapes should show as hatched orange, no pink."*
- *"The footprints of the buildings under construction should be solid black outline, with checkered hatch,
  with no fill."*
- *"neither the construction area nor the buildings under construction symbology should have a fill. vector
  lines only."*

So: black outline (the style's own line layer, untouched), a checkered orange grid, **nothing filled**.

### What to do

1. **The check.** `scripts/check-in-volume.sh fix/2459-construction-hatch maps-esri,maps-feature-basemap,aggiemap-angular`.
   Report the per-target counts and the exit code, not just pass or fail. 18 unit tests were added in
   `libs/maps/esri/src/lib/services/map/vector-tile-sprites.spec.ts` and passed here before the last two
   specification changes; **they have not been re-run since the grid replaced the diagonal cross**, so treat
   a failure there as expected work rather than a surprise.

2. **Before and after on the real basemap.** The dev server, mounted on a worktree of this branch
   (`CLAUDE.md`, *Fixing a bug quickly*, including `UV_THREADPOOL_SIZE` and `NX_WORKSPACE_DATA_DIRECTORY`).
   **Before** comes from `origin/development`, after from `75acf7ad6` - the same view of the same building,
   both at 1280 x 900 with `timezoneId: 'America/Chicago'`.

   Eight buildings carry `Type = 'CONSTRUCTION'`. **Aplin Center, building 1524**, is the one the maintainer
   has been looking at: `/map/m?bldg=1524`. **Do not leave the building selected in the capture** - the
   selection highlight is yellow and sits on top of the thing being photographed. Open `?bldg=1526` (the BBQ
   Pavilion, next door) instead, or clear the selection, so 1524 shows its own symbology. Zoom so the whole
   footprint is in frame.

   What the after must show, and say so in the report in these terms: **the grass and the trees are visible
   through the hatch**, the lines are orange, and there is no tint of any kind between them. If it reads as a
   wash of orange rather than lines, the spacing is too tight - say so with the picture rather than adjusting
   it yourself.

   Commit both to `docs/screenshots/2459-construction-hatch/`.

3. **The release-note file**: one new file `docs/releases/unreleased/2459-construction-hatch.md`, with its
   *What to test on dev* row, images linked as `../screenshots/2459-construction-hatch/<file>.png`. Then
   `node scripts/collate-release-notes.mjs --check`. **Do not edit `unreleased.md`** ([#2037](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2037)).

4. **`docs/testing.md`: no row and no number** - this adds unit tests, not a smoke spec ([#2002](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2002)).

5. Push to the same branch on the fork and say **"branch ready: fix/2459-construction-hatch"**.

### Two things to check and report on, not act on

- **The September cache.** `Hosted/VTBase/VectorTileServer` (the *Aggieland vector, September 2026* entry in
  the dev gallery) has **no construction sprite at all** - it paints the buildings with a solid
  `fill-color: #BD1A8D`. The fix does not touch it, deliberately: that cache is on its way out. Worth a
  sentence confirming it still looks wrong there, so nobody reports it as a regression.
- **The Construction Zones layer.** The maintainer's third message says *neither* should have a fill. That
  layer draws its service's own `esriSFSDiagonalCross`, which is lines only, and this repository does not
  override its renderer - so there should be nothing to change. **Turn the layer on in your after capture and
  confirm it**, because the claim is mine and it is worth one picture. If it does carry a fill, that is a
  separate finding and a service-side one.

### Don't touch

`fix/2450-campus-directory-dev`, `docs/2451-dev-hostname`, `feat/2437-2438-campuses`, and anything under
`fix/2422-gisday-speaker-photo-preview` (batch 159).

## Batch 159 (gisday: #2422 speaker photo preview - before and after screenshots, signed in; 27 October 2026, about 12:10 PM Central, from `work (gisday)`)

After batch 158. Medium priority; about 40 minutes. Questions go to `work (gisday)`. The work computer is saturated,
so this comes to you.

[#2422](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2422): Admin, Speakers, Add showed
a broken image ("Speaker photo preview") before a photo was chosen. The fix is done and checked (copilot-home batch 23,
report `copilot-home/reports/2026-10-26-23.md`): branch `fix/2422-gisday-speaker-photo-preview` on the fork
(`danielgoldbergtamu`), head `e9e95440db8ae0df4039f59c8844f6eb7ab010ad`, check exit 0. Only the screenshots are missing,
and they need a signed-in admin, which you have (the dev tenant's test admin, as in the release check; never print it).

### What to do

1. **Before**, from `origin/development`: `scripts/gisday-local.sh web --static` (with `api` running), sign in on
   `http://localhost:4201` as the test admin, open `/admin/speakers/add`, and capture the page around the photo area
   (1280 x 900, `timezoneId: 'America/Chicago'`). Expected: the broken image with its alt text. The sign-in helper in
   `work/tools/gisday-release-check2.cjs` (`throughSignIn`) does the sign-in.
2. **After**, from a worktree at `e9e95440d`: `web --static` again, then capture the same page three times: on arrival
   (the placeholder image), after choosing a photo with the file input (the preview shows it), and after **Undo** (the
   placeholder is back). Use any small JPEG.
3. On the branch, commit the four captures to `docs/screenshots/2422-speaker-photo-preview/` (`before-add.png`,
   `after-add.png`, `after-chosen.png`, `after-undo.png`) and a release-notes file
   `docs/releases/unreleased/2422-speaker-photo-preview.md` in the format the other files in that folder use, with its
   *What to test on dev* row (GIS Day has no dev site, #1525; say how to check it on production after release, as an
   admin). `node scripts/collate-release-notes.mjs --check` must pass. Push to the fork branch (the same branch; a new
   commit, no force).
4. Run `web --static` from `origin/development` again at the end, so the local stack is left as it was.

### Then

Report `work-lab-leila/reports/<yyyy-mm-dd>-<n>.md`: the new head, the four file names, and anything that looked wrong.
The director opens the pull request.

---

## Batch 158 (aggiemap: the release tier again, on the commit that actually ships; 27 October 2026, from `work (aggiemap)`)

**This supersedes batch 157.** That tier ran on `2a09a308c`; the production candidate is now
**`d32f74d57`**, which adds one fix - and it is a fix to something batch 157 itself could not see.

### Why it is being run again

Batch 157 reported both new campuses present on `/all-maps` and absent with `?as=production`, which was
true. But **`/all-maps/campus`, the Campus Maps page, listed neither of them** - a different component,
taking the already-filtered application list, so `visible: false` hid them on development as well.
Nobody noticed because nothing asserted what a category page lists. #2449 fixed it; `d32f74d57` is the
first build that carries the fix.

### Wait for the right build

> **`https://dev.aggiemap.tamu.edu/all-maps/campus` lists five campuses**: DC / Bush School, Galveston,
> McAllen, **Fort Worth Law School** and **Houston Space Institute**.

That page listing three is the old build. **Note the host**: `dev.aggiemap.tamu.edu`. Batch 157 carried
`aggiemap-dev.tamu.edu`, which does not resolve - my error, and you found it (#2451).

### Run

```
test/smoke/aggiemap/run-local.sh development release
```

From a clean worktree at `d32f74d57`.

### Compare against batch 157

Its result was **768 tests, 696 passed, 3 failed, 2 flaky, 67 skipped**, and all three failures were
development-only:

| | |
| --- | --- |
| `womensBasketballParkingUrl` 499 | the dev GIS server made that unused service non-public; not ours |
| 3D test picks the September vector basemap | a test fault - the panel rightly marks that basemap 2D only |
| `?bldg=0468` opens several levels too close | real, dev-only, caused by the new vector basemap, **cause not established** |

**Anything beyond those three is new and comes from `d32f74d57`.**

### The manual checks, again, plus one

1. **`/all-maps/campus` lists five campuses.** This is the one the last build got wrong.
2. **Both new campuses are still absent on production, and with `?as=production`.** The fix changed
   which list that page reads, so the production side is worth re-proving rather than assumed.
3. **Search a building on each new campus** - LAWS, RIB-A, FWLE; B500.
4. **If you have time: the `?bldg=0468` zoom.** The GIS team will be looking at the new basemap in the
   morning and will likely notice it. Any detail on why would help.

### Tagging

**Do not tag.** The maintainer decides. Report and stop.

### Report

`work-lab-leila/reports/<date>-<n>.md`, and post on
[#912](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/912).


## Batch 157 (aggiemap: the RELEASE tier on tonight's dev build - this one is the production candidate; 26 October 2026, from `work (aggiemap)`)

**The maintainer intends this build to go to production if it is clean**, so this is the `release`
tier, not `quick`. About thirty minutes.

### Wait for the right build

The build is from `development` at **`2a09a308c`**. It had not registered on Azure when this was
written, so **check what dev is serving rather than assuming**:

> **`https://aggiemap-dev.tamu.edu/all-maps` lists "Fort Worth Law School" and "Houston Space
> Institute" under Campus Maps.** Neither exists before `2a09a308c`.

A second marker, if you want one: the basemap panel's first entry is **"Aggieland vector, October
2026"**. If neither is there, dev has an older build - say so in `STATUS.md` and wait rather than
running the tier against it.

### Run

```
test/smoke/aggiemap/run-local.sh development release
```

From a clean worktree at `2a09a308c`.

### What is in this build, so a failure can be placed

Four changes merged today, and a failure in any of them is ours:

| | |
| --- | --- |
| **#2209** athletics definitions read the development schema | Already proven on Release-495 by your batch 156 - every previously-failing route passed and you confirmed the lot popups. A failure here is a **regression**, not the known problem |
| **#2436** the new vector tile basemap | `VTBase3` is now what dev opens on, titled *Aggieland vector, October 2026*; the September cache is the second gallery entry. Maps may well **look** different - that is the point of the release, not a fault |
| **#2437, #2438** two new campus maps | Fort Worth Law School and Houston Space Institute, **development-only** |
| **#2444** `notification-events.spec.ts` | Its three tests should no longer be skipped under load |

### The three things the suite cannot tell us, and which decide this release

1. **Open each new campus map and type a building name into its search.** The sources are declared from
   fields proven to exist on the services, but nobody has searched these maps. Fort Worth has LAWS,
   RIB-A and FWLE; Houston has B500.
2. **Confirm the two new campuses are NOT listed on production.** The unit tests assert the gate from
   both sides, but the deployed page is what matters. They should be on dev's All Maps and absent from
   production's.
3. **Look at the new basemap.** It is the first thing a visitor on dev now sees. Compare it with
   *Aggieland vector, September 2026* in the basemap panel and say what you think - it is being
   evaluated, and nobody has given an opinion yet.

Say plainly if any of the three is something you cannot do from there, rather than leaving it unsaid.

### Tagging

**Do not tag.** The maintainer decides whether this goes to production. Report and stop.

### Report

`work-lab-leila/reports/<date>-<n>.md`, and post the result on
[#912](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/912). Report per
environment what failed and why, not only pass or fail.


## Batch 156 (aggiemap: the quick tier on Release-495, which carries #2209's athletics fix; 26 October 2026, 3:35 PM Central, from `work (aggiemap)`)

**Start now. About 10 minutes.** This is the run that says whether #2209's fix worked.

### What is on dev

**Release-495's development stage succeeded.** Build `20261026.19`, `sourceVersion` **`c525d8d6b`**, read
from the Azure release API. That commit is PR 2429's merge, so dev now carries the athletics rewrite.

Release-495's production stage is pending the maintainer's approval and has deployed nothing. Production
is still Release-490. **Do not touch production.**

### Run

```
test/smoke/aggiemap/run-local.sh development quick
```

From a clean worktree at `c525d8d6b`. Say what it will run before the first test, as the suite prints it.

### What changed since your batch 152, so you can read the result

Batch 152 ran the release tier on the **previous** build and found 750 tests, 676 passed, **12 failed**.
Those 12 were #2209's eight, the two indoor-track layer-order loads, and the raster-basemap test (#2351).

**PR 2429 fixes #2209's eight.** So:

- **The athletics `map-layers` routes should now pass.** If they do, that is the fix working - say so
  plainly, with the counts.
- **If any of them still fails, that is the news**, and the failure text matters more than the count.
  Quote it.

Note that **#2350 also landed** (dev's known GIS failures are listed now), so batch 152's twelve are not
the baseline any more. **Watch for a `known failure passes` annotation**: it means an entry in #2350's
list is now passing and should be removed, not that something broke.

### The part the suite cannot check

`map-layers.spec.ts` counts features, so it cannot see an empty popup - that is how the second half of
#2209 stayed hidden. **If you can, open one athletics map on dev and click a parking lot**, and say
whether the popup shows the lot's name and description or comes up blank. If that is not something you
can do from there, say so rather than leaving it unsaid; it is the one open question this run cannot
close.

### Tagging

**Do not tag on this run.** The maintainer decides whether Release-495 goes to production, and the
previous tag rule in batch 148 was mine and was wrong (it asked for "exactly the eight" from a release
tier, which a quick tier cannot produce). Report, and the director will ask him.

### Report

`work-lab-leila/reports/<date>-<n>.md`, and post the result on
[#2209](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2209) and
[#912](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/912).


## Batch 155 (gisday: the release check for `sha-eb0fe7d`, the next GIS Day API; read only against production; 26 October 2026, 10:05 AM Central, from `work (gisday)`)

**First priority for GIS Day.** About 30 minutes. `work (gisday)` directs GIS Day again from 9:58 AM.

The maintainer's next GIS Day API release is one image carrying #2205 (PR 2381), #2352 (PR 2382, speaker photos and the
decompression-bomb guard) and the security chat's fixes since `sha-e9e416e` (PR 2375 and later). The newest published images are
**`gisday-nest:sha-eb0fe7d`** and **`gisday-angular:sha-eb0fe7d`** (13:23 UTC today). Production runs site `sha-eab737d`, API
`sha-e9e416e`.

### What to do

1. Your local stack (seed, migrated) with the **published `gisday-nest:sha-eb0fe7d`** as `gisday-api` (local settings, the
   dev-tenant file, `TYPEORM_PASSWORD` from `local-db.env`), and a local site build of `eb0fe7d` on 4201.
2. `work/tools/gisday-release-check.cjs` and `gisday-release-check2.cjs`: every line should PASS, including registration and,
   **now, the sponsor delete** (#2205), and Admin, Users.
3. **#2352 on the real image:**
   - upload a speaker photo larger than 840 px on its shorter side through Admin, Speakers: it is stored resized (say the stored
     file's pixel size and bytes), and the Presenters page shows it;
   - upload a small crafted PNG declaring 50,000 x 50,000: refused with 413 before decoding, and the API keeps running (memory
     unchanged, no restart);
   - an unreadable or SVG file: 400.
   - Remove any test speakers and sponsors afterwards (by SQL if needed).
4. `docker logs gisday-api`: count of `ERROR` lines during the run; anything new, quote it.
5. Also run `nx run gisday-nest:fit-speaker-photos` (dry run only) against your local uploads and paste its summary, so the
   director can write the maintainer's production commands from it.

### Then

Report with every PASS or FAIL line, the #2352 results, the API errors, and the dry run's summary. Push `STATUS.md` when you start
and finish. Nothing on GitHub, nothing against production.

---

## Batch 154 (security: #2371 - prove the msal-node 7.1.0 override on branch chore/override-msal; 26 October 2026, about 7:25 AM Central, from `work (security)`)

**Start now. About 40 minutes.** The maintainer chose (26 October) to force `@azure/msal-node` 7.1.0 under `@azure/identity`
4.14.0 (which still asks for ^6), so `npm audit` loses its two Azure Highs. Nothing here signs in through Azure, but
`mssql` -> `tedious` loads `@azure/identity`, which loads `msal-node`, so **the APIs must still start and query SQL Server.**

Branch: `chore/override-msal` on the `fork` remote (danielgoldbergtamu), commit `5dafc3215d0c3d93c834aa31211276731598a549`.

1. `bash scripts/check-in-volume.sh chore/override-msal` (full check, clean `npm ci`). Record the exit code.
2. Run the whole GIS Day stack locally from that commit (`scripts/gisday-local.sh`, `docs/gisday-local.md`): the API must
   start with no module-load error, and pages that read the database (sessions, speakers, sponsors) must show data. Save the
   API log's first 40 lines.
3. Mailroom: build `mailroom-nest` from the commit and start it with any SQL Server it can reach (the GIS Day stack's
   container is fine; a login failure is fine, a **module-load or `msal` error is not**). Record what it printed.
4. Before and after, in the same way: the same three steps on `origin/development`, so a difference is the override's.
5. Report `work-lab-leila/reports/2026-10-26-154.md`: exit code, what started, any error naming `msal`, `identity` or
   `tedious`. Push `work-lab-leila: batch 154 done - ...`. No PR (the director opens it).

## Start batch 152 now (26 October 2026, 3:22 AM Central, from `home (aggiemap)`)

Batch 151 is done (report 137), and your heartbeat says idle, so **batch 152 below is yours now**: the release tier on Release-494 (`392be39db`).
It was queued before 151 finished, which is why your watcher did not wake for it.

## Batch 153 (security: #2404 - check Dependabot's PR 2401, auth0 7.6.0 and got 16.1.0, on today's development; 26 October 2026, 6:20 AM Central, from `work (security)`)

**Director: work, its security chat.** **Start now.** **Expected: 30 minutes.** On a scratch branch from `origin/development`, merge `pull/2401/head`
(`git fetch origin pull/2401/head`). `scripts/check-in-volume.sh` (full, clean `npm ci` under the install-script policy). Compare the lock key by key with
`development`: only `auth0`'s and `got`'s trees may move. Also run `nx test common-nest-auth` (the auth0 request-level tests from PR 2366) and the three
got specs (`mailer.service.spec.ts`, `contact.service.http.spec.ts`, `helper.controller.http.spec.ts`). Report; **do not push** (Dependabot's branch).

## Batch 152 (aggiemap: #912 - the release tier on Release-494, before production; 25 October 2026, 8:40 PM Central, from `home (aggiemap)`)

**After batch 151** - both are heavy, so never beside it. **Expected: about 30 minutes of tier.** Write `Next update by` when you start.

**Decided** (the maintainer, 8:40 PM): batch 148's question 1 is **(a)**: `392be39db` is tagged `dev-2026-10-25-2` on the quick tier's
result, with the qualification on #912 (#2209's maps were not in that set). Question 2: use `dev.aggiemap.tamu.edu`. And **Release-494
does not go to production until a release tier on dev clears it** (his 2A).

1. **The release tier on dev** (report on: #912)
   - Dev must still be serving Release-494 (`392be39db`). Check that the Visit Maps row is still on `/all-maps/parking` (it was from
     4:53 PM). **If you cannot tell which build dev serves, write "blocked: which build" and stop**; `home` reads Azure.
   - From a worktree at `392be39db`: `test/smoke/aggiemap/run-local.sh development release`. Nothing else heavy beside it.
   - **Expected failures: #2209's eight athletics maps** (accessible layers and per-sport lots that draw nothing on dev's new views).
     Production is healthy for those, so they do not hold this release. **Anything else that fails is news**: say what and why, per test.
   - No new tag (it is already tagged). No production stage, nothing in Azure.
2. Report the counts and every failure, and say plainly whether anything other than #2209's eight failed.

## Note from `home (aggiemap)`, 8:25 PM Central, 25 October 2026

`home` directs AggieMap again (it picked up at 8:25 PM). **PR 2383 (#2380) is already merged**, so batch 150's PR 2386 can take
`origin/development` now. Batch 148's two questions go to the maintainer tonight; the answers come in the next batch. Use
`dev.aggiemap.tamu.edu` for dev, as the suite does.

## Batch 151 (aggiemap: check the capture fixes in PR 2384 at full scale, against production, tonight; 25 October 2026, 5:12 PM Central, from `work (aggiemap, visual baselines)`)

**Written by the work machine's visual-baselines chat at the maintainer's instruction** ("fix all of these in coordination
with the lab machine", 25 October 2026, about 5:05 PM Central). **AggieMap's director is `home` from tonight:** questions go
under **Questions for the director (aggiemap)**, and home's AggieMap chat answers them. **After batch 148**, and after
anything ahead of it. About 45 minutes.

### Why

PR 2384 (`danielgoldbergtamu:fix/2346-2347-capture-settle`, at `cf7216e36`) changes `tools/visual-baselines/capture.mjs`:

- **#2346:** a map still loading or drawing after 60 s, or with a visible layer that never loaded, is tried once
  more, then photographed and listed in the manifest's `unsettled` with the reason. Before, it was saved as if
  finished, and comparisons showed it as a change.
- **#2347:** every shot gets its own browser session. Before, the phone shot of `/events/big-event` showed whichever
  choice the previous shot had visited.

Both were proven on 8 Big Event shots on production. This checks them on a whole routes-only set, about 120 shots.

### When: only all of these

- **After 8:00 PM Central, and before 2:30 AM.** The nightly smoke run starts at 6:17 AM.
- **The cluster's production capture has finished:** `https://visual-baselines.geoservices.tamu.edu/production/prod-2026-10-22/manifest.json`
  contains `"completedAt"`. It started at 4:17 PM and takes about 3.5 hours. Do not capture production while it runs.
- **Nothing of yours is running against production.**

If it is past 2:30 AM before all three hold, say so in `STATUS.md` and leave it. Do not run it in the morning.

### What to do

1. A worktree at the fork branch: `git fetch fork fix/2346-2347-capture-settle`, then a worktree at `cf7216e36`, with the
   smoke `node_modules` volume and `mcr.microsoft.com/playwright:v1.64.1-noble` (the version `package.json` names).
2. **The tests:** `node --test 'tools/visual-baselines/*.test.mjs'`. Expect 27 of 27.
3. **The capture**, into a folder outside every repository, for example `C:\TAMU\visual-baselines-verify`:
   `node tools/visual-baselines/capture.mjs --env production --release verify-2384 --routes-only --concurrency 3 --out /out`.
   Record its last line (`done: N captured, F failed, U unfinished, M min`) and every `~` line (an unfinished map, with its reason).
4. **The same routes from the cluster's set:** for each file in your `desktop/` and `phone/`, download
   `https://visual-baselines.geoservices.tamu.edu/production/prod-2026-10-22/<viewport>/<file>` into a second folder, with its
   `manifest.json`. Then `node tools/visual-baselines/review.mjs <cluster set> <your set> <out>/diff <out>/index.html`.
   Both are production, a few hours apart, so the pages should barely differ. A page that does is either a real
   change or noise this PR should have caught.
5. **Look at the phone event pages** in your set (`phone/events-*.png`). None should show a choice selected that
   the page itself did not choose.

### Report

- the test count; the capture's last line, and every unfinished map with its reason;
- the comparison's `N pages, C changed`, and **for each changed page, your judgement**: a real change, an unfinished
  map that is marked "unfinished", or noise that is not marked. The third kind is what matters;
- whether any phone event page shows a carried-over choice.

**Nothing on GitHub** (you have no `gh`), no pushes but your report, and nothing against development: its smoke tiers and
the cluster's poller use it tonight.

---

## Batch 148 (aggiemap: the quick tier on today's dev build; 25 October 2026, 4:45 PM Central)

**Director: `work (aggiemap)`.** Questions go under **Questions for the director (aggiemap)**.

The maintainer started a dev build at about 4:40 PM Central from `development` at **`392be39db`**
(PR 2376, #912: the Visit Maps row on every Maps page). This batch clears that build.

### 0. Dev already has it - confirmed 5:20 PM Central

**Release-494's `GIS-1D Development` stage succeeded at 21:47 UTC (4:47 PM Central)** with build
`20261025.25`, whose `sourceVersion` is `392be39db`, read from the Azure release API. So you can go
straight to section 2; section 1 is the independent confirmation if you want it.

Release-494's `GIS-1P Production` stage is **pending the maintainer's approval** and has deployed
nothing. Production is still Release-490 (`36b962a04`). Do not touch it.

### 1. Confirming it yourself, if you want to

**Do not trust a bundle name** - each stage bakes its own analytics id in, so the name differs from
any local build. This build has a content marker that is exact and visible:

> **`https://aggiemap-dev.tamu.edu/all-maps/parking` renders a `.visit-maps-row` with six
> `.visit-maps-tile` links.** Before `392be39db` that page has no such row at all.

Check for it; when it is there, dev has this build or newer. If it is not there after a reasonable
wait, say so in `STATUS.md` and stop - do not run the tier against the old build.

### 2. Run the quick tier

```
test/smoke/aggiemap/run-local.sh development quick
```

From a clean worktree at `392be39db`. **Say what it will run** before the first test, as the suite
prints it.

### 3. The expected result - this is the important part

**The run will not be clean, and that is not a regression.** The baseline is your own batch 52:
**434 tests, 388 passed, 8 failed, 1 flaky.** The eight are:

| Failure | Why |
| --- | --- |
| `map-layers` on cross country, indoor track, outdoor track, soccer, softball, swimming, volleyball (7) | [#2209](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2209) - the republished dev athletics views lost the columns the definitions filter on. With the GIS team; nothing for us to fix |
| `development-only.spec.ts` > `/events/womens-basketball requests the ones it uses` | the stale `TS/WomensBasketballParking/MapServer` entry #2176 orphaned. Listed on #2209 to fix in whichever PR fixes the maps |

**Anything beyond those eight is new and belongs to today's merges** - say so plainly and name it.

### 4. Two checks that are new today, and must pass

`392be39db` adds `DEVELOPMENT_ONLY_ALL_MAPS_TILES` to `test/smoke/aggiemap/development-only.ts`, run
as **`/all-maps: the Code Maroon tile is offered`** and **`/all-maps/parking: the Code Maroon tile is
offered`**. Dev is a development host, so both expect the tile to be **present**. This is the first
time that check has run anywhere but the author's machine. **If either fails, it is ours, not the
GIS team's** - report it as a finding rather than folding it into the #2209 count.

### 5. Tag, but only on the exact baseline

The maintainer's decision (1A, 25 October): **tag if and only if the failures are exactly the eight
above** - same specs, same tests, no additions.

- **List the failures in `STATUS.md` before tagging**, so the comparison is on the record rather than
  asserted.
- If they match: `scripts/tag-build.sh dev 392be39db`, then `git push origin <tag>`. The tag means
  *nothing new broke*, which is the most it can honestly mean while #2209 is open - **say that in the
  tag message**, naming #2209.
- If anything else failed, or the eight are not all present: **do not tag.** Report and stop.

### 6. Report

`work-lab-leila/reports/<date>-<n>.md`, and post the result on
[#912](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/912) - per
environment, what failed and why, not only pass or fail. A manual run opens no health issue; only a
GitHub workflow run does.

### Don't touch

`fix/912-visit-maps-nav` is merged and its worktree is gone. The security chat's lock-queue branches
are not yours.


**You joined properly** — the folder, the push, and the **What this is** section saying what you can and
cannot do. That last part is the useful one: it changed what you are being asked to do. You have 64 GB and
24 CPUs, the most of any machine here, and no `gh` CLI. So you get work that wants the machine to itself and
ends in a report, never in a pull request. The director does the GitHub half.

**You are a listener.** Do the batch, report, and stop. Don't offer or start other work. Questions go in your
report under **Questions for the director**, with options and a recommendation — never to the maintainer.

---

> **From 25 October 2026, every listener checks in** (DIRECTOR.md, **Checking in**; #2338): use `tools/listen.sh <your name>` as your watcher, and
> `tools/heartbeat.sh <your name> "running batch <n>" <minutes>` when a batch starts, `idle` when it is reported. `tools/roster.sh` shows everyone.


> **HOLD ON PUSHES, 3:55 PM Central, from `work (security)` (the maintainer: the CI build hosts are saturated):** finish batches 50 and 58 locally, but **do not `git push` anything** until a later note here lifts this. Commit locally and report the head instead. Batch 57 waits as it already does.

> **HOLD LIFTED, 4:35 PM Central, from `work (security)` (the maintainer: CI is clear).** Push now, to the fork only: **`security/check-2184`** (batch 58) and **`chore/2168-webpack-inferred`** (batch 50, with `webpack-cli` accepted: your batch 50 question 1, answer (a)). Neither has a pull request, so neither starts a CI build. Then take batch 57 (PRs 2182 and 2186 have merged, so it can run). Report the two heads.

> **6:45 PM Central, from `work (security)`: batch 62 (Nx 24 as a branch) is waiting and has not started. Start it now.** Then batch 63.

> **Addition to batch 64, 7:15 PM Central, from `work (security)` (the maintainer wants the same on the home machine, and on any machine after).**
> Make `tools/build-agent/README.md` a **machine-independent procedure, "Adding a machine as a build agent"**, in this order, with the agent named
> after its machine (`AZP_AGENT_NAME` = `<machine>-1`, for example `lab-1`, `home-1`). The token is always the maintainer's, typed into a hidden prompt:
> 1. **The maintainer, once per organization:** an Azure DevOps token (User settings → Personal access tokens; scopes **Agent Pools: Read & manage**
>    and **Build: Read & execute**; short expiry). It is never written to a file.
> 2. **The maintainer, once per organization:** the `Linux-Build` pool, and the Monorepo pipeline's fork settings (secrets **off** for forks; a team
>    member's comment required for non-team members). Include the PowerShell for this, which reads the token with `Read-Host -AsSecureString`:
>    `GET`/`POST {org}/_apis/distributedtask/pools` (`name: Linux-Build`, `autoProvision: true`), then `GET` the definition 19, set the
>    `pullRequest` trigger's `forks.allowSecrets = false`, `isCommentRequiredForPullRequest = true`, `requireCommentsForNonTeamMembersOnly = true`,
>    and `PUT` it back. It must be safe to run twice (it skips the pool if it already exists).
> 3. **Per machine (needs Docker):** fetch the branch, `docker build` the image.
> 4. **Per machine:** the maintainer starts `run-agent.ps1` (hidden token prompt; one fresh container per job; Ctrl+C stops it).
> 5. **The maintainer, once per organization:** Project settings → Agent pools → `Linux-Build` → Security → Pipeline permissions → add **Monorepo**.
> 6. **Check:** the agent shows **Online** in the pool, and a PR build's job log names the agent.
> And a section **"Stopping or removing an agent"**: Ctrl+C, then remove it from the pool if the machine is leaving.

> **8:05 PM Central, from `work (security)`: PR 2223 (webpack) and PR 2225 (background agent) have merged. Batch 65 (the Nx 24 refresh) can start now.** **Order, replacing this note's earlier one (8:25 PM): 71, then 73, then 72 (rewritten), then 65.** Batch 65's base is now `development` itself (the webpack conversion is in it), so merge `origin/development` into `chore/2168-nx-24`.

> **9:55 PM Central, from `work (security)`: batches 77 and 79 are withdrawn; skip both.** The director is doing them on its own machine so the lock queue does not wait behind batch 84: Nx 24 re-merged onto `development` after PRs 2191, 2230 and 2235 merged (batch 77), and the typeorm re-lock after Nx 24 merges (batch 79).

> **Batch 138, from `work (security)`: PR 2344 (mail timeouts) has merged.** Next is `fix/2318-angular-build-vite`: merge `origin/development` into it, check,
> push on exit 0. As before, only in batch 139's gaps, never during a smoke tier.

> **Batch 139, from `work (security)`, 10:20 AM Central: dev HAS the new build. Stop waiting and start the quick tier.** Azure DevOps: build 5733
> (`20261025.5`, `development` at `eab737da7`) succeeded at 9:43 AM Central, and Release-493 deployed it to **GIS-1D Development** (succeeded; production is
> waiting for approval, as it should). `main-*.js` keeps its name because none of the changes since the last dev build is in AggieMap's main bundle
> (they are in lazy chunks), so it is the wrong signal. Confirm from a file that did change instead (for example `ngsw.json`'s hash table, or the lazy chunk
> holding the directory's ngx-datatable 25), say which, and go on with steps 2 to 5.

> **Note to batches 138 and 139, from `work (security)`: PR 2339 (got 16) has merged.** While batch 139 is only *waiting* (for dev to serve the new
> build, or between tiers), you may run batch 138's next step, `fix/2277-mail-timeouts` on `origin/development`, as long as it does not slow a smoke run
> (pause it while a tier runs). Batch 139 stays first.

> **Batch 140, from `work (security)`: the maintainer is re-registering the three agents himself, at this machine, now** (your report 125, question 1:
> yes). Don't touch the agents' tasks or containers meanwhile. When he is done, check `docker inspect --format "{{json .Mounts}}" tamu-build-agent-lab-1`
> (and 2, 3) and the next lab job's checkout, and report as step 3 of batch 140 says. Batch 139 carries on as before.

> **Batch 138, from `work (security)`: PR 2349 (vite, #2318) has merged.** Next: `chore/1218-jwks-rsa-4`, merge `origin/development`, check, push on exit 0.
> Batch 139 is done; thank you for report 127. `dev-2026-10-25` is pushed (the director's local recheck on production's GIS server cleared the failures);
> your questions 1 and 2 are #2350 and #2351.

> **Batch 138, from `work (security)`: PR 2354 (jwks-rsa 4) has merged.** Next, **after batch 144** (GIS Day's registration fix comes first):
> `chore/1218-better-sqlite3-13`, merge `origin/development`, check, push on exit 0.

> **Batch 138, from `work (security)`: PR 2362 (better-sqlite3 13) has merged.** Next: `chore/1218-auth0-7`, merge `origin/development`, check, push on exit 0.
> After GIS Day's #2352 guard batch if that is waiting; GIS Day's urgent work stays first.

## Batch 147 (gisday: #2205 again - bring the sponsor-delete fix onto typeorm 1 and today's development; 25 October 2026, 3:50 PM Central, from `work (gisday)`)

**Do this, then batch 145, both next** (changed 4:15 PM): the maintainer will promote one GIS Day API image carrying this fix, #2352's speaker-photo fix (batch 145 finishes it) and PR 2375 together, so production's next API waits on both branches. About 30 minutes.

Your batch 59 branch **`fix/2205-gisday-delete-sponsor-with-logo`** (23 October, on typeorm 0.3) never became a pull request. Since then
typeorm 1 (#2195) and today's fixes have merged, and the release check on `gisday-nest:sha-e8ba974` still shows the delete failing with
the same foreign key (`FK_98821d8bf60cd7694ecaa84dc99`, `assets.sponsorGuid`). (On `sha-e9e416e` it once passed on `work` and on
your stack; find out why it is intermittent, if you can, and say.)

### What to do

1. Merge the latest `origin/development` into the branch (or rebuild it on top, if that is cleaner), resolving for typeorm 1: the
   delete criteria must use keys, not whole rows (the same lesson as #2356).
2. Its tests red on development's code, green on the branch; if the tests mock the repository, add a spec on
   `queryCheckingRepository` (from #2360) for the delete's queries.
3. On your stack with an API built from the branch: create a sponsor **with a logo**, delete it through the admin page: 200, and
   the sponsor, its asset rows and the logo file are gone. Then the whole release check (`work/tools/gisday-release-check*.cjs`).
4. Places and organizations, which batch 59 also looked at: say again what holds on typeorm 1.
5. The bug-fix check on the projects edited plus `gisday-nest`: exit 0. Push.

### Then

Report as usual; the director opens the PR. Nothing on GitHub, nothing against production.

---

## Batch 146 (security: PR 2366 - `auth0` 7 against the development tenant; 25 October 2026, 2:47 PM Central, from `work (security)`)

**Director: work, its security chat.** **Start now** (after anything GIS Day has marked urgent). **Expected: 60 minutes.** **The maintainer decided (25 October)
that you run these checks, with the development tenant's test-admin file he put on this machine for GIS Day.** Never print, copy, commit or quote its values,
and leave the test account's id out of the report.
1. GIS Day's local stack built from **`fork/chore/1218-auth0-7`** (`d181a4a57`): the API from this branch (built as `publish.yml` builds it) and the site, on the seed, migrated.
2. Signed in as the test admin, as batch 141's release check does:
   1. **Profile:** open it; name, email and the GIS Day fields load.
   2. **Edit and save** one GIS Day field, reload: the change is kept and the email is unchanged. Put the field back.
   3. **Admin → Users:** the list loads, sorted by name, with each user's connection. Say how many it shows.
   4. **A class roster and a competition leaderboard** show names and emails, not *N/A*.
   5. **The API log:** no `ManagementService` errors.
3. The same five on `origin/development` first, so each result has a "before" to compare with.
4. Report each step before and after. Nothing on GitHub; the director puts the result on PR 2366.

> **From `work (security)`: the maintainer merged PR 2366 (`auth0` 7) before batch 146's checks.** Carry on with batch 146 as written: it is now the proof after the
> merge. "Before" is `development` just before it, `e17c982a9`; "after" is the branch (or `origin/development`, which now contains it). If any step fails, report at
> once in `STATUS.md`, so a fix or a revert can go up before the next GIS Day promotion. **Batch 138, next after 146:** `fix/2320-all-auth0-users`, merge
> `origin/development`, check, push on exit 0.

> **Batch 138, from `work (security)`: PR 2370 (#2320) has merged.** Next: `fix/2111-bull-uuid`, merge `origin/development`, check, push on exit 0. Then
> batch 137's `fix/2319-nx-undici`, the same, once 2111's PR has merged.

> **Batch 138, from `work (security)`: PR 2375 (`bull`'s `uuid`) has merged.** Last in the queue: batch 137's `fix/2319-nx-undici`, merge `origin/development`,
> check, push on exit 0. After GIS Day's batches 147 and 145, which come first (the next GIS Day release waits on them).

## Batch 150 (security: #2122, #1899 - remove what batch 149 found certain; a branch; 25 October 2026, 4:36 PM Central, from `work (security)`)

**Director: work, its security chat.** **Start after batch 149.** **Expected: 2 hours.** Only what batch 149 lists as **certain**; anything doubtful stays on the list.
1. Branch `chore/2122-remove-unused` from `origin/development`. Remove, in separate commits so each can be reviewed or reverted alone: the certain unused
   dependencies (and `@types/bull`, #2311, if certain); the certain unused files and exports; the stale `gisday-bridge-nest` entries in every exclusion list; the
   `tsconfig.base.json` path to the missing `common/nest/guards`; #1899's AggieMap and shared-library items batch 149 proved dead; #1123's two unused
   connection URLs. **No app or library removal in this batch** (those are the maintainer's decisions).
2. Re-lock (`npm install --package-lock-only --ignore-scripts`); the lock diff must show only removals of the named packages' trees.
3. `scripts/check-in-volume.sh` (full), with a clean `npm ci`. Record `npm ci`'s package count and the full check's time before and after (`docs/build-times.md`
   rules: the "before" first).
4. Commit messages say `Part of #2122` (or `#1899`, `#2311`, `#1123`), Co-Authored-By. Push to the fork. No PR. Report each removal with its proof.

## Batch 149 (security: #2122, #1457, #1899 - what is unused, now; read only; 25 October 2026, 4:36 PM Central, from `work (security)`)

**Director: work, its security chat.** **Start after the GIS Day and AggieMap batches ahead of it.** **Expected: 90 minutes.** The maintainer asked (25 October)
where removing unused components and imports stands, and to carry it on. Today's upgrades removed a lot; this finds what is left, on `origin/development`.
1. **knip** (pinned; the newest release at least 7 days old) across the workspace: unused dependencies, devDependencies, files and exports. **Check each by hand**:
   on 23 October 16 of knip's 27 "unused" dependencies turned out to be used, by app entry points knip did not follow (#2157). Mark each **certain**, **doubtful**
   (with what might use it) or **used** (knip was wrong, and why).
2. **Libraries no deployed project depends on:** `nx graph --file=…` and list each library with no dependant among the apps that ship (#1203's rule: an app can
   be dead while its library is load-bearing; check per project).
3. **Apps:** for each of the 14 under `apps/`, whether it ships (Azure `EXCLUDED_PROJECTS` in `azure-pipelines.yml`, and a Dockerfile for `publish.yml`), when it
   last had a real change, and whether CI builds it. Recommend keep or remove for each, with the evidence; **the decision is the maintainer's.**
4. **#1899's running list:** for each item, still there, and still dead?
5. **Stale configuration:** names in `EXCLUDED_PROJECTS` lists (`build.yml`, `lint.yml`, `test.yml`, `azure-pipelines.yml`) of projects that no longer exist
   (`gisday-bridge-nest` is one); `tsconfig.base.json` paths to folders that do not exist.
6. Report only: one table per section. Questions for the director (security) for anything the maintainer must decide.

> **Batches 149 and 150, from `work (security)`:** the AggieMap chat is deleting the retired `ues-operations-nest` and `openid-client` 3 (#2380, PR going up).
> Once it has merged, **`better-sqlite3` and `better-sqlite3-session-store` are unused**: batch 150 removes them as one set, the root dependencies, the
> `overrides` entry and the `"better-sqlite3": false` `allowScripts` entry, if batch 149 confirms nothing else uses them. If #2380 has not merged when batch 149
> runs, survey `origin/development` as it is and say so.

> **Report 135's questions, from `work (security)`:** (1) the app and library removals go to the maintainer; (2) `ues-operations-angular` is **kept**: it is
> deployed and was repaired today by the AggieMap chat (#2214), on TAMU Entra; (3) knip's configuration is #2385. Batch 150 goes ahead with report 135's
> certain list.

> **From `work (security)`, about 8 PM: PRs 2381, 2382 (jimp, a lock change) and 2384 have merged.** PR 2386 (`chore/2122-remove-unused`) needs
> `origin/development` merged in: if `package-lock.json` conflicts, take `development`'s and remove only the branch's packages again (batch 41's method),
> and `@eslint/js` stays. Then `scripts/check-in-volume.sh` (full), push on exit 0, and say so in `STATUS.md`. **After the AggieMap chat's PR 2383** if both
> are waiting: 2383 merges first.

> **From `work (security)`, about 8:15 PM:** PR 2383 (openid-client, the UES Operations API) is pushed and green locally; its CI is running and the maintainer
> merges it next. **When it has merged**, bring PR 2386 (`chore/2122-remove-unused`) up to date as the 8 PM note says, **and add one commit removing
> `better-sqlite3` and `better-sqlite3-session-store`** (root dependencies, the `overrides` entry, the `"better-sqlite3": false` `allowScripts` entry, and
> `express-session` and `jwt-decode` if nothing else uses them), each proven unused by search and by the full check (`Part of #2122`). Push on exit 0.

> **From `work (security)`, 8:20 PM: PR 2383 has merged** (and 2387, 2389). **Do PR 2386 now**: merge `origin/development` into `chore/2122-remove-unused`,
> add the `better-sqlite3` set as the 7:57 PM note says, full check, push on exit 0, and push a status line. The maintainer is waiting to merge it.

## Still there? (batch 139, from `work (security)`, 11:25 AM Central)

Your `STATUS.md` has not moved since 10:09 AM; you appear to be still waiting for `main-*.js` to change, which it will not (see the note above batch 140:
dev has had build 5733 since about 9:46 AM). **The director is running the AggieMap quick tier from the work computer now, and will push the `dev-*` tag if it
passes**, because the maintainer needs the tag. **So skip batch 139's steps 2 and 3.** Do step 4 (the release tier) and step 5 (the What to test on dev rows), then
batch 141 (GIS Day's signed-in checks) between or after them, and the vite branch (batch 138) after. Push a one-line status when you read this.

## Batch 145 (gisday: #2352, refuse decompression bombs before resizing; 25 October 2026, 2:30 PM Central, from `work (gisday)`)

On the #2352 branch from batch 143 (report `2026-10-25-130`), before the PR. **Next after batch 147** (changed 4:15 PM): the next GIS Day API release waits on this too. The security chat reviewed the dependency side (four
`@jimp/*` at ~1.6.1, 15 lock keys, no install scripts, signatures verified) and asks for one guard, which the GIS Day chat agrees with.

The 5 MiB upload limit caps the **file**, not the **decoded** size: a small PNG or JPEG can declare tens of thousands of pixels per
side and make jimp allocate gigabytes in the API process.

### What to do

1. **Red first:** a test that uploads a crafted small file (a few KB) whose header declares huge dimensions (for example 50,000 x
   50,000), expecting a refusal; prove it red on the branch as it is (it decodes, or tries to).
2. Read the image's declared width and height from its header **before decoding** (cheap: PNG `IHDR`, JPEG `SOFn`, WebP and GIF
   headers as the upload accepts them; a small header reader, or a pure-JS library already in the tree if one does it without
   decoding), and refuse anything over **8000 x 8000 or 40 megapixels** with **413** and a message saying the image is too large in
   pixels. An unreadable header is refused too (400).
3. Green, plus the batch 143 tests. The bug-fix check on the projects you edited must exit 0. Push the branch.

### Then

Report the red and green output and the bound chosen. Nothing on GitHub; the director opens the PR.

---

## Batch 144 (gisday: URGENT, FIRST PRIORITY - #2356, session registration answers 500 on typeorm 1; 25 October 2026, 2:35 PM Central, from `work (gisday)`)

**Do this before anything else in this file, including batch 138's lock queue** (the security chat agrees: the GIS Day API has
been rolled back to `sha-ee1a9e4` because of this, which also takes production back off multer's DoS fix until the fixed image
ships). From your report `2026-10-25-128`: on typeorm 1, `UserRsvpProvider.insertUserRsvp` passes the whole loaded event as a
where value (`where: { event: event, accountGuid }`), and typeorm 1 refuses the event's null `capacity`, so every registration
answers 500. The maintainer chose: the GIS Day chat's fix, with a test that fails first against a real database.

### What to do

1. Branch `fix/gisday-rsvp-null-capacity` from the latest `origin/development`, in its own worktree.
2. **A regression test, red first, that exercises typeorm itself, not a mocked repository.** Best: a spec that runs the
   provider (or the query) against a real typeorm DataSource with the real entities, if they load on a database you can
   start in a test (say which). If that is impractical, an integration test against the local stack's SQL Server that the
   repository can run (say how CI would run it, or that it cannot). Prove it red on the unfixed code with the same
   `Null value encountered in property ... capacity` error.
3. **The fix:** look the RSVP up by the event's key: `where: { event: { guid: event.guid }, accountGuid }`. Do **not** set
   `invalidWhereValuesBehavior` globally; it would hide the class of mistake.
4. **The same pattern elsewhere**, from your report: `competitions/data-api/.../form/form.service.ts:36` and `:52`,
   `sponsor.provider.ts:42`, `user-submission.provider.ts:40` (a whole season as a where value). Change each to the key
   (`{ guid: season.guid }`), and search `libs/gisday` and `apps/gisday-*` for any other whole-entity where value; list what
   you found and changed.
5. **Green:** the test, then a real registration and unregistration on your local stack with an API built from the branch
   (`work/tools/gisday-release-check.cjs` should now print PASS for registration), plus the rest of the release check (saves,
   uploads, Show/Hide) still passing.
6. `scripts/check-in-volume.sh fix/gisday-rsvp-null-capacity <the projects you edited>,gisday-nest` (the bug-fix form in
   CLAUDE.md) must exit 0. Commit with `Closes #2356` and a message saying it fixes the registration 500 on typeorm 1; push to the fork.

### Then

Report as soon as it is pushed: branch and head, red then green test output, the registration requests and statuses, the other
sites changed, the check's exit code. Push `STATUS.md` when you start and when it is pushed. The director files the issue and
opens the PR at once. Nothing on GitHub, nothing against production.

---

## Batch 143 (gisday: #2352, resize speaker photos on upload, and a script for the ones already stored; 25 October 2026, 2:05 PM Central, from `work (gisday)`)

Low priority: after your security work and batch 142. Development, ending in a branch. About an hour.
[#2352](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2352) has the measurements (Presenters loads
60 photos, 9.0 MB, for 255 px cards; five over 500 KB) and what to do.

**A new dependency, and which one (updated 2:20 PM, with the security chat):** use a **pure-JavaScript** image library,
such as `jimp` (or only the `@jimp/*` packages it needs), **not `sharp`**. `sharp` brings native libvips binaries and an install
script, which widens the native-code and install-script surface #2293 and #2326 just narrowed, and the API would decode
untrusted uploads in native code. Speaker photos are small and few, so pure-JS speed does not matter. If a pure-JS library
genuinely cannot do it, stop and put it under **Questions for the director (gisday)**: `sharp`'s install-script entry would
be the maintainer's decision, never added by you. Whichever library: its newest release at least **7 days** old (#2333),
`npm ci` passing under the install-script allowlist, and the lock diff showing **only that package's tree**. The security
chat has agreed to the timing; its lock queue just re-checks after this merges.

### What to do

1. Branch `fix/2352-gisday-speaker-photo-size` from the latest `origin/development`, in its own worktree.
2. **Red first:** a test that uploads a large speaker photo (for example 3000 x 3000) and expects it stored at the target
   size; prove it red.
3. **On upload** (`libs/gisday/platform/data-api/src/lib/speaker/`, `images/speakers`): resize to cover the largest place a
   speaker photo is shown at twice its pixel size, keep the aspect ratio, re-encode at a sensible quality, strip EXIF, keep
   the file-name pattern. Find the largest display size in the site's templates (the presenter card is 255 px wide; check
   the presenter's own page) and say what you chose and why. Small photos are left alone or only re-encoded.
4. **Existing photos:** a re-runnable script (in `apps/gisday-nest` or `tools/`, beside how other one-time jobs live) that
   resizes every file under the uploads' `images/speakers` the same way, **in place, same names**, so no database row
   changes; a dry run by default listing before and after sizes; `--apply` to write; originals copied aside first. Prove it
   on the local stack's uploads. On production the maintainer runs it later, on the uploads volume; do not run it there.
5. Before/after: the Presenters page's total image weight on the local stack, and the release-notes entry
   `docs/releases/unreleased/2352-gisday-speaker-photo-size.md` with a What to test row.
6. `scripts/check-in-volume.sh fix/2352-gisday-speaker-photo-size` must exit 0 (with the lock's clean `npm ci`). Push.

### Then

Report: branch and head, the library and version, red then green, the chosen size and quality, the script's dry run and
apply output locally, the page-weight comparison, the check's exit code. Nothing on GitHub; the director opens the PR.

---

## Batch 142 (gisday: complete the dev test admin's profile, so release checks cover registration; 25 October 2026, 1:40 PM Central, from `work (gisday)`)

Small, about 15 minutes, whenever your queue allows. **Decided by the maintainer** (answering your batch 141 question 1): yes.

### What to do

1. On your local GIS Day stack (as in batch 141), sign in as the dev tenant's test admin and complete the account's profile
   on the site's own profile page (Account, then Details), with obviously made-up values (for example "Release Check" as
   the name). This writes only to the **development** Auth0 tenant's test account; nothing touches production.
2. Prove it: on Sessions, register for one session and unregister again, through the site. Expect a POST to the RSVP
   route answering 2xx, then the delete answering 2xx. `work/tools/gisday-release-check.cjs` (its last step) should now
   print PASS for registration.
3. Leave the profile complete. Never print or commit any value from `auth0-dev.local.env`.

### Then

Report the two requests and their statuses, and the script's registration line. Nothing on GitHub.

---

## Batch 141 (gisday: the signed-in release checks for `eab737da7`, now that this machine has the dev-tenant file; 25 October 2026, 10:40 AM Central, from `work (gisday)`)

**Do it as soon as batch 139 lets you; it blocks the GIS Day release** (`sha-eab737d`), which your batch 139 has
already cleared for everything that needs no sign-in. About 30 minutes.

The maintainer has put `C:/TAMU/gisday-local/auth0-dev.local.env` on this machine: the development Auth0 tenant's
management credentials and its test admin (`TEST_ADMIN_EMAIL`, `TEST_ADMIN_PASSWORD`). **Never print, copy, commit or
quote any value from it**, in a report, a log you push or anywhere else. Use it only by path.

### What to do

1. **Does the file work?** Check it has the keys the scripts read (names only: `TEST_ADMIN_EMAIL`, `TEST_ADMIN_PASSWORD`,
   and the `AUTH0_MANAGEMENT_*` three), without printing values.
2. **The stack, at `eab737da7`:** `gisday-db` with the repository's seed (`scripts/gisday-local.sh db` and `restore`,
   then `migrate run` until #2196 lands), Redis, and **the published `ghcr.io/tamugeoinnovation/gisday-nest:sha-eab737d`**
   as `gisday-api` on the `gisday-local` network, started with `--env-file C:/TAMU/gisday-local/gisday-api.local.env
   --env-file C:/TAMU/gisday-local/auth0-dev.local.env` and `TYPEORM_PASSWORD` from `local-db.env` (as `scripts/gisday-local.sh
   api` does, but the image instead of a build). The site: `scripts/gisday-local.sh web --static` from a checkout at
   `eab737da7` (its local build, which signs in to the dev tenant), on 4201.
3. **Sign in** as the test admin on `http://localhost:4201` (Login/Signup) and open Admin, then Events. That alone answers
   whether the file works; say so in `STATUS.md` straight away.
4. **The checks:** `work/tools/gisday-release-check.cjs` and `gisday-release-check2.cjs` on this branch, with the docker
   command at the top of each. Copy them into a scratch folder; put a small PNG as `rel/small.png` and a file over 5 MiB
   as `rel/big.png` beside them. They cover: authenticated admin calls; admin saves of an event, sponsor, speaker and class
   keeping every field (typeorm 1's first test with everything else since `ee1a9e4`); a 25 KB upload accepted and an
   oversized one refused 413; Show and Hide on schedule; deleting the test sponsors (**expected to fail with 500 until
   #2205**, so that one failing is not a release blocker). Registration needs a test admin with a completed profile; say
   if it is blocked by "Profile Incomplete", as it was on `work`.
5. **Clean up:** the scripts put each changed field back; remove the `REL CHECK` sponsors by SQL (their `assets` rows
   first, then `sponsors`), and confirm none is left. Also read `docker logs gisday-api` for any `ERROR` during the run.

### Then

Report with each check's PASS or FAIL line as the scripts print them, the API log's errors (if any), and whether anything
other than the known #2205 delete failed. Questions go under **Questions for the director (gisday)**. Nothing on GitHub,
and nothing against production.

---

## Batch 140 (security: #2343 - re-install this machine's build agents so they mount the git mirror; 25 October 2026, 9:47 AM Central, from `work (security)`)

**Director: work, its security chat.** **The maintainer decided (25 October) that you do this.** **Do it in the first gap in batch 139** (for example
while waiting for dev to serve the new build, or between the two smoke tiers), **but only when no Azure Pipelines job is running on this machine**:
re-installing restarts each agent and would cancel a job in progress. **The release build, 5733, is running on the lab now: wait for it to finish.**
How to tell: `docker ps` shows no agent job container busy (a job's container runs a `Linux-Build` job; the supervisor's log under
`%LOCALAPPDATA%\tamu-build-agent\logs\` says the agent is listening). **Expected: 15 minutes.**
1. **Why** (#2343): build 5733 warned *No git mirror at /mirror/monorepo.git on this agent* on every lab job. The scheduled tasks run copies of the scripts
   made at install, from before #2255 added the mirror (`tools/build-agent/README.md`: "run it again after pulling a change to them").
2. In the checkout the agents were installed from: `git pull` `development`. Then, for each agent installed here (`lab-1`, `lab-2`, `lab-3`, and `lab-4` if it
   is): `powershell -File tools/build-agent/install-agent-task.ps1 -AgentName lab-N -Start`. **No token is involved**: the saved DPAPI token is reused. Never
   print or read it. If any step asks for a token, stop and report; that part is the maintainer's.
3. **Check:** `docker volume ls` shows `tamu-agent-git-mirror` with `monorepo.git` in it; each agent is back online (its log). Then the next lab job's
   *Checkout from the lab mirror* step says *Borrowing objects from the lab's read-only mirror* and there is no warning. PR 2339 or 2342's next build will show it; say which.
4. Report each step's result, and the install script's version (the commit of `tools/build-agent/` you installed from).

## Batch 139 (security: the release - test AggieMap and GIS Day at `eab737da7` before production; **first priority**; 25 October 2026, 9:23 AM Central, from `work (security)`)

**Director: work, its security chat.** **Start now; pause batch 138** (finish the check it is in, then leave the queue until this is reported).
**Expected: 2 hours, most of it waiting for the deploy.** The maintainer decided (25 October) to release `development` at **`eab737da7`**
(PR 2300, angulartics2): two days of security work and 100 commits since `prod-2026-10-22`. He is starting AggieMap's dev build and release
by hand; GIS Day's images for `eab737da7` (`sha-eab737d`) are being built by the `Quabity Assuance` workflow. Follow
[`docs/releases/README.md`](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/blob/development/docs/releases/README.md) "Cutting a release".

**AggieMap**
1. **Now:** record dev's current `/map` bundle hash (the main `*.js` file named in `https://aggiemap.dev.geoservices.tamu.edu/map`'s HTML, or whichever
   dev address `test/smoke/aggiemap/environments.json` gives). Then check it every 5 minutes; **dev has the new build when it changes**, and the new bundle
   contains something only this build has (for example a string from PR 2330's code runner, `lineNumbers`). Stop waiting after 3 hours and report.
2. From a worktree at `eab737da7`: **`test/smoke/aggiemap/run-local.sh development quick`**. Say what it chose to run before it starts.
3. **Only if it passes:** `bash scripts/tag-build.sh dev` at `eab737da7` and `git push origin <the dev-* tag>` (this task says so). If it fails, no tag;
   report each failure and why.
4. Then **`test/smoke/aggiemap/run-local.sh development release`** on the same build: passed, failed, skipped, duration. These numbers go in the notes.
5. **The visible changes on dev:** work through the *What to test on dev* rows of every `docs/releases/unreleased/*.md` entry (front matter `testOnDev`)
   on dev: for each, pass or fail, with a screenshot to `docs/screenshots/<slug>/dev-<date>.png` in the report's branch or the report itself.

**GIS Day** (no dev site; production is the first place an image runs, so the local stack is the test)
6. When `sha-eab737d` of `gisday-angular` and `gisday-nest` exist (`gh` is not here: `docker pull ghcr.io/tamugeoinnovation/gisday-angular:sha-eab737d`
   succeeds), run the local stack on `eab737da7` as [`docs/gisday-local.md`](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/blob/development/docs/gisday-local.md)
   says, and check the public pages: home, Sessions, Presenters and one presenter, competitions, sponsors; no console errors.
7. **Signed in** (admin saves, uploads and their limit, registration): `work/tools/gisday-release-check.cjs` needs the development tenant's test admin.
   If this machine has those settings (never print them), run it and report each line. If it does not, say so; that part goes to the maintainer.
8. **The schema:** `git diff 36b962a04..eab737da7 -- libs/gisday/platform/data-api/src/lib/entities`. Empty means the API can be promoted without a migration;
   otherwise list each change ([`docs/gisday-migrations.md`](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/blob/development/docs/gisday-migrations.md)).
   `36b962a04` is AggieMap's production commit; if GIS Day's production image is another `sha-`, say the director must check it against that one too.

Report everything above, then resume batch 138.

## Batch 138 (security: the lock queue's checks, from now on on this machine; standing; 25 October 2026, 9:12 AM Central, from `work (security)`)

**Director: work, its security chat.** **Start after batch 137** (or now, in parallel, if 137 is waiting on something). The maintainer needs the work
computer, so **every full check is yours from now**; the director only opens pull requests. Merged since batch 136: PRs 2324, 2328, 2330, 2332 (chart.js),
2336 (**the release-age rule is now 7 days**, #2333).
1. **Dependabot's PR 2322** (`marked` 18.1.1, `webpack` 5.111.1; #2329): on a scratch branch from `origin/development`, merge `pull/2322/head`
   (`git fetch origin pull/2322/head`) and run `scripts/check-in-volume.sh` (full). Compare the lock key by key against `development`: only those two and
   their own dependencies. Report the result; **do not push** (it is Dependabot's branch).
2. **Dependabot's PR 2300** (`angulartics2` 14; #2310): the same. If Dependabot has recreated it by then, use its new head.
3. **Then `chore/1218-got-16`** (fork, `90fa7f03e`, `development` already merged in): after 2322 merges, merge `origin/development` into it and run the
   check; push on exit 0. Then the same for each next branch **as the one before merges**: watch `gh`-free with `git fetch origin` every 10 minutes and
   `git log origin/development`. The order is `got-16`, `fix/2277-mail-timeouts`, `fix/2318-angular-build-vite`, `chore/1218-jwks-rsa-4`,
   `chore/1218-better-sqlite3-13`, `chore/1218-auth0-7`, `fix/2320-all-auth0-users`, `fix/2111-bull-uuid`, then batch 137's `fix/2319-nx-undici`.
   Each branch must already contain the previous one; merge `origin/development` in only once the previous branch's PR has merged.
4. After each, push `work-lab-leila/STATUS.md` with the branch, its new head and the check's exit code, so the director can open its PR. A short
   report every few branches is enough.

## Batch 137 (security: #2319 - override the `undici` that `nx` pins, stacked; a branch; 25 October 2026, 8:44 AM Central, from `work (security)`)

**Director: work, its security chat.** **Start now.** **Expected: 45 minutes.** Your batch 136 is right; #2327 is retitled and recorded.
**Decided (the maintainer, 25 October): the release-age rule is now 7 days, not 14** (#2333): for Dependabot and for our own upgrades.
Since yesterday the director has re-stacked the whole queue (heads in `security/HANDOFF.md`); PRs 2324, 2328 and 2330 have merged and chart.js is PR 2332.
1. Branch `fix/2319-nx-undici` from **`fork/fix/2111-bull-uuid`** (`4dbf8b852`, the end of the queue).
2. The scoped override `"nx": { "undici": "7.30.1" }` (published 15 October, so past the 7-day rule), re-lock; only `nx`'s `undici` may move. If `nx` pins
   it in a nested copy, check the override reaches that copy (`npm ls undici`). Show the keys.
3. Prove it: `npm audit` no longer lists `undici` (list the High and Critical left); Nx itself still runs (`nx --version`, `nx show projects`, and one
   real target, such as `build geoservices-angular`).
4. `scripts/check-in-volume.sh` (full). Commit (`fix(workspace): Override the undici that nx pins, for its advisories`, `Closes #2319`,
   Co-Authored-By), push to the fork. No PR.

## Batch 136 (security: #2327 - the flaky `common-ngx-ui-sidebar` test; a branch; 24 October 2026, 2:50 PM Central, from `work (security)`)

**Director: work, its security chat.** **Start after batch 135.** **Expected: 60 minutes.**
1. Read the failing log you kept (report 120), name the spec and the assertion, and say why load makes it fail.
2. Reproduce it: the project's tests under load (for example `--parallel=8` with other projects' tests, or `taskset` to two CPUs), enough runs to
   show red at a rate you can state. Then the fix (deterministic waits or fake timers, not a longer timeout), and the same runs green.
3. Branch `fix/2327-sidebar-test-under-load` from `origin/development`. `scripts/check-in-volume.sh <branch> common-ngx-ui-sidebar`. Commit
   (`fix(common-ngx-ui-sidebar): Make its test pass under load`, `Closes #2327`, Co-Authored-By), push to the fork. No PR.

## Batch 135 (security: #1218 - the rest of the lock queue, from `better-sqlite3`; branches; 24 October 2026, 2:50 PM Central, from `work (security)`)

**Director: work, its security chat.** **Start after batch 134.** **Expected: 90 minutes.** **Decided** (report 120): question 2, yes.
1. `chore/1218-better-sqlite3-13`: drop your local `5e914fd66`; on `4631ad03e` (jwks-rsa merged in), set the entry to **`"better-sqlite3": false`**
   (deny: the prebuilt binary, never a build), with the reason in the commit. Merge **batch 134's branch** into it too, so the tool accepts the
   entry (it will also come from `development` once its PR merges). Check (full); push only on exit 0.
2. Then, in order, as batch 133: `chore/1218-auth0-7`, `fix/2320-all-auth0-users`, `fix/2111-bull-uuid`, each on the one before, each checked
   (full), pushed on exit 0. A branch adding a package with an install script (or a `binding.gyp`) adds its entry, read and named.
3. Report each new head and its check lines, and every conflict. A flaky failure is re-run once and reported as batch 133 did.

## Batch 134 (security: #2326 - the install-script check accepts a `binding.gyp` package's entry; a branch; 24 October 2026, 2:50 PM Central, from `work (security)`)

**Director: work, its security chat.** **Start now.** **Expected: 30 minutes.** Your report 120 is right, and the finding is good: thank you.
**Decided:** question 1 yes (this batch, then batch 135); question 3 yes (#2327, batch 136).
1. Branch `fix/2326-install-scripts-binding-gyp` from `origin/development`.
2. `tools/security-findings/install-scripts.mjs`: *Not installed any more* only for an entry whose package is not in the lock at all. An entry for an
   installed package with no `hasInstallScript` is reported on its own line (*no install script recorded; npm may still treat a `binding.gyp` as one*)
   and is not stale. Two tests in `install-scripts.test.mjs` (one each), red first on the current code. The README's description to match.
3. `node --test 'tools/**/*.test.mjs'`; then `scripts/check-in-volume.sh fix/2326-install-scripts-binding-gyp` (it should run no Nx tasks, and the
   `lint.yml` steps). Commit (`fix(workspace): Accept an allowScripts entry for an installed package with no recorded script`, `Closes #2326`,
   Co-Authored-By), push to the fork. No PR.

## Batch 133 (security: #1218 - bring the rest of the lock queue up to date, in order; branches; 24 October 2026, 2:21 PM Central, from `work (security)`)

**Director: work, its security chat.** **Start now.** **Expected: 2 hours.** Your batch 132 is right and is on #2111.
**What merged** (PRs 2314, 2312, 2317, 2294, 2316, 2302, 2303, 2305): `development` now has marked 18, `allowScripts` with `strict-allow-scripts`
(#2293), Dependabot's cooldown, and the rest. The director has done the first two of the queue:
- `chore/1218-ngx-datatable-25` = **PR 2324** (`43e044240`, development merged in, check exit 0);
- `chore/1218-ngx-highlightjs-14` (`6e7e2a183`, stacked on it, release notes renamed to `2325-*`, #2325; the director is checking it).
1. **In this order, each on the one before** (fetch each from the fork; merge the previous branch's *new* head into it; `git merge`, no rebase, no
   force-push): `chore/1218-chart-js-4` ← `6e7e2a183`; then `chore/1218-got-16`; `fix/2277-mail-timeouts`; `fix/2318-angular-build-vite`;
   `chore/1218-jwks-rsa-4`; `chore/1218-better-sqlite3-13`; `chore/1218-auth0-7`; `fix/2320-all-auth0-users`; `fix/2111-bull-uuid`.
2. **The lock:** if a merge conflicts on `package-lock.json`, take the lower branch's lock, remove the upper branch's own package entries, and
   re-lock (`npm install --package-lock-only --ignore-scripts`), as batch 41 did; compare key by key. After each, run the branch's own lock-only
   change again if it had one, as CLAUDE.md's "Regenerating a conflicted lock" says.
3. **`allowScripts`:** on `chore/1218-better-sqlite3-13`, remove its now-stale `better-sqlite3` entry (`npm install-scripts prune` or by hand), and
   `node tools/security-findings/install-scripts.mjs` must report no stale entries. On every branch it must exit 0: a branch adding a package
   with an install script must add the entry, with the script read and named in the report.
4. **`scripts/check-in-volume.sh <branch>`** (full) on each, in order; push each to the fork **only when its check exits 0**. Stop at the first
   that fails and report.
5. Report the new head of each, the check's lines for each, and every conflict and how it was resolved.

## Batch 132 (security: #2111 - Trivy on every image built from the stack's tip; read only; 24 October 2026, 10:05 AM Central, from `work (security)`)

**Director: work, its security chat.** **Start now.** **Expected: 60 minutes.** Your batch 131 is right; it joins the lock queue after #2320's branch.
The npm side is now known. This checks what the images themselves carry once the whole stack has merged.
1. From **`fork/fix/2111-bull-uuid`** (`6fbc15541`), build the eight images as `publish.yml` builds them: the four APIs (`gisday-nest`,
   `geoservices-nest`, `mailroom-nest`, `mailroom-helper-nest`) and the four front ends (on `nginx-base:sha-b5ba4a5`, as PR 2312 pins).
2. Trivy 0.76.1, `--scanners vuln --severity CRITICAL,HIGH`, as the publish gate runs it, on each. Then once more at `MEDIUM` for the record.
3. For each finding: the image, the package (OS or npm), the installed and fixed versions, whether `.github/security/accepted-advisories.json`
   covers it, and what fixes it (a base-image re-pin, an `apk upgrade` line in nginx-base, an npm change), within the 14-day rule (#2292).
4. Also the same eight from `origin/development`, so the report says what the stack fixes and what it does not.
5. Report only: no branch. Remove the test images afterwards.

## Batch 131 (security: #2111 - `uuid` 11.1.1 under `bull`, stacked; a branch; 24 October 2026, 9:55 AM Central, from `work (security)`)

**Director: work, its security chat.** **Start now.** **Expected: 45 minutes.** Your report 117 is right and is now on #2111. **Decided:** question 1
yes (this batch); question 2, the dates are on #2111.
1. Branch `fix/2111-bull-uuid` from **`fork/fix/2320-all-auth0-users`** (`9d9319a77`).
2. The scoped override `"bull": { "uuid": "11.1.1" }`, re-lock; only `bull`'s `uuid` may move (8.3.2 gone, the shared 11.1.1 used). Show the keys.
3. Prove it: `npm audit` no longer lists the `uuid` advisory; gisday-nest's production image (built as `publish.yml` builds it) starts, and a Bull
   queue adds a job and runs it against a throwaway Redis, on the base and on this branch. Say which queue and how you triggered it.
4. `scripts/check-in-volume.sh` (full). Commit (`fix(workspace): Override bull's uuid to 11.1.1 for its buffer advisory`, `Part of #2111`,
   Co-Authored-By), push to the fork. No PR.

## Batch 130 (security: #2111 - the moderate and low advisories, which reach production and what fixes each; read only; 24 October 2026, 9:50 AM Central, from `work (security)`)

**Director: work, its security chat.** **Start now.** **Expected: 45 minutes.** Your batch 129 is right; it joins the lock queue after auth0 7.
Your report 112 counted **19 moderate and 1 low** advisories after the vite override. Nobody has looked at them one by one.
1. On the tip of the prepared stack (`fork/fix/2320-all-auth0-users`, `9d9319a77`), `npm audit --json`. For each moderate or low advisory:
   the package and version, the path that brings it in, whether it is in **production** (`--omit=dev`) or dev only, the fixed version and when it
   was published (the 14-day rule, #2292), and whether a direct-dependency bump, a scoped override or nothing (no fix yet) reaches it.
2. For each that reaches production: is the vulnerable code reachable from ours (what the advisory needs: input we pass, a feature we use)?
   Say how sure you are. `.github/security/accepted-advisories.json` is the place for an unreachable one, with the reason.
3. Report only: no branch. End with a short list: fix now (with the override or bump), accept (with the reason), wait (until a date).

## Batch 129 (security: #2320 - Admin → Users lists only the first 50 Auth0 users; a branch, stacked; 24 October 2026, 9:45 AM Central, from `work (security)`)

**Director: work, its security chat.** **Start now.** **Expected: 45 minutes.** Your batch 128 is right; `~7.4.0` and the scoped `undici-types`
override are accepted. Your question 1 is #2320, this batch; question 2: yes, the dev-tenant steps become the auth0 PR's *What to test on dev*.
Leave the scratch folder `C:/TAMU/b15/b128/a0`; it is outside every repository.
1. Branch `fix/2320-all-auth0-users` from **`fork/chore/1218-auth0-7`** (`f187b889a`).
2. **The test first:** in `management.service.requests.spec.ts`, the stubbed API holds 51 users over two pages (50 and 1, with the
   `include_totals` envelope's `total`, `start`, `limit`); `getUsers` must return all 51, sorted by name. Run it on `f187b889a`: it must fail
   (50). Record that.
3. **The fix:** `getUsers` walks every page (7's `Page`: `for await`, or `hasNextPage()` / `getNextPage()`), still sorted by name, mapped as
   today. Guard against a runaway loop (a page cap, say 100 pages, logged if hit). Green.
4. `scripts/check-in-volume.sh fix/2320-all-auth0-users common-nest-auth,gisday-platform-data-api,gisday-nest` (a bug fix; the
   projects it edits and the app). Commit (`fix(gisday-platform-data-api): List every Auth0 user in Admin → Users, not only the first 50`,
   `Closes #2320`, Co-Authored-By), push to the fork. No PR. It is not visible without a tenant of more than 50 users; say so for the screenshots.

## Batch 128 (security: #1218 - `auth0` 3 to 7, stacked; a branch; 24 October 2026, 9:30 AM Central, from `work (security)`)

**Director: work, its security chat.** **Start now.** **Expected: 3 to 4 hours; stop and report at 4.** Your batch 127 is right. **Decided**
(report 114, question 1): the stale `better-sqlite3` entry in `allowScripts` is removed when the `better-sqlite3` pull request is opened, after PR 2317
has merged. Not in this batch.
1. Branch `chore/1218-auth0-7` from **`fork/chore/1218-better-sqlite3-13`** (`e12f83ebd`).
2. `auth0` to the newest 7.x at least 14 days old (7.4.0 is from 9 October, so it is **not** yet: take the newest 7.x published before
   10 October, and say which). Re-lock; only `auth0` and its own dependencies may move; list them.
3. Port the two users, `libs/common/nest/auth` and `libs/gisday/platform/data-api` (the GIS Day user-management client), to 7's
   `ManagementClient`: each method we call, its 7 name and shape, and the response unwrapping (`.data`) and pagination. List every call
   site with before and after.
4. **Prove what can be proved without the tenant:** a unit test per wrapper method that our code sends the request 7 is expected to send
   (method, path, query, body) and maps the response, against a local HTTP stub (`nock` or a throwaway server) standing in for the
   management API, red on a wrong mapping. Do **not** use any real Auth0 tenant or credentials; say plainly what remains to be proved against
   the development tenant (that step is the maintainer's), and how: the pages and actions to try.
5. `scripts/check-in-volume.sh` (full). Commit (`chore(workspace): Move auth0 to 7`, `Part of #1218`, Co-Authored-By), push to the fork. No PR.

## Batch 127 (security: #1218 - `better-sqlite3` 12 to 13, stacked; a branch; 24 October 2026, 9:25 AM Central, from `work (security)`)

**Director: work, its security chat.** **Start now.** **Expected: 45 minutes.** Your batches 125 and 126 are right. **Decided** (your report 113,
question 1): `jose` 6.2.13 is accepted as it is; it is the copy `development` already installs.
1. Branch `chore/1218-better-sqlite3-13` from **`fork/chore/1218-jwks-rsa-4`** (`c85e3d77c`).
2. `better-sqlite3` to the newest 13.x at least 14 days old (13.0.3, 5 August, per report 111), in `package.json`'s dependency **and** its
   `overrides` entry, and anywhere else it is named (an app's own `package.json`). Re-lock; only `better-sqlite3` and its own dependencies may move.
3. Prove it loads, not only that it installs: in `node:24.22.1`, after `npm ci` (its install script is in `allowScripts` once PR 2317 merges;
   this branch does not have it yet, so the script runs as today), open an in-memory database through TypeORM's `better-sqlite3` driver,
   create a table, insert and read back a row; the same on the base branch. Say what changed between 12 and 13 that touches us (its release notes).
4. `scripts/check-in-volume.sh` (full). Commit (`chore(workspace): Move better-sqlite3 to 13`, `Part of #1218`, Co-Authored-By), push to the fork. No PR.

## Batch 126 (security: #1218 - `jwks-rsa` 2 to 4, stacked; a branch; 24 October 2026, 9:20 AM Central, from `work (security)`)

**Director: work, its security chat.** **Start after batch 125.** **Expected: 90 minutes.**
1. Branch `chore/1218-jwks-rsa-4` from **batch 125's branch** (`fix/2318-angular-build-vite`), so it stacks on the lock queue.
2. `jwks-rsa` to the newest 4.x at least 14 days old (4.1.0, published 19 June, per your report 111). Change `libs/common/nest/auth`'s JWT strategy
   (`passportJwtSecret`) only as far as 4 needs. The lock: only `jwks-rsa` and its own dependencies may move; list them.
3. **Prove it works, not only that it builds:** with batch 114's local issuer and a real API image (gisday-nest is the one we can run), a token
   it signs is accepted and a token signed by another key is refused (401), on both `development` and this branch. If that is more than an hour,
   say so and prove what you can.
4. `scripts/check-in-volume.sh` (full). Commit (`chore(workspace): Move jwks-rsa to 4`, `Part of #1218`, Co-Authored-By), push to the fork. No PR.

## Batch 125 (security: #2318 - override the `vite` that `@angular/build` pins; a branch, stacked; 24 October 2026, 9:20 AM Central, from `work (security)`)

**Director: work, its security chat.** **Start now.** **Expected: 45 minutes.** Your report 111 is right. Its question 1 is already
done: PR 2294 adds `cooldown` (merged into `development` soon). Its question 2 is not for this batch.
1. Branch `fix/2318-angular-build-vite` from **`fork/fix/2277-mail-timeouts`** (`341121633`, the tip of the prepared stack), so it is next in
   the lock queue.
2. Add the override `"@angular/build": { "vite": "8.3.4" }` beside the others, re-lock (`npm install --package-lock-only --ignore-scripts`), and
   show the lock diff: only `node_modules/@angular/build/node_modules/vite` (and anything it alone needs) may move.
3. Prove it: `npm audit` shows no `vite` advisory (list what is left, High and Critical); `build aggiemap-angular` and `build gisday-angular`;
   the dev server (`serve aggiemap-angular`) starts and serves a page (Vite runs there).
4. `scripts/check-in-volume.sh` (full). Commit (`fix(workspace): Override the vite that @angular/build pins, for its High advisories`,
   `Closes #2318` in the body, Co-Authored-By), push to the fork. No PR.

## Batch 124 (security: #1218 - what is left before "latest at least 14 days old" is reached; read only; 24 October 2026, 9:10 AM Central, from `work (security)`)

**Director: work, its security chat.** **Start now.** **Expected: 45 minutes.** Your batch 123 is right; PR 2317 is open from it.
The maintainer asked whether "latest of everything" can ever be finished. This batch answers with numbers.
1. On `origin/development`, plus the stacked branches that already prepare upgrades (`fork/chore/1218-marked-18`, `fork/chore/1218-ngx-datatable-25`
   and the ngx-highlightjs, chart.js and got branches stacked on it, from your batches 119-121), list every **direct** dependency in the root
   `package.json` (and each `apps/*/package.json`) that is behind. For each: the version we have, the newest version that is **at least 14 days
   old** today (from `npm view <pkg> time --json`), whether that is a patch, minor or major, and whether a prepared branch already covers it.
2. Group what is left into: (a) patch or minor, which Dependabot's grouped weekly pull requests will take with cooldown; (b) majors with no prepared
   branch, each with a one-line estimate of the work (what breaks; which apps); (c) held on purpose (Node, Nx and Angular majors, and anything
   `dependabot.yml` ignores), with the reason.
3. Also: transitive packages that `npm audit` (High or Critical) still reports on `development`, and whether `.github/security/accepted-advisories.json`
   covers each.
4. Report only: no branch, no push except the report. End with one sentence: after the prepared branches merge, how many majors are left, and a rough
   total of the work in hours.

## Batch 123 (security: #2293 - allow only known install scripts, and check registry signatures; a branch; 24 October 2026, 8:39 AM Central, from `work (security)`)

**Director: work, its security chat** (questions go under **Questions for the director (security)**). **Start now.** **Expected: 90 minutes.**
Most malicious npm releases run through an install script, and npm runs every one we install without asking (#2293).
1. **List them.** In a `node:24.22.1` container on a clean `npm ci` of `origin/development`, list every installed package with a
   `preinstall`, `install` or `postinstall` script (from `node_modules/**/package.json`, plus `binding.gyp` packages, which npm builds
   implicitly), with: its version, which of our projects pulls it in (`npm ls <name>`), what the script does, and **whether anything breaks
   without it**. Test that last part with `npm ci --ignore-scripts` and then `nx affected`-free runs of `lint`, `test` and `build` for a few
   projects that use it (esbuild and @swc/core in a build, better-sqlite3 in a test that opens a database, nx itself). Say which scripts are
   needed and which can be skipped.
2. **Find the mechanism.** What does npm 11 (the version `node:24.22.1` ships) support for an allow-list: `allowScripts` in
   `package.json` or `.npmrc`, `ignore-scripts=true` plus explicit `npm rebuild <pkg>` for the needed ones, or anything else. Say what
   each does when a **new** package with an install script arrives: is the script skipped silently, does it warn, or does it fail. CI must
   notice a new one; a silent skip is not enough.
3. **`npm audit signatures`** on the same install: exit code, how long it takes, and what it reports (packages with no signature, no
   attestation). Say whether it can run in CI as a failing step today.
4. Branch `ci/2293-install-scripts` from `origin/development`: the allow-list (step 2's best mechanism), a check that fails when an
   installed package has an install script not on the list (a script under `tools/security-findings/` or `scripts/`, with its own
   `bash ...test.sh` or node test, wired into `lint.yml` beside the other non-Nx steps), and `npm audit signatures` as a CI step if step 3
   says it is safe. Keep the Docker images' installs (`Dockerfile`s that run `npm ci`) working: say which ones you changed and prove each builds.
5. `scripts/check-in-volume.sh` (full; the lock and `package.json` may change, so it runs `npm ci`). Commit
   (`ci(workspace): Allow only known install scripts, and check registry signatures`, `Part of #2293`, Co-Authored-By), push to the fork.
   No PR. If step 1 shows that skipping scripts breaks more than it is worth, stop after step 3 and report.

## Batch 122 (security: #2263 - the own-file type errors in ts-events-ngx and the other projects, listed and fixed; a branch; 24 October 2026, 7:25 AM Central, from `work (security)`)

**Director: work, its security chat** (questions go under **Questions for the director (security)**). From Saturday the security director is the home machine. **Start now.** **Expected: 90 minutes.** Your batch 121 is right; the lock queue is fully stacked. Your batch 98 survey found **74 type
errors in projects' own files** once the ArcGIS path was fixed (61 in `ts-events-ngx`'s definition specs). Whatever the maintainer decides on
#2263 (typechecking specs in CI), errors in our own files are bugs: fix those, not causes C and D (other projects' files).
1. On `origin/development` (it has #2269's path fix), re-run your spec typecheck survey and list **every error in a project's own files**, by project,
   file and line. Say for each whether the code or the test is wrong, as batch 99 did.
2. Branch `fix/2263-own-file-type-errors` from `origin/development`: fix them. For any in component or service code (not a spec), say what it does at
   run time today and whether a user could see it; a visible bug gets a test that fails first and before/after screenshots.
3. Each fixed project's own files typecheck under its spec tsconfig (other projects' errors may remain; list the totals before and after).
   `scripts/check-in-volume.sh` (full). Commit (`fix(workspace): Fix the type errors in projects' own files that spec typechecking shows`,
   `Part of #2263`, Co-Authored-By), push to the fork. No PR. If it is more than about 100 errors or two hours, stop after `ts-events-ngx` and report.

## Batch 120 (security: #1218 - ngx-highlightjs 14 stacked on ngx-datatable 25, with its release-notes file; a branch; 24 October 2026, 7:00 AM Central, from `work (security)`)

**Director: work, its security chat** (questions go under **Questions for the director (security)**). From Saturday the security director is the home machine. **Start now.** **Expected: 45 minutes.** Your batch 119 is right and goes after PR 2314. Same method for the next in the lock queue:
1. In a worktree of `fork/chore/1218-ngx-highlightjs-14` (your batch 95): `git merge origin/development`, then `git merge
   fork/chore/1218-ngx-datatable-25` (`08ad06d5d`). For the lock: start from `ngx-datatable`'s, redo `ngx-highlightjs` (and
   `highlightjs-line-numbers.js`'s removal) alone by batch 41's method; key by key against `ngx-datatable`'s lock, only those move. Check
   `ngx-highlightjs` 14.0.1's publish date against the 14-day rule (#2292); if it is younger, pin the newest release that is 14 days old and say so.
2. **It is visible** (geoservices' code samples become highlighted, with line numbers): add `docs/releases/unreleased/<issue>-ngx-highlightjs.md`
   as `docs/releases/unreleased/README.md` describes, using your batch 95 screenshots, with a *What to test on dev* row (geoservices' dev site, a
   services page and the getting-started docs). Use the placeholder issue number `9999` in the file name and `issue:`; the director renames it
   when filing. `node scripts/collate-release-notes.mjs --check` must pass apart from that.
3. `scripts/check-in-volume.sh chore/1218-ngx-highlightjs-14`. Commit, push to the fork. No PR.

## Batch 121 (security: #1218 - chart.js 4, then got 16 and the mail timeouts, stacked in turn; branches; 24 October 2026, 7:00 AM Central, from `work (security)`)

**Director: work, its security chat** (questions go under **Questions for the director (security)**). From Saturday the security director is the home machine. **Start after batch 120.** **Expected: 60 minutes.** The rest of the lock queue, the same way, each on the one before:
1. `fork/chore/1218-chart-js-4` (batch 104): merge `origin/development`, then `fork/chore/1218-ngx-highlightjs-14`; redo `chart.js` 4.5.1's lock
   entries (and `chartjs-plugin-colorschemes`, `@types/chart.js`, `moment` going) alone. 4.5.1's age is fine; keep `~4.5.1`. Check, push.
2. `fork/chore/1218-got-16` (batch 105): merge `origin/development`, then `fork/chore/1218-chart-js-4`; redo `got` 16.0.0's tree alone. Check got
   16.0.0's age (30 August). Check, push.
3. `fork/fix/2277-mail-timeouts` (batch 107, already on `got` 16): merge `fork/chore/1218-got-16`; no lock change of its own. Check, push.
Report each branch's tip and its lock diff against the one before. No PRs.

## Batch 119 (security: #1218 - ngx-datatable 25 prepared on top of marked 18, with copilot-home's empty-row finding; a branch; 24 October 2026, 6:50 AM Central, from `work (security)`)

**Director: work, its security chat** (questions go under **Questions for the director (security)**). From Saturday the security director is the home machine. **Start now.** **Expected: 45 minutes.** The lock queue is now: `marked` 18.1.0 (PR 2314, building) → **`ngx-datatable` 25** → `ngx-highlightjs` 14 →
`chart.js` 4 → `got` 16 → mail timeouts. `angulartics2` 14 goes as Dependabot's PR 2300 instead of your branch. `copilot-home` (GitHub Copilot on the
maintainer's home computer, a new listener) reviewed your `ngx-datatable` branch (its report `copilot-home/reports/2026-10-24-3.md`): one likely
finding, `libs/sass/components/_datatable.scss`'s `datatable-selection { .empty-row { padding } }` rule cannot match 25's markup (there is no
`<datatable-selection>`; the empty message is `.datatable-empty-row > .empty-row`), so an empty table loses its 0.5rem 1rem padding.
1. In a worktree of `fork/chore/1218-ngx-datatable-25`: `git merge origin/development`, then `git merge fork/chore/1218-marked-18` (PR 2314's
   branch), so it is stacked on `marked`. The lock will conflict: take `marked`'s lock and redo `@swimlane/ngx-datatable` alone by batch 41's
   method; key by key against `fork/chore/1218-marked-18`'s lock, only `node_modules/@swimlane/ngx-datatable` moves. Its 25.1.0 was published in
   August, so the 14-day rule (#2292) is met.
2. **Check copilot-home's finding** against your empty-table screenshots (`*-empty-before/after.png`). If the padding is lost, fix the selector
   (no `datatable-selection` parent) and retake the empty "after" shots; if not, say why the rule still reaches it.
3. `scripts/check-in-volume.sh chore/1218-ngx-datatable-25` (it now also runs the smoke typecheck). Commit, push to the fork. No PR: the director
   opens it when `marked` merges.

## Batch 118 (security: #2212 - the agents' reinstall from development, prepared and dry-run, commands for the maintainer; nothing installed; 24 October 2026, 6:10 AM Central, from `work (security)`)

**Director: work, its security chat** (questions go under **Questions for the director (security)**). From Saturday the security director is the home machine. **Start now.** **Expected: 30 minutes.** **Do not reinstall, stop or register any agent yourself.** Your #2291 fix is PR 2303. PRs 2249
(networks), 2252 (Node in the image, 12 GB / 5 CPUs) and 2255 (git mirror) have merged, so `development`'s `tools/build-agent` has all of it. The
running `lab-1` to `lab-3` still use batch 74's scripts from `C:\TAMU\wt-2212n` and the old image.
1. In the main checkout `C:\TAMU\Tamu.GeoInnovation.js.monorepo` (pull `development` first; say the commit): build both images from
   `tools/build-agent` (`tamu-gisc/build-agent:latest` and the egress image) and confirm Node is in the tool cache and the mirror code is present.
2. **Dry-run** what the reinstall will do, without touching the running agents: the egress proxy's config accepts the per-agent networks; the mirror
   volume is created and filled by `Confirm-Mirror` (run it alone, it is host-side and safe); a `lab-test` agent started with a dummy token from
   the main checkout's scripts reaches Azure through the proxy, mounts `/mirror` read-only, and stops after `VS30063`. Clean it up after.
3. Write, in **For the maintainer**, the exact PowerShell, one command per block, the first with `cd` (CLAUDE.md's global rule): rebuild both
   images, reinstall `lab-1` to `lab-3` at 12 GB / 5 CPUs from the main checkout's `tools/build-agent`, add `lab-4`, and how to confirm four
   agents Online and the next job's log showing *Found tool in cache* and *Checkout from the lab mirror* in about a second. Say to do it when
   `Linux-Build` shows no job running. Remove the `C:\TAMU\wt-2212n` worktree only after the reinstall, and say so.

## Batch 117 (security: #2291 - the pre-push check refuses a misspelt project; a fix and a branch; 24 October 2026, 6:30 AM Central, from `work (security)`)

**Director: work, its security chat** (questions go under **Questions for the director (security)**). From Saturday the security director is the home machine. **Start now.** **Expected: 30 minutes.** Your batch 113, 114, 115 and 116 work is PRs 2290 (merged), 2296 (multer), 2295 (msal) and
nginx-base PR 2. Your batch 113 finding is #2291: `scripts/check-in-volume.sh <branch> <projects>` passes when a named project does not exist.
1. **Prove it first**: a misspelt name (e.g. `common-ngx-pipez`) gives exit 0 and *No tasks were run* today.
2. Branch `fix/2291-check-project-names` from `origin/development` (it has PR 2290's `lint_steps`): before running, check every named project
   against `nx show projects` in the volume and exit 2 naming each unknown one, with the nearest real name if one is close. Affected and all modes
   are unchanged. `bash scripts/check-in-volume.test.sh` covers it (a fixture project list).
3. The misspelt run now exits 2 with the name; a correct list still runs. Commit (`fix(workspace): Refuse a project list naming a project that
   does not exist`, `Closes #2291`, Co-Authored-By), push to the fork. No PR.

## Batch 116 (security: #2289 - nginx-base rebuilt with brotli-libs 1.2.1-r0; in the nginx-base repository; a branch; 24 October 2026, 5:40 AM Central, from `work (security)`)

**Director: work, its security chat** (questions go under **Questions for the director (security)**). From Saturday the security director is the home machine. **Start after batch 114 (multer).** **Expected: 45 minutes.** **Decided by the maintainer (5:40 AM): (a), the lab makes the change in
`TamuGeoInnovation/nginx-base` through his fork `danielgoldbergtamu/nginx-base`, and he merges it.** A different repository: clone it fresh into
its own folder (`C:/TAMU/nginx-base`), `origin` = `TamuGeoInnovation/nginx-base`, `fork` = `danielgoldbergtamu/nginx-base`. Its default branch is
`master`; its `Dockerfile` is `FROM nginx:1.30.6-alpine`, and `.github/workflows/build-publish.yaml` publishes on `master`.
1. Read the workflow: which tags it publishes (`:latest`, `:sha-<short>`?), and on which events. Read the README for how changes are made there.
2. Branch `fix/brotli-libs-cve-2026-111497` from `origin/master`: after the `FROM`, `RUN apk upgrade --no-cache brotli-libs` (with a comment
   naming the CVE and saying it can go once `nginx:1.30.6-alpine` itself carries 1.2.1-r0). If upgrading only that package pulls in others,
   say which.
3. Build the image locally, scan it with batch 112's Trivy settings: **0 high, 0 critical**. Then prove it still works as the front ends' base:
   build `aggiemap-angular`'s production image `FROM` it (the monorepo's `apps/aggiemap-angular/Dockerfile`, with the local tag) and serve one page
   (200, the token substitution in the entrypoint still runs).
4. Commit (`fix: Upgrade brotli-libs to 1.2.1-r0 for CVE-2026-111497`, a body linking
   https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2289, Co-Authored-By), push to **the fork**
   (`danielgoldbergtamu/nginx-base`). No PR: the director opens it. Report the workflow's tags, so the director knows what the four front ends'
   Dockerfiles must be moved to after it publishes.

## Batch 114 (security: #2287 (High) - multer 2.5.0 by override for CVE-2026-113872; a fix and a branch; 24 October 2026, 5:25 AM Central, from `work (security)`)

**Director: work, its security chat** (questions go under **Questions for the director (security)**). From Saturday the security director is the home machine. **Start now, ahead of anything queued** (batch 113 waits; a high vulnerability comes first). **Expected: 45 minutes.** Your batch 112 answers:
**1 yes**, filed as #2287 (High), #2288 and #2289 (Medium, the maintainer's choice); **2 yes**, let the daily scan report them.
1. Branch `fix/2287-multer` from `origin/development`. Root `dependencies`: `"multer": "^2.5.0"` (or the latest 2.x that fixes it; read the
   advisory's patched range), and `overrides`: `"multer": "$multer"`, so `@nestjs/platform-express`'s exact pin is replaced. Lock by batch 41's
   method, key by key: only `multer` (and anything only it needs) moves.
2. **Behaviour:** the upload-route specs from #2120 pass; and one API image (gisday-nest, as batch 71) accepts an upload through a real upload
   route against the seed, and refuses an oversize one as before.
3. **Re-scan** the four API images with batch 112's Trivy settings: `multer` gone from each; the only high left is `@azure/msal-node` on
   gisday-nest and mailroom-nest. `npm audit --omit=dev`: `multer` gone.
4. `scripts/check-in-volume.sh` (full), **and `npx tsc -p test/smoke/aggiemap`** (until #2286 makes the script run it). Commit
   (`fix(workspace): Override multer to 2.5.0 for its denial-of-service advisory`, `Closes #2287`, Co-Authored-By), push to the fork. No PR.

## Batch 115 (security: #2288 - is @azure/msal-node's authorization-code flow reachable here?; an investigation, a fix or an acceptance; 24 October 2026, 5:25 AM Central, from `work (security)`)

**Director: work, its security chat** (questions go under **Questions for the director (security)**). From Saturday the security director is the home machine. **Start after batch 114.** **Expected: 45 minutes.** `@azure/msal-node` 6.0.1 (CVE-2026-109461, the authorization-code flow may
disclose parameters) reaches gisday-nest and mailroom-nest through `mssql` → `tedious` → `@azure/identity`. No 6.x fixes it; 7.1.0 does.
1. **Is it reachable?** Read how tedious uses `@azure/identity` (which authentication types load it), and how our APIs configure `mssql`
   (`authentication.type` in each data source and environment file; never print a secret). If no code path here ever calls MSAL's
   authorization-code flow, say exactly why.
2. **If unreachable:** a branch `fix/2288-msal-accept` adding the advisory to `tools/security-findings/accepted-advisories.json` the way that file
   records an acceptance (read its format and any earlier entries' history), citing #2288 and the reason; `check.mjs` then reports it accepted.
   **If reachable:** `overrides` to `@azure/msal-node` 7.1.0, tested against a real SQL Server connection (the local GIS Day stack), and a
   re-scan.
3. Full check and the smoke tsc. Commit (`Closes #2288`, Co-Authored-By), push to the fork. No PR. Report which path and why.

## Batch 113 (security: #2286 - the pre-push check runs the smoke suite's typecheck, as CI's lint does; a fix and a branch; 24 October 2026, 5:40 AM Central, from `work (security)`)

**Director: work, its security chat** (questions go under **Questions for the director (security)**). From Saturday the security director is the home machine. **Start next, after batch 112.** **Expected: 45 minutes.** PR 2285 (maplibre) passed `scripts/check-in-volume.sh` and failed CI's lint on
`npx tsc -p test/smoke/aggiemap` (a step in `.github/workflows/lint.yml` outside `nx`), which the script never runs.
1. **Prove it first:** on a branch that breaks the suite's types (e.g. `fork/chore/1218-maplibre` before `c90ba50a3`, i.e. `5012aba01`), the
   script exits 0 today.
2. Branch `fix/2286-check-smoke-tsc` from `origin/development`: the script also runs every `run:` step of `lint.yml` that is not an `nx` command
   (read from the workflow, as it reads the exclusion lists; today that is `npx tsc -p test/smoke/aggiemap`), in the same volume, and fails if any
   does. Say how it finds them and what it would do with a step it cannot run. `bash scripts/check-in-volume.test.sh` covers the reading.
3. On `5012aba01` the script now exits non-zero with TS2307; on `development` it exits 0. CLAUDE.md's description of the script, if it lists what
   it runs, says so. Commit (`fix(workspace): Run the smoke suite's typecheck in the pre-push check, as CI does`, `Closes #2286`,
   Co-Authored-By), push to the fork. No PR.

## Batch 112 (security: where security stands after tonight; a scan, nothing pushed; 24 October 2026, 5:00 AM Central, from `work (security)`)

**Director: work, its security chat** (questions go under **Questions for the director (security)**). From Saturday the security director is the home machine. **Start after batch 111.** **Expected: 45 minutes.** **Commit nothing, push nothing.** Your batch 110 answer: thank you; the Nx ignore
is removed in PR 2284 (#2283), and your 24.0.1 branch is held in case Monday's Dependabot run brings the same.
1. On `origin/development` as it is when you start (say the commit): `npm audit --omit=dev --json` and `npm audit --json` in Docker: totals by
   severity, and every high or critical with its path.
2. Build the production images the publish workflow builds (the eight in `.github/workflows/security-scan.yml`) from that commit and scan each
   with the same Trivy settings the daily scan uses (`tools/security-findings/check.mjs`'s inputs; the `trivy-cache` volume if it is free).
   Report per image: critical and high counts, and anything new against the last daily scan's results.
3. **The same for the tip of the lock queue** if you can build it cheaply: `fork/chore/1218-got-16` stacked work is not merged, so instead scan
   `fork/ready/2247-maplibre` (GLightbox and maplibre on top of today's merges) the same way, to see whether the queued upgrades change the
   count.
4. Report only: a table per image, and anything that needs a fix, as a recommended issue.

## Batch 111 (security: #2243 - lint's false "Recursive task invocation detected"; an investigation, a fix if one is clear; 24 October 2026, 4:50 AM Central, from `work (security)`)

**Director: work, its security chat** (questions go under **Questions for the director (security)**). From Saturday the security director is the home machine. **Start after batch 110.** **Expected: 60 minutes.** Your batch 109 answers: **1 yes**, 2279, then the toasts (#2281), then geoservices
(#2282, which closes #2278); **2 none**. You hit Nx's *Recursive task invocation detected* on lint twice (batches 80 and 87), through a chain of
unrelated lint tasks (`maps-esri → common-ngx-pipes → … → maps-esri`), and each passed on a rerun.
1. **Reproduce it**: run `nx run-many -t lint` (and `affected -t lint`) repeatedly in a check volume, with and without the Nx daemon and the
   cache, at `--parallel=8` and lower, and say how often it happens. Capture the full chain Nx prints.
2. **Find why**: lint's `dependsOn` in `nx.json` (`^lint`? something inferred by `@nx/eslint/plugin`?), project implicit dependencies, or a real
   cycle between projects' lint inputs. Check whether Nx 24.0.1 (batch 110) changes it.
3. If the cause is clear and the fix small, branch `fix/2243-lint-recursion` from `origin/development`, prove the reproduction no longer fails
   (as many runs as it took to see it, times three), full check, commit (`Closes #2243`), push. Otherwise report what you found. No PR.

## Batch 110 (security: #1218 - Nx 24.0.0 to 24.0.1, the patch Dependabot skips; a branch; 24 October 2026, 4:30 AM Central, from `work (security)`)

**Director: work, its security chat** (questions go under **Questions for the director (security)**). From Saturday the security director is the home machine. **Start after batch 109.** **Expected: 30 minutes.** Your batch 108 answer: **leave the close as it is.** The toasts' sub-issue is #2281.
Dependabot ignores Nx entirely (`.github/dependabot.yml`), so Nx patches are ours. Nx 24.0.1 is out (your survey, batch 76).
1. Branch `chore/1218-nx-24-0-1` from `origin/development`: `nx` and every `@nx/*` to 24.0.1 (exact pins, as now), batch 44's lock method for `nx`
   and `@nx/*` only, key by key (only Nx's own entries move). `nx migrate 24.0.1` first: report any migration it lists, and run them; commit
   none of `migrations.json`.
2. Full check. Commit (`chore(workspace): Move Nx to 24.0.1`, Co-Authored-By; the director adds the issue), push to the fork. No PR.

## Batch 108 (security: #2278 - the notification toasts off @angular/animations; a branch; 24 October 2026, 4:15 AM Central, from `work (security)`)

**Director: work, its security chat** (questions go under **Questions for the director (security)**). From Saturday the security director is the home machine. **Start after batch 107.** **Expected: 90 minutes.** Your batch 106 answers: **1 yes**, notifications next; **2 none**. AggieMap's part is PR 2279
(closes #2280, a sub-issue of #2278; the director files one sub-issue per part).
1. The notification item's `animate` trigger (toasts in and out, six apps). **These enter and leave the page, so `animate.enter`/`animate.leave` fit**
   here. Record before first, in one app that shows a toast without a sign-in (say which; trigger a toast through its component in dev mode if
   none is natural), into `docs/screenshots/animate-enter-leave/notifications-*`.
2. Branch `chore/2278-notification-animations` **from `fork/chore/1218-animate-enter-leave`** (so it builds on `libs/sass/_motion.scss`; the director
   restacks it after 2279 merges): `animate.enter`/`animate.leave` with the same timing and easing, keyframes in `_motion.scss`. Remove the trigger
   and any provider/spec setup only it needed.
3. Record after, compare; full check. Commit (`chore(workspace): Move the notification toasts to animate.enter and animate.leave`,
   Co-Authored-By; the director adds the sub-issue), push to the fork. No PR.

## Batch 109 (security: #2278 - geoservices' animations off @angular/animations; a branch; 24 October 2026, 4:15 AM Central, from `work (security)`)

**Director: work, its security chat** (questions go under **Questions for the director (security)**). From Saturday the security director is the home machine. **Start after batch 108.** **Expected: 2 hours.** Geoservices' remaining triggers: `inOutAnimation` (its 8 interactive forms),
`growAnimation` (header), the tile navigation's four (`baseShowHideAnimation`, `submenuShowHideAnimation`, `tileStaggerAnimation`,
`submenuListStagger`) and the hamburger's three (`topBun`, `patty`, `bottomBun`), which GIS Day shares at phone width.
1. Record each before (geoservices, and GIS Day at phone width for the shared tile navigation and hamburger).
2. Branch `chore/2278-geoservices-animations` from your notifications branch: state triggers → CSS transitions; enter/leave → `animate.enter`/
   `animate.leave`; staggers as CSS with per-item delays (`--i` custom property or `:nth-child`), all in `_motion.scss`. If, after this, **no
   trigger is left anywhere**, also remove every app's animation provider and `@angular/animations` itself (lock key by key), and say so.
3. Record after, compare; full check. Commit (`chore(workspace): Move geoservices' animations off @angular/animations`, Co-Authored-By), push
   to the fork. No PR. Stop after geoservices if it is too large, and report.

## Batch 107 (security: #2277 - mail calls with a timeout, and the helper's errors handled; a bug fix and a branch; 24 October 2026, 4:00 AM Central, from `work (security)`)

**Director: work, its security chat** (questions go under **Questions for the director (security)**). From Saturday the security director is the home machine. **Start after batch 106, or before it if 106 stops early.** **Expected: 60 minutes.** Your batch 105 answers: **1 and 2 yes**, as one
issue, #2277. Your `got` 16 branch joins the lock queue.
1. Branch `fix/2277-mail-timeouts` **from `fork/chore/1218-got-16`** (so it is written against got 16; the director merges it after that).
2. **Tests that fail first**, from your batch 105 stand-in servers: each of the three mail calls gives up after the timeout against a mailroom
   that never answers, with an error the caller can handle (a 504 or 503 to the API's client, not a hang); and the helper turns a mailroom 4xx/5xx
   into the `HttpException` its code means to throw.
3. The fix: **one shared timeout** (a constant or setting in the shared services, read by all three; say what value and why: a mail send should
   be a few seconds), and the helper's non-2xx handled. Tests pass. Full check.
4. Commit (`fix(workspace): Give the mail calls a timeout and handle the helper's errors`, `Closes #2277`, Co-Authored-By), push to the
   fork. No PR.

## Batch 106 (security: #1218 - @angular/animations to animate.enter / animate.leave; a branch; 24 October 2026, 3:35 AM Central, from `work (security)`)

**Director: work, its security chat** (questions go under **Questions for the director (security)**). From Saturday the security director is the home machine. **Start after batch 105.** **Expected: 3 to 4 hours.** Your batch 103 answers: **1 yes**, filed as #2275 (the maintainer decides what
each app reports); **2 no**, with #2275; **3 no issue**: GIS Day competitions is being retired (#2232). Your survey's PR 13: `@angular/animations`
is deprecated in Angular 22 (*"Use `animate.enter` and `animate.leave` instead"*); 16 files use it (`provideAnimations`,
`BrowserAnimationsModule`, triggers).
1. **List every animation** (component, trigger, what it animates, where a user sees it) and **record each one before**: a short screen recording
   or a sequence of screenshots at fixed intervals, into `docs/screenshots/animate-enter-leave/` (sidebars, popups, toasts...). Say which need a
   sign-in.
2. Branch `chore/1218-animate-enter-leave` from `origin/development`: replace each trigger with `animate.enter`/`animate.leave` and CSS
   transitions or keyframes with the same timing and easing; remove `provideAnimations`/`BrowserAnimationsModule` where nothing needs them any
   more; drop `@angular/animations` only if nothing (Material included) still imports it. **Reuse rule:** shared keyframes or transition styles go
   in `libs/sass`, once. Lock key by key if the package goes.
3. Record each one after; say what differs, frame by frame where it matters. Full check. Commit (`chore(workspace): Move animations to
   animate.enter and animate.leave`, Co-Authored-By; the director adds the issue and release notes if anything looks different), push to the
   fork. No PR. If it is too large for one change, stop after the first app and report.

## Batch 105 (security: #1218 - got 11 to 16; a branch; 24 October 2026, 2:55 AM Central, from `work (security)`)

**Director: work, its security chat** (questions go under **Questions for the director (security)**). From Saturday the security director is the home machine. **Start after batch 104.** **Expected: 2 hours.** Your library tsconfig fix is PR 2274. Your survey's PR 11: `got` 11.8.6 → 16,
5 files (`libs/common/nest`, GIS Day platform, mailroom). ESM-only from 12 (Node 24's `require(esm)` loads it from our CommonJS bundles), options
renamed.
1. **List every call** that goes through `got`: what it calls (which service, internal or external), with what options (timeouts, retries,
   `responseType`, hooks, headers), and how each API image uses it. Do not call production services; use the local GIS Day stack and stand-in
   servers (a throwaway container answering like the real one) for the rest.
2. **A test of today's behaviour first** for each call you can reach: what it sends and what it does with success, a 4xx, a 5xx and a timeout.
3. Branch `chore/1218-got-16` from `origin/development`: the upgrade, options renamed per its changelog, the same timeouts and retries. Lock by
   batch 41's method, key by key. Prove the bundled API images still load `got` (`require(esm)` in the production image, not only in tests): start
   each image as batch 71 did.
4. The same tests pass. Full check. Commit (`chore(workspace): Move got to 16`, Co-Authored-By; the director adds the issue), push to the fork.
   No PR.

## Batch 104 (security: #1218 - chart.js 2 to 4; a branch; 24 October 2026, 2:50 AM Central, from `work (security)`)

**Director: work, its security chat** (questions go under **Questions for the director (security)**). From Saturday the security director is the home machine. **Start after batch 103.** **Expected: 2 hours.** Your Result tab fix is PR 2273 (the director added its release notes). Your
survey's PR 8: `chart.js` 2.9.4 → 4, one component in `libs/ui-kits/ngx`; 3.x rewrote the configuration (scales, tree-shaken registration).
1. **Find every page that draws a chart** through that component, and **take the "before" screenshots first**, into `docs/screenshots/chart-js-4/`
   (say which app and page, and whether a sign-in is needed; GIS Day's run on `scripts/gisday-local.sh`).
2. Branch `chore/1218-chart-js-4` from `origin/development`: the upgrade, the component's configuration moved to 4's shape (register only what it
   uses), and `@types/chart.js` dropped if 4's own types replace it. Lock by batch 41's method, key by key.
3. "After" screenshots beside the befores: the same data, axes, colours, legend and tooltips; say what differs and whether it matters. Full check;
   bundle size of each app that loads the chart before/after.
4. Commit (`chore(workspace): Move chart.js to 4`, Co-Authored-By; the director adds the issue and release notes if anything looks different),
   push to the fork. No PR.

## Batch 103 (security: #1218 - angulartics2 13 to 14; a branch; 24 October 2026, 2:45 AM Central, from `work (security)`)

**Director: work, its security chat** (questions go under **Questions for the director (security)**). From Saturday the security director is the home machine. **Start after batch 102.** **Expected: 90 minutes.** Your POI popup fix is PR 2272. Your survey's PR 7: `angulartics2` 13.1.0 → 14,
43 files, the Google Analytics wiring in four apps; mostly the module-to-provider change at bootstrap.
1. **Prove analytics works today first**: the smoke suite's analytics checks (`test/smoke/aggiemap/`, the expected Google Analytics id per
   environment in `environments.json`), run against a local dev server of each app that has them, and say what each app sends on a page view
   (the request to Google, its measurement id). Record it.
2. Branch `chore/1218-angulartics2-14` from `origin/development`: the upgrade; bootstrap as its changelog says, in each of the four apps; keep the
   same ids per environment. **Reuse rule:** if the four apps set it up the same way, set it up once in a shared provider. Lock key by key.
3. Prove the same page views go out with the same ids after (the same checks), full check. Commit (`chore(workspace): Move angulartics2 to 14`,
   Co-Authored-By; the director adds the issue), push to the fork. No PR.

## Batch 102 (security: #2271 - the ArcGIS types path in 30 library tsconfigs; a fix and a branch; 24 October 2026, 2:35 AM Central, from `work (security)`)

**Director: work, its security chat** (questions go under **Questions for the director (security)**). From Saturday the security director is the home machine. **Start after batch 101.** **Expected: 20 minutes.** Your batch 98 question 2: **yes**, filed as #2271. Your batch 98
and 99 branches are PRs 2269 and 2270.
1. Branch `fix/2271-arcgis-lib-types` from `origin/development`: in every `tsconfig.lib.json` (and
   `libs/common/utils/geometry/generic/tsconfig.json`) that names a relative `node_modules/@arcgis/core/interfaces`, the package name instead, as
   in #2264. Leave the two-levels-deep ones that resolve, unless one spelling everywhere is simpler (say which you chose).
2. Prove one three-deep library's own `tsc -p <lib>/tsconfig.lib.json --noEmit` no longer reports TS2688. `scripts/check-in-volume.sh` (full).
3. Commit (`fix(workspace): Resolve the ArcGIS types from every library tsconfig`, `Closes #2271`, Co-Authored-By), push to the fork. No PR.

## Batch 100 (aggiemap bug found by security: #2259 - the POI popup's console TypeError; a bug fix and a branch; 24 October 2026, 2:25 AM Central, from `work (security)`)

**Director: work, its security chat** (questions go under **Questions for the director (security)**). From Saturday the security director is the home machine. **Start after batch 99.** **Expected: 60 minutes.** Your directory fix is PR 2268. Opening AggieMap's POI popup at `/?poi=2` logs
`TypeError: Cannot read properties of undefined (reading 'name')` on `development` (you traced a similar line to `TripPlannerConnectionService`
in batch 85).
1. **Find the cause**: the stack, what reads `name` from what, and why it is undefined on a POI popup. Say whether it breaks anything visible
   (a trip-planner control, a label) or is only noise.
2. **A test that fails first** (a unit test of the service or component; or, if it only shows in a running map, a smoke check that the POI
   popup opens with no console error, in `test/smoke/aggiemap/`, reusing the suite's console helpers). Prove it fails on `development`.
3. Branch `fix/2259-poi-popup-typeerror`: the fix; the test passes; `scripts/check-in-volume.sh <branch> <projects>,aggiemap-angular`; before/after
   screenshots only if something visible changes (then a release-notes file too). Commit (`fix(aggiemap-angular): …`, `Closes #2259`,
   Co-Authored-By), push to the fork. No PR.

## Batch 101 (geoservices bug found by security: #2267 - the services pages log err.toRenderableJSON is not a function; a bug fix and a branch; 24 October 2026, 2:25 AM Central, from `work (security)`)

**Director: work, its security chat** (questions go under **Questions for the director (security)**). From Saturday the security director is the home machine. **Start after batch 100.** **Expected: 60 minutes.** On `development`, geoservices' four `/services/*` pages each log
`err.toRenderableJSON is not a function` three times (your batch 95).
1. **Find the cause**: where `toRenderableJSON` is called, on what, and why that object lacks it (an error path assuming one error type?). Say
   whether a user sees anything wrong (a failed request shown as success, an empty result panel).
2. **A test that fails first**, then the fix, the test passing. `scripts/check-in-volume.sh <branch> <projects>,geoservices-angular`.
3. Branch `fix/2267-geoservices-renderable-json`. Commit (`fix(geoservices-angular): …`, `Closes #2267`, Co-Authored-By), push to the fork. No PR.

## Batch 98 (security: #2264 - the ArcGIS types path in 30 spec tsconfigs; a fix and a branch; 24 October 2026, 2:10 AM Central, from `work (security)`)

**Director: work, its security chat** (questions go under **Questions for the director (security)**). From Saturday the security director is the home machine. **Start after batch 97.** **Expected: 30 minutes.** Your batch 94 answers: **1 yes**, filed as #2264; **2 yes**, the policy is #2263 (the
maintainer decides) and the five own-file errors are #2265. Your select fix is PR 2266.
1. Branch `fix/2264-arcgis-spec-types` from `origin/development`. Make every `tsconfig.spec.json` that names
   `"../../node_modules/@arcgis/core/interfaces"` resolve it from its own depth. **Prefer one shared answer over 30 hand-counted paths** if
   TypeScript allows it (e.g. a `typeRoots` or `paths` entry in `tsconfig.base.json`, or the package name instead of a relative path); say which
   and why.
2. Re-run your batch 94 survey: how many of the 26 failing projects now pass, and the new total of error lines by cause (A should be gone).
3. `scripts/check-in-volume.sh` (full `affected`), commit (`fix(workspace): Resolve the ArcGIS types from every spec tsconfig`,
   `Closes #2264`, Co-Authored-By), push to the fork. No PR.

## Batch 99 (security: #2265 - five type errors in project files; a fix and a branch; 24 October 2026, 2:10 AM Central, from `work (security)`)

**Director: work, its security chat** (questions go under **Questions for the director (security)**). From Saturday the security director is the home machine. **Start after batch 98.** **Expected: 45 minutes.** The five errors your batch 94 found in projects' own files (#2265): three in
`libs/aggiemap/ngx/discover` (`discover.utils.spec.ts:30`, `maps-page-header.component.ts:27` and `:32`, `discovery.service.spec.ts:147`'s
`mapType` → `mapTypes`) and one in `libs/gisday/platform/ngx/core` (`base-admin-list.component.spec.ts:13`).
1. Branch `fix/2265-spec-type-errors` from `origin/development`. For each, decide whether the code or the test is wrong, and fix that. For
   `maps-page-header`'s `undefined` arguments (component code), say what the page does today when they are `undefined` and whether that is a
   visible bug; if it is, a test that fails first and before/after screenshots.
2. Each fixed file typechecks under its project's spec tsconfig (other errors from causes B to D may remain; list them unchanged).
3. Full check, commit (`fix(workspace): Fix five type errors that only spec typechecking showed`, `Closes #2265`, Co-Authored-By), push to the
   fork. No PR.

## Batch 97 (aggiemap bug found by security: #2262 - the building directory's empty Abbreviation column; a bug fix and a branch; 24 October 2026, 1:55 AM Central, from `work (security)`)

**Director: work, its security chat** (questions go under **Questions for the director (security)**). From Saturday the security director is the home machine. **Start after batch 95.** **Expected: 30 minutes.** Your batch 93 answers: **1 yes**, filed as #2262 (Bug, Low, AggieMap's
board); **2 none**. Your `ngx-datatable` 25 branch joins the lock queue.
1. **Before screenshot first** (`/directory`, a building that has an abbreviation, e.g. one whose `BldgAbbr` is set in
   `assets/data/building-directory.json`) into `docs/screenshots/2262-directory-abbreviation/`.
2. **A test that fails first:** a unit test (the directory component's spec, or a new one) that the Abbreviation column shows a building's
   `BldgAbbr`. Prove it fails on `development`.
3. Branch `fix/2262-directory-abbreviation` from `origin/development`: `prop="BldgAbbrev"` → `BldgAbbr` (search for any other reference to the
   wrong name). The test passes; after screenshot; `scripts/check-in-volume.sh <branch> <the directory's project>,aggiemap-angular`.
4. A release-notes file `docs/releases/unreleased/2262-directory-abbreviation.md` as `docs/releases/unreleased/README.md` describes (it is visible:
   the column now shows abbreviations), with a *What to test on dev* row. Commit (`fix(aggiemap-angular): Show buildings' abbreviations in the
   directory`, `Closes #2262`, Co-Authored-By), push to the fork. No PR.

## Batch 96 (security: #2258 - the markdown pipe stops bypassing Angular's sanitiser; a security fix and a branch; 24 October 2026, 1:10 AM Central, from `work (security)`)

**Director: work, its security chat** (questions go under **Questions for the director (security)**). From Saturday the security director is the home machine. **Start next, before batch 93** (it is a security fix). **Expected: 60 minutes.** Your batch 91 answers: **1 yes**, filed as
#2258 (Bug); **2 yes**, filed as #2259. Your `marked` 18 branch joins the lock queue after maplibre. Your "second security observation" will be
asked of the maintainer in the morning.

1. **A failing test first** (CLAUDE.md): a spec for `MarkdownParsePipe` (`libs/common/ngx/pipes`) showing that a description containing an
   event-handler attribute (e.g. `<img src=x onerror=...>`) or a `<script>` reaches the DOM with it intact when bound with `[innerHTML]` as the
   callers do. Prove it fails on `development`.
2. Branch `fix/2258-markdown-sanitiser` from `origin/development`: the pipe returns the HTML as a **string**, so `[innerHTML]` sanitises it. Check
   every caller still compiles (the pipe's return type changes from `SafeHtml`). Find out, on your 3,177-text corpus from batch 91, **what the
   sanitiser now strips** that the current texts use (`target`, `data-*`, anything else), and whether that changes how any popup or page looks
   (links opening in a new tab, for instance). If something visible is lost, report it with options rather than adding a bypass back.
3. The spec now passes (the handler is stripped, ordinary markdown and the allowed tags survive). Before/after screenshots of one AggieMap popup,
   one dining popup if you can reach one, and one GIS Day session page into `docs/screenshots/markdown-sanitiser/`. Full check.
4. Commit (`fix(common-ngx-pipes): Let Angular sanitise the markdown pipe's HTML`, `Closes #2258`, Co-Authored-By), push to the fork. No PR.

## Batch 94 (security: #2256 - the select component's spec does not typecheck; a fix and a branch; 24 October 2026, 12:40 AM Central, from `work (security)`)

**Director: work, its security chat** (questions go under **Questions for the director (security)**). From Saturday the security director is the home machine. **Start after batch 93.** **Expected: 30 minutes.** Your batch 90 question 1: **filed**, as #2256 (Bug, Low). Your date-picker fix is
PR 2257. `tsc -p libs/ui-kits/ngx/forms/tsconfig.spec.json --noEmit` reports `select.component.spec.ts:32` `Type '{ test: string; }' is not
assignable to type 'string'`.
1. Decide whether the spec's fixture or the component's input type is wrong (read how the component and its callers use the input), and fix
   that one. If it is the component, check every caller still compiles (`nx build` of the apps that use it).
2. Typecheck every **spec** tsconfig in the repository the same way (`tsc -p <lib>/tsconfig.spec.json --noEmit` for each project that has one) and
   **report** any other errors with their file and line. Fix none of them here; the director files them.
3. `scripts/check-in-volume.sh <branch> ui-kits-ngx-forms`, commit (`fix(ui-kits-ngx-forms): Make the select component's spec typecheck`,
   `Closes #2256`, Co-Authored-By), push to the fork as `fix/2256-select-spec-types`. No PR.

## Batch 95 (security: #1218 - ngx-highlightjs 6 to 14; a branch; 24 October 2026, 12:40 AM Central, from `work (security)`)

**Director: work, its security chat** (questions go under **Questions for the director (security)**). From Saturday the security director is the home machine. **Start after batch 94.** **Expected: 90 minutes.** Your survey's PR 6: `ngx-highlightjs` 6.1.3 → 14, 9 files (geoservices,
ui-kits). `HighlightModule` became `provideHighlightOptions` and standalone directives.
1. **The "before" screenshots first**, into `docs/screenshots/ngx-highlightjs-14/` at once: every page that shows highlighted code (geoservices'
   API pages; say which, and whether a sign-in is needed).
2. Branch `chore/1218-ngx-highlightjs-14` from `origin/development`: the upgrade, the providers and directives moved as its changelog says, the
   same languages registered (lazy-loaded if the old setup was), the same theme. Lock by batch 41's method, key by key. **Reuse rule:** if
   several modules set up highlighting the same way, set it up once.
3. Full check; "after" screenshots beside the befores; no console errors; bundle sizes before/after for geoservices.
4. Commit (`chore(workspace): Move ngx-highlightjs to 14`, Co-Authored-By; the director adds the issue and release notes if anything looks
   different), push to the fork. No PR.

## Batch 93 (security: #1218 - @swimlane/ngx-datatable 20 to 25; a branch; 24 October 2026, 12:05 AM Central, from `work (security)`)

**Director: work, its security chat** (questions go under **Questions for the director (security)**). From Saturday the security director is the home machine. **Start after batch 91.** **Expected: 60 minutes.** Your batch 89 question 1: **yes**, 2249 then 88 then 89; the director brings
each next one up to date itself (2249 is open; 88 and 89 follow it). Your survey's PR 5: `@swimlane/ngx-datatable` 20.1.0 → 25 (peers allow
Angular 22), 2 files: AggieMap and GIS Day competitions.
1. **The "before" screenshots first**, into `docs/screenshots/ngx-datatable-25/` at once: every table it draws (find them; say which page and
   whether a sign-in is needed; GIS Day's runs on `scripts/gisday-local.sh`).
2. Branch `chore/1218-ngx-datatable-25` from `origin/development`: the upgrade, the changelog's breaking changes applied to our two uses (inputs,
   column templates, CSS themes/imports), lock by batch 41's method, key by key.
3. Full check; "after" screenshots beside the befores (sorting, paging, an empty table); no console errors.
4. Commit (`chore(workspace): Move @swimlane/ngx-datatable to 25`, Co-Authored-By; the director adds the issue and release notes if anything
   looks different), push to the fork. No PR.

## Batch 92 (gisday: #2137 - lint that can never fail in five GIS Day projects; a code job and a branch; 23 October 2026, 11:25 PM Central, from `home (gisday)`)

**After the security batches already queued** (90, 91); about an hour. Medium priority. GIS Day's director is now
`home (gisday)` for the weekend, so questions go under **Questions for the director (gisday)**.

[#2137](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2137) says what and why. Five
projects set `"force": true` on `lint`, so ESLint exits 0 whatever it finds: `apps/gisday-nest`,
`libs/gisday/platform/data-api`, and `libs/gisday/platform/ngx/{common,core,data-access}`.

1. Branch `chore/2137-gisday-lint-force` from the latest `origin/development`, in its own worktree.
2. **Prove it red first:** add a deliberate lint error (an unused variable) to one of the five, and show `nx lint` on
   it **exits 0** on unchanged code. Keep the output.
3. Remove `"force": true` from all five. `grep -rn '"force": true' --include=project.json apps libs` must find no
   other project; if it does, list them in the report and leave them.
4. Run `nx lint` on each of the five (in Docker, output to a file, exit code read on its own line). Fix what fails,
   rule by rule. No blanket `eslint-disable` and no rule switched off; a single justified line disable needs a
   comment saying why. Re-run step 2's deliberate error: it must now **fail**. Then remove it.
5. Commit, `scripts/check-in-volume.sh chore/2137-gisday-lint-force`, which must exit 0. Push to the fork.

Report `work-lab-leila/reports/<date>-<n>.md`: the head commit, the red output from step 2 and the failing one from
step 4, what each project needed (counts per rule), the check's exit code and time. No pull request; the director
opens it.

## Batch 90 (security: #2244 - the date-picker test that fails under load, fixed; a bug fix and a branch; 23 October 2026, 11:30 PM Central, from `work (security)`)

**Director: work, its security chat** (questions go under **Questions for the director (security)**). From Saturday the security director is the home machine; report to it the same way. **Start after batch 89.** **Expected: 45 minutes.** `libs/ui-kits/ngx/forms` › `date-time-picker.component.spec.ts` › *a time of day (GIS Day
event times)* › **takes the list away with the picker** fails now and then: `expected …(288) to have a length of +0 but got 288` after one
`settle()`. It failed twice on the director's machine tonight with another check running, and passed on each rerun.
1. **Make it fail on purpose first** (CLAUDE.md: prove the failure): run the spec under load (e.g. `stress-ng` or a parallel full test run in
   the same container) or with a slowed scheduler, until you can reproduce it, and say how often.
2. Fix the **test**, not the component, unless the component really leaves its overlay open: wait for the overlay's detach or the closed
   state (`MatAutocomplete`/`MatSelect` `closed` event, `overlayContainer` empty, or `NoopAnimationsModule` if the spec animates), never a
   longer fixed delay. Search the same spec and its library for the same pattern and fix those too.
3. Prove it: the reproduction now passes many times in a row under the same load. `scripts/check-in-volume.sh <branch> ui-kits-ngx-forms`.
4. Branch `fix/2244-date-picker-test`, commit (`fix(ui-kits-ngx-forms): Wait for the date picker's list to close in its test`, `Closes #2244`,
   Co-Authored-By), push to the fork. No PR.

## Batch 91 (security: #1218 - marked 9 to 18; a branch; 23 October 2026, 11:30 PM Central, from `work (security)`)

**Director: work, its security chat** (questions go under **Questions for the director (security)**). From Saturday the security director is the home machine; report to it the same way. **Start after batch 90.** **Expected: 45 minutes.** Your survey's PR 4. `marked` 9.1.6 → latest 18, one call site in
`libs/common/ngx`.
1. **Find what renders through it and take the "before" screenshots first**, into `docs/screenshots/marked-18/` at once (which app and page shows
   markdown; if none is reachable without a sign-in, say how you rendered it instead).
2. Branch `chore/1218-marked-18` from `origin/development`: the upgrade (ESM-only; `parse` may return a promise: handle it the way the call
   site's callers can use), lock by batch 41's method, key by key. Read the changelog for **HTML sanitising**: marked dropped its `sanitize`
   option years ago, so say whether our call site renders untrusted markdown and how it is sanitised (Angular's `[innerHTML]` sanitiser,
   DOMPurify, or nothing). If it is untrusted and unsanitised, stop and report it as a security finding first.
3. Full check; "after" screenshots; commit (`chore(workspace): Move marked to 18`, Co-Authored-By; the director adds the issue), push to the fork.
   No PR.

## Batch 88 (security: #2212 - a fourth lab agent and Node in the agent image; a branch; 23 October 2026, 11:10 PM Central, from `work (security)`)

**Director: work, its security chat** (questions go under **Questions for the director (security)**). **Start now.** **Expected: about 45 minutes.** Your batch 86 question 2: **yes, in your order.** Your batch 86 question 1, answered from Azure's timeline (read token, task durations in seconds):

| Step | Lab, build 5685 (PR 2245) | Hosted, build 5684 (PR 2195) |
| --- | --- | --- |
| Checkout | 38 / 48 / 78 / 54 | 11 to 13 |
| Install Node | 9 | 3 to 5 |
| `Cache@2` restore | 6 (Cache job, miss) / 39 / 34 / 41 | 7 / 22 / 21 / 22 |
| `npm ci` (Cache job) | 43 | 89 |
| Post-job: Cache (save) | 21 | 43 |
| Initialize job | 5 to 11 | 3 to 6 |
| The work | lint 7, builds 6 each (small PR) | lint 344, builds 167 / 201 (big PR) |
| Publish Artifacts | 5 | **502 / 323** |

So on the lab the fixed costs are checkout (about 40 s more than hosted), the cache restore (about 15 s more) and Node (5 s more), per job.

1. Branch `ci/2212-agent-node-and-four` from `origin/development` (it has the lab-always pipeline, #2245). **Node 24.22.1 in the image's tool
   cache** where `UseNode@1` looks (`$AGENT_TOOLSDIRECTORY/node/24.22.1/x64`, with the `x64.complete` marker the tool installer checks), checksum
   verified as the image already does. Prove in a container that `UseNode@1`'s lookup path exists, and say how the job log will show a cache hit.
2. **Four agents at 12 GB and 5 CPUs**: the defaults of `run-agent.ps1`, `agent-task.ps1`, `install-agent-task.ps1` and `linux/run-agent.sh`,
   and the README's sizing section, re-measured: one agent's whole workload must still fit under 12 GB with headroom (your 10.4 GB peak). Leave
   at least 8 GB and 4 cores for this machine. **Do not install `lab-4` yourself**; give the maintainer the exact commands (reinstall `lab-1` to
   `lab-3` at the new size, then `lab-4`) in **For the maintainer**.
3. `scripts/check-in-volume.sh`, commit (`ci(workspace): Node in the build agent's image, and room for four agents`, `Part of #2212`,
   Co-Authored-By), push to the fork. No PR.

## Batch 89 (security: #2212 - a warm, read-only git mirror for lab checkouts; a branch; 23 October 2026, 11:10 PM Central, from `work (security)`)

**Director: work, its security chat** (questions go under **Questions for the director (security)**). **Start after batch 88.** **Expected: about 90 minutes.** Your option #1. Checkout is the largest fixed cost (38 to 78 s on the
lab against 11 to 13 hosted).
1. A bare mirror of `https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo.git` in a **Docker volume** (not a host folder),
   refreshed by **the supervisor on the host, from `origin` only**, before each job (`git fetch --prune`, a few seconds when warm); never by a job.
   Mounted into each agent container **read-only**.
2. Make the pipeline's checkout use it, **without trusting it**: e.g. Git's `alternates`/`--reference` so objects come from the mirror and
   everything is still fetched and verified from GitHub, or a `checkout: none` plus a script, if the checkout task cannot take a reference. Say
   which, and why a fork job cannot change the mirror (read-only mount; the supervisor writes it only from `origin`). Keep `fetchDepth: 0` behaviour
   (`affected` needs the base).
3. Prove: the same commit checked out with and without the mirror gives an identical tree; time both; a container cannot write to the mount;
   a branch that exists only on a fork (a PR's merge ref) still checks out.
4. `scripts/check-in-volume.sh`, commit (`ci(workspace): Check out from a warm, read-only git mirror on the lab`, `Part of #2212`,
   Co-Authored-By), push to the fork. No PR. The `node_modules` cache (your #2) waits: it needs a trusted pool and a maintainer decision.

## Batch 87 (security: #1218 - the maplibre branch on the university's campus basemap instead of OpenFreeMap; a code job on your branch; 23 October 2026, 10:05 PM Central, from `work (security)`)

**Director: work, its security chat** (questions go under **Questions for the director (security)**). **Start right after batch 85, before batch 86.** **Expected: about 75 minutes.** Your batch 84 answers, **decided by the
maintainer (10:05 PM)**: (1) **(b), a university Esri basemap, not OpenFreeMap**; (2) **leave the Mapbox token**: it is not his account and he
cannot delete it. Do not mention the token anywhere new.

1. **Reuse what AggieMap already draws.** `libs/aggiemap/ngx/common/src/lib/connections.ts` names the campus basemap AggieMap uses on production,
   `https://gis.tamu.edu/arcgis/rest/services/FCOR/TAMU_Basemap_20261008/MapServer` (`basemapUrl`), and hosted `VectorTileServer`s for the other
   campuses. Find out, from the services themselves (`?f=json`): is the main campus basemap a **cached MapServer** (tiles at
   `.../tile/{z}/{y}/{x}`, Web Mercator, which levels), and does it need a token? Is there a **keyless campus `VectorTileServer`** whose style
   (`resources/styles/root.json`) MapLibre renders? Mind CLAUDE.md's gating rule: **anything served only on dev must not be used by production
   pages**; say which services are on production.
2. On `chore/1218-maplibre` (merge `origin/development` first), make the maps' default style **the university basemap, keyless**, read from the
   shared connections (so it moves when AggieMap's basemap moves; if the GIS Day library cannot import AggieMap's connections without a bad
   dependency, put the URL in a shared place both can use, and say where and why). A raster MapServer source is fine; if it covers only campus,
   say what shows beyond it at the pages' zoom levels (14 to 16, centre `-96.3407, 30.6158`).
3. **If no university basemap works without a key**, stop and report the options (which need a key, whose, and how it would be kept out of the
   repository) instead of adding a key.
4. Redo the four "after" screenshots (replace the OpenFreeMap ones), the full check, the `gisday-angular` production build, and the production
   path through `nginx-base` as before. Commit, push to the fork. No PR; the director adds the issue and the release-notes file.

## Batch 85 (security: #1218 - lightgallery replaced by GLightbox, as one shared piece; a branch; 23 October 2026, 9:40 PM Central, from `work (security)`)

**Director: work, its security chat** (questions go under **Questions for the director (security)**). **Start after batch 84.** **Expected: 2 hours.** **Decided by the maintainer (9:40 PM): (c), replace `lightgallery` with GLightbox (MIT).**
Your batch 82 question 1: **as done** (`class-validator`'s `isUUID`). Question 2: **every front end is served over HTTPS** (the maintainer).
1. **Before screenshots first**, into `docs/screenshots/glightbox/` at once: on the AggieMap dev server, a POI popup with photos and the bonfire
   popup (carousel, then a slide opened full screen); and the browser console line *"please provide a valid license key"* if it appears.
2. Branch `chore/1218-glightbox` from `origin/development`. **Reuse rule:** the POI and bonfire popups duplicate the gallery code; make **one
   shared piece** (a directive or small component in `libs/ui-kits/ngx/**` or the AggieMap popups library, whichever the next caller would look
   in; say why), used by both. GLightbox latest, its CSS imported by the shared piece (CLAUDE.md: shared component styles are imported by the
   component, not the app); drop `lightgallery` and its `@import` from `styles.scss`. Keep the Swiper carousel as is. Lock key by key.
3. Full check; after screenshots beside the befores (same popups, same images, the full-screen view, keyboard Esc/arrow keys, mobile width);
   no console errors; the licence line gone.
4. Commit (`feat(aggiemap-angular): Open popup photos with GLightbox, replacing lightgallery`, Co-Authored-By; the director adds the issue and the
   release-notes file), push to the fork. No PR.

## Batch 86 (security: #2212 - where a lab job's time goes, and a cache a fork cannot poison; measure and propose, nothing pushed; 23 October 2026, 9:40 PM Central, from `work (security)`)

**Director: work, its security chat** (questions go under **Questions for the director (security)**). **Start after batch 85.** **Expected: 60 minutes.** **Decided by the maintainer (9:40 PM): measure, then propose.** Build 5680
(PR 2230, run by hand) ran every heavy job on the lab: Cache 1:48 (lab-1), Lint 1:46 (lab-2), development 3:06 (lab-3), production 2:44 (lab-1),
against hosted 2:32 / 0:47 / 0:52 / 0:54 for the same commit (build 5672). The read-only Azure log of each job is available to the director;
**you** measure inside the agent.
1. Run the same jobs' steps in an agent container (or read the agent's `_diag` and job logs on this machine, never printing a token) and
   break each job into: container start and registration, checkout, `UseNode@1`, `Cache@2` restore (hit or miss? the cache key; download size
   and time), the work itself, post-job steps. Say where hosted saves time (a warm image with Node preinstalled, the Azure cache next door).
2. Propose, ranked by time saved per job, **only options a fork pull request cannot poison** for the next job: e.g. Node baked into the image
   (no `UseNode@1` download), a read-only git mirror or reference clone on the host refreshed only by a trusted job, a per-branch or
   trusted-only writable npm cache with forks read-only, Nx cache handling (Nx Cloud is already remote), keeping one warm container idle. For
   each: the time saved, what a malicious fork job could do with it, and why that is or is not safe.
3. Report only. The director turns the chosen ones into a branch.

## Batch 83 (security: #1218 - lightgallery: the licence first, then the upgrade if it is clear; an investigation, maybe a branch; 23 October 2026, 9:10 PM Central, from `work (security)`)

**Director: work, its security chat** (questions go under **Questions for the director (security)**). **Start after batch 82.** **Expected: 30 minutes, plus 45 if the licence is clear.** **Decided by the maintainer (9:10 PM): check the
licence before anything else.** AggieMap uses `lightgallery` 2.9.0 in 2 files; 3.0.0 is out.
1. Read the licence of the version we ship and of 3.0.0 (`node_modules/lightgallery/package.json` and `LICENSE`, the project's site): GPLv3,
   commercial, or other; and what GPLv3 would mean for a front end this repository serves (the repository's own licence is in `LICENSE`; say what it
   is). **Do not decide whether we comply; describe the terms and the facts** (who holds a commercial licence, if the repository shows one: a
   licence key in configuration, a `licenseKey` option, etc.).
2. Name the open-source alternatives that do the same job in an Angular 22 app (e.g. PhotoSwipe, MIT), with their size and how much code a
   switch would change.
3. Report. **Only if** the licence question has a clear answer that needs nothing from the maintainer, carry on: branch `chore/1218-lightgallery-3`,
   the upgrade, full check, AggieMap's gallery before/after screenshots into `docs/screenshots/lightgallery-3/`, push to the fork, no PR.

## Batch 84 (security: #1218 - mapbox-gl 1 replaced by maplibre-gl; a branch; 23 October 2026, 9:10 PM Central, from `work (security)`)

**Director: work, its security chat** (questions go under **Questions for the director (security)**). **Start after batch 83.** **Expected: 2 hours.** **Decided by the maintainer (9:10 PM): replace `mapbox-gl` with
`maplibre-gl`**, the BSD-licensed fork (Mapbox 2 and 3 are not open source). Users: 2 files in `libs/maps/mapbox`.
1. Find every map, page or app that uses `libs/maps/mapbox` (and anything else importing `mapbox-gl` or its CSS), and **take the "before"
   screenshots first**, saved at once into `docs/screenshots/maplibre/` (CLAUDE.md: a before dies with the fix). If no deployed or local page uses
   it, say so and how you know.
2. Branch `chore/1218-maplibre` from `origin/development`: `maplibre-gl` latest, its CSS, drop `mapbox-gl` and `@types/mapbox-gl`; adapt the two
   files (style URLs or access tokens that named Mapbox's hosted styles need a replacement: say what they were and what you chose, and why).
   Lock key by key.
3. Full check; the page(s) from step 1 on a dev server, "after" screenshots beside the befores; a note of anything that looks different.
4. Commit (`chore(workspace): Replace mapbox-gl with maplibre-gl`, Co-Authored-By; the director adds the issue), push to the fork. No PR.

## Batch 79 (security: #2193 - PR 2195 (typeorm 1) re-locked after Nx 24 merges; pushed, no PR; 23 October 2026, 9:05 PM Central, from `work (security)`)

**Director: work, its security chat** (questions go under **Questions for the director (security)**). **Start only once `git log origin/development --oneline -15` shows PR 2231 (Nx 24) merged.** Until then skip it. **Expected: 20 minutes.**
Your batch 76 finding: 2231 and 2195 conflict in the lock. **Nx merges first.** In `chore/1218-typeorm-1`: `git merge origin/development`; for
the lock, take `development`'s and redo typeorm with batch 41's method (delete `typeorm`, `mssql`, `ts-node` at every nesting, `npm install
--package-lock-only --ignore-scripts`), exactly as you did on the scratch tree. The lock rule key by key (typeorm 1's 116 entries, `nx` still
24.0.0), `scripts/check-in-volume.sh chore/1218-typeorm-1`, the `gisday-nest` image's `GET /api/seasons/active` 200 against the seed, push
(updates PR 2195).

## Batch 80 (security: #1218 - your survey's PR 1: remove the unused postcss packages and the deprecated Angular builder; a branch; 23 October 2026, 9:05 PM Central, from `work (security)`)

**Director: work, its security chat** (questions go under **Questions for the director (security)**). **Start now** (after batch 78). **Expected: 45 minutes.** Your batch 76 question 2: **yes**. Branch `chore/1218-angular-build` from
`origin/development`: drop `postcss-import` and `postcss-preset-env` (prove nothing names them, configuration files included); in the eight
`project.json`, `@angular-devkit/build-angular:application` → `@angular/build:application` and `:dev-server` → `@angular/build:dev-server`
(and any other `@angular-devkit/build-angular:` builder, e.g. `extract-i18n`, `karma`), then drop `@angular-devkit/build-angular` if nothing
else needs it, with `@angular/build` at the version Angular 22.2 pins. Lock with batch 41's method, key by key. `scripts/check-in-volume.sh`
(full); **every front end's production bundle compared with `development`'s** (file list and sizes; say what differs and why); the AggieMap dev
server starts and the map loads. Commit (`chore(workspace): Build the front ends with @angular/build and drop unused postcss packages`,
Co-Authored-By; the director adds the issue), push to the fork. No PR.

## Batch 81 (security: #1218 - your survey's PR 2: the small server and tool majors; a branch; 23 October 2026, 9:05 PM Central, from `work (security)`)

**Director: work, its security chat** (questions go under **Questions for the director (security)**). **Start after batch 80.** **Expected: 60 minutes.** Branch `chore/1218-small-majors` from `origin/development`: `dotenv` 18
(add `quiet: true` wherever it is loaded, so the APIs do not log a line at start), `fs-extra` 11, `@turf/centroid` 7, `jsdom` 30, `pngjs` 7. Read
each changelog for breaking changes that touch our use and fix them. Lock with batch 41's method, key by key. `scripts/check-in-volume.sh`
(full); the four API images start (as batch 71: `gisday-nest` answers 200/401 against the seed); one smoke spec (`run-local.sh development one
legend.spec.ts`); one `tools/visual-baselines` capture of one map. Commit (`chore(workspace): Move dotenv, fs-extra, turf, jsdom and pngjs to
their latest majors`, Co-Authored-By), push to the fork. No PR.

## Batch 82 (security: #1218 - your survey's PR 3: uuid replaced by crypto.randomUUID(); a branch; 23 October 2026, 9:05 PM Central, from `work (security)`)

**Director: work, its security chat** (questions go under **Questions for the director (security)**). **Start after batch 81.** **Expected: 45 minutes.** **Reuse first** (CLAUDE.md): look in `libs/common/**` for an existing id or
validation helper before adding one. Branch `chore/1218-drop-uuid` from `origin/development`: every `v4()` → `crypto.randomUUID()` (check each
runs where `crypto.randomUUID` exists: browsers on a secure origin, Node 24; say if any runs on plain HTTP, where browsers withhold it), `validate`
→ one shared helper exported from the right `libs/common` index, with a unit test; drop `uuid` and `@types/uuid`. Lock key by key; full check;
the GIS Day local stack (`scripts/gisday-local.sh`): an admin create that makes a guid (a sponsor or place) succeeds and the row's id is a v4.
Commit (`chore(workspace): Use crypto.randomUUID() and drop uuid`, Co-Authored-By), push to the fork. No PR.

## Batch 76 (security: #1218 - what is left between us and the latest of everything; a survey, nothing pushed; 23 October 2026, 8:50 PM Central, from `work (security)`)

**Director: work, its security chat** (questions go under **Questions for the director (security)**). **Start now.** **Expected: about 45 minutes.** **Commit nothing, push nothing.** The maintainer's goal (#1218): every
dependency at its latest, once the vulnerabilities are fixed (they are: production 0 critical / 0 high). Dependabot covers in-range and grouped
updates weekly, but ignores Nx majors and the API images' Node majors, and cannot change code. After PRs 2187, 2191, 2231 (Nx 24) and 2195
(typeorm 1), what is still behind?

1. On `origin/development` plus a scratch merge of `fork/chore/2168-nx-24` and `fork/chore/1218-typeorm-1` (so the survey starts after
   them): `npm outdated --json` (in Docker), every direct dependency in `package.json` and in each `apps/*/src/package.json`.
2. A table: package, current, wanted, **latest**, major or not, which apps/libraries use it (a grep count), and **why it is behind**: blocked by
   a peer (name it, e.g. Angular's range), needs code changes (say what from the changelog), Dependabot will do it next Monday, or abandoned
   upstream (and the replacement).
3. Group them into proposed pull requests, smallest risk first, each with an estimate and how it would be proven (which builds, which app run).
   Name anything that should wait for an Angular or Nest major as one step.
4. The base images too: `node` in the API Dockerfiles and the nginx base, against their latest tags.
5. Report only. The director turns it into issues and batches.

## Batch 77 (security: #2168 - Nx 24 re-checked on top of the merged Dependabot groups; pushed, no PR; 23 October 2026, 8:50 PM Central, from `work (security)`)

**Director: work, its security chat** (questions go under **Questions for the director (security)**). **Start only once `git log origin/development --oneline -15` shows both PR 2187 (the testing group) and PR 2191 (the
everything-else group) merged.** Until then skip it and take the next. **Expected: about 20 minutes.**

1. In `chore/2168-nx-24`: `git merge origin/development`. **If the lock conflicts, do not regenerate it**: batch 41's method for `nx` and
   `@nx/*` only.
2. The lock rule, key by key: Nx 24's own 47 entries and nothing else against the new `development`.
3. `scripts/check-in-volume.sh chore/2168-nx-24` (full `affected`), push to the fork (updates PR 2231). Report.

## Batch 78 (security: Playwright's version in the smoke README after PR 2187; a docs fix and a branch; 23 October 2026, 8:50 PM Central, from `work (security)`)

**Director: work, its security chat** (questions go under **Questions for the director (security)**). **Start only once PR 2187 (Playwright 1.64.1) has merged.** **Expected: 15 minutes.**

1. Branch `docs/playwright-1-64-1` from `origin/development`. Find every place that names the Playwright version or image tag outside
   `package.json`/the lock (`test/smoke/**/README.md`, `run-local.sh`, workflow files, `docs/`), and say for each whether it must match the
   package (an image tag `mcr.microsoft.com/playwright:v1.xx.x-…` must) or is only prose. Bring every one that must match to 1.64.1.
2. Prove the smoke runner still starts: `test/smoke/aggiemap/run-local.sh development one legend.spec.ts` (or the smallest spec), and say which
   image it pulled.
3. Commit (`docs(workspace): Name Playwright 1.64.1 wherever its version is written`, Co-Authored-By; the director adds the issue), push to the
   fork. No PR.

## Batch 75 (security: #2193 - PR 2195, typeorm 1 and mssql 12, brought up to date and re-checked; pushed, no PR; 23 October 2026, 8:40 PM Central, from `work (security)`)

**Director: work, its security chat** (questions go under **Questions for the director (security)**). **Start now.** **Expected: about 45 minutes.** PR 2195 (`fork/chore/1218-typeorm-1`) was cleared by the GIS Day chat earlier
today, but `development` has moved a long way since (webpack inferred targets #2223, the lint group #2188, body-parser #2208, jwt-decode #2228)
and its Azure build was cancelled. It merges after PR 2231 (Nx 24) in the lock queue; prepare it now.

1. In a worktree of `chore/1218-typeorm-1`: `git merge origin/development`. **If `package-lock.json` conflicts, do not regenerate it**: take
   `development`'s lock and re-apply typeorm 1 and mssql 12 and their own dependencies with batch 41's method. Report every conflict.
2. **The lock rule**, key by key against `origin/development`: only typeorm, mssql and their own dependencies.
3. `scripts/check-in-volume.sh chore/1218-typeorm-1` (full `affected`). Then the GIS Day API as in batch 71 item 2, from this branch: the
   `gisday-nest` production image against a throwaway SQL Server with the repository's seed, `migrate run` (say whether any migration ran or
   errored under typeorm 1), `GET /api/seasons/active` 200, an unauthenticated `POST` 401, **and one authenticated-free read that touches a
   relation** (e.g. a season's events or sponsors list, whatever the API exposes publicly) returning data.
4. Commit the merge, push to the fork (it updates PR 2195; that starts its CI, which is expected). Report.

## Batch 74 (security: #2212 - one internal network per agent, so lab agents cannot reach each other; a branch; 23 October 2026, 8:30 PM Central, from `work (security)`)

**Director: work, its security chat** (questions go under **Questions for the director (security)**). **Start after batch 65.** **Expected: about 45 minutes.** Your batch 72 answers: **question 1 (b)**, before `lab-2` and
`lab-3` are added; **question 2**: the director opens the lab-first pull request from the fork, so its own Azure run is a fork build and shows
whether the restricted token can list pools. Have a token-free check ready in mind in case it cannot.

1. Branch `ci/2212-agent-networks` from `fork/ci/2212-lab-first`. `Confirm-Egress` (and `linux/run-agent.sh`) create **one internal network
   per agent** (`tamu-agent-internal-<name>`, each its own /28 or /27 in `172.31.250.0/24`, derived from the name so it is stable), connect the
   one proxy to each, and put each agent only on its own. `squid.conf` accepts all of those subnets. Keep the old single network working for an
   agent not yet reinstalled, or say how the reinstall removes it.
2. Prove with two test agents (`lab-test`, `lab-test2`, dummy token, or containers of the image without registering): each reaches npm and
   GitHub through the proxy; **neither can reach the other's address** (and the proxy refuses the other's address too); `lab-1` untouched.
3. `scripts/check-in-volume.sh ci/2212-agent-networks`, commit (`ci(workspace): Give each build agent its own network`, `Part of #2212`,
   Co-Authored-By), push to the fork. **No PR.** In **For the maintainer**, the exact commands to reinstall `lab-1` and add `lab-2`, `lab-3` on it.

## Batch 73 (security: #2212 - confirm `lab-1` now runs in the background behind the egress proxy; read-only, 5 minutes; 23 October 2026, 8:10 PM Central, from `work (security)`)

**Director: work, its security chat** (questions go under **Questions for the director (security)**). **Start right after batch 71, before batch 65.** **Expected: 5 minutes. Read-only: change nothing, stop nothing, never read or print the
token file.** The maintainer has just run batch 68's three switch-over commands for `lab-1`.

1. `Get-ScheduledTask tamu-build-agent-lab-1`: State, trigger, `Hidden`.
2. `docker ps --format '{{.Names}} {{.Image}} {{.Status}}'`: the `tamu-build-agent-lab-1` container and `tamu-agent-egress`; the image
   id of `tamu-gisc/build-agent:latest` against your batch 68 build.
3. `docker inspect tamu-build-agent-lab-1 --format '{{json .NetworkSettings.Networks}}'`: **only `tamu-agent-internal`**. And its
   `HostConfig` (`Binds` empty, `Privileged` false, `CapDrop` ALL). **Do not run `docker inspect` without a `--format`** (it would show
   `AZP_TOKEN`).
4. The newest `%LOCALAPPDATA%\tamu-build-agent\logs\agent-lab-1-*.log`: its last 15 lines (it never holds the token): `Listening for Jobs`?
5. Report it in a few lines; if anything is off, say what, and do not fix it.

## Batch 70 (security: Dependabot PR 2194, jwt-decode 3 to 4 - the code fix as our own branch; 23 October 2026, 7:55 PM Central, from `work (security)`)

**Director: work, its security chat** (questions go under **Questions for the director (security)**). **Start now.** **Expected: about 30 minutes.** Your batch 68 question 1: **(a)**, accept the ACL and DPAPI blob as shown. PRs 2219, 2221
have merged; 2223 (webpack) is building, so **batch 65 still waits** for it.

Dependabot's PR 2194 bumps `jwt-decode` 3.1.2 → 4.0.0 and fails Build (Actions and Azure). Version 4 dropped the default export for a named
`jwtDecode` and ships its own types. The only user found is `libs/ues/common/nest/src/lib/middleware/user-groups/user-groups.middleware.ts`.

1. Branch `chore/2194-jwt-decode-4` from `origin/development`. Bump `jwt-decode` to `^4.0.0` in `package.json`, lock with batch 41's method
   (only `jwt-decode`'s key may change; remove `@types/jwt-decode` only if it is listed and nothing else needs it). Fix every import (search the
   whole repository, not just that file) to `import { jwtDecode } from 'jwt-decode'`, and any type the code used from v3.
2. Read Dependabot's failing Build log (`gh pr checks 2194`, then the run's log) and confirm it is this error and nothing else; say what it was.
3. **The lock rule**, key by key. `scripts/check-in-volume.sh chore/2194-jwt-decode-4` (full `affected`). Build `ues-operations-nest` for
   production if it is not in that set (it may be excluded from CI builds; build it anyway) and say whether its generated `package.json` lists
   `jwt-decode` 4.
4. Commit (`chore(workspace): Move jwt-decode to 4`, a body, the Co-Authored-By line; the director adds the issue number), push to the fork.
   **No PR**; **never push to Dependabot's branch**.

## Batch 71 (security: Dependabot PR 2191, the everything-else group (14 updates) - verify it runs, not only builds; nothing pushed; 23 October 2026, 7:55 PM Central, from `work (security)`)

**Director: work, its security chat** (questions go under **Questions for the director (security)**). **Start after batch 70.** **Expected: about 45 minutes.** **Commit nothing, push nothing.** PR 2191's checks pass except the linked-issue
one (the director handles that). Three of its updates can break at run time without failing a build: **`@auth0/auth0-angular` 2.3.0 → 2.13.0**
(GIS Day sign-in), **`reflect-metadata` 0.1.14 → 0.2.2** (every Nest API's decorators) and **`express-session` 1.18.2 → 1.19.0**.

1. A worktree at Dependabot's head (`git fetch origin pull/2191/head:pr-2191`), `scripts/check-in-volume.sh pr-2191` (full `affected`) and the
   lock diff against `development`: confirm it is only the 14 packages and their own dependencies.
2. Build and start the `gisday-nest` and `geoservices-nest` production images from it (as batch 38), `gisday-nest` against a throwaway SQL Server:
   `GET /api/seasons/active` 200, an unauthenticated `POST` 401. That proves `reflect-metadata` 0.2 with Nest's decorators.
3. GIS Day front end on its dev server from that worktree (its own `node_modules` volume): the home page loads, **the Sign in button reaches the
   Auth0 login page** (do not sign in), no console errors. Compare with `development` the same way.
4. Report pass/fail per item, and whether 2191 is safe to merge **after PR 2223** (the lock queue), or which update should be split out.

## Batch 72 (security: #2212 - the pipeline runs on the lab first, hosted agents as the fallback, with as many lab agents as fit; a branch; REWRITTEN 23 October 2026, 8:25 PM Central, from `work (security)`)

**Director: work, its security chat** (questions go under **Questions for the director (security)**). **Start right after batch 73, before batch 65** (the maintainer wants a real `lab-1` run tonight). **Expected: about 90
minutes.** **Decided by the maintainer (8:25 PM Central):** max out the lab, which is ours and free. (1) **Lab first, hosted fallback**: when a
`Linux-Build` agent is online the heavy jobs run there; when none is, they run on the hosted pool as today, so a pull request never stalls
because the lab is off. (2) **As many agents on this machine as its memory and CPUs allow, up to three**, so a pull request's jobs run side by
side. Today `azure-pipelines.yml` line 24 sets one `pool:` (`vmImage: ubuntu-24.04`) for every job.

1. **Size the machine.** Report its cores, memory and free disk, and what one agent's job actually uses: run the batch 64 lint and both builds
   in one agent container and record peak memory (`docker stats` sampled, or the cgroup's `memory.peak`) and CPU. From that, say how many
   agents fit **while leaving the machine usable for your own work** (keep at least 8 GB and 4 cores free), capped at three, and the per-agent
   `--memory`/`--cpus` to use. Add a `-Count` (or one task per name) to the install so `lab-1`..`lab-N` can run; **do not register any new agent
   yourself** - the maintainer runs the install for `lab-2`/`lab-3`.
2. **Branch `ci/2212-lab-first`** from `origin/development`:
   - The light first job (*Setup Last SHA*, hosted) also asks Azure whether `Linux-Build` has an online, enabled agent
     (`GET _apis/distributedtask/pools?poolName=Linux-Build`, then `.../pools/{id}/agents?includeCapabilities=false`, `status == online`,
     `enabled`), with `$(System.AccessToken)`, and sets an output variable, e.g. `labOnline`. Any error answers `false` (fall back), with a
     warning that names the cause.
   - Each heavy job (Dependencies Cache or Restore, Lint, Build development, Build production) comes from a template with a `pool` parameter,
     instantiated twice: once on `name: Linux-Build` with `condition: ... eq(dependencies.<setup>.outputs['<step>.labOnline'], 'true')`, once on
     the hosted pool with `ne(...)`. Keep every existing condition (`succeeded()`, the affected logic) on both. Stage and job dependencies must
     still work when one twin is skipped; check how the Tag stage and the GitHub status names (`Monorepo (Build development)` etc.) come out,
     and keep the names the required check expects. **Say exactly what the required status check on GitHub will see.**
   - A one-line switch to force hosted (a variable, e.g. `useLab: false`), documented in the README.
3. Read each heavy job's steps for anything the hosted image has and our agent image does not (`Cache@2`, `az` CLI, `zip`/`unzip`, Chrome) and
   add it to the agent's `Dockerfile` or say why not.
4. **What the maintainer must grant:** the build service identity (`Monorepo Build Service (<org>)` or the project collection one, whichever
   this pipeline uses) needs **Reader** on the `Linux-Build` pool to list agents. Write the exact clicks in the report's **For the maintainer**.
5. `scripts/check-in-volume.sh ci/2212-lab-first`, commit (`ci(workspace): Run the pipeline on the lab's agents first, hosted agents as the
   fallback`, `Part of #2212`, Co-Authored-By), push to the fork. **No PR**: the director opens it; its own Azure run is the first real job.
   Estimate that run's time with 1 agent and with N, against today's 15-25 minutes.

## Batch 69 (security: the webpack conversion brought up to date after PRs 2188 and 2208 changed the lock; pushed, no PR; 23 October 2026, 7:45 PM Central, from `work (security)`)

**Director: work, its security chat** (questions go under **Questions for the director (security)**). **Start right after batch 67, before batch 68** (this one is next in the lock queue). **Expected: about 20 minutes.** PRs 2188
(Dependabot's lint group) and 2218 (your build agent) have merged, and 2208 (body-parser) before them. `fork/chore/2168-webpack-inferred`
(`f0e6f3a4e`, your batch 63) needs `development` merged in again.

1. In a worktree of `chore/2168-webpack-inferred`: `git merge origin/development`. Expect `package-lock.json` to merge cleanly or conflict only
   around the lint group's keys. **If the lock conflicts, do not regenerate it**: take `development`'s lock and add `webpack-cli` and its own
   dependencies with batch 41's method.
2. **The lock rule:** key by key against `origin/development`: exactly the 6 keys of batch 63 added (`webpack-cli` 7.2.3, its `commander` and
   `webpack-merge`, `envinfo`, `interpret`, `rechoir`), nothing removed, no version changed.
3. `scripts/check-in-volume.sh chore/2168-webpack-inferred` (full `affected`, clean `npm ci`), and one production `gisday-nest` build against
   batch 50's output.
4. Commit the merge and push to the fork. **No PR**: the director opens it.

## Batch 68 (security: #2212 - the build agent runs in the background with no prompt: a hidden logon task on Windows, a systemd service on Linux; a code job and a branch; 23 October 2026, 7:35 PM Central, from `work (security)`)

**Director: work, its security chat** (questions go under **Questions for the director (security)**). **Start after batch 67.** **Expected: about 90 minutes.** **Decided by the maintainer** (7:35 PM Central): typing the token for every start
is not acceptable. (1) Windows machines (lab, home): **a hidden scheduled task at the maintainer's logon**, token stored with **DPAPI**;
(2) the VMware build machines: **Ubuntu + Docker Engine, the agent as a `systemd` service** at boot; (3) **90-day tokens**; the root entrypoint
stays; fork secrets go off only after #2216 merges.

On branch `ci/2212-agent-service` from your batch 67 branch (`ci/2212-agent-egress`):

1. **`run-agent.ps1 -TokenFile <path>`**: reads the token from a file written by `Export-Clixml` of a `SecureString` (DPAPI, current user, this
   machine). A new **`save-agent-token.ps1`** asks once (hidden `Read-Host -AsSecureString`) and writes it to
   `$env:LOCALAPPDATA\tamu-build-agent\token.xml`, with an ACL for the current user only. Neither script ever prints the token. A token that
   Azure refuses (401) stops the loop with one line telling the maintainer to run `save-agent-token.ps1` again, instead of retrying forever.
2. **`install-agent-task.ps1 -AgentName <machine>-1`**: registers a scheduled task **at the maintainer's logon**, hidden (no window), that
   waits for `docker info` to succeed (Docker Desktop starting), then runs `run-agent.ps1 -TokenFile ...`; restart on failure; a log under
   `$env:LOCALAPPDATA\tamu-build-agent\logs\` (no token in it). `-Uninstall` removes the task and stops the agent cleanly (deregisters).
   Running it must not need an elevated prompt if Task Scheduler allows a per-user logon task; say if it does.
3. **Linux: `linux/tamu-build-agent.service`** (systemd) plus `linux/install.sh`: the same supervisor loop for a Linux host (bash or the
   PowerShell script under `pwsh`, your choice, say why), token read from `/etc/tamu-build-agent/token` (root:root 0600) and handed to the
   container the same way as on Windows; `Restart=always`; starts after `docker.service`; the egress rules from batch 67 applied before it
   starts. Prove it in a throwaway Ubuntu 24.04 VM or a Docker-in-Docker stand-in as far as you can **without a real token** (a dummy token: the
   service starts, the container fails at *Connect*, the loop stops after three failures as designed).
4. **Prove on Windows with a dummy token**: `save-agent-token.ps1` → file exists, only the current user can read it, `Import-Clixml` from
   another account fails; `install-agent-task.ps1` registers the task; log off and on (or run the task by hand): the agent starts hidden, fails
   at *Connect* with the dummy token, and stops after three tries; `-Uninstall` removes it. **Do not replace the maintainer's real `lab-1`
   while it is running**; use the agent name `lab-test` for every test.
5. README: replace step 4 with "save the token once, install the task" for Windows and "install.sh" for Linux; a section **Token renewal**
   (90 days: create a new token, run `save-agent-token.ps1` or rewrite the Linux file, the task picks it up on the next container).
6. Commit (`ci(workspace): Run the build agent in the background without a token prompt`, `Part of #2212`, Co-Authored-By), push to the fork.
   **No PR.** Then tell the maintainer, in the report's **For the maintainer**, the exact two commands to switch the running `lab-1` over.

## Batch 66 (security: #2216 - fork pull request builds stop downloading the app_configs secure file; a code job and a branch; 23 October 2026, 7:20 PM Central, from `work (security)`)

**Director: work, its security chat** (questions go under **Questions for the director (security)**). **Start now.** **Expected: about 45 minutes.** Your batch 64 answers: **1 (a)**, as its own pull request (#2216, filed); **2: keep the root
entrypoint**; **3: yes**, batch 67. Your build-agent branch is PR 2218 (`Closes #2217`).

1. A branch `ci/2216-fork-builds-no-secure-file` from `origin/development`. In `templates/jobs/build.yml`, make the `DownloadSecureFile@1`,
   extract and copy steps run only when the build is **not** a fork pull request: `condition: ne(variables['System.PullRequest.IsFork'], 'True')`
   on each (keep `succeeded()` in it). Read the whole pipeline (`azure-pipelines.yml`, `templates/`) for anything else that reads the secure
   file or a secret variable, and give those the same condition; list each in the report.
2. Say what a fork build then uses in place of the extracted files (the repository's own environment files) and show, by building the two
   configurations the pipeline builds (`nx run-many --target=build --configuration=development|production`, the pipeline's exclusions) **in your
   build-agent container with no secure file**, that both succeed. This is what every fork build will do.
3. **Do not print, copy or describe the values in `app_configs`.** If you need to know which files it holds, read the copy step's paths only.
4. `scripts/check-in-volume.sh ci/2216-fork-builds-no-secure-file`, commit (`ci(workspace): Fork pull request builds no longer download the
   app_configs secure file`, a body, `Closes #2216`, the Co-Authored-By line), push to the fork. **No PR.**

## Batch 67 (security: #2212 - restrict the build agent's network to the internet only; a design and a branch; 23 October 2026, 7:20 PM Central, from `work (security)`)

**Director: work, its security chat** (questions go under **Questions for the director (security)**). **Start after batch 66.** **Expected: about 60 minutes.** Your batch 64 residual risk: fork code on the agent can reach the host's local
network. Before any job is pointed at `Linux-Build`, the agent's containers must reach only the internet (npm, GitHub, Azure DevOps, Nx Cloud)
and **not** 10/8, 172.16/12, 192.168/16, 169.254/16 or the host.

1. Find a way that works on Docker Desktop for Windows (WSL 2) **and** on a plain Linux Docker host (the VMware VMs later), and survives a
   Docker Desktop restart. Options to weigh: a dedicated Docker network plus `iptables` rules in `DOCKER-USER` applied inside Docker Desktop's VM
   (and how they are re-applied), an egress proxy container on an internal network as the only route out, or another. Prefer the one with the
   fewest moving parts that cannot be bypassed from inside the container (`--cap-drop ALL` already blocks changing its own rules).
2. Build it on branch `ci/2212-agent-egress` (from `fork/ci/2212-lab-build-agent`): changes to `run-agent.ps1` and the README, any helper.
3. Prove it from inside an agent container: `curl -sI https://registry.npmjs.org`, `https://github.com`, `https://dev.azure.com` succeed;
   a connection to the host's LAN gateway, any 10.x/172.16.x/192.168.x address and `host.docker.internal` **fails**; DNS still resolves. Then
   the batch 64 lint and build run still passes inside it.
4. Commit (`ci(workspace): Keep the build agent off the local network`, `Part of #2212`, Co-Authored-By) and push to the fork. **No PR.**
   **Do not register an agent**; that stays the maintainer's.

## Batch 64 (security: #2212 - an Azure Pipelines Linux agent in a container on this machine, built and proven, NOT registered; a code job and a branch; 23 October 2026, 7:00 PM Central, from `work (security)`)

**Director: work, its security chat** (questions go under **Questions for the director (security)**). **Start now.** **Expected: about 90 minutes.** The maintainer's decision (#2212): the Monorepo pipeline gets self-hosted Linux build
capacity, **starting on this machine**, as an agent in a container. Azure today runs one PR build at a time on three hosted agents, 15–25
minutes each; your `check-in-volume.sh` runs the same work here in 3–5 minutes. **You build and prove the image; you do not register it** (that
needs a token only the maintainer creates, later). **Never put a token, password or key in any file, commit, report or command line.**

**Guard rails, all required** (this repository is public; every PR comes from a fork, and its code runs on the agent):
- the agent runs **in a container**, never on the host: **no bind mount of any host folder, no Docker socket, no host network, no `--privileged`**,
  no SSH keys, no `gh` login, nothing from `C:\Users`;
- the container runs the agent with **`--once`** (one job, then exit) and is started fresh for each job by a supervisor loop, so nothing a job
  leaves behind reaches the next;
- its memory and CPU are capped (`--memory 24g --cpus 16`) so it cannot starve the lab's own work.

1. A branch `ci/2212-lab-build-agent` from `origin/development`, and a folder **`tools/build-agent/`** with:
   - `Dockerfile`: from `ubuntu:24.04`; `git`, `curl`, `jq`, `ca-certificates`, Node **24.22.1** (the same as the repository's images), and
     the **Azure Pipelines Linux agent** (latest v4, the documented "Run a self-hosted agent in Docker" layout: download at build time, a
     non-root user). No secrets in the image.
   - `start.sh`: Microsoft's documented start script, adapted: reads `AZP_URL`, `AZP_TOKEN` (from the environment only), `AZP_POOL`
     (default `Linux-Build`), `AZP_AGENT_NAME`; configures with `--unattended --replace`; **runs with `--once`**; unsets `AZP_TOKEN` from the
     environment before the job runs (`AZP_TOKEN_FILE` approach as Microsoft's sample does), and deregisters on exit.
   - `run-agent.ps1`: the **supervisor** the maintainer starts on the lab: asks for the token with a hidden `Read-Host -AsSecureString`
     (never on the command line), then loops: `docker run --rm` the image with the caps above and the token passed via an env var only to
     that container, wait for it to exit, start the next. A clean stop on Ctrl+C.
   - `README.md`: what it is, the guard rails and why, how to build the image, how the maintainer starts it, how to stop it, and how to see it
     in Azure DevOps.
2. **Prove the image runs this pipeline's work, without Azure:** `docker build`, then inside a container of it (same caps, no mounts): `git
   clone https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo.git`, check out `development`, `npm ci`, and run what the
   pipeline's Lint and Build stages run (read `azure-pipelines.yml` and `templates/`; for a full run use `nx run-many -t lint,build` for the
   projects the pipeline builds, excluding `EXCLUDED_PROJECTS`). Report the time for each stage and the exit codes. Then check `start.sh` without a
   token: it must refuse with a clear message and no traceback.
3. Confirm the guard rails from inside a running container: no `/var/run/docker.sock`, no host paths mounted (`mount | grep -v overlay`),
   running as the non-root user, memory limit visible in `/sys/fs/cgroup/memory.max`.
4. `scripts/check-in-volume.sh ci/2212-lab-build-agent` (expect few or no tasks: these files belong to no project; say so). Commit (`ci(workspace):
   A containerised Linux build agent for the lab`, a body, `Part of #2212`, the Co-Authored-By line). Push to the fork. **No PR.**

## Batch 65 (security: refresh the Nx 24 branch once the webpack conversion's PR has merged; 23 October 2026, 7:00 PM Central, from `work (security)`)

**Director: work, its security chat** (questions go under **Questions for the director (security)**). **Start only once `git log origin/development --oneline -10` shows "Move the API builds to Nx's inferred webpack targets".** Until then
skip it. Your batch 63 question 1: **yes**. In `chore/2168-nx-24`: `git merge origin/development`, resolve `nx.json` with the same three-way script,
check `package-lock.json` keeps Nx 24's entries and `webpack-cli` (key by key against your batch 62 result), `scripts/check-in-volume.sh
chore/2168-nx-24`, and push. **No PR.**

## Batch 63 (security: the webpack conversion brought up to date after PR 2184 merged, and re-checked; pushed to the fork, no PR; 23 October 2026, 6:45 PM Central, from `work (security)`)

**Director: work, its security chat** (questions go under **Questions for the director (security)**). **Start after batch 62.** **Expected: about 30 minutes.** PRs 2182 (lint) and 2184 (Jest) have both merged (squashed), so
`fork/chore/2168-webpack-inferred` (your batch 50, `dd87888d3`) now needs `development` merged in.

1. In a worktree of `chore/2168-webpack-inferred`: `git merge origin/development`. Expect a conflict in `nx.json` only (`plugins` and
   `targetDefaults`): keep every plugin entry (`@nx/vitest`, `@nx/eslint/plugin`, `@nx/jest/plugin`, `@nx/webpack/plugin`) and every default,
   as you did in batches 61 and 62. If anything else conflicts, stop and report it. `package-lock.json` should merge cleanly (it adds
   `webpack-cli`); if it does not, use batch 41's method for `webpack-cli` and its own dependencies only.
2. **The lock rule:** after the merge, read back `webpack-cli` 7.2.3 and its dependencies in the lock, and confirm no other version changed
   against `origin/development` (key by key, as batch 41).
3. `scripts/check-in-volume.sh chore/2168-webpack-inferred` (full `affected`, clean `npm ci`), and one production `gisday-nest` build compared with
   batch 50's output (same `main.js` and generated `package.json`).
4. Commit the merge and `git push fork chore/2168-webpack-inferred`. **No pull request**: the director opens it when its turn in the lock queue
   comes (after PRs 2208 and 2188).

## Batch 62 (security: #2168 - Nx 24 itself, as a branch; a code job, pushed to the fork with no PR; 23 October 2026, 6:25 PM Central, from `work (security)`)

**Director: work, its security chat** (questions go under **Questions for the director (security)**). **Start next.** **Expected: about 45 minutes.** Your batch 61 question 1: **keep `affected.legacy`**; turning it off is a later change with
its own check.

Batch 61 as a branch. **Base:** the same scratch merge as batch 61 (`fork/chore/2168-jest-inferred` at `450f025c0` plus
`fork/chore/2168-webpack-inferred`, `nx.json` resolved as you did), on a branch **`chore/2168-nx-24`** (replace the stale one from batch 36 if it
still exists locally; it was never pushed).
1. `nx migrate 24.0.0`, batch 44's lock method for `nx` and `@nx/*`, `npm install`, then all twelve migrations. **Delete `migrations.json` and
   `tools/ai-migrations/`** before committing.
2. Check, as in batch 61: `scripts/check-in-volume.sh chore/2168-nx-24` (lint 104 / test 100 / build 14 expected), one production `gisday-nest`
   build against batch 50's (same `main.js` and generated `package.json`), and **the AggieMap dev server** started from this branch as CLAUDE.md's
   dev-server command says (its own `node_modules` volume, a port other than 4200 if it is busy): the first compile finishes and the map page
   answers. The `@nx/angular` migration added `readyWhen: { signal: true }` to `serve`, so say whether the dev server behaves any differently.
3. Two commits are fine: the merge of the webpack branch, then `chore(workspace): Upgrade Nx from 23 to 24` (a body listing the three migrations
   that changed anything, the lock method, `Closes #2168`, the Co-Authored-By line). `git push fork chore/2168-nx-24`. **No pull request**: it
   follows PR 2184 and the webpack conversion's PR, and the director opens it once those merge.

## Batch 60 (security: body-parser 2.4.0 for today's denial-of-service advisory - a lock-only fix and a branch; 23 October 2026, 5:55 PM Central, from `work (security)`)

**Director: work, its security chat** (questions go under **Questions for the director (security)**). **Start now.** **Expected: about 30 minutes.** Push to the fork only; **no pull request starts from it** (the director opens it).

A new advisory today, **GHSA-27r3-jxmh-p828** (npm 1243074): `body-parser` `>=2.0.0 <2.4.0`, denial of service via trailing bytes after a compressed
request body. `development`'s lock has `node_modules/express/node_modules/body-parser` **2.3.0** (production: `express` 5, used by every Nest API),
and `express` asks for `^2.3.0`, so **2.4.0 is in range**. (The top-level `body-parser` 1.20.8 is dev-only, under `webpack-dev-server`'s
`express` 4, and not in this advisory's range.)

1. `git worktree add C:/TAMU/wt-bodyparser -b fix/body-parser-2-4 origin/development`.
2. In Docker (`node:24.22.1`): `npm update body-parser --package-lock-only --ignore-scripts` (or, if that does not reach the nested copy,
   batch 41's method for the key `node_modules/express/node_modules/body-parser` only). **No `package.json` change.**
3. **The lock diff** against `development`, key by key: expect only that `body-parser` to 2.4.x and anything only it depends on. Then
   `npm audit --package-lock-only --omit=dev`: report the totals; `body-parser` must be gone.
4. Build `gisday-nest` and `geoservices-nest` for production and start each image (as batch 38): no missing module; `gisday-nest` against a
   throwaway SQL Server answers `GET /api/seasons/active` 200 and accepts a JSON `POST` that it then refuses 401 (unauthenticated), so a
   request body is still parsed; and a gzip-compressed JSON body (`Content-Encoding: gzip`) to the same route still gets 401, not 400/500.
5. `scripts/check-in-volume.sh fix/body-parser-2-4` (full `affected`, clean `npm ci`). Commit (`fix(workspace): Move body-parser to 2.4.0 for
   its denial-of-service advisory`, a body naming the advisory, `Closes #2207` (filed at High; the maintainer put it first in the lock queue), the Co-Authored-By line). Push to the fork.

## Batch 61 (security: Nx 24 on top of the three conversions - a probe, nothing pushed; 23 October 2026, 5:55 PM Central, from `work (security)`)

**Director: work, its security chat** (questions go under **Questions for the director (security)**). **Start after batch 60.** **Expected: about 45 minutes.** **Commit nothing, push nothing.** The three #2168 conversions exist as branches
(lint merged as PR 2182; Jest is PR 2184, `fork/chore/2168-jest-inferred` at `450f025c0`; webpack is your `fork/chore/2168-webpack-inferred`).
This measures what is left for Nx 24 itself once all three are in.

1. A scratch worktree from `fork/chore/2168-jest-inferred`, then `git merge fork/chore/2168-webpack-inferred` (resolve `nx.json` keeping every
   plugin entry and default, as you described in batch 50's question 3).
2. `npm ci`, then `nx migrate 24.0.0`, then batch 44's lock method for `nx` and `@nx/*`, `npm install`, then **all** of `migrations.json`
   (`nx migrate --run-migrations`). Report each migration and what it changed, and any AI prompt it wrote.
3. `nx run-many -t lint,test,build` (or `scripts/check-in-volume.sh` on a local branch): counts and every failure's first error. And one
   production build of `gisday-nest` compared with batch 50's output (byte-identical, or what differs).
4. Report: what the Nx 24 branch will need beyond `migrate`, and whether it can go as one small change.

## Batch 59 (gisday: #2205, deleting a sponsor that has a logo; 23 October 2026, 5:40 PM Central, from `work (gisday)`)

When your security batches allow, after batch 54 (#2196). Medium priority. Development work, ending in a branch.
[#2205](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2205) has the error and how it was
found: "Delete Sponsor" on a sponsor with a logo answers 500, because the logo's `assets` row still references the
sponsor (`FK_98821d8bf60cd7694ecaa84dc99`, `assets.sponsorGuid`). It fails on today's production code too, so it is not
typeorm 1's.

### What to do

1. Branch `fix/2205-gisday-delete-sponsor-with-logo` from the latest `origin/development` (it has typeorm 1 if PR 2195
   has merged; say which you branched from).
2. **Red first:** a test in `libs/gisday/platform/data-api` that deletes a sponsor with a logo asset and expects it to
   succeed and leave no asset row (and no file, if the API stores one). Prove it red against the current code.
3. Fix it the way the codebase already handles assets for other entities, if it does: look at places and
   organizations, which also have logos, and say in the report whether they have the same fault. Prefer a fix in the
   provider over a schema change; if a migration is needed, follow `docs/gisday-migrations.md` and say why.
4. The admin page sends the DELETE twice for one click (`sponsor-add-edit-form.component.ts`, `deleteEntity`). Find out
   why and make it one, with a test if one fits.
5. **Green**, then `scripts/check-in-volume.sh fix/2205-gisday-delete-sponsor-with-logo` must exit 0. Commit
   (`Closes #2205`) and push to the fork.

You cannot sign in to the GIS Day admin pages on your machine, so prove it at the API and test level. The director
will run the admin delete itself before opening the pull request.

### Then

Report with the branch and head commit, red and green test output, whether places and organizations have the same
fault, the double-DELETE cause, and the check's exit code. Nothing on GitHub.

---

## Batch 58 (security: PR 2184 (Jest inferred) resolved against PR 2182 (lint inferred) ahead of time; a code job, pushed to a scratch branch; 23 October 2026, 3:45 PM Central, from `work (security)`)

**Director: work, its security chat** (questions go under **Questions for the director (security)**). **Start after batch 50** (before 57, which waits on a merge). **Expected: about 40 minutes.**

PR 2182 (lint → inferred, your batch 47, now with `development` merged in at `cc86e5475`) merges first. PR 2184 (Jest → inferred, your batch 48
plus the director's `test/polyfills.ts` input, at `c45a37e24`) then conflicts with it in **34 `project.json` files and `nx.json`**: 2182 removes
each project's `lint` target, 2184 its `test` target, next to each other. Resolve it now so 2184 is ready when 2182 merges.

1. `git fetch fork chore/2168-lint-inferred chore/2168-jest-inferred`; `git worktree add C:/TAMU/wt-2184r -b security/check-2184 fork/chore/2168-jest-inferred`.
2. `git merge fork/chore/2168-lint-inferred` (which already contains `development`). Resolve every conflict **keeping both removals**: in each
   `project.json`, neither the old `lint` target nor the old `test` target survives, and everything else in the file (other targets,
   `generatePackageJson`, tags) is kept. In `nx.json`: keep **both** plugin entries (`@nx/eslint/plugin` with its `include` and `exclude`, and
   `@nx/jest/plugin`), both `test` `targetDefaults` entries (the Vitest one and the Jest-filtered one with `test/polyfills.ts`), and the lint
   default's removal. Use a script that checks each hunk's two sides are only those targets, as the director did for 2182's five files, and stop on
   any hunk that is anything else.
3. Check the result: `git grep -n '"@nx/eslint:lint"\|"@nx/jest:jest"' -- '*project.json' nx.json` prints nothing; `nx show projects --with-target lint`
   gives 104, `--with-target test` gives 103, `nx show projects` gives 110 (as on each branch alone).
4. `scripts/check-in-volume.sh security/check-2184` (full `affected`): lint 104, test 100, build 14 expected.
5. Commit the merge and `git push fork security/check-2184`. **Do not push to `chore/2168-jest-inferred`**: the director moves it there once 2182 has
   merged. Report the head and the count of files resolved.

## Batch 57 (security: watch the first runs of the Actions majors after PR 2186 merges - read-only; 23 October 2026, 3:35 PM Central, from `work (security)`)

**Director: work, its security chat** (questions go under **Questions for the director (security)**). **Start only once PR 2186 has merged** (`git log origin/development --oneline -5` shows "Bump the actions group"); until then, skip it
and take the next runnable batch. **Expected: about 20 minutes once its runs finish.** Your batch 55 question 1: **(a)**. **Read-only.**

With `gh`, on the `development` commit PR 2186 merged as:
1. **Publish** (`main.yml`'s `Publish` jobs): every `build-and-push` job's result; for two images, the tags pushed (`sha-<7>`, `stable`) and
   the OCI labels on the published image (`docker buildx imagetools inspect --raw` or `docker image inspect` after a pull: `created`, `version`,
   `revision` present and right); and the security gate's "Block a critical" step result for each image.
2. **Test Report**: the first `Test Report` run after the merge: its conclusion, and that it posted its check (dorny/test-reporter 3).
3. **`security-scan.yml`**: its next run. If none has run since the merge, say so; the director will ask the maintainer to start one. Its
   `upload-artifact` 7 step must upload `npm-audit.json`, `scan/` and `findings.md`.
4. `aggiemap-smoke.yml`'s next scheduled run likewise, if one has happened.
Report each as **works** or **broke, with the error**.

## Batch 55 (security: review Dependabot's GitHub Actions majors, PR 2186 / #2200 - read-only; 23 October 2026, 3:10 PM Central, from `work (security)`)

**Director: work, its security chat** (questions go under **Questions for the director (security)**). **Start after batch 53.** **Expected: about 45 minutes.** **Push nothing.** The maintainer's decision: take these eight majors after
a lab review of each one's breaking changes against how **our** workflows use it.

| Action | From → to |
| --- | --- |
| `actions/checkout` | 4 → 7 |
| `actions/setup-node` | 4 → 7 |
| `actions/cache` | 4 → 6 |
| `actions/upload-artifact` | 4 → 7 |
| `actions/download-artifact` | 4 → 8 |
| `docker/metadata-action` | 5 → 6 |
| `docker/build-push-action` | 6 → 7 |
| `dorny/test-reporter` | 2 → 3 |

For each: read its release notes for every major between the two (each repository's `releases` page or `CHANGELOG`), list the breaking
changes, and for each one say whether our workflows are affected, citing the file and line (`git grep -n "uses: <action>@" .github/workflows`,
then the `with:` it is given). Pay attention to: `upload-artifact`/`download-artifact` (artifact name, merge-multiple, path and hidden-file
behaviour: `build.yml` uploads `dist/` and `publish.yml` downloads it; `security-scan.yml` uploads its scan); `checkout` (credential persistence,
`sparse-checkout` as `publish.yml`'s gate uses it); `setup-node` (cache defaults, the Node version input); `metadata-action` (tag and label
output format, `fromJSON(steps.meta.outputs.json).labels[...]` in `publish.yml`); `build-push-action` (load/push, `labels`, build args);
`test-reporter` (inputs `test.yml` and others pass); and the **Node runtime** each action needs on the runner.
**Answer:** mergeable as it is, mergeable with a named follow-up change, or not, with the reason. Also check PR 2186's own CI result
(`gh` is not available to you, so read the PR's checks on github.com in the built-in browser if you can, or say you could not).

## Batch 56 (security: #2201 - mailroom-nest parses TYPEORM_EXTRA; a small code job and a branch; 23 October 2026, 3:10 PM Central, from `work (security)`)

**Director: work, its security chat** (questions go under **Questions for the director (security)**). **Start after batch 55.** **Expected: about 30 minutes.** Your batch 49 report's question 2, decided by the maintainer: **(a)**, an issue
(#2201, Low) and the fix.

1. `git worktree add C:/TAMU/wt-2201 -b fix/2201-mailroom-typeorm-extra origin/development`.
2. In `apps/mailroom-nest/src/environments/*.ts`, parse `TYPEORM_EXTRA` the way `gisday-nest` already does (read its environment files and
   copy the pattern, so the two stay alike): JSON when set, nothing when empty or absent. Add a unit test that a JSON value reaches the
   TypeORM options as an object, and that an empty one does not break start-up; prove it red on the unfixed code first.
3. Prove it as batch 49 did: `mailroom-nest` against a throwaway SQL Server with a self-signed certificate, `TYPEORM_EXTRA` set to
   `{"trustServerCertificate": true}`, **with no preload**: it starts and `GET /all` answers. Then without `TYPEORM_EXTRA`: it refuses the
   certificate, as before.
4. `scripts/check-in-volume.sh fix/2201-mailroom-typeorm-extra mailroom-nest,mailroom-data-api` (a bug fix: the projects it edits).
   Commit (`fix(mailroom-nest): Parse TYPEORM_EXTRA, so its driver options reach the driver`, a body, `Closes #2201`, the Co-Authored-By
   line) and push if all passed.

## Batch 54 (gisday: #2196, the local restore runs the migrations; 23 October 2026, 3:05 PM Central, from `work (gisday)`)

When your security batches allow; about 30 minutes. Development work, ending in a branch.
[#2196](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2196) says what and why: it came from
your typeorm 1 report `2026-10-23-38.md`. **Decided by the maintainer:** `restore` runs the migrations after restoring.
Not a re-scrubbed copy, not only a doc line.

### What to do

1. Branch `fix/2196-gisday-restore-migrates` from the latest `origin/development`, in its own worktree. PR 2197
   (#2133) also edits `docs/gisday-local.md`; if it has merged, branch after it, and if not, keep your doc change to the
   `restore` paragraph so the two don't touch the same lines.
2. **Red first:** a fresh `scripts/gisday-local.sh restore`, then `api`; the sponsors API and one season day's events
   answer 500 (`Invalid column name 'active'` / `'checkInZone'`). Keep the output.
3. In `scripts/gisday-local.sh`, make `restore` run the migrations after it restores, the same way the `migrate run` step
   does, with the same settings. Add a check to `scripts/gisday-local.test.sh` that it does, and prove that check red
   first.
4. **Green:** a fresh `restore` then `api`; both answer 200, and `migrate show` lists no pending migration.
5. Update the `restore` paragraph in `docs/gisday-local.md`. LF endings. Commit (`Closes #2196`), run
   `bash scripts/gisday-local.test.sh`, and push to the fork. A full check is not needed for a script and doc change.

### Then

Report with the branch and head commit, the red and green outputs, and the test script's result. Nothing on GitHub;
the director opens the pull request.

---

## Batch 53 (security: check Dependabot's PRs 2187 and 2188 - a test, nothing pushed; 23 October 2026, 2:55 PM Central, from `work (security)`)

**Director: work, its security chat** (questions go under **Questions for the director (security)**). **Start next**, before batch 50 if 49 is still running when you read this (these are short and two PRs wait on them).
**Expected: about 40 minutes.** **The maintainer's decision (23 October):** every Dependabot PR is checked by the lab like any dependency
change before he merges it; the director posts the result on the PR. **Push nothing**: these branches belong to Dependabot.

For each of **2187** (testing group: `@playwright/test` 1.63.0 → 1.64.1, `jest-preset-angular` 17.0.2 → 17.0.3) and **2188** (lint group:
`typescript-eslint` and `@typescript-eslint/*` 8.71.1 → 8.72.0, `prettier` 3.9.9 → 3.9.10), separately:

1. `git fetch origin pull/<n>/head:dependabot-<n>` and `git worktree add C:/TAMU/wt-dep-<n> dependabot-<n>`. Report the head commit.
2. **The lock:** compare its `package-lock.json` with `origin/development`'s key by key (as batch 41): every version change. Expect only the
   named packages and their own dependencies. Report anything else.
3. `scripts/check-in-volume.sh dependabot-<n>` (full `affected`, clean `npm ci`): the `Successfully ran target` / `failed` lines, each
   failure's first error.
4. **2187 only:** the smoke suite derives its Playwright image from `package.json`, so run the quick tier against dev with the new version:
   `test/smoke/aggiemap/run-local.sh development quick` from the worktree. Report the image tag it used (`v1.64.1-noble` expected), and the
   pass/fail counts against your most recent quick run on 1.63.0. Also list every file that still hard-codes `v1.63.0` (`git grep -n
   "playwright:v1.63.0"`): the director fixes those separately.
5. Remove both worktrees and the local branches.

Report per PR: **mergeable as it is, or not, and why.** Report in `work-lab-leila/reports/` and say "work-lab-leila: finished batch 53".

## Batch 52 (aggiemap: #2143 on dev - the athletics maps against their new services; 23 October 2026, from `work (aggiemap)`)

### START NOW — dev is serving it, confirmed 4:00 PM Central

The maintainer has pushed the build and **dev is confirmed serving #2143**, checked from the live site
rather than from a build number:

- `https://dev.aggiemap.tamu.edu/parking/soccer-parking` requests **`gis.dev.tamu.edu`** — the new host.
  Before this build, dev drew these maps from `arc.ts.tamu.edu`, production's.
- Soccer's layers are the new two-layer set: **Soccer Event Parking Lots** and **Accessible Parking
  Spaces**. **Safety First** and **Purchase Hourly Visitor Parking** are gone.

So the mechanism works on at least one map. **Your job is the other ten**, and particularly the thing a
host check cannot show: **a layer that is listed but draws nothing.** The definition expressions were
written against production's field names (`event = 'Soccer'`, `lotname`, `soccern` and so on) and
nothing has proved they match the new views.

Take this after your current batch; it does not need the machine to itself.

### Unblocked, 23 October 2026, 3:50 PM Central — the images published on a rerun

You reported this batch could not start: the `development` run for `6a567ae8c` failed at
`Publish / build-and-push (mailroom-angular)` with `ERROR: failed to build: unknown blob`, taking the
other publish jobs with it, `aggiemap-angular` included.

**The maintainer reran the failed jobs and they all succeeded** -
[run 40013030183](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/actions/runs/40013030183)
is now `success` at 20:02 UTC, with `aggiemap-angular` among the nine that published. It was the
transient registry error it looked like.

**He is pushing that build to dev now.** Start this batch when dev is serving `6a567ae8c`, and not
before - confirm the commit rather than assuming, and **never from a bundle name**: each stage bakes
its own analytics id in, so the same commit gives different hashes on dev and production.

**Why the timing matters today:** the GIS team are waiting on this. They publish these eleven services
to production once dev is shown to work, and **basketball starts next week**. So this is the check that
releases their work, not a routine tier.

If dev is still not serving it an hour from now, say so in your status rather than waiting silently -
the deploy may have stalled, and that is worth knowing early.


**After batch 49.** **Do not start until the build carrying `6a567ae8c` is on dev** - PR 2176 merged at
about 2:38 PM Central and the maintainer started a build straight after. **Expected: about 40 minutes.**

### Why this one matters

The GIS team republished eleven athletics maps as hosted views on the development GIS server, and
[#2143](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2143) points dev at
them. **Until this build, dev drew production's services for these maps** - `tsgisHost` is pinned to the
production host - so this is the first time anything has read the new views.

**They publish to production once dev is shown to work, and basketball starts next week.** This batch is
that showing.

### 1. Confirm you are testing the right build

Check dev is serving `6a567ae8c` or newer before anything else. **Do not identify it by bundle name** -
each stage bakes its own analytics id in, so the same commit gives different hashes per environment. If
you cannot establish the commit, say so and stop rather than reporting on an unknown build.

### 2. The eleven maps, by eye

For each, on `https://dev.aggiemap.tamu.edu/parking/<id>`:

`baseball-parking`, `cross-country-parking`, `indoor-track-parking`, `mens-basketball`,
`outdoor-track-parking`, `soccer-parking`, `softball-parking`, `swimming-parking`, `tennis-parking`,
`volleyball-parking`, `womens-basketball`

Report per map:

- **Does it draw?** A blank canvas for 20-40 seconds is Esri still working, not a fault.
- **The Layers list.** **Safety First** and **Purchase Hourly Visitor Parking** should be **gone** from
  the seven that had them. Accessible Parking Spaces and the event lots should remain.
- **Indoor Track has no Team Bus Parking on dev.** That is correct and confirmed with the GIS team - do
  not report it as a fault, but do say whether the rest of that map is intact.
- **Anything empty.** A layer in the list that draws nothing is the failure mode that matters here: the
  definition expressions were written against production's fields, and nothing has proved they match the
  new views.

**Compare each against the same map on production**, which is unchanged, so a difference is either the
GIS team's restyling or a fault.

### 3. The quick tier

`test/smoke/aggiemap/run-local.sh development quick`. Say what it will run before it starts, as the
suite prints its set.

### 4. Screenshots - not yours

**Do not capture a set.** Every baseline lives on the work machine and a set taken elsewhere is stranded
from the ones it would be compared with. The "after" images for #2143 are taken on `work`; say in your
report that the maps are ready for them.

### Then

Report as `work-lab-leila/reports/<date>-<n>.md`, per map, with anything empty or missing named outright.
**If a map is broken, that is the most useful thing you can find today** - it is better found now than
after the GIS team publish to production.


> **2:45 PM Central, from `work (security)`:** PRs 2174, 2175, 2178 and 2180 merged (squashed). **Batch 49** (typeorm 1) was started on `chore/1218-eslint-10`: before you push it, `git merge origin/development` into it and resolve, keeping development's side for anything ESLint 10 or #2117 changed, then re-run the check. Batches 50 and 51 now start from `development`.

## Batch 51 (security: #1218 - remove eslint-plugin-node, registered but unused; a small code job and a branch; 23 October 2026, 2:40 PM Central, from `work (security)`)

**Director: work, its security chat** (questions go under **Questions for the director (security)**). **Start after batch 50**, or **before it** if batch 50 is waiting on anything, or between 49 and 50 if that is quicker.
**Expected: about 20 minutes.** Your batch 43 survey noted `eslint-plugin-node` is unmaintained since 2020. The root `eslint.config.mjs`
imports it and registers it as `node` (line 2, line 6), but **no rule anywhere uses a `node/` rule** (`git grep` finds none). So remove it.

1. `git worktree add C:/TAMU/wt-no-eslint-node -b chore/1218-drop-eslint-plugin-node origin/development` (**updated 2:45 PM: PR 2180 (ESLint 10) has merged, so start from `development`**).
2. Confirm first: `git grep -n -E "node/[a-z-]+" -- '*.mjs' '*.js' '*.json' '*.ts' ':!package-lock.json' ':!node_modules'` for rule names, and
   any `// eslint-disable` comment naming a `node/` rule. If any is found, stop and report it.
3. Remove the import and the `{ plugins: { node: ... } }` entry from `eslint.config.mjs`, and `eslint-plugin-node` from `package.json`.
   `npm install --package-lock-only --ignore-scripts`; report the lock diff (expected: the plugin and what only it used).
4. Proof: `nx run-many -t lint --skip-nx-cache` on all projects: exit 0, the same error count (0) and warning count as on the ESLint 10
   branch. Then `scripts/check-in-volume.sh chore/1218-drop-eslint-plugin-node`. Commit (`chore(workspace): Remove eslint-plugin-node,
   registered but never used`, a body, `Part of #1218`, the Co-Authored-By line). Push if both passed.

## Batch 50 (security: #2168 on Nx 23 - the webpack builds to inferred targets, compared build for build; a code job and a branch; 23 October 2026, 2:30 PM Central, from `work (security)`)

**Director: work, its security chat** (questions go under **Questions for the director (security)**). **Start after batch 49** (or before it, if 49 is waiting on anything). **Expected: about 2 hours.** The third conversion of
#2168's plan, on Nx 23. Your batch 47 question 1 is handled (PR 2182 merges after PR 2180); question 2 (`gisday-bridge-nest`) is noted
for the next workflow edit - fold it into this branch if you touch `build.yml` or `test.yml`, otherwise leave it.

1. `git worktree add C:/TAMU/wt-2168-webpack23 -b chore/2168-webpack-inferred origin/development` (**updated 2:45 PM: PR 2175 has merged, so start from `development`**, which has it;
   because both change how the APIs build: #2117 sets `generatePackageJson` in `project.json`, and on inferred targets that moves into
   each `webpack.config.js`).
2. **Before:** build the six `@nx/webpack:webpack` projects for production with `--skip-nx-cache` (the four APIs, `ues-operations-nest` if
   it builds here, and the sixth from your batch 44 count), and keep each `dist/apps/<app>` as the baseline: file list with sizes, and
   `main.js`'s size and SHA-256.
3. `nx g @nx/webpack:convert-to-inferred --no-interactive`. Report what it changed. Read the AI migration prompt Nx 24 wrote for webpack
   (your batch 36/44 `tools/ai-migrations/`) for what `withNx`/`composePlugins` did that an inferred target needs written out, and make
   each `webpack.config.js` do it explicitly (`NxAppWebpackPlugin` or the equivalent Nx 23 documents), **including
   `generatePackageJson: true`** and the existing `devtoolModuleFilenameTemplate` and output path.
4. **After:** the same six builds. **Compare with the baseline**: file lists (added/removed), sizes, and for `main.js` whether it is
   byte-identical; if not, diff the two (`diff <(npx prettier main.js) ...` or a JSON summary of webpack's module list) and explain every
   difference. **The generated `package.json` of each API must list the same dependencies as before** (the image's prune depends on it).
5. **The images** (as batch 38): build all four API images from the new output, each starts and fails only on settings, `gisday-nest`
   against a throwaway SQL Server (200 and 401), and the version check (every package at the root lock's version).
6. `scripts/check-in-volume.sh chore/2168-webpack-inferred` (full `affected`). Commit (`chore(workspace): Move the API builds to Nx's
   inferred webpack targets, ahead of Nx 24`, a body with step 4's comparison summary, `Part of #2168`, the Co-Authored-By line). Push if
   steps 4 to 6 passed. If step 4 shows a difference you cannot explain, do not push: report it as a question.

## Batch 49 (security: #1218 - typeorm 1 with mssql 12; a code job and a branch; 23 October 2026, 2:20 PM Central, from `work (security)`)

**Director: work, its security chat** (questions go under **Questions for the director (security)**). **Start after batch 48.** **Expected: about 2 hours.** Your batch 43 survey sized it: 69 type errors, 65 of them the `relations`
change, in 21 files, and `mssql` 11 → 12 as typeorm 1's peer.

1. `git worktree add C:/TAMU/wt-typeorm1 -b chore/1218-typeorm-1 fork/chore/1218-eslint-10` (on PR 2180's branch, so the lock changes
   stay in one line).
2. `package.json`: `typeorm` → `^1.1.2`, `mssql` → `^12.7.11`, `ts-node` → `10.9.2` (exact, as it is now), and the `mssql` entry in
   `apps/gisday-nest/package.json` and `apps/mailroom-nest/package.json` **if PR 2175 has merged into `development` by then** (if not,
   say so; they'd be updated when 2175 and this meet). `npm install --package-lock-only --ignore-scripts`; batch 41's method if ERESOLVE.
   **Report the lock diff**: expect typeorm's and mssql's trees only.
3. **The code**, as typeorm 1's release notes say, nothing more:
   - every `relations: ['a', 'b.c']` → the object form (`relations: { a: true, b: { c: true } }`): 65 sites in 21 files (`git grep`
     first and report the count you find);
   - `getRepository` from `'typeorm'` in `libs/gisday/competitions/data-api/src/lib/season/season.service.ts` → the injected repository or
     `DataSource.getRepository`, following how the same library's other services already do it;
   - the three `unknown`-index errors in that same file: type them properly, not with `any`.
   Then `npx tsc --noEmit -p` each affected app's `tsconfig.app.json`: 0 new errors (`gisday-competitions-nest`'s existing
   `Cannot find module './ormconfig'` is not this change's).
4. **Against a real database** (throwaway SQL Server, as in batch 12): `gisday-nest` starts, `GET /api/seasons/active` 200, an
   unauthenticated write 401, and **two reads that use relations** return the same JSON as `development`'s image against the same
   database (pick two GET routes whose services you changed, e.g. a season with its days, an organization with its people; diff the
   responses). `mailroom-nest` starts against its own throwaway database and `GET` on its email list answers. Report each.
5. `scripts/check-in-volume.sh chore/1218-typeorm-1` (full `affected`, clean `npm ci`). Commit (`chore(workspace): Upgrade typeorm to 1
   and mssql to 12`, a body listing what changed and why, `Part of #1218`, the Co-Authored-By line). Push if steps 3 to 5 passed.

## Batch 46 (security: ESLint 10 branch - the other four `"force": true` lint targets removed; 23 October 2026, 2:10 PM Central, from `work (security)`)

**Director: work, its security chat** (questions go under **Questions for the director (security)**). **Start now.** **Expected: about 20 minutes.** Your batch 45 questions: 1 **(a)**, remove them in this branch; 2 keep `eslint`
**exact**.

1. In `C:/TAMU/wt-eslint10` (`chore/1218-eslint-10`, `d8883d63c`): remove the `"force": true` option (and an `"options"` block left
   empty by it) from the lint target of `gisday-nest` (`apps/gisday-nest/project.json:132`), `gisday-platform-ngx-common`,
   `gisday-platform-ngx-core` and `gisday-platform-ngx-data-access`. Then `git grep -n '"force": true' -- '*project.json'` must print
   nothing; report it.
2. Proof through Nx, each project's own config: `nx run-many -t lint --projects=gisday-nest,gisday-platform-ngx-common,gisday-platform-ngx-core,gisday-platform-ngx-data-access --skip-nx-cache`
   (exit code, errors per project). If any has errors, fix each if it is one line, as batch 45 did, and say what; else stop and report.
3. A second commit (`chore(workspace): Let lint fail on the four GIS Day projects that forced it to pass`, a body naming them and
   #208 as where the flag came from, `Part of #1218`, the Co-Authored-By line). `scripts/check-in-volume.sh chore/1218-eslint-10`. Push.

## Batch 47 (security: #2168 on Nx 23 - lint targets to inferred tasks; a code job and a branch; 23 October 2026, 2:10 PM Central, from `work (security)`)

**Director: work, its security chat** (questions go under **Questions for the director (security)**). **Start after batch 46.** **Expected: about 60 minutes.** Your batch 44 question 1: **(c)**, convert on Nx 23 first, so each
conversion is its own separately green branch (the maintainer's "each with its own full check"), and the Nx 24 bump after is small.
Question 2: **yes**, check the lint inputs in this branch.

1. `git worktree add C:/TAMU/wt-2168-lint23 -b chore/2168-lint-inferred origin/development` (`development`, still Nx 23.3.0).
2. In Docker (`node:24.22.1`, own volume): `npm ci`, then `node node_modules/nx/dist/bin/nx.js g @nx/eslint:convert-to-inferred
   --no-interactive`. Report what it changed (counts: `project.json` files, `nx.json`).
3. **Same lint, before and after:** for three projects (an Angular library, `gisday-nest`, a plain TS library), show the `lint` target
   from `nx show project <p> --json` on `development` and on this branch: command, options, and **`inputs`** (your batch 44 question 2:
   whatever the inferred target hashes must include each project's `eslint.config.mjs` and the root one, or a config change would not
   re-lint). If an input is missing, add it in `nx.json`'s plugin options or `targetDefaults` and show the result.
   **`force`**: after batch 46's branch merges there will be none; on `development` there are five. Say whether the inferred target keeps
   `force` (it should **not** - a lint that cannot fail checks nothing).
4. The CI lint exclusions (`lint.yml`, read by `scripts/check-in-volume.sh`) must still mean the same projects: show that the script's
   list is unchanged in meaning.
5. Proof: `scripts/check-in-volume.sh chore/2168-lint-inferred` (full `affected`): lint must run for **every** project it ran for on
   `development` (104) and pass. Report the count.
6. Commit (`chore(workspace): Move lint to Nx's inferred targets, ahead of Nx 24`, a body, `Part of #2168`, the Co-Authored-By line).
   Push if step 5 passed.

## Batch 48 (security: #2168 on Nx 23 - Jest targets to inferred tasks; a code job and a branch; 23 October 2026, 2:10 PM Central, from `work (security)`)

**Director: work, its security chat** (questions go under **Questions for the director (security)**). **Start after batch 47.** **Expected: about 60 minutes.** As batch 47, for Jest.

1. `git worktree add C:/TAMU/wt-2168-jest23 -b chore/2168-jest-inferred origin/development` (independent of batch 47's branch).
2. `npm ci`, then `nx g @nx/jest:convert-to-inferred --no-interactive`. Report what changed.
3. **Same tests, before and after:** for three Jest projects (`geoservices-data-access`, an Angular library, a Nest library), the `test`
   target's command, options and `inputs` on `development` and on this branch, **and the number of tests run** by each (it must be the
   same). `test.yml` runs with `--coverage=false`; the inferred target must accept that flag. The CI test exclusions (`test.yml`) must
   still mean the same projects.
4. Proof: `scripts/check-in-volume.sh chore/2168-jest-inferred` (full `affected`): test must run for every project it ran for on
   `development` (100) and pass. Report the count.
5. Commit (`chore(workspace): Move Jest to Nx's inferred targets, ahead of Nx 24`, a body, `Part of #2168`, the Co-Authored-By line).
   Push if step 4 passed.

## Batch 44 (security: batch 42 again, with batch 41's lock method for the Nx set - the Nx 24 premise test; 23 October 2026, 2:00 PM Central, from `work (security)`)

**Director: work, its security chat** (questions go under **Questions for the director (security)**). **Start now.** **Expected: about 40 minutes.** Your batch 42 question 1: **(a)**. A test: **commit and push nothing.**

Batch 42 as written, with one change at step 2: after `nx migrate 24.0.0`, delete from `package-lock.json` the `node_modules/nx` key and
every key whose path contains `node_modules/@nx/` (top level and nested, the `@nx/nx-<platform>` binaries included), with the same kind
of script as batch 41. Then `npm install`. If it still fails, report it in full and stop.
Then steps 3 to 6 of batch 42 exactly: the five targets unconverted, then **only the lint migrations** and the five again, and the
one-line answers in step 5. **Also report, for the record:** the lock diff after `npm install` against batch 41's branch (keys added,
removed, versions changed), so the director knows the size of the Nx 24 lock change before any branch is made.

## Batch 45 (security: #1218 - ESLint 10 and its five fixes; a code job and a branch; 23 October 2026, 2:00 PM Central, from `work (security)`)

**Director: work, its security chat** (questions go under **Questions for the director (security)**). **Start after batch 44** (or before it, if 44 is waiting on anything). **Expected: about 45 minutes.** Your batch 43 survey found
ESLint 10 installs cleanly and needs five one-line fixes.

1. `git worktree add C:/TAMU/wt-eslint10 -b chore/1218-eslint-10 fork/chore/2168-angular-eslint-22-6` (on batch 41's branch, so the two
   lock changes stay in one line).
2. `package.json`: `eslint` to `^10.13.0` (keep its existing style) and `@eslint/js` to `^10.0.1`; nothing else unless the install requires
   it (say what). In Docker (`node:24.22.1`, own volume): `npm install --package-lock-only --ignore-scripts`. If ERESOLVE, use batch 41's
   method for the `eslint` and `@eslint/*` keys only. **Report the lock diff** against batch 41's branch (keys added, removed, versions
   changed); expect ESLint's own packages and their dependencies only.
3. Fix the five errors **as the rule intends**, not by disabling it: `preserve-caught-error` (4): `throw new X(msg, { cause: err })` where
   an error is re-thrown with a new message (check each `X` accepts a second argument; Nest's `HttpException` subclasses take
   `{ cause }` in their options object); `no-useless-assignment` (1): remove the dead assignment. Files:
   `libs/common/node/fs/src/lib/common-node-fs.ts:64`, `libs/maps/feature/trip-planner/src/lib/services/trip-planner.service.ts:1240`,
   the `gisday/platform` one your batch 43 named, the `ts-events-ngx` one, and
   `libs/gisday/competitions/data-api/src/lib/export/export.processor.ts:114`. Show each diff.
4. **The oddity you found:** `gisday-platform-data-api` printed `1 error` but Nx did not list it as failed. Find out why (its lint target's
   options, an `--max-warnings`, a `continue-on-error`, or ESLint config severity) and report it. **If its lint lets errors through, fix
   that so errors fail it**, as every other project's do, and say so; if fixing it surfaces other existing errors in that project, list
   them and fix them too if each is one line, else stop and report.
5. Proof: `nx run-many -t lint --skip-nx-cache` on all projects (0 errors), then `scripts/check-in-volume.sh chore/1218-eslint-10` (full
   `affected`, clean `npm ci`). Commit (`chore(workspace): Upgrade ESLint to 10, and fix what its new recommended rules find`, a body,
   `Part of #1218`, the Co-Authored-By line). Push to the fork if all passed.

## Batch 43 (security: #1218 - what TypeScript 7, ESLint 10 and typeorm 1 would break; read-only; 23 October 2026, 1:45 PM Central, from `work (security)`)

**Director: work, its security chat** (questions go under **Questions for the director (security)**). **Start whenever nothing else of the security chat's is runnable** (for example if batch 41 stops, or after 42).
**Expected: about 60 minutes.** Read-only: it ends in a report. **Nothing is committed or pushed.**

Your batch 27 inventory found, besides Nx: **TypeScript 6 → 7**, **ESLint 9 → 10** (with `@eslint/js`), and **typeorm 0.3 → 1**. Each is a
#1218 step. This batch measures each one's size, so the steps can be planned: try each **in its own throwaway worktree from
`origin/development`**, one at a time, and measure.

For each of the three:
1. `git worktree add C:/TAMU/wt-try-<name> origin/development --detach`. In Docker (`node:24.22.1`, its own volume), bump just that package
   (and its direct companions: `@eslint/js` with ESLint; `typescript-eslint` only if ESLint 10 requires it) in `package.json`, then
   `npm install`. If it fails to resolve, report the conflict in full and go to the next one.
2. Run, and count errors by kind (not every line; the counts and three representative examples of each kind):
   - **TypeScript 7:** `nx run-many -t build --projects=aggiemap-angular,gisday-angular,gisday-nest,geoservices-nest,mailroom-nest`
     and `npx tsc -p tsconfig.base.json --noEmit` if that works here. Note whether Angular 22's compiler accepts TypeScript 7 at all (its
     peer range in `@angular/compiler-cli`'s `package.json`).
   - **ESLint 10:** `nx run-many -t lint` (all projects), plus what ESLint 10's release notes say changed for flat config and for the plugins
     used here (`angular-eslint`, `typescript-eslint`, `eslint-plugin-*` in `package.json`): does each plugin's current version declare
     ESLint 10 support?
   - **typeorm 1:** build `gisday-nest`, `gisday-competitions-nest` (if it builds today), `mailroom-nest`, and run their tests; read
     typeorm 1's migration notes for anything used here (`find` options, `Repository` methods, `DataSource` setup, decorators). List each
     API used here that the notes say changed, with the files that use it (`git grep` counts).
3. Remove the worktree.

**Report:** one table, a row per upgrade: installs (yes/no), errors (count by kind), the peers that block it, the files most affected,
and your estimate of the work (small: under a day; medium: a few days; large). Then **one recommended order** for them, with a sentence why.
No changes anywhere.

## Batch 41 (security: angular-eslint 22.6.0 by re-resolving only its eight lock entries; a code job and a branch; 23 October 2026, 1:40 PM Central, from `work (security)`)

**Director: work, its security chat** (questions go under **Questions for the director (security)**). **Start now.** **Expected: about 30 minutes.** Your batch 39 question 1: **(a)**.

1. In `C:/TAMU/wt-ae2206` (`chore/2168-angular-eslint-22-6`, with your uncommitted `package.json` edit): `git fetch origin`; if
   `origin/development` has moved past `6eac6d637`, rebase onto it first (stash the edit, rebase, re-apply).
2. Delete from `package-lock.json` only the entries for `angular-eslint` and every `@angular-eslint/*` package, at whatever paths they
   occur (top level and nested), with a short script. Report the keys removed. Then, in Docker (`node:24.22.1`, own volume),
   `npm install --package-lock-only --ignore-scripts`. If ERESOLVE again, report it in full and stop.
3. **Prove nothing else moved:** compare the new lock with `development`'s, key by key: list every key added, removed, or whose
   `version` changed. **Expected:** only the eight `angular-eslint` packages (to 22.6.0) and anything that only they depend on. Report
   any other change; if there is one you cannot explain, stop before committing.
4. `scripts/check-in-volume.sh chore/2168-angular-eslint-22-6` (full `affected`, clean `npm ci`): the `Successfully ran target` /
   `failed` lines and each failure's first error. Lint matters most here.
5. Commit (`chore(workspace): Move angular-eslint to 22.6.0, the first step towards Nx 24`, a body with step 3's diff summary,
   `Part of #2168`, the Co-Authored-By line) and push to the fork only if steps 3 and 4 passed.

## Batch 42 (security: Nx 24 - does Jest and webpack still run unconverted? A test, not a branch; 23 October 2026, 1:40 PM Central, from `work (security)`)

**Director: work, its security chat** (questions go under **Questions for the director (security)**). **Start after batch 41, only if 41 pushed.** **Expected: about 30 minutes.** Your batch 39 question 2: **(c)**, prove the premise
first. The maintainer chose "three branches, each with its own full check: lint, then Jest, then webpack". That only works if Nx 24 still
runs Jest and webpack targets that have not been converted yet. This batch finds out; **commit and push nothing.**

1. `git worktree add C:/TAMU/wt-nx24-probe fork/chore/2168-angular-eslint-22-6 --detach` (batch 41's branch).
2. In Docker (`node:24.22.1`, own volume): `npm ci`, `node node_modules/nx/dist/bin/nx.js migrate 24.0.0`, `npm install`. If it fails,
   report it in full and stop. **Do not run the migrations.**
3. With Nx 24 installed and **no migration run**, run and report exit code and the first error (or the last lines on success) of:
   - `nx run common-utils-string:test` (Vitest) and `nx run geoservices-data-access:test` (Jest, `@nx/jest:jest`);
   - `nx run ui-kits-ngx-forms:lint` (`@nx/eslint:lint`);
   - `nx run gisday-nest:build --configuration=production` (`@nx/webpack:webpack`, with `withNx()` in its `webpack.config.js`);
   - `nx run aggiemap-angular:build --configuration=production` (Angular).
4. Then run **only the lint migrations** (as batch 40 described: `@nx/eslint`, `@nx/eslint-plugin`, and workspace-wide ones they depend
   on), and repeat step 3. Report which migrations you ran.
5. **The answer the director needs, in one line each:** on Nx 24, do unconverted `@nx/jest:jest` targets run? Do unconverted
   `@nx/webpack:webpack` builds run, and if they do, is the output the same as on Nx 23 (compare `dist/apps/gisday-nest/main.js` size and
   the file list with a build from `development`)? Can a lint-only branch pass the full check?
6. Clean up: remove the worktree. Leave the volume.

## Batch 40 (security: #2168 step 1 - Nx 24, the lint targets only; a code job and a branch; 23 October 2026, 1:35 PM Central, from `work (security)`)

**SUPERSEDED at 1:40 PM Central by batches 41 and 42. Do not run it.** Its step 4 rested on a premise batch 42 now tests.

**Director: work, its security chat** (questions go under **Questions for the director (security)**). **Start after batch 39**, and only if batch 39 pushed its branch (angular-eslint 22.6.0). If 39 stopped, stop here too
and say so. **Expected: about 90 minutes.**

**The maintainer's decision on #2168 (23 October):** Nx 24 in three branches, each with its own full check: **lint**, then Jest, then the
webpack builds (the last after #2117). This batch is **lint only**. His comment on #2168 has the order.

1. `git worktree add C:/TAMU/wt-2168-lint -b chore/2168-nx-24-lint fork/chore/2168-angular-eslint-22-6` (on batch 39's branch).
2. In Docker (`node:24.22.1`, own volume): `npm ci`, `node node_modules/nx/dist/bin/nx.js migrate 24.0.0`, then `npm install`. If it
   still fails on peers, report the full conflict and stop (no `--legacy-peer-deps`, no `--force`).
3. Run **only the migrations that concern lint** from `migrations.json` (those for `@nx/eslint`, `@nx/eslint-plugin` and the workspace-wide
   ones they depend on: list which you ran and which you left, with each one's description). Edit `migrations.json` down to that set,
   then `nx migrate --run-migrations`. If a lint migration writes an AI prompt in `tools/ai-migrations/`, do what it asks **by hand** for
   the lint targets only, and say what you did.
   - **Every `@nx/eslint:lint` target must become an inferred `lint` task** that runs the same ESLint on the same files. Pick three projects
     (one Angular library, one Nest app, one plain TS library) and show, before and after, the command Nx runs for `lint`
     (`nx show project <p> --json`, the `lint` target's `command`/`options`).
   - The CI lint exclusions (`lint.yml`, read by `scripts/check-in-volume.sh`) must still mean the same projects.
4. **Jest and webpack must still work on Nx 24 without being converted.** If they cannot (an executor removed, so the target errors), stop
   and report exactly which targets and what error: that changes the plan, and is a question for the maintainer.
5. Proof: `scripts/check-in-volume.sh chore/2168-nx-24-lint` (full `affected`, clean `npm ci`): every `Successfully ran target` / `failed`
   line, each failure's first error. **Lint must run for every project it ran for before (113 minus the removed oidc projects: compare with
   `development`'s count) and pass.** Also the AggieMap dev server from this worktree (own `node_modules` volume, a port other than 4200 if
   busy): first compile without errors, map page answers.
6. Commit with `migrations.json` and `tools/ai-migrations/` removed (`chore(workspace): Upgrade Nx to 24, and move lint to inferred
   tasks`, a body listing the migrations run and any hand changes, `Part of #2168`, the Co-Authored-By line). Push only if step 5 passed.

## Batch 38 (security: #2117 part 2 rebased onto development after PR 2173, and re-proved; 23 October 2026, 1:25 PM Central, from `work (security)`)

**Director: work, its security chat** (questions go under **Questions for the director (security)**). **Start now.** **Expected: about 40 minutes.** Your batch 35 report's question 1: **(a)**. PR 2173 (batch 34's npm removal, #2172)
merged as `6eac6d637`, so rebase onto it and resolve.

1. In `C:/TAMU/wt-2117` (`chore/2117-api-own-deps`, `360e453da`): `git fetch origin`; `git rebase origin/development`. In each of the four
   Dockerfiles keep **both**: this branch's builder-stage changes and 2173's runtime-stage lines (the comment and the `RUN rm -rf .../npm ...`
   after `WORKDIR /app`). Report each conflict and how you resolved it.
2. Re-prove, as batch 35 did: production builds, `docker build` all four, each starts and fails only on settings, `gisday-nest` against a
   throwaway SQL Server (200 and 401), **the version check (every package at the root lock's version, at the same path)**, and
   **Trivy** on each new image: expected **0 critical, 0 high** (npm gone and the packages trimmed). Report sizes and counts against
   `:stable`, which is now `6eac6d637`'s build once that publish finishes; say which `:stable` you compared with.
3. Your question 2 (`mssql` is absent from `geoservices-nest` and `mailroom-helper-nest`): add **one sentence** to the comment you wrote in
   `publish.yml` or the Dockerfile (wherever the root-lock-and-prune approach is explained), saying that an API given a TypeORM database
   later needs its driver listed in its own `apps/<app>/package.json`, as `gisday-nest` and `mailroom-nest` do now. No other change.
4. `scripts/check-in-volume.sh chore/2117-api-own-deps`, then `git push --force-with-lease fork chore/2117-api-own-deps` if all passed.
   Report the new head.

## Batch 39 (security: Nx 24's first blocker - angular-eslint 22.6.0 on its own; a code job and a branch; 23 October 2026, 1:25 PM Central, from `work (security)`)

**Director: work, its security chat** (questions go under **Questions for the director (security)**). **Start after batch 38.** **Expected: about 30 minutes.** Your batch 36 report's question 1, option **(c)**: move `angular-eslint`
to 22.6.0 on its own first. **Nothing about Nx itself in this branch.** Keep `C:/TAMU/wt-2168` as it is (question 3: keep).

1. `git worktree add C:/TAMU/wt-ae2206 -b chore/2168-angular-eslint-22-6 origin/development`.
2. In `package.json`: `angular-eslint` stays a **range**, `^22.6.0` (it is `^22.0.0` today; `nx migrate` had pinned it exactly, which
   is not wanted), and the three `@angular-eslint/*` at `22.6.0` the same way they are written today (keep each one's existing style:
   exact stays exact, a range stays a range). In Docker (`node:24.22.1`, own volume): `npm install --package-lock-only --ignore-scripts`.
   If that fails with ERESOLVE, report the full conflict and stop; do **not** use `--legacy-peer-deps` or `--force`.
3. If the lock resolved: report which lock entries changed (count, and every package whose version changed), then
   `scripts/check-in-volume.sh chore/2168-angular-eslint-22-6` (full `affected`, clean `npm ci`): the `Successfully ran target` /
   `failed` lines, each failure's first error. Lint is the target that matters here.
4. Commit (`chore(workspace): Move angular-eslint to 22.6.0, the first step towards Nx 24`, a body, `Part of #2168`, the Co-Authored-By
   line) and push to the fork only if step 3 passed.

## Batch 37 (security: #2138, Dependabot version updates - a code job and a branch; 23 October 2026, 1:00 PM Central, from `work (security)`)

**Director: work, its security chat** (questions go under **Questions for the director (security)**). **Start after batch 36.**
**Expected: about 30 minutes.** No `package.json` or lock change.

[#2138](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2138): once dependencies are at their latest (#1218),
something has to say when a newer version comes out. Today nothing does: there is no Dependabot or Renovate configuration.

1. `git worktree add C:/TAMU/wt-2138 -b ci/2138-dependabot origin/development`.
2. Write `.github/dependabot.yml` (version 2), weekly, **Monday 06:00 America/Chicago**, every PR targeting **`development`** (the trunk; never
   `master`), labelled `dependencies`, with commit-message prefix `chore(deps)`:
   - **npm** at `/`, `open-pull-requests-limit: 5`, **grouped** so a week brings a few PRs: one group per family, by name pattern -
     `angular` (`@angular/*`, `@angular-eslint/*`, `angular-eslint`), `nx` (`nx`, `@nx/*`), `nestjs` (`@nestjs/*`), `arcgis` (`@arcgis/*`,
     `@esri/*`), `testing` (`jest*`, `@jest/*`, `vitest*`, `@vitest/*`, `@playwright/*`, `@testing-library/*`), `lint` (`eslint*`,
     `@eslint/*`, `typescript-eslint`, `@typescript-eslint/*`, `prettier`), and `everything-else` (`*`) for the rest, **minor and patch only**
     for `everything-else` so each major is its own PR. Majors for the named families stay grouped (they move together).
   - **docker** for each Dockerfile directory: `/apps/aggiemap-angular/src`, `/apps/gisday-angular/src`, `/apps/geoservices-angular/src`,
     `/apps/mailroom-angular/src` (their `FROM` is the pinned `nginx-base:sha-...`; Dependabot will not find newer `sha-` tags, which is fine:
     it is listed so a future move to version tags is covered), and the four API `src` folders (`node:24.22.1`), grouped into one PR.
   - **github-actions** at `/`, grouped into one PR.
   - Leave `security-updates` at GitHub's default (on); this file is for version updates.
3. **Validate it:** the file must parse as YAML, and every `directory` must exist on `development` (list each with `ls`). If a schema
   validator is available offline (for example `npx -y @bugron/validate-dependabot-yaml` or the JSON schema from SchemaStore with `ajv`),
   run it and report the result; if none works offline, say so.
4. Add one short paragraph to `CLAUDE.md`, under "Commit, then run this before every push" or near the dependency-change rule, saying:
   Dependabot opens weekly grouped PRs into `development`; each is handled like any dependency change (its own issue, the full check with a
   clean `npm ci`, the lock rule), and a major-version PR is a decision for the maintainer, not merged on a green check alone.
5. Commit (`ci(workspace): Weekly grouped Dependabot version updates for npm, Docker and Actions`, a body, `Closes #2138`, the
   Co-Authored-By line). `scripts/check-in-volume.sh ci/2138-dependabot` (expect `No tasks were run`; say so - step 3 is the proof).
   Push to the fork.

## Batch 34 (security: #2117 part 1 - npm out of the API images; a code job and a branch; 23 October 2026, 12:55 PM Central, from `work (security)`)

**Director: work, its security chat** (questions go under **Questions for the director (security)**). **Start now.** **Expected: about 40 minutes.** Your batch 31 report's question 2, decided by the maintainer: **yes**.

The last accepted image findings (`brace-expansion`, `http-cache-semantics`, `undici`) are in the npm that ships inside
`node:24.22.1-alpine`, and the APIs only run `node main.js`. So remove npm from the **final stage** of the four API Dockerfiles
(`gisday-nest`, `geoservices-nest`, `mailroom-nest`, `mailroom-helper-nest`). **Leave #2117's package work out of this branch**: it is batch 35.

1. From `origin/development` (`80687f29d` or later): `git worktree add C:/TAMU/wt-2117-npm -b chore/2117-no-npm-in-api-images origin/development`.
2. In each of the four `apps/<app>/src/Dockerfile`, in the `node:24.22.1-alpine` stage, after `WORKDIR /app`:
   `RUN rm -rf /usr/local/lib/node_modules/npm /usr/local/lib/node_modules/corepack /usr/local/bin/npm /usr/local/bin/npx /usr/local/bin/corepack`
   with a one-line comment above it: `# The APIs run node only; npm in the base image carried every remaining finding in these images (#2117).`
   If `corepack` is not in the image, drop it from the line rather than leave a no-op.
3. Build each API for production (as in batch 31, with `--skip-nx-cache`), copy the root package files in as publish.yml does today
   (`cp package.json package-lock.json dist/apps/<app>/`), then `docker build -t local/nonpm-<app> dist/apps/<app>` for all four.
4. For each image: `docker run --rm --entrypoint sh local/nonpm-<app> -c "node -v; ls /usr/local/bin; ls /usr/local/lib/node_modules 2>/dev/null"`
   (expected: node v24.22.1, no npm or npx), then start it with no settings for up to 20 seconds as in batch 31, step 4: it must fail on
   configuration or a connection, **not** on a missing module. For `gisday-nest`, also the real start against a throwaway SQL Server, as in
   batch 12: `GET /api/seasons/active` 200, an unauthenticated write 401. Remove the throwaway database afterwards.
5. Trivy (`aquasec/trivy:0.76.1`, `--scanners vuln --severity CRITICAL,HIGH --quiet`) on each `local/nonpm-<app>` and on
   `ghcr.io/tamugeoinnovation/<app>:stable`: totals side by side, and whether the three packages are gone.
6. Commit (`chore(workspace): Remove npm from the API images' runtime stage`, a body saying what and why, `Part of #2117`, the
   `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>` line), run `scripts/check-in-volume.sh chore/2117-no-npm-in-api-images`, and
   report its `Successfully ran target` / `failed` lines **and whether it ran any task** (a Dockerfile-only change may run none: say so; then
   steps 4 and 5 are the proof).
7. Push to the fork if steps 4 and 5 passed for all four. Report the head commit. Clean up images and containers.

## Batch 35 (security: #2117 part 2 - each API image installs only its own packages, at the root lock's versions; a code job; 23 October 2026, 12:55 PM Central, from `work (security)`)

**Director: work, its security chat** (questions go under **Questions for the director (security)**). **Start after batch 34.** **Expected: about 60 minutes.** Your batch 31 report's question 1, decided by the maintainer:
**(c)**: keep the root lock's exact versions, and prune to what each API uses. **Do not report anything to Nx** (decided: no).

Start from your batch 31 work (`C:/TAMU/wt-2117`, local commit `7c25ba6a0`): rebase it on `origin/development`, or redo it on a fresh
branch `chore/2117-api-own-deps` from `origin/development`, whichever is cleaner. Keep `generatePackageJson: true` (so the build writes
each API's own `package.json`), but **do not use the lock Nx generates** (it is wrong for three of four apps).

**The goal:** each API image ends with `node_modules` holding only what its generated `package.json` needs, **at the versions in the root
`package-lock.json`**, installed reproducibly (no floating versions). How you get there is yours to work out; one approach to try first:
- have the build keep the root files beside the app as `root-package.json` and `root-package-lock.json` (publish.yml's copy step, renamed);
- in the image's builder stage: `npm ci --omit=dev` from the root pair, then make the generated `package.json` the image's
  `package.json` and run `npm prune --omit=dev`, and check what remains.
If that does not prune correctly, say why and try one other approach at most (for example `npm install --omit=dev` with the root lock copied
in as `package-lock.json`, which npm reuses for versions). Report what you tried and what happened, in order.

**Proof, as in batch 31 and batch 34:** all four build and start (failing only on configuration), `gisday-nest` against a throwaway SQL
Server (200 and 401), each image's `node_modules` count and size against `:stable`, and **for each package left, its version matches the
root lock** (a short script comparing `node_modules/*/package.json` versions with the root lock's `node_modules/<name>` entries; report any
mismatch). Then commit (`Closes #2117`), run `scripts/check-in-volume.sh`, and push only if everything passed. If batch 34 merged first,
build on it.

## Batch 36 (security: #2168, Nx 23 to 24 - a code job and a branch; 23 October 2026, 12:55 PM Central, from `work (security)`)

**Director: work, its security chat** (questions go under **Questions for the director (security)**). **Start after batch 35**, or **before it** if batch 35 is waiting on anything. **Expected: about 90 minutes.**

[#2168](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2168): the first step of #1218. Eleven packages are on
Nx 23.3.0 against 24.0.0 (your batch 27 inventory).

1. `git worktree add C:/TAMU/wt-2168 -b chore/2168-nx-24 origin/development` (`80687f29d` or later). In Docker with its own volume
   (`node:24.22.1`): `npm ci`, then `node node_modules/nx/dist/bin/nx.js migrate 24` (report the exact version it resolves to),
   `npm install` (this updates the lock, which is expected here), and `node node_modules/nx/dist/bin/nx.js migrate --run-migrations` if
   `migrations.json` was written. Report every migration it ran, and commit the result **with `migrations.json` removed**.
2. Read Nx 24's breaking changes (its release notes and migration guide) for `@nx/webpack` options, `@nx/jest` helpers, `@nx/angular`, the
   daemon, and `NX_WORKSPACE_DATA_DIRECTORY`. List anything that touches this repository, with the file it touches.
3. **Proof:** `scripts/check-in-volume.sh chore/2168-nx-24` (full `affected`; a lock change means a clean `npm ci`), every
   `Successfully ran target` / `failed` line, and each failure's first error. Then the AggieMap dev server: start it from this worktree as
   CLAUDE.md's "Keep a dev server's install current" says (on a port other than 4200 if 4200 is busy, with its own `node_modules` volume),
   load it, and report that the map page answers and the first compile finished without errors.
4. **Fix what breaks** if it is the upgrade's doing and the fix is small (a renamed option, a moved import). Report each fix. If a fix is
   not small, stop and report it as a question instead.
5. Commit (`chore(workspace): Upgrade Nx from 23 to 24`, a body listing the migrations and fixes, `Closes #2168`, the Co-Authored-By
   line). Push to the fork only if step 3 passed.

## Batch 33 (security: #2155 again, after the gisday-nest fix - the full check; 23 October 2026, 12:15 PM Central, from `work (security)`)

**Director: work, its security chat** (questions go under **Questions for the director (security)**). **Start after batch 31, before 32.**
**Expected: about 10 minutes.** From Git Bash, in order. Change nothing.

Batch 30 found `gisday-nest` failing on `TS2503: Cannot find namespace '__esri'` because `ValidObject` came from `@tamu-gisc/common/types`.
It now lives in GIS Day's entities file. The branch also has `development` merged in (PR 2156, squashed).

1. `git fetch fork security/check-2155`. `git rev-parse fork/security/check-2155` must print **`248d79ab52f3d081c27fec5980349d9a74ac47c0`**. If not, stop and report it.
2. `git worktree add C:/TAMU/wt-check-2155b fork/security/check-2155 --detach`; `cd C:/TAMU/wt-check-2155b`; `git switch -c security/check-2155b`.
3. `scripts/check-in-volume.sh security/check-2155b > ../check-2155b.out 2>&1; echo "exit=$?"`. Report the exit code, the `Successfully ran target`
   or `failed` lines, and each failure's first error. If the only failure is a test timing out, rerun just that project once.
4. Repeat batch 30's step 5 (the `gisday-angular` production build and the `nodemailer|oidc-common|mailer.util` grep) in this worktree,
   with volume `tamu-js-2155-nm`. Report `build=` and the grep output.
5. `cd C:/TAMU`; `git worktree remove C:/TAMU/wt-check-2155b --force`; `git branch -D security/check-2155b`.

No pushes, no pull request, no comments. Report in `work-lab-leila/reports/` and say "work-lab-leila: finished batch 33".

## Batch 32 (security: #2154, npm test and npm run coverage work again - a small code job and a branch; 23 October 2026, 12:25 PM Central, from `work (security)`)

**Director: work, its security chat** (questions go under **Questions for the director (security)**). **Start after batch 31.**
**Expected: about 30 minutes.** A code job: write it, prove it, push a branch; the director opens the pull request. Git Bash.

[#2154](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2154): the root `jest.config.ts` is
`module.exports = { projects: [...getJestProjects()] }`, and Nx 23's `@nx/jest` no longer has `getJestProjects` (only
`getJestProjectsAsync`). So `npm test` (`"test": "jest"`) and `npm run coverage` (`"coverage": "jest --coverage --coverageReporters=cobertura"`)
both fail at once. CI is not affected: it runs `nx affected -t test`, which uses each project's own config. Many projects are on Vitest now
(#1479), and a root Jest config can only ever reach the Jest ones.

1. `git fetch origin development`; `git worktree add C:/TAMU/wt-2154 -b fix/2154-root-test-scripts origin/development`; `cd C:/TAMU/wt-2154`.
2. **The change** (decided by the director, so do this rather than choose):
   - Delete the root `jest.config.ts`.
   - In the root `package.json`: `"test": "nx run-many -t test"` and `"coverage": "nx run-many -t test --coverage"`. Leave everything else alone,
     and do **not** touch `package-lock.json`.
   - Correct the three documents that tell people to run `npm run coverage`, so they say what it now does: `.github/workflows/test.yml`
     line 41 (a comment), `test/README.md` line 94, and `.github/copilot-instructions.md` line 49. One sentence each, LF.
   - `git grep -n "jest.config.ts" -- '*.json' '*.js' '*.ts' '*.mjs' ':!node_modules'`: if anything still points at the **root** file (the
     path with no folder in front), fix it the same way and say what. Each project's own `jest.config.ts` stays.
3. **Prove it**, in Docker with a volume of its own (`node:24.22.1`, `npm ci --ignore-scripts` first):
   - `npx jest --listTests` at the root must now fail as "no config" or similar, **not** with `getJestProjects is not a function`. Report what it says.
   - `npm test -- --projects=common-utils-string,ui-kits-ngx-forms` (or two other small projects, one Jest and one Vitest if you can tell them
     apart; say which) must run and pass. Report its last lines.
   - `npm run coverage -- --projects=common-utils-string` must run and report coverage. Report its last lines.
4. Commit: `fix(workspace): Run npm test and npm run coverage through Nx, now that the root Jest config cannot load`, a body saying why,
   `Closes #2154`, and the `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>` line. Then
   `scripts/check-in-volume.sh fix/2154-root-test-scripts > ../check-2154.out 2>&1; echo "exit=$?"`, and report the `Successfully ran target`
   or `failed` lines.
5. Only if step 4 is exit 0: `git push -u fork fix/2154-root-test-scripts`, and report the head commit.

No pull request and no comments. Report in `work-lab-leila/reports/` with the full diff, and say "work-lab-leila: finished batch 32".

## Batch 31 (security: #2117, each API image installs only its own packages - the code, the proof, a branch; 23 October 2026, 12:20 PM Central, from `work (security)`)

**Director: work, its security chat** (questions go under **Questions for the director (security)**). **Start after batch 30.**
**Expected: about 60 minutes.** **This is a code job:** you write the change, prove it, and push a branch; the director opens the
pull request from your report. Work from Git Bash.

### Why

[#2117](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2117): every API image installs the production dependencies
of the **whole repository** (about 2,300 packages, the front ends' included). `build.yml` and `publish.yml` copy the root `package.json`
and `package-lock.json` into each `dist/apps/<app>`, and each Dockerfile runs `npm ci`. Today's scan accepts four findings that exist
only because of that (`brace-expansion`, `http-cache-semantics`, `undici`, in the API images). Also, the Dockerfiles say `--omit-dev`, which is
not an npm flag (`--omit=dev` is); it works only because `NODE_ENV=production` is set.

### What I found, so you do not have to

- The four deployed APIs: `gisday-nest`, `geoservices-nest`, `mailroom-nest`, `mailroom-helper-nest`. Leave `ues-operations-nest` alone (CI cannot
  build it). Each builds with `@nx/webpack:webpack` and a `webpack.config.js` that uses `withNx()`, so the executor's options apply. Each
  `project.json` already has `"generatePackageJson": false` in both its `production` and `development` configurations.
- CI builds with `--configuration=production` (`build.yml` line 61/64), then `build.yml` line 85 copies the root package files into `dist/`, and
  `publish.yml`'s step "Copy required image build files" runs `cp package.json package-lock.json apps/${{ matrix.image }}` for **every**
  image, front ends included.
- The Dockerfiles (`apps/<app>/src/Dockerfile`, all four identical) do `COPY ../../../package-lock.json ../../../package.json ./`. In the
  build context (`dist/apps/<app>`) that resolves to the context root.
- **The known risk of `generatePackageJson`:** it lists what the code imports. A package loaded at run time by name is missed. The likely
  ones here: TypeORM's driver (`mssql`), and Nest's `@nestjs/platform-express`. If one is missed, the image fails with
  `Cannot find module` or Nest's "package is missing" message.

### Steps

1. `git fetch origin development`; `git worktree add C:/TAMU/wt-2117 -b chore/2117-api-own-deps origin/development`; `cd C:/TAMU/wt-2117`. Report the commit.
2. **The change:**
   a. In the four `apps/<app>/project.json`: `"generatePackageJson": true` in both `production` and `development`.
   b. In the four Dockerfiles: `COPY package.json package-lock.json ./`, and `RUN npm ci --omit=dev`.
   c. In `.github/workflows/publish.yml`, step "Copy required image build files": copy the root files only into an app that has none of its own.
      For example `[ -f apps/${{ matrix.image }}/package.json ] || cp package.json package-lock.json apps/${{ matrix.image }}`, with a comment
      saying why (#2117). Leave `build.yml` alone.
   Keep files LF.
3. **Build each API for production** in Docker, from the worktree, with its own volume:
   `MSYS_NO_PATHCONV=1 docker run --rm -m 16g -v "C:/TAMU/wt-2117:/w" -v tamu-js-2117-nm:/w/node_modules -w /w node:24.22.1 sh -c "npm ci --no-audit --no-fund --ignore-scripts >/dev/null 2>&1; for a in gisday-nest geoservices-nest mailroom-nest mailroom-helper-nest; do node node_modules/nx/dist/bin/nx.js build \$a --configuration=production --skip-nx-cache > /w/build-\$a.log 2>&1; echo \$a=\$?; done"`
   For each: the exit code, whether `dist/apps/<app>/package.json` **and** `package-lock.json` exist, and the `dependencies` list in that
   `package.json` (names only).
4. **Build and start each image, with no settings:** for each app, `docker build -t local/2117-<app> dist/apps/<app>`, then
   `docker run --rm --name t2117 local/2117-<app>` for up to 20 seconds (`timeout 20`), keeping the log. **With no database or settings the app
   is expected to fail**, but on configuration or a connection, **not** on a missing package. Report each image's size, the number of packages it
   installed (`docker run --rm --entrypoint sh local/2117-<app> -c "ls node_modules | wc -l"`), and the first 15 log lines.
5. **If any image fails on a missing package:** add that package to the app's own dependencies, in a new `apps/<app>/package.json`
   containing only `{ "name": "<app>", "dependencies": { "<package>": "<the root package.json's version range>" } }`. Nx merges a project's own
   `package.json` into the generated one. Rebuild that app (steps 3 and 4) until it starts and fails only on configuration. Report each package
   you added and why.
6. **One real start:** run `gisday-nest`'s image against a throwaway SQL Server, as you did in batch 12 (on 23 October, at 6:03 AM), and
   report `GET /api/seasons/active` (expected 200) and that an unauthenticated write gets 401. Remove the throwaway database afterwards.
7. **The point of it:** Trivy on each new image, against the deployed `:stable` one:
   `MSYS_NO_PATHCONV=1 docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy:0.76.1 image --scanners vuln --severity CRITICAL,HIGH --quiet <image>`
   for `local/2117-<app>` and `ghcr.io/tamugeoinnovation/<app>:stable`. Report the totals for both, side by side, and whether
   `brace-expansion`, `http-cache-semantics` and `undici` are gone.
8. **The pre-push check:** commit (message `chore(workspace): Install only each API's own packages in its image`, a body saying what and why,
   `Closes #2117`, and the `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>` line). Then
   `scripts/check-in-volume.sh chore/2117-api-own-deps > ../check-2117.out 2>&1; echo "exit=$?"` and report its lines with
   `Successfully ran target` or `failed`.
9. **Only if** step 8 is exit 0 and every image in step 4 fails only on configuration: `git push -u fork chore/2117-api-own-deps`, and report the
   head commit. Otherwise do not push, and say what is left.
10. Clean up the images, containers and throwaway database. Leave the worktree for the director.

Do not open a pull request or comment on GitHub. Report in `work-lab-leila/reports/`, with the diff stat and the full diff of the four
`project.json`, one Dockerfile and `publish.yml`, and say "work-lab-leila: finished batch 31".

## Batch 30 (security: #2155, libs/oidc/common retired and Mailer moved - the full check; 23 October 2026, 12:10 PM Central, from `work (security)`)

**Director: work, its security chat** (questions go under **Questions for the director (security)**). **Start now.**
**Expected: about 10 minutes.** From Git Bash, in order. Change nothing.

Deletes `libs/oidc/common`, moves mailroom's `Mailer` to `@tamu-gisc/mailroom/data-api` and two types to `@tamu-gisc/common/types`, and
removes `otplib`, `@nestjs/axios` and `bcrypt`. It sits on top of #2158 (your batch 29).

1. `git fetch fork security/check-2155`. `git rev-parse fork/security/check-2155` must print **`200529d3acd1dd91787500360f89bd1cb5f92d46`**. If not, stop and report it.
2. `git worktree add C:/TAMU/wt-check-2155 fork/security/check-2155 --detach`; `cd C:/TAMU/wt-check-2155`; `git switch -c security/check-2155`.
3. `scripts/check-in-volume.sh security/check-2155 > ../check-2155.out 2>&1; echo "exit=$?"` (full `affected`, clean `npm ci`).
4. Report the exit code, every log line with `Successfully ran target` or `failed`, and each failure's project, target and first error.
   **Quote in full** any error naming `@tamu-gisc/oidc/common`, `Mailer`, `ValidObject`, `AuthOptions`, `otplib`, `@nestjs/axios` or `bcrypt`.
   If the only failure is a test timing out, rerun just that project once.
5. **One extra check, for what this is for:** in the same worktree, with the check's volume or a fresh `npm ci`, build `gisday-angular` for production and
   report whether any file under `libs/oidc` or `libs/mailroom/data-api` appears in its build. Use:
   `MSYS_NO_PATHCONV=1 docker run --rm -m 16g -v "C:/TAMU/wt-check-2155:/w" -v tamu-js-2155-nm:/w/node_modules -w /w node:24.22.1 sh -c "npm ci --no-audit --no-fund --ignore-scripts >/dev/null 2>&1; node node_modules/nx/dist/bin/nx.js build gisday-angular --configuration production --skip-nx-cache > /w/gd-build.log 2>&1; echo build=\$?; grep -rl -E 'nodemailer|oidc-common|mailer.util' dist/apps/gisday-angular | head"`
   Report `build=` and the grep output (expected: none).
6. `cd C:/TAMU`; `git worktree remove C:/TAMU/wt-check-2155 --force`; `git branch -D security/check-2155`.

Nothing else: no pushes, no pull request, no comments. Report in `work-lab-leila/reports/` and say "work-lab-leila: finished batch 30".

## Batch 29 (security: #2158, the retired IdP removed - the full check; 23 October 2026, 12:00 PM Central, from `work (security)`)

**Director: work, its security chat** (questions go under **Questions for the director (security)**). **Start after batch 27.**
**Expected: about 10 minutes.** From Git Bash, in order. Change nothing.

Removes three apps (`oidc-provider-nest`, `oidc-admin-nest`, `oidc-admin-angular`), the libraries `libs/oidc/provider`, `libs/oidc/admin`
and `libs/oidc/ngx`, and ten packages; the lock loses 72 entries and changes no version. It sits on top of PR 2156.

1. `git fetch fork security/check-2158`. `git rev-parse fork/security/check-2158` must print **`3250d965e3cb1140f8547487427090088135afef`**. If not, stop and report it.
2. `git worktree add C:/TAMU/wt-check-2158 fork/security/check-2158 --detach`; `cd C:/TAMU/wt-check-2158`; `git switch -c security/check-2158`.
3. `scripts/check-in-volume.sh security/check-2158 > ../check-2158.out 2>&1; echo "exit=$?"` (full `affected`, clean `npm ci`).
4. Report the exit code, every log line with `Successfully ran target` or `failed`, and each failure's project, target and first error.
   **Quote in full** any error naming `@tamu-gisc/oidc/provider`, `@tamu-gisc/oidc/admin`, `@tamu-gisc/oidc/ngx`, or one of the removed packages
   (`oidc-provider`, `node-jose`, `angular-auth-oidc-client`, `body-parser`, `cookie-parser`, `express-rate-limit`, `helmet`, `yargs`).
   If the only failure is a test timing out, rerun just that project once.
5. `cd C:/TAMU`; `git worktree remove C:/TAMU/wt-check-2158 --force`; `git branch -D security/check-2158`.

Nothing else: no pushes, no pull request, no comments. Report in `work-lab-leila/reports/` and say "work-lab-leila: finished batch 29".

## Batch 28 (gisday: #2133, say that the production gisday-nest image needs AUTH0_MANAGEMENT values locally; 23 October 2026, 12:00 PM Central, from `work (gisday)`)

Run it after batches 26 and 27. A small documentation change, about 20 minutes.
[#2133](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2133) says what and why: it came
from your own report `2026-10-23-1.md`.

**Already seen on `work` today:** the published `gisday-nest:sha-ee1a9e4`, run with `gisday-api.local.env` plus
`AUTH0_MANAGEMENT_DOMAIN=placeholder.invalid`, `AUTH0_MANAGEMENT_CLIENT=placeholder` and
`AUTH0_MANAGEMENT_SECRET=placeholder`, started and answered `/api/seasons/active` with 200.

### What to do

1. Branch `docs/2133-gisday-nest-image-locally` from the latest `origin/development`, in its own worktree.
2. Reproduce both halves with the published image `ghcr.io/tamugeoinnovation/gisday-nest:sha-ee1a9e4`, on a throwaway
   database or none at all (the error comes before the database):
   - with `apps/gisday-nest/local.env.sample` alone it exits with "Management service configuration is missing required
     parameters", even with `AUTH0_MANAGEMENT_DISABLED=true`;
   - with the three placeholders added it gets past that point.
   Put both outputs in the report.
3. In `docs/gisday-local.md`, under "Things that look broken", add one entry: the error, why (only the local build
   reads `AUTH0_MANAGEMENT_DISABLED`; the production configuration requires the three values and makes no network call
   for them), and the three placeholder lines. Link #2133. Match the file's style; LF endings.
4. No code change. Commit, and push to the fork. The check is not needed for a docs-only change; run
   `bash scripts/gisday-local.test.sh` in case it reads the doc.

### Then

Report `work-lab-leila/reports/<date>-<n>.md` with the branch and head commit and the two outputs. Nothing on GitHub;
the director opens the pull request.

---

## Batch 27 (security: #1218, what is out of date - a read-only inventory; 23 October 2026, 11:35 AM Central, from `work (security)`)

**Director: work, its security chat** (questions go under **Questions for the director (security)**). **Start now.**
**Expected: about 20 minutes.** Read-only: it ends in a report. Nothing in the repository changes. From Git Bash, in order.

The maintainer's goal (#1218, his comment of 23 October): every dependency at the latest it can be, once the security queue is
clear. This batch measures how far away that is, so the work can be planned in steps.

1. `git fetch origin development`; `git worktree add C:/TAMU/wt-outdated origin/development --detach`. Report the commit.
2. `MSYS_NO_PATHCONV=1 docker run --rm -m 16g -v "C:/TAMU/wt-outdated:/w" -v tamu-js-outdated-nm:/w/node_modules -w /w node:24.22.1 sh -c "npm ci --no-audit --no-fund --ignore-scripts > /w/ci.log 2>&1; echo ci=\$?; npm outdated --json > /w/outdated.json; echo outdated=\$?"`
   (`npm outdated` exits 1 whenever something is out of date; that is expected.) Report both numbers and the size of `outdated.json`.
3. From `outdated.json`, which lists each package's `current`, `wanted` (the newest its `package.json` range allows) and `latest`:
   a. **Totals:** how many packages; how many have `wanted` newer than `current` (an in-range update); how many have `latest`
      on a **newer major** than `current`.
   b. **A table of every package whose `latest` is a newer major**, sorted by name, with columns: package, current, wanted, latest,
      and **family**: put it in the first of these that matches its name: `@angular/*` or `angular*` → Angular; `@nx/*`, `nx` →
      Nx; `@nestjs/*` → NestJS; `@arcgis/*`, `esri*` → ArcGIS; `typeorm`, `mssql`, `pg` → database; `jest*`, `vitest*`, `@vitest/*`,
      `@testing-library/*`, `playwright`, `@playwright/*` → testing; `eslint*`, `@eslint/*`, `typescript-eslint`, `@typescript-eslint/*`,
      `prettier` → lint; `typescript` → TypeScript; `rxjs`, `zone.js`, `tslib` → runtime; anything else → other.
   c. **Per family:** the count, and the oldest `current` major against the `latest` major (for example "Angular: 22 → 23").
   d. **The ten furthest behind** by number of majors (latest major minus current major), with their family.
4. Node itself: report `node -v` in the image (`node:24.22.1`), and the `engines` field of the root `package.json` if there is one.
5. Do not judge or plan; report the numbers and tables exactly. Clean up: `git worktree remove C:/TAMU/wt-outdated --force`. Leave the volume.

Nothing else: no pushes, no pull request, no comments, no changes. Report in `work-lab-leila/reports/` and say "work-lab-leila: finished batch 27".

## Batch 26 (security: #2122, the first eleven unused dependencies removed, and uuid listed; 23 October 2026, 11:35 AM Central, from `work (security)`)

**Director: work, its security chat** (questions go under **Questions for the director (security)**). **Start now.**
**Expected: about 10 minutes**, a full `affected` check. From Git Bash, in order. Change nothing.

`package.json` loses 11 dependencies nothing references and gains `uuid` (^8.3.2, the version already installed); the lock loses
37 entries and changes no version. It sits on top of PR 2153 (nodemailer 10).

1. `git fetch fork security/check-2122`. `git rev-parse fork/security/check-2122` must print **`cc819f1c565914f37c658f4496ecb8b6b6a6203b`**. If not, stop and report it.
2. `git worktree add C:/TAMU/wt-check-2122 fork/security/check-2122 --detach`; `cd C:/TAMU/wt-check-2122`; `git switch -c security/check-2122`.
3. `scripts/check-in-volume.sh security/check-2122 > ../check-2122.out 2>&1; echo "exit=$?"` (full `affected`, clean `npm ci`).
4. Report the exit code, every log line with `Successfully ran target` or `failed`, and each failure's project, target and first error.
   A failure naming one of the removed packages (`@angular/pwa`, `@nestjs/mapped-types`, `@nestjs/serve-static`, `csurf`, `date-and-time`,
   `document-register-element`, `font-awesome`, `md5`, `mime-types`, `mysql`, `qrcode`) is the important kind: quote it in full.
   If the only failure is a test timing out, rerun just that project once with `scripts/check-in-volume.sh security/check-2122 <project>`.
5. `cd C:/TAMU`; `git worktree remove C:/TAMU/wt-check-2122 --force`; `git branch -D security/check-2122`.

Nothing else: no pushes, no pull request, no comments. Report in `work-lab-leila/reports/` and say "work-lab-leila: finished batch 26".

## Batch 25 (security: #2115 again, after the type fix, and batch 23 resumed with a knip config; 23 October 2026, 11:05 AM Central, from `work (security)`)

**Director: work, its security chat** (questions go under **Questions for the director (security)**). **Start now.**
**Expected: about 25 minutes.** Starting batch 24 while 23 waited was right; thank you. Do these in order, from Git Bash.

**Part A: #2115's check, on the fixed head.**

1. `git fetch fork security/check-2115`. `git rev-parse fork/security/check-2115` must print **`6116951f50c569cb2aec73da84581821dc7f8ffd`**. If not, stop and report it.
2. `git worktree add C:/TAMU/wt-check-2115 fork/security/check-2115 --detach`, then in that folder `git switch -c security/check-2115`.
3. In that folder, `cd` there first (so the clean-up in step 6 is not run from inside it):
   `scripts/check-in-volume.sh security/check-2115 > ../check-2115.out 2>&1; echo "exit=$?"`
   Report the exit code and every log line with `Successfully ran target` or `failed`, and for each failure the project, target and first error.
4. **Only if** the one failure left is the `gisday-platform-data-api` test "answers 413 for an organization logo over the shared
   file-size limit" timing out: run `scripts/check-in-volume.sh security/check-2115 gisday-platform-data-api` once and report its exit
   code. Then run the same for `development`: `scripts/check-in-volume.sh development gisday-platform-data-api`, and report that exit code too.
5. **Not needed again:** the real send passed in batch 24.
6. `cd C:/TAMU`, then `git worktree remove C:/TAMU/wt-check-2115 --force` and `git branch -D security/check-2115`.

**Part B: batch 23, step 3, with a knip configuration of its own.** knip reads the repository's root `jest.config.ts` through its
Jest plugin, and that file fails (`getJestProjects` is gone from `@nx/jest`). The report only needs dependencies, so turn the
Jest plugin off with a configuration file kept **outside** the repository:

7. Write `C:/TAMU/knip-2122.json` containing exactly: `{ "jest": false }`
8. `MSYS_NO_PATHCONV=1 docker run --rm -m 16g -v "C:/TAMU/wt-knip:/w" -v tamu-js-knip-nm:/w/node_modules -v "C:/TAMU/knip-2122.json:/cfg/knip.json:ro" -w /w node:24.22.1 sh -c "npx -y knip@5 --config /cfg/knip.json --include dependencies,devDependencies,unlisted,binaries --no-exit-code --reporter json > /w/knip-report.out 2> /w/knip.err"`
9. If `knip-report.out` is empty, report the first 40 lines of `knip.err` and stop. If knip fails on another config file in the
   same way, add that plugin to the JSON as `"<plugin>": false` (for example `"vitest": false`), say which, and try again, **at most three times**.
10. Then batch 23's steps 4 to 6 as written. Also delete `C:/TAMU/knip-2122.json`.
11. **Worth its own line in the report:** the root `jest.config.ts` calling a function `@nx/jest` no longer has. Say whether anything
    runs that file (`git grep -n "jest.config.ts" -- '*.json' '*.yml' '*.ts' ':!node_modules'`), so the director can file it.

Nothing else: no pushes, no pull request, no comments. Report in `work-lab-leila/reports/` and say "work-lab-leila: finished batch 25".

## Batch 24 (security: #2115, nodemailer 6 to 10: the full check, and a real send; 23 October 2026, 10:50 AM Central, from `work (security)`)

**Director: work, its security chat** (questions go under **Questions for the director (security)**). **Start after batch 23.**
**Expected: about 20 minutes.** Do exactly these steps, in order, from Git Bash. Change nothing in the repository.

1. `git fetch fork security/check-2115`. Then `git rev-parse fork/security/check-2115` must print
   **`42826d479dc3cf3a0093318b1a37265c3c8b7bc7`**. If not, stop and report it.
2. `git worktree add C:/TAMU/wt-check-2115 fork/security/check-2115 --detach`, then in that folder `git switch -c security/check-2115`.
3. In that folder: `scripts/check-in-volume.sh security/check-2115 > ../check-2115.out 2>&1; echo "exit=$?"`. This is the full
   `affected` check. `package.json` changed, so expect nearly every project, and a clean `npm ci`. Report the exit code
   and every log line containing `Successfully ran target` or `failed`; for each failure, the project, the target and
   the first error. **nodemailer 10 ships its own types for the first time**, so a type error in
   `libs/oidc/common/src/lib/utils/email/mailer.util.ts` or `libs/mailroom/common` is possible. Report it exactly; do not fix it.
4. **A real send, with nodemailer 10, to a local mail catcher.** Start Mailpit:
   `docker run -d --name mailpit-2115 -p 18025:8025 -p 11025:1025 axllent/mailpit:v1.27`
5. Install the new nodemailer into a scratch folder and send two messages:
   `mkdir -p C:/TAMU/scratch-2115 && cd C:/TAMU/scratch-2115`
   `MSYS_NO_PATHCONV=1 docker run --rm -v "C:/TAMU/scratch-2115:/s" -w /s node:24.22.1 npm install --no-audit --no-fund nodemailer@10.2.1`
   Then write this file as `C:/TAMU/scratch-2115/send.js`, exactly:

   ```js
   const nodemailer = require('nodemailer');
   // The same safety options mailroom passes to every transport (libs/mailroom/common, SAFE_TRANSPORT_OPTIONS).
   const t = nodemailer.createTransport({ host: process.env.SMTP_HOST, port: 11025, secure: false, ignoreTLS: true,
     disableFileAccess: true, disableUrlAccess: true });
   (async () => {
     const ok = await t.sendMail({ from: 'test@example.com', to: 'someone@example.com', subject: 'nodemailer 10 test', text: 'hello' });
     console.log('PLAIN', ok.messageId, ok.accepted);
     try {
       await t.sendMail({ from: 'test@example.com', to: 'someone@example.com', subject: 'must not send',
         attachments: [{ filename: 'passwd', path: '/etc/passwd' }] });
       console.log('FILE ATTACHMENT SENT - THE BLOCK DID NOT WORK');
     } catch (e) { console.log('FILE ATTACHMENT REFUSED', e.code, e.message); }
   })();
   ```

   Run it: `MSYS_NO_PATHCONV=1 docker run --rm --add-host=host.docker.internal:host-gateway -e SMTP_HOST=host.docker.internal -v "C:/TAMU/scratch-2115:/s" -w /s node:24.22.1 node send.js`
6. Ask Mailpit what arrived: `curl -s http://localhost:18025/api/v1/messages`. Report the whole output of step 5, and from
   step 6 the `total` and each message's `Subject`. **Expected:** `PLAIN` with one accepted address; `FILE ATTACHMENT REFUSED`;
   exactly **one** message in Mailpit, "nodemailer 10 test".
7. Clean up: `docker rm -f mailpit-2115`, delete `C:/TAMU/scratch-2115`, `git worktree remove C:/TAMU/wt-check-2115 --force`,
   `git branch -D security/check-2115`.

Nothing else: no pushes, no pull request, no comments. Report in `work-lab-leila/reports/` and say "work-lab-leila: finished batch 24".

## Batch 23 (security: a knip report for #2122, which dependencies nothing uses; 23 October 2026, 10:25 AM Central; step 3 fixed 10:50 AM, from `work (security)`)

**Resume at step 3**, in the worktree and volume you kept. Steps 1 and 2 stand.

**Director: work, its security chat** (questions go under **Questions for the director (security)**). **Start now.**
**Expected: about 25 minutes.** Read-only: it ends in a report, and nothing in the repository changes.

[#2122](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2122) removes the packages we install
but do not use. Four of the seven remaining high advisories (`oidc-provider`, `@koa/cors`, `node-forge`, `node-jose`) are in
packages that only the oidc apps use, and CI does not build those apps. This report is what the maintainer decides from.
Do exactly these steps, in order, from Git Bash.

1. `git fetch origin development`, then `git worktree add C:/TAMU/wt-knip origin/development --detach`. Report the commit.
2. Install, into a volume of its own:
   `MSYS_NO_PATHCONV=1 docker run --rm -m 16g -v "C:/TAMU/wt-knip:/w" -v tamu-js-knip-nm:/w/node_modules -w /w node:24.22.1 npm ci --no-audit --no-fund --ignore-scripts`
   Report the exit code and the "added N packages" line.
3. Run knip for dependencies only:
   `MSYS_NO_PATHCONV=1 docker run --rm -m 16g -v "C:/TAMU/wt-knip:/w" -v tamu-js-knip-nm:/w/node_modules -w /w node:24.22.1 sh -c "npx -y knip@5 --version; npx -y knip@5 --include dependencies,devDependencies,unlisted,binaries --no-exit-code --reporter json > /w/knip-report.out 2> /w/knip.err"`
   **First delete `C:/TAMU/wt-knip/knip.json`** if it exists: knip reads a file of that name as its configuration, which is
   what stopped the first run (the director's mistake). Report the knip version it printed, and the size of `knip-report.out` and `knip.err`.
   The report is JSON, named `.out` so knip cannot mistake it for configuration. If it is empty, report the
   first 40 lines of `knip.err` and stop there. Do not try other options.
4. From `knip-report.out`, list in the report, as tables: **unused dependencies**, **unused devDependencies**, **unlisted** (imported but
   not in `package.json`), and **unused binaries**. Give each name and the file knip names. Do not judge them; just list them.
5. For each of these packages: `oidc-provider`, `koa`, `@koa/cors`, `node-jose`, `node-forge`, `jsonwebtoken`, `passport-jwt`,
   `coveralls`, `request`, run in the worktree
   `git grep -l -E "(from|require\()\s*['\"]<package>(/|['\"])" -- apps libs tools`
   (with `<package>` replaced by the name) and report, for each one, the projects the files belong to (the folder under
   `apps/` or `libs/`). "None" is an answer.
6. Clean up: `git worktree remove C:/TAMU/wt-knip --force`. Leave the volume.

Nothing else: no pushes, no pull request, no comments, no changes. Report in `work-lab-leila/reports/` and say
"work-lab-leila: finished batch 23".

## Batch 22 (aggiemap: #2134 and #2144, two small code jobs; 23 October 2026, from `work (aggiemap)`) - ALREADY DONE

**Renumbered from 19, and already run - do not run it again.** I queued it as "batch 19" without reading the
top of this file, and 19 was already the security chat's. The lab ran mine at **10:01-10:04** as
"batch 19 (aggiemap)".

**Correction (10:40 AM):** an earlier version of this note said the collision made the lab skip the security
chat's batch 21. **It did not.** Batch 21 ran at 9:51 and passed (`reports/2026-10-23-9.md`); it is being run
again only because its head moved. The duplicate number was real, the skip was not, and I should not have
written a consequence I had not checked.

Kept at its correct number so the sequence reads straight, and marked done so nobody repeats it.



**After the vulnerability work, whenever you are idle.** Both were queued for `codex-home`, which runs on the
`home` machine and cannot be started today. Neither has been begun. **Two separate branches, no pull
requests** - I do the GitHub half.

**You may be on the TAMU AI key for this**, so every step below is written as an exact command. If the
allowance runs out, write `TAMU AI allowance used up at <time, US Central>` at the top of your `STATUS.md`
with the task and step you reached, and stop. Nothing is lost; it resumes from that step.

---

### Task 1 - #2134, quote four shell variables in `publish.yml`

```
cd C:\TAMU\Tamu.GeoInnovation.js.monorepo
git fetch origin
git worktree add -b ci/2134-publish-yml-quoting C:\TAMU\wt-2134 origin/development
```

**Red first.** Run actionlint before changing anything and keep the output:

```
MSYS_NO_PATHCONV=1 docker run --rm -v "C:/TAMU/wt-2134:/repo" -w /repo rhysd/actionlint:1.7.7 .github/workflows/publish.yml
```

Expect **4 SC2086 findings** in the `list-publishable` job, around lines 25, 28, 37 and 38.

**The change**, in `C:\TAMU\wt-2134\.github\workflows\publish.yml` only:

- `echo "exists=true" >> $GITHUB_OUTPUT` becomes `echo "exists=true" >> "$GITHUB_OUTPUT"` (both places)
- `echo $JASON` becomes `echo "$JASON"`
- `echo "matrix=$JASON" >> $GITHUB_OUTPUT` becomes `echo "matrix=$JASON" >> "$GITHUB_OUTPUT"`

**Leave the variable named `JASON`.** It is a misspelling of `JSON`; renaming it is not this change.

**Green after:** the same actionlint command, expecting **exit 0 and no findings**. Keep both outputs.

```
cd C:\TAMU\wt-2134
git add -A
git commit -m "ci(workspace): Quote the shell variables actionlint flags in publish.yml" -m "Closes #2134"
git push -u fork ci/2134-publish-yml-quoting
```

**Do not run `check-in-volume.sh`** - a workflow file is not an Nx project, so it reports `No tasks were run`,
which is not a pass.

**If `publish.yml` has changed under you** and those four lines are already quoted, stop and say so: the
security chat's publish-gate work (#2135) edits this file, and if it has taken these lines the issue is
overtaken rather than done.

---

### Task 2 - #2144, a baseline capture from a worktree silently records no commit

Read [#2144](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2144) first; it has
the mechanism. In short, `tools/visual-baselines/capture.mjs:207` returns `null` when `git rev-parse` fails,
which is what happens in a worktree, and nothing says so.

```
cd C:\TAMU\Tamu.GeoInnovation.js.monorepo
git worktree add -b fix/2144-baseline-commit-from-worktree C:\TAMU\wt-2144 origin/development
```

**Two changes, and the second is the point:**

1. **Find the commit wherever the capture runs.** When `.git` is a file rather than a directory, read its
   `gitdir:` line and use that.
2. **Stop it being silent.** When the commit still cannot be found, the run must say so plainly where it
   prints `release ...`, and the manifest must record *why* rather than only `null`.

**Do not make a missing commit fatal** - a set without a commit is better than no set. **Do not touch the
capture, comparison or output layout.** **Do not take any screenshots for this**: a full set is taken on the
work machine only, because every set lives there.

**Tests**, as `tools/*.test.mjs`, run by `node --test`, no network and no Docker:

- `.git` as a **file** with a `gitdir:` line pointing at a real gitdir - the commit is found;
- `.git` as a **directory** - still works, so the main checkout does not regress;
- the gitdir unreachable - **the loud message is produced** and the manifest says why.

**Prove the third red first**, against the unchanged code, and keep that output. A test for "it tells you"
that was never seen to fail is not evidence that it tells you.

```
MSYS_NO_PATHCONV=1 docker run --rm -m 4g -v "C:/TAMU/wt-2144:/w" -w /w node:24.22.1 node --test "tools/**/*.test.mjs"
cd C:\TAMU\wt-2144
git add -A
git commit -m "fix(visual-baselines): Find the release commit from a worktree, and say when it cannot" -m "Closes #2144"
git push -u fork fix/2144-baseline-commit-from-worktree
```

---

### Report

`work-lab-leila/reports/<date>-<n>.md`: for task 1 the actionlint output before and after; for task 2 the
failing test output, the passing output, and what the run prints when the commit cannot be found.


## Security work is not ours (23 October 2026, 8:35 AM Central, from `work (aggiemap)`)

At the maintainer's decision, **all security and vulnerability work in this repository is directed by a
separate chat**, `js.monorepo - Security - CSA 305 Desktop`. No machine's `TASKS.md` will carry it again.

**What that covers:** #2111 and everything under it, **#2112 to #2120** and **#2135**, Dependabot, CodeQL and
secret-scanning alerts, base-image updates, committed credentials, and any issue whose main purpose is
security.

**Handed over as of now:** **#2119** (the nginx base image - your batch 15 finished it; nothing further is
scheduled) and **#2120** (upload limits). Do not pick either up again.

**If you find a vulnerability while doing something else:** file the issue with every field `CLAUDE.md`
requires, say in your report that it is **for the security chat**, and carry on with your batch. Do not fix
it, and do not wait for an answer.

**`package.json` and `package-lock.json` are shared ground.** A queue of lock changes is in flight
(2125 merged; 2128, 2129, then 2130's reseed). **Do not change either file**, and if a batch ever seems to
require it, say so in your report instead of doing it.


## Decided (23 October 2026, 8:15 AM Central, from `work (aggiemap)`, now the director)

Every outstanding **Questions for the director** in your reports, answered. Nothing here needs you to act
unless a later batch says so.

**Report 2026-10-22-1 (batch 9), tagging `prod-2026-10-22`.** Overtaken: the maintainer tagged it himself
with `--force`, so (a) happened. Your recommendation (c) - allow the failure, re-run, then tag - was the
better reading of the rules, and it is why `tag-build.sh --force` now demands a reason and writes it into the
tag (#2098, merged). The tag that prompted this is the example in its own documentation.

**Report 2026-10-22-2 (batch 10), the refusals.** **(a) and (c), as you recommended**, confirmed by the
maintainer. The check keeps failing rather than retrying inside the test, and the servers are filed:
**#2127** (High) for `arc.ts.tamu.edu`, and a comment on **#2080** for `gis.tamu.edu`. Your batch 11
re-measure is what made that possible - without it this would have been filed as a standing fault during a
day of reboots, or dropped as "the maintenance".

**Report 2026-10-22-3 (batch 11), what to file.** **(b), as you recommended** - two issues, because the two
servers behave differently. #2127 carries your cycle strip and the request times verbatim, because that is
the part their logs can act on.

**Report 2026-10-23-1, the `AUTH0_MANAGEMENT_*` values.** **(b)** - a sentence in `docs/gisday-local.md`.
You are right that the next person hits it. Filed, see below.

**Report 2026-10-23-2, the API images installing every dependency.** **(b), and it is already filed**:
**#2117**. Your measurement - about 2,450 packages per image, and 4 of the 17 runtime advisories coming from
packages no API loads - is the reason it is worth doing, and it is quoted in the seeded acceptance file: 112
of the 262 entries are #2117's.

**Report 2026-10-23-3.**
- **The arrows: (a)**, as you recommended. A security fix does not carry a cosmetic change.
- **`geoservices-nest` has no `ValidationPipe`: (a), as its own issue.** Filed, see below.
- **`multer`/`tar`/`dicer`: its own branch**, because it is a major and `multer` is a direct dependency of
  ours. Filed, see below. Note `@nestjs/platform-express` already carries `multer` 2.4.0, which is the
  strongest argument that our `^1.4.3` is simply stale.

### One thing to keep doing

Three of your reports changed a decision rather than confirming one: batch 11 overturned "it was the
maintenance", batch 10 found the refusals nobody was looking for, and 2026-10-23-2 found that the images
install the front ends' dependencies. Each came from measuring something the batch did not ask for and saying
so plainly. Keep doing that.


## Batch 21 (security: the full pre-push check for #2112's second round; 23 October 2026, updated 10:20 AM Central, from `work (security)`)

**Director: work, its security chat** (questions go under **Questions for the director (security)**). **Start now** (it was skipped after batch 20; the head below is new, so nothing from the old one counts).
**Expected: about 10 minutes**, a full `affected` check.

A lock-only security update (`npm audit fix --package-lock-only`) on top of PR 2129, plus a paragraph in `CLAUDE.md`. Do
exactly these steps, in order, from Git Bash. Change nothing.

1. `git fetch fork security/check-2112b`
2. `git rev-parse fork/security/check-2112b` must print **`b94d3985e9994058d4696f421382ad49a302a028`**. If not, stop and report it.
3. `git worktree add C:/TAMU/wt-check-2112b fork/security/check-2112b --detach`, then in that folder `git switch -c security/check-2112b`
4. In that folder: `scripts/check-in-volume.sh security/check-2112b > ../check-2112b.out 2>&1; echo "exit=$?"`
   The full `affected` check, with a clean `npm ci`. No project list.
5. Report the exit code, and every log line containing `Successfully ran target` or `failed`. For a failed test, its name
   and message. If the only failure is one test in `ui-kits-ngx-forms` (#1898), run
   `scripts/check-in-volume.sh security/check-2112b ui-kits-ngx-forms` once and report that exit code too.
6. `git worktree remove C:/TAMU/wt-check-2112b --force`, then `git branch -D security/check-2112b`.

Nothing else: no pushes, no pull request, no comments. Report in `work-lab-leila/reports/` and say "work-lab-leila: finished batch 21".

## Batch 20 (security: the pre-push check and a scan for #2119, the front ends on the new nginx-base; 23 October 2026, 9:45 AM Central, from `work (security)`)

**Director: work, its security chat** (questions go under **Questions for the director (security)**). **Start now.**
**Expected: about 15 minutes.**

The four front ends' Dockerfiles move from `nginx-base:sha-1a94632` to **`nginx-base:sha-09b7e41`**, the build of
TamuGeoInnovation/nginx-base#1 (nginx 1.30.6, Alpine 3.24.3), plus a release-notes file. Do exactly these steps, in order,
from Git Bash. Change nothing.

1. `git fetch fork fix/2119-nginx-base-1.30`
2. `git rev-parse fork/fix/2119-nginx-base-1.30` must print **`762ad6a745eb1aa9f3aed5ace53417952ea893dd`**. If not, stop and report it.
3. `git worktree add C:/TAMU/wt-check-2119 fork/fix/2119-nginx-base-1.30 --detach`, then in that folder `git switch -c fix/2119-nginx-base-1.30`
4. In that folder: `scripts/check-in-volume.sh fix/2119-nginx-base-1.30 aggiemap-angular,geoservices-angular,gisday-angular,mailroom-angular > ../check-2119.out 2>&1; echo "exit=$?"`
   Report the exit code and every log line containing `Successfully ran target` or `failed`.
5. Scan the new base, the same way as batch 15:
   `docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy:0.76.1 image --scanners vuln --severity CRITICAL,HIGH ghcr.io/tamugeoinnovation/nginx-base:sha-09b7e41`
   Report the totals line(s) and any finding listed.
6. Build **one** front end on it, as in batch 15: from the step-4 production build of `gisday-angular` (`dist/apps/gisday-angular` in the
   volume's clone, or build it again in the worktree if needed), `docker build` an image with its own Dockerfile
   (no edits, it already says `sha-09b7e41`), run it with a dummy value for every `___NAME___`, and report: starts or not,
   placeholders left, `/` and `/some/deep/link?x=1` status codes, and the `Server` header.
7. `git worktree remove C:/TAMU/wt-check-2119 --force`, then `git branch -D fix/2119-nginx-base-1.30` and `git branch -D security/check-2129`
   (both local only). Remove the image you built in step 6.

Nothing else: no pushes, no pull request, no comments. Report in `work-lab-leila/reports/` and say "work-lab-leila: finished batch 20".

## Batch 19 (security: the full pre-push check for 2129, swiper 14 on the new lock; 23 October 2026, 9:25 AM Central, from `work (security)`)

**Director: work, its security chat** (`js.monorepo - Security - CSA 305 Desktop`; questions go under **Questions for the
director (security)**). **Start now.** **Expected: about 25 minutes**, a full `affected` check.

PR 2129 (#2114, swiper 14) changes `package-lock.json`. It has had `development` merged in, which brings PRs 2123, 2125 and
2128, and its lock was regenerated with no change. This check proves the result before the PR branch is updated.

Do exactly these steps, in order, from Git Bash. Do not change anything, and do not improvise.

1. `git fetch fork security/check-2129`
2. `git rev-parse fork/security/check-2129` must print **`1568148d8576abc5e7da32f54bd714e3b8847714`**. If it prints
   anything else, stop and report what it printed.
3. `git worktree add C:/TAMU/wt-check-2129 fork/security/check-2129 --detach`
4. In `C:/TAMU/wt-check-2129`: `git switch -c security/check-2129`
5. In the same folder: `scripts/check-in-volume.sh security/check-2129 > ../check-2129.out 2>&1; echo "exit=$?"`
   This is the full `affected` check, which also runs a clean `npm ci` because the lock changed. Do not add a project list.
6. Report:
   - the exit code;
   - the last 10 lines of `../check-2129.out`;
   - from the log file the script names, each line containing `Successfully ran target` or `failed`;
   - for any failed test, its name and message.
7. **If exactly one test fails and it is in `ui-kits-ngx-forms` (the date-time-picker, known flaky under load, #1898):**
   run `scripts/check-in-volume.sh security/check-2129 ui-kits-ngx-forms` once more and report its exit code too.
   Any other failure: do not retry, just report it.
8. Then `git worktree remove C:/TAMU/wt-check-2129 --force`. Leave the Docker volume.

Nothing else: no pushes, no pull request, no comments, no fixes. Report in `work-lab-leila/reports/` as usual and say
"work-lab-leila: finished batch 19".

## Batch 18 (security: the pre-push check for #2136, the nginx-base pin; 23 October 2026, 9:05 AM Central, from `work (security)`)

**Director: work, its security chat** (`js.monorepo - Security - CSA 305 Desktop`; questions go under **Questions for the
director (security)**). **Start after batch 17.** **Expected: about 15 minutes**, four front-end builds.

[#2136](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2136) pins the four Angular front ends'
Dockerfiles from `nginx-base:latest` to `nginx-base:sha-1a94632`. Both tags have the same digest today
(`sha256:7639ecc9...`), so nothing should change. This is the step before the new base for #2119 can merge.

1. `git fetch fork fix/2136-pin-nginx-base`. The head must be **`f0ce79757`**. If it is anything else, stop and say so.
2. From Git Bash, in a worktree at that head:
   `scripts/check-in-volume.sh fix/2136-pin-nginx-base aggiemap-angular,geoservices-angular,gisday-angular,mailroom-angular`.
   Report its exit code and the log's last lines, per target: lint, test, build.
3. Nothing else: no image builds, no pushes, no pull request, no comments. The director opens the pull request from your report.

Report in `work-lab-leila/reports/` as usual and say "work-lab-leila: finished batch 18".

## Batch 17 (gisday: checks after the `sha-8ee8c6e` release; 23 October 2026, 9:05 AM Central, from `work (gisday)`)

**Director: work, its GIS Day chat** (see `DIRECTOR.md`; questions go under **Questions for the director (gisday)**).
**Expected: about 60 minutes**, most of it the photo sets. Read-only against production: no sign-in, no admin pages, nothing
written anywhere but your machine and this branch.

GIS Day's site and API went to production on both sites as **`sha-8ee8c6e`** on 22 to 23 October (txgisday.org,
gisday.tamu.edu and tamu.txgisday.org in one deployment; gisday.ucgis.org in another). It carries
[#2092](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2092) (show or hide sessions from the admin
Events list), [#2090](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2090) (the Copy page's
"Applying..." state) and [#2103](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2103) (speaker names
keep their g, j, p and y). Work from a worktree at `origin/development` (`8ee8c6e` or later; GIS Day has not changed since).

1. **The GIS Day browser tests against production.** `E2E_BASE_URL=https://txgisday.org npx playwright test test/e2e/gisday`
   in the Playwright container, as `playwright.config.ts` runs them. **Leave out `ucgis-site.spec.ts`**: it rewrites the
   dev server's scripts to make a local build act as UCGIS, which means nothing against a deployed site. Per spec: passed,
   failed, and each failure's message. `presenter-cards.spec.ts` answers the presenters request itself, so it tests the
   deployed stylesheet, which is the point.
2. **The speaker cards on all four addresses**, against real data: run `presenter-cards.spec.ts` with `E2E_BASE_URL` set to
   each of `https://txgisday.org`, `https://gisday.tamu.edu`, `https://tamu.txgisday.org` and `https://gisday.ucgis.org`. It
   must pass on all four. Then, with real data, load each address's `/presenters` and confirm every card is one size (list the
   sizes found; UCGIS's site has presenters since its 22 October pre-load).
3. **The production photo sets for `sha-8ee8c6e`**, with `tools/visual-baselines` (its README): `--app gisday --env production
   --release sha-8ee8c6e` for txgisday.org, then the same with `AGGIEMAP_SMOKE_BASE_URL=https://gisday.tamu.edu` and
   `--release sha-8ee8c6e-gisday.tamu.edu`, and with `https://gisday.ucgis.org` and `--release sha-8ee8c6e-gisday.ucgis.org`.
   Kept on your machine under `visual-baselines`; report the shot counts and any page that failed.
4. **The APIs answer:** `/api/seasons/active` on all four addresses, status and the season's year.

Report in `work-lab-leila/reports/2026-10-23-5.md` and say "work-lab-leila: finished batch 17". **Nothing to post on GitHub**:
the director comments on the issues from your report.

## Batch 16 (workspace: #2118) - Moved to `work` as its batch 24, 7:20 AM Central, 23 October 2026

Do not start it; the work machine has it.

## Batch 15 (workspace: #2119, prove a new nginx-base locally; queued 23 October 2026, 7:15 AM Central, from `home`)

**Start after batch 14.** **Director: home.** **Expected: about 45 minutes.** Heavy (four front-end builds). **Push nothing
to the nginx-base repository**: every push to any of its branches publishes `:latest`, which every front end's next build
takes. Test locally only.

[#2119](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2119) (High): the front ends' base, `ghcr.io/tamugeoinnovation/nginx-base:latest`, is `FROM nginx:1.23.2-alpine`
(Alpine 3.16.3, 4 critical and 27 high OS findings). The candidate is `nginx:1.30.6-alpine` (Alpine 3.24.3, current stable).

1. Clone `TamuGeoInnovation/nginx-base` (public) into a scratch folder, change only its `FROM` to `nginx:1.30.6-alpine`, and
   `docker build` it locally as `nginx-base:candidate`.
2. **Trivy** it (pinned release), critical and high: expect none; list any.
3. For **each front end** with a Dockerfile (`aggiemap-angular`, `gisday-angular`, `geoservices-angular`, `mailroom-angular`):
   a production build from `origin/development`, then `docker build` its image with the Dockerfile's `FROM` pointed at
   `nginx-base:candidate` (a local edit, not committed). Run it with the `ANGULAR_*` settings its deployment uses (the
   names are in the app's `environments/common.config.ts`; dummy values are fine), and check: the container starts; the
   **token substitution ran** (no `___ANGULAR_` placeholder left in `index.html` or the main bundle); `/` and one deep
   link answer 200 with the app's `index.html`; and `nginx -t` passes on the app's `nginx.conf`.
4. Compare with the **current** base: the same checks on one front end built on `nginx-base:latest`, so any difference is
   the base's.
5. The one-line diff for nginx-base's Dockerfile, and a second for its workflow so `:latest` is published only from `master`
   (`latest=${{ github.ref_name == 'master' }}` or the `enable=` form), **as text in your report**, not pushed.

Report in `work-lab-leila/reports/2026-10-23-4.md`; one line on #2119.

## Batch 14 (workspace: #2111, the fixes, as three branches; 23 October 2026, 6:55 AM Central, from `home`)

**Director: home.** Questions under **Questions for the director (home)**. **Expected: about 2 hours in all**, one task at
a time; heavy (installs, checks, a dev server). Nothing else heavy beside it.

**Why:** your batch 13 report, now the plan for [#2111](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2111). The maintainer wants the lab to take work first. **Branches
only, pushed to the fork; no pull requests.** home files an issue for each (it needs the maintainer's priority) and opens
them. Each branch from the latest `origin/development`, its own worktree, one commit per change, `Co-Authored-By` line.

1. **`fix/2111-in-range-security-updates`: every advisory fixable inside the ranges `package.json` already allows.**
   `npm audit fix --package-lock-only` (no `--force`), in `node:24.22.1`. Then check the lock moved only what it should: list
   every package whose version changed, and **undo any change outside the advisories' packages and their own dependencies**.
   Include `postcss-url` 10.1.3 to 10.1.4 (patch) for `minimatch`. **No downgrades** (your report found three `npm audit`
   suggests: `@angular/build`, `@nx/node`, `csurf`; leave those). Then `scripts/check-in-volume.sh <branch>` (full
   `affected`; it runs a clean `npm ci` because the lock changed). Report: before and after `npm audit` counts by severity,
   the changed packages with old and new versions, the check's exit code and what it ran.
2. **`fix/2111-class-validator-0.15`: `class-validator` 0.13.2 to 0.15.1** (critical; every NestJS API). Read its changelog
   from 0.14 and 0.15 for breaking changes, search our DTOs for each changed decorator or option, fix what breaks, and run the
   APIs' unit tests and the full affected check. Then start `gisday-nest` (as you did in batch 12) and post one valid and one
   invalid body to a validated route: the invalid one must still get a 400. Report the breaking changes found and what each
   needed.
   **Also, decided by the maintainer (7:05 AM):** set `forbidUnknownValues: true` and `whitelist: true` on every API's global
   `ValidationPipe` (`apps/*-nest/src/main.ts`), and check with the same two requests plus a body carrying an undeclared
   field (it must be dropped, not stored). If `whitelist` breaks a route that relies on undeclared fields, say which and leave
   `whitelist` off there with a comment, rather than working round it.
3. **`fix/2111-swiper-14`: `swiper` 11.2.10 to 14.3.0** (critical; AggieMap's bonfire and POI popups, and UES). Read the
   migration notes from 12, 13 and 14, update `libs/aggiemap/ngx/popups/.../bonfire` and `.../poi` (and any UES use), run the
   affected check, then on the AggieMap dev server photograph one bonfire popup and one POI popup with a carousel, **before
   (development) and after (the branch)**, desktop and phone, into `docs/screenshots/2111-swiper-14/` on the branch, and add a
   release-notes file in `docs/releases/unreleased/` (`2111-swiper-14.md`, the one-file format) with its What to test on dev
   row. If either popup looks or behaves differently, say how.

**Issues, filed by home (7:00 AM):** task 1 is **#2112**, task 2 **#2113**, task 3 **#2114** (all High). Name the branches
`fix/2112-in-range-security-updates`, `fix/2113-class-validator-0.15` and `fix/2114-swiper-14`, end each commit message
with `Closes #<that issue>`, and name the release-notes file `2114-swiper-14.md` (screenshots in
`docs/screenshots/2114-swiper-14/`).

For each task: push the branch to the fork, put its name and head commit in `STATUS.md`, and post one line on #2111. Report in
`work-lab-leila/reports/2026-10-23-3.md`.

## Batch 13 (workspace: #2111, which advisories reach each deployed app; 23 October 2026, 7:00 AM Central, from `home`)

**Director: home.** Questions under **Questions for the director (home)**. **Expected: about 60 minutes.** Heavy (builds);
nothing else heavy beside it.

**Why:** [#2111](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2111) (High). `npm audit --package-lock-only` on `development` at `35581d0` reports 68 advisories (6 critical, 28 high, 30 moderate, 4 low) across 2,640 packages. Most are probably build tooling; this finds which reach what we deploy. **Change nothing**: no dependency edits, no branches, no pull requests. Report only.

From a worktree at `origin/development` (`35581d0` or later; say which):

1. `npm audit --json --package-lock-only` once, saved, for the advisory list and each one's dependency paths.
2. **For each deployed app**, find what it ships:
   - **NestJS APIs** (`gisday-nest`, `geoservices-nest`, `mailroom-nest`, `mailroom-helper-nest`): `nx build <app>
     --configuration production`; the generated `dist/apps/<app>/package.json` is what the image installs. Resolve it
     against the lock (`npm ls --omit=dev --all` in a copy of that folder with the lock, or by walking the lock).
   - **Angular front ends** (`aggiemap-angular`, `gisday-angular`, `ues-operations-angular`, `mailroom-angular`,
     `geoservices-angular`, and any other app `publish.yml` builds an image for): a production build with
     `--stats-json`, and the packages whose files appear in the bundle.
3. **One table:** every critical and high advisory, by package and advisory title, with a column per deployed app saying
   **runtime** (in its image or bundle), **build-only**, or **absent**, plus the fixed version `npm audit` names and
   whether that is a patch, minor or major bump of what we use. Moderates in a second, shorter table: package, apps
   it reaches at runtime, fix.

Report in `work-lab-leila/reports/2026-10-23-2.md`, and a summary comment on #2111 (counts and the runtime list, no more).

## Batch 12 (workspace: #2107, prove the four API images on Node 24.22.1; 23 October 2026, 6:15 AM Central, from `home`)

**Director: home**, for this batch. Questions go under **Questions for the director (home)**. **Expected: about 25 minutes.**
Heavy while the builds run; nothing else heavy beside it.

**Why:** Node 24.22.0, which every pin in the repository used, has a Brotli decoder flaw with a public remote-code-execution
proof of concept ([#2107](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2107), CVE-2026-111497, Urgent). The four NestJS APIs decompress `Content-Encoding: br` request
bodies (Express 5, body-parser 2.3.0), so they are reachable from any client. The fix moves every pin to 24.22.1.

**Branch:** `fork/fix/2107-node-24.22.1`, head `8e1132afb`. Run from a worktree at that commit.

1. **Build each API's Docker image from its own Dockerfile**, the way `publish.yml` does: for each of `gisday-nest`,
   `geoservices-nest`, `mailroom-nest` and `mailroom-helper-nest`, `nx build <app> --configuration production` in
   `node:24.22.1` (node_modules in a volume), copy `package.json` and `package-lock.json` into `dist/apps/<app>` as
   `publish.yml` does, then `docker build` from that folder. Record each build's exit code.
2. **In each image, run `node -v`** (expect `v24.22.1`), and `node -e "require('zlib').constants.BROTLI_DECODER_ERROR_FORMAT_BLOCK_SWITCH"`
   printing a number (the constant only 24.22.1 exposes).
3. **Start the `gisday-nest` image** against a throwaway SQL Server container restored from
   `apps/gisday-nest/src/database/gisday-local.bak` (as `scripts/gisday-local.sh restore` does), with
   `apps/gisday-nest/local.env.sample` as its settings, and confirm `GET /api/seasons/active` answers 200.
4. **Send it one request with `Content-Encoding: br`** and a body of random bytes (not an exploit, just malformed
   Brotli) to any POST route, and record the status and whether the process stays up. Expect a 4xx and no crash.

Report on [#2107](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2107): each image's build result, `node -v`, the constant, the 200, and the malformed-Brotli result. Then
remove the images and containers you made. **Push no branches and open nothing**; home opens the pull request.

## Batch 11 (aggiemap: #2101, re-measure the paging refusals; 22 October 2026, 3:52 PM Central, from `work (aggiemap)`)

**Expected: about 30 minutes.** Straight after batch 10, same branch.

### Why

Your batch 10 found about **one paged request in ten refused**, on both `gis.tamu.edu` and `arc.ts.tamu.edu`,
one of them with #2080's exact words. I was about to file that against the GIS team as a standing fault.

**The maintainer says they were doing server updates and reboots all day, and that those are now finished.**
Rolling reboots produce exactly this signature: a node out of the pool answering differently from its
neighbours, the same question getting a different answer on the next try. So the measurement may be of the
maintenance rather than of the servers.

**This is the difference between a real fault and a ghost**, and it decides what gets filed and what the GIS
team is asked to chase. Measure it again now the reboots are done.

### What to do

1. **Repeat batch 10's hand measurement exactly**, so the two tables can be put side by side — same layers,
   same four questions, same counts:

   | Layer, question | Batch 10 |
   | --- | --- |
   | `TS_Events/MotorcycleParking/MapServer/0`, no order | 2 of 8 refused |
   | Motorcycle, `orderByFields=OBJECTID` | 2 of 12 refused |
   | `FCOR/TAMU_Basemap_20261008/MapServer/4`, no order | 1 of 10 refused |
   | Basemap 4, `orderByFields=OBJECTID` | 1 of 12 refused |

   **Use at least the same number of attempts, and more if you can** - 20 each would make a rate of about 10%
   much harder to miss by luck. Say exactly how many you ran. One refusal in twenty is a different claim from
   none in eight.

2. **Run `services.spec.ts` against production three times** from the batch 10 branch, and report passed,
   failed and flaky for each, with the layer and message of every failure.

**One more data point, from `work`, and it does not settle anything.** `services.spec.ts` on production
finished at **3:51 PM Central**, about a minute before the maintainer said the reboots were finished: 161
passed, **1 flaky - `TS_Events/MotorcycleParking/MapServer/0` again**, `Pagination request requires either
orderBy field or the layer/table needs to have OID Field to facilitate the request.`, then paged on the
retry. Same layer as yours. That run overlapped the end of the maintenance, so it is evidence of neither
case; yours, run afterwards, is the one that counts.

3. **Say plainly which of these it is**, and do not soften it either way:
   - **No refusals at all** across the hand measurement and three runs: the batch 10 flakes were the
     maintenance, nothing is filed against the GIS team, and that is a good outcome.
   - **The same rate as before**: it is a standing fault, and the issue gets filed with both tables.
   - **Something between**: say the numbers and do not round them into either story.

4. **If a refusal happens, record the exact message and the time (Central)**, so a server-side log can be
   matched to it.

### Then

- Nothing to push but your report: `work-lab-leila/reports/2026-10-22-3.md`. The branch does not change.
- If anything in batch 10's report turns out to have been the maintenance, say so there too - the director
  will carry the correction into the pull request, which is open by then.


## Batch 10 (aggiemap: #2101, a layer that answers short; 22 October 2026, 12:55 PM Central, from `work (aggiemap)`)

**Expected: about 90 minutes.** Nothing else is queued for you. This is a code job that must be proven against
live services, which is why it is yours rather than a development machine's: it ends in a branch and a report,
and `work (aggiemap)` does the GitHub half.

### What this is

[#2101](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2101). A layer that
**refuses** a query already fails the suite — that is the `queryError` check, and it is what went red 22 times
in your batch 9. A layer that **answers short** does not: if a service hands back 1,000 of the 1,524 features
it holds, with no error, the map draws a third fewer markers and everything passes.

**Read the issue before you start, and ignore the "What to build" section in it.** It proposes comparing the
layer view's feature count with the service's, in the view's extent. **That was tried on `work` and it does not
work** — measured against production:

```
/map                       Buildings            370/381    97%
                           Surface Lots         179/181    99%
/parking/sustainable-...   City Bike Lanes       68/667    10%
                           Campus Bike Lanes   1170/3139   37%
```

Those layers are all healthy. A layer view's in-extent count is simply not the service's in-extent count: line
layers are clipped and tiled, and the view holds what it needs at the current level of detail. No tolerance
survives that — one loose enough to pass a healthy layer at 10% can never catch a third of markers missing.
Don't spend time re-deriving this; it is written up for you here so you don't.

### What to build instead

**Ask whether the service can deliver everything it claims.** Service-side, deterministic, no layer view, no
extent, no timing — the same answer every run.

For each ArcGIS layer endpoint the maps use:

1. `returnCountOnly` for the layer's own total, and `maxRecordCount` from its metadata.
2. **If the total is at or below `maxRecordCount`, there is nothing to prove.** Pass.
3. **If the total exceeds it**, request the records past that boundary — `resultOffset=<maxRecordCount>` with
   `resultRecordCount` — and require them to come back. A refusal (`Pagination is not supported.`) or an empty
   answer means **no client can fetch the whole layer**, so the map cannot draw it in full. Fail.

On 22 October that would have failed outright: 1,524 features, `maxRecordCount` 1,000, and the service
answering `Pagination is not supported.` It answers correctly now — `resultOffset=1000` returns the remaining
524 — so **expect this to pass today**. That is fine. Proving it green on a healthy service and red on a
contrived one is the proof we want; see below.

### Where it goes

`test/smoke/aggiemap/services.spec.ts` is the natural home: it already walks every service in `connections.ts`,
asks each one directly with no browser, and has the `allowedServiceFailures` machinery. Follow what is there
rather than inventing a shape — in particular `problemWith()`, which already distinguishes an ArcGIS error
object from an HTTP status.

**Note the layer-endpoint problem and solve it honestly.** Most entries in `connections.ts` are service roots;
the layer index is appended in the definitions (`${connections.tsMainUrl}/6`). So a URL ending in `/<n>` is a
layer and can be asked directly, and a MapServer root is not. Either ask the root for its layers and check each,
or check only the layer endpoints and **say in your report which layers are therefore not covered**. Do not
quietly check five of them and report it as covering the maps.

### How to prove it

- **Red first, against something that really refuses.** You cannot make the live service fail, so build the
  refusal case as a unit-style test of the helper with a stubbed response, or point it at a layer that genuinely
  refuses paging if you find one. Say in the report exactly how you made it fail; "it would fail if..." is not a
  proof.
- **Green on production**, run as the suite runs it, and **report every layer's numbers** — total,
  `maxRecordCount`, and whether paging past it worked. Those numbers are the useful output even if nothing
  fails, because they say which layers are near the boundary.
- `tsc -p test/smoke/aggiemap --noEmit` must exit 0. There is no Nx project for the smoke suite, so
  `check-in-volume.sh` will report `No tasks were run` — that is expected and is not a pass.
- **Watch the runtime.** This adds requests to a spec that runs in every tier. Say how much longer it made the
  services spec; if it is more than a couple of minutes, say so and recommend what to do about it.

### Then

- Branch `task/2101-service-completeness` from the latest `development` (it already carries `featureCountError`
  from #2100 — build on that, don't revert it). Push to your fork. **No pull request** — you have no `gh`.
- Report as `work-lab-leila/reports/2026-10-22-2.md`, with the per-layer numbers, how you proved it red, the
  runtime cost, and anything you could not cover.
- **`heldInExtent` / `serviceInExtent` do not exist and must not be added.** They were written on `work` and
  discarded; the probe is not changing in this batch.


## Still there? (21 October 2026, 2:00 AM Central, from `home (aggiemap)`)

Your last push was 12:05 AM ("#1969 is two lookups racing; unit tests red") and its `Next update by 12:55 AM Central` has passed. If you
are running, push a one-line status with a new `Next update by` time. If you are blocked on an approval prompt, say so in `STATUS.md`
if you can. If nothing is heard by **2:45 AM Central**, batch 7 (#2019) moves to `home`; batch 6 (#1969) stays yours until morning.

## Batch 7 (aggiemap) - Withdrawn at 2:45 AM Central, 21 October 2026

No push since 12:05 AM and no answer to the 2:00 AM "Still there?". **Do not start this batch:** #2019 is being done on `home`.
Batch 6 (#1969) is still yours: if you have work on it, push the branch and a status line when you are back.

## Batch 6 (aggiemap: #1969, the lot-link race - fix it; 20 October 2026, 11:58 PM Central)

**After batch 5** (the release tier and its tag). **Expected: about 60-90 minutes.** The maintainer is asleep; questions go in the
report for `home (aggiemap)`, and nothing waits on him.

**Release notes now:** a pull request adds its own file `docs/releases/unreleased/<issue>-<slug>.md` (see that directory's README on
`development`, #2038) and does **not** edit `unreleased.md`. `docs/testing.md`: change no count (#2002). Read every check's log for
"No tasks were run". **You open the pull request yourself**, ready for review, body from the template, every field you can set;
if `gh` lacks `project` scope, say so in your report and `home (aggiemap)` adds the board fields.

**[#1969](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1969), now High.** Your batch-4 finding is on
the issue: on an event map a `?lot=` link opens the **main map's** lot popup first on nearly every load, and the event map's own
answer replaces it only if it arrives before the map reports `ready`; delay the event map's own service 4 s with `page.route` and it
fails 4 of 4.

1. Branch `fix/1969-lot-link-race` from the latest `origin/development`.
2. **Red first:** a smoke test in `lot-links.spec.ts` (or beside it) that delays the event map's own service with `page.route` and
   expects the event map's own lot; run it against dev (`run-local.sh development one ... --retries=0`) and quote the failure. A unit
   test in `ts-events-ngx` for the lookup order as well, red first.
3. **Fix** in `EventService` (`libs/ts/events/ngx/src/lib/services/event/event.service.ts`, `selectFeatureByFieldMatch` and the
   search-source fallback): a `?lot=` link on an event map waits for the map's own layers and asks them first, and falls back to the
   main map's lot source only if none of them answers. Keep #1952's qualified-field match and #1954's `queryDrawnFeatures` filter.
4. **Green** on a local production build (served as `aggiemap-dev`, `local-production`): the delayed-service test, the whole
   `lot-links.spec.ts`, and `selection.spec.ts`. Then the scoped check `ts-events-ngx,aggiemap-angular`.
5. Images: before (dev, delayed service: the main map's lot) and after; the notes file `docs/releases/unreleased/1969-lot-link-race.md`
   with its What-to-test row. Pull request `Closes #1969`, labels `bug`.

## Start batch 5 now (20 October 2026, 11:36 PM Central): `main-MQDQOFSZ.js` IS `b78942631`

**Azure, read by home: Release-487, build 20261020.40, from `b78942631`, `GIS-1D Development` succeeded.** So the
bundle dev serves now, `main-MQDQOFSZ.js`, is tonight's build. **Start the tier now.**

Why your check could not match: **a deployed bundle's name differs per environment for the same commit** - each stage
substitutes its own Google Analytics id (`G-71VY0QZS5P` on dev, `G-GNS4JMVEZW` on production) and it is baked into the
bundle. A local production build carries production's id, which is why your `8463ac6af` build matched production's
`main-AYJ2SDWT.js` exactly - and why `b78942631`'s local `main-3EFVYPNN.js` will **never** appear on dev (dev's
`8463ac6af` was `main-IORMDVQQ.js`). Compare a bundle only with the same environment's previous one, or read Azure. Stop
the 2-minute wait.

## Batch 5 (20 October 2026, 11:35 PM Central) — the release tier on tonight's dev build

From `home`, which directs again. **Expected: about 15 minutes of tier on this machine, plus the wait for the deploy.**
Write `Next update by HH:MM Central` in your `STATUS.md` and push it before you start, as `DIRECTOR.md` says.

**Decided** (the maintainer, 11:30 PM): he is releasing the build from **`b789426316d1cd4e857849823569b26cc6c1bcf0`**
(`development`'s head) to dev now, and this machine runs its testing. This build is going to production, so it is the
**release** tier, not quick: twenty-six pull requests have merged since `prod-2026-10-20` (`8463ac6af`).

1. **The release tier on dev** (report on: #1935)
   - **Start when Azure lists a release whose build is from `b78942631` with `GIS-1D Development` succeeded, and dev
     serves a `main-*.js` other than `main-IORMDVQQ.js`** (the bundle dev serves now). If you cannot read Azure, the
     bundle change alone is the signal; say which you used. Push `work-lab-leila: started` first.
   - From a checkout at `b78942631`: `test/smoke/aggiemap/run-local.sh development release`. Nothing else heavy beside it.
   - **Expect it clean against dev**: the seven maps `map-layers.spec.ts` fails on production are all fixed in this build.
     Any failure is news: say what failed and why, per test.
   - **Tag only on a clean pass**: `scripts/tag-build.sh dev b789426316d1cd4e857849823569b26cc6c1bcf0`, then
     `git push origin <tag>`. A failure, or a flake you cannot explain, means no tag; report it.
   - No production stage, no approval of anything in Azure. Report the bundle you tested, and the release number.

## Do this now, then ask Dan to restart you (20 October 2026, 9:35 PM Central)

**Pause batch 4 at the next safe point and do this first.** You spent two and a half hours on batch 3 stopped
at approval prompts, and nothing elsewhere could tell. The fix is merged and you do not have it yet.

1. **Get it into your main checkout**, which is where this session reads its settings from:

   ```
   git -C C:/TAMU/Tamu.GeoInnovation.js.monorepo fetch origin
   git -C C:/TAMU/Tamu.GeoInnovation.js.monorepo checkout development
   git -C C:/TAMU/Tamu.GeoInnovation.js.monorepo pull
   ```

2. **Check the file is actually there** and say what you see:

   ```
   git -C C:/TAMU/Tamu.GeoInnovation.js.monorepo show --stat HEAD -- .claude/settings.json
   head -5 C:/TAMU/Tamu.GeoInnovation.js.monorepo/.claude/settings.json
   ```

   It arrived in `2c1651c9b`, "Check in Claude permissions, so a machine is not stopped by prompts"
   ([#2017](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2017)). If it is not
   there, say so plainly rather than carrying on — a restart will not help and Dan needs to know.

3. **Then tell Dan, out loud in your reply, that he should quit and reopen the app on this machine.** He is
   next door and cannot paste commands to you, so say it as a sentence he can act on without typing
   anything. A session does not re-read that file by itself, and until it is restarted you will keep being
   stopped.

4. **After the restart**, carry on with batch 4 from wherever you were - your own `STATUS.md` says where.
   Push a fresh `Next update by HH:MM Central` when you resume.

**Also still owed from the earlier note:** roughly how many prompts you hit during batch 3 and **which
commands**. The allowlist was written from what the batches appear to run, not from evidence, and you are the
only machine that knows. Anything that should be in it will be added; anything that should never have been
auto-approved comes out.

Good work on batch 3 - all three branches came back complete, and the pull requests are being opened now.

## Two things, before your next report (20 October 2026, 9:00 PM Central)

### 1. Say how many approval prompts you hit, and on what

The maintainer could not make progress on this machine earlier for approval popups, and **nothing anywhere
else could tell**: a session stopped at a prompt and a session working quietly on a long build look
identical from outside — no commits either way.

A checked-in allowlist is now on its way ([#2017](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2017),
`.claude/settings.json`), covering git, Docker, this repository's scripts, read-only `gh`, `node`,
`npx tsc`, `python` and file reading — and **denying** what must always stop and ask: `git push origin`,
force pushes, `gh pr merge`, `gh workflow run`, `gh release`, `kubectl`, `az`.

**That list was written from what the batches appear to run, not from evidence.** You are the only machine
that knows what actually prompted. In your next status or report, say roughly how many prompts you hit and
**which commands** — even approximately. A pattern that is missing will be added; one that should never have
been auto-approved will be taken out. Please do not work around a prompt by rephrasing a command to slip
past the rules: say what tripped it.

### 2. Say when you will next be heard from

New rule in `DIRECTOR.md`, [Saying when you will next be heard from](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/blob/development/CLAUDE.md), and it applies from your next batch:

- when you start, write **`Next update by HH:MM Central`** in your `STATUS.md` and **push it before you
  begin the work**;
- move it on when you push progress, remove it when you report;
- if you need longer, push a new one with a line saying why. **Running late is not a failure and saying so
  costs nothing** — a missed deadline with no explanation is the only thing that reads badly.

The point is that a stuck machine cannot report being stuck, so the deadline has to be set before you can
get stuck. A branch watcher was tried for this and was no good: three false alarms in two days and nothing
real caught, because from outside, stuck and busy are the same thing.

**Your batch 3 has no deadline because it predates the rule.** Add one now for whatever is left of it.

## Batch 9 (22 October 2026, 8:05 AM Central) - the release tier against production

Release-490 is live on production, from `36b962a04e55ae379d0d771bfa7e0ee2e831b98d` (`36b962a04`). It
carries everything from Release-489 - the 2026-27 athletics dates, #1969's lot links, Vendor and
Business Parking, the legend symbols, accessible parking on three sports maps, Team Bus Parking, the
retired Live at the Station map, the Football Tailgating kiosk - plus three GIS Day changes.

### Why this run matters more than the usual production tier

**`36b962a04` has never had a release tier.** The tier that cleared this release ran on `61161ce1b`,
the commit before the three GIS Day changes, and is what `dev-2026-10-21` tags. The delta was checked
by reading it rather than by running it: three GIS Day pull requests, whose only shared-code change was
an added barrel export and a CSS variable with an unchanged default, neither reachable from AggieMap.
All three passed Build / Affected and both Azure production builds.

So **this run is the first test of the commit that is actually serving users**, and
`scripts/tag-build.sh prod` is being held until it passes. Do not tag anything yourself.

### What to run

```
test/smoke/aggiemap/run-local.sh production release
```

**`production`, not `development`**, and `release`, not `quick`. Nothing else heavy on the machine.

### What to expect, so a real failure is not lost in the known ones

[#2075](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2075) has been open
since 21 October because production's scheduled run was failing on maps this release fixes. **Those
failures should now be gone**, and the issue closes itself when a GitHub run passes. If any of them is
still failing, that is a finding and not noise: it would mean a fix did not reach production.

**One that will still fail, and should:**
[#2080](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2080) - Accessible
Building Entrances. The service fails about half its queries and caps the rest at 1,000 of 1,524
features. That is the published service, not this release, and it is the GIS team's. Name it in the
report rather than letting it read as new.

### What to report

- Passed, failed, flaky, skipped, the elapsed time, and **every failure named with its map and
  message**.
- The bundle production served, read from the page, and the commit from the handover above.
- Compare with the dev tier on `61161ce1b`: **618 passed, 0 failed, 0 flaky, 44 skipped**. Production
  lists fewer maps than dev, so the totals will not match - say what the shape is, not just the number.
- `#1898` is a known flake.

**Do not tag.** A clean pass means the director tags `prod-2026-10-22`; anything else means it does
not, and we find out why first.

## Read this first (21 October 2026, 8:15 AM Central) — you have been silent for thirteen hours

Your last push was **12:05 AM**, part way through batch 6 (#1969), and your own **12:55 AM deadline passed
unanswered**. That is the rule working as intended: the director checked, asked once, and at 2:45 AM
**withdrew your batch 7 (#2019)** and had it done on home instead, so nothing waited on a machine nobody
could see. **Batch 6 is still yours** — the red unit tests and the "two lookups racing" finding exist only
on your machine, and no branch was pushed.

The maintainer is coming to look at your screen. The likely cause is an approval prompt. **When you come
back:**

1. **Push whatever batch 6 already has** before anything else — the unit tests, a branch, your status. Work
   that exists only on one machine is work nobody else can pick up, which is exactly why batch 7 had to be
   redone from scratch.
2. **Then do batch 8 below, before finishing #1969.** It is on the release path and the season it carries
   starts on 2 November; #1969 is High but nothing waits on it.
3. **Push a fresh `Next update by HH:MM Central` as soon as you start**, and move it on as you go.

---

## The commit is named: Release-489, `61161ce1b` (21 October 2026, 9:58 AM Central)

**Stop the tier you started on Release-488 and restart it on Release-489.** This is the director naming
the commit, which the hold said to wait for.

| | |
| --- | --- |
| **Release** | **489**, build 20261021.16 |
| **Commit** | `61161ce1bb5ea3852bd42d04ee13ebc6543ab630` |
| **Bundle dev serves** | `main-T7LYF72R.js` |

**Release-488 (`67e95b4b1`, `main-YX345P5S.js`) is not going out** — its production stage is cancelled.
It does not contain **#1969's lot-link fix** (PR 2064), which is user-visible on fourteen parking maps, and
that is exactly why the rebuild happened. A tier on 488 clears a build nobody will ship.

Nothing went wrong on your side: home reported 488 at 9:28 and corrected it at 9:53, and you started in
between. Discard the 488 run — do not report its numbers as if they cleared anything — and say in your
report that it was started and abandoned, with why. A run that is quietly dropped is how a wrong number
ends up in release notes later.

Everything else in batch 8 stands:

- `test/smoke/aggiemap/run-local.sh development release`, nothing heavy beside it;
- report passed / failed / flaky / skipped, the elapsed time, **every failure named with its map and
  message**, and both the bundle dev served and the commit;
- last night's tier on the previous build was 613 / 0 / 0 / 44 — a different shape is worth saying loudly;
- `#1898` is a known flake;
- **tag only on a clean pass**: `scripts/tag-build.sh dev 61161ce1bb5ea3852bd42d04ee13ebc6543ab630`, then
  `git push origin <tag>`. Anything failed means no tag — report and stop.

## Hold batch 8 until the director names the commit (21 October 2026, 9:25 AM Central)

**Do not start the tier on whatever dev happens to be serving.** Two builds are in play this morning:
one from `67e95b4b1`, which the maintainer is pushing to dev now, and one from `61161ce1b`, the
current head, which adds #1969's lot-link fix (PR 2064). Batch 8 below names `67e95b4b1` because it was
written before 2064 merged.

**Which of those is going to production is the maintainer's call and is not settled yet.** A release tier
is about thirty minutes and it clears exactly one build; run it against the wrong one and it clears
nothing.

So: **wait for the director to say, in your `TASKS.md`, which commit to test.** Everything else in batch
8 stands - the `release` tier, nothing heavy beside it, tag only on a clean pass, and report the bundle
dev served as well as the commit.

While you wait, nothing heavy. Your batch 6 is finished and PR 2064 is merged.

## Batch 8 (21 October 2026, 8:15 AM Central) — the release tier for today's dev build

**The maintainer is building now, from `67e95b4b1`.** This build is going to production: it carries the
2026-27 athletics dates (**women's basketball starts 2 November**), Vitest 5, NestJS 12, the accessibility
rules, the notices fix, Team Bus Parking (#2059) and GIS Day's phone-width admin pages.

### Wait for the build, and find its commit properly

**Do not start until the build is on dev**, and **do not identify it by bundle name**. Each stage bakes its
own analytics id in, so the same commit produces different bundle hashes on dev and production — a bundle
name cannot tell you which commit an environment is serving. Read Azure instead:

```
python C:\TAMU\logs\az-releases.py
```

(The PAT is in the user environment.) Confirm it reports the release and that its commit is `67e95b4b1`. If
it is a different commit, **say so and stop** — the maintainer may have built something else, and a tier
against the wrong build clears nothing.

### Then run the release tier

```
test/smoke/aggiemap/run-local.sh development release
```

**`release`, not `quick`.** `quick` covers the core plus what changed since the last `dev-*` tag and is for
clearing an ordinary dev build; this one is going to production, which is what `release` is for. About
thirty minutes on your machine; roughly thirty-seven on the work machine.

**Nothing else heavy runs on your machine while it does.** That rule exists because a browser loop beside a
tier once failed nine maps in a run that was deciding a production release.

### What to report

- **Passed, failed, flaky, skipped, and the elapsed time.** Name every failure with its map and its message
  — not just a count.
- **The bundle dev served**, read from the page, *and* the commit Azure reported. Both, because they answer
  different questions.
- Last night's tier on the previous build was **613 passed, 0 failed, 0 flaky, 44 skipped**. A failure that
  is not in that shape is worth saying loudly.
- `#1898` is a known flake; if it appears, say so rather than letting it read as new.

### The tag

**Tag only on a clean pass**, and only if the commit is the one above:

```
scripts/tag-build.sh dev 67e95b4b135d27b17bf6f1482d38760925f39a62
git push origin <tag>
```

A `dev-*` tag is a claim that this build was tested. If anything failed, do not tag — report and stop, and
the director decides.

### Afterwards

Back to batch 6, #1969.

## Correct your own capability list (20 October 2026, 8:45 PM Central)

**Do this before your next report; it takes a minute and it is actively misleading the director.**

Your `STATUS.md` **Cannot** list still says:

- *"no `gh` CLI, so no pull requests, issue comments or GraphQL from here"* — **no longer true.** `gh` is
  installed and you have already used it to file
  [#2015](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2015). **You open your
  own pull requests from now on**, as `home` does.
- *"SSH pushes depend on the maintainer's Git Bash `ssh-agent` staying alive"* — you disproved this in batch
  2 by pushing `check/2026-10-20-three-parking-fixes`. Keep it only if you still think it is a risk, and say
  why; drop it if not.

That section is the first thing the director reads before writing you a batch. While it says you cannot open
pull requests, you will keep being given work that ends in a report — which is the opposite of what
installing `gh` was for.

**When you do open one**, follow `CLAUDE.md` exactly: the issue first with `Closes #N`; the body built
**from `.github/pull_request_template.md`**, not freehand; before and after images committed under
`docs/screenshots/<slug>/` and linked by raw URL pinned to a full commit SHA; an entry in
`docs/releases/unreleased.md` and a row in *What to test on dev*; and every field set — assignee
`danielgoldbergtamu`, the issue's labels, project **Pending Approval**. Check the raw image URLs return 200
before posting; a branch-name URL rots and a `development` one 404s until merge.

**So batch 4 changes slightly:** finish `feat/1975-tailgating-kiosk` and **open its pull request yourself**.
#1969 stays a report — it is an investigation, and there is nothing to open until it has an answer.

### #2015 is yours later, not now

The maintainer has set it **Medium** and **queued** it: two urgent issues the team filed today are in
flight, and the runbook costs an afternoon only when a machine joins. Good issue — it named the gap and
spotted that `python` is described the same way, which is the part that makes it worth doing once properly
rather than patching the one line about `gh`.

Worth you knowing why it matters: **three of today's documentation issues came from you joining** — #2005,
#2009 and #2015. That is not three paper cuts, it is one finding: `CLAUDE_SETUP.md` had never been run by a
machine that was not already set up. You are the only machine that has run it cold, so when that work is
scheduled it will probably come to you.

## Batch 1 (20 October 2026, 5:35 PM Central) — #2008: is Maintenance Parking slow, or is the suite?

**[#2008](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2008)** (filed today).
`/parking/maintenance-parking` fails `map-layers.spec.ts`'s 240-second settle limit when the suite runs with
6 workers, and passes when run alone — twice on 20 October, on two different machines and two different
builds. Nobody knows yet whether the map is slow or the measurement is.

**This is your batch because of the hardware, not in spite of it.** On the testing machine 6 workers is
heavy contention; on 24 CPUs it is not. That difference is the experiment.

### What to run

Against **production** (`https://aggiemap.tamu.edu`), which is serving `prod-2026-10-20` / `8463ac6af`:

1. `test/smoke/aggiemap/run-local.sh production one map-layers.spec.ts --retries=0` — the whole spec, the
   default worker count. Record how long Maintenance Parking took and whether it passed.
2. The same again with `--workers=6`, to match the runs that failed.
3. `run-local.sh production one maintenance-parking --retries=0` — that map alone, as a control.

Record for each: pass or fail, the map's own settle time, the worker count, and what else was running on the
machine (nothing, ideally — see **Nothing heavy beside a run** in `DIRECTOR.md`; this batch is measuring
timing, so a second container ruins it).

### What the answer looks like

- **It passes on 24 CPUs at 6 workers** → the limit is tracking machine load, not the map. The suite is
  wrong to express "too slow" as a fixed wall-clock number that depends on who else is using the CPU. Say so,
  and suggest what it should do instead.
- **It fails here too** → the map really is too slow, and it belongs with
  [#1897](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1897)'s family of maps
  that load every parking space on campus. Say roughly how slow, and whether Service Parking behaves the same.

Either answer is a result. **Don't fix anything** — this batch is a measurement, and which fix is right
depends on which answer you get.

### Also worth a line in your report

Your `STATUS.md` mentions a fix on `fork/docs/aggiemap-dev-server-env` for `CLAUDE_SETUP.md` Phase 5 hanging
without `UV_THREADPOOL_SIZE` and `NX_WORKSPACE_DATA_DIRECTORY`. **That is a real finding and it has no issue
behind it**, which in this repository means the work does not exist. Say in your report what the symptom was,
what the two settings change, and whether it is specific to your machine or would bite anyone — and the
director will file it and open the pull request. Don't open either yourself.

### House rules that will catch you out

- **Times are US Central**, read from PowerShell. `TZ=America/Chicago date` silently returns UTC on these
  machines and labels it `GMT`. `CLAUDE.md` has the conversion.
- **Never pipe `nx` output into `tail`, `head` or `grep`** — the pipeline's exit code hides the task's.
  Redirect to a file, capture the exit code, then filter.
- **A tag is a claim; the bundle hash is the proof.** When you report a run against production, say which
  bundle it served, read from the page — not which tag you expected.

---

## Batch 2 (20 October 2026, 5:50 PM Central) — the three parking fixes, checked **together**

**Do this after batch 1, not beside it.** Batch 1 is a timing measurement; a build running next to it would
make its numbers meaningless. Finish #2008, push the report, then start this.

Three branches are about to become three pull requests. Each one has been checked on its own and each is
green. `CLAUDE.md` asks for one more thing before a batch of pull requests is merged, and **nobody has done
it for these**:

> Before a batch is merged, check all of its PRs merged together: two PRs can each pass CI and still fail
> together.

That is this batch. It matters more than usual here, because these three are not independent: two of them
change **shared libraries** (`maps-esri`, `maps-feature-legend`) and one moves a helper into
`common.definitions.ts`, which other maps import. Separately green, together broken is exactly the shape
this produces.

### The branches, on the fork, already merged with the latest `development`

| Branch | Head | Closes |
| --- | --- | --- |
| `fix/1991-vendor-parking-lots` | `155f074a1` | #1991 |
| `fix/1992-accessible-parking-sports-maps` | `248ef407e` | #1992, #1993 |
| `fix/1992-legend-multi-value-class` | `e5a66b132` | #2004 |

Use those exact commits. Documentation and screenshot commits may be added on top while you work — they do
not change any code, so do not re-fetch chasing a moving head.

### What to do

1. **Merge all three onto the latest `origin/development`**, in a worktree of its own, in the order above.
   Report any conflict and what it was in, even if it is trivial to resolve — a conflict between two fixes is
   itself a finding, and the director needs to know before deciding merge order.
2. **Push that combined branch to the fork** as `check/2026-10-20-three-parking-fixes`. This is deliberate:
   your `STATUS.md` says SSH pushes depend on the maintainer's `ssh-agent` staying alive, and it is better to
   discover that on a throwaway branch than on work somebody is waiting for. **If the push fails, say so in
   your report with the exact error and carry on** — the rest of the batch does not need it.
3. **Run the full affected check** on the combined branch:
   `scripts/check-in-volume.sh check/2026-10-20-three-parking-fixes`. Not a narrow project list: two shared
   libraries change, so the point is everything they affect. Report the exit code and the per-target counts
   (`Successfully ran target lint for N projects`), not just "passed".
4. **Build it for production and run `map-layers.spec.ts` against that build**, the way home did for each
   branch alone. The four maps the three fixes touch — `/parking/vendor-parking`,
   `/events/womens-basketball`, `/parking/indoor-track-parking`, `/parking/softball-parking` — must all pass,
   **and so must the other 60-odd**. A fix to a shared legend library that fixes four maps and quietly breaks
   a fifth is the thing this batch exists to catch.
   Expect `/parking/maintenance-parking` to be the one known failure, which is batch 1's subject.

### What a good report says

- The exit code and counts for the check, and whether anything conflicted when merging the three.
- `map-layers.spec.ts` on the combined build: passed, failed, skipped, and **every failure named with its
  map**, compared against home's result for the same spec on its own combined build: **57 passed, 12 skipped,
  1 failed** (Maintenance Parking).
- Whether the push worked.
- Anything that passed alone for home and fails here, which is the whole point.

**Don't fix anything, don't open anything.** If something fails together that passed apart, that is the
result — report it and stop. The director decides what happens next.

---

## Batch 3 (20 October 2026, 6:25 PM Central) — the before and after images for the three parking fixes

Both of your reports were exactly what a report should be, and batch 2 found something neither of the other
two machines did: that `fix/1991` fails `ts-events-ngx:test` **on its own**, not only merged. Home had the
information and recorded it as a merge-order note; you read the file across all three branches and drew the
right conclusion. That commit is now on the branch.

This batch plays to the same strength: you have the dev server and the CPU, and you cannot open pull
requests. So **you take the images and write the notes; this machine opens the three pull requests.**

### Branch heads to use

| Branch | Head | Closes |
| --- | --- | --- |
| `fix/1991-vendor-parking-lots` | **`9979ff57d`** (has the snapshot commit — re-fetch) | #1991 |
| `fix/1992-accessible-parking-sports-maps` | `248ef407e` | #1992, #1993 |
| `fix/1992-legend-multi-value-class` | `e5a66b132` | #2004 |

### The images

**Take every "before" from production** (`https://aggiemap.tamu.edu`), which still carries all four faults
and will until the next production deploy. **Record the bundle hash you saw**, as you did in batch 1 — a
"before" nobody can date is worth very little. Take every "after" from a local production build of that
branch. Same viewport for both — 1440x900 — or the pair cannot be compared.

Commit each into `docs/screenshots/<slug>/` **on its own branch**:

| Branch | Slug | Shots |
| --- | --- | --- |
| `fix/1991` | `1991-vendor-parking-lots` | Before: a lot clicked, showing the **wrong** popup (the campus "Lot 050" one), and the legend. After: both layers drawn and listed, and a lot's **vendor-notes** popup |
| `fix/1992` | `1992-accessible-parking-sports-maps` | Before and after on **both** maps: Women's Basketball and Indoor Track — the wheelchair markers and the legend entry, plus Indoor Track's magenta Team Bus Parking area |
| `fix/2004` branch | `2004-legend-multi-value-class` | Softball's legend, before (the Accessible Parking Spaces entry empty) and after |

The #1991 pair is the important one and the easiest to get wrong: **the lots look right on production**,
because a hidden map-image layer has drawn them server-side since February. The fault is that they cannot be
clicked. So a plain screenshot of each map proves nothing — the before must show the wrong popup open.

### The notes and the test rows

Home drafted both in its report 9; use that text. On each branch add to `docs/releases/unreleased.md`:

- its entry under `## Summary`, above the GIS Day entries, with the two images linked as
  `../screenshots/<slug>/<file>.png`;
- its row in **What to test on dev**, at the top of that table.

**`docs/testing.md`: add no row and change no number, including the Total.** That rule landed today as
[#2002](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2002) — three pull
requests conflicted on that one line in an afternoon, the check never reads the counts, and they are
refreshed at release from a measured run. None of these three adds a spec anyway.

### Then

Push all three branches and say **"branches ready for PRs"** with each head. Name, for each one, the exact
image files you committed and the bundle you photographed production at. This machine opens the three pull
requests from there.

**Don't open anything, don't merge anything, and don't re-run the checks** — batch 2 already proved these
three together, and the only code change since is the snapshot commit you identified.

### One thing to watch

Your batch 2 build was `nx serve --configuration=production`, which is the dev server with production
settings rather than the deployed artefact — you said so, which was right. For screenshots that distinction
matters more than it did for the test run, because the sidebar and gating differ between a dev host and a
production one. Serve the **built output** (`nx build` then a static server with an SPA fallback), or use
`local-production` so `127.0.0.1` is treated as production. Say which you did.

---

## Batch 4 (20 October 2026, 8:25 PM Central) — #1975's kiosk map, and #1969's intermittent race

**After batch 3.** Two jobs, both chosen because they end in something you can produce: a branch and a
report. **You still cannot open pull requests** - no `gh` - so both come back to the director, who opens
them. `home` opens its own from now on; you do not.

### 1. #1975 — the Football Tailgating kiosk map

**[#1975](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1975).** A branch has
been sitting ready since this morning and never got its images: `feat/1975-tailgating-kiosk` (`9bfb6a3e9` on
the fork), written by `home`. It needs finishing, not writing:

1. Fetch it, merge the latest `development` (it is a day behind and several things have merged), resolve
   anything that conflicts and **say what conflicted** - a conflict between this and the day's parking work
   would be worth knowing about.
2. Run the check. Say which projects and the per-target counts, not just the exit code.
3. **Images.** It is a new map, so "before" is not a picture of the same page - there is nothing there yet.
   Take the after shots that show what it adds: the kiosk as it opens, and whatever the issue says it must
   show. If a meaningful before exists (for example the ordinary Football Tailgating map beside it), take
   that too and say what the pair is showing. Commit to `docs/screenshots/1975-tailgating-kiosk/`.
4. The `unreleased.md` entry and the *What to test on dev* row, as you did in batch 3.
5. **`docs/testing.md`: add a row only if you add a spec**, and change no number either way ([#2002](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2002)).

The kiosk maps have a spec already (`kiosk.spec.ts`, from #1392): a kiosk opened by direct link draws its
locations, has no sidebar, and holds none of the main map's layers. If this map should be covered by it and
is not, that is worth saying - and it is the kind of gap that let #1981 and #1987 reach production.

### 2. #1969 — a `?lot=` link opening the wrong map's feature, intermittently

**[#1969](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1969).** Seen twice,
on two different maps, on two different runs, always passing on retry: `?lot=100j` on Visitor Parking opened
the **main map's** Lot 100j on the first attempt, and the same symptom appeared on Motorcycle Parking. The
hypothesis in the issue is a race - before the event map's layers have loaded, the lookup falls through to
the main map's parking-lot search source and matches there first.

**This is yours because it is intermittent and you have 24 CPUs.** On the testing machine it appears once in
a while and cannot be studied. Here you can run `lot-links.spec.ts` many times over, and vary the thing the
hypothesis names - how loaded the machine is, and therefore how long the event map's layers take.

What is wanted is **an answer, not a fix**: does it reproduce, how often, and does load change the rate? If
you can make it happen reliably, say exactly how - that is what lets someone write a red-first test. If it
will not reproduce at all on 24 CPUs, that is also an answer and it points at the same cause.

**Do not fix it in this batch.** The fix depends on what you find, and a fix without a reproduction cannot
be shown to work.

### When you are done

Say **"branch ready: feat/1975-tailgating-kiosk"** with its head, and report #1969 separately. Name the
production bundle for anything you ran against production.
