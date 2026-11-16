# The campus tiles

The ten pictures in this folder are the thumbnails on [`/all-maps/campus`](https://aggiemap.tamu.edu/all-maps/campus)
and in the Campus Maps section of `/all-maps`. They are committed captures of each satellite campus's own
map, not generated at build time, so **a map that changes how it draws leaves its tile out of date until
somebody retakes it.**

That is what happened in [#2533](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2533):
the construction symbology changed, and two tiles went on advertising the old pink fill.

This file exists because nothing recorded how they were made, so retaking two of them meant deducing the
recipe from the pictures themselves - the window size from their dimensions, and the fact that the sidebar
was closed *after* the map opened from where the map sits in frame
([#2610](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2610)).

## Retaking one

**All ten are 800 x 400.** Match the set; a better-framed tile that does not match its neighbours is worse
than a faithful one.

1. **Open the campus's own map** from `/all-maps/campus` - `/campus/<slug>` - on a **deployed environment
   running the code you want the tile to show**, not a local build, in an **800 x 400** window.
2. **Add `?as=production`.** See below - this is not optional.
3. **Wait for the map to finish drawing**: `probe.ready`, then `probe.drawing === false`. `ready` is not the
   signal for a screenshot; [`docs/testing-maps.md`](../../../../../../docs/testing-maps.md) explains why,
   and notes that **no probe signal can tell you the map is not blank** - only looking at pixels can.
4. **Close the sidebar, then wait for `drawing === false` again.** The map ends up centred where the *open*
   sidebar's padding left it, which is what puts every feature where the existing tiles have it. Closing it
   first gives a different framing.
5. **Hide dev's "Viewing as production" notice** before capturing. It is dev's own banner, which production
   never shows, and it otherwise sits across the bottom of the picture.
6. **Save as JPEG at 1x.** Quality 80 matches the eight older tiles (20-48 KB). The two hatched ones were
   saved at **quality 90** (68 and 61 KB) on purpose, because the construction hatch is thin lines that 80
   smears. Prefer 80 unless the map has fine detail that needs 90, and say which you used.

Then **check the result at 287 x 145** - the smallest size any page renders a tile at, `/all-maps` on a
375 px screen. Detail that reads at 800 x 400 can turn to mush there. **If it does, that is a reason not to
ship the tile**, and probably an argument about the map's symbology rather than about the capture.

## `?as=production`, and why it matters more than it looks

A tile is a **committed production asset**, and **nothing in the repository checks a picture.**
`test/smoke/aggiemap/development-only.spec.ts` enforces that production never *requests* a
development-only service ([#1229](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1229)),
but it reads network requests, not images. A tile captured on dev without `?as=production` can show a
development-only layer or basemap, and it would then ship to production inside a JPEG with nothing able to
see it.

So: capture production-shaped, and confirm the page made no development-only requests while you did.

## A limitation that is deliberate, so please do not "fix" it

**Fort Worth Law's and Houston Space Institute's construction does not all fit** an 800 x 400 picture at
their opening zoom (17). Measured from each service's own extent: Fort Worth's construction is about
348 x 585 px at that zoom and Houston's about 485 x 454 px, against 400 px of height.

**The old tiles cut it off in the same places** - Fort Worth's northern strip by 11th and 12th Streets and
the bottom of its two southern parcels, and the top and bottom of Houston's site. Everything fits at zoom
16, one step out.

The committed tiles keep the opening view, because matching the other eight was judged more valuable than
showing the whole of two campuses' construction. If that trade is ever revisited, it should be revisited
for all ten at once.
