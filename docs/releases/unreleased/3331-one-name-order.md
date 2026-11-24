---
issue: 3331
app: gisday
title: "GIS Day: names with numbers in them sort as numbers, on every list"
testOnDev: |
  | GIS Day: one name order ([#3331](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3331)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). After release, on production: Presenters, and in Admin the email composer's recipients and the judging results | Where two names differ by a number, the smaller number comes first ("Team 2" before "Team 10"), on screen and in emails alike. Other names keep their order |
---

### GIS Day: names with numbers in them sort as numbers, on every list

About ten lists sorted names, each in its own way, so a list could sort one way on screen and another in an email. They now
share one order. Where it shows: a number in a name now sorts as a number on the Presenters page, in the email composer's
recipients, in a judge's entries, in the judging results and in the season's winners, so "Team 2" comes before "Team 10",
where "Team 10" came first. Names without numbers keep their order
([#3331](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3331)).

| | Before | After |
| --- | --- | --- |
| Presenters, at 1280 | ![Before: Team 10 Zmadeup listed before Team 2 Zmadeup](../screenshots/3331-one-name-order/before-presenters.png) | ![After: Team 2 Zmadeup before Team 10 Zmadeup](../screenshots/3331-one-name-order/after-presenters.png) |

GIS Day has no dev site, so this was checked on the local site, signed out, with two made-up presenters whose names differ
only by that number.
