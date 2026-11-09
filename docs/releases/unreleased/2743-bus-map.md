---
issue: 2743
title: All Maps lists a bus map under Transportation, on development only
testOnDev: |
  | A bus map under Transportation ([#2743](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2743)) | [dev.aggiemap.tamu.edu/all-maps/transportation](https://dev.aggiemap.tamu.edu/all-maps/transportation) | **Bus Routes** is listed beside Micromobility. It opens the campus map with the bus panel showing every AggieSpirit route (`/map/d/bus`); choosing a route draws it and its stops and zooms to fit it, and Back returns to Transportation. Searching All Maps for "bus" finds it. Not on production: production's Transportation page lists only what it did |
---

### All Maps lists a bus map under Transportation, on development only

The Transportation section of All Maps now lists **Bus Routes**. It is the campus map with its bus panel open, the panel
that lists every AggieSpirit route and draws one with its stops when it is chosen - not a separate map, so it always
has the campus map's own layers and basemap. Searching All Maps for "bus" finds it too.

It is listed on development only, as the bus panel itself is. Bus routes read a service that production now serves
publicly ([#2636](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2636)), but moving them to
production is a separate decision.
([#2743](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2743))

| Before                                                                                                 | After                                                                                                              |
| ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| ![Transportation, with Micromobility only](../screenshots/2743-bus-map/before-transportation-page.png) | ![Transportation, with Bus Routes beside Micromobility](../screenshots/2743-bus-map/after-transportation-page.png) |
|                                                                                                        | ![Bus Routes opens the campus map with the bus panel](../screenshots/2743-bus-map/after-bus-map.png)               |
