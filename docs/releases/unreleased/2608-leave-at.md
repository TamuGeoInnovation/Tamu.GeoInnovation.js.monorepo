---
issue: 2608
app: aggiemap
title: The trip planner's Leave at shows a time you can change
testOnDev: |
  | Leave at ([#2608](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2608)) | [dev.aggiemap.tamu.edu/map/d/trip](https://dev.aggiemap.tamu.edu/map/d/trip), and [a link with a time](https://dev.aggiemap.tamu.edu/map/d/trip?time=leave&at=2026-11-05T21:30:00.000Z) | In the trip planner, choose **Leave at** from the menu: a time appears beside it, the current one, and can be clicked to change. Open the link: the time reads **11/5/26, 3:30 PM** |
---

### The trip planner's Leave at shows a time you can change

Choosing **Leave at** in the trip planner showed nothing to choose a time with, and a shared link with a time showed
an empty space where the time belonged. Both now show the time, and it can be clicked to change.
([#2608](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2608))

| Before                                                                                                     | After                                                                                            |
| ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| ![Leave at chosen, and no time to choose](../screenshots/2608-leave-at/before-menu.png)                    | ![Leave at chosen, with the current time beside it](../screenshots/2608-leave-at/after-menu.png) |
| ![A link with a time: an empty space where the time belongs](../screenshots/2608-leave-at/before-link.png) | ![The same link: 11/5/26, 3:30 PM](../screenshots/2608-leave-at/after-link.png)                  |
