---
issue: 1828
app: aggiemap
title: On dev, View as production no longer covers the notice panel's arrows
testOnDev: |
  | View as production clears the notices ([#1828](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1828)) | The [main map](https://dev.aggiemap.tamu.edu/map) on a day with two or more notices, such as a football game day | While the notice panel shows, **View as production** sits just above it, and the panel's **1 of 2** arrows can be clicked. When the panel closes, the control moves back down. Production does not show the control, so nothing there changes |
---

### On dev, View as production no longer covers the notice panel's arrows

On a development host, the **View as production** control and the notice panel were both fixed at the bottom centre of
the map, with the control drawn on top. With two or more notices, it covered the panel's **1 of 2** arrows, so the later
notices could only be reached by waiting for the panel's timer. While the panel shows, the control now stands just above
it, and moves back down when the panel closes. Production does not show the control, so visitors see no change.
([#1828](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1828))

| Before, on dev                                                                                                                              | After                                                                                                                                                       |
| ------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ![View as production drawn over the notice panel's arrows](../screenshots/1828-acting-as-production-clears-notices/before-1828-desktop.png) | ![View as production above the notice panel, its arrows and 1 of 3 showing](../screenshots/1828-acting-as-production-clears-notices/after-1828-desktop.png) |
| ![The same on a phone: the control over the arrows](../screenshots/1828-acting-as-production-clears-notices/before-1828-phone.png)          | ![The same on a phone: the control above the panel](../screenshots/1828-acting-as-production-clears-notices/after-1828-phone.png)                           |

The "after" images are a development build of this change run locally, on the same game day.
