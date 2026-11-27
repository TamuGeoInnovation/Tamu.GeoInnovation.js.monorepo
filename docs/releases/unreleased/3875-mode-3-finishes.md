---
issue: 3875
app: aggiemap
title: A trip link for driving with a parking pass finishes
testOnDev: |
  | A drive with a parking pass by link ([#3875](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3875)) | [dev.aggiemap.tamu.edu/map/d/trip?stops=30.6150,-96.3500@30.6150,-96.3300&mode=3](https://dev.aggiemap.tamu.edu/map/d/trip?stops=30.6150,-96.3500@30.6150,-96.3300&mode=3) | The trip finishes within a few seconds as a drive, with its minutes, miles and directions, instead of "Calculating route. Please wait..." for good |
---

### A trip link for driving with a parking pass finishes

A link to a trip in the trip planner's "drive with a parking pass" mode never finished: the panel said "Calculating
route. Please wait..." for good, on production too. The planner looked for the nearest lot the visitor's permit allows
when no permit had been chosen, found none, and stopped. It now looks for a lot only when there is a permit, and plans
the drive as it is otherwise.
([#3875](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3875))

| Before                                                                                                          | After                                                                                        |
| --------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| ![The mode 3 link: Calculating route. Please wait..., for good](../screenshots/3875-mode-3-finishes/before.png) | ![The same link: a 7 minute, 2.17 mile drive](../screenshots/3875-mode-3-finishes/after.png) |
