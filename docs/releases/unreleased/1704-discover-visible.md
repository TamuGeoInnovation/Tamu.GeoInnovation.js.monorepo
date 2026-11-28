---
issue: 1704
app: aggiemap
title: Development lists one Move Out per period, as production does
testOnDev: |
  | One Move Out per period ([#1704](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1704)) | [Campus Events](https://dev.aggiemap.tamu.edu/all-maps/campus-events), and the All Maps search for "move out" | Three move-out maps: **Spring Move Out** under Spring, **Summer I** and **Summer II Move Out** under Summer, and no undated **Move Out**. The search offers the same three. [/events/move-out](https://dev.aggiemap.tamu.edu/events/move-out) still opens |
---

### Development lists one Move Out per period, as production does

Move Out has three dated maps, one per period, and the original undated map is kept only so links to it still work. It
was hidden from production's listings but still listed on development, beside the three, so development did not show
what production would. A map hidden from the listings is now hidden on every environment, development's search and All
Events list included; a map meant for development only is marked as such and is still listed there alone. The undated
map's address still opens it.
([#1704](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1704))

| Before, on dev                                                                                                                                                     | After                                                                                                                                                        |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| ![Campus Events on dev listing an undated Move Out under Spring beside the three dated periods](../screenshots/1704-discover-visible/before-campus-events-dev.png) | ![Campus Events listing Spring, Summer I and Summer II Move Out and no undated Move Out](../screenshots/1704-discover-visible/after-campus-events-local.png) |

The "after" is a development build of this change run locally, with development-only features on, as dev has them.
