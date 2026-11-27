---
issue: 3824
app: aggiemap
title: Maintenance and Service Parking finish drawing in seconds, not minutes
testOnDev: |
  | Maintenance and Service Parking load time ([#3824](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3824)) | AggieMap dev: Parking, Maintenance Parking; and Service and Loading Zones | Open each map in a fresh tab and time it until the spaces stop changing and the map stops redrawing: about 20 seconds, where it was 90 to 160. The green service and blue loading-zone points are the same as before; nothing new is drawn and nothing is missing |
---

### Maintenance and Service Parking finish drawing in seconds, not minutes

**Maintenance Parking** and **Service and Loading Zones** drew a few hundred service and loading spaces but downloaded
every parking space on campus, about 45,000, to do it, and took a minute and a half to nearly three minutes to finish
drawing. They now fetch only the spaces they draw and finish in about 20 seconds, showing exactly the same spaces.
([#3824](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3824))

| Before (finished drawing at 115.6 s)                                                                     | After (finished drawing at 22.0 s)                                                                                      |
| -------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| ![Maintenance Parking, before](../screenshots/3824-parking-space-filters/before-maintenance-parking.png) | ![Maintenance Parking, after: the same spaces](../screenshots/3824-parking-space-filters/after-maintenance-parking.png) |
