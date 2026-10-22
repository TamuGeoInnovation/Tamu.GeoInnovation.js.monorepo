---
issue: 2090
title: Copy to another site shows what it is doing while an import runs
testOnDev: |
  | GIS Day: Copy to another site while it works ([#2090](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2090)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). On production after release, as a GIS Day admin: export on [txgisday.org/admin/copy](https://txgisday.org/admin/copy) and import on [gisday.ucgis.org/admin/copy](https://gisday.ucgis.org/admin/copy) | Clicking Apply turns the button grey, reading "Applying…", with a line beneath it saying how many records are being written and logos and photos copied. The button cannot be clicked again until it finishes. Export reads "Exporting…" the same way |
---

### GIS Day: Copy to another site shows what it is doing while an import runs

UCGIS's first import took long enough after **Apply** that it looked as if the click had not registered,
inviting a second one. Now the button turns grey and reads **Applying…**, cannot be clicked again, and a
line beneath it says what is happening: how many records are being written, and how many logos and photos
are being copied from which site. **Export** and reading a chosen file do the same. Logos and photos are
also fetched four at a time instead of one by one, so the wait is shorter
([#2090](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2090)).

| While applying |
| --- |
| ![The Copy page while an import is applied: a grey "Applying…" button, and beneath it "Writing 295 records, then copying 71 logos and photos from https://txgisday.org"](../screenshots/2090-copy-feedback/after-applying.png) |
