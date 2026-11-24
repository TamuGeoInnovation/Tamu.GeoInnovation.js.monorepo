---
issue: 3032
app: gisday
title: "GIS Day admin: a broadcast's page lists the sessions that use it"
testOnDev: |
  | GIS Day admin: a broadcast's sessions ([#3032](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3032)) | Not on dev: GIS Day has no dev site. After release, as an admin open [Broadcasts](https://txgisday.org/admin/broadcasts) and a broadcast used by some sessions, then one used by none | Under the broadcast's fields, **Sessions using this broadcast**: the count, then each session's day, time and name in date and time order, each name opening the session's admin page; "No sessions use this broadcast." for an unused one. On gisday.tamu.edu, only Texas A&M's sessions |
---

### GIS Day admin: a broadcast's page lists the sessions that use it

To check which sessions a Zoom is attached to, an admin had to open each session. A broadcast's admin page now lists,
under its fields, the sessions that use it: each one's day, time and name, in date and time order, linked to the
session's admin page, with a count, or "No sessions use this broadcast." Sessions hidden from the public schedule are
included, so only admins who can edit broadcasts can see the list. On gisday.tamu.edu it shows only Texas A&M's sessions.
([#3032](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3032))

| Before | After |
| --- | --- |
| ![A broadcast used by three sessions: its admin page shows only its fields](../screenshots/3032-broadcast-sessions/before-broadcast-with-sessions.png) | ![The same broadcast: under its fields, Sessions using this broadcast, "3 sessions use this broadcast." and each session's day, time and linked name](../screenshots/3032-broadcast-sessions/after-broadcast-with-sessions.png) |
| ![A broadcast no session uses: its admin page shows only its fields](../screenshots/3032-broadcast-sessions/before-broadcast-without-sessions.png) | ![The same broadcast: under its fields, Sessions using this broadcast, "No sessions use this broadcast."](../screenshots/3032-broadcast-sessions/after-broadcast-without-sessions.png) |
