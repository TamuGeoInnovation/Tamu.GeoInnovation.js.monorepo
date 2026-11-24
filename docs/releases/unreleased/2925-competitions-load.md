---
issue: 2925
title: "GIS Day: the Research Competitions admin page loads faster"
testOnDev: |
  | GIS Day: Research Competitions loads faster ([#2925](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2925)) | Not on dev: GIS Day has no dev site. After release, open [Research Competitions on gisday.tamu.edu](https://gisday.tamu.edu/admin/research-competition) signed in as an admin | The list appears in a second or two rather than after a long white wait, and every row still shows who submitted it, with their email and department |
---

### GIS Day: the Research Competitions admin page loads faster

The **Research Competitions** admin page looked up each submitter's account in Auth0 one at a time, in turn: about fifty
requests for this season's 55 submissions, which was most of its load time. It now reads them all in one search, as the
admin dashboards do, and keeps them for a few minutes.
([#2925](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2925))
