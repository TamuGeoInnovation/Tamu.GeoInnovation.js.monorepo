---
issue: 2077
title: Each GIS Day site uses its own name and contact on shared pages
testOnDev: |
  | GIS Day: each site's own name and contact ([#2077](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2077)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). On production after release: [gisday.ucgis.org/presenters](https://gisday.ucgis.org/presenters), [gisday.tamu.edu/presenters](https://gisday.tamu.edu/presenters), [txgisday.org/presenters](https://txgisday.org/presenters) | UCGIS: "UCGIS GIS Day" throughout, and "Contact us" to its own Contact page, with no TxGIS Day or gis@tamu.edu. Texas A&M: "Texas A&M GIS Day", with gis@tamu.edu. txgisday.org: exactly as before |
---

### GIS Day: each site uses its own name and contact on shared pages

Pages every GIS Day site shows had "TxGIS Day" and Texas A&M's address, gis@tamu.edu, written into them,
so UCGIS's Presenters page sent would-be presenters to Texas A&M. They now use the site's own name, and
its own contact address, or its Contact page when it has none: Presenters, the Sessions profile reminder,
the homepage's sponsor text, the profile page, the first sign-in survey, the past-year banner and the
admin Venues page. txgisday.org reads exactly as before
([#2077](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2077)).

| Before: UCGIS | After: UCGIS | After: txgisday.org, unchanged |
| --- | --- | --- |
| ![UCGIS's Presenters page saying TxGIS Day and gis@tamu.edu](../screenshots/2077-site-name-and-contact/before-ucgis-presenters.png) | ![UCGIS's Presenters page saying UCGIS GIS Day, with Contact us](../screenshots/2077-site-name-and-contact/after-ucgis-presenters.png) | ![txgisday.org's Presenters page, as before](../screenshots/2077-site-name-and-contact/after-txgisday-presenters.png) |
