# Home machine: current tasks


> **From 25 October 2026, every listener checks in** (DIRECTOR.md, **Checking in**; #2338): use `tools/listen.sh <your name>` as your watcher, and
> `tools/heartbeat.sh <your name> "running batch <n>" <minutes>` when a batch starts, `idle` when it is reported. `tools/roster.sh` shows everyone.

> **Batches 22 and 23 are WITHDRAWN** (from `work (security)`, 30 October 2026, about 2:30 PM Central): moved to the lab (batch 179) and copilot-home (batch 51), which are idle. Do not do them.

## Batch 27 (aggiemap: #2581 rewritten - a per-event refresh switch, **not** the women's refresh; 30 October 2026, from `work (aggiemap)`)

**Your batch 26 stop was right and your split was exactly what I wanted.** The maintainer has now decided
what to build instead, and it is bigger and better than the women's change you were stopped on. **Read
[#2581](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2581) again - I rewrote it; the title and body are new.**

Megan does not want Women's Basketball refreshing. The maintainer:

> Can we configure it in the definition file for the event, but have it set to false for now?

> They will eventually build it, and we should have it as an option that we can turn on/off in a
> generalized manner for different events.

### His decisions, so you do not have to infer them

He was given the options and chose:

1. **A field on `EventConfiguration`**, in the event's own definition file - not a named constant per file,
   and not a parameter on `athleticsDevelopmentSource`. That object is what a reader opens to ask what an
   event does, and it reaches football and men's basketball, which do not use that helper.
2. **A per-event switch plus a per-layer opt-in.** Both levels. Football refreshes **only its lots**; the
   men's refreshes **all three**. A single per-event boolean would start refreshing football's other layers.
3. **Fold football and men's basketball into it in the same change.** One way of doing this, not a fourth
   alongside three old ones.

**Your batch 26 finding that the men's cannot use `athleticsDevelopmentSource` because its popups differ is
still true and no longer blocking** - the switch is not on that helper.

### Your helper-only branch

`chore/2581-athletics-refresh-option` at `acc45cbc2` is good work and I have not thrown it away, but the
optional `refreshInterval` on `athleticsDevelopmentSource` is **not** where the switch goes now. **Keep its
two strict guards** - the ones proving an existing caller's source object comes out byte-for-byte unchanged.
That idea is the most valuable thing in the branch and it applies just as much to the new shape. Decide
whether the helper parameter still earns its place underneath the event-level switch; if it does not, say so
and drop it.

`feat/2581-womens-basketball-refresh` at `9411f5ffa` is **not** going anywhere - do not build on it.

### Women's Basketball

**The switch present and explicitly off**, with **Megan's decision recorded beside it in a comment** - that
she asked for it not to refresh, not merely that it is false. An unexplained `false` reads as an oversight
and the next person switches it on.

### Prove it

- **Red first.**
- **Football and the men's must behave exactly as they do now, and that is the claim to prove**, not
  assume. `mens-basketball.definitions.spec.ts` and `football-parking.lots.spec.ts` already assert
  `refreshInterval` is 1 - those are your guards that the fold-in changed nothing. Football: **lots only**.
  Men's: **all three**.
- `scripts/check-in-volume.sh <branch> affected` - this touches `EventConfiguration` and
  `common.definitions.ts`, so it reaches far more than one map and a project list would miss something.
  Exit 0.
- **No release note** unless a visitor sees a difference, and they should not. Say in the report that you
  checked rather than leaving it unmentioned.

Push to `fork`, report `branch ready:`. Questions go to `work (aggiemap)`.

---

## Batch 28 (aggiemap: #2530 - Megan republished the Graduation maps; 30 October 2026, from `work (aggiemap)`)

**After batch 27.** [#2530](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2530) has been open since 28 October and nobody has picked it up; the
maintainer chose this as home's next job.

Megan, in the issue:

- **Production** has been republished **with the layers split: now 4 layers, closures as a separate layer.**
- **Development** has been republished **as a hosted feature**, and the view AggieMap should read is a new
  URL under `Hosted/GraduationParking_view/FeatureServer`. She will decommission the referenced map once we
  are on the hosted view.
- **Both maps should be identical**, and her screenshot in the issue shows what they should look like.

### Why this is more than a URL change

**Read the issue and both services before touching a definition**, because the shape changed, not just the
address: a layer that was part of one service is now its own layer, so layer indices move. Getting an index
wrong here draws the wrong thing rather than failing, which is the worst kind of wrong.

**There is a known failure waiting on this.** The lab has reported Graduation Fall and Spring failing the
builder-map layer check on **both** environments, on the Road Closures legend, in batch 172 and since. A
separate closures layer is plausibly the fix, or at least changes the fault. **Check whether it clears**,
and say either way - if it clears, remove the known-failure entries in the same change, which is what the
repository's own rule asks.

**[#2521](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2521) is related and already investigated**: copilot-home found the Road Closures
legend does *not* reproduce on either environment any more, because the service was edited after the issue
was filed, and its branch `fix/2521-road-closures-legend` removes four stale known-failure entries. **Read
that report before you start** (`copilot-home/reports/2026-10-30-49.md`) so you do not redo it or collide
with it.

### Prove it

- **Ask both services what they actually are** before and after: layer ids, names, field names, and that
  each answers its own query. The repository's rule is that a check must ask what the app does, not just
  whether the service answers.
- **Both environments**, since she says both should now be identical - and say whether they are. If they are
  not, that is a finding for her, not something to paper over in a definition.
- Before/after screenshots of both Graduation maps, dev and production.
- `scripts/check-in-volume.sh <branch> ts-events-ngx,aggiemap-angular` exit 0, plus the layers spec on both
  environments.
- A release note with its *What to test on dev* row.

Push to `fork`, report `branch ready:`.

---

## Batch 25 (gisday: #2574 - Admin → Users answers 500 past Auth0's 1,000-user limit; add a search; a branch; 30 October 2026, about 11:00 AM Central, from `work (gisday)`)

**High priority, start now.** About 90 minutes. Questions go to `work (gisday)`.

[#2574](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2574) has the evidence: on production,
`GET /api/users` answers 500 and Admin → Users spins for ever. `ManagementService.getUsers`
(`libs/common/nest/auth/src/lib/authorization/services/management/management.service.ts`) walks every page, 50 a page, and
**Auth0 refuses any page past the first 1,000 users**; the tenant has more than that.

### What to do

1. Branch `fix/2574-gisday-admin-users` from the latest `origin/development`.
2. **Red first**, with a fake Management API client in the existing spec style:
   - a tenant of more than 1,000 users whose page 21 is refused as Auth0 refuses it: `getUsers` returns the first 1,000 and does
     not throw, and logs that the list is cut off;
   - `GET users` (the controller) answers 200 with those, and says the list is incomplete (for example `{ users, truncated: true }`,
     or a header; choose the smaller change for the page and say which);
   - a search: `GET users?q=<text>` asks Auth0's user search (`users.list` with `q` and `search_engine: 'v3'`, matching name or email,
     the text escaped for Lucene) and returns matches, including a user who would be past the first 1,000.
   Prove them red.
3. **The API:** stop at the 1,000 limit cleanly (stop paging at 1,000 records, or catch exactly Auth0's refusal, not every error); add
   the search parameter. Reuse `_composeMetadata` for both. Keep `create:users` and the other guards as they are.
4. **The page** (`libs/gisday/platform/ngx/core/src/lib/pages/admin/pages/users/...`): a search box above the list (reuse the
   shared `tamu-gisc-textbox`, debounced), which asks the API; and a short line when the list is cut off: "Showing the first 1,000
   users. Search to find anyone else." **No new one-off styles.**
5. `scripts/check-in-volume.sh fix/2574-gisday-admin-users common-nest-auth,gisday-platform-data-api,gisday-platform-ngx-core,gisday-nest,gisday-angular`
   exit 0. Commit with `Closes #2574`; push to the fork.
6. Screenshots: the local stack has only a few users, so capture the page with a search typed and its result (signed in as the
   dev tenant's test admin, as the lab does), before and after, into `docs/screenshots/2574-admin-users/`, plus
   `docs/releases/unreleased/2574-admin-users.md` with its row. If the local stack cannot sign in, say so and skip.

Report as usual. The director opens the pull request.

---

## Batch 22 (security: #2564 - WITHDRAWN, moved to work-lab-leila batch 179)

## Batch 24 (aggiemap: #2573, the hatch at 60% so the building number is readable; 30 October 2026, from `work (aggiemap)`)

**#2558 is PR 2571, and checking the service first earned its keep again:** the enum ids do not match the
layers - `GATES` is `/0` *Basketball Icons*, `SYMBOLS` is `/1` *Basketball Closures* - so the issue's
"icons and parking" were two differently-named things and Closures was a third you included deliberately.
Watching a real browser for 150 seconds, and reporting that **no data was re-queried because nothing had
changed**, is what makes that pull request trustworthy rather than hopeful.

### Decided, from your questions file

The maintainer has answered, and these are now settled:

| | |
| --- | --- |
| **1** | #2520 **Medium**, #2527 **Medium**, #2529 **Low** - all set |
| **2** | **He** asks Transportation Services to republish the NSC and Break lots |
| **3** | **Women's basketball gets the same refresh**, its own small PR - batch 25, after this |
| **4** | **Your question 14 was right to ask: 60% was never applied.** This batch |
| **5** | #959, #960, #962 one at a time, #960 first - not yours yet |
| 9, 10, 11, 13, #141 | Taken by the director: leave the football casts for #1028; leave the 14 empty points and mention them to the GIS team; mark graduation's check heavy so it runs nightly; a follow-up issue for the basketball ids after 3 November; #141 stays open until #659 |
| 15, 16 | `deepmerge` - passed to the security director, not yours to answer |

### The task

[#2573](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2573). In
`construction-hatch.ts`, the hatch strokes go from `[230, 152, 0, 255]` to **`[230, 152, 0, 153]`**.

**That is the whole change.** Spacing stays 12 pt, stroke stays 1.5 pt, colour stays the same. He looked at
1524 on dev and a vertical grid line falls between the digits, so *1524* reads as *"15 24"*.

### The one thing that could make it wrong

**At zoom 15-16 the construction buildings are small and the grid is most of what identifies them.**
Lightening it too far trades a legible label for an unidentifiable building. He named **75%** as the
fallback if 60% looks washed out there.

So: **before and after at zoom 16, 17 and 18**, on College Station (1524, and 1526 beside it has the same
problem) and on one campus, since one symbol now serves all three. Then **your judgement in the report on
whether 60% holds up at 16** - and if it does not, **say so with the picture rather than shipping it.**
That call is his, as the density was.

A test that the stroke alpha is 153, red first. `scripts/check-in-volume.sh <branch> maps-esri,maps-feature-basemap,ts-events-ngx,aggiemap-angular`
- exit 0. Update #2459's release note rather than adding one; it already describes the hatch.

Push to `fork`, report `branch ready:`. **Small, so report quickly** - it rides the same build as the
basketball refresh and the dining kiosk fix.

## Batch 23 (security: deepmerge - WITHDRAWN, moved to copilot-home batch 51)

## Batch 21 (aggiemap: #2558, basketball parking refreshes like football - URGENT; 28 October 2026, from `work (aggiemap)`)

**Batch 20 found a live production bug by doing cleanup, which is the best kind of find.** The dining kiosk
opening the building's popup instead of the dining location's - and the `layerIndex: 1` that was meant to
stop it and never could. Red 3 of 3 against production first. It is **PR 2557**, and #2552 is set to High.
Measuring 19 views twice before and after, rather than reasoning about the order, is what makes that
branch trustworthy.

### This one is urgent and dated

[#2558](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2558), from the
maintainer, labelled `urgent`:

> We're going to need the men's basketball map to refresh for basketball icons and basketball parking
> layers every 60 seconds like football since it has an editor and can be updated day of to show lot
> closures. **I believe the first game is Nov. 3rd.**

**Field staff edit the service on game day and the map must show it without a reload.** Football already
does this.

### How football does it

`football-parking.definitions.ts`:

```ts
const lotsNative = (): FeatureNativeProps => hiddenNative({ labelingInfo: lotLabelingInfo, refreshInterval: 1 });
```

`refreshInterval` is **minutes**, so `1` is the 60 seconds the issue asks for. `football-parking.lots.spec.ts`
asserts every lot source has it - copy that idea.

### What men's basketball has now

`mens-basketball.definitions.ts`, three layers in `MensBasketball_ColdLayerSources`, each with plain
`native: { outFields: ['*'] }` and **no** `refreshInterval`:

| Layer | Enum id |
| --- | --- |
| Gates | `mens-basketball-gates` |
| Symbols (the "icons" in the issue) | `mens-basketball-symbols` |
| Parking lots | `mens-basketball-parking-lots` |

The map draws `MensBasketball_ColdLayerSources` directly - there is no development array for it - so this
is contained.

### What to do

1. **Symbols and parking lots get `refreshInterval: 1`.** Those are the two the issue names.
2. **Decide about Gates and say why.** Gate closures are exactly the kind of day-of change the editor is
   for, so it probably wants it too - but the issue does not ask, so make the call deliberately and
   record it rather than silently including or excluding it.
3. **Follow football's shape.** If a small helper like `lotsNative()` makes sense here, use one; do not
   invent a different mechanism for the same job.
4. **A spec**, modelled on `football-parking.lots.spec.ts`: each layer that should refresh does, every
   minute. **Red first.**

### Check the service, as always

**Confirm the layers actually carry what field staff edit** before trusting the issue's framing - that rule
has caught four things this week. Specifically: does the men's basketball service have the fields a closure
would be marked in, and do the layers return features today? If the editor writes somewhere these layers do
not read, polling them changes nothing and that is the finding.

### Women's basketball

**Do not change it in this branch.** It has the same shape and will likely want the same thing, but the
issue names men's, and polling a layer nobody edits is wasted requests every minute for every visitor. Put
it in your report as a question with a recommendation; I will take it to the maintainer.

`scripts/check-in-volume.sh <branch> ts-events-ngx,aggiemap-angular` - exit 0. A release note with its
*What to test on dev* row - a reviewer needs to know how to see a refresh happen.

Push to `fork`, report `branch ready:`. **This is wanted for 3 November, so report as soon as it is ready
rather than polishing.**

## Batch 20 (aggiemap: #2061, the layerIndex values that order nothing; 28 October 2026, from `work (aggiemap)`)

**Batch 19 did the thing I asked and the thing I needed.** You confirmed all five entries were stale **by
running the specs** rather than trusting my table - which mattered, because if one fault had still been
live my claim to the maintainer that the republish was complete would have been wrong. And you photographed
production drawing in both modes: lots in two colours, symbols, three closures. That is the first time
anyone has seen that map working since it broke. It is **PR 2547**.

### Why this one is yours

In batch 18 you worked out the rule nobody had written down:

> an event map adds its layers in the **reverse of its layer-id enum**, one at a time, so the **first enum
> entry draws on top**; the order of the source list decides nothing.

[#2061](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2061) is the consequence:
**45 `layerIndex` lines across the event definitions that do not order anything**, because that is not how
ordering works here. They look like they mean something, and the next person to need a layer on top will
set one and watch it do nothing - which is three tries' worth of confusion, as you found.

copilot-home's triage line was: *"Per file, decide if the order was meant; move that into the `references`
order; delete the values."*

### How to do it without breaking a map

**Per file, and the deciding is the work.** For each `layerIndex`:

1. **Was an order meant?** If a map has a layer that must draw above another - an area over a building, a
   highlight over a lot - that intent is real even though the mechanism never worked. **Move it into the
   enum order**, where it does work.
2. **Or was it noise?** Many will be copied boilerplate that never had an intent. Delete those.
3. **Say which you decided for each file**, briefly. A table in the report is enough. That record is what
   stops someone re-adding them.

**Where an order is meant, prove it**: `layer-order.spec.ts` is the right tool and already covers Indoor
Track. Add a row for any map where getting it wrong would be visible.

### Watch for

- **This is wide** - 16+ files. If it gets unwieldy, **do the files where an order was clearly meant first
  and say what is left**; a half-done job honestly reported beats a rushed whole one.
- **`docs/map-layers.md` has a Drawing order section.** If your batch-18 rule is not in it, add it - that
  is the durable half of this, and more valuable than the deletions.
- The campus maps you touched in batch 18 are already right; do not re-litigate them.

`scripts/check-in-volume.sh <branch> ts-events-ngx,aggiemap-angular` - exit 0. Push to `fork`, report
`branch ready:`. No pull request.

## Batch 19 (aggiemap: the GIS team fixed production - clear the exceptions and prove it; 28 October 2026, from `work (aggiemap)`)

**#2532 is PR 2541.** The layer-order rule you found - *an event map adds its layers in the reverse of its
layer-id enum, so the first enum entry draws on top* - is worth more than the fix, because it was not
written down anywhere and three people would each have discovered it the hard way. And you reported your
own near miss (pushing in the same command as a check whose exit code you had not read) rather than burying
it; that is in the pull request.

### What changed under us

**The GIS team republished production's baseball service while we were working.** Verified at 11:40 AM:

| | Before | Now |
| --- | --- | --- |
| `/2` | `Gate/Road Closure`, `objectIdField: objectid_1`, **HTTP 500 on every query** | **`Closures`**, `objectid`, `{"count":3}` |
| `/0` renderer | `simple` - one black dot | **`uniqueValue` on `name`** |
| `/3` renderer | `simple` - one pale blue fill | **`uniqueValue` on `type`** |
| Portal item overrides | three, keyed on fields the layers lacked | **none at all** |

So **#2510 and #2522 are closed**, and production's baseball service now matches development exactly.

### The task

**Three known-failure entries are now stale**, and the suite is about to start printing
`known failure now fixed` for them. That annotation exists so they get removed; removing them is this
batch.

In `test/smoke/aggiemap/environments.json`, production:

- `allowedServiceMetadataFailures`: `baseballParkingUrl/2/objectIdField` and `baseballParkingUrl/2/countQuery`
  (both #2510);
- `allowedPortalRendererFailures`: the three `baseballParkingUrl` entries (#2500).

**Check each one is genuinely clean before deleting it**, by running the spec rather than trusting my
table: `run-local.sh production one service-metadata.spec.ts` and `... one portal-renderers.spec.ts`, read
only. **An entry whose fault is still live must stay** - and say so if you find one, because that would
mean the republish was partial and I have told the maintainer it was complete.

### Then prove production actually draws

The whole point of those issues was a map drawing nothing. **Photograph the baseball maps on production** -
both modes if the builder allows - and confirm:

- the lots draw, and **Event Parking and Reserved are different colours** (that was #2522's complaint: every
  lot the same pale blue);
- the symbols draw;
- **the closures draw**, which they could not while `/2` answered 500.

If any of that is still wrong, **that is the finding and it outranks the cleanup** - say it immediately.

### Prove it

- The two spec runs, quoted, before and after removing the entries.
- The pictures.
- `scripts/check-in-volume.sh <branch> aggiemap-angular` - exit 0.
- No release note: this removes test exceptions and changes nothing a visitor sees.

Push to `fork`, report `branch ready:`. No pull request.

## Batch 18 (aggiemap: #2532, the campuses get the main map's hatch; 28 October 2026, from `work (aggiemap)`)

**#1961 is PR 2531, and the finding is why the batch told you to check the service first.** The field was
fine - 116 of 116 - and the component the issue named **had been unused since #418**, with the layer
drawing a markdown template that cannot hide an empty row. That is the fourth thing this week that looked
like a one-word field fix and was not. You also found three wrong building numbers on the way (#2529).

### What the maintainer has decided

He has seen the vector basemap's construction hatch on dev, is pushing it to production, and says:

> The construction on the satellite campuses needs to be updated to match that used on the main map.

So **[#2532](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2532): Fort Worth
Law School and Houston Space Institute get the hatch**, and the translucent orange wash you built for
#2506 is **replaced, not kept alongside**. Two ways of drawing the same thing is what #2459 spent a day
removing.

You have everything needed already:

| Campus | Hide | Construction features |
| --- | --- | --- |
| Fort Worth Law School | `Construction/1` **and its outline** | `FWLaw/FeatureServer/1` |
| Houston Space Institute | `GIS.FCOR.HSI_Construction/1` **and its outline** | `HSI/FeatureServer/5` |

Use the same `CIMPolygonSymbol` as College Station - black `CIMSolidStroke` first, then the two
`CIMHatchFill`s - so the outline is ours and unbroken, as in batch 10. **If the symbol can be shared rather
than repeated three times, share it**; that is the repository's standing rule and three copies of a symbol
is how the next change gets made in two places.

### The thing to look at honestly

These are **sites**, not building footprints. A hatch across a whole parcel reads heavier than one across a
building, which is why the wash won the first time. **The maintainer has seen both and chosen the hatch**,
so build it - but **frame your captures to show the whole site**, not a corner, so he is judging the real
thing. If at the campuses' opening zoom it reads badly, say so with the picture; that is information, not
disagreement.

### Prove it

- **Before and after for each campus**, at its opening view, with the whole of its construction in frame.
  The "before" is the 25% wash now on `development`, not the old pink.
- **Red first:** the definitions declare the hidden layers and the construction source; the symbol draws
  its own outline.
- All construction features on each campus draw the hatch, not just the one you photograph.
- `scripts/check-in-volume.sh <branch> maps-esri,maps-feature-basemap,ts-events-ngx,aggiemap-angular` - exit 0.
- Update #2506's release note rather than adding a second: the campuses' construction is one story.

### Then, separately

[#2533](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2533) retakes the two
campus tile images, which still show the **old pink** construction and will be wrong once this lands. **Do
not do it in this batch** - it needs a deployed build carrying #2532, so it follows a release.

Push to `fork`, report `branch ready:`. No pull request.

## Batch 17 (aggiemap: #1961, the restroom popup's empty Building Number; 28 October 2026, from `work (aggiemap)`)

**Batch 16 finished the AggieMap triage.** Across three machines, all 64 AggieMap issues have now been
looked at, and #163 was the right call on the last four: closed what the current UI answers, left #71, #141
and #387 open with what you saw. Not closing an old issue just because it is old is the whole discipline
here, and you held it.

Now a fix, from your own "still wanted" list. copilot-home found it and called it **small**:

> **#1961** restroom popup Building Number always empty. `restroom.component.html` line 4 still reads
> `data.attributes.Bldg_Number`. **What it would take:** read `BldgNum`, hide the row when empty, a text
> test red first.

### Check the service before you change the template

**This is the third time this week a popup looked like a one-word field-name fix.** #657 turned out to be
services returning no geometry (#2520), and #2500 turned out to be a renderer keyed on fields that no
longer exist. So:

1. **Query the Lactation/Family Friendly Restroom service and list its fields.** Confirm the right name -
   `BldgNum`, `Bldg_Number`, something else - and how many of its records actually carry it.
   `lactation-rooms.spec.ts` already asserts that service has every field its popup shows, so it may
   already tell you.
2. **If the field is absent or mostly empty, stop**: that is a data fault, file it as one, and the fix is
   hiding the row rather than renaming it. Say so and do not rename to a field that is also empty.

### Then

- **Read the right field, and hide the row when it is empty.** A popup row with a label and nothing beside
  it is what this issue is about; renaming without hiding would only move the problem to records that
  genuinely have no building number.
- **A test, red first.** The popup renders the building number when the attribute is there, and omits the
  row when it is not. Both cases - a test that only covers the happy path would pass on the current code
  for the second.
- **Before and after screenshots** of the popup, since it is visible.
- `scripts/check-in-volume.sh <branch> aggiemap-ngx-popups,aggiemap-angular` - exit 0.
- A release note entry with its *What to test on dev* row.

Push to `fork`, report `branch ready:`. No pull request.

## Batch 16 (aggiemap: the last four, and #1034's follow-up; 28 October 2026, from `work (aggiemap)`)

**You were right to resist on both of the ones I expected you to close.** I would have closed #1267 on
"everything in the suite relies on the probe now, so it must work" - and your answer, *the cause was never
found*, is the better one. An intermittent fault that was explained away rather than explained is exactly
what bit us with the blank map yesterday.

### Decided

1. **#1267: your option A - keep it open** until the failing-layer test and the `paint.ts` comment fix
   land. Add that to the issue as the condition for closing it, so the next person does not have to
   re-derive why it is still open.
2. **#1034: your option A - close it, and file items 4, 5 and 7 as one follow-up.** The founding work is
   done and the issue should say so; the missing behaviours deserve their own issue with its own title
   rather than keeping a done thing open. File it (Task, `testing`, Priority **Medium** - say so and the
   director will confirm), then close #1034 pointing at it.
3. **Priorities you asked for:** #1005 Medium, #1204 Low. Set them.

### The last four AggieMap issues nobody has triaged

```
#71 #141 #163 #387
```

These are 2020 to 2025 and they are the oldest things in the repository. Same rules as batches 13 and 15.
What I already know, so you do not redo it:

- **#71 *Clear search on Aggie Map mobile*** - I checked: there is **no clear control anywhere in
  `libs/ui-kits/ngx/search`'s templates**. So it is probably still live. What I could not tell from the
  code is whether the mobile UI clears a selected building some other way. **Look at it on dev** rather
  than reasoning about it.
- **#141 *Directions to POI, mismatched spatial references*** - directions are still gated off production,
  and [#1875](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1875) fixed a
  neighbouring thing (a click in directions on a projected basemap). Whether *this* one survives, I do not
  know. Note that **#659 means routing fails as soon as directions are requested on dev**, so you may not
  be able to test it end to end - if so, say that rather than guessing.
- **#163 *Features Tab Function*** - "two clicks to close the side-menu", from 2021, on a UI that has been
  rebuilt since. Decide from the current UI, not the screenshot.
- **#387 *Sidebar scrolling breaks dismissal on large layer lists*** - `aggiemap-ngx-ui-mobile`. Still
  exists (34 files). Needs a phone-width look.

**Three of these four need looking at a running map rather than reading code.** That is fine and it is why
they are yours. If one genuinely cannot be settled without the maintainer, say so and leave it - do not
close an old issue just because it is old. **Staleness is not obsolescence**, which is the rule you have
been applying all morning and should keep applying here.

Report as before. Nothing pushed.

## Batch 15 (aggiemap: triage the September-October issues; 28 October 2026, from `work (aggiemap)`)

**Batch 14 was the right call, and the part that matters is the part you did not do.** Your own batch-13
reading said `notes` -> `description` would fix #657. You checked the service first, found both maps return
their lots **with no geometry**, filed #2520, and **declined to make the one-word change on its own** -
because it would have changed nothing visible while looking like a fix. That is exactly the stop rule. The
check is **PR 2525**.

Same job as batch 13, next slice:

```
#954 #959 #960 #962 #967 #1005 #1006 #1027 #1034 #1036 #1202 #1204 #1267
```

Rules are unchanged from batch 13 - **done / obsolete / still wanted / needs the maintainer**, every close
citing the file, commit or live response that proves it, one line on what it would take for anything left
open, no fixing, and no close you are unsure of.

### Four worth knowing before you start

- **#1034 *End-to-end coverage for every map, scheduled against prod and dev*** is the smoke suite's own
  founding issue - `docs/testing.md` names it as "the suite's original plan". The suite exists, runs
  nightly on both environments and has ~830 tests. **Check whether anything it asked for is still missing**
  before closing it; if it is all there, this is a clean close with good evidence.
- **#1267 *The map probe's `ready` is often never true*** - the probe is now relied on by most of the
  suite. If it were still often never true, nothing would pass. Worth checking what changed and closing it
  properly rather than by inference.
- **#1005 *10 layers fail to load on dev because gis-dev is missing them*** - that gap is real and may now
  be **recorded** in `environments.json`'s `allowedLayerFailures` rather than fixed. Recorded is not fixed:
  say which it is.
- **#1202 / #1204 *Remove the event apps / ts-events-angular*** - several apps were deleted in October
  (`signage-angular`, `ues-operations-nest`, the `gisday-competitions` apps, `geoprocessing-v4`). Check
  what is actually gone; batch 13 found "only `ts-events-angular` is left", so #1202 may be done and #1204
  may not.

### One thing to carry over

Batch 13's closes were good because each cited a commit and a line. **Keep that.** A close that cites
nothing is worth less than an open issue with one honest sentence on it.

Report as before: a table of issue, verdict, evidence, and the one-line "what it would take". Nothing
pushed.

## Batch 14 (aggiemap: #657, the NSC popup; 28 October 2026, from `work (aggiemap)`)

**Batch 13 was triage done properly.** Eight closes each citing a commit and a line, sixteen left open with
what each would take, six handed to the maintainer untouched, and **#659 narrowed from "routing stopped
working" to a precise server-side fault** - that last one is worth more than the eight closes, because it
turns an eight-month-old critical issue into a specific ask for someone with GIS server access.

You also spotted this one, so it is yours to finish:

> **#657's NSC half looks like a one-word fix** (`notes` -> `description` in `nsc-parking.definitions.ts`),
> with a popup smoke row to prove it red first.

### What to do

[#657](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/657) is *NSC and Break
maps do not have popups*. Fix **the NSC half** if your reading holds up.

1. **Check the service first, not the definition.** Query the NSC parking layer and see which field actually
   carries the popup text. If it is `description`, the one-word change is right. **If the field is missing
   or empty on the service, stop** - that is a data fault like #2500 and #2510, and it needs an issue and
   the GIS team, not a code change.
2. **The Break half too, if it is the same shape.** The issue names both maps. If Break is a different
   fault, say so and leave it - do not stretch one fix over two problems.
3. **Red first, in the smoke suite.** `popup.spec.ts` already checks that clicking a feature opens a popup
   with its data. Add the NSC row, prove it fails against today's `development`, then fix it and watch it
   pass. A one-word fix with no test is indistinguishable from a typo next time somebody tidies that file.
4. Before/after screenshots of the popup, since it is visible.
5. `scripts/check-in-volume.sh <branch> ts-events-ngx,aggiemap-angular` - exit 0.
6. A release note entry with its *What to test on dev* row.

### Why this is worth a batch rather than a drive-by

Every popup on these maps has been empty since at least March, and nobody noticed because **nothing checks
popups per map**. The fix is a word; the check is the point. Treat the check as the deliverable and the word
as incidental.

Push to `fork`, report `branch ready:`. No pull request.

## Batch 13 (aggiemap: triage the older AggieMap issues; 28 October 2026, from `work (aggiemap)`)

**Batch 12 is PR 2518.** Your finding that **every map opens one level closer** is the one that mattered -
it is a real change to what production users see, nobody had noticed it because development has always
looked that way, and it would have been discovered by the team after release. Finding the 3D stand-in's
`aggiemapBasemap(false)` caller, and the `basemapRoots` problem that broke the view-limit test, were both
yours too. The opening zoom is with the maintainer; nothing for you to do unless he picks option B.

### The task

The maintainer wants the 320 open issues worked through and closed one way or another, and has said: *"If
you have questions about one that need me, just move on to the next one."*

**Your slice is the older AggieMap issues**, created between October 2025 and August 2026:

```
#445 #458 #459 #463 #497 #542 #543 #544 #546 #547 #548 #549 #550 #552 #553 #555
#594 #602 #656 #657 #699 #709 #827 #867 #881 #885 #894 #916 #927
```

For each, decide **one** of:

- **Done** - it already works, or a later change made it true. **Close it** (`gh issue close <n> --reason
  completed --comment "..."`), naming **the file, the commit or the service response** that proves it. A
  close that cites evidence is worth having; one that says "looks fine now" is worse than leaving it open.
- **Obsolete** - it describes something that no longer exists. **Close it**, saying what changed.
- **Still wanted** - leave it open and give **one line on what it would take**. That line is the real
  output: it turns a stale wish into something someone can pick up.
- **Needs the maintainer** - leave it open, list it separately, **and do not ask him**.

### Three worth knowing before you start

- **#659 *(aggiemap-backend): Routing stopped working*** is labelled critical and is from March. Directions
  are still gated off production (`directions.spec.ts` checks they appear on dev and never on production),
  so **check what is actually true today** before deciding - this one is more likely to be live than it
  looks.
- **#885 *use feature services from TS portal instead of map services from FAMIS*** was substantially done
  on 27 October, when all ten athletics maps moved to hosted feature views. Check whether anything is left.
- **#881 *basemap is sometimes hard coded*** sits right next to what you have been doing all night. If
  #2515 finished it, say so; if not, say what is still hard-coded.

### What not to do

- **Do not fix anything.** This batch is triage. If you find something that deserves fixing, say so in the
  report with what it would take, and the director will queue it.
- **Do not close an issue you are unsure about.** Leaving it open with one useful line is a better outcome
  than a wrong close, and the maintainer can see both.
- Several of these are **enhancements nobody has asked for since**. Those are still "still wanted" unless
  the thing they propose has become impossible or meaningless - staleness alone is not obsolescence, and
  that judgement is the maintainer's, not ours.

### Report

A table: issue, verdict, the evidence, and the one-line "what it would take" for anything left open. Then
the count closed. **Nothing pushed, no branches.**

## Batch 12 (aggiemap: #2515, the vector basemap becomes production's default; 28 October 2026, from `work (aggiemap)`)

> **The lab found the same check failing on dev, and your rewrite needs to cover it (7:55 AM Central, 28 October).**
>
> Batch 170's release tier on `f2160a189` passed - 829 passed, 4 failed, blank-map check 6 of 6 green,
> Indoor Track 3 of 3 green - and **one of the four failures is new and is ours**:
>
> > the basemap view-limit test can't find the raster basemap since #2508 shares its MapServer
> > (the limit itself still matches, 282)
>
> `services.spec.ts` finds the raster basemap by matching `basemaps.definition.ts`, and **#2508 added the
> construction layer from `FCOR/TAMU_Basemap_20261008/MapServer/2` - the same MapServer as the raster
> basemap** - so the match no longer resolves to one service.
>
> **Your rewrite should fix this, and must be shown to.** Run it against **today's `development`**, which
> has #2508 in it, not against a tree without it: a rewrite that asks every basemap production offers will
> probably resolve it by construction, but "probably" is how the broken one shipped.
>
> **Your 7:33 AM finding is the important one and it decides the limit**: the raster basemap production
> still offers goes white past 1:282, and the maintainer chose option A, so production keeps the raster
> available. **The limit therefore stays at 282** - raising it for the vector basemap would break the very
> basemap we are keeping as the fallback. Put that reasoning in the code comment, because the next person
> to read `AGGIEMAP_BASEMAP_MAX_SCALE = 282` beside a vector basemap that caches to 70 will assume it is
> stale.
>
> The dev build is tagged `dev-2026-10-28`.


**Your #2506 pictures decided it**: the maintainer picked orange at 25%, and the director is rebasing that
branch and opening its pull request - nothing for you to do there.

This is the next release's headline change, and it is yours because you have been in this file all night.
Read [#2515](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2515) in full; it
has the measurements.

### Decided, so do not ask

**The maintainer chose option A for the gallery:** production offers the **vector basemap first and keeps
the raster one available**. Today `aggiemapGalleryBasemaps(isTesting)` returns `[aggiemapBasemap(isTesting)]`
on production - one entry - so production needs a branch of its own returning the vector basemap and then
the plain `AggiemapRasterBasemap` (**not** the dated development variant).

The reason, worth keeping in the code comment: if something is wrong with the vector basemap on production,
one entry leaves a visitor no way out and us no mitigation short of another release.

### The four things that go with the one-line switch

1. **`aggiemapBasemap(isTesting)`** returns the vector basemap in both environments. Its comment currently
   explains why production is the safe default; rewrite it rather than leaving it contradicting the code.
2. **`DEVELOPMENT_ONLY_SERVICES` must drop `Hosted/VTBase3/VectorTileServer`, in this same pull request.**
   That list exists to **fail** when production requests a listed service (#1229), so leaving it turns the
   production run red for precisely the thing we intend. **`Hosted/VTBase/VectorTileServer` stays** - the
   September cache is still development-only.
3. **The view limit.** `AGGIEMAP_BASEMAP_MAX_SCALE = 282` comes from the raster cache, which stops at level
   21. **The vector basemap caches to level 22, scale 70.53** - two levels deeper. Left alone, every view
   still stops at 282 and nobody can zoom to the detail the new default actually has. Raise it, **and make
   `services.spec.ts`'s view-limit test follow the default basemap rather than the raster service**, or it
   keeps passing while asserting about the wrong one.
   - Before changing the number, **look at what the deeper levels actually draw**. If the vector basemap
     turns to mush past 282, say so with a picture and leave the limit where it is - that is a finding, not
     a failure.
4. **A release note entry** with a *What to test on dev* row. This one matters more than most: it is the
   largest visual change production has had in a long time, and the row is what the team works from.

### Prove it

- **Red first** on the gating and gallery: a test that production's gallery offers the vector basemap and
  the raster one, and that `DEVELOPMENT_ONLY_SERVICES` no longer lists VTBase3. Both fail before the change.
- **Pictures, production-shaped**: `run-local.sh local-production` serves the dev server as production would
  behave. Capture the main map before and after, and the gallery panel showing both entries.
- `scripts/check-in-volume.sh <branch> maps-feature-basemap,aggiemap-angular,ts-events-ngx` - exit 0.
- Say explicitly in your report **whether anything other than the basemap changes on a production-shaped
  build**. Nothing should; if something does, that is the thing to report first.

Branch from the latest `development`, which now has #2508. **Do not build on `feat/2506-campus-construction`** -
the director is rebasing it separately and the two must not tangle.

Push to `fork`, report `branch ready:`. No pull request.

## Batch 11 (aggiemap: #2506, the two campus basemaps - two options, as pictures; 28 October 2026, 2:25 AM Central, from `work (aggiemap)`)

**Batch 10 is PR 2508 and the outline reads perfectly.** Your three-way label picture was the right way to
put that question - it turned a judgement call into a one-look decision, and this batch asks for the same
thing again.

**Decided, from batch 10's question:** the label goes to the maintainer as your three variants, with the
director recommending **60% opacity** rather than as-built - it reads cleanly and changes only the opacity,
not the density he chose, which was what your recommendation was protecting. Nothing for you to do unless
he picks it.

### The problem

[#2506](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2506): **Fort Worth Law
School and Houston Space Institute carry the same opaque pink construction tile, on production today.**
Their basemaps are not gated by `isTesting`. Measured from the published sprite sheets:

| Basemap | Construction fill layer | Sprite | Transparent pixels |
| --- | --- | --- | --- |
| `FWLaw` | `Construction/1` | 51 x 47 | **0 of 2397** |
| `HSI` | `GIS.FCOR.HSI_Construction/1` | 44 x 40 | **0 of 1760** |

Same pink, same opaque white ground, as College Station's. The other eight campus basemaps have no
construction fill at all.

### What to build: two options, photographed, not argued

The maintainer decides this from pictures. Build both on one branch, behind nothing clever - whichever he
picks, the other is deleted before the pull request.

**Option A: hide the fill, draw nothing.** Add each basemap's construction fill layer to its
`hiddenStyleLayers`. The building keeps the basemap's own outline and shows the ground beneath. Your
`feat/2459-hide-only` already showed what this looks like on College Station.

**Option B: replace the pattern with a translucent fill, in the basemap's own style.** `setPaintProperties`
on the construction fill layer, swapping `fill-pattern` for a semi-transparent orange `fill-color`.

**Option B is the one I most want to see, and it may be better than what we built for College Station.**
Three reasons it is worth real attention rather than a token try:

- **`setPaintProperties` is proven not to blank.** It was tested on dev earlier today and is a different
  call from `setSpriteSource`, which is the one that races.
- **It lives inside the basemap's own style**, so it draws *under* the outline, the labels and the trees -
  no added layer, and therefore **none of the outline-breaking problem batch 10 had to solve.**
- **It needs no feature source.** Each campus's construction features would otherwise have to be found
  first, which is the expensive part of doing a hatch there.

Its cost is that it is a flat wash rather than a hatch. For a satellite campus that may be entirely fine -
but that is the maintainer's call, from a picture, not ours.

### Prove it

1. **One picture per option, per campus** - four in all - at a zoom where a construction building fills a
   good part of the view, committed to `docs/screenshots/2506-campus-construction/`. Plus a **before** of
   each campus as it is today, so there are six.
2. **A side-by-side for each campus**, the way you built `label-1524-zoom18-variants.png`: before, A, B.
   That image is the deliverable; the rest is supporting.
3. For option B, try **two opacities** and say which you would ship.
4. `scripts/check-in-volume.sh <branch> maps-esri,maps-feature-basemap,aggiemap-angular` - exit 0.
5. **Do not open a pull request, and do not merge either option into the #2459 branch.** PR 2508 is open and
   must not move under the maintainer while he is looking at it.

### Watch for

The two campuses are **on production**, so whatever ships here is publicly visible immediately - unlike
#2459, which is development-only. Say in your report whether either option could look *worse* than the pink
to someone who does not know what a construction site is. An outline on grass where a building should be is
the risk with A, and it is worth naming rather than discovering.

## Batch 10 (aggiemap: #2459, the broken outline; 28 October 2026, 1:40 AM Central, from `work (aggiemap)`)

**Your prototype is proven.** The lab measured `feat/2459-hatch-layer` at **0 of 45 blank** against a control
of **9 of 60** in the same interleaved session (report 151). At the control's rate, 45 clean loads in a row
happen about 0.07% of the time, so that is a real result, not a quiet machine. The approach ships.

One defect has to be fixed first, and the lab's 2x crop (`work-lab-leila/reports/2026-10-28-151/zoom-home-aplin.png`)
shows it plainly.

### The hatch draws over the building outline, and the outline reads as dashed

Our hatch is a layer above the whole basemap, so wherever an orange line crosses the black outline it
breaks it. Up close the building edge looks like a dashed line rather than a solid one. The grid also
crosses the building's label (*1524*, *1526*) and the trees inside the footprint. **The published sprite
did not have this problem**, because it lived inside the basemap's own style and drew beneath the outline
and the labels.

**You cannot fix this by reordering.** A vector tile basemap is one layer: anything we add draws either
entirely above it or entirely below it, and below means the basemap's own ground fill covers us. Above is
forced. So the outline has to become *ours*.

### What to do

1. **Hide the basemap's construction outline too** - `Campus Structures/Currently Under Construction/0`,
   the `line` layer at `#000000`, alongside the fill you already hide. Your `hiddenStyleLayers` list takes
   it without a code change.
2. **Draw the outline in our own symbol, above the hatch.** The `CIMPolygonSymbol` takes a stroke as well
   as its two `CIMHatchFill`s; ordered after them it draws a solid black edge over the grid, which is what
   the sprite achieved by being underneath. Match the basemap's line: `#000000`, 1.33 px.
3. **Then look at the label.** With the outline solid, judge whether *1524* still reads under the grid at
   zoom 17 and 18. If it does, leave it - a construction site with a hatch over its number is not wrong. If
   it does not, say so and propose something (thinner strokes, or partial transparency on the hatch); do
   not guess at a value without showing it.
4. Trees inside the footprint being crossed is **fine**. It is a building site, and arguing it either way
   without the maintainer is not worth a cycle.

### Prove it

- **A 2x crop of 1524 matching the lab's**, committed beside your other pictures, so the two can be put
  side by side. The outline must read as one continuous line.
- Zoom 17 and 18 again if the label work changes anything.
- `scripts/check-in-volume.sh <branch> maps-esri,maps-feature-basemap,aggiemap-angular` - exit 0.
- Keep everything from batch 9: the deleted sprite override, the tests, the release note with its #2506
  caveat.

### One more thing, and it is not optional

**The lab measured `337047b1e`; your branch is now `f1aa31ca9`.** Deleting the sprite override can only
make blanking less likely, so I am not asking for the full 45 again - but **say in your report which commit
the 0 of 45 was taken on**, and do not let the pull request imply the final commit was the one measured.
The lab will take one confirming block on the final commit.

Push to `fork`, report `branch ready:` with the commit. The director opens the pull request.

## Batch 9 (aggiemap: #2459, make the no-sprite hatch shippable, and show it at real zooms; 27 October 2026, 11:50 PM Central, from `work (aggiemap)`)

**Your prototype is the answer and it is going to ship.** The maintainer has seen `prototype-1524` and
`control-1524` side by side. This batch turns the prototype into a pull request and answers the one
question the picture cannot: whether the hatch is the right density at the zooms people actually use.

Do not wait for the lab. They are measuring `feat/2459-hatch-layer` and `feat/2459-hide-only` on the rig
that reproduces the blanking; if they find something, it changes the mechanism, not the work below. Build
on `cb1ea9c8b`.

### Task 1, first and quickest: the density, at the zooms people use

**Capture building 1524 and 8711 at zoom 15, 16, 17 and 18**, prototype only, and commit them to
`docs/screenshots/2459-construction-hatch/` with obvious names. Then **say in your report which density you
would ship and why.**

This is the maintainer's open question and it is worth more to him tonight than the pull request. The
current symbol is two `CIMHatchFill`s 12 pt apart with 1.5 pt strokes, chosen to match the sprite's grid.
At the zoom the pictures were taken the grid reads fine; at zoom 15 it may read as a wash, which is the
whole complaint being fixed. **Push these and name them in `STATUS.md` as soon as they exist**, before
starting task 2 - the maintainer may be looking.

If one density cannot serve every zoom, say so plainly and propose what should happen instead; a
scale-dependent symbol is a real option and naming it is better than shipping a compromise silently.

> **Note from `work (aggiemap)`, 12:55 AM Central, 28 October: #2506, and it affects how you build this.**
>
> College Station is not the only basemap with a pink construction fill. Read from each basemap's own
> `resources/styles/root.json` tonight:
>
> | Basemap | Used by | Construction fill layer |
> | --- | --- | --- |
> | `VTBase3` | College Station, development only | `Campus Structures/Currently Under Construction/1` |
> | `FWLaw` | **Fort Worth Law School, production** | `Construction/1` |
> | `HSI` | **Houston Space Institute, production** | `GIS.FCOR.HSI_Construction/1` |
>
> The other eight campus basemaps have none. **The campus basemaps are not gated by `isTesting`**, so those
> two draw the pink hatch on production today.
>
> **What this changes for you: nothing you must do, but one thing you must not do.** Keep building the
> College Station fix - that is still the batch. But **build it so a second and third basemap can use it
> without being rewritten**: the hidden style layer and the construction source belong to the *basemap
> definition*, not baked into one place that assumes College Station's layer id and College Station's
> feature service. Your `hiddenStyleLayers` list is already shaped right; make sure the construction layer
> is declared the same way rather than hard-coded beside it.
>
> **Do not add the two campuses in this pull request.** They are #2506 and the maintainer has to choose
> between drawing the hatch there too and simply hiding the fill (your `feat/2459-hide-only` is exactly
> that experiment, which is now worth more than it looked).
>
> **And say so in your pull request**: that this fixes College Station and that Fort Worth Law and Houston
> Space Institute keep the pink until #2506. "The construction symbology is fixed" must not be read as true
> when it is not yet true for two maps the public can open.


### Task 2: the change itself

Take the three `PROTOTYPE (#2459)` changes to something reviewable:

- **`hiddenStyleLayers` on `makeBaseLayer`** stays - it is a style call, it never touches the sprite sheet,
  and it is the half that removes the pink. Document in the code *why* `.../1` is hidden and `.../0` is not.
- **The construction feature layer** stays, with its CIM hatch. It is a base layer of the vector basemap, so
  it draws only where that basemap does, which is right.
- **The sprite override goes.** Do not leave `SPRITE_OVERRIDES_ENABLED = false` behind as a dead switch.
  Delete `vector-tile-sprites.ts`, its `spriteOverrides` definition entry and its call site, and say in the
  pull request that it is deleted rather than disabled. It blanks the map about one load in four, and your
  own report found it applying at 8711 and not at 1524 **in the same session** - it is a race, not a feature
  anyone should be able to switch back on by accident. Keep its unit tests only if they still test something
  that exists.
- `BaseMapProperties.baseLayers` becoming an array is a real interface change; make sure every caller and
  every definition still typechecks, and note it in the pull request so a reviewer looks at it.

### Prove it

1. **A test that fails first.** The honest one: the basemap definition declares a construction layer and
   names `Campus Structures/Currently Under Construction/1` as hidden, and `makeBaseLayer` hides what it is
   given and builds a `FeatureLayer` when asked. Red against the unmodified code, then green.
2. `scripts/check-in-volume.sh <branch> maps-esri,maps-feature-basemap,aggiemap-angular` - exit 0, quoted.
3. **All eight construction buildings draw the hatch**, not only the two you photographed. A query against
   `FCOR/TAMU_Basemap_20261008/MapServer/2` for `Type = 'CONSTRUCTION'` gives the list; checking them is
   cheap and a renderer that works on two is not evidence.
4. **Before and after at the same view**, committed, for the pull request and the release note. You have
   `control-1524`; the before must be today's `development` as served, pink.
5. A release note entry, `docs/releases/unreleased/2459-construction-hatch.md`. **It was deleted tonight by
   PR 2503** because it described something that had been reverted - so write it fresh, and have it describe
   what this change actually does.

Push to `fork`, report `branch ready: <name>` with the exact commit. **Do not open the pull request**; the
director does that once the lab's measurement is in.

### Questions

End of the report, with options and a recommendation, and keep working. Do not wait on any of them.

## Batch 8 (aggiemap: #2459 the hatch as a layer instead of a sprite; 27 October 2026, about 10:10 PM Central, from `work (aggiemap)`)

> **Note from `work (aggiemap)`, 11:34 PM Central, 27 October.** **Push the prototype branch to the fork now,
> before anything else.** work-lab-leila has been waiting on it since 11:27 PM and is measuring filler in the
> meantime; `git ls-remote fork` shows nothing and your status names no branch. Push whatever state it is in,
> even unfinished, write the branch name and commit in `STATUS.md`, and then carry on - the lab's rig is the
> one that reproduces the blanking, so your prototype has to reach it to be worth anything.
>
> Also **commit the picture and name it in `STATUS.md`**: your 11:07 PM note says 1524 draws with an orange
> grid hatch, grass between the lines and a black outline, and that image is the only proof anyone has that
> the no-sprite approach works. `docs/screenshots/2459-construction-hatch/`, on the branch. The maintainer has
> said he will not accept "done" without an image, so a screenshot that is only on your disk is worth nothing.
>
> **Your 0 of 15 on the control does not contradict the lab, and is not yours to chase.** They reproduce the
> blanking and you do not; that difference is one line in your report, not an investigation. Your job is the
> alternative that uses no sprite at all, and on tonight's evidence it is the one that is going to ship.


**Overnight.** The maintainer wants the construction symbology solved and all three machines on it. Yours
is the alternative that does not touch sprites at all.

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

**Draw the hatch as a layer instead of a sprite, and see whether it blanks anything.**

#2459 listed this as option D and it was never tried. The under-construction buildings are queryable:
`FCOR/TAMU_Basemap_20261008/MapServer/2`, `Type = 'CONSTRUCTION'`, which supports `Query`. A `FeatureLayer`
with a `CIMSymbol` using `CIMHatchFill` draws a real hatch - rotation, spacing and colour as wanted - with
no sprite sheet, no `setSpriteSource`, and nothing touching the basemap's own rendering.

1. **Prototype it** on a branch: the layer, the CIM hatch in orange, drawn over the vector basemap, with
   the basemap's own construction fill left exactly as published.
2. **Measure it the same way the lab did** - 15 plain loads of `/map/d`, blank meaning 100% white for 30
   seconds - so the number is comparable. If it blanks 0 of 15 and draws the hatch, that is the answer.
3. **Say what it costs**: an extra service query on every map load, a production-server layer under a
   development-only basemap, and whether the two datasets agree about which buildings are under
   construction.

A prototype that works is worth more tonight than a tidy one. If it blanks too, say so - that would mean
the fault is not in sprites at all, which changes everything.

### Added 10:35 PM: the maintainer's framing, and the two halves of this

The maintainer: *"Do we have to use a sprite? Can't we just draw the features ourselves and symbolize it
ourselves?"* That is this batch, and he is right that it sidesteps the whole problem. **The GIS team
cannot fix the published sprite and the front end has promised to fix this**, so "ask them to republish"
is not available. The hatch is the last thing holding the vector basemap back from production.

There are **two halves**, and only one of them is the drawing:

**1. Hide the basemap's own construction fill - and this is safe.** The style layer is
`Campus Structures/Currently Under Construction/1`. It is turned off with **`setPaintProperties`**, which
is a different API from `setSpriteSource` and **does not blank the map**: it was called on dev today
(`setPaintProperties(id, { 'fill-pattern': id })`) and the map stayed drawn. `setStyleLayerVisibility`
is the other candidate. Measure it on its own first - 15 plain loads, blank meaning 100% white for 30
seconds - so you know the half that hides the pink is free before you build the half that draws.

Leave the outline layer `.../Currently Under Construction/0` alone: a black outline is wanted, and it is
not a sprite.

**2. Draw the buildings ourselves, as an ordinary layer.** The vector tiles are not queryable, but the
same buildings are: `FCOR/TAMU_Basemap_20261008/MapServer/2` supports `Query`, and
`Type = 'CONSTRUCTION'` selects them - eight buildings today, Aplin Center (1524) among them. A
`FeatureLayer` with a `CIMSymbol` using `CIMHatchFill` gives a real hatch at whatever angle, spacing and
colour we choose, with no sheet, no sprite, and nothing reaching into the basemap's renderer.

Orange, as the maintainer settled this afternoon. He also chose the density on the sprite version - lines
16 apart, 2 wide, about a quarter covered - so start there and it will look familiar.

### What would make this the answer

- **0 of 15 blank loads**, the same measurement the lab used, so it is comparable.
- **A picture of 1524 drawn with an orange hatch and the grass showing between the lines.**

Both, not either. One screenshot of it working is not enough any more - there have been two of those
today, each true at that instant and wrong overall.

### Worth saying if you find it

Whether the two datasets agree on which buildings are under construction. The basemap tiles were cooked
from this same source, so they should - but "should" is what went wrong all day.

### Don't

Merge anything, or change the basemap definition's existing `spriteOverrides`.


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

## Read this first: you are a worker now, for AggieMap too (26 October 2026, 3:35 PM Central)

**The maintainer has moved AggieMap's director role to `work`.** `DIRECTOR.md` says so. You held it from
5:25 PM on 25 October and queued batch 152; thank you for it, and **stop writing
`work-lab-leila/TASKS.md` for AggieMap from now on** - `work (aggiemap)` writes it. You already take
batches from `work (security)` and that does not change.

**Nothing of yours is dropped.** Batch 152's release tier on Release-494 is read and used: its 12
failures are recorded below so nobody re-derives them.

- 750 tests, 676 passed, 12 failed, 3 flaky, 59 skipped, on `392be39db`.
- The 12 were #2209's eight, the two indoor-track layer-order loads, and the raster-basemap test
  (#2351, which fails on production too). None came from that release.
- **#2209's eight are now fixed** by PR 2429, merged this afternoon and on dev in Release-495. The quick
  tier on that build is lab batch 156, queued by `work (aggiemap)` - that is the run that will say
  whether the fix worked, so expect those eight to change.

**What to do:** keep your watcher running, take batches from this file as before, and put any AggieMap
question in your report under **Questions for the director (aggiemap)** rather than acting on it.

## Batch 7 (workspace: #2498 - check-in-volume.sh takes its memory and parallel limits from the environment; a branch; 27 October 2026, about 8:05 PM Central, from `work (gisday)`)

After batch 6. About 40 minutes. Questions go to `work (gisday)`. The maintainer chose this machine for it (not copilot-home, whose
memory problem it is about).

[#2498](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2498) says what and why.

1. Branch `chore/2498-check-memory-env` from the latest `origin/development`.
2. `scripts/check-in-volume.sh`: read `CHECK_MEMORY` (default `16g`) for the container's `-m` and `CHECK_PARALLEL` (default `8`)
   for Nx's `--parallel`; print both near the top of the log. Nothing else changes.
3. **Red first:** extend `scripts/check-in-volume.test.sh` (defaults used when unset; an override honoured; a non-number
   `CHECK_PARALLEL` refused with a clear message). Prove it red, then green: `bash scripts/check-in-volume.test.sh`.
4. CLAUDE.md, where the script is described: one sentence naming both variables and their defaults.
5. `scripts/check-in-volume.sh chore/2498-check-memory-env` (the stock defaults) must exit 0, and say so. Commit with
   `Closes #2498`; push to the fork (`danielgoldbergtamu`).

Report `home/reports/<yyyy-mm-dd>-<n>.md`: branch and head, red then green, the check's exit code. The director opens the pull
request.

---

## Batch 6 (aggiemap: #2472 the dev server stalls at the dependency optimizer; 27 October 2026, about 1:50 PM Central, from `work (aggiemap)`)

**Not critical**, and an investigation rather than a fix. The maintainer: *"If they can make it in by the time
we finish with the campus maps, they can be included for the dev release. If not, we do later."* An answer is
worth more here than a rushed patch. Questions go to `work (aggiemap)`.

[#2472](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2472), from your own batch 5
report and copilot-home's batch 29: the AggieMap dev server answers on 4200, the log stops at
`[optimizer] bundling dependencies...`, and it makes no progress for over ten minutes at about 100% CPU -
**with `UV_THREADPOOL_SIZE=64` set and a fresh `node_modules` volume**. That is the symptom
[#1955](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1955) closed, with its fix
already applied, so either the fix is incomplete or there is a second cause wearing the same face.

It cost two machines their before/after captures today; both fell back to a production build served by
`serve-dist.js`. CLAUDE.md budgets fifteen minutes from cause to pull request for a bug fix, and this breaks
that budget every time it happens.

### What is wanted

**An answer, not necessarily a fix.** Does it reproduce on demand, and what makes the difference? Things worth
varying, in rough order of suspicion:

1. **`--poll=2000`.** #1955's cause was polling starving the thread pool. Does the stall go away without
   polling, and does the server still see edits from Windows if it does?
2. **The second volume.** Both machines were using a volume other than `tamu-js-dev-nm` (`tamu-js-b159-nm`,
   `tamu-js-2453-nm`), because the shared one was stale and `gisday-api` holds it. Whether that matters is
   unknown and worth one controlled run either way.
3. **`UV_THREADPOOL_SIZE` higher still**, and whether the number that works depends on the machine's CPU count -
   you and the lab have very different machines, which is useful here rather than a nuisance.
4. **Which dependency it is stuck on.** The optimizer names what it is bundling at higher log levels; a single
   package would turn this from a mystery into a pin.

Report what reproduces it and what does not, with the commands. If a one-line fix falls out, take it, with a
red-first demonstration that the stall happens without it - but do not invent one to close the issue.

Nothing to push unless there is a fix. Say **"report ready: &lt;file&gt;"** either way.

### Don't touch

`check/2026-10-27-batch`, and anything campus-related: a change making every campus map visible on production is
being written now.

## Batch 5 (aggiemap: #2453 Megan's baseball republish - the blocking issue for today's release; 27 October 2026, about 12:50 PM Central, from `work (aggiemap)`)

**Urgent, and it blocks a production release today.** The maintainer abandoned the dev build now deployed
because of this; the next dev build fixes it and goes to production today. Questions go to
`work (aggiemap)`.

[#2453](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2453), filed by
`meganmcmullen-rgb` this morning: *"New republish of baseball threw off our maps for parking/accessible
parking."* What she asks for, in her words:

1. *"Baseball parking map should have all layers (and lots, right now 100j is missing) except the
   accessible shuttle route"*
2. *"Baseball accessible should have all layers, including the accessible shuttle route, which should be
   on top of the parking lots"*

and her symptoms: *"Accessible baseball parking is missing icons, has lots doubled, and the shuttle under
the reserved 100j lot."*

### The cause, already traced - do not re-derive it

Everything is in **`libs/ts/events/ngx/src/lib/definitions/baseball-parking.definitions.ts`**, in
`BaseballParking_DevelopmentLayerSources`. Measured against the live development service
(`gis.dev.tamu.edu/.../Hosted/BaseballParking_view/FeatureServer`) at 12:45 PM Central today:

- **`/3 Baseball Event Parking Lots` holds 10 lots**: 8 with `type = 'Event Parking'` and **2 with
  `type = 'Reserved'` - Lot 100j and Lot 102**.
- `EVENT_LOTS`'s development source passes `onlyType: 'Event Parking'`, so the parking map draws 8 of the
  10. **That is Megan's missing 100j.**
- **`/0 Baseball Symbols` has no `type` field and no `event` field** on development - it carries the generic
  marker schema (`name`, `description`, `category_type` and so on). That is why the development source list
  has only one symbols layer, and the file's comment says so.
- But `BaseballParkingOptions` still names `ACCESSIBLE_SYMBOLS`, and it turns `EVENT_SYMBOLS` **off** in
  accessible mode. So on development the accessible map hides the only symbols layer that exists and shows
  one that does not. **That is Megan's missing icons.**
- In `BaseballParking_DevelopmentLayerSources`, `ACCESSIBLE_SHUTTLES` is declared **before** `EVENT_LOTS`
  and `ACCESSIBLE_LOTS`, so the lots draw over it. **That is Megan's shuttle under the 100j lot.**
- `EVENT_LOTS` is visible in **both** modes while `ACCESSIBLE_LOTS` is visible in accessible mode. Once
  `EVENT_LOTS` carries all ten, the two Reserved lots are drawn by both. **That is Megan's doubled lots,
  and fixing the first point alone makes it worse.**

### What to do

Four changes in that one file, then prove them:

1. `EVENT_LOTS`'s development source: **drop `onlyType`** so it draws all ten lots.
2. **Add an `ACCESSIBLE_SYMBOLS` development source** from `/0`, unfiltered, the same as `EVENT_SYMBOLS` -
   the layer has nothing to split on. Replace the file's comment that says the two "become one", because
   that is what broke it.
3. **Move `ACCESSIBLE_SHUTTLES` after both lots layers** in the array, so the shuttle draws on top.
4. **Hide `ACCESSIBLE_LOTS` in both modes** on development, since `EVENT_LOTS` now carries every lot. Keep
   the layer declared - production still uses it.

**Say in the report whether the parking map now excludes the shuttle route** (Megan's point 1): the option
already sets `ACCESSIBLE_SHUTTLES` invisible in event mode, so it should, but it needs looking at rather
than assuming.

### The thing to report and not act on

**The production side of this file is a separate problem and it lands today.**
`BaseballParkingColdLayerSources` filters on `baseball IN ('AnyValid','SeasonPass')`, `baseball = 'Permit'`
and `event = 'Baseball' AND type <> 'Accessible Shuttle Stop'` - columns the republished development
service does not have. Ten athletics definitions carry this fork. When the production services are
republished to match development, **every one of those production filters stops matching**. Do not change
them in this batch; say in your report what you see, so the director can put it to the maintainer.

### Proving it

- **Red first.** `libs/ts/events/ngx/src/lib/definitions/baseball-parking.lots.spec.ts` does not exist, but
  `football-parking.lots.spec.ts` does and is the model. Write a spec that fails on the unfixed definitions
  for the lot count and the accessible symbols source, then passes. Every bug gets a test (CLAUDE.md).
- `scripts/check-in-volume.sh fix/2453-baseball-republish ts-events-ngx,aggiemap-angular`. Per-target counts
  and the exit code.
- **Before and after**, on the dev server against this branch, 1280 x 900, `timezoneId: 'America/Chicago'`:
  the Baseball Event Map and the Accessible Baseball Map, each before and after. The after shots must show
  Lot 100j on the parking map, icons on the accessible map, the shuttle drawn over the lots, and no doubled
  lot. Commit to `docs/screenshots/2453-baseball-republish/`.
- One release-note file `docs/releases/unreleased/2453-baseball-republish.md` with its *What to test on dev*
  row. **Do not edit `unreleased.md`** ([#2037](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2037)).
- `docs/testing.md`: no row, no number change - this adds a unit spec, not a smoke spec.

Branch `fix/2453-baseball-republish` from `origin/development`, push to the fork, and say
**"branch ready: fix/2453-baseball-republish"**. I open the pull request.

### Don't touch

`fix/2459-construction-hatch` (work-lab-leila batch 160), `feat/2455-2457-2464-four-campuses` (copilot-home
batch 29), and the other nine athletics definition files.

## Batch 4 (security: #2425 - push the clean branch under a new name; 26 October 2026, about 3:40 PM Central, from `work (security)`)

**Start now. A few minutes.** Your batch 3 question 1: **the maintainer chose B** (26 October). Push your rewritten branch
(`34e42dae3`, then `160f65e80`) to `fork` as a **new** branch, `chore/2425-api-images-non-root-2`. No force-push. Read it back
with `git ls-remote fork` and put the commit in a short report, `home/reports/2026-10-26-4.md`, then push `home: batch 4 done - ...`.
The director deletes the old `chore/2425-api-images-non-root` from the fork once the new one is there, and opens the PR.
Thank you for catching the cluster details yourself.

## Batch 3 (security: #2425 - run the four API images as `node`, not root; a branch; 26 October 2026, 11:48 AM Central, from `work (security)`)

**Start now. About 1.5 hours.** The maintainer decided (26 October, Priority Medium): the API images stop running as root.
`apps/{gisday-nest,geoservices-nest,mailroom-nest,mailroom-helper-nest}/src/Dockerfile` set no `USER` in their
`node:24.22.1-alpine` runtime stage. The image already has the `node` user (uid 1000).

1. Branch `chore/2425-api-images-non-root` from the latest `origin/development`, pushed to `fork`.
2. In each runtime stage add `USER node` after the copies, with `COPY --chown=node:node` (or a `mkdir` and `chown`) for
   every folder the API writes at run time. Find those first: `git grep` the API and its libraries for `writeFile`,
   `createWriteStream`, `mkdir`, `multer` and `diskStorage`, upload or photo folders, and any `/tmp` or log path. List them in the report.
3. Build each image as `publish.yml` builds it, before and after. Show `docker inspect --format '{{.Config.User}}'` (empty before,
   `node` after) and `docker run --rm --entrypoint id <image>`.
4. Prove each one runs as `node`:
   - **gisday-nest:** on the GIS Day stack as in batch 2, start it and do every write it does, as far as you can without signing in
     on the Auth0 page (call `fitImage`, or the storage code directly, as in batch 2). The log must show no `EACCES` or `EPERM`.
   - **mailroom-nest, mailroom-helper-nest, geoservices-nest:** start each against what it needs (a SQL Server container is
     fine) and show that it stays up, with no permission errors.
5. **Read the cluster's deployments** in `C:\TAMU\kubernetes-config` (read only; change nothing there). For each API, note any
   volume mounted where it writes, and whether it needs `securityContext.fsGroup: 1000` or `runAsUser` to keep writing. That
   change is the maintainer's, so write it up as a list in the report.
6. `bash scripts/check-in-volume.sh <branch>` must exit 0. Add a `.pr-body.md` draft as the last commit. Report
   `home/reports/2026-10-26-3.md`, then push `home: batch 3 done - ...`. No PR (the director opens it).



## Batch 2 (security: prove the zod 4.6.6 override for jimp on branch chore/override-zod; 26 October 2026, about 7:30 AM Central, from `work (security)`)

**Start now. About 40 minutes.** The maintainer chose (26 October) to force `zod` 4.6.6 under `@jimp/types` and
`@jimp/plugin-resize` (jimp 1.6.1 asks for zod ^3, which has an unfixed High, GHSA-mrhx-c7xc-m3w5). jimp resizes GIS Day
speaker photos (PR 2382, `libs/common/node/images`), so **resizing must still work**.

Branch: `chore/override-zod` on the `fork` remote (danielgoldbergtamu), commit `29d2e1bc920409b4027f3ae58493e19d57e0c6a7`.

1. `bash scripts/check-in-volume.sh chore/override-zod` (full check, clean `npm ci`). Record the exit code; the
   `common-node-images` tests (`fit-image.spec.ts`, `image-size.spec.ts`) must pass.
2. Run the GIS Day stack locally from that commit (`scripts/gisday-local.sh`, `docs/gisday-local.md`) and, as the admin,
   upload a speaker photo three ways: a large JPEG taken on a phone (EXIF orientation), a PNG, and one already small. Each
   must save, be resized as before and show on the speaker page. Look in the API log for any `zod` or `ZodError`.
3. The same uploads on `origin/development`, so any difference is the override's. Save before/after captures under
   `docs/screenshots/override-zod/` in a branch of your own only if something differs; otherwise say so.
4. Report `home/reports/2026-10-26-2.md`, push `home: batch 2 done - ...`. No PR (the director opens it).


## Batch 1 (security: a check that the new Home - Work Listener chat answers; read only; 26 October 2026, about 7:25 AM Central, from `work (security)`)

The maintainer wants to see you respond before he leaves for the day. Short, read only, no branch.

1. Push `home: started batch 1` to `home/STATUS.md`, with `tools/heartbeat.sh home "running batch 1" 30`.
2. In a worktree at the latest `origin/development`, run the security-findings tests in a `node:24.22.1` container:
   `node --test tools/security-findings/` (the same tests `tools-tests.yml` runs). Record the pass and fail counts.
   **Correction, 6:58 AM:** that directory form reports 1 failure on Node 24 because it treats the folder as a file. Name the
   files instead: `node --test tools/security-findings/findings.test.mjs tools/security-findings/install-scripts.test.mjs`
   (18 pass on `be9581cdc`).
3. Run `bash tools/roster.sh` on `work-mailbox` and paste its table into the report.
4. Write `home/reports/2026-10-26-1.md` with the commit of `development` you used, the test counts and the table. Push
   `home: batch 1 done - <counts>`, then `tools/heartbeat.sh home idle 45`.

Batches here are numbered from now on.

## Decided (23 October 2026)

- From 23 October, all security and vulnerability work in this repository belongs to the security chat on the work
  machine ('js.monorepo - Security - CSA 305 Desktop'). That covers #2111 and everything under it, #2112 to #2120,
  #2135, Dependabot, CodeQL and secret-scanning alerts, and base-image updates. Don't put any of it in a batch for any
  machine. If you find something, file the issue with every field, write 'for the security chat' in your report, and
  leave it unfixed.
- Directors send work to an idle listener whenever one can do it, the lab first: see "The director" in `DIRECTOR.md`.

## Withdrawn (23 October 2026, 10:00 AM Central): both GIS Day batches below

The maintainer could not start home today, so the work machine is doing both itself: the #1474 focus photos and
#2142. **Do neither.** They stay below only as a record. Nothing for GIS Day is waiting on home.

## Batch (gisday: #1474 keyboard focus photos) - 23 October 2026, 9:05 AM Central

From the GIS Day director (work). Sent here because `work` is saturated by the security chat's check and the lab is
on batch 17. About 40 minutes.

Branch `fix/1474-gisday-template-a11y` on the fork, at `9948dd977` (your `85df2be00` plus the release-notes entry
`docs/releases/unreleased/1474-gisday-accessibility.md`). Before its pull request it needs the before/after photos you
named in your handover.

### What to do

1. Run the local GIS Day stack (`scripts/gisday-local.sh`, `docs/gisday-local.md`), once from `origin/development`
   (before) and once from the branch at `9948dd977` (after). `web --static` is not merged yet; use the dev server, or
   build `--configuration local` and serve it as you did before. **Never a `--configuration=production` build before
   the photos**: it overwrites the local dist and sign-in fails.
2. With the keyboard only (Tab, then Enter or Space), photograph at 1280 wide, before and after:
   - the header's **Login**, focused;
   - a **FAQ** question, focused, then opened with Enter;
   - signed in as the test admin, **Admin, then Events**: a row's action buttons, focused;
   - a season's **day tile** (add or remove), focused.
   "Before" is whatever Tab reaches instead. Say so in the report, with what `document.activeElement` was.
3. Save each as it is taken to `docs/screenshots/1474-gisday-accessibility/before-<what>.png` and
   `after-<what>.png` on the branch. Add them as a before/after table to the release-notes entry (paths
   `../screenshots/1474-gisday-accessibility/<file>.png`), and change its "Nothing looks different" to say that only
   the focus outline shows. Run `node scripts/collate-release-notes.mjs --check`.
4. Commit on the branch, check the line endings are LF, and push to the fork.

### Then

Report `home/reports/2026-10-23-1.md`: the new head commit, each file, what Tab reached before. Say "work report
ready". Do not open the pull request; the director does. Nothing on GitHub.

## Batch (gisday: #2142 the Texas A&M site shows only Texas A&M's events) - 23 October 2026, 9:50 AM Central

From the GIS Day director (work). **Start it after the #1474 batch above is pushed.** High priority: GIS Day is 17 to
20 November. Development, so it is yours.

[#2142](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2142) says what and why; read it
first. **Decided by the maintainer:** an event belongs to Texas A&M's GIS Day by its place (event → location → place).
No new field on events. txgisday.org keeps listing everything.

### What to do

1. Branch `feat/2142-gisday-tamu-events` from the latest `origin/development`, in its own worktree.
2. Work out how a place is marked as Texas A&M's, choosing between a list in the `tamu` site's definition
   (`libs/gisday/common/src/lib/sites.ts`) and a field on the place. Prefer the one that needs no schema change.
   Say in the report which, and why.
3. **Take the "before" photo first**, of the local Sessions page served as the `tamu` site
   (`scripts/gisday-local.sh web --site tamu`), into `docs/screenshots/2142-gisday-tamu-events/before-sessions.png`.
4. Write the tests first and prove them red against the unchanged code. On the `tamu` site, an event at another
   school's place is not listed and one at a Texas A&M place is; on txgisday.org, both are listed. Then make them
   green. Cover every place events are listed: Sessions, the home page's schedule, and any other.
5. Count the events in the local database with no location or place. Those are the ones the `tamu` site would stop
   showing.
6. Take the "after" photo; add the release-notes entry `docs/releases/unreleased/2142-gisday-tamu-events.md` with
   both photos and a What to test row. Run `node scripts/collate-release-notes.mjs --check`.
7. Commit, then `scripts/check-in-volume.sh feat/2142-gisday-tamu-events`. It must exit 0, including the
   `gisday-angular` production build, which checks the bundle budgets. Take that build only after the photos,
   because it overwrites the local dist. Push to the fork.

### Then

Report `home/reports/2026-10-23-2.md`: the branch and head commit, the choice from step 2, red then green test
output, the check's exit code and time, the event count from step 5. Put any questions under **Questions for the
home session**, addressed to the GIS Day director, with options and a recommendation. Do not open the pull request;
the director does. Nothing on GitHub.

## Batch (22 October 2026, 12:05 PM Central) - watch Azure for the production deploy

The maintainer approved the production release and it is rolling out now. **This machine is the only one
with Azure access**: `az-releases.py` and the token are here, and neither `work` nor `work-lab-leila` has
them.

### What to do

1. **Poll Azure** until the release reaches **production**, then report in your `STATUS.md`:
   - the **release number**,
   - the **commit** it carries, in full,
   - the time it succeeded, in US Central.
2. **Push it as soon as you have it.** Three things wait on that commit: the `prod-*` tag, the production
   release tier, and closing
   [#1778](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1778) for the team.
3. **Say the commit even if it is not the one anyone expects.** The build was expected to carry
   `36b962a04` - the three GIS Day changes on top of the tested `61161ce1b` - but what matters is what
   Azure says actually shipped, not what was meant to. The `prod-*` tag goes on what shipped, which is
   what makes "we shipped what we tested" a fact rather than an assumption.

**Never read the build from a bundle name.** Each stage bakes its own analytics id in, so one commit gives
different bundle hashes on dev and production. Azure is the only thing that answers "which commit", which
is why this is yours and not the testing machines'.

### Then

Back to listening.

## Batch (21 October 2026, 9:30 AM Central) — watch Azure and name the commit that reaches dev

The maintainer is deploying the latest dev build to the dev environment now. **Two builds were in play
this morning** — `67e95b4b1`, and `61161ce1b` which adds #1969's lot-link fix (PR 2064) — so nobody
should assume which one lands.

`work-lab-leila` has the release tier queued and is **held** until the commit is named. It cannot read
Azure: no Python, no script, no token. Those are on this machine, which is why this is yours.

### What to do

1. **Poll Azure** with `C:\TAMU\logs\az-releases.py` until a release reaches **dev**, then report, in
   your `STATUS.md` and plainly:
   - the **release number**,
   - the **commit** it carries, in full,
   - the **environment**, and the time in US Central.
2. **Push that the moment you have it.** The lab machine is watching the branch and starts a
   thirty-minute tier on it; every minute it waits is a minute off a release that carries dates for a
   season starting 2 November.
3. **If the commit is neither of the two above, say so and stop.** That would mean something was built
   that nobody here expects, and a tier against it clears nothing.

**Never identify the build by bundle name.** Each stage bakes its own analytics id in, so one commit
produces different bundle hashes on dev and production. Azure is the only thing that answers "which
commit".

### Then

Back to listening. The tier is the lab machine's; the release notes are the work machine's.

## Batch (21 October 2026, 8:55 AM Central) — read Azure and say when today's build is on dev

Small, and two machines are waiting on it.

**`work-lab-leila` has the release tier for today's build (its batch 8) and cannot start it**, because it
cannot identify which commit dev is serving. It has no Python, no `C:\TAMU\logs\az-releases.py` and no
Azure token. **Neither does the work machine** — I looked. Those are on *this* machine, and the handover
named the path without naming the machine, which is why two machines went hunting for it.

### What to do

1. **Read Azure** with your `az-releases.py` and say whether a release carrying **`67e95b4b1`** has reached
   **dev**, and what the release number is.
2. **Push that to your `STATUS.md`** as soon as you have it — `work-lab-leila` is watching the branch and
   starts its tier on it. Say it plainly: the release number, the commit, and the environment.
3. If the build has not finished yet, say so and say what the newest dev release *is*, so nobody tests the
   previous one by accident.

**Do not read it from a bundle name.** Each stage bakes its own analytics id in, so one commit produces
different bundle hashes on dev and production — a bundle name cannot identify a commit across environments.
That is the whole reason this read exists.

### Then

Nothing else; back to listening. The tier is the lab machine's, and #1969 is its batch 6 — the branch is
pushed at `1199f263`, with images, the notes file and its pull request still to come.

### Worth fixing while you are in there

The handover said "`C:\TAMU\logs\az-releases.py`, PAT from the user environment" without saying **on
home**. Add the machine, so the next director does not send someone to the wrong box. A path with no
machine is not an instruction on a four-machine branch.


## No batch tonight (20 October 2026, 7:35 PM Central)

Batch 12 is done and nothing follows it tonight. The maintainer has decided: #2007, #1974's second half
(NestJS 12) and #1973 (Vitest 5) all stay parked. Five pull requests are queued or coming and those need his
attention before any new work starts.

**Your question 1 from report 10 is answered: A, accept it as is.** The load you tested — 14 of 20 CPUs taken
by something unrelated — is heavier than the real case this fixes, the limit still names a starved machine
rather than hiding it, and the release tier already forbids anything heavy beside it. Finding Service Parking's
exact threshold would cost 45 minutes to refine a number we have just established should not be the thing we
rely on.

Your PR is open: [2013](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2013).

**One thing worth knowing for next time.** You reported `check-in-volume.sh` on that branch as "affected check
exit 0". It was exit 0 — and it ran nothing: `No tasks were run`, three times, because the only file you
changed lives in `test/smoke/aggiemap/`, which is not an Nx project. The exit code was real and the check was
empty. `tsc -p test/smoke/aggiemap --noEmit` is the one that actually typechecks the suite, and it is what the
pull request quotes. Not a criticism of the work, which was good — it is the trap CLAUDE.md describes, and it
caught this machine once today as well.

**You are about to become the director**, when the maintainer gets home. Read `DIRECTOR.md`'s **Handover**
section before you do anything else.


## Read this first (20 October 2026, 11:05 AM Central)

**Stop the NestJS 12 work and start batch 10.** Two reasons, and neither is a criticism of the work:

1. **Batch 10 (#1986) is what the maintainer asked for**, twice, in his own words, and it has a deadline that
   NestJS 12 does not: #1987 is still live on production and #1981's fix is not deployed, so the check can be
   proven against two real faults *now* and not after they ship. Batch 10 says what to do.
2. **NestJS 12 would collide with work already in flight here.** `development` moved when the maintainer merged
   PR 1984 (Nx 23.3) and PR 1983, and PR 1985's branch conflicted on `package.json` and `package-lock.json`.
   The work machine has resolved that to **Nx 23.3.0 with NestJS 11.2.7**, rebuilt the lock from the resolved
   `package.json`, and is running the full affected check on it now. A second NestJS move on top of an unmerged,
   unchecked NestJS 11 is two dependency changes in flight at once.

NestJS 12 and #1973 come back after batch 10; nothing is thrown away.

**The protocol point, for next time:** the task file is the work. When a batch finishes and there is no next
one, say so in `STATUS.md` and wait — don't pick the next thing. That is the director's call, and it is the
rule the cloud session has had all along.

## What the work machine did with your batch 9 branch

`fix/1988-legend-numeric-where` is good work and the report is exactly what a report should be. The PR is being
opened here. **The before is already captured** from production, with the fault measured as well as
photographed: both legend groups show one row with **no** symbol, which is #1987 exactly. So don't re-take it.

Your note about `docs/testing.md` is right and is handled: PR 1989 takes the total to 481, and #1988's branch
will get `development` merged in and the total set to 482 before its PR opens.

Written by the work session **only while another machine directs** (see `DIRECTOR.md`). The home session does each new batch here,
as `DIRECTOR.md` says for a listener. Development work: branches, agents, pull requests.

## Both urgent fixes are merged (20 October 2026, 1:45 PM Central) — batch 10's window is still open

PR 1989 (#1981) and PR 1990 (#1987, #1988) are both on `development`; all three issues are closed.

**This does not close batch 10's window, and the distinction matters.** Production is still serving
`prod-2026-10-20` (`8463ac6af`), which predates both fixes, so **both faults are still live on
aggiemap.tamu.edu** and #1986's check can still be proven red there. That stays true until a production
deploy, not until the next dev build. Dev loses them as soon as the next dev build goes up.

So: **prove the check against production, and say the bundle hash you saw**, the way the baseline tool records
one — a tag is a claim, the bundle is the proof. If you prove it against dev instead and dev has already moved,
the check will pass and prove nothing.

Rebase batch 10's branch on the latest `development` before you go much further: `docs/testing.md`'s total is
now **482** and both of those fixes added a spec, so a branch cut before today will fight you over that line.

## For batch 10, measured here (20 October 2026, 11:50 AM Central)

While opening PR 1990 the work machine ran the DOM legend scan on ten maps, production against a local
production build of your branch. Three things it learned that batch 10 should not have to rediscover:

- **The routes need `/map/d`**, and the real names are `/parking/visitor-parking`, `/parking/motorcycle-parking`,
  `/parking/accessible-parking`, `/parking/ts-main-parking`, `/parking/service-loading`. A wrong route does not
  fail: the SPA fallback serves `index.html`, the page renders, and the scan reports zero layers and zero legend
  groups, which reads exactly like a map with nothing switched on. **A check for #1986 has to fail on a route it
  cannot load, not record an empty result.** This caught the work machine out twice before it noticed.
- **The main map (`/map/d`) shows nothing to a DOM scan**: its layer list is behind the menu, so `.layer-item`
  does not exist until something opens it. Every event and parking map renders its list on load. So the
  read-from-the-page approach covers the maps built from definitions and *not* the main map, which is the one
  with the most layers. Worth weighing when you choose between that and the build-time manifest.
- **`/parking/service-loading` did not settle** inside 70 seconds on one of the two runs. Whatever #1986 does
  about a map that does not settle, it should say which, not skip quietly.

The scan itself is `legend-compare.mjs` on the work machine; ask for it in your report rather than writing it
again. Result, for the record: **0 regressions, 4 groups fixed.**

## New: say when you will next be heard from (20 October 2026, 9:00 PM Central)

`DIRECTOR.md` has a new section, **Saying when you will next be heard from**, and it applies from batch 13:
when you start, write `Next update by HH:MM Central` in your `STATUS.md` and push it **before** beginning
the work; move it on as you push progress; remove it when you report. If you need longer, push a new one
with a line saying why — running late is fine, a missed deadline with no explanation is not.

The reason is tonight's: the lab machine sat blocked on approval prompts and nothing could tell, because a
blocked session and a busy one look the same from outside. A deadline set before you can get stuck is the
only thing that survives you being unable to speak. A branch watcher was tried and gave three false alarms
in two days while catching nothing real.

Batch 13 has no stated duration because it predates this. Put a deadline on whichever part you are on.

## Batch 13 (20 October 2026, 8:20 PM Central) — the team's own issues, and you open the pull requests now

**Change of practice, decided by the maintainer tonight: you open your own pull requests.** You have `gh` -
you have been filing issues with it all day - and routing every branch through the director has been adding a
wait for no benefit. Open them as [CLAUDE.md](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/blob/development/CLAUDE.md)
says: issue first, body built **from the template file**, every field set, before/after images committed and
linked by raw URL pinned to a commit, an entry in `unreleased.md` and a row in *What to test on dev*.
`work-lab-leila` still cannot - it has no `gh` - so its branches keep coming back to the director.

**And the ordering rule behind this batch:** the team's own issues outrank anything we invent. Two urgent
issues filed by the team today sat untouched for hours while machines did tooling work. That is the habit
being corrected, not the tooling.

### 1. #2001 — Women's Basketball parking updated (urgent, team-filed 3:36 PM)

**[#2001](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2001).** The map has
been updated on dev and women's basketball starts **2 November**, so this has a real deadline. It should now
have exactly two layers:

- Accessible Parking Spaces
- Women's Basketball Event Parking Spaces

Read the issue and its screenshot before changing anything; the maintainer's words and the picture are the
specification, not this summary.

**It overlaps work already merged.** `fix/1992-accessible-parking-sports-maps` changed Women's Basketball's
Accessible Parking Spaces layer to take its symbol from the portal item - that branch is open as a pull
request and may be merged by the time you start. Check `development` first and build on whatever is there;
do not revert or duplicate it.

`map-layers.spec.ts` covers this map, so a layer list that disagrees with the definition now fails. Run it
red-first on dev if the dev map already shows the new state, and say what it printed.

### 2. #1970 — the wrong popup on a deep-linked feature (High)

**[#1970](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1970).** A feature
opened by `?lot=`, `?feature=` or a search result is drawn in the main map's `selection-layer`, a graphics
layer titled **Selected Buildings** whose popup is the buildings popup - so the panel says "Selected
Buildings" and shows the wrong fields. A branch exists from earlier today, `fix/1970-selection-popup-title`
(`32895a0af`), which was paused before the images were taken. Check what is on it, merge the latest
`development`, finish it and open the pull request.

### Then stop

Nothing else tonight unless the maintainer or the director says so. #2007, NestJS 12 and #1973 stay parked.

### Still true, and worth not relearning

- **A green check can mean nothing ran.** `check-in-volume.sh` on a branch that only touches
  `test/smoke/aggiemap/` returns exit 0 with `No tasks were run`, because that is not an Nx project. It
  caught this machine on batch 12 and the work machine twice today. Read the log. For the suite,
  `tsc -p test/smoke/aggiemap --noEmit` is the real check.
- **`docs/testing.md`: add no row and change no number** unless you add a spec ([#2002](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2002)).
- **Production still carries every fault fixed today** - nothing has deployed since `prod-2026-10-20`. That
  is why red-first against production still works for anything fixed today but not yet released.

## Batch 12 (20 October 2026, 6:05 PM Central) — #2008: the settle limit measures the wrong thing

Batch 11 was excellent work and all three branches are in flight here. This is small and closes a loop the
new lab machine opened.

### What happened

`/parking/maintenance-parking` failed `map-layers.spec.ts`'s 240-second settle limit on two machines under
six workers, and passed when run alone. A third machine joined today with 24 CPUs and 64 GB, and
**[#2008](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2008)** was given to it
precisely because 6 workers is not contention there. Its answer:

| Run | Workers | Maintenance Parking |
| --- | --- | --- |
| whole spec | 6 | passed, 41.5 s |
| whole spec, repeat | 6 | passed, 46.6 s |
| that map alone | - | passed, 43.4 s |

Against 134 s and 147 s on the loaded machines. Five other maps loading beside it made no measurable
difference. **So the 240-second number measures how much CPU the machine has to spare, not how long the map
takes to draw.** The maintainer has agreed the fix.

### The fix

Tag Maintenance Parking and Service Parking (`/parking/service-loading`) as **`@heavy`** in
`map-layers.spec.ts`. That mechanism already exists from
[#1716](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1716): heavy tests run
after everything else, two at a time, so they are not settling against five other map loads. The 240-second
limit then stays a real "this map has become slow" signal instead of being padded into a guess about the
machine.

Those two maps are the ones that load every parking space on campus - the
[#1897](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1897) family. If you find
others in the spec with the same shape, say so rather than tagging them on a hunch.

**Do not raise the limit**, and do not scale it by worker count: both turn a measurement into a guess, and
the point of this change is that the limit should mean something.

### Proving it

The honest difficulty is that this is a fix to a failure that only appears under load, so "it passes now"
proves little on an idle machine. What *can* be shown:

- the two tests are tagged and the heavy lane picks them up — the run reports them running after the rest;
- the whole spec still passes on a local production build;
- the run's wall-clock time, before and after, so a reviewer can see what tagging two tests costs.

If you can reproduce the original failure by loading your machine deliberately, that is better evidence than
any of the above and worth the extra few minutes. If you cannot, say so plainly in the report rather than
implying the fix is proven.

### The rest

Branch `test/2008-heavy-space-maps` from the latest `development`. `Closes #2008`. **No pull request** — say
"branch ready" and this machine opens it. `docs/testing.md`: **add no row and change no number**, including
the Total. That rule landed today as
[#2002](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2002): three pull requests
conflicted on that one line in an afternoon, the check never reads the counts, and they are refreshed at
release from a measured run.

### Still parked

#2007 (replace `lotFill` with `symbolFromServiceClass`, Low), #1974's second half (NestJS 12) and #1973.

## Batch 11 (20 October 2026, 3:25 PM Central) — #1991, #1992, #1993: the three your own check found

Batch 10 did what it was asked to and then some: `map-layers.spec.ts` found three faults on public maps that
nobody knew about. The maintainer has set **all three to High** and put them on the board as Todo. They are
yours. PR [2000](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2000) is open for
#1986 itself, so the check is in flight while you fix what it caught.

### Decided (the maintainer's answers to report 8)

1. #1991 **High**, #1992 **High**, #1993 **High**. (You suggested Medium for #1993; he said High.)
2. Open #1986's PR now and leave production red on the three — **done**, that is PR 2000. Do **not** add them
   to `environments.json` as allowed failures. The point of the check is that they are visible.
3. "Drawn" stays **at least one feature**, with the share as an annotation. Your recommendation, taken.
4. The settle limit stays **240 s**, with a map that does not settle failing and saying so. Taken.
5. The quick tier stays as it is. Taken.
6. `drawn-symbols.spec.ts` is **deleted** — done here, on #1986's branch, with `docs/testing.md`'s total at
   **551**. Don't re-add it.

### The work

Three issues, and they are not three separate investigations — **#1991 is #1981 again**:

- **[#1991](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1991)** — Vendor
  Parking draws 0 of 10 lots, `LotType` undefined on every feature. That is exactly #1981's cause: the
  service's renderer keys on `GIS.TS.ParkingLots.LotType`, which the service does not publish. #1981's fix
  (`8e505e2fd`, `lotFill` in `business-parking.definitions.ts`) is the pattern — **reuse it, don't copy it**.
  If the same shape is now wanted on two maps, it belongs somewhere both can import, not pasted twice. Keep
  the comment explaining why the override exists, as `docs/map-layers.md` requires.
- **[#1992](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1992)** — Accessible
  Parking Spaces on Women's Basketball, Indoor Track and Softball: the renderer asks for
  `Disabled,Volleyball` and the data says `Accessible,Basketball`. Three maps, one layer, so one fix should
  clear all three. Worth checking whether any *other* map uses this layer before deciding where the fix goes.
- **[#1993](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1993)** — Indoor
  Track's Team Bus Parking has no symbol for lot type `SPORTS`. Smallest of the three.

**Whether any of these is really ours to fix is a fair question** — #1991 and #1992 both look like the
service being wrong rather than us. Say so in the report if that is what you find: the maintainer is already
sending Transportation Services a note about #1981's field, and these would go in it. But the maps should
draw correctly in the meantime either way, which is what #1981 did.

### How to prove each one

`map-layers.spec.ts` already fails on all three, on production, naming the maps. So: **run it red first on
production and quote what it said**, then green on a local production build of your branch. No new spec is
needed unless you find something it does not cover — if you do, that is the more interesting finding, say so.

### The rest

One branch per issue if they are genuinely separate, or one branch for #1991 and one for #1992+#1993 if the
sports maps share a fix — your call, say which and why. From the latest `development`; `docs/testing.md` is
at 551 once PR 2000 merges, so rebase rather than guess. **No pull requests**: say "branch ready" and name the
before/after each one needs, and this machine takes the images and opens them.

### Still parked

#1974's second half (NestJS 12) and #1973. NestJS 11 merged as PR 1985, so NestJS 12 no longer stacks on an
unmerged branch — but it waits until these three are done.

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
