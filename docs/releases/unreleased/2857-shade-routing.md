---
issue: 2857
title: Walking directions can prefer shade, for the sun at the time of the walk (development only)
testOnDev: |
  | Shade-aware walking ([#2857](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2857)) | [dev.aggiemap.tamu.edu/map/d/trip, Rudder to Zachry at 3 PM on 15 September](https://dev.aggiemap.tamu.edu/map/d/trip?stops=@30.6127,-96.3415@30.6211,-96.3399&mode=9&time=leave&at=2026-09-15T15%3A00%3A00-05%3A00) | "Prefer shade" is ticked; the map draws shade in blue north-east of buildings and trees, and buildings to cut through in maroon; the directions say the sun is 54° up in the south-west and how much of the walk is shaded against the quickest walk. Change *Leave at* to 8:30 AM and the shadows fall west; to 9 PM and it says the sun is down. With `&as=production` the same link gives the plain walk and no shade box |
---

### Walking directions can prefer shade, for the sun at the time of the walk (development only)

The trip planner has a **Prefer shade** option for walking. It works out where the sun is at the trip's *Leave at*
time, casts shadows from the campus buildings and trees around the walk, and solves the walk again with shaded ground
counted at half its time. Buildings the walk can cut through count for less still on weekdays from 7 AM to 9 PM.
The map draws the shade, and the directions say how much of the walk is shaded against the quickest walk.

Building heights come from the 2019 SketchUp campus models where a building has one (362 of 860 buildings) and from
floor counts otherwise; trees from the campus tree inventory, where 8,944 of 16,219 trees have a height. The routing
network has no paths inside the MSC, Rudder Tower or Evans Library, so walks cannot cut through them yet.
([#2857](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2857))

| Before: the quickest walk at 3 PM | After: preferring shade at 3 PM | After: preferring shade at 8:30 AM |
| --- | --- | --- |
| ![The quickest walk from Rudder to Zachry, 14 minutes](../screenshots/2857-shade-routing/before-quickest-3pm.png) | ![The shaded walk at 3 PM: 30% in shade against 24%, shade drawn in blue](../screenshots/2857-shade-routing/after-shaded-3pm.png) | ![The shaded walk at 8:30 AM: 88% in shade against 68%](../screenshots/2857-shade-routing/after-shaded-830am.png) |

| What changed | Issue |
| --- | --- |
| Shade-aware walking directions | [#2857](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2857) |
