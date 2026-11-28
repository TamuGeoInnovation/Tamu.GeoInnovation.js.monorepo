---
issue: 3889
app: gisday
title: The High School Portal's header is drawn in full
testOnDev: |
  | The High School Portal ([#3889](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3889)) | `/highschool` on the development GIS Day site | The header has its logo and the Organizations, Sponsor and Login/Signup menus, as on every other page, and the tab reads "High School \| TxGIS Day" |
---

### The High School Portal's header is drawn in full

The High School Portal drew the site's header without its logo and menus, because the page failed while setting its
title. It now sets the title the way every other page does, and the header is complete.
([#3889](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3889))

| Before                                                                                    | After                                                                               |
| ----------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| ![The portal with no logo and no menus](../screenshots/3889-highschool-header/before.png) | ![The portal with its full header](../screenshots/3889-highschool-header/after.png) |
