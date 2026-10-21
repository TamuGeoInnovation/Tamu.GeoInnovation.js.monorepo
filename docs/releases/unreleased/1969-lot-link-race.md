---
issue: 1969
title: A lot link on an event map opens that map's own lot, not the main map's
testOnDev: |
  | A `?lot=` link opens the event map's own lot ([#1969](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1969)) | [dev.aggiemap.tamu.edu/parking/visitor-parking/map?lot=100j](https://dev.aggiemap.tamu.edu/parking/visitor-parking/map?lot=100j), then the same on [Motorcycle Parking](https://dev.aggiemap.tamu.edu/parking/motorcycle-parking/map?lot=100j); reload each a few times | The popup is the map's own Lot 100j - Visitor Parking's pay-by-space and pay-by-phone notes, or a motorcycle space - and its share link names the map's own layer (`?feature=...`). It never shows, even for a moment, the main map's "Lot 100j, College Station" popup with Directions To Here. A `?lot=` link on the main map still opens the campus lot |
---

### A lot link on an event map opens that map's own lot, not the main map's

A `?lot=100j` link to Visitor Parking or Motorcycle Parking could open the **main map's** Lot 100j - the campus
lot with its address and directions - instead of the event map's own lot or space. It happened about one load in
eight when the machine was busy, and passed on a retry, so it looked like a flaky test.

Two lookups answered the same link. The map selected the linked lot from College Station's lots as soon as it
loaded, while the event map looked for it among its own layers; both selected, and whichever answered last won.
An event map now asks its own layers first, and asks College Station's lots only when none of its own has the lot.
([#1969](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1969))

| Before | After |
| --- | --- |
| ![Visitor Parking opened with ?lot=100j on dev: the main map's Lot 100j popup, an address and Directions To Here](../screenshots/1969-lot-link-race/before-dev-main-map-lot.png) | ![The same link on a local build: Visitor Parking's own Lot 100j, with its pay-by-space and pay-by-phone notes](../screenshots/1969-lot-link-race/after-local-build-own-lot.png) |
