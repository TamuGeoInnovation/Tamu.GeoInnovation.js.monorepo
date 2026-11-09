---
issue: 2744
title: Nine layers that were dead on dev draw, and dev marks what it reads from production
testOnDev: |
  | AggieMap: the bike layers, building entrances, emergency phones and restrooms draw on dev ([#2744](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2744)) | [dev.aggiemap.tamu.edu/map](https://dev.aggiemap.tamu.edu/map), turn on Sustainable Transportation, Accessible Building Entrances, Emergency Phones and Single Occupancy Restroom Locations | All four draw and none is struck through. Each, and every other layer dev reads from production (Construction Zones, Lactation Rooms, Nature Rx), carries a small "production data" label that explains itself on hover. On [aggiemap.tamu.edu/map](https://aggiemap.tamu.edu/map) no layer has the label |
---

### AggieMap: nine layers that were dead on dev draw, and dev marks what it reads from production

Nine layers on dev's main map drew nothing. Six are Sustainable Transportation's: Dismount Zones, City Bike Lanes and
Routes, Campus Bike Lanes, Bike Fix Stations, Bike Racks and EV Charge Stations. Their service is on the development
GIS server, but there it answers "Token Required", which the map reports as "Service not found". The other three are
Accessible Building Entrances, Emergency Phones and Single Occupancy Restroom Locations, whose services' development
copies have no layers at all. Dev now reads all of them from production, as it already did for 4-H Roundup and the
Micromobility map.

On dev, the Layers list marks every layer read from production with a small **production data** label, and hovering it
shows why. A group is marked when a layer in it is, since the list shows Sustainable Transportation as one row. The
label comes from the same list that sends a layer to production, so the two cannot disagree, and it never appears on
production.

Seeing the labels showed that two pins were wider than their reasons ([#2756](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2756)).
All of Transportation's TS_Main service was read from production because one of its eight layers, Parking Lots, keeps
its space counts under a different name on the development server. Now only Parking Lots is, and Visitor Parking and
the other six layers read dev's own copy, which matches production field for field. Construction Zones stays on
production, now with the reason written beside it: dev's construction service answers without any shapes, so it would
draw nothing.

The smoke suite now fails on any service dev cannot read, or any layer it lacks, while production serves it, rather
than letting one be allowed as a known failure, as these nine were for a year. That check is what found the last three.
([#2744](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2744))

| Before: Sustainable Transportation is on and nothing draws; three layers are struck through | After: everything draws, and each layer read from production is marked |
| --- | --- |
| ![Before](../screenshots/2744-bike-layers-on-dev/before-dev.png) | ![After](../screenshots/2744-bike-layers-on-dev/after-dev.png) |
