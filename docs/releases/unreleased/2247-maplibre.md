---
issue: 2247
title: GIS Day's competition maps draw the university's campus basemap with MapLibre
testOnDev: |
  | GIS Day competition maps on the campus basemap ([#2247](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2247)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). Locally with `scripts/gisday-local.sh`, or on production after release: [gisday.tamu.edu/competitions/sidewalk](https://gisday.tamu.edu/competitions/sidewalk) (and `/lightpole`, `/signage`, `/stormwater`) | Each page's map shows the College Station campus on the university's basemap (buildings, streets and labels as AggieMap draws them), with no request to `api.mapbox.com` or `events.mapbox.com` in the browser's network panel |
---

### GIS Day's competition maps draw the university's campus basemap

The four competition pages' maps (light poles, sidewalks, signage and stormwater) are now drawn with MapLibre, the
open-source fork of Mapbox GL, on the university's own campus basemap: the one AggieMap's production map draws. They
used Mapbox GL 1, whose later versions are not open source, with Mapbox's hosted light style and a Mapbox token.
They no longer contact Mapbox at all.
([#2247](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2247))

| Before | After |
| --- | --- |
| ![The sidewalk competition map on Mapbox's light style](../screenshots/maplibre/before-sidewalk.png) | ![The sidewalk competition map on the university's campus basemap](../screenshots/maplibre/after-sidewalk.png) |
| ![The light pole competition map, before](../screenshots/maplibre/before-light-pole.png) | ![The light pole competition map, after](../screenshots/maplibre/after-light-pole.png) |
