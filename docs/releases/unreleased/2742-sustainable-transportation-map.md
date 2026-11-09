---
issue: 2742
title: A Sustainable Transportation map in the Transportation section, on dev
testOnDev: |
  | AggieMap: a Sustainable Transportation map under Transportation ([#2742](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2742)) | [dev.aggiemap.tamu.edu/all-maps/transportation](https://dev.aggiemap.tamu.edu/all-maps/transportation), then open Sustainable Transportation | It is listed beside Micromobility. Its six layers (bike racks, fix stations, campus and city bike lanes, dismount zones, EV chargers) are on and draw, each marked "production data". On [aggiemap.tamu.edu/parking/sustainable-transportation](https://aggiemap.tamu.edu/parking/sustainable-transportation) the link opens the main map instead |
---

### AggieMap: a Sustainable Transportation map in the Transportation section, on dev

The Sustainable Transportation map, with its six bike and EV charging layers on, is now listed in the Transportation
section of All Maps, beside Micromobility. The map has existed since May. But it was listed in no section, so only
someone with its link could reach it, and on dev its layers drew nothing.

It is on dev only for now. The bike layers are being reworked, and whether they stay is decided early in the week of
9 November, so on production its link opens the main map. On dev its layers read production's bike service, because
the development GIS server serves that only with a token, and each is marked **production data** in the Layers list.
([#2742](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2742))

| Before: Transportation lists Micromobility only | After: Sustainable Transportation beside it |
| --- | --- |
| ![Before](../screenshots/2742-sustainable-transportation-map/before-all-maps.png) | ![After](../screenshots/2742-sustainable-transportation-map/after-all-maps.png) |

| Before: the map's six layers fail on dev | After: they draw, each marked |
| --- | --- |
| ![Before](../screenshots/2742-sustainable-transportation-map/before-map.png) | ![After](../screenshots/2742-sustainable-transportation-map/after-map.png) |
