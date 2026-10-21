---
issue: 2059
title: Indoor Track's Team Bus Parking is drawn above the building it covers
testOnDev: |
  | Indoor Track draws Team Bus Parking ([#2059](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2059)) | [dev.aggiemap.tamu.edu/parking/indoor-track-parking/map/d](https://dev.aggiemap.tamu.edu/parking/indoor-track-parking/map/d) | A magenta Team Bus Parking area over the Indoor Track Building; switching Team Bus Parking off in the Layers list shows the building's tan fill again |
---

### Indoor Track's Team Bus Parking is drawn above the building it covers

The team bus area is the Indoor Track Building's own footprint, and the map drew it underneath the
building, so it could not be seen and switching it on and off changed nothing. The map's layer
positions were meant to put it on top, but they counted positions in a list that was shorter than they
assumed, so they did nothing. The map now orders its layers by the one setting that decides the
drawing order, with Team Bus Parking above the building.
([#2059](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2059))

| Before | After |
| --- | --- |
| ![Indoor Track Parking on dev: the building's tan fill, with no team bus area](../screenshots/2059-team-bus-parking-order/before-on.png) | ![Indoor Track Parking on a local build: the magenta team bus area over the building](../screenshots/2059-team-bus-parking-order/after-on.png) |
