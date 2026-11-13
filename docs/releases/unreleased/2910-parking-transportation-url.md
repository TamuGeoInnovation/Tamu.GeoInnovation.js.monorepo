---
issue: 2910
title: "Parking & Transportation has its own address, and the brand's own bus-and-car icon"
testOnDev: |
  | Parking & Transportation's address and icon ([#2910](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2910)) | [All Maps on dev](https://dev.aggiemap.tamu.edu/all-maps), then [the new address](https://dev.aggiemap.tamu.edu/all-maps/parking-transportation) and [the old one](https://dev.aggiemap.tamu.edu/all-maps/parking) | The **Parking & Transportation** tile shows Aggie UX's `aux_car-bus` - a bus behind a car, in the same line weight as the Athletics, Campus Events and Operations icons - and opens `/all-maps/parking-transportation`; the old `/all-maps/parking` lands on that same page, with the address bar showing the new one |
---

### Parking & Transportation has its own address, and the brand's own bus-and-car icon

Two pieces of feedback from the testing team on [#2895](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2895), which brought the
transportation maps onto the parking section's page.

**The section is now at `/all-maps/parking-transportation`.** It was still at `/all-maps/parking`, which stopped
describing the page when Buses & Transportation was listed above Parking.

**The old address still works, at the same page.** `/all-maps/parking` has been the parking listing's address for
years and is linked from outside this repository, so it redirects to the new one rather than being retired - keeping
any query string and anchor - which is how [#2767](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2767) treated the individual maps that moved from
`/parking/<map>` to `/transportation/<map>`. A test holds it open, so the next person to tidy the route table fails a
check rather than somebody's link.

**The tile now carries the university's own icon.** #2895 shipped a placeholder traced from artwork supplied by hand,
and [#2897](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2897) asked Transportation for a version drawn for the 52-pixel tile. The team
pointed out that the icon already exists: **`aux_car-bus`**, in the Transportation family of the
[Aggie UX icon library](https://aggieux.tamu.edu/?path=/docs/getting-started-branding-aggie-ux-icon-library--docs)
(2.1.2). It is the brand's artwork, drawn at the weight the rest of the icon set uses, and it is already on the same
grid the older tiles are traced on - so it needed no redrawing and it settles #2897.

The maps themselves did not move: Micromobility is still at `/transportation/micromobility/` and the parking maps are
still at `/parking/<map>`.

([#2910](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2910), [#2897](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2897))

| Before                                                                                                                                      | After                                                                                                                                             |
| ------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| ![The Parking & Transportation tile with the traced placeholder icon](../screenshots/2910-parking-transportation-url/before-tile.png)       | ![The same tile with Aggie UX's aux_car-bus icon](../screenshots/2910-parking-transportation-url/after-tile.png)                                  |
| ![The All Maps row with the placeholder icon among the other tiles](../screenshots/2910-parking-transportation-url/before-all-maps-row.png) | ![The All Maps row with the brand icon, matching the weight of the others](../screenshots/2910-parking-transportation-url/after-all-maps-row.png) |
| ![The section's page, served at /all-maps/parking](../screenshots/2910-parking-transportation-url/before-page.png)                          | ![The same page, served at /all-maps/parking-transportation](../screenshots/2910-parking-transportation-url/after-page.png)                       |
