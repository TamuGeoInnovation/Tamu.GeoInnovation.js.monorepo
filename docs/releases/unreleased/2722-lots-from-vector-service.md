---
issue: 2722
title: Parking lots and buildings under construction come from the vector basemap's service
testOnDev: |
  | Parking lots read from the vector basemap's service ([#2722](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2722)) | [dev.aggiemap.tamu.edu/map?lot=077](https://dev.aggiemap.tamu.edu/map?lot=077), then click a few surface lots on [the main map](https://dev.aggiemap.tamu.edu/map/d) | `?lot=077` opens Lot 077 itself, not its loading zone; clicking a lot opens its popup with the lot's name; searching "Lot 100" lists the lots; the buildings under construction still show the orange grid |
---

### AggieMap: parking lots and buildings under construction come from the vector basemap's service

The main map's surface parking lots, the parking lot search and `?lot=` links, the buildings drawn as under
construction, and the residence halls Move-In highlights now read the feature service the campus vector basemap is published from, as the buildings already do
([#2707](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2707)). The service they read
before failed some requests at random (3 of 200 for the lots, measured 9 November 2026, against 0 of 200 for the new
one), and the map does not ask again. Nothing looks different: the same lots, in the same order for `?lot=` links, and
the same eight buildings under construction, the same hall for each Move-In choice.

Lot 8712 is the one lot not in the new service. Parking garages still come from the old service, because the new one
has no garage layer to take them from.

The UES Operations map's parking lot search works again. It had been asking the old service's Wall Area layer, which has
no lot names, so every search failed.

([#2722](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2722))
