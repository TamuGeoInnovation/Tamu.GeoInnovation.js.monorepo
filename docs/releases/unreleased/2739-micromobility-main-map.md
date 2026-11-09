---
issue: 2739
title: The main map offers Micromobility as a layer, on development only
testOnDev: |
  | Micromobility on the main map ([#2739](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2739)) | [dev.aggiemap.tamu.edu/map/d/layers](https://dev.aggiemap.tamu.edu/map/d/layers) | Layers lists **Micromobility**, off. Turned on, it draws Transportation's corridor, allowed sidewalks and facilities, and the legend names them as the service does (Micromobility Facilities: Roadway, Separated Path, Shared Path, MMA Dash; Allowed Sidewalks; Micromobility Corridor). Clicking a line opens its name and type, e.g. "Restricted Sharrow, Type: Roadway". Not on production: production's Layers has no Micromobility |
---

### The main map offers Micromobility as a layer, on development only

Transportation's micromobility map, where scooters and bikes can ride on Main Campus, has been its own map on
development since [#2712](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2712). The main
map now offers the same three layers as one entry in Layers, **Micromobility**, off until a visitor turns it on. The
corridor, the allowed sidewalks and the facilities are drawn and named as Transportation's service draws and names them,
and clicking one shows its name and what kind it is.

It is on development only. The service is public on Transportation's production host, so a production build leaves the
entry out altogether, as it does Nature Rx, until the maintainer decides it is ready. The bike layers under Sustainable
Transportation are unchanged; whether both stay is a separate decision.
([#2739](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2739))

| Before                                                                                                            | After                                                                                                              |
| ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| ![The main map's Layers, without Micromobility](../screenshots/2739-micromobility-main-map/before-layer-list.png) | ![The main map's Layers, with Micromobility](../screenshots/2739-micromobility-main-map/after-layer-list.png)      |
|                                                                                                                   | ![Micromobility turned on, with its legend](../screenshots/2739-micromobility-main-map/after-micromobility-on.png) |
|                                                                                                                   | ![A micromobility line's popup](../screenshots/2739-micromobility-main-map/after-popup.png)                        |
