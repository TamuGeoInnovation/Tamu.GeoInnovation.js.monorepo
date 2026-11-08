---
issue: 2712
title: A draft Micromobility map, on dev only
testOnDev: |
  | The Micromobility draft map ([#2712](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2712)) | [dev.aggiemap.tamu.edu/parking/micromobility](https://dev.aggiemap.tamu.edu/parking/micromobility) | The corridor, allowed sidewalks and micromobility facilities draw in Transportation's own colours, and clicking a line names it (for example "Sharrow", "Roadway"). It is listed on dev's Parking Maps page and found by searching "scooter". On production it is listed nowhere and the same link opens the main map |
---

### A draft Micromobility map, on dev only

Transportation's new micromobility map, where scooters and bikes may ride on Main Campus: the
micromobility corridor, the sidewalks they may use, and the roadways and other facilities. Each layer's
name, symbols and order are the service's own. It is a draft that Transportation is still refining, so it
is on dev only. Production lists it nowhere, and a link to it opens the main map instead. The smoke suite
fails if production ever requests its service.
([#2712](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2712))

A map can now be kept off production as a whole by naming the issue that holds it there
(`developmentOnly`). Before this, `visible: false` kept a map off production's lists but left its link
working.
