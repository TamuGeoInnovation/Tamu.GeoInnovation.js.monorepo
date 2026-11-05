---
issue: 2649
title: Each GIS Day site's link preview shows its own name, description and image
testOnDev: |
  | GIS Day: link previews ([#2649](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2649)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). On production after release: `npx playwright test --config=playwright.smoke.config.ts -g "link preview"` with `SMOKE_BASE_URL` set to each of https://gisday.ucgis.org, https://gisday.tamu.edu and https://txgisday.org | Each passes. Pasting https://gisday.ucgis.org into a post (Tradewing, LinkedIn, Teams) shows "UCGIS GIS Day" and the UCGIS logo, and https://gisday.tamu.edu shows "Texas A&M GIS Day" and the block ATM; a service that saw the old preview may keep it for a while |
---

### GIS Day: each site's link preview shows its own name, description and image

A post linking to gisday.ucgis.org showed "TxGIS Day", TxGIS Day's description and a grey placeholder, and gisday.tamu.edu's links did the same. Link previews read the page a site serves without running the app, and every site served txgisday.org's page, with no image at all. Each site now serves its own page, written when the app is built from the same site settings as the rest of its branding, with its name, a description, its address and a 1200 × 630 preview image made from its homepage banner. The site's server picks the page by the address it is reached at. UCGIS's description is its homepage's first line until UCGIS sends its own ([#2649](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2649)).

The pictures are preview cards drawn from each page's own tags: before from the live site, after from the new build.

| Before | After |
| --- | --- |
| ![gisday.ucgis.org's preview: TxGIS Day, TxGIS Day's description, no image](../screenshots/2649-site-link-previews/before-ucgis-preview.png) | ![gisday.ucgis.org's preview: UCGIS GIS Day, UCGIS's description and logo](../screenshots/2649-site-link-previews/after-ucgis-preview.png) |
| ![gisday.tamu.edu's preview: TxGIS Day, no image](../screenshots/2649-site-link-previews/before-tamu-preview.png) | ![gisday.tamu.edu's preview: Texas A&M GIS Day and the block ATM](../screenshots/2649-site-link-previews/after-tamu-preview.png) |
