---
issue: 3015
app: gisday
title: "GIS Day: The presentation competition rules say final slides are due by the file deadline, or the finalist is removed"
testOnDev: |
  | GIS Day: slides upload rule ([#3015](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3015)) | Not on dev: GIS Day has no dev site. After release, open [Presentation](https://gisday.tamu.edu/competitions/presentation), Competition Rules | A bold rule: finalists must upload their final presentation slides through the site by Mon, Nov 16, 2026, 12:00 PM Central (the season's presentation file deadline in Admin, Research Competitions), or they will be removed from the competition. Change that deadline and the date on the page follows |
---

### GIS Day: The presentation competition rules say final slides are due by the file deadline, or the finalist is removed

The presentation competition's rules didn't say that finalists must upload their final slides, so a finalist reading
the page couldn't tell that missing the upload costs them their place. The rules now say so, in bold, with the date
taken from the season's own presentation file deadline, the one the site enforces.
([#3015](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3015))

| Before (production, 15 November) | After (the local site, whose season has no file deadline set, so the rule names the deadline without a date) |
| --- | --- |
| ![Competition Rules before, with nothing about uploading final slides](../screenshots/3015-slides-upload-rule/before-rules.png) | ![Competition Rules after, with the bold rule that final slides must be uploaded by the final presentation submission deadline or the finalist is removed](../screenshots/3015-slides-upload-rule/after-rules.png) |
