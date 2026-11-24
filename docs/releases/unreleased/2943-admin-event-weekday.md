---
issue: 2943
app: gisday
title: "GIS Day: the admin Events list heads each day with its day of the week"
testOnDev: |
  | GIS Day: weekday on admin Events headings ([#2943](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2943)) | Not on dev: GIS Day has no dev site. After release, open [Events](https://txgisday.org/admin/events) | Each day reads as on the public Sessions page, for example "Monday, November 16", not "November 16" |
---

### GIS Day: the admin Events list heads each day with its day of the week

The admin **Events** list headed each day "November 16" while the public **Sessions** page heads the same day "Monday,
November 16". The admin list now uses the same format, in Central time, so an organizer can tell the days apart at a
glance and the two pages read alike.
([#2943](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2943))

| Before | After |
| --- | --- |
| ![A day headed November 16](../screenshots/admin-event-weekday/before.png) | ![The same day headed Monday, November 16](../screenshots/admin-event-weekday/after.png) |
