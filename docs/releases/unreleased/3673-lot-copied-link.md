---
issue: 3673
title: A lot's copied link on the Break / Summer and New Student Conference maps reopens the lot
testOnDev: |
  | A copied lot link reopens the lot ([#3673](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3673)) | [Break / Summer, lot 100g](https://dev.aggiemap.tamu.edu/parking/break-summer/map/d?feature=Break-Summer%20Parking%20Lots%3A34768) and [NSC, lot 100g](https://dev.aggiemap.tamu.edu/events/nsc-parking/map/d?feature=NSC%20Parking%20Lots%3A34768) | Each opens zoomed to lot 100g, outlined in yellow, with its popup showing that map's note for the lot. Before, both opened the map with nothing selected |
---

### A lot's copied link on the Break / Summer and New Student Conference maps reopens the lot

The copy link in a lot's popup on these two maps opened the map with nothing selected, so the person it was sent to saw
a campus map and no lot. The link was right; the lot service answers a search without the lot's outline ([#2520](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2520)), and
the map gave up. It now asks the same service for the outline another way, so the link opens zoomed to the lot with its
popup. Clicking a lot on these maps is unchanged: that needs the service fixed.
([#3673](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3673))

| Before                                                                                                                         | After                                                                                                                |
| ------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------- |
| ![Break / Summer opened from a lot's link, with nothing selected](../screenshots/3673-lot-copied-link/before-break-summer.png) | ![The same link, zoomed to lot 100g with its Break note](../screenshots/3673-lot-copied-link/after-break-summer.png) |
| ![New Student Conference opened from a lot's link, with nothing selected](../screenshots/3673-lot-copied-link/before-nsc.png)  | ![The same link, zoomed to lot 100g with its NSC note](../screenshots/3673-lot-copied-link/after-nsc.png)            |
