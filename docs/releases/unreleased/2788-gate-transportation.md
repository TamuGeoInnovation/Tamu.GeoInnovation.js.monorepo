---
issue: 2788
title: The Transportation section of All Maps stays on development until its maps are ready
testOnDev: |
  | Transportation section gated ([#2788](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2788)) | [dev.aggiemap.tamu.edu/all-maps](https://dev.aggiemap.tamu.edu/all-maps), then the same with [?as=production](https://dev.aggiemap.tamu.edu/all-maps?as=production) | On dev the Transportation tile is there and opens its page. As production, the tile is gone, and [/all-maps/transportation?as=production](https://dev.aggiemap.tamu.edu/all-maps/transportation?as=production) goes back to All Maps |
---

### AggieMap: the Transportation section of All Maps stays on development until its maps are ready

All Maps' **Transportation** section lists Micromobility, Bus Routes and Sustainable Transportation, all three still on
development only. A production build would still have shown its tile and opened its page, which read "No event maps
are available right now". The tile and the page are now development-only too: on production the tile is not shown, and
its address goes back to All Maps. The maintainer moves the section to production when its maps go.
([#2788](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2788))

| Before, as production would show it: the tile, and an empty page | After, as production: no tile |
| --- | --- |
| ![Before](../screenshots/2788-gate-transportation/before-transportation-as-production.png) | ![After](../screenshots/2788-gate-transportation/after-all-maps-as-production.png) |
