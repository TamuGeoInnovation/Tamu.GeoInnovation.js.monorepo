---
issue: 3279
title: Dev's basemap settings no longer ask visitors to sign in
testOnDev: |
  | The basemap settings open without a sign-in prompt ([#3279](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3279)) | [dev.aggiemap.tamu.edu/map/d/settings](https://dev.aggiemap.tamu.edu/map/d/settings) | No "Please sign in to access the item" dialog when the page opens; the gallery lists Aggieland and the dated raster basemaps, with no "Aggieland vector, September 2026". Production never offered it, so nothing changes there |
---

### Dev's basemap settings no longer ask visitors to sign in

Opening the map's settings on dev raised a portal sign-in dialog over the basemap gallery, because the gallery still
offered the September 2026 campus basemap, and its service has since been retired and secured. That basemap was kept
only to compare with October's, a comparison settled when October's became the default. It is gone from the gallery,
and the dialog with it. Anyone who had chosen it gets the campus basemap instead. Production never offered it.
([#3279](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3279))

| | Before | After |
| --- | --- | --- |
| The settings page on dev | ![A portal sign-in dialog over the basemap gallery](../screenshots/3279-september-cache/before-local-settings.png) | ![The basemap gallery, with no dialog and no September entry](../screenshots/3279-september-cache/after-local-settings.png) |
