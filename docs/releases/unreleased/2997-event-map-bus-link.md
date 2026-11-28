---
issue: 2997
app: aggiemap
title: On a phone, an event map's Bus Routes and Directions stay on that map
testOnDev: |
  | An event map's phone menu ([#2997](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2997)) | [dev.aggiemap.tamu.edu/events/tailgating/map](https://dev.aggiemap.tamu.edu/events/tailgating/map) on a phone | Open the menu and tap **Bus Routes**: the bus list opens over the tailgating map, at `/events/tailgating/map/m/bus`, not the main campus map. Choose a route and tap the back arrow: still the tailgating map. **Directions** opens the trip planner on the tailgating map too. On the main map, both work as before |
---

### On a phone, an event map's Bus Routes and Directions stay on that map

On a phone, tapping **Bus Routes** in an event map's menu, such as the tailgating map's, opened the main campus map's
bus list instead, and **Directions** opened the main map's trip planner: the visitor lost the event map they were on.
Every map's phone layout now has the same pages behind its menu, as the desktop side panel already does, and the menu
opens them on the map it is on.
([#2997](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2997))

| Before                                                                                                                           | After                                                                                                           |
| -------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| ![Bus Routes from the tailgating map's menu: the main campus map, /map/m/bus](../screenshots/2997-event-map-bus-link/before.png) | ![The same: the tailgating map, /events/tailgating/map/m/bus](../screenshots/2997-event-map-bus-link/after.png) |
