---
issue: 1474
title: GIS Day's buttons and links can be reached and used from the keyboard
testOnDev: |
  | GIS Day: using the site from the keyboard ([#1474](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1474)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). On production after release: [txgisday.org](https://txgisday.org), [the FAQ](https://txgisday.org/faq) and, signed in as an admin, [Admin, then Events](https://txgisday.org/admin/events) | With Tab alone you can reach Login, each FAQ question, the Sessions filters and an admin list's Copy, Delete, Show and Hide, and Enter or Space works each one. Every page looks as it did |
---

### GIS Day: buttons and links can be reached and used from the keyboard

Many of GIS Day's controls could be clicked with a mouse but not reached with the Tab key or worked with Enter
or Space: Login and Logout in the header, the FAQ's questions, the Sessions filters, the admin lists' Copy,
Delete, Show and Hide, and others. They now can, and each says what it is to a screen reader. Photos that carry
meaning have descriptions; purely decorative images are marked as such. The checks that catch these problems,
turned off during the Angular 22 upgrade, are back on for every GIS Day project, so new ones fail the build.
Nothing looks different
([#1474](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1474)).
