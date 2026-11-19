---
issue: 3215
title: "GIS Day: The dashboards' charts compare seasons, lined up on GIS Day week"
testOnDev: |
  | GIS Day: compare seasons on the dashboards' charts ([#3215](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3215)) | Not on dev: GIS Day has no dev site. On production, Admin → Dashboards → RSVPs, Check-ins, VGI submissions and User accounts | Each chart opens with the selected season and the year before it, in two colours with a legend, and the axis counts days from the Monday of GIS Day week ("−14", "0", "+3"); a row of year buttons above the chart adds or removes each year; hovering gives each year's total with its own date; a year with no records, or with no GIS Day week days set, has its button greyed out, saying why |
---

### GIS Day: The dashboards' charts compare seasons, lined up on GIS Day week

The four dashboards' charts (RSVPs, Check-ins, VGI submissions and User accounts) showed one season at a time, so
comparing this year's build-up with last year's meant switching seasons and remembering the numbers. Each chart now has
a row of year buttons, and opens with the selected season and the year before it drawn together. The years are lined up
on GIS Day week rather than on the calendar: each year's line is moved so the Monday of its own GIS Day week falls on
the same day, and the axis counts days before and after it, so "two weeks before GIS Day week" is the same point for
every year. An earlier year's line runs from its first record to the end of its GIS Day week. Hovering gives each
year's total that day with its own date. A year whose records could not be read, that has none, or that has no GIS Day
week days set has its button greyed out, saying why. With only the selected season shown, the chart is as it was.
([#3215](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3215))
