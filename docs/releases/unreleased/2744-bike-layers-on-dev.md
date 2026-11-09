---
issue: 2744
title: The bike layers and building entrances draw on dev, marked as production data
testOnDev: |
  | AggieMap: the bike layers and building entrances draw on dev ([#2744](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2744)) | [dev.aggiemap.tamu.edu/map](https://dev.aggiemap.tamu.edu/map), turn on Sustainable Transportation, then Accessible Building Entrances | Bike racks, bike lanes, fix stations, dismount zones and EV chargers draw, and so do the building entrances; both rows carry a small "production data" marker, which explains itself on hover. On [aggiemap.tamu.edu/map](https://aggiemap.tamu.edu/map) neither has a marker |
---

### AggieMap: the bike layers and building entrances draw on dev, marked as production data

Six layers on dev's main map drew nothing: Dismount Zones, City Bike Lanes and Routes, Campus Bike Lanes, Bike Fix
Stations, Bike Racks and EV Charge Stations, which make up Sustainable Transportation. Their service is on the
development GIS server, but there it answers "Token Required", which the map reports as "Service not found", so a
development build could not read it. Accessible Building Entrances was dead on dev too: the development copy of its
service has no layers. Dev now reads all seven from production, as it already did for 4-H Roundup and the
Micromobility map.

On dev, the Layers list marks every layer read from production in this way with a small **production data** label,
and hovering it shows why. A group is marked when a layer in it is, since the list shows Sustainable Transportation as
one row. The label comes from the same list that sends the layer to production, so the two cannot disagree, and it
never appears on production. The smoke suite now fails on any service dev cannot read while production serves it,
rather than letting one be allowed as a known failure, as these were for a year. That check is what found the building
entrances.
([#2744](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2744))

| Before: Sustainable Transportation is on and nothing draws | After: its layers draw, and its row is marked |
| --- | --- |
| ![Before](../screenshots/2744-bike-layers-on-dev/before-dev.png) | ![After](../screenshots/2744-bike-layers-on-dev/after-dev.png) |
