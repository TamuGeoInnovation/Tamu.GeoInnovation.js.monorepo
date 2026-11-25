---
issue: 2758
title: Every map's side panel offers the same tabs, Bus Routes included
testOnDev: |
  | Side panel tabs on event and parking maps ([#2758](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2758)) | [Football Tailgating](https://dev.aggiemap.tamu.edu/events/tailgating/map) and [the main map](https://dev.aggiemap.tamu.edu/map), on a desktop | The tailgating map's side panel has the same five tabs as the main map's: Features, Directions, Bus Routes, Experiments and Settings. Bus Routes opens the bus list on the tailgating map. A satellite campus map, such as [Galveston](https://dev.aggiemap.tamu.edu/campus/galveston/map), still shows only Features. With **View as production**, Experiments goes from both |
---

### Every map's side panel offers the same tabs

The event and parking maps had a side panel of their own, maintained apart from the main map's, and the Bus Routes
and Experiments tabs were only ever added to the main map's. So **Bus Routes was missing from every event and parking
map**, on production as well as dev, and Experiments was missing on dev
([#2758](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2758)).

There is now one side panel for every map, and its tabs are declared once, so a tab added to it reaches every map
that has one. A satellite campus map still shows only Features, as its definition asks.

|                                                    | Before                                                                                                           | After                                                                                                     |
| -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Football Tailgating                                | ![Three tabs: Features, Directions and Settings](../screenshots/2758-one-sidebar/before-event-map.png)           | ![Five tabs, as on the main map](../screenshots/2758-one-sidebar/after-event-map.png)                     |
| The main map                                       | ![Five tabs](../screenshots/2758-one-sidebar/before-main-map.png)                                                | ![The same five tabs](../screenshots/2758-one-sidebar/after-main-map.png)                                 |
| Bus Routes on Football Tailgating, route 01 chosen | ![The route list, with nothing drawn on the map](../screenshots/2758-one-sidebar/before-event-map-bus-drawn.png) | ![The route drawn, with its sixteen stops](../screenshots/2758-one-sidebar/after-event-map-bus-drawn.png) |

Choosing a route there draws it. The bus service was the application's, bound to the application's map, so an event
map's Bus Routes tab listed the routes and drew nothing when one was chosen; each event map has its own now, as it
already did for its layers and its trip planner.

The event maps' trip planner Options page is also now development-only, as the main map's has been since
[#2801](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2801): it was the same drift.

| Issue                                                                                    | What                                                                                                                           |
| ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| [#2758](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2758) | One side panel for the main map and every event and parking map, and an event map's Bus Routes tab draws the route it is given |
