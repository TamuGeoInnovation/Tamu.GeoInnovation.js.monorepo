---
issue: 1250
app: aggiemap
title: A campus map's basemap can be changed
testOnDev: |
  | A campus map's basemap ([#1250](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1250)) | [dev.aggiemap.tamu.edu/campus/galveston](https://dev.aggiemap.tamu.edu/campus/galveston), and any other campus map from All Maps | The side panel has the gear beside the menu. It opens Basemap, listing the five world basemaps (Topographic to Light Gray Canvas), and choosing one changes the map around the campus. It does not list Aggieland or Aerial Imagery, College Station's own. On the main map the gear still lists them |
---

### A campus map's basemap can be changed

The maps of Texas A&M's other campuses, such as Galveston, McAllen and the Bush School in Washington, D.C., showed only
the menu in their side panel, so their basemap could not be changed. They now have the gear every other map has. It
offers the world basemaps only: College Station's own campus basemap and aerial imagery draw nothing on another campus,
so they are left out there.
([#1250](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1250))

| Before                                                                      | After                                                                                                  |
| --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| ![Galveston: the menu only](../screenshots/1250-campus-map-gear/before.png) | ![Galveston: the gear open, listing the world basemaps](../screenshots/1250-campus-map-gear/after.png) |
