---
issue: 3468
title: The phone's trip planner no longer offers accessible routing on production
testOnDev: |
  | Accessible routing stays development-only on a phone ([#3468](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3468)) | AggieMap dev at phone width, `/map/m/trip`, then the same with `?as=production` | On dev, five buttons: walk, bike, car, bus and the accessible icon. As production, four: no accessible icon. On desktop, `/map/d/trip` shows Options on dev only, as before |
---

### The phone's trip planner no longer offers accessible routing on production

Accessible routing is development-only, because the campus routing network does not yet route accessible trips
([#2801](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2801)). The desktop trip planner
hid it, but the phone's travel-mode buttons are a separate template and still offered the accessible icon on
aggiemap.tamu.edu. Both now read one setting, so the phone shows the four travel modes and nothing it cannot deliver.
([#3468](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3468))

| Before                                                                                                                                                        | After                                                                                                              |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| ![The phone trip planner's mode buttons: walk, bike, car, bus and an accessible icon](../screenshots/3468-phone-accessible-routing/before-phone-trip-390.png) | ![The same buttons with no accessible icon](../screenshots/3468-phone-accessible-routing/after-phone-trip-390.png) |
