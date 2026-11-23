---
issue: 2924
title: "GIS Day: Research Competitions shows a loader while it loads, rather than a blank page"
testOnDev: |
  | GIS Day: a loader on Research Competitions ([#2924](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2924)) | Not on dev: GIS Day has no dev site. After release, open [Research Competitions on gisday.tamu.edu](https://gisday.tamu.edu/admin/research-competition) signed in as an admin, then open a submission | While the list, or a submission, is loading, the site's spinning loader shows where it will appear, instead of an empty white area; it goes once the list or submission is there |
---

### GIS Day: Research Competitions shows a loader while it loads, rather than a blank page

The admin **Research Competitions** list, and a submission opened from it, showed an empty white area until their data
arrived, which looked as if the page had broken. They now show the site's loader, the one the Presenters page already
uses, until it does.
([#2924](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2924))

| Before | After |
| --- | --- |
| ![The list empty while it loads](../screenshots/competitions-loading/loading-before.png) | ![The loader while it loads](../screenshots/competitions-loading/loading-after.png) |
