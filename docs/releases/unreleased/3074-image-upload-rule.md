---
issue: 3074
title: Every GIS Day image picker refuses what the server would, as soon as a file is chosen
testOnDev: |
  | GIS Day admin and the presenter's edit page: image pickers ([#3074](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3074)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). After release, as an admin: Admin, Organizations, Places, Speakers and Sponsors, each one's edit form; and a presenter's edit link | Choosing an SVG, or an image over 5 MB, says "The logo (or photo) must be a JPEG or PNG image." or "... must be 5 MB or smaller." at once, and the form keeps the image it had. A JPEG or PNG is taken and previewed as before |
---

### GIS Day: every image picker refuses what the server would, as soon as a file is chosen

The sponsor form's logo picker already refused a file the server would refuse as soon as it was chosen, in the server's
words (#3009). The organization, place and speaker forms and a presenter's own edit page each had their own copy of
the allowed types, or none, so an SVG was taken, previewed, and only refused on save. Every picker now uses one shared
rule: JPEG or PNG, up to 5 MB, refused at once with the same message
([#3074](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3074)).
