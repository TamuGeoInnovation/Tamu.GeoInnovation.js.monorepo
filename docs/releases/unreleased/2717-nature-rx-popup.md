---
issue: 2717
title: The Nature Rx popup lists a space's features on one line, and fetches its photographs one at a time
testOnDev: |
  | Nature Rx features as one labelled line ([#2717](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2717)) | [dev.aggiemap.tamu.edu/map/d?naturerx=15](https://dev.aggiemap.tamu.edu/map/d?naturerx=15) | West Campus Spaces' popup shows "**Features**: Seating, Shade, Open play area, Walking or jogging path, Bike racks" on one line, styled like the other popups' fields, with no bullets |
  | Photo carousels fetch one photograph at a time ([#2716](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2716)) | [dev.aggiemap.tamu.edu/map/d?naturerx=14](https://dev.aggiemap.tamu.edu/map/d?naturerx=14) | With the browser's network panel open, ILCB Green Space's popup fetches one photograph (about 1.9 MB), not four (6.9 MB); the arrows still show every photograph, both ways round. The Points of Interest and Bonfire popups use the same carousel |
---

### The Nature Rx popup lists a space's features on one line, and fetches its photographs one at a time

A Nature Rx space's features were a bulleted list, the only one in any popup, drawn with the browser's own bullets and
indent. They are now one labelled line, **Features**: Seating, Shade, …, as every other popup shows a field, in the same
order and still only those the space has.
([#2717](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2717))

The photo carousel fetched every photograph as soon as a popup opened, although one shows at a time: ILCB Green Space's
four came to 6.9 MB. It now fetches the photograph on show, and each further one when the visitor moves to it, with the
one either side. Opening ILCB Green Space now fetches 1.9 MB. The photographs themselves are still full-size camera
originals, which is with Facilities Analytics & Mapping, so this does not make the first one any smaller. The Points of
Interest and Bonfire popups use the same carousel and gain the same.
([#2716](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2716))

| Before | After |
| --- | --- |
| ![West Campus Spaces' features as a bulleted list](../screenshots/2716-2717-nature-rx-popup/before-west-campus-spaces.png) | ![West Campus Spaces' features as one labelled line](../screenshots/2716-2717-nature-rx-popup/after-west-campus-spaces.png) |
| ![ILCB Green Space's popup, which fetched four photographs on opening](../screenshots/2716-2717-nature-rx-popup/before-ilcb-green-space.png) | ![ILCB Green Space's popup, which fetches one photograph on opening](../screenshots/2716-2717-nature-rx-popup/after-ilcb-green-space.png) |
