---
issue: 2785
title: A building opens its popup even where the map lost part of its buildings
testOnDev: |
  | A building opens its popup where the map never received it ([#2785](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2785)) | [dev.aggiemap.tamu.edu/map/d](https://dev.aggiemap.tamu.edu/map/d) | The fault only shows on a load that lost a buildings query, so it cannot be made to happen by hand. With the browser's console open, reload until it shows `Failed to load tile` (about one load in three on 9 November 2026), wait until the map stops drawing, then click buildings across the whole map: every one opens its popup, where before one square of campus opened nothing. A click on bare ground still opens nothing |
---

### A building opens its popup even where the map lost part of its buildings

The service behind the buildings answers some of the map's requests with an error, about one request
in thirty on 9 November 2026, and the map does not ask again. On a load that lost one, a square of
campus held no buildings that could be clicked for the rest of the visit, though they were still drawn
by the basemap: a click there opened nothing. About a third of loads lost one that morning. When nothing
under a click has a popup, the map now also asks a layer that has finished drawing without all of its
features, as it already asked one still drawing. A click on bare ground on a complete map still asks
nothing.
([#2785](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2785))

| Before | After |
| --- | --- |
| ![A click on the Kleberg Center, on a square of campus whose buildings the map never received, opens nothing](../screenshots/2785-incomplete-layer-click/before.png) | ![The same click opens the Kleberg Center's popup](../screenshots/2785-incomplete-layer-click/after.png) |
