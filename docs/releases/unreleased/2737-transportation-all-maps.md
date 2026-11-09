---
issue: 2737
title: All Maps has a Transportation section, and the Micromobility map is in it
testOnDev: |
  | A Transportation tile on All Maps ([#2737](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2737)) | [dev.aggiemap.tamu.edu/all-maps](https://dev.aggiemap.tamu.edu/all-maps) | Under Visit Maps, a **Transportation** tile sits between **Parking** and **Athletics Events**, with a two-pins-and-route icon drawn like the other tiles' |
  | The Transportation page lists the Micromobility map ([#2738](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2738)) | [dev.aggiemap.tamu.edu/all-maps/transportation](https://dev.aggiemap.tamu.edu/all-maps/transportation) | The page opens with the heading **Transportation** and lists **Micromobility**, which opens the map. It is development-only, so the same page on production lists nothing yet |
---

### All Maps has a Transportation section, and the Micromobility map is in it

All Maps had nowhere for a map about getting around campus rather than parking a car. **Transportation** is a new tile
under Visit Maps, between Parking and Athletics Events, and a page behind it at `/all-maps/transportation`.
([#2737](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2737))

Its icon is two map pins joined by a route, after Transportation Services' own "Bike Lanes and Racks" icon on
`m.tamu.edu`, so AggieMap and their pages read as one service. It is drawn as an inline shape like every other tile's
rather than used as their image, which would not take the page's colour or stay sharp.

**The Micromobility map is listed there**, and until now could not be reached from the site at all - it opened only by
typing its address, because its entry claimed a parking category and no map type, which left it listed nowhere.
([#2738](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2738))

That also means **no test had ever loaded it**. The smoke suite finds maps by walking All Maps, and the 8 November run
discovered 81 maps and not this one - so nothing had drawn its layers or counted its features, while the NCAA Volleyball
map added the same day was checked in full. A map nobody can find is also a map nothing tests.

The Micromobility map stays development-only until it is ready for production. The Sustainable Transportation and bus
maps will join it on this page.

![The Visit Maps tiles before: Parking is followed by Athletics Events](../screenshots/2737-transportation-all-maps/before-visit-maps.jpg)

![The Visit Maps tiles after: a Transportation tile sits between Parking and Athletics Events](../screenshots/2737-transportation-all-maps/after-visit-maps.jpg)
