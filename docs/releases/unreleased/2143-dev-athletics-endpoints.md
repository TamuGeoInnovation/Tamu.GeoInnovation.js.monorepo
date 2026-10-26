---
issue: 2143
title: The athletics maps read the GIS team's new services on dev
testOnDev: |
  | Athletics maps on dev use the new services ([#2143](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2143)) | [Indoor Track](https://dev.aggiemap.tamu.edu/parking/indoor-track-parking), [Soccer](https://dev.aggiemap.tamu.edu/parking/soccer-parking), [Tennis](https://dev.aggiemap.tamu.edu/parking/tennis-parking), [Women's Basketball](https://dev.aggiemap.tamu.edu/parking/womens-basketball) and the rest under /parking/ | Each map draws, and the Layers list no longer offers **Safety First** or **Purchase Hourly Visitor Parking** - the GIS team removed them. Accessible spaces and the event lots are still there. **Production is unchanged**, so compare the same map on aggiemap.tamu.edu |
---

### The athletics maps read the GIS team's new services on dev

The GIS team republished the eleven athletics parking maps as hosted views on the development GIS
server, standardised their colours and icons, removed the crosswalk ("Safety First") and visitor kiosk
layers, and renamed the accessible layer. AggieMap's development build now reads those services
([#2143](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2143)).

**Production is untouched.** It keeps its existing services until the GIS team publish there, which
they will do once dev is shown to work - so this changes what you see on dev and nothing else. Each map
that differs declares its development layers beside its production ones, which is the mechanism the
Women's Basketball map has used since [#2001](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2001).

Three maps needed no layer changes at all, because their new services have the same layers in the same
order: **cross country**, **men's basketball** and **baseball**. For those, only the address moved.

**Indoor Track loses Team Bus Parking on dev.** That layer was added in [#2059](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2059) and is not in
the GIS team's new view; they confirmed on 23 October that the development layers are as they intend.

| Before: dev drew production's services | After |
| --- | --- |
| ![Indoor Track on dev, with Safety First and Purchase Hourly Visitor Parking in the Layers list](../screenshots/2143-dev-athletics-endpoints/before-indoor-track-parking.png) | To be captured once this reaches dev |
| ![Soccer on dev, the same](../screenshots/2143-dev-athletics-endpoints/before-soccer-parking.png) | To be captured once this reaches dev |

The "after" images cannot be taken until the build is on dev - these services are only reachable by a
build that points at them. The before images are committed now because they stop being obtainable the
moment it deploys.
