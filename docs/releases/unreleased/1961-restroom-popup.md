---
issue: 1961
title: The restroom popup shows the building number
testOnDev: |
  | The Single Occupancy Restroom popup ([#1961](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1961)) | [The main map as production shows it](https://dev.aggiemap.tamu.edu/map/d?as=production): turn on **Single Occupancy Restroom Locations** under Layers, then click a restroom symbol, for example the one on the Coke Building, beside Spirit Plaza. Dev's own GIS server does not publish this layer ([#1005](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1005)), which is why the link asks for production's | The popup is headed *Unisex Restroom* and shows the building's name, **Building 0461** under it, and the room (*Room 306, open to the public*). A building with restrooms on several floors lists each floor on its own line, as the Student Services Building does. Its number there is wrong in the service itself, [#2529](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2529) |
---

### The restroom popup shows the building number

Clicking a single-occupancy restroom now shows the number of the building it is in, under the building's name,
with the rooms below
([#1961](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1961)). The popup used to
show the building's name and rooms only. A restroom with no building number, or no rooms listed, leaves that row
out rather than showing a label with nothing beside it.

| Before | After |
| --- | --- |
| ![The popup with the building name and rooms, and no building number](../screenshots/1961-restroom-popup/before-production.png) | ![The popup headed Unisex Restroom, with the building name, Building 0461, and the room](../screenshots/1961-restroom-popup/after.png) |
