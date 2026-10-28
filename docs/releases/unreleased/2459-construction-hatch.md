---
issue: 2459
title: Buildings under construction draw as an orange grid on the campus basemap, and the map no longer goes blank over them
testOnDev: |
  | Buildings under construction on the vector campus basemap ([#2459](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2459)) | [Aplin Center](https://dev.aggiemap.tamu.edu/map/d?bldg=1524) and [the Semiconductor Institute](https://dev.aggiemap.tamu.edu/map/d?bldg=8711); close the popup | Each building is an orange grid with the grass showing through it and a black outline: no pink, no solid block. Reload `/map/d` a few times: the map draws every time |
---

### Buildings under construction draw as an orange grid on the campus basemap, and the map no longer goes blank over them

On the development campus basemap, buildings under construction drew as solid pink blocks, because the published
pattern was packaged on an opaque tile. The first fix replaced that pattern inside the basemap's sprite sheet, and
on some loads it left the whole map blank. Now the basemap's own fill is switched off. The eight buildings are
drawn from the campus buildings service as an orange grid, with the ground showing through it, and the basemap's
black outline stays. Nothing touches the sprite sheet any more. The grid is the same density at every zoom.
Production still draws the raster basemap and is unchanged
([#2459](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2459)).

| | Before | After |
| --- | --- | --- |
| Aplin Center (1524) | ![A solid pink block](../screenshots/2459-construction-hatch/control-1524.png) | ![An orange grid over grass, with a black outline](../screenshots/2459-construction-hatch/after-1524.png) |
| At zoom 16, around West Campus | | ![Three buildings under construction, each an orange grid](../screenshots/2459-construction-hatch/prototype-1524-zoom16.png) |
