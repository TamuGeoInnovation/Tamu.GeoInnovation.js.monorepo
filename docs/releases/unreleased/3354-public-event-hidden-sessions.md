---
issue: 3354
app: gisday
title: "GIS Day: a session hidden from the schedule is not shown to the public by its link"
testOnDev: |
  | GIS Day: hidden sessions by direct link ([#3354](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3354)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). After release, on production: an admin copies the link to a session hidden from the schedule, then opens it in a private window, signed out | Signed out, the session's name, time and abstract are not shown. Signed in as an admin, the same link shows the session as before |
---

### GIS Day: a session hidden from the schedule is not shown to the public by its link

A session hidden from the public schedule could still be opened by anyone who had its link, signed in or not, and its
name, time, place and abstract read. The API now answers "not found" for a hidden session unless the person asking may
manage sessions, so the public sees nothing of it, and admins see it as before
([#3354](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3354)).

| | Before | After |
| --- | --- | --- |
| A hidden session's link, signed out | ![Before: the made-up hidden session's page, its name and abstract shown to a visitor](../screenshots/3354-public-event-hidden-sessions/before-signed-out.png) | ![After: nothing of the session is shown](../screenshots/3354-public-event-hidden-sessions/after-signed-out.png) |
| The same link, signed in as an admin | ![Before: the session's page](../screenshots/3354-public-event-hidden-sessions/before-signed-in.png) | ![After: the session's page, unchanged](../screenshots/3354-public-event-hidden-sessions/after-signed-in.png) |

Signed out, the page now shows nothing between the header and the footer rather than saying the session was not found.
GIS Day has no dev site, so this was checked on the local site with a made-up hidden session, signed out and signed in as
the txgisday-dev test admin.
