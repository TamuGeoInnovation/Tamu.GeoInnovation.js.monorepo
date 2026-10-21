---
issue: 2051
title: A notice acknowledged last season shows again for the new one
testOnDev: |
  | An event notice acknowledged in an earlier season shows again ([#2051](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2051)) | [dev.aggiemap.tamu.edu/map](https://dev.aggiemap.tamu.edu/map), from 7 November | In a browser where "Don't show again" was chosen on the Football notice before this release, the notice appears once more; choosing it again keeps it hidden for the rest of the 2026 season. Before 7 November no Football notice is due, so there is nothing to see |
---

### A notice acknowledged last season shows again for the new one

"Don't show again" on an event notice is remembered by the notice's id. Baseball's id had "2026"
typed into it so the notice would come back each spring, which only worked while somebody remembered
to change it every year; nobody had for 2027, so anyone who acknowledged it this year would never have
seen it again. Football, Tailgating, Ring Day and the other notices had no season in their id at all,
so acknowledging one hid it for good. Each notice's id now carries its season, the year of the map's
earliest event date, so giving a map its new season's dates is all it takes. One consequence: a
visitor who acknowledged Football or Tailgating earlier this season sees that notice once more.
([#2051](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2051))

| Before | After |
| --- | --- |
| ![Production on 10 November 2026 for a visitor who acknowledged Football's notice earlier: only the Tailgating notice shows](../screenshots/2051-toast-id-season/before-production-football-notice-stays-hidden.png) | ![A local production build on the same date for the same visitor: the Football notice shows again](../screenshots/2051-toast-id-season/after-local-build-football-notice-shown-again.png) |
