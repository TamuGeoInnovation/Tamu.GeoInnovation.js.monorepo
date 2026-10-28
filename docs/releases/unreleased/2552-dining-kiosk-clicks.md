---
issue: 2552
title: On the dining kiosk, clicking a dining location opens its own details, not the building's
testOnDev: |
  | Clicking a dining location on the dining kiosk ([#2552](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2552)) | [The dining kiosk](https://dev.aggiemap.tamu.edu/kiosk/dining/map): zoom in on campus and click a dining icon that sits inside a building, such as one in the Memorial Student Center or Langford | The popup is the dining location's: its name, hours and whether it is open. It used to be the building's. Clicking a building where there is no dining icon still opens the building |
---

### On the dining kiosk, clicking a dining location opens its own details, not the building's

On the dining kiosk, clicking a dining location inside a building opened the building's details instead: on
production, a click on Azimuth Cafe opened Langford Architecture Center. The kiosk draws the campus buildings as a
near-invisible layer so that a building can be clicked, and that layer sat above the dining locations and took
their clicks. It now sits below them, on every load
([#2552](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2552)).

This came out of removing the `layerIndex` values that set no order on the event maps
([#2061](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2061)). Nothing else moves: on
every other affected map, the layers draw in the order they did before. The after can be seen on dev once
this is deployed there; the dining feed does not answer a locally served copy.

| Before |
| --- |
| ![A click on a dining icon opens Langford Architecture Center's details](../screenshots/2552-dining-kiosk/before-production.png) |
