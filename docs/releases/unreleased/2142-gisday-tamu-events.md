---
issue: 2142
title: Texas A&M's GIS Day site lists only Texas A&M's sessions
testOnDev: |
  | GIS Day: Texas A&M's site lists only Texas A&M's sessions ([#2142](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2142)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). On production after release: [gisday.tamu.edu Sessions](https://gisday.tamu.edu/sessions) and [txgisday.org Sessions](https://txgisday.org/sessions) | Today every session belongs to Texas A&M, so both pages list the same sessions as before. The Organizations filter on gisday.tamu.edu offers only Texas A&M. Once another school's session is entered, it appears on txgisday.org and not on gisday.tamu.edu |
---

### GIS Day: Texas A&M's site lists only Texas A&M's sessions

gisday.tamu.edu shares txgisday.org's database, where any participating school's GIS Day sessions can be entered.
Its Sessions page now lists only the sessions held by Texas A&M University GIS Day(s), the organization a session
belongs to through its location. Its Organizations filter offers only Texas A&M. txgisday.org still lists every
school's sessions. Today every session in the database is Texas A&M's, so nothing disappears; this keeps it that
way when another school adds its own
([#2142](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2142)).

Photographed locally, with one test session added at Texas State's place:

| | Before | After |
| --- | --- | --- |
| gisday.tamu.edu, the first day | ![Texas State's test session is listed](../screenshots/2142-gisday-tamu-events/before-tamu-sessions.png) | ![Only Texas A&M's sessions](../screenshots/2142-gisday-tamu-events/after-tamu-sessions.png) |
| txgisday.org, the first day | ![Texas State's test session is listed](../screenshots/2142-gisday-tamu-events/before-txgisday-sessions.png) | ![Still listed](../screenshots/2142-gisday-tamu-events/after-txgisday-sessions.png) |
