---
issue: 1756
app: gisday
title: "GIS Day admin: the date and time picker opens on screen on a phone"
testOnDev: |
  | GIS Day admin: the date and time picker on a phone ([#1756](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1756)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). After release, as an admin on a phone, open Admin > Events, edit an event, and press its **Event start time** | The time field opens just below the start time, wholly on screen, and can be used. On a desktop it opens where it always has |
---

### GIS Day admin: the date and time picker opens on screen on a phone

On a phone, the date and time picker used across GIS Day's admin forms (an event's start and end times, a season's days,
the research competition's scoring dates) opened its field off the left edge of the screen, where only a sliver of it
showed and it could not be used. It now opens just below the time, or above it if there is no room below, moved sideways
as far as it takes to stay on screen. Wherever it already fitted, as on a desktop, it opens where it always has
([#1756](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1756)).

The same picker sets the time in AggieMap's trip planner, which gets the same fix.

| | Before | After |
| --- | --- | --- |
| An event's start time, at 390 | ![The start time's field off the left edge of the screen, only a sliver showing](../screenshots/1756-picker-on-screen/before-event-start-time-390.png) | ![The start time's field just below it, wholly on screen, with its list of times above](../screenshots/1756-picker-on-screen/after-event-start-time-390.png) |
| The same, at 1280 | ![The start time's field and its list of times, opened over its heading](../screenshots/1756-picker-on-screen/before-event-start-time-1280.png) | ![The same, in the same place as before](../screenshots/1756-picker-on-screen/after-event-start-time-1280.png) |

GIS Day has no dev site, so this was checked on the local site, signed in as the txgisday-dev test admin. No form was
saved.
