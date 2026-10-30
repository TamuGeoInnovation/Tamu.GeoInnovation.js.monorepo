# home: every question still open, in one place

From `home` (the Listener chat), Friday 30 October 2026. **The maintainer asked for these to be answered on the director's machine,
not spread across two**, so this file gathers every question home's reports have raised that nothing has settled since. Each
batch report keeps its own copy for context; **this file is the one to answer from.** Numbered afresh, each with a recommendation.
Answers go back in the next batch under **Decided**.

## Already settled, so not asked again

- The vector basemap's opening zoom and zoom limit: PR 2518 merged as built (one level closer, limit 1:282).
- #1961, the restroom popup: PR 2531 merged with the dedicated popup.
- #2532, Houston's hatch over building B500: PR 2541 merged as built.
- #2552's priority: High.
- Whether PR 2557 closes #2552 as well as #2061: it closes both.

## AggieMap

**1. Priority of #2520** (the NSC and Break/Summer services return their lots without geometry, so their popups never open)
- **A. Medium ← recommended** (two maps the public opens, out of season until spring)
- B. Low

**2. Who asks Transportation Services to republish the NSC and Break/Summer layers?** That is the fix; the repository's part afterwards is
one key change and two lines out of `environments.json`.
- **A. The maintainer ← recommended** (a request to another department)
- B. The director drafts it for the maintainer to send

**3. #959: restart the CMS migration?**
- **A. Park it, and close it as not planned ← recommended** (AggieMap only for now; the old PR 381 stays as the record)
- B. Restart it

**4. #960: the namespace that mixes the parked CMS experiment with production dining**
- **A. Decide it with #959; if the CMS is parked, delete its workloads ← recommended** (an option the issue doesn't list)
- B. Move the CMS workloads out (the issue's option 2)

**5. #962: Azure DevOps**
- **A. Keep Azure for now, and split off the two jobs worth doing anyway: back up the app configs and release definitions, and review
  the old deploy keys ← recommended** (recent work builds on Azure)
- B. Plan the retirement now

**6. Priority of #2527** (smoke checks for the side panel, its items, and the main map's event notice click-through)
- **A. Medium ← recommended** (the controls every visitor uses)
- B. Low

**7. #141 (directions to a point of interest): when to close it?** The mismatched spatial references no longer happen; a whole trip
can't be shown while #659 breaks routing with directions.
- **A. Leave it open until #659 is fixed, then test a whole trip ← recommended**
- B. Close it now, and let #659 cover the rest

**8. Priority of #2529** (some restrooms carry the wrong building number in their service; the Student Services Building says 0416, it
is 1546)
- **A. Low ← recommended** (2 or 3 of 116 records; Facilities fixes the data)
- B. Medium (a busy building, and the popup now shows its number)

**9. Football parking's `as unknown as` casts on its hatch symbols,** which the `common-types` fix in #2532 made unnecessary
- **A. Leave them for #1028's audit ← recommended**
- B. A small follow-up issue

**10. The 14 empty points in production's baseball symbols layer** (every field null but `author`; they drew as black dots before the
republish and now draw nothing)
- **A. Leave them, and mention them to the GIS team when convenient ← recommended** (nothing visible is wrong)
- B. An issue for the GIS team to delete them

**11. The graduation layer-order check in PR 2557 takes 12 minutes for its three loads**
- **A. Keep it, marked heavy so it runs nightly only ← recommended** (graduation is seasonal; an order mistake is visible, not urgent)
- B. Keep it as it is
- C. Drop it, keeping the dining and muster rows

**12. Women's basketball: refresh every minute too?** (#2558 did men's only, as asked. Women's service was last edited 27 October.)
- **A. Yes, in its own small PR, once the maintainer confirms staff edit it on game day ← recommended** (the same helper and spec)
- B. Leave it until someone asks

**13. The misleading layer ids in `mens-basketball.definitions.ts`** (`GATES` is the icons layer `/0`, `SYMBOLS` the closures `/1`)
- **A. A small follow-up issue, after 3 November ← recommended** (the ids live in map links, so not urgent work)
- B. Leave them

**14. Confirm: the construction hatch's label at 60% opacity** (raised during #2459; I can't tell from the merged work whether it was
decided)
- **A. 60% ← recommended** (the director's own pick)
- B. Leave it as it is

## Security

**15. `deepmerge`: our two imports** (`layer-sources.service.ts` and `event.service.ts`; every merged object is compile-time data, so not
exploitable)
- **A. Replace with a small `deepMerge` helper in `libs/common/utils/object` and remove the dependency ← recommended** (no new
  dependency; easy to match and test)
- B. Switch to `deepmerge-ts` (maintained, 30M a week, a different API)
- C. Leave it (the count stays above zero)

**16. `deepmerge`: the dev-only paths** (`jest-config`, `fork-ts-checker-webpack-plugin`; no upstream has dropped it, no fixed release)
- **A. An `overrides` alias to `@oss-cve-patches/deepmerge@4.3.2`, pinned exactly, once jest and a Nest webpack build pass with it
  ← recommended** (proven to bring `npm audit` to 0 in a scratch copy; a three-line patch, but a new single-maintainer publisher)
- B. The same with `@afeisite/deepmerge-clone@4.3.2`
- C. Accept the dev-only lows and document them
- D. Move all jest projects to vitest and drop `@nx/webpack` (a large migration)

15A alone leaves 13 dev-only findings; **15A with 16A reaches zero.**
