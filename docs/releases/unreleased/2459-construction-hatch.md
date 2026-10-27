---
issue: 2459
title: Buildings under construction draw as an orange checkered hatch over the map, not a solid block
testOnDev: |
  | Buildings under construction on the October vector basemap ([#2459](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2459)) | [dev.aggiemap.tamu.edu/map/d?bldg=1526](https://dev.aggiemap.tamu.edu/map/d?bldg=1526) (the BBQ Pavilion, so the building to check is not selected), close the popup and zoom out once. Aplin Center, 1524, is next door | Aplin Center has a black outline and an orange checkered grid, with the grass and trees showing between the lines: no white, no pink, no tint. Turning on **Construction Zones** draws its own lines over it, also with nothing filled. The *Aggieland vector, September 2026* basemap in the gallery is unchanged and still solid magenta |
---

### Buildings under construction draw as a hatch, not a solid block

On the October 2026 vector basemap, development's default, every building under construction was a solid pink-and-white block. The
service's hatch was packaged as a picture with no transparent pixels, so it covered the ground under the building. It now draws as
an orange checkered grid over the building, with a black outline and nothing filled in between, so the grass and trees show
through. Only that one pattern is replaced, in the browser; every other symbol on the basemap stays as the service publishes it
([#2459](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2459)).

Production shows the raster basemap, which this does not change. The September 2026 vector basemap, kept in development's gallery for
comparison, is unchanged and still draws these buildings in solid magenta.

Aplin Center, building 1524, at the same place and zoom:

| Before | After |
| --- | --- |
| ![Aplin Center as a pink grid on opaque white, hiding the grass under it](../screenshots/2459-construction-hatch/before-aplin.png) | ![Aplin Center as an orange checkered grid with a black outline, grass and trees showing between the lines](../screenshots/2459-construction-hatch/after-aplin.png) |

| After, with Construction Zones on | The September 2026 basemap, unchanged |
| --- | --- |
| ![The Construction Zones layer's own diagonal cross over the same area, with nothing filled](../screenshots/2459-construction-hatch/after-aplin-construction-zones.png) | ![Aplin Center in solid magenta on the September 2026 vector basemap](../screenshots/2459-construction-hatch/after-aplin-september-basemap.png) |
