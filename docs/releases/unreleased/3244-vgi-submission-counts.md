---
issue: 3244
title: Counts by category on the VGI Submissions page
testOnDev: |
  | GIS Day: VGI submission counts ([#3244](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3244)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). After release, as an admin: Admin, VGI Competition, Submissions | Above the list, "Submissions by category" has a row per category and a Total, with Submissions, Verified, Needs a look and Discarded. Pressing Needs a look or Top finishers changes the list but not the counts |
---

### GIS Day: Counts by category on the VGI Submissions page

The VGI competition's Submissions page now shows how many submissions there are in each category, and in all
([#3244](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3244)). A table above the list has
a row per category (the form's category question, as the list shows it) and a Total row, each with how many were made,
verified, need a look or were discarded. It counts every submission of the season, so the totals stay the same whichever
of All, Needs a look and Top finishers is pressed. There is no download; the counts are on the page only.
