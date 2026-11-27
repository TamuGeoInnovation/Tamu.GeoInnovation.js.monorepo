---
issue: 3808
app: aggiemap
title: Four parking maps' popups show what they were meant to
testOnDev: |
  | Parking popups ([#3808](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3808)) | AggieMap dev: Parking, Motorcycle Parking; Maintenance Parking; Service and Loading Zones; Media Parking | Click a motorcycle space: its popup is headed by its lot (for example "Ireland Street"), not "Motorcycle Parking Space". Click a maintenance or service space with a space number: "Space: 14" under its type. Click a maintenance or media lot: "Lot type: Surface" under its permit notes |
---

### Four parking maps' popups show what they were meant to

Four parking maps fetched details their popups never showed. A **motorcycle space** now says which lot it is in, rather
than only "Motorcycle Parking Space"; a **maintenance or service space** shows its space number, reserved-space number
and garage level where it has them; and a **maintenance or media lot** shows its lot type.
([#3808](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3808))

| Before                                                                                                                 | After                                                                                                       |
| ---------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| ![A motorcycle space's popup with only its layer's title](../screenshots/3808-popup-keys/before-motorcycle-spaces.png) | ![The same space's popup headed Ireland Street](../screenshots/3808-popup-keys/after-motorcycle-spaces.png) |
| ![A maintenance space's popup: lot and type only](../screenshots/3808-popup-keys/before-maintenance-spaces.png)        | ![The same with Space: 14](../screenshots/3808-popup-keys/after-maintenance-spaces.png)                     |
| ![A media lot's popup without its type](../screenshots/3808-popup-keys/before-media-lots.png)                          | ![The same with Lot type: Surface](../screenshots/3808-popup-keys/after-media-lots.png)                     |
