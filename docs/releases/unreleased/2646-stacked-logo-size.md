---
issue: 2646
title: A stacked sponsor logo set to Large or Extra large grows in height too
testOnDev: |
  | GIS Day: a stacked sponsor logo at Extra large ([#2646](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2646)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). On production after release: [the Sponsors page](https://gisday.tamu.edu/sponsors) | The Bush School's stacked logo, at Extra large, is about 650 × 300 px beside ConocoPhillips at the LiDAR level; every Regular logo is as it was, and on a phone the page does not scroll sideways |
---

### GIS Day: a stacked sponsor logo set to Large or Extra large grows in height too

The logo sizes added in [#2638](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2638) were boxes with the same wide shape as Regular, so a stacked logo stopped at the box's height. The Bush School's stacked logo, set to Extra large, came out about 260 × 120 px, smaller than the wide logo it replaced. Large and Extra large are now about 2:1 boxes, 450 × 200 and 650 × 300 px, so a stacked logo grows in height. A wide logo still stops at the box's width, so it looks no different. Small and Regular are unchanged ([#2646](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2646)).

| Before | After |
| --- | --- |
| ![The stacked Bush School logo small inside the Extra large box](../screenshots/2646-stacked-logo-size/before-public-sponsors.png) | ![The stacked Bush School logo filling a 650 × 300 px box beside ConocoPhillips](../screenshots/2646-stacked-logo-size/after-public-sponsors.png) |
