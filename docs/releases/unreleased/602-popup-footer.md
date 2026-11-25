---
issue: 602
title: Lactation rooms, accessible entrances, restrooms and visitor kiosks offer Directions To Here
testOnDev: |
  | Directions from four more popups ([#602](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/602)) | AggieMap dev, `/map/d`: turn on Lactation Rooms, click a room; then the same for Single Occupancy Restroom Locations, Accessible Building Entrances and Visitor Parking | Each popup ends with **Directions To Here**. Pressing it opens the trip planner with the place as the destination; choose a start and a route appears. A building, garage, lot or point of interest popup is unchanged, with its copy link and its Directions. Construction zones still have no Directions |
---

### Lactation rooms, accessible entrances, restrooms and visitor kiosks offer Directions To Here

The popups for lactation rooms, accessible building entrances, single-occupancy restrooms and visitor parking kiosks
had no **Directions To Here**, so the people most likely to want directions to them had to find the place on the map
themselves ([#602](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/602)). They now end with
the same button as a building's popup, and pressing it plans a trip there. Construction zones are left without it on
purpose: a construction area is a fenced site, and routing to its middle would send people into it.

Every popup that already had a copy link or Directions now draws them from one shared footer rather than its own copy,
so they look and work the same everywhere. A copy link is shown only where it reopens the place; for these four kinds of
place that needs a link of their own first
([#3555](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3555)).

| Before                                                                                                                           | After                                                                                                               |
| -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| ![A lactation room's popup with no Directions](../screenshots/602-popup-footer/before-lactation-popup.png)                       | ![The same kind of popup ending with Directions To Here](../screenshots/602-popup-footer/after-lactation-popup.png) |
| ![A restroom's popup with no Directions](../screenshots/602-popup-footer/before-restroom-popup.png)                              | ![The same popup ending with Directions To Here](../screenshots/602-popup-footer/after-restroom-popup.png)          |
| ![An accessible entrance's popup with no Directions](../screenshots/602-popup-footer/before-accessible-popup.png)                | ![The same popup ending with Directions To Here](../screenshots/602-popup-footer/after-accessible-popup.png)        |
| ![A visitor parking kiosk's popup with no Directions](../screenshots/602-popup-footer/before-kiosk-popup.png)                    | ![The same popup ending with Directions To Here](../screenshots/602-popup-footer/after-kiosk-popup.png)             |
| ![The Central Campus garage's popup, with its copy link and Directions](../screenshots/602-popup-footer/before-garage-popup.png) | ![The same popup, unchanged](../screenshots/602-popup-footer/after-garage-popup.png)                                |
