---
issue: 3643
app: gisday
title: UCGIS's site no longer opens Texas A&M's High School Portal by its address
testOnDev: |
  | The High School Portal only on Texas A&M's sites ([#3643](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3643)) | GIS Day has no dev site: `scripts/gisday-local.sh web --static --site ucgis`, then `/highschool`; and the same without `--site ucgis` | On UCGIS's site, `/highschool` goes to the homepage. On txgisday.org's, it still opens the **TxGIS Day High School Portal** |
---

### UCGIS's site no longer opens Texas A&M's High School Portal by its address

On [gisday.ucgis.org](https://gisday.ucgis.org), typing `/highschool` still opened the **TxGIS Day High School Portal**, which belongs
to Texas A&M's site. Nothing linked to it, but every other page UCGIS's site leaves out already sent the visitor to the homepage. Now
this one does too. txgisday.org's portal is unchanged.
([#3643](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3643))

| Before | After |
| --- | --- |
| ![UCGIS's site at /highschool, showing the TxGIS Day High School Portal](../screenshots/3643-highschool-guard/before-ucgis-highschool.png) | ![The same address now shows UCGIS's homepage](../screenshots/3643-highschool-guard/after-ucgis-highschool.png) |
