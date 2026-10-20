# Home machine: current tasks

Written by the work session **only while another machine directs** (see `DIRECTOR.md`). The home session does each new batch here,
as `DIRECTOR.md` says for a listener. Development work: branches, agents, pull requests.

## Batch 10 (20 October 2026, 10:45 AM Central) — #1986, the per-map check the maintainer asked for

**Do this after batch 9.** Batch 9 is the fix; this is the check that stops it, #1981 and #1987 all coming
back. The maintainer asked for it twice, in his own words:

> we need to add some tests for each map that the layers that it is supposed to draw based on the definition
> for the map are in fact listed and do in fact draw

> We need to check each of the maps to make sure that the legends show for the layers that are turned on.
> Again, not sure how this is sneaking through, but we need to update our tests so that we cannot release
> without legends showing again.

### Don't touch

- **`chore/1974-nestjs-11`** — the work machine has taken over its conflict with Nx 23.3 (PR 1984 merged) and
  is rebuilding the lock file. Do not push to it.
- **`fix/1981-business-parking-lots`** — PR 1989, the work machine's.

### What the check has to cover, for every map

Three things, because the three faults we have each slipped past a different one:

1. **Every layer the definition declares is listed** in the sidebar. (Nothing has broken this yet; it is the
   cheapest of the three and it is what the maintainer asked for first.)
2. **A layer that is switched on draws something.** #1981: both lot layers loaded, answered every query and
   held 73 and 6 lots, and drew none, because the service's renderer had no symbol for them.
   `drawn-symbols.spec.ts`, on #1981's branch, does this for one map — generalise it.
3. **A layer that is switched on has a legend entry with a symbol in it.** #1987: the entries were there with
   their names, and empty.

### How to get the declared layers

**Do not import the definitions into the Playwright process.** `global-setup.ts` already records why: it pulls
the Angular dependency graph in, which fails first on the JIT compiler and then on bundler-only module
resolution. Two ways that do work, and the first is likely better:

- **A build-time step** that writes the declared layers per route to a generated JSON file, the way
  `map-manifest.generated.json` is already produced, and the spec reads that file.
- **Read it from the running app** through the probe or the DOM, which is what the suite does today. This
  checks "listed and drawn and in the legend" but cannot catch a layer the definition declares that never
  reaches the sidebar at all — point 1 above.

Say which you chose and why.

### Prove it red before the fixes land

This is the part with a deadline. **#1987 is still live on production and #1981's fix is not deployed yet**,
so production currently carries two real faults for this check to find. Once they ship, proving the check
would mean reconstructing the broken state by hand. So: **run it against production and record what it says,
before anything merges.** If the work machine has to run it, say so in your report and it will.

The work machine already has a DOM-level legend scan written for exactly this
(`.layer-item.visible`, `.collection-group-title-text`, `.collection-group-content`,
`tamu-gisc-legend-element`, a row counting only if it holds an `img`, `canvas`, `svg` or a background image).
Ask for it in your report rather than writing it again.

### The rest

One branch, `test/1986-every-map-draws-and-legends`, from the latest `development`. `Closes #1986`. A row in
`docs/testing.md` with the count, as `drawn-symbols.spec.ts` has. **No pull request**: say "branch ready" and
the work machine opens it.

If this turns out to be more than one batch of work, do the legend half first — that is the one with a live
fault to prove it against — and say so.

## Batch 9 (20 October 2026, 12:10 PM Central) — #1987, and you already found its cause

**This machine is idle and #1987 is High and untouched.** Batch 8 was pushed at 10:40 AM and your `STATUS.md`
never mentions it, so it was missed — not a fault, but it is the work to do now. **Batch 9 replaces batch 8;
ignore batch 8.**

### #1988 is the cause of #1987 — you found it without connecting the two

