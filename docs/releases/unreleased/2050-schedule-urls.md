---
issue: 2050
title: The Tennis map carries the women's home matches too
testOnDev: |
  | Tennis has the women's home matches ([#2050](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2050)) | [dev.aggiemap.tamu.edu/events/tennis-parking](https://dev.aggiemap.tamu.edu/events/tennis-parking) | Nothing to see before January: the map opens without a "This event has passed" warning. The new dates show on [All Maps](https://dev.aggiemap.tamu.edu/all-maps) under *Upcoming Events* only in the week before a match, from 17 January 2027 |
---

### The Tennis map carries the women's home matches too

The Tennis map's dates came from the men's schedule alone, so the women's seven home matches of the
2026-27 season were missing: 17 and 29 January, 5 and 7 March, and 4, 16 and 18 April 2027. They are
now on the map, and *Upcoming Events* on All Maps shows Tennis before each of them. The tool that
checks the athletics maps' dates against 12thman.com now reads both tennis schedules, and reads
Soccer, Volleyball and Cross Country again, whose schedule addresses had moved.
([#2050](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2050))

| Before | After |
| --- | --- |
| ![All Maps on 4 March 2027 with the 2026-27 dates of #2019: Tennis next on 11 March](../screenshots/2050-schedule-urls/before-pr2049-build-all-maps-tennis-next-11-march.png) | ![All Maps on 4 March 2027 with this change: Tennis next on 5 March, a women's match](../screenshots/2050-schedule-urls/after-local-build-all-maps-tennis-next-5-march.png) |
