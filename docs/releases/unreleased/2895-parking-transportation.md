---
issue: 2895
title: 'Micromobility is on production, and Parking is now Parking & Transportation'
testOnDev: |
  | Micromobility on production, and Parking & Transportation ([#2895](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2895)) | [All Maps on dev](https://dev.aggiemap.tamu.edu/all-maps), then [Parking & Transportation](https://dev.aggiemap.tamu.edu/all-maps/parking) and [the Micromobility map](https://dev.aggiemap.tamu.edu/transportation/micromobility/) | One **Parking & Transportation** tile with a bus-and-car icon, and no separate Transportation tile; the page lists **Buses & Transportation** first - Bus Routes, Micromobility, Sustainable Transportation - then **Parking** in its three columns; every link opens its map, with the transportation ones at `/transportation/...` and the parking ones at `/parking/...`; the main map's layer list has neither Micromobility nor Sustainable Transportation |
---

### Micromobility is on production, and Parking is now Parking & Transportation

**The Micromobility map is on production**, on Transportation Services' approved paths service, which they publish on
each environment's own host. It is at
[aggiemap.tamu.edu/transportation/micromobility](https://aggiemap.tamu.edu/transportation/micromobility/).

**Transportation no longer has its own section.** It had a tile of its own on All Maps and a page behind it, both
visible only on development because every map they listed was. Rather than send a third top-level tile to production
for three maps, the **Parking** section is renamed **Parking & Transportation** and its page is split in two:

- **Buses & Transportation** first: Bus Routes, Micromobility and Sustainable Transportation.
- **Parking** below, in the General, Business and Permit columns it always had.

Each map keeps the address it should have: the transportation ones at `/transportation/<map>` and the parking ones at
`/parking/<map>`, from the one page. **Sustainable Transportation** is on production for the first time, and **Bus
Routes** is now listed everywhere rather than only where development features are on.

**Micromobility and Sustainable Transportation have come off the main map.** Both were groups in the main map's layer
list; they are maps in their own right and are reached as maps now. The six layers inside the Sustainable
Transportation group - Bike Racks, Campus Bike Lanes, City Bike Lanes and Routes, Bike Fix Stations, Bike Dismount
Zones and EV Charge Stations - went with it, and are on the Sustainable Transportation map.

([#2895](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2895),
[#2864](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2864))

| Before | After |
| --- | --- |
| ![The All Maps row with separate Parking and Transportation tiles](../screenshots/2895-parking-transportation/before-all-maps-tiles.png) | ![The All Maps row with one Parking & Transportation tile](../screenshots/2895-parking-transportation/after-all-maps-tiles.png) |
| ![The Parking page: three columns of parking maps and nothing else](../screenshots/2895-parking-transportation/before-parking-page.png) | ![The Parking & Transportation page: Buses & Transportation above, Parking below](../screenshots/2895-parking-transportation/after-parking-page.png) |
