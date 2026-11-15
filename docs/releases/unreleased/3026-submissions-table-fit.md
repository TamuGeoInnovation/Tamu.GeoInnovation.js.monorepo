---
issue: 3026
title: "GIS Day admin: the Research Competitions table reads whole at 1280 px"
testOnDev: |
  | GIS Day admin: the submissions table fits ([#3026](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3026)) | Not on dev: GIS Day has no dev site. After release, as an admin open [Research Competitions](https://txgisday.org/admin/research-competition) in a window 1280 px and then 1024 px wide | No Files column beside Final file; Final file, Status, Type and Format read whole ("Missing", "Accepted"), never broken mid-word; the sorted column shows its arrow; each row's checkbox sits clear of the title beside it |
---

### GIS Day admin: the Research Competitions table reads whole at 1280 px

With the Final file column (#3017), the submissions table was cramped at 1280 px: Files and Final file ran together,
short values broke mid-word ("Mis/sin/g", "Acce/pted"), and each row's checkbox covered the first letter of its title.
The Files count is gone, since Final file now says what mattered and the review page lists the files. Final file, Status,
Type and Format keep a width they fit in and read whole, and the checkbox has the room it needs.
([#3026](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3026))
