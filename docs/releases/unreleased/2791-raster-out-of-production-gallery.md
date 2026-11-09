---
issue: 2791
title: Production's basemap panel offers the campus basemap alone
testOnDev: |
  | The basemap panel is unchanged on dev ([#2791](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2791)) | [dev.aggiemap.tamu.edu/map/d/settings](https://dev.aggiemap.tamu.edu/map/d/settings) | Dev still lists Aggieland, Aggieland vector September 2026 and the October, June and May raster versions. The change is production's: it lists Aggieland alone, with no Aggieland raster. Production cannot be checked on dev; the pull request shows it served as production |
---

### Production's basemap panel offers the campus basemap alone

The panel offered "Aggieland raster" beside the campus basemap, as a way back after the vector basemap became the
default. Its service is no longer maintained, so production now offers the campus basemap alone. A visitor who had
chosen the raster basemap opens on the campus basemap instead. Development still offers every version, for comparing
them.
([#2791](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2791))

| Before | After |
| --- | --- |
| ![The basemap panel on production, offering Aggieland and Aggieland raster](../screenshots/raster-out-of-production-gallery/before-production.png) | ![The same panel offering Aggieland alone](../screenshots/raster-out-of-production-gallery/after-local-production.png) |
