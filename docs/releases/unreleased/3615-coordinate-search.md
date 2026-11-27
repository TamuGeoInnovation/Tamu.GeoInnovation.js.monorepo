---
issue: 3615
app: aggiemap
title: A coordinate typed into the search is placed on the map
testOnDev: |
  | Typed coordinate ([#3615](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3615)) | AggieMap dev: `/map/d`, and `/map/m` on a phone | Type `30.6, -96.3` (latitude first) into Find Building or Parking: the map moves there and marks the point, with no "No results found" under the box. `-96.3, 30.6` (longitude first) is still not read as a coordinate, by design |
---

### A coordinate typed into the search is placed on the map

Typing a coordinate such as `30.6, -96.3` into **Find Building or Parking**, latitude first as phones and Google Maps copy
it, placed nothing and could leave "No results found" under the box. The map now moves to that point and marks it, on
desktop and on phones. A longitude given first is still not read as a coordinate.
([#3615](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3615))

| Before                                                                                                                   | After                                                                                                                  |
| ------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| ![Desktop: the coordinate typed, and nothing placed](../screenshots/3615-coordinate-search/before-desktop-lat-first.png) | ![Desktop: the map moved to the coordinate, marked](../screenshots/3615-coordinate-search/after-desktop-lat-first.png) |
| ![Phone: the coordinate typed, and nothing placed](../screenshots/3615-coordinate-search/before-phone-lat-first.png)     | ![Phone: the map moved to the coordinate, marked](../screenshots/3615-coordinate-search/after-phone-lat-first.png)     |
