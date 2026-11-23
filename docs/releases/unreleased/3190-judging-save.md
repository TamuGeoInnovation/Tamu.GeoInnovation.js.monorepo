---
issue: 3190
title: "GIS Day: a judge's scores and a rubric's changes save"
testOnDev: |
  | GIS Day: judging saves ([#3190](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3190)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). After release, on [gisday.tamu.edu](https://gisday.tamu.edu), open a judging link, score an entry and press Save; then edit a rubric under Admin → Research Competitions → Rubrics and save it | Both save: "Saved, N of 100 points." on the judging page, and the rubric keeps the change after a reload. Before, both failed, the judge's with "Your scores were not saved. Please try again." |
---

### GIS Day: a judge's scores and a rubric's changes save

On the first night of judging, a judge's **Save** failed with "Your scores were not saved. Please try again.", and so did saving an edited rubric ([#3190](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3190)). The site and its API are at different addresses, so the browser sends only the kinds of request the API says it accepts from the site. The two saves were the only requests of their kind, and they were not on that list, so the browser stopped them before they were sent. They are on it now, and a check fails if a request the API serves is ever left off it again.
