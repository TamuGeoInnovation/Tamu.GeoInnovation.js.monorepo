---
issue: 2474
title: VGI scoring counts only submissions made inside the competition's window, which admins set in the Designer
testOnDev: |
  | GIS Day: the VGI competition's scoring window ([#2474](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2474)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). On production after release, once the `AddCompetitionScoringWindow` migration has run, as a GIS Day admin: [Admin, Competitions, Designer](https://txgisday.org/admin/competitions/designer), then [Leaderboard](https://txgisday.org/admin/competitions/leaderboard) | Under Allow Submissions, "Submissions count from" and "Submissions stop counting at", each with the moment in Central time below it. Set 14 November 2026, 12:00 AM and 20 November 2026, 11:00 AM, and save; reloading the page shows them again. Until 14 November nothing on the leaderboard scores |
---

### GIS Day: VGI scoring counts only submissions made inside the competition's window

The 2026 VGI competition runs from Saturday 14 November, and submissions count until 11:00 AM Central on Friday
20 November, when winners are announced at lunch
([#2460](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2460)). Scoring counted every
submission of the season, whenever it was made.

Each competition season now has two settings, set in **Admin, Competitions, Designer** beside Allow Submissions:
when submissions start counting, and when they stop. A submission made outside that window scores nothing on the
leaderboard and does not count as already found for anyone else's. It is still saved, reviewed and, once
publishing is set up, sent to ArcGIS Online, so its data is kept. Each moment is shown in Central time, whatever the
admin's computer is set to, and **Clear** leaves that side without a limit, which is what every earlier season has.

**After release:** run the `AddCompetitionScoringWindow` migration (two new columns on `vgi_seasons`) before the new
API starts, then set the 2026 window in the Designer.
([#2474](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2474))

| Before | After |
| --- | --- |
| ![The Designer, with only Allow Submissions](../screenshots/2474-vgi-scoring-window/before-designer.jpg) | ![The Designer, with the 2026 window set and shown in Central time](../screenshots/2474-vgi-scoring-window/after-designer.jpg) |