**[#1987](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1987)** (High, `critical`):
Freshman Selectable Parking's layers draw and are listed, and the legend shows their names with **no symbols**.
Production console:

```
Error querying layer for legend item: {label: Resident Student Priority,   value: 1,1, ...}
Error querying layer for legend item: {label: Freshman Student Selectable, value: 0,1, ...}
```

**[#1988](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1988)** (Medium), which you
filed while finding #1981's cause, says `_buildLegendWhereClause` quotes every value, so a numeric field is
compared as a string and the server rejects it — and you wrote: *"#1981's fix gives those two layers simple
renderers, so Business Parking no longer reaches this code, **but any other unique-value renderer on a numeric
field does**."*

The freshman map's values are `1,1` and `0,1` — **numeric fields**. That is the same code path. So **#1988's fix
is #1987's fix**, and one branch should close both.

### What to do

1. Fix `_buildLegendWhereClause` so a numeric field is compared as a number. Be careful what counts as numeric —
   take it from the layer's field types, not from whether the value looks like a digit, or a string code such as
   `'09400'` will be unquoted and break.
2. **A test proven red first** against production or a build that reproduces it, on a unique-value renderer over a
   numeric field. Say what it printed.
3. One branch, `fix/1988-legend-numeric-where`, from the latest `development`. In the pull request body, close
   **both**: `Closes #1988` and `Closes #1987` — the maintainer's rule allows a closing keyword only for issues
   the change really closes, and this closes both.
4. **No pull request, no screenshots** — work takes the before and after on the freshman map and opens it.

### Afterwards

#1974's second half, then #1973 once #1972 (PR 1984) is merged, as you had planned.

## Batch 8 (20 October 2026, 10:40 AM Central) — #1987, straight after #1981

**The maintainer, just now:** #1987 is **High** and this machine takes it **next, after #1981**. Batch 6 stays
parked until both are out.

**[#1987](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1987): Freshman Selectable
Parking's legend shows no symbols.** Both layers are on, both **draw**, both are listed under Layers — and the
Legend shows their two names with no symbols at all, so nothing says what red and blue mean. Live on production.

### Read this before starting: it is probably the same bug as #1981

Production's console on the freshman map:

```
Error querying layer for legend item: {label: Resident Student Priority,   value: 1,1, ...}
Error querying layer for legend item: {label: Freshman Student Selectable, value: 0,1, ...}
```

and on Business Parking:

```
Error querying layer for legend item: {label: UB Permit and UB+ Permit Authorized, value: 1,Street, 1,Surface, 1,Surface Visitor, ...}
```

Same message, same code path. **Look at `value`:** `1,1`, `0,1`, `1,Street`, `1,Garage` are each a comma-joined
tuple of two field values — what a `UniqueValueRenderer` with **more than one field** produces. The legend's
per-item query looks unable to turn a composite value back into a valid `where` clause.

**If that holds, it predicts the affected set:** any map with a multi-field unique-value renderer, and only those.
It would also explain why this was never noticed — most maps use a single-field renderer.

**Prove or discard it; two samples is a hypothesis, not a cause.**

### The difference that may matter

On the freshman map the layers **draw** and only the legend is empty. On Business Parking the lot layers **do not
draw at all**. One fault may produce both, or they may be two bugs sharing a message. **If #1981's fix also fixes
this, say so and do not write a second fix** — close both from one branch and say that in the report.

### What to do

1. Cause first, with evidence, before any fix.
2. A test proven red first, on a map with a multi-field unique-value renderer. Say what it printed.
3. Branch `fix/1987-legend-multi-field-renderer` from the latest `development`, unless it is one branch with
   #1981, in which case say so.
4. **No pull request, no screenshots** — this is visible, so the work machine captures before and after and opens
   the PR. Say "branch ready".

### Not yours

[#1986](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1986) is now **High** and
covers the test gap behind both: every map, every declared layer **listed**, **drawing**, and **in the legend**.
It must be proven red **against production before these fixes land**, because Business Parking and the freshman
map are the only two live examples. The director will place it.

## Batch 7 (20 October 2026, 10:10 AM Central) — URGENT: #1981, the Business Parking map

**Stop everything else and do this first** (the maintainer, just now). **Batch 6 is paused**, including the
production release tier: park it where it is and come back to it when #1981 is fixed and out. Park #1974 too.

**[#1981](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1981), labelled `critical`:
the Business Parking map draws its UB spaces but not its two lot layers.** It should show the spaces *and* the
lots in maroon and pink. It is live on production now.

### What the work machine already established — don't redo it

**The service is healthy. This is ours.** Every definition expression in `business-parking.definitions.ts`
returns data, asked of `TS_Events/BusinessParking/MapServer` directly:

| Layer in the definition | Query | Rows |
| --- | --- | --- |
| UB 2 Hour Spaces, layer 0 | `Spc_Type = 'UB'` | **58** |
| UB and UB+ Authorized, layer 1 | `UB_Lot = 1 AND LotType IN ('Street','Surface','Surface Visitor')` | **90** |
| Only UB+ Authorized, layer 1 | `UB_Lot = 1 AND LotType IN ('Garage','Garage Visitor')` | **7** |

The service has exactly two layers: `0 Marked Business Spaces`, `1 University Business Parking Lots`. Split
apart, `UB_Lot = 1` alone returns 97 and each `LotType` list returns its 90 and 7. So the data is there and the
filters are right.

**Production's console names the two missing layers, in the legend code:**

```
Error querying layer for legend item: {label: UB Permit and UB+ Permit Authorized,
  value: 1,Street, 1,Surface, 1,Surface Visitor, symbol: SimpleFillSymbol, preview: div}
Error querying layer for legend item: {label: Only UB+ Permit Authorized,
  value: 1,Garage, 1,Garage Visitor, symbol: SimpleFillSymbol, preview: div}
```

plus a `404` on some resource. Note the `value:` — the definition expression is being taken apart into a list of
values, which is the shape of a legend or renderer lookup, not of a layer failing to load.

**A hypothesis, not a conclusion:** these two layers are the only ones on this map that **share a service layer
URL** (`/1`) and are distinguished only by their `definitionExpression`. Something that keys off the URL — the
legend's per-layer query, or the renderer lookup — may be collapsing them or failing on the pair. Prove or discard
it; don't assume it.

**Likely suspects by date:** PR 1950 (`<arcgis-map>`, rehosts every map) and the recent legend work (#1939, the
layer-order fix; #1857, the legend listing). Check whether an older build draws the lots before blaming any of
them — that is the fastest way to localise it.

### What to do

1. **Find the cause and say what it is**, with evidence, before writing a fix.
2. **A test proven red first**, as always. Say what it printed when it failed.
3. Branch `fix/1981-business-parking-lots`, from the latest `development`. Report on #1981.
4. **No pull request and no screenshots** — this map is visible, so the work machine captures the before and after
   and opens the PR, as for #1960 and #1954. Say "branch ready" and the work machine takes it.
5. If the cause turns out to be PR 1950 and the fix is not quick, **say so immediately** rather than working on:
   that is a revert decision for the maintainer, and it is already on production.

### After it is out

A second issue follows for the gap that let this through: **every map should have a check that the layers its
definition says it draws are listed and do in fact draw**. The work machine is filing it; it is not this batch.

## Batch 6 (20 October 2026, 9:20 AM Central) — the release tier against production, on this machine

**Decided** (the maintainer, this morning):

- **The release tier against production moves to home.** The work machine has the GIS Day session's
  `nx build gisday-angular` running in `C:\TAMU\wt-1976` at about 400% CPU, and the maintainer wants that machine
  usable. Nothing about this run is work-machine-only: only **visual-baselines screenshots** are, and this is not
  that.
- **Your question 1: yes.** #1972's pull request is opened before #1974's and merged first, so #1973 is unblocked.
  The director opens it; you do not need to.
- **#1978 is High, #1979 is Medium**, both now on the board.

1. **The release tier against production** (report on: #1935)
   - **Park #1974 first.** This runs on a quiet machine or not at all: **nothing else heavy on home while it runs**,
     no build, no check, no agent. A tier spoiled by contention cost a whole run on 19 October, and this one says
     whether production is healthy after the promotion.
   - `test/smoke/aggiemap/run-local.sh production release`, from a checkout at **`8463ac6af`**, which is what
     production serves (`prod-2026-10-20`).
   - **Confirm production first**, and do it this way, because the obvious check is wrong: production serves
     `main-AYJ2SDWT.js` while dev serves `main-IORMDVQQ.js` **for the same commit** — the Google Analytics id is
     substituted per stage (`G-GNS4JMVEZW` against `G-71VY0QZS5P`) and is baked into the bundle. So compare a
     bundle with **the same environment's** previous one, never across environments. What to check: the
     `prod-2026-10-20` tag resolves to `8463ac6af`, and production's bundle is no longer `main-TK2R62YY.js`.
   - **Expect about 537 tests**, not dev's 576: the suite hides development-only features on a production host.
   - The work machine reached **260 of 537 with nothing failing** before the maintainer stopped it for resources.
     That is **not a result** and is not to be carried over or added to yours — start from scratch and report only
     what your own run produces.
   - Report per failure what failed and why, and **say plainly whether production is healthy**. No Azure actions,
     no promotion, no approval.
   - Push `work`-style started and finished lines to `home/STATUS.md` as usual.

2. **Then carry on with #1974's second half**, and #1973 once #1972 is on `development`.

3. **Open the pull requests for your two branches that need no images** (the maintainer, 9:40 AM: the work machine
   keeps only what needs screenshots stored on it).
   - **#1972 first** — `chore/1972-nx-23-3` (`1ad923945`). Your `.pr-body.md` is drafted in `C:\TAMU\wt-1972`;
     build the body **from `.github/pull_request_template.md`**, not fresh, apply the `no-visible-change` label
     with the reason written out, and put it on the board at Pending Approval. Merging is the maintainer's.
   - **Then #1974's first half** — `chore/1974-nestjs-11` (`db2f1f339`), the same way. Its closing line was
     waiting on question 1, which is now answered: #1972 merges first.
   - Check with `gh pr view <n> --json closingIssuesReferences` a few minutes **after** opening, not immediately:
     GitHub fills that in asynchronously and an early empty reading means nothing.
   - These are light, so they can be done before or after the tier; the tier is the thing that needs the machine
     quiet.

**Not yours:** the production screenshot set keyed `prod-2026-10-20` stays on the work machine, as does #1970's
and #1975's before/after imagery, **and their pull requests**, which carry those images.

## Batch 5 (20 October 2026, 7:40 AM Central) — the tailgating kiosk, then the upgrades

Written by home as director just before handing over to work, so home has its day's work. **Decided** (the maintainer,
this morning): #1975 is Medium; #1972 Low, #1973 Medium, #1974 Medium; **#1974 goes ahead although GIS Day is out of
scope**, because its servers share the packages: full check of every project, GIS Day's included (his 4A).

1. **#1975: a kiosk map for Football Tailgating** - already running here (an agent, worktree `C:\TAMU\wt-1975`, branch
   `feat/1975-tailgating-kiosk`). Report the branch, the kiosk's path, and its judgement calls (layers, opening view,
   game-day notice) as Questions for the director. No PR, no screenshots: work takes them and opens it.
2. **#1972: Nx 23.2 to 23.3.** Branch `chore/1972-nx-23-3` from the latest `development`. This PR also adds #1972, #1973,
   #1974 and #1918 to the modernization path table in `docs/releases/unreleased.md`, and brings its stale ArcGIS row up to
   date (5.1.27 on production since `prod-2026-10-20`; `<arcgis-map>` with #1949). Full check, clean `npm ci`. Branch ready, no PR.
3. **#1973: Vitest 4 to 5.** Same rules; same test count per project before and after; time the suite before and after.
4. **#1974: NestJS 10 to 11, then 11 to 12**, one branch each, full check of every project each time.
   Only 2 after 1 is pushed, and so on: one upgrade at a time, so their lock files don't collide.

## Batch 4 (19 October 2026, 3:05 PM Central) — #1960, wanted today, then the #1954 merge

**Decided** (the maintainer, this afternoon): **#1960 is High and goes out today.** He also merged **PR 1958**
(#1952), so `development` has moved; **1959** (#1953) is open with its conflict resolved here, and **1950** is held
until today's release ships.

Take **task 1 first** — it is the one with a deadline.

1. **#1960: draw lactation rooms from the new hosted service, and show what it adds**
   - The GIS team (Eric Irwin) published a replacement and asks us to repoint:

     | | |
     | --- | --- |
     | Today | `${connections.inforUrl}/2` = `FCOR/MapInfo_20190529/MapServer/2` |
     | New | `Hosted/Lactation_Spaces_view/FeatureServer/0` |

     Add the new one to `connections.ts` beside the others rather than hard-coding it in the definition;
     `inforUrl` stays, because layers 0, 1, 3 and 4 of that service are still in use.

   - **Added 3:30 PM, and it changes the URL you write.** The new service exists **only on the production GIS
     host**. Checked from here:

     ```
     gis-dev.it.tamu.edu/.../FCOR/MapInfo_20190529/MapServer/2    404 Layer not found
     gis-dev.it.tamu.edu/.../Hosted/Lactation_Spaces_view/...     404 Service not found
     gis.tamu.edu/.../Hosted/Lactation_Spaces_view/FeatureServer/0   OK, 8 fields, 35 records
     ```

     So **`${gisHost}` would 404 on dev**, exactly as the current layer already does — today's lactation layer
     fails to load on dev for this reason, and has for as long as the dev server has lacked that service. It works
     on production. Pin the new URL to `https://gis.tamu.edu` and say why in a comment beside it, the way
     `basemapUrl` is pinned for #1696, and name an issue to restore `${gisHost}` once the GIS team publish it on
     the development server. **Do not quietly leave it on `${gisHost}`**: that ships a change nobody can check on
     dev.
   - **Every field name changes, so the popup must be rewritten, not repointed.** `Name` becomes `bldgname`,
     `MapDisplay` becomes `availability_type` (with `availability_times` now carrying the hours), and `Notes`
     becomes `notes`. There are two new fields, `access` and `amenities`.
   - **The trap:** `lactation.component.html` puts `Notes` into `<a [href]="data.attributes.Notes">` because today
     it is a URL. In the new service `notes` is prose containing an email address, so leaving that would render a
     broken link. It becomes text.
   - **A standing bug to fix while you are there:** the template reads `data.attributes.Bldg_Number`, which exists
     in **neither** service — today's field is `BldgNum` — so "Building Number:" has always rendered empty.
   - **The maintainer's decision on what the popup shows (his 2A):** building name and number, availability type
     and times, access, amenities, and the notes as text. Everything the service carries.
   - **21 rooms today, 35 in the new service**, so expect 14 more on the map; say the count you see. On dev the
     layer draws nothing at all today, so the before image is an error state, not a popup - the work machine has
     captured it.
   - Reuse before building: the popup is one of the components in `libs/aggiemap/ngx/popups`, and the others show
     how multi-line detail is laid out. No purpose-built CSS.
   - Tests: one **proven red first** that fails against the old source or the old field names, so a future repoint
     cannot silently empty this popup again. Say what it printed when it failed.
   - Branch `feat/1960-lactation-hosted-service`, from the latest `development` (which now has #1952).
   - Report on: #1960. **No PR, no screenshots** — work captures the before/after and opens it.

2. **#1954: merge `development` into your branch** (the maintainer's 2A)
   - `fix/1954-deep-link-respects-filter` was branched before #1952 merged, and both change
     `selectFeatureByFieldMatch`, so it now conflicts. You wrote the `createQuery` change and know what must
     survive, so the merge is yours.
   - For reference, 1959's conflict was only `docs/releases/unreleased.md`, where both entries belonged and both
     were kept; its code merged on its own. Yours touches the same method, so expect a real code conflict: the
     qualified-field match picks the field, your change limits the rows, and both must remain.
   - Push, say so, and work checks and opens the PR.

## Batch 3 (19 October 2026, 12:20 PM Central) — #1954, the finding you made

**Decided** (the maintainer, just now): **#1954 is Medium**, as you suggested, and it is yours to fix — you found it
and you have the context. He also cleared the work machine to check, screenshot and open the pull requests for
#1952 and #1953, which is happening here now; don't touch those branches.

**Your batch 2 notes are accepted as they stand.** The comparison gap you marked TO COME can now be filled: the
final build differs from production on **nothing above 20%**, and the one shot that looked like a change (Leggett,
20 August, 15.26%) was the opening view animation caught mid-flight — re-captured on the same build it is 3.02%
from production, and 26.57% from its own first shot. The layer-order difference that was unexplained yesterday is
**fixed**: `/parking/ts-main-parking` lists its layers alphabetically again, matching production. Add that when you
next touch the notes; don't open them again just for this.

1. **#1954: a `?lot=` deep link can select a feature the map's filter excludes**
   - What you saw: on Motorcycle Parking, `?lot=100j` selects space 26692, an `H/C` space, on a map that draws only
     `M/C`. The same before and after #1952, so it is not caused by that change.
   - Goal: a deep link cannot select a feature the map's own filter excludes. The lookup in
     `EventService.selectFeatureByFieldMatch` queries the layer directly, and a layer's `definitionExpression`
     governs what it *draws*, not what `queryFeatures` returns unless the query says so.
   - Decide and say which is right: applying the layer's `definitionExpression` to the lookup query, or letting
     ArcGIS do it. Say in the report why, and what it means for a map whose filter changes after the link was
     shared — a link that selected a feature yesterday may select nothing today, and that is probably correct, but
     it should be a decision rather than a side effect.
   - **Test proven red first**, as before: on a map whose layer is filtered, a link naming a feature outside the
     filter selects nothing instead of selecting it. Say what it printed when it failed.
   - Branch: `fix/1954-deep-link-respects-filter`, from the latest `development`. Not from #1952's branch — that one
     is going through review here and the two must not be entangled.
   - Report on: #1954. **No pull request**, and no screenshots: work opens it with the images, as before.

2. **If that finishes**, carry on with #1949. Nothing else is queued for you.

## Batch 2 (19 October 2026, 10:05 AM Central) — the release notes, while the maintainer is still out

**Batch 1 is done and its two branches are read and accepted.** Both diffs were reviewed here: the matcher change
is backwards compatible (`'LotName'.split('.').pop()` is `'LotName'`, so the thirteen services that already worked
still match), and the `.catch` in #1953 is scoped to the lookup alone. **Work will check, screenshot and open both
pull requests** once the capture finishes — nothing heavy runs beside it.

Your finding is filed as **#1954** (a `?lot=` link can select a feature the map's filter excludes), Bug, on the
board, **priority left unset** for the maintainer, with your suggestion of Medium recorded. Don't start it.

1. **#1935: bring the release notes up to date with what is now known**
   - You own the notes (`C:\TAMU\wt-notes`, branch `docs/release-2026-10-18`, `docs/releases/2026-10-19.md`), and
     only one machine edits them, so this stays with you. These numbers are handed over rather than discovered.
   - **The full tier on Release-484** (build 20261019.5, `8951a6364`), run here 7:38-8:50 AM Central:
     **880 passed, 2 failed, 7 flaky, 30 skipped of 919**, 1.1 hours.
     - **Only one failure is real:** `directions.spec.ts:72`, the AVP feature popup, which is **#1951**,
       Transportation Services' server. Production has it too — the same deep link opened its popup on only 4 of 8
       loads there — so nothing in this release causes it.
     - **The other failure and all seven flaky results were this machine's own contention** and are not the
       release's: a browser loop and query matrices were run beside the tier. A re-run of `maps.spec.ts` alone on an
       idle machine was **74 passed, 0 failed**, including `/map`, which had failed all three attempts. Write the
       notes from the re-run, and say plainly that the tier's other failures were a measurement fault here, not a
       fault in the build.
   - **The dev tag:** there is none. The maintainer's decision is no `dev-*` tag until a rerun is clean, so the
     notes must not claim one. The release is **held** on #1951 and production still serves `264eebb42`.
   - **Still to come from this machine:** the comparison against `prod-2026-10-16-corrected` (capture running, about
     two hours left) and, if Transportation Services' service recovers, a clean full tier. Leave a clearly marked
     gap for each rather than guessing; they will be handed over the same way.
   - Everything else the notes need — what each change does, the issue and pull request links, the closing table —
     is yours to write.
   - Report on: #1935. **Don't merge the notes**: they merge before production, which the maintainer decides.

2. **If that finishes and nothing new has arrived**, carry on with #1949 as far as it goes. Nothing else is queued
   for you; the remaining release work needs this machine.

## Batch 1 (19 October 2026, 9:20 AM Central) — while the maintainer is in a meeting

**Decided** (the maintainer, this morning, before he left):

- **Today's release is held** on #1951, Transportation Services' server. It is not ours, production has it too, and
  nothing in the release causes it. Release-484 (`8951a6364`) is **not tagged** and will not be until a rerun is clean.
- **The deep-link fix is the matching fix, not a per-map search source.** He first chose a search source for the AVP
  map; the audit then found **fourteen** services with the same fault, so he moved to fixing the matcher, with one
  requirement in his words: *"we need to support existing links that are out there"*.
- Three issues are filed, with every field set: **#1951** (High, Transportation Services' server — nothing for us to
  write), **#1952** (Medium, the deep links), **#1953** (Medium, `drawEvent` losing the view and flash).
- **Screenshots stay on the work machine** until the Kubernetes visual compare exists. So these branches are written
  and unit-tested on home; **work captures the before/after images and opens the pull requests.** Don't open a PR.

Both tasks are code and unit tests only. Neither is on the release's critical path, so take them in order and don't
rush the first.

1. **#1952: make a lot deep link resolve where the service's fields are table-qualified**
   - Goal: `?lot=100j` selects the lot on `/parking/avp-parking/map`, and on the other thirteen services listed in
     the issue, **without breaking a single link already shared**.
   - The cause, proven: `EventService.selectFeatureByFieldMatch` compares field names exactly
     (`layerFields.includes(fieldName)`), and these services expose `GIS.TS.ParkingLots.LotName`, not `LotName`,
     because they join `ParkingLots`, `Lot_Use` and `Lot_Notes`.
   - Do: match on the **last dot-segment** of a field name, so `GIS.TS.ParkingLots.LotName` satisfies `LotName`.
     Keep the priority ordering that `candidateFields` gives, and keep the query correct — the field the `where` is
     written against must still be the layer's real, qualified name.
   - **Existing links:** `selectFeatureFromUrl` tries `?feature=<layerId>:<objectId>` first and returns as soon as it
     resolves, so links shared since #809 in June keep working. Prove it rather than assume it: a test that both
     forms select the same feature on the same map.
   - Extra parameter spellings go through `urlQueryParamAliases`, as buildings already do (`bldg`, `Bldg`,
     `BldgAbbrv` and its aliases). Add any the TS links use.
   - Tests: a unit test **proven red first** against the unfixed matcher — say in the report what it printed when it
     failed — and a smoke assertion that `?lot=` resolves on one map from the broken group and one from the working
     group, so the audit in #1952 stays true.
   - Branch: `fix/1952-qualified-field-deep-links`. Report on: #1952.

2. **#1953: keep the chosen view and the focus flash when a feature lookup fails**
   - Goal: a failing `selectFeatureFromUrl` no longer costs the map its opening view and its flash.
   - In `EventService.drawEvent` those three steps share one `try`, so an error in the lookup skips the two after it.
     Let the view and the flash run either way. **No retries** — a retry would hide the outage the smoke suite should
     keep reporting, and #1951 tracks it.
   - Tests: a unit test proven red first, that a throwing `selectFeatureFromUrl` still leaves
     `applySelectedChoiceView` and `flashFocusFeature` called.
   - Branch: `fix/1953-draw-event-view-and-flash`. Report on: #1953.

3. **#1949, Esri's map components** — carry on as far as it goes, as before. Lowest of the three.

**Say "branch ready: <names>"** in `home/STATUS.md` when a branch is pushed and its unit tests pass. Work builds and
checks it, captures the images and opens the PR.

**If anything here is already done or half-done from this morning, say so and don't redo it.**
