---
issue: 3321
app: gisday
title: "GIS Day: the Paper competition's page gives this season's dates, not 2020's"
testOnDev: |
  | GIS Day: the Paper competition's dates ([#3321](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3321)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). After release, on production: Competitions, Papers | The deadline is the season's paper deadline, finalists hear on the date set in Admin, Research Competitions, Competition settings (no line when none is set), and the awards session is named with its day, time and room. No 2020 date is left |
---

### GIS Day: the Paper competition's page gives this season's dates, not 2020's

The Paper competition's page still gave 2020's dates, times and rooms: a submission deadline of November 9, 2020, finalists
told on November 16, 2020, and an awards session on "Wednesday, November 18". It now reads them from the season, as the
Posters and Presentation pages do: the season's paper deadline in Central time, the finalists date from the Paper
competition's settings (the line left out when there is none), and the awards session named with its day, time and room,
or "to be announced"
([#3321](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3321)).

| | Before | After |
| --- | --- | --- |
| The dates, at 1280 | ![Before: 2020's deadline, finalists date, session and awards](../screenshots/3321-papers-dates/before-papers-1280.png) | ![After: the season's deadline, finalists date and awards session](../screenshots/3321-papers-dates/after-papers-1280.png) |
| With no finalists date set | | ![After: the finalists line left out](../screenshots/3321-papers-dates/after-no-finalists-papers-1280.png) |
| At 390 | ![Before on a phone](../screenshots/3321-papers-dates/before-papers-390.png) | ![After on a phone](../screenshots/3321-papers-dates/after-papers-390.png) |

GIS Day has no dev site, so this was checked on the local site, signed out, with made-up season settings: a paper deadline,
a Paper competition finalists date and a made-up `AWARDS:` session.
