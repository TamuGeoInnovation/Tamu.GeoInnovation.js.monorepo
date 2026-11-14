---
issue: 2930
title: "GIS Day: search box text centred, in the site's font"
testOnDev: |
  | GIS Day: search box text ([#2930](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2930)) | Not on dev: GIS Day has no dev site. After release, open [Presenters searched for Texas A&M Forest Service](https://gisday.tamu.edu/presenters?search=Texas%20A%26M%20Forest%20Service) | The typed text is in the same font as the rest of the page and level with Copy link and the x; an empty box shows its placeholder on the same line |
---

### GIS Day: search box text centred, in the site's font

Text typed into a search box was in the browser's own font, not the site's, and in the Presenters search it sat
higher than the **Copy link** and **x** beside it. It is now in the site's font and centred in the box. The fix is in
the shared text box, so every box built on it takes the page's font.
([#2930](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2930))

| Before | After |
| --- | --- |
| ![Typed text high in the box, in Arial](../screenshots/search-box-text/box-before.png) | ![Typed text centred, in Open Sans](../screenshots/search-box-text/box-after.png) |

![The empty box, its placeholder on the text's line](../screenshots/search-box-text/empty-after.png)
