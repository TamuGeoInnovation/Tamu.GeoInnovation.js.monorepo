---
issue: 2844
title: Choosing a search result closes the drop down
testOnDev: |
  | Choosing a search result closes the drop down ([#2844](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2844)) | [dev.aggiemap.tamu.edu/map/d/trip](https://dev.aggiemap.tamu.edu/map/d/trip) | Type a building into the first box and pick it from the list: the list closes, and the second box and the route below it are visible without pressing Escape |
---

### Choosing a search result closes the drop down

Picking a result left the list open over whatever was underneath it. In the trip planner that is the other
endpoint's box and the route just calculated, so choosing a destination showed the list rather than the answer.

The options are chosen on `mousedown` - deliberately, because the input's own `blur` would otherwise hide the
list before a `click` could land on one. But `mousedown` runs before the browser moves focus, so the list closed
and the chosen option then took focus and opened it again. It now stays closed, and focusing the box again still
opens it.

This is the shared search component, so it is every search box in the application.
([#2844](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2844))

| Before |
| --- |
| ![The drop down still open over the destination box](../screenshots/2844-dropdown-stays-open/before-production-dropdown-covers-destination.jpg) |

An "after" capture needs a dev server built from the branch; it is added to the pull request before merging.
