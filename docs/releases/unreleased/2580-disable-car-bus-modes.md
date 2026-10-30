---
issue: 2580
title: Directions on dev can be chosen for walking, accessible walking and biking only; Driving and Bus are greyed out
testOnDev: |
  | Directions: the travel modes that can be chosen ([#2580](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2580)) | [A walking trip on dev](https://dev.aggiemap.tamu.edu/map/d/trip?mode=1&stops=30.6150,-96.3500@30.6150,-96.3300) | The picker shows four buttons. Walking and Biking (and, through the accessibility button, accessible walking) can be chosen; Driving and Bus are visible but greyed out and cannot be clicked or reached with the Tab key, and hovering one says its directions are not available yet. The panel lists only Walk and Bike times. Open [the same trip with `mode=5`](https://dev.aggiemap.tamu.edu/map/d/trip?mode=5&stops=30.6150,-96.3500@30.6150,-96.3300) (a bus link) and it opens as a walking trip, with Bus greyed out, not an empty panel |
---

### Driving and the bus are greyed out in directions on dev

The trip planner on dev still shows the Driving and Bus buttons, but they are disabled: they cannot be clicked, are
skipped by the Tab key, and say "not available yet" on hover and to a screen reader. The planner no longer asks the
routing network for drive or bus trips. The network does solve them, but it measures driving and the bus by road length,
and knows no bus schedule, so a "Bus 30 min" was a distance estimate, not a transit time. Walking, accessible walking and
biking use time and stay selectable. A link that names an unavailable mode (`mode=3`, `4`, `5`, `6` or `8`) opens as
walking, or as accessible walking for the accessible modes. The modes are disabled, not removed: the planner's rules and
the network still have them, and one list (`UNAVAILABLE_PLANNER_MODES`) brings them back
([#2580](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2580)).

| | Before | After |
| --- | --- | --- |
| Trip panel on dev | ![Four mode buttons: Walking, Biking, Driving, Bus](../screenshots/2580-disable-car-bus-modes/before-trip-walk.png) | ![Walking and Biking selectable, Driving and Bus greyed out](../screenshots/2580-disable-car-bus-modes/after-trip-walk.png) |
| A bus link (`mode=5`) | ![The bus selected](../screenshots/2580-disable-car-bus-modes/before-trip-bus-link.png) | ![It opens as a walking trip, Bus greyed out](../screenshots/2580-disable-car-bus-modes/after-trip-bus-link.png) |
