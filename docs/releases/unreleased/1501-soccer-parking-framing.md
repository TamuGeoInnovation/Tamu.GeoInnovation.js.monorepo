---
issue: 1501
app: aggiemap
title: Soccer Parking opens with all its lots in view
testOnDev: |
  | Soccer Parking's framing ([#1501](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1501)) | [dev.aggiemap.tamu.edu/parking/soccer-parking](https://dev.aggiemap.tamu.edu/parking/soccer-parking), on a phone and a desktop | The map opens centred on the three event lots (104, 100g and 100j), all in view on a phone. Until this release reaches production and the framing baseline is refreshed from it, the framing smoke check reports this map at its new centre, which is expected (#1501) |
---

### Soccer Parking opens with all its lots in view

Soccer Parking opened on the same spot as Outdoor Track Parking, about 250 metres from its own lots, so on a phone one
of them ran off the edge of the map and on a desktop they sat in a corner. It now opens centred on its lots.
([#1501](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1501))

| Before                                                                                                     | After                                                                                                 |
| ---------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| ![On a phone: Lot 100j runs off the right](../screenshots/1501-soccer-parking-framing/before-phone.png)    | ![On a phone: all three lots in view](../screenshots/1501-soccer-parking-framing/after-phone.png)     |
| ![On a desktop: the lots in the top corner](../screenshots/1501-soccer-parking-framing/before-desktop.png) | ![On a desktop: the lots in the middle](../screenshots/1501-soccer-parking-framing/after-desktop.png) |
