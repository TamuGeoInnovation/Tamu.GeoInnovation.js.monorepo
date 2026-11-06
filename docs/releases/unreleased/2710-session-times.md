---
issue: 2710
title: GIS Day session times are Central wherever the visitor is
testOnDev: |
  | GIS Day: session times are Central for every visitor ([#2710](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2710)) | Not on dev: GIS Day has no dev site. After release, [txgisday.org/sessions](https://txgisday.org/sessions), [gisday.tamu.edu/sessions](https://gisday.tamu.edu/sessions) and [gisday.ucgis.org/sessions](https://gisday.ucgis.org/sessions), on a computer set to Pacific or Eastern time | Each session shows the same time as on a computer set to Central (9:00 AM, not 7:00 AM or 10:00 AM), and a session's own page shows its real date. Check-in is unchanged |
---

### GIS Day: session times are Central wherever the visitor is

The Sessions page says all its times are in Central time, but it showed each session in the visitor's own time zone.
Further west it was also a day early on a session's own page: in Pacific time, a session at 9:00 AM on Thursday 19
November read 7:00 AM, on 18 November. The Sessions page, a session's page and a speaker's page now show every
session's day and times in Central time, for every visitor. Check-in already read them this way, and the pages now
use the same reading.
([#2710](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2710))

| Pacific time | Before | After |
| --- | --- | --- |
| Sessions page | ![The session reads 7:00 AM](../screenshots/2710-gisday-session-times/before-sessions-los_angeles.png) | ![The session reads 9:00 AM](../screenshots/2710-gisday-session-times/after-sessions-los_angeles.png) |
| A session's page | ![Nov 18, 2026, 7:00 AM](../screenshots/2710-gisday-session-times/before-session-page-los_angeles.png) | ![Nov 19, 2026, 9:00 AM](../screenshots/2710-gisday-session-times/after-session-page-los_angeles.png) |
