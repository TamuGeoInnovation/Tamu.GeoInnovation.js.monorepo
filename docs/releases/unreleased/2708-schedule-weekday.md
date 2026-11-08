---
issue: 2708
title: GIS Day's Sessions page names each day's weekday
testOnDev: |
  | GIS Day: each day on the Sessions page shows its weekday ([#2708](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2708)) | Not on dev: GIS Day has no dev site. After release, [txgisday.org/sessions](https://txgisday.org/sessions), [gisday.tamu.edu/sessions](https://gisday.tamu.edu/sessions) and [gisday.ucgis.org/sessions](https://gisday.ucgis.org/sessions) | Each day reads like "Thursday, November 19", Monday 16 to Friday 20. The same dates on a computer set to Pacific time |
---

### GIS Day: the Sessions page names each day's weekday

Each day on the Sessions page is now headed with its weekday, "Thursday, November 19" rather than "November 19", on
all three GIS Day sites.

The headings are now also in Central time, as the page's times already were. A day arrives from the server as
midnight Central, which is still the evening before further west, so a visitor in Pacific time saw every day a day
early: 15 to 19 November for a week that runs 16 to 20 November.
([#2708](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2708))

| | Before | After |
| --- | --- | --- |
| Central time | ![The day heading reads November 19](../screenshots/2708-gisday-schedule-weekday/before-chicago.png) | ![The day heading reads Thursday, November 19](../screenshots/2708-gisday-schedule-weekday/after-chicago.png) |
| Pacific time | ![The same day reads November 18](../screenshots/2708-gisday-schedule-weekday/before-los_angeles.png) | ![The same day reads Thursday, November 19](../screenshots/2708-gisday-schedule-weekday/after-los_angeles.png) |
