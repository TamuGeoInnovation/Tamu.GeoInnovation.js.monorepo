---
issue: 2723
app: aggiemap
title: A stop set by clicking a Nature Rx space is named after it
testOnDev: |
  | A stop set by a map click ([#2723](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2723)) | [dev.aggiemap.tamu.edu/map/d/trip](https://dev.aggiemap.tamu.edu/map/d/trip) | Turn **Nature Rx** on from Layers and click a space's marker, such as Eli Whitely Park: the stop reads **Eli Whitely Park**, not `30.6146, -96.3493`. Click a building: the stop is still the building's name. Click open ground: the stop is still its coordinates |
---

### A stop set by clicking a Nature Rx space is named after it

In the trip planner, clicking a Nature Rx marker set a stop named by its coordinates, such as `30.6146, -96.3493`, rather
than by the space: the route was right, but the stop did not say where it went. The trip planner asked only the buildings
what a click landed on. It now asks every layer on the map that opens a popup, so a stop is named after the feature
clicked, a building is still the building, and open ground is still its coordinates.
([#2723](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2723))

| Before                                                                                                                     | After                                                                                                 |
| -------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| ![Eli Whitely Park's marker clicked: the stop reads 30.6146, -96.3493](../screenshots/2723-stop-named-by-place/before.png) | ![The same click: the stop reads Eli Whitely Park](../screenshots/2723-stop-named-by-place/after.png) |
