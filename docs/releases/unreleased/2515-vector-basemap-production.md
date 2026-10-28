---
issue: 2515
title: Production's maps open on the vector campus basemap, with the raster one still in the gallery
testOnDev: |
  | The vector campus basemap as production's default ([#2515](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2515)) | Dev already opens on it, so check it there: [the main map](https://dev.aggiemap.tamu.edu/map/d), then a few event and parking maps from [All Maps](https://dev.aggiemap.tamu.edu/all-maps). On dev, `?as=production` shows what production will offer | The map opens on the vector basemap: crisper buildings, labels and trees, and buildings under construction in an orange grid. It opens one level closer than production does today. Under settings, the basemap list starts with **Aggieland** (vector, selected) and **Aggieland raster**; choosing the raster one switches to the old basemap and back. Every layer you know draws as before |
---

### Production's maps open on the vector campus basemap, with the raster one still in the gallery

Every map on production now opens on the vector tile campus basemap that development has used since September:
crisper buildings, labels and paths, and the buildings under construction drawn as an orange grid
([#2459](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2459)). It is the largest
change to how production looks in a long time
([#2515](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2515)).

**The raster basemap production showed until now is still offered**, as *Aggieland raster* in the basemap list
under settings. Anyone who finds the new one harder to read can switch back.

Two things a visitor may notice:

- **Maps open one level closer than before.** They open at the same zoom level, and the vector basemap's levels are
  set differently from the raster basemap's, so the main map now opens at 1:4,514 where it opened at 1:9,028.
  Development has always opened this way.
- **Zooming in stops where it did.** The vector basemap goes two levels deeper, but the raster basemap is still
  offered and has nothing past today's limit, and the deeper vector levels add no detail.

Every other layer, and every other request a map makes, is unchanged.

| | Before | After |
| --- | --- | --- |
| The main map, as production opens it | ![The raster campus basemap](../screenshots/2515-vector-basemap-production/before-main-map.png) | ![The vector campus basemap, one level closer](../screenshots/2515-vector-basemap-production/after-main-map.png) |
| The basemap list under settings | ![One campus basemap, Aggieland](../screenshots/2515-vector-basemap-production/before-gallery.png) | ![Aggieland, selected, then Aggieland raster](../screenshots/2515-vector-basemap-production/after-gallery.png) |
