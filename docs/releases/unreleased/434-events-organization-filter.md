---
issue: 434
app: gisday
title: "GIS Day admin: show one organization's sessions on the Events list"
testOnDev: |
  | GIS Day admin: the Events list's Organization choice ([#434](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/434)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). After release, check on production as an admin: Admin, Events, then choose an organization in **Organization** | Only that organization's sessions are listed, by their venues, and **Every organization** lists them all again |
---

### GIS Day admin: show one organization's sessions on the Events list

Several GIS Days share the site, and the admin Events list showed every organization's sessions together. It now has an
**Organization** choice above the list, offering each organization whose venues hold the season's sessions, by name, after
**Every organization**. Choosing one lists only its sessions
([#434](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/434)).

| | Before | After |
| --- | --- | --- |
| The Events list, at 1280 | ![Before: the list with no Organization choice](../screenshots/434-events-organization-filter/before-events.png) | ![After: the Organization choice, on Every organization](../screenshots/434-events-organization-filter/after-events.png) |
| One organization chosen | | ![After: only the made-up North GIS Day's two sessions](../screenshots/434-events-organization-filter/after-events-north.png) |
| At 390 | | ![After on a phone: the choice under the search](../screenshots/434-events-organization-filter/after-events-390.png) |

GIS Day has no dev site, so this was checked on the local site, signed in as the txgisday-dev test admin, with made-up
sessions at two made-up organizations, the list searched for "Made-up" so only they show.
