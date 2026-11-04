---
issue: 2638
title: Each GIS Day sponsor's logo can be drawn small, regular, large or extra large
testOnDev: |
  | GIS Day: a sponsor's logo size ([#2638](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2638)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). On production after release: signed in as an admin, [Admin, then Sponsors](https://txgisday.org/admin/sponsors), then [the Sponsors page](https://txgisday.org/sponsors) | A sponsor's form has a Logo size select, Regular for every sponsor until it is changed. Set one sponsor to Extra large and save: on the Sponsors page its logo is about twice as wide as its neighbours', and every other logo is as it was |
---

### GIS Day: each sponsor's logo can be drawn small, regular, large or extra large

Every logo on the Sponsors page was fitted into the same 250 × 60 px box, whatever its shape, so a logo with
small text, like the Bush School's seal and two lines beside it, read as tiny next to its neighbours and nothing
could make it bigger. A sponsor's form now has a **Logo size**: Small, Regular, Large or Extra large. Regular is
the box before and stays the size of every existing sponsor until someone changes it; Large and Extra large draw
the logo 1.5 and 2 times as large (375 × 90 and 500 × 120 px), and no logo is ever wider than a phone's screen
([#2638](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2638)).

The size is a new column on the sponsors table, added by the migration `AddSponsorLogoSize`. It only adds, so it
is run on both production databases before the new API is rolled out, and the API already running keeps working
once it has.

| Before | After |
| --- | --- |
| ![Both LiDAR logos in the same small box](../screenshots/2638-sponsor-logo-size/before-public-sponsors.png) | ![One Raster sponsor drawn extra large beside four at regular; each logo's box outlined, because the local copy has no logo files](../screenshots/2638-sponsor-logo-size/after-public-sponsors.png) |
| | ![The sponsor form's Logo size select](../screenshots/2638-sponsor-logo-size/after-admin-sponsor-form.png) |

