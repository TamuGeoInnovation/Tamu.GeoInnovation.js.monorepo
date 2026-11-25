---
issue: 3425
title: The garage search reads the campus feature service, and each garage appears once
testOnDev: |
  | The garage search ([#3425](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3425)) | [dev.aggiemap.tamu.edu/map/d](https://dev.aggiemap.tamu.edu/map/d), then search `garage`; then open [?garage=CCG](https://dev.aggiemap.tamu.edu/map/d?garage=CCG) | Each garage is listed **once**, under Parking Garage, and the names carry "Parking" in the middle - "Southside Parking Garage", not "Southside Garage". Building lists only "Teex Itsi Garage & Offices", which has Garage in its name and is not one. The popup names the garage rather than showing an empty heading, and `?garage=CCG` still opens Central Campus Parking Garage |
---

### The garage search reads the campus feature service, and each garage appears once

The garages were the last thing on the map still reading the old raster campus basemap, which was retired as
a data source on 9 November 2026 and is no longer maintained. They now come from Campus Structures on the
same feature service the buildings and surface lots already use.

**The names change**, because the two sources name the same garages differently: "Southside Garage" is
"Southside Parking Garage" in Facilities' data, and a search finds it by typing any part of that.

**Shared links keep working.** A `?garage=CCG` link made before this still opens Central Campus Parking
Garage: the two services carry the same garage codes, and the search matches on those rather than on a name.

Each garage is also listed once now. Garages are buildings in the new source, so for a moment they appeared
twice - once under Building and once under Parking Garage - and the building search gives them up. A deep
link to a garage as a building, such as `?bldg=0469`, still works.

| | Before | After |
| --- | --- | --- |
| Searching `garage` | ![Each garage listed under both Building and Parking Garage](../screenshots/3425-garage-search/before-garage-search.png) | ![Each garage listed once, under Parking Garage](../screenshots/3425-garage-search/after-garage-search.png) |
| A garage's popup | ![Central Campus Garage](../screenshots/3425-garage-search/before-garage-popup.png) | ![Central Campus Parking Garage](../screenshots/3425-garage-search/after-garage-popup.png) |

Two things found while doing it are filed rather than fixed here: a general search returns only five of the
ten garages ([#3433](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3433), which
predates this), and the service carries an eleventh garage row with no name at all
([#3434](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3434), which is the GIS
team's).
