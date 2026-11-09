---
issue: 2792
title: The GIS Day competition maps draw the campus vector basemap
testOnDev: |
  | The competition maps draw the campus vector basemap ([#2792](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2792)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). On production after release: [txgisday.org](https://txgisday.org), Competitions, then the Permanent Signage Challenge map (and Sidewalk, Stormwater, Light Pole) | The map draws campus with blue parking garages and pink-and-white buildings under construction, as AggieMap's campus basemap does, and credits Texas A&M University in its corner. Before, it drew the older raster basemap |
---

### The GIS Day competition maps draw the campus vector basemap

The competition maps drew the older raster campus basemap, whose service is no longer maintained. They now draw the
campus vector basemap AggieMap opens on. It looks a little different: parking garages are blue, and buildings under
construction are patterned.
([#2792](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2792))

| Before | After |
| --- | --- |
| ![The signage competition map on the raster campus basemap](../screenshots/gisday-maplibre-vector-tiles/before-production-signage.png) | ![The same map on the campus vector basemap](../screenshots/gisday-maplibre-vector-tiles/after-local-signage.png) |
