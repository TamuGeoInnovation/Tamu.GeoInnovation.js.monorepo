---
issue: 3223
title: Nature Rx is now Nature Spaces, and a space's popup is headed by its name
testOnDev: |
  | Nature Spaces ([#3223](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3223)) | [dev.aggiemap.tamu.edu/map/d?naturerx=15](https://dev.aggiemap.tamu.edu/map/d?naturerx=15) | The Layers list says Nature Spaces, not Nature Rx; the space's popup says "West Campus Spaces" under its photograph, not "West Campus". Development only: production does not have the layer yet (#2673) |
---

### Nature Rx is now Nature Spaces, and a space's popup is headed by its name

The GIS team asked for two changes before the layer goes to production. It is now called **Nature Spaces** in the
Layers list, the legend and search. And the line under a space's photograph is the space's own name, the service's
*Area Name*, where it was the part of campus it is on, so that every space on West Campus read "West Campus". All 36
spaces have a name. The service still calls the layer "NatureRx Spaces", so the new title is declared as an override
until the GIS team renames it there. Development only, as the layer is (#2673).
([#3223](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3223))

| | Before | After |
| --- | --- | --- |
| The popup | ![West Campus under the photograph](../screenshots/3223-nature-spaces/before-local-popup.png) | ![West Campus Spaces under the photograph](../screenshots/3223-nature-spaces/after-local-popup.png) |
| The Layers list | ![Nature Rx in the Layers list](../screenshots/3223-nature-spaces/before-local-layers.png) | ![Nature Spaces in the Layers list](../screenshots/3223-nature-spaces/after-local-layers.png) |
