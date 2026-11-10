---
issue: 2804
title: Directions are on production - the trip planner, the Directions tab and "Directions To Here"
testOnDev: |
  | Directions everywhere ([#2804](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2804)) | [dev.aggiemap.tamu.edu/map/d/trip?as=production](https://dev.aggiemap.tamu.edu/map/d/trip?as=production), then a building, such as [?bldg=0468&as=production](https://dev.aggiemap.tamu.edu/map?bldg=0468&as=production) | As production: the Directions tab is there, a building's popup offers Directions To Here, and choosing two points draws a route with its minutes and miles. No maintenance message, no Options link, no network picker |
---

### AggieMap: directions are on production

The trip planner, the **Directions** tab and every **Directions To Here** button are on production, now that the
routing network Transportation published is public there. Until now production showed "The Aggie Map routing services
are currently undergoing maintenance" in place of the planner.

Two things stay on development only: **Options**, whose one choice is accessible routing, which the network does not
support yet ([#2801](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2801)), and the
picker for comparing routing networks, which has nothing to choose with one network.
([#2804](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2804))

| Before, on production: the maintenance message | After, as production: a route between two points |
| --- | --- |
| ![Before](../screenshots/2804-routing-on-production/before-trip-as-production.png) | ![After](../screenshots/2804-routing-on-production/after-route-as-production.png) |

The "after" is a production build of this change served locally as production, routing through production's network
(`arc.ts.tamu.edu`), on 9 November 2026.
