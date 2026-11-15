---
issue: 3026
title: "GIS Day admin: the Research Competitions table reads whole at 1280 px"
testOnDev: |
  | GIS Day admin: the submissions table fits ([#3026](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3026)) | Not on dev: GIS Day has no dev site. After release, as an admin open [Research Competitions](https://txgisday.org/admin/research-competition) in a window 1280 px and then 1024 px wide | No Files column beside Final file; Final file, Status, Type, Format and Classification read whole ("Pending Review", "Presentation", "Undergraduate"), never broken mid-word; each row's checkbox and the Name column are in view at the left, the checkbox clear of the title beside it; the table scrolls sideways in its own box to Final file and Status, and the page itself never scrolls sideways; the sorted column shows its arrow |
---

### GIS Day admin: the Research Competitions table reads whole at 1280 px

With the Final file column (#3017), the submissions table was cramped at 1280 px: Files and Final file ran together,
short values broke mid-word ("Mis/sin/g", "Acce/pted"), and each row's checkbox covered the first letter of its title.
The Files count is gone, since Final file now says what mattered and the review page lists the files. Every column keeps
a width its values fit in, so Status, Type, Format, Classification and Final file read whole, and the checkbox has the
room it needs. Where the columns do not all fit beside the admin menu, as at 1280 and 1024 px, the table scrolls
sideways in its own box, as the dashboards' table does, rather than cutting columns off.
([#3026](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3026))

| Research Competitions, sorted by Status, local test submissions (other rows greyed out) | Before | After |
| --- | --- | --- |
| 1280 pixels wide | ![Short values broken mid-word, the checkbox over each title](../screenshots/3026-submissions-table-fit/before-1280.png) | ![No Files column; the checkbox, Name and every value through Classification in view and whole, the table scrolling in its own box to Final file and Status](../screenshots/3026-submissions-table-fit/after-1280.png) |
| 1024 pixels wide | ![Short values broken over up to eight lines](../screenshots/3026-submissions-table-fit/before-1024.png) | ![The checkbox and Name in view at the left, values whole, the table scrolling in its own box to Format and the columns after it](../screenshots/3026-submissions-table-fit/after-1024.png) |
