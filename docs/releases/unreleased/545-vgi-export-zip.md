---
issue: 545
app: gisday
title: "GIS Day admin: download the VGI competition's submissions and photos as one zip"
testOnDev: |
  | GIS Day admin: the VGI export ([#545](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/545)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). After release, as an admin: Admin, VGI Competition, Submissions, then **Download all as a zip** | A zip downloads holding `submissions.csv`, a row per submission with its location, status and answers, and a `medias` folder with each submission's photos. A season with no submissions says so instead |
---

### GIS Day admin: download the VGI competition's submissions and photos as one zip

The VGI competition's data goes back to the project's partners, and there was no way to get it out: an export had
been built in the API (#650), but it ran in a background queue that needs a Redis server the site does not have, so it
would never have finished, and no page offered it. The admin Submissions page now has **Download all as a zip**: one
zip of `submissions.csv`, a row per submission with who sent it, when, where, its review status, its photos' paths and
each of its answers, and a `medias` folder with every submission's photos. It is built while the page waits, as the
research competition's files are
([#545](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/545)).
