---
issue: 2789
title: Bus routes on production
testOnDev: |
  | Bus routes are offered, and stay offered as production ([#2789](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2789)) | [dev.aggiemap.tamu.edu/map/d/bus?as=production](https://dev.aggiemap.tamu.edu/map/d/bus?as=production) | Acting as production, the sidebar has the bus tab and the panel lists the AggieSpirit routes, On Campus and Off Campus, each in its colour; choosing route 01 draws its line and stops. Before, it said bus routes were unavailable. NW0104, NW0305, NW4041 and 15R draw their line but no stops, and 40 and 47 one stop too many and two too few, as on dev (#1174). On a phone, the menu's Bus Routes opens the same list |
---

### Bus routes on production

AggieMap's bus routes, which were on the development site only, are on the public map: the bus tab in the
sidebar, and Bus Routes in the phone menu, list every AggieSpirit route, and choosing one draws its line
and stops. Until now the public map's bus panel said bus routes were unavailable. Four routes, the night,
weekend and Friday ones, are drawn without their stops on the map, and two draw a stop too many or too
few, because of the route data; their stops are still listed in the panel.
([#2789](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2789))

| Before | After |
| --- | --- |
| ![The public map's bus panel saying bus routes are unavailable](../screenshots/2789-bus-routes-production/before-production.png) | ![The same panel listing the AggieSpirit routes](../screenshots/2789-bus-routes-production/after-local-production.png) |
