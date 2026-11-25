---
issue: 3477
title: Searching for a coordinate pair typed longitude first no longer leaves campus
testOnDev: |
  | Coordinates typed the wrong way round ([#3477](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3477)) | [Aggie Map dev](https://aggiemap-dev.tamu.edu/map/d) | Type `-96.3, 30.6` in the search - longitude first, as a copy-and-paste often gives it. Nothing is offered as a place and the map stays on campus. Then type `30.6, -96.3`, the right way round: that still takes you to the point just west of campus |
---

### Searching for a coordinate pair typed longitude first no longer leaves campus

The map search accepted any two numbers separated by a comma as "latitude, longitude", with no check that they were a
latitude and a longitude at all. So `-96.3, 30.6` - the same point with the two halves the wrong way round, which is
how a copy and paste often gives them - was read as latitude -96.3, and the map went to a point in the Southern Ocean
that does not exist. There was nothing to tell a visitor what had happened: the search simply left campus.

Coordinates are now read in one place, which checks that the latitude is within 90 degrees and the longitude within
180. Text that is not two numbers in range is searched for as text instead, so the pair typed the wrong way round
finds nothing and the map stays where it was. Coordinates typed correctly are unchanged.
([#3477](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3477))

| Before | After |
| --- | --- |
| ![The map search with -96.3, 30.6 typed, offering it as a place](../screenshots/3477-one-coordinate-reader/before-reversed-coordinates.png) | ![The same text offering no place, with the map still on campus](../screenshots/3477-one-coordinate-reader/after-reversed-coordinates.png) |
