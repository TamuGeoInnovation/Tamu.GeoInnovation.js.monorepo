---
issue: 2536
title: Construction stays hatched after switching basemaps
testOnDev: |
  | Buildings under construction after switching basemaps ([#2536](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2536)) | [The main map](https://dev.aggiemap.tamu.edu/map/d), zoomed to a building under construction (an orange grid). Open the basemap panel, choose **Aggieland raster**, then choose **Aggieland** again | The building is an orange grid with a black outline, as when the map opened, and never a solid pink block |
---

### Construction stays hatched after switching basemaps

Buildings under construction are drawn as an orange grid with a black outline. They went back to the old solid pink
block as soon as a visitor chose the raster basemap and then the vector one again
([#2536](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2536)). The basemap panel made its
own copy of the campus basemap that left out two things the map's first load does: hiding the published pink fill, and
the second layer that draws the grid. It now builds the copy the same way the map does, so choosing a basemap and coming
back gives the one the map opened with. This is the fault of
[#2477](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2477) again: its fix was reverted along
with another change.

A new test makes the gallery's copy of each campus basemap and checks it against its definition: every layer is there
and the hidden style layers are hidden. The smoke test that switches basemaps and back now also checks that the
construction layer is back.
