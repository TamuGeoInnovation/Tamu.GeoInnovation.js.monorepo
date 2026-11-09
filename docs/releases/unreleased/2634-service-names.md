---
issue: 2634
title: The Muster and Aggieland Saturday layers carry the names their services publish
testOnDev: |
  | Layer names from the services ([#2634](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2634)) | [Muster](https://dev.aggiemap.tamu.edu/events/muster/map/d) and [Aggieland Saturday](https://dev.aggiemap.tamu.edu/events/aggieland-saturday/map/d) | Muster's Layers list reads **Traffic Flow**, not "Muster Traffic Flow". Aggieland Saturday's reads **Points of Interest @ Aggieland Saturday**, not "Special Points of Interest". Every other layer name on both maps is unchanged, and both legends still draw |
---

### Two event layers take their names from the service instead of the code

A layer's name belongs to the service that publishes it, so that renaming one on the service changes
the map without anybody editing the application. Two event layers overrode that name in their
definition, so the name published on the service never reached the map
([#2634](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2634)).

Both overrides are removed, and each layer now shows what its service calls it:

| Map | Was, hard-coded | Now, from the service |
| --- | --- | --- |
| Muster, layer 0 | Muster Traffic Flow | **Traffic Flow** |
| Aggieland Saturday, layer 2 | Special Points of Interest | **Points of Interest @ Aggieland Saturday** |

Both names were read from the services before the change, on **both** the development and production
GIS hosts, which publish identical names for these two layers. The other overrides on these two maps
repeat their service's name exactly, so they change nothing and are left alone.

| | Before | After |
| --- | --- | --- |
| Muster | ![Layers list reading Muster Traffic Flow](../screenshots/2634-service-names/before-muster.png) | ![Layers list reading Traffic Flow](../screenshots/2634-service-names/after-muster.png) |
| Aggieland Saturday | ![Layers list reading Special Points of Interest](../screenshots/2634-service-names/before-aggieland-saturday.png) | ![Layers list reading Points of Interest @ Aggieland Saturday](../screenshots/2634-service-names/after-aggieland-saturday.png) |

The smoke suite's title-override registry
([#2745](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2745)) loses the two
matching rows in the same change. The registry records the overrides that still exist, so a row left
behind would assert an override the code no longer has.
