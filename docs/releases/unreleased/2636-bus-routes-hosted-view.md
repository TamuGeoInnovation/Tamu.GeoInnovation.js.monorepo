---
issue: 2636
title: Bus routes read each environment's own Transportation service
testOnDev: |
  | Bus routes from Transportation's hosted view ([#2636](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2636)) | [dev.aggiemap.tamu.edu/map/d/bus](https://dev.aggiemap.tamu.edu/map/d/bus) | The route list shows 23 routes, On and Off Campus, each in its own colour (47/48 and 48 are gone: the service no longer has them). Choosing a route draws its line and stops and lists its stops; route 47 lists 31. Click a stop: its popup names it and its routes, and its copied link (`?busstop=` and a number from 1 to 212) opens the same stop. A link copied before this release, numbered 4718 or more, now opens no stop |
---

### Bus routes read each environment's own Transportation service

The bus map read its routes and stops from an older Transportation service on the development GIS server, on every
environment, because that service was public nowhere else. Transportation has since published a hosted view of it,
public on both its servers, and each environment now reads its own, as it already does for Transportation's other
services. Bus routes are still shown on development only: whether they go to production is a separate decision.

The new service is not a copy of the old one. It no longer has routes 47/48 and 48, and it lists a 32nd stop for route
47 on production. Its stops have new ids, which are not the same on development and production, so a stop link shared
from the old service (`?busstop=4718` and up) no longer finds its stop, and a link copied on one environment does not
open on the other.
([#2636](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2636))

| Before                                                                                                                     | After                                                                                                                     |
| -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| ![The bus route list, read from the old service](../screenshots/2636-bus-routes-hosted-view/before-route-list.png)         | ![The bus route list, read from the hosted view](../screenshots/2636-bus-routes-hosted-view/after-route-list.png)         |
| ![Route 01 drawn from the old service](../screenshots/2636-bus-routes-hosted-view/before-route-01.png)                     | ![Route 01 drawn from the hosted view](../screenshots/2636-bus-routes-hosted-view/after-route-01.png)                     |
| ![A stop's popup, opened by its link on the old service](../screenshots/2636-bus-routes-hosted-view/before-stop-popup.png) | ![A stop's popup, opened by its link on the hosted view](../screenshots/2636-bus-routes-hosted-view/after-stop-popup.png) |
