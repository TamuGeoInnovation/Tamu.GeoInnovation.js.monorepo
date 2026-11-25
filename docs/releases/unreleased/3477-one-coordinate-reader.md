---
issue: 3477
title: Searching for coordinates typed the wrong way round now answers instead of doing nothing
testOnDev: |
  | Coordinates typed the wrong way round ([#3477](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3477)) | [Aggie Map dev](https://dev.aggiemap.tamu.edu/map/d) | Type `-96.3, 30.6` in **Find Building or Parking** - longitude first, as a copy and paste often gives it. The search answers **No results found for "-96.3, 30.6"**. Before this it showed nothing at all and left an error in the console. Typed the right way round, `30.6, -96.3` is unchanged by this release and still does not place a point ([#3615](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3615)) |
---

### Searching for coordinates typed the wrong way round now answers instead of doing nothing

The map search accepted any two numbers separated by a comma as "latitude, longitude", with no check that they were a
latitude and a longitude at all. So `-96.3, 30.6` - the same point with its halves the wrong way round, which is how a
copy and paste often gives them - was taken as latitude -96.3, which is not a latitude. The search then stopped
looking: it offered nothing, said nothing, and left an error in the browser's console. A visitor saw their typing
ignored, with no way to tell why.

Coordinates are now read in one place, which checks that the latitude is within 90 degrees and the longitude within 180. A pair out of range is not a coordinate, so the text is searched for as text and the visitor gets an answer -
**No results found** - instead of silence. A pair typed the right way round is read as a coordinate exactly as before.
([#3477](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3477))

| Before                                                                                                                                  | After                                                                                                                                       |
| --------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| ![The map search with -96.3, 30.6 typed and nothing offered](../screenshots/3477-one-coordinate-reader/before-reversed-coordinates.png) | ![The same text answered with No results found for "-96.3, 30.6"](../screenshots/3477-one-coordinate-reader/after-reversed-coordinates.png) |
