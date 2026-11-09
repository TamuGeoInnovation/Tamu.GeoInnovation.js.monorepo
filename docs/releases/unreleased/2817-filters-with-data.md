---
issue: 2817
title: The GIS Day submissions filters offer only the season's choices, and department or major has its own column
testOnDev: |
  | GIS Day admin: the submissions filters offer only what the season has, and Department / major is a column ([#2817](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2817)) | Not on dev: GIS Day has no dev site. After release, sign in as an admin on [txgisday.org](https://txgisday.org) and open Admin > Research Competitions | Type offers All, Presentation and Poster only (2026 has no papers or cartography). Department / major is a column; click its heading to sort by it |
---

### GIS Day admin: the submissions filters offer only the season's choices; department or major is a column

The submissions list's filters offered every choice the submission form has, so picking Paper in a season with no
papers showed nothing. Each filter now offers All and only the choices the selected season's submissions have. The
submitter's department or major, until now a grey line under their email, is a column of its own and can be sorted.
([#2817](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2817))

| Admin > Research Competitions | Before | After |
| --- | --- | --- |
| Desktop, 1440 pixels wide (local test data) | ![Every type offered, department under the email](../screenshots/2807-submission-filters-sort/after.png) | ![Only Paper and Poster offered, a Department / major column](../screenshots/2817-filters-with-data/after.png) |
