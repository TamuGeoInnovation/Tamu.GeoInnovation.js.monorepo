---
issue: 2707
title: A click on a map that is still drawing opens its popup
testOnDev: |
  | A click on a building opens its popup while the map is still drawing ([#2707](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2707)) | [dev.aggiemap.tamu.edu/map/d](https://dev.aggiemap.tamu.edu/map/d) | In a private window, click a building as soon as the loading overlay goes: its popup opens, where before nothing happened for the first ten seconds or so. A click on bare ground still opens nothing |
---

### A click on a map that is still drawing opens its popup

A click on a building in the first seconds after a map opened did nothing: the popup came only from
what the map had already drawn, and the buildings were not drawn under the point yet. On dev, 0 of 20
clicks opened a popup once the map had settled into place, about six seconds in, when the page looks
completely ready; it was only reliable at sixteen. The click was thrown away, not slowed. When nothing
under a click has a popup, the map now asks the layers still drawing what is there, as the trip planner
already did when setting a stop.
([#2707](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2707))

There is no before image: the fault is a click that does nothing, so the measurement in the issue
stands in for one.
