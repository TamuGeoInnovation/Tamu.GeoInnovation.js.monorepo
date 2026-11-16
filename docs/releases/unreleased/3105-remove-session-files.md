---
issue: 3105
title: Admins can remove a session's slide files, including those of a speaker no longer listed
testOnDev: |
  | GIS Day admin: a session's Slides ([#3105](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3105)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). After release, as an admin: Admin, Events, a session with slides | Each file in Slides has a Remove. It asks on the page, naming the file and who uploaded it, with Remove the file and Keep it; Keep it leaves the file. Remove the file takes it off the list, and the speaker no longer sees it on their edit link |
---

### GIS Day admin: admins can remove a session's slide files

A session's slides ([#3093](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3093)) could be removed only by the speaker who uploaded them, so a file whose speaker had since been
deleted, shown as "A speaker no longer listed", stayed on the session for good. On the session's admin page each file
now has a **Remove**, which asks on the page first, naming the file and who uploaded it, and then removes the file and
its record ([#3105](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3105)).
