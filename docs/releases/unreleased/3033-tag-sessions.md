---
issue: 3033
title: "GIS Day admin: a tag's page lists the sessions that have it"
testOnDev: |
  | GIS Day admin: a tag's sessions ([#3033](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3033)) | Not on dev: GIS Day has no dev site. After release, as an admin open [Tags](https://txgisday.org/admin/tags) and a tag some sessions have, then one none has | Under the tag's fields, **Sessions with this tag**: the count, then each session's day, time and name in date and time order, each name opening the session's admin page; "No sessions have this tag." for an unused one. On gisday.tamu.edu, only Texas A&M's sessions |
---

### GIS Day admin: a tag's page lists the sessions that have it

So tags can be reviewed in one place, a tag's admin page now lists, under its fields, the sessions that have it: each
one's day, time and name, in date and time order, linked to the session's admin page, with a count, or "No sessions have
this tag." It is the same list a broadcast's page shows ([#3032](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3032)), with sessions hidden from the public
schedule included for admins who can edit tags. On gisday.tamu.edu it shows only Texas A&M's sessions.
([#3033](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3033))

| Before | After |
| --- | --- |
| ![A tag four sessions have: its admin page shows only its name](../screenshots/3033-tag-sessions/before-tag-with-sessions.png) | ![The same tag: under its name, Sessions with this tag, "4 sessions have this tag." and each session's day, time and linked name](../screenshots/3033-tag-sessions/after-tag-with-sessions.png) |
| ![A tag no session has: its admin page shows only its name](../screenshots/3033-tag-sessions/before-tag-without-sessions.png) | ![The same tag: under its name, Sessions with this tag, "No sessions have this tag."](../screenshots/3033-tag-sessions/after-tag-without-sessions.png) |
