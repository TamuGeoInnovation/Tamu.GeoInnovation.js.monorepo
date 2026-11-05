---
issue: 2660
title: Game-day restrooms on the Football Tailgating map
testOnDev: |
  | Restrooms on the tailgating map ([#2660](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2660)) | [The Football Tailgating map on dev](https://dev.aggiemap.tamu.edu/events/tailgating/map) | Zoom in close on Aggie Park: restroom icons appear by zones 3 and 4, by building 1641 and east of Creamery Lawn, and more on West Campus. "Restrooms" is in the Layers list and the Legend. The icons show only when zoomed in close, as set in ArcGIS Pro |
---

### Game-day restrooms on the Football Tailgating map

The Football Tailgating map shows game-day restrooms, 16 around Aggie Park and West Campus. They are drawn in ArcGIS Pro with
the tents and zones, so their icon, name and the zoom at which they appear are changed there. A restroom's popup offers
directions where directions are available. The campus layer of family and single-occupancy restrooms stays off by default,
because many buildings are closed on game days
([#2660](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2660)).

| Before | After |
| --- | --- |
| ![Aggie Park with no restrooms](../screenshots/2660-tailgate-restrooms/before-aggie-park.png) | ![Aggie Park with restroom icons](../screenshots/2660-tailgate-restrooms/after-aggie-park.png) |
