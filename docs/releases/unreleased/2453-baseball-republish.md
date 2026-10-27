---
issue: 2453
title: The baseball parking maps draw every lot, their icons, and the shuttle over the lots again
testOnDev: |
  | Baseball parking after the republish ([#2453](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2453)) | [the Baseball Event Map](https://dev.aggiemap.tamu.edu/parking/baseball-parking/map/d?map-mode=event) and [the Accessible Baseball Map](https://dev.aggiemap.tamu.edu/parking/baseball-parking/map/d?map-mode=accessible) | The event map shows Lot 100j and Lot 102 (orange, Reserved) with the other lots, and no shuttle route. The accessible map shows the parking, bus and shuttle icons, lists "Baseball Event Parking Lots" once, and draws the blue shuttle route over the lots |
---

### The baseball parking maps draw every lot, their icons, and the shuttle over the lots again

The baseball parking service was republished on the development server, and the maps built on it went wrong.
The Baseball Event Map lost Lot 100j and Lot 102, which the new service marks Reserved. The Accessible Baseball
Map lost its icons, listed its lots twice, and drew Lot 100j over the accessible shuttle route. Both maps now
draw every lot once. The accessible map shows the icons, and its shuttle route draws over the lots. The event
map still leaves the shuttle route off
([#2453](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2453)).

| | Before | After |
| --- | --- | --- |
| Baseball Event Map | ![No Lot 100j or Lot 102](../screenshots/2453-baseball-republish/before-event.png) | ![Lot 100j and Lot 102 drawn with the other lots](../screenshots/2453-baseball-republish/after-event.png) |
| Accessible Baseball Map | ![No icons, the lots listed twice](../screenshots/2453-baseball-republish/before-accessible.png) | ![Icons back, the lots listed once, the shuttle over the lots](../screenshots/2453-baseball-republish/after-accessible.png) |
