---
issue: 2084
app: gisday
title: Texas A&M GIS Day's tab icon is AggieMap's, the same size
testOnDev: |
  | GIS Day: Texas A&M site's tab icon ([#2084](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2084)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). AggieMap on dev: [dev.aggiemap.tamu.edu](https://dev.aggiemap.tamu.edu); after release, [gisday.tamu.edu](https://gisday.tamu.edu) beside [aggiemap.tamu.edu](https://aggiemap.tamu.edu) | AggieMap's tab icon is unchanged. gisday.tamu.edu's is the same icon, the same size, not the smaller box logo. txgisday.org's and gisday.ucgis.org's are unchanged. In gisday.tamu.edu's page source (before the app runs), the `<link rel="icon">` names `assets/images/logo/favicon.ico` and the title is Texas A&M GIS Day's; this cannot be seen locally. `https://aggiemap.tamu.edu/favicon.ico` still answers |
---

### GIS Day: Texas A&M GIS Day's tab icon matches AggieMap's

gisday.tamu.edu's browser-tab icon was the Texas A&M box logo with a wide margin, so it looked smaller than AggieMap's.
It is now AggieMap's own icon, from the one copy both sites serve, and the page names it from the start rather than
only once the app runs ([#2084](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2084)).

Headed Chromium's real tab strip, on local builds: the Texas A&M site beside AggieMap, then txgisday.org and UCGIS, unchanged.

| Before | After |
| --- | --- |
| ![A browser's tabs: Texas A&M GIS Day with a smaller box logo, beside Aggie Map with a larger one](../screenshots/2084-tamu-tab-icon/before-tamu-and-aggiemap.png) | ![The same tabs: Texas A&M GIS Day and Aggie Map now show the same icon at the same size](../screenshots/2084-tamu-tab-icon/after-tamu-and-aggiemap.png) |
| | ![The TxGIS Day tab with its Texas flag icon, unchanged](../screenshots/2084-tamu-tab-icon/after-txgisday.png) |
| | ![The UCGIS GIS Day tab with its own icon, unchanged](../screenshots/2084-tamu-tab-icon/after-ucgis.png) |
