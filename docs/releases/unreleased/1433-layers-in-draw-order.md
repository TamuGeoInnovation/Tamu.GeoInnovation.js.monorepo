---
issue: 1433
app: aggiemap
title: The Layers list and the legend list a map's layers in the same order
testOnDev: |
  | Layers and legend agree ([#1433](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1433)) | [Men's Basketball](https://dev.aggiemap.tamu.edu/events/mens-basketball) and [TS Main Parking](https://dev.aggiemap.tamu.edu/parking/ts-main-parking), the sidebar | **Layers** lists the layers in the same order as the **Legend** below it: Basketball Icons, Closures, Parking on Men's Basketball. On the [main map](https://dev.aggiemap.tamu.edu/map), Layers is no longer alphabetical: the points (restrooms, AggiePrint, dining) come first and Construction Zones last |
---

### The Layers list and the legend list a map's layers in the same order

The Layers list was alphabetical and the legend followed the map, so on 27 of the 62 maps with a Layers list the two
panels put the same layers in different orders, one above the other. A reader matching a legend entry to a layer had to
do it by name. Both now follow the map's drawing order, top first. 29 maps' Layers lists change order; the legends do not
change.
([#1433](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1433))

| Before                                                                                                                                                                          | After                                                                                                                                         |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| ![Men's Basketball: Layers reads Closures, Icons, Parking above a legend reading Icons, Closures, Parking](../screenshots/1433-layers-in-draw-order/before-mens-basketball.png) | ![Men's Basketball: Layers and legend both read Icons, Closures, Parking](../screenshots/1433-layers-in-draw-order/after-mens-basketball.png) |
| ![TS Main Parking: Layers in alphabetical order above a legend in the map's order](../screenshots/1433-layers-in-draw-order/before-ts-main-parking.png)                         | ![TS Main Parking: Layers and legend in the same order](../screenshots/1433-layers-in-draw-order/after-ts-main-parking.png)                   |
| ![The main map's Layers list, alphabetical](../screenshots/1433-layers-in-draw-order/before-main-map.png)                                                                       | ![The main map's Layers list in draw order](../screenshots/1433-layers-in-draw-order/after-main-map.png)                                      |

Both columns are development builds run locally, before and after the change.
