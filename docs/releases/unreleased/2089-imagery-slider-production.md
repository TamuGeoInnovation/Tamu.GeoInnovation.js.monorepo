---
issue: 2089
title: The Aerial Imagery date slider is on production
testOnDev: |
  | Aerial Imagery date slider on production ([#2089](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2089)) | Already on dev, which is the point: [dev.aggiemap.tamu.edu/map/d/settings](https://dev.aggiemap.tamu.edu/map/d/settings), choose **Aerial Imagery**. What to check is production after the release: [aggiemap.tamu.edu/map/d/settings](https://aggiemap.tamu.edu/map/d/settings), same basemap | A bar across the bottom of the map reading **Aerial imagery**, with a date and arrows, and a slider from 2016 to Latest. Dragging it back redraws campus as it was then |
---

### The Aerial Imagery date slider is on production

Choosing the Aerial Imagery basemap now offers the capture date as well, on every environment rather
than only on dev: a slider from 2016 to the latest capture, so campus can be seen as it was while a
building was going up or a lot was being resurfaced ([#2089](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2089)).

The control has existed since [#1541](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1541) and has been development-only the whole time, held back
by a question about whether an older capture is billed differently from the current one. That was
settled on 22 October; nothing about the control itself changed.

| Before: production, Aerial Imagery with no date control | After: the date slider, bottom of the map |
| --- | --- |
| ![Production's Aerial Imagery basemap, with no way to choose a capture date](../screenshots/2089-imagery-slider-production/before-production-no-date-control.png) | ![The same basemap with a date slider reading Oct 5, 2026 (latest), running from 2016 to Latest](../screenshots/2089-imagery-slider-production/after-date-control-offered.png) |

The "after" is dev, which is where the control can be photographed today. **Two things in it are not
coming to production**: the four dated Aggieland basemaps in the panel, and the "View as production"
button. Both are development-only in their own right. The slider across the bottom is the change.
