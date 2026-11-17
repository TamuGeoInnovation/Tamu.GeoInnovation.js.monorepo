---
issue: 3200
title: "GIS Day: a judge's page shows each competition collapsed, to open one at a time"
testOnDev: |
  | GIS Day: a judge's competitions collapsed ([#3200](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3200)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). After release, open a judge's judging link (`/judging/<link>`) on [gisday.tamu.edu](https://gisday.tamu.edu), for a judge in both the undergraduate and the graduate competition | Each competition shows only its name and how many entries the judge has scored, closed. Tapping one opens its entries and rubrics; tapping it again closes it. A score typed into one, then closed and reopened, is still there |
---

### GIS Day: a judge's page shows each competition collapsed, to open one at a time

A judge's page listed every competition they judge, undergraduate and graduate, with every entry and rubric open, so a
judge scoring one had to scroll past the other. Each competition is now a section that starts **closed**, showing its
name and how many entries the judge has scored; tapping its heading opens it, and tapping again closes it
([#3200](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3200)). Closing one keeps anything
typed into it.

| | |
| --- | --- |
| Before: a made-up judge's page, both competitions open, every entry and criterion one after another | ![The Judging page: the graduate presentation competition, 1 of 2 scored, its two entries with seven criteria each, then the undergraduate competition and its two entries](../screenshots/3200-collapse-competitions/before-judge-page.png) |
| After: the same page as it opens, each competition closed to its name and scored count | ![The Judging page: Graduate presentation competition, 1 of 2 scored, and Undergraduate presentation competition, 0 of 2 scored, both closed](../screenshots/3200-collapse-competitions/after-collapsed.png) |
| After: the graduate competition opened by its heading, the undergraduate one still closed | ![The graduate presentation competition open with its two entries, and the undergraduate competition closed below it](../screenshots/3200-collapse-competitions/after-one-open.png) |
| After: as it opens at 390 px, a phone's width | ![The Judging page at phone width, both competitions closed](../screenshots/3200-collapse-competitions/after-collapsed-phone.png) |
