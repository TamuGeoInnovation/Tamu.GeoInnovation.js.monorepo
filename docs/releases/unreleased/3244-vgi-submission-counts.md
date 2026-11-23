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

| Before | After |
| --- | --- |
| ![The VGI Competition Submissions page at 1280 pixels: the All, Needs a look and Top finishers buttons, then the list of 17 made-up submissions, with no counts](../screenshots/3244-vgi-submission-counts/before-submissions.png) | ![The same page with Submissions by category above the list: Made-up Bench 7 (4 verified, 2 needs a look, 1 discarded), Made-up Sign 4 (1, 1, 2), Made-up Tree 5 (2, 3, 0), No category 1 (0, 1, 0), and Total 17 (7, 7, 3)](../screenshots/3244-vgi-submission-counts/after-submissions.png) |
| | ![The same page with Needs a look pressed: the table unchanged, and the list down to the 7 submissions that need a look](../screenshots/3244-vgi-submission-counts/after-submissions-needs-a-look.png) |
| ![The page on a phone, 390 pixels wide, with no counts](../screenshots/3244-vgi-submission-counts/before-submissions-phone.png) | ![The same on a phone: the table's Discarded column cut off at the right edge, the page 429 pixels wide on a 390 pixel screen](../screenshots/3244-vgi-submission-counts/after-submissions-phone.png) |
