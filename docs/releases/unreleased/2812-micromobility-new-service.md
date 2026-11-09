---
issue: 2812
title: The Micromobility map draws Transportation's approved paths, on dev only
testOnDev: |
  | The Micromobility map's approved paths ([#2812](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2812)) | [dev.aggiemap.tamu.edu/transportation/micromobility](https://dev.aggiemap.tamu.edu/transportation/micromobility) | The Layers list shows Slow Zones, Shared Paths and Dedicated Micromobility Paths, with no "production data" mark. Clicking a line names it ("Shared Paths"). Before, it showed the draft's Micromobility Corridor, Allowed Sidewalks and Micromobility Facilities. On the main map, the Micromobility group in the Layers list holds the same three. On production the map is still listed nowhere |
---

### The Micromobility map draws Transportation's approved paths, on dev only

The Micromobility map now draws Transportation's approved paths in place of its draft: slow zones,
shared paths and dedicated micromobility paths. The same three layers are in the main map's
Micromobility group. The map stays on dev only, as before.
([#2812](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2812))

| Before | After |
| --- | --- |
| ![The Micromobility map on dev, drawing the draft's corridor, allowed sidewalks and facilities](../screenshots/2812-micromobility-new-service/before-dev.png) | ![The same map drawing slow zones, shared paths and dedicated micromobility paths](../screenshots/2812-micromobility-new-service/after-local.png) |
