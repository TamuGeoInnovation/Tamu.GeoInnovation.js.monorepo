---
issue: 3571
app: gisday
title: Add season leaves only the new season active
testOnDev: |
  | One active season after Add season ([#3571](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3571)) | GIS Day dev site: Admin, Seasons | Only with a later season that is not active (for example one added ahead of time): click **Add season**, and only the new season shows **ACTIVE**. Do not add a season on dev unless one is wanted: it copies the latest season |
---

### Add season leaves only the new season active

**Add season** copies the latest season into the next year and makes the copy active. It turned off the latest season
only, so when the active season was an earlier one, both stayed active. It now turns off whichever season is active.
Production was not affected yet: its latest season is also its active one.
([#3571](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3571))

| Before                                                                                                    | After Add season, unfixed                                                                                           |
| --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| ![The seasons list with 2026 the only active season](../screenshots/980-season-create/before-list.png) | ![The same list after Add season: 2032 and 2026 both active](../screenshots/980-season-create/after-create.png) |

The fixed behaviour is shown by a test, `season.service.clone.active.spec.ts`, rather than a capture: reproducing it
needs a made-up later season on a local stack.
