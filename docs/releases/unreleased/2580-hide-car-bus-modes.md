---
issue: 2580
title: Directions on dev offer walking, accessible walking and biking only
testOnDev: |
  | Directions: the travel modes offered ([#2580](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2580)) | [A walking trip on dev](https://dev.aggiemap.tamu.edu/map/d/trip?mode=1&stops=30.6150,-96.3500@30.6150,-96.3300) | The picker shows three modes, Walking, Biking and, through the accessibility button, accessible walking; there is no Driving or Bus button, and the panel lists only Walk and Bike times. Open [the same trip with `mode=5`](https://dev.aggiemap.tamu.edu/map/d/trip?mode=5&stops=30.6150,-96.3500@30.6150,-96.3300) (a bus link) and it opens as a walking trip, not an empty panel |
---

### Directions on dev no longer offer driving or the bus

The trip planner on dev hides the Driving and Bus buttons and no longer asks the routing network for drive or bus
trips. The network does solve them, but it measures driving and the bus by road length, and knows no bus schedule, so a
"Bus 30 min" was a distance estimate, not a transit time. Walking, accessible walking and biking use time and stay. A
link that names a hidden mode (`mode=3`, `4`, `5`, `6` or `8`) opens as walking, or as accessible walking for the
accessible modes. The modes are hidden, not removed: the planner's rules and the network still have them, and one list
(`HIDDEN_PLANNER_MODES`) brings them back
([#2580](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2580)).

| | Before | After |
| --- | --- | --- |
| Trip panel on dev | ![Four mode buttons: Walking, Biking, Driving, Bus](../screenshots/2580-hide-car-bus-modes/before-trip-walk.png) | ![Two mode buttons: Walking, Biking](../screenshots/2580-hide-car-bus-modes/after-trip-walk.png) |
| A bus link (`mode=5`) | ![The bus selected](../screenshots/2580-hide-car-bus-modes/before-trip-bus-link.png) | ![It opens as a walking trip](../screenshots/2580-hide-car-bus-modes/after-trip-bus-link.png) |
