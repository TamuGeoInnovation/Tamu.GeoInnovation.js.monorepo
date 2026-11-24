---
issue: 3215
app: gisday
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

| Before | After |
| --- | --- |
| ![The RSVPs dashboard for 2026: one line, the running total of a made-up season's RSVPs, on dates from Oct 19 to the GIS Day week of Nov 16](../screenshots/3215-compare-seasons/before-rsvps.png) | ![The RSVPs dashboard for 2026 with a row of year buttons, 2026 and 2025 pressed and 2024 greyed out, and two lines with a legend, 2026 in maroon and 2025 in orange, on an axis counting days from the Monday of GIS Day week, from −42 to +7, with the shaded GIS Day week labelled and 2025's line held at its total to the end of its week](../screenshots/3215-compare-seasons/after-rsvps.png) |
| | ![The same chart hovered two weeks before GIS Day week: 2025's tooltip, 22 RSVPs on Mon, Nov 3, 2025, and 2026's, 10 RSVPs on Mon, Nov 2, 2026, above −14 days](../screenshots/3215-compare-seasons/after-rsvps-hover.png) |
| | ![The same chart with 2025 switched off: one line again, on dates from Oct 19 to the GIS Day week of Nov 16, as before](../screenshots/3215-compare-seasons/after-rsvps-one-year.png) |
| | ![The Check-ins dashboard for 2026 with the same year buttons, and 2026's and 2025's check-ins during each GIS Day week, on an axis from 0 to +7 with a tick at the start of each day, 2025's line held at its total to the end of its week](../screenshots/3215-compare-seasons/after-check-ins.png) |
| | ![The RSVPs dashboard on a phone, 390 pixels wide: the year buttons in one row above the two years' lines and their legend, the axis in two-week steps counted from day 0 (−42, −28, −14, 0), nothing past the right edge](../screenshots/3215-compare-seasons/after-rsvps-phone.png) |
