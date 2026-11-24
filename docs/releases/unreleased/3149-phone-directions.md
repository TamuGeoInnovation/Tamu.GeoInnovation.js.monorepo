---
issue: 3149
title: Directions on a phone, from the menu and back from a stop's search
testOnDev: |
  | Directions in the phone menu ([#3149](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3149)) | [dev.aggiemap.tamu.edu/map/m/sidebar](https://dev.aggiemap.tamu.edu/map/m/sidebar), **on a phone or a phone-sized window** | The menu lists Directions after Bus Routes, and it opens the trip planner at `/map/m/trip` |
  | Back from a trip stop's search ([#3319](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3319)) | [dev.aggiemap.tamu.edu/map/m/trip](https://dev.aggiemap.tamu.edu/map/m/trip), **on a phone or a phone-sized window** | Tap a stop's field, then the search bar's back arrow: it returns to the trip planner, not the main map. Choosing a place for the stop also returns there |
---

### Directions on a phone, from the menu and back from a stop's search

The phone menu now has **Directions**, after Bus Routes. A phone had its own trip planner all along, but nothing on a
phone led to it except Directions To Here in a feature's popup; the desktop has always had a Directions tab. And the back
arrow in a trip stop's search, which should return to the trip planner, went to the main map instead, losing the trip.
It now returns to the trip planner, as choosing a place for the stop does.
([#3149](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3149),
[#3319](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3319))

| Phone, 390 pixels | Before | After |
| --- | --- | --- |
| The menu | ![The menu: Bus Routes, then All Maps](../screenshots/3149-phone-directions/before-phone-menu.png) | ![Directions after Bus Routes](../screenshots/3149-phone-directions/after-phone-menu.png) |
| Directions, tapped | | ![The trip planner, at /map/m/trip](../screenshots/3149-phone-directions/after-directions.png) |
| Back from a stop's search | ![The main map, the trip lost](../screenshots/3149-phone-directions/before-stop-search-back.png) | ![Back in the trip planner](../screenshots/3149-phone-directions/after-stop-search-back.png) |
