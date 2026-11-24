---
issue: 3091
title: "A new speaker photo shows at once, instead of the old one"
testOnDev: |
  | A new speaker photo shows at once ([#3091](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3091)) | Not on dev: GIS Day has no dev site. After release, send yourself a profile link, upload a new photo through it, approve it, and open Presenters in the same browser without clearing anything | The new photo shows on Presenters, the admin speaker page and the next edit review's "Now", with no reload |
---

### A new speaker photo shows at once, instead of the old one

A speaker who sent a new photo through their profile link, once an admin approved it, kept seeing the old one: on
Presenters, on the admin's speaker page, and as "Now" in the next edit review. The photo had been saved, but under the
same address as the old one, and the site tells browsers to keep an uploaded image for a year, so a browser that had seen
the old photo never fetched the new one. Every new speaker photo now gets an address of its own, whether it comes through
a profile link or the admin page, so it shows as soon as it is saved. A photo approved before this keeps its address:
send the speaker a new link, or upload it again from the admin page, to give it a new one.
([#3091](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3091))
