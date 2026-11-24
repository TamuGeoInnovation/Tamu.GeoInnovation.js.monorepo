---
issue: 3314
app: gisday
title: "GIS Day admin: the Check-ins dashboard charts check-ins by the hour across GIS Day week"
testOnDev: |
  | GIS Day admin: check-ins by hour ([#3314](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3314)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). After release, as an admin open Admin > Dashboards > Check-ins for 2026 | Under **Check-ins over time**, a second chart, **Check-ins by hour**, runs from midnight on the first day of the season's events to the end of the last, in Central time. Hovering an hour gives its check-ins; opening an event below adds its own line |
---

### GIS Day admin: the Check-ins dashboard charts check-ins by the hour across GIS Day week

Check-ins happen only during GIS Day week, so the Check-ins dashboard's chart by day shows a few steps and little else.
Under it, a second chart now counts check-ins in **each hour of the days the season's events run**, in Central time, so
the busy sessions of each day stand out. Opening an event in the table adds that event's own line, as on the chart by
day. The chart by day, and its comparison with earlier years, are unchanged
([#3314](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3314)).

Like the rest of the dashboard, it counts only the events the site lists. Check-ins made on any other day are left out.

| | Before | After |
| --- | --- | --- |
| The charts, at 1280 | ![Check-ins over time: a running total by day, and nothing by the hour](../screenshots/3314-check-ins-by-hour/before-check-ins-charts.png) | ![Check-ins over time, then the start of the new Check-ins by hour heading](../screenshots/3314-check-ins-by-hour/after-check-ins-charts.png) |
| Check-ins by hour, at 1280 | | ![Check-ins by hour across 16 to 20 November, peaking each day around midday](../screenshots/3314-check-ins-by-hour/after-check-ins-by-hour.png) |
| With an event opened | | ![The same chart with the opened event's own line beside All events](../screenshots/3314-check-ins-by-hour/after-check-ins-by-hour-event.png) |
| At 390 | | ![Check-ins by hour on a phone, the page no wider than the screen](../screenshots/3314-check-ins-by-hour/after-check-ins-by-hour-phone.png) |

GIS Day has no dev site, so this was checked on the local site, signed in as the txgisday-dev test admin, with made-up
check-ins spread across the week.
