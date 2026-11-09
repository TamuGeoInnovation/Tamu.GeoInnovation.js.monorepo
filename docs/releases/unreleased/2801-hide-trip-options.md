---
issue: 2801
title: The trip planner's Options stay on development, since accessible routing is not supported yet
testOnDev: |
  | Trip planner Options gated ([#2801](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2801)) | [dev.aggiemap.tamu.edu/map/d/trip](https://dev.aggiemap.tamu.edu/map/d/trip), then [/map/d/trip/options?as=production](https://dev.aggiemap.tamu.edu/map/d/trip/options?as=production) | On dev the Options link is under the travel modes and opens Accessible Friendly Directions. As production, the Options address goes back to the trip planner, which shows its maintenance notice |
---

### AggieMap: the trip planner's Options stay on development, since accessible routing is not supported yet

The trip planner's **Options** offers one thing, Accessible Friendly Directions, and the routing network does not
support accessible routing yet. Options and its page are now development-only.

On production today the whole trip planner is replaced by a notice that routing is unavailable, so the Options link
was never shown there. What did reach production was its page, by its address, `/map/d/trip/options`. It now goes back
to the trip planner. The link is gated as well, so it stays off production when directions are turned on there.
([#2801](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2801))

| Before, as production would show it: the Options page by its address | After: the address goes back to the trip planner |
| --- | --- |
| ![Before](../screenshots/2801-hide-trip-options/before-options-address-as-production.png) | ![After](../screenshots/2801-hide-trip-options/after-options-address-as-production.png) |
