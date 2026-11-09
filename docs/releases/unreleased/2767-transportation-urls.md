---
issue: 2767
title: Transportation maps are at /transportation/, not /parking/
testOnDev: |
  | AggieMap: Transportation maps' addresses ([#2767](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2767)) | [dev.aggiemap.tamu.edu/all-maps/transportation](https://dev.aggiemap.tamu.edu/all-maps/transportation), open Micromobility, then Sustainable Transportation; then [dev.aggiemap.tamu.edu/parking/micromobility](https://dev.aggiemap.tamu.edu/parking/micromobility) | Each opens at `/transportation/<id>/map/d`. The old `/parking/micromobility` link ends at `/transportation/micromobility/map/d`. Parking maps, such as Visitor Parking, are still at `/parking/` |
---

### AggieMap: Transportation maps are at /transportation/, not /parking/

The maps in All Maps' Transportation section, Micromobility and Sustainable Transportation, opened at
`/parking/micromobility` and `/parking/sustainable-transportation`. A micromobility map is not a parking map, and the
address is what a visitor copies, shares and reads. They now open at `/transportation/micromobility` and
`/transportation/sustainable-transportation`, and their old `/parking/` addresses still work, moving to the new ones.

The section a map is listed in now decides its address, so a map listed under Transportation cannot end up at a
parking address again. Parking maps keep their addresses. Both maps are on dev only.
([#2767](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2767))

| Before: Micromobility, chosen in All Maps > Transportation, opens at /parking/ | After: it opens at /transportation/ |
| --- | --- |
| ![Before](../screenshots/2767-transportation-urls/before.png) | ![After](../screenshots/2767-transportation-urls/after.png) |

The address is drawn over the top of each image by the capture, which has no address bar.
