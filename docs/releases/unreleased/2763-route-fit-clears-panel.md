---
issue: 2763
app: aggiemap
title: Choosing a bus route shows all of it beside the side panel
testOnDev: |
  | A bus route's fit ([#2763](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2763)) | [dev.aggiemap.tamu.edu/map/d/bus](https://dev.aggiemap.tamu.edu/map/d/bus) | At about 1280 pixels wide, choose route **47 RELLIS**: the whole route shows to the left of the panel, the campus end included, where it used to finish underneath it. Close the panel and choose a route: it uses the whole map. A trip in the trip planner is framed the same way |
---

### Choosing a bus route shows all of it beside the side panel

Choosing a bus route frames the map on it, and the frame took no account of the side panel lying over the map's right
side. On a long route the far end finished underneath the panel: route 47 to RELLIS lost its campus end, 109 pixels of
it at 1280 wide and 347 at 1600. The route is now framed in the part of the map the panel leaves, and so are a trip in
the trip planner and a feature chosen from search. With the panel closed, the whole map is used.
([#2763](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2763))

| Before                                                                                                               | After                                                                                                     |
| -------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| ![Route 47 at 1280 wide: its campus end under the panel](../screenshots/2763-route-fit-clears-panel/before-1280.png) | ![The same route: all of it left of the panel](../screenshots/2763-route-fit-clears-panel/after-1280.png) |
| ![Route 47 at 1600 wide: its campus end under the panel](../screenshots/2763-route-fit-clears-panel/before-1600.png) | ![The same route: all of it left of the panel](../screenshots/2763-route-fit-clears-panel/after-1600.png) |
