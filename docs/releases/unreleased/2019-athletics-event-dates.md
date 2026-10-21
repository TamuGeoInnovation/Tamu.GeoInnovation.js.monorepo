---
issue: 2019
title: The athletics maps carry their 2026-27 home dates
testOnDev: |
  | Athletics maps have their 2026-27 home dates ([#2019](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2019)) | [dev.aggiemap.tamu.edu/events/womens-basketball](https://dev.aggiemap.tamu.edu/events/womens-basketball) and [dev.aggiemap.tamu.edu/events/baseball-parking](https://dev.aggiemap.tamu.edu/events/baseball-parking) | No "This event has passed" dialog on either map (both showed it before) |
---

### The athletics maps carry their 2026-27 home dates

Women's Basketball and Baseball still had last season's dates, so both told visitors "This event has
passed" weeks before their seasons started. Every athletics map whose sport has published its 2026-27
schedule on 12thman.com now has that season's home dates: Women's Basketball (18), Baseball (34),
Tennis (12), Softball (16) and Swimming (5). Four Men's Basketball home games were recorded a day late
and are corrected (12 and 26 January, 2 and 23 February). Women's Basketball also carried `2026-01-1`,
a date missing a digit; a unit test now rejects any event date not written as `YYYY-MM-DD`.

The dates were read with `tools/event-dates/check.mjs`, which reports every one of these maps as
matching the published schedule afterwards. Track (no 2026-27 schedule published yet), the Maroon &
White game, and the three maps whose schedule address no longer answers (Soccer, Volleyball, Cross
Country) are unchanged.
([#2019](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2019))

| Before | After |
| --- | --- |
| ![Women's Basketball on dev saying "This event has passed"](../screenshots/2019-athletics-event-dates/before-dev-womens-basketball-event-passed.png) | ![Women's Basketball on a local production build with no warning](../screenshots/2019-athletics-event-dates/after-local-build-womens-basketball-no-warning.png) |
