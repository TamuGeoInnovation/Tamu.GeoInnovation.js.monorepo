---
issue: 2639
title: Directions to a tailgate tent, ending at the tent
testOnDev: |
  | Directions to a tent ([#2639](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2639)) | [Tent O62 on dev](https://dev.aggiemap.tamu.edu/events/tailgating/map?tent=O62), and [a walk to it](https://dev.aggiemap.tamu.edu/events/tailgating/map/m/trip?mode=1&stops=30.6123,-96.3410@30.610546,-96.338199) | The tent's popup offers **Directions To Here**, on a phone too. The walk follows the walkway north of Ortega Lawn, then a solid blue line crosses the lawn to the tent, and the last step reads "Leave the path and walk about 35 m to …". On production the button stays hidden |
---

### Directions to a tailgate tent

A tent on the Football Tailgating map now offers **Directions To Here**, as other event map features do. The walking network
has only paths, so a trip to a tent used to end on the nearest walkway, about 35 m from tent O62. The trip planner now draws the
last stretch from the end of the route to the destination itself, and the last written step says to leave the path for it.
The last stretch is drawn for any destination up to 150 m off a path, so a building or lot gets it too. Directions are still
development-only ([#2639](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2639)).

| Before | After |
| --- | --- |
| ![Tent O62's popup, with no directions](../screenshots/2639-tent-directions/before-tent-popup.png) | ![A walk to tent O62, crossing the lawn at the end](../screenshots/2639-tent-directions/after-walk-to-tent.png) |
