---
issue: 3048
app: gisday
title: "GIS Day: a broadcast belongs to an organization, so each site lists only its own Zooms"
testOnDev: |
  | GIS Day: a broadcast belongs to an organization ([#3048](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3048)) | Not on dev: GIS Day has no dev site. After release (the migration, the API, the site, then the data script), as an admin open [Admin > Broadcasts](https://gisday.tamu.edu/admin/broadcasts) on gisday.tamu.edu | Texas A&M's four Zooms, and any broadcast with no organization yet, with an **Organization** column; TTU 1-3, Main UT, Main Texas DSHS and the others are gone until **Show every organization's broadcasts** is ticked. Open a broadcast: **Select organization** is its first field, set, and saving one without it is refused. An event's **Broadcast** drop-down lists the same Zooms, plus the event's own whoever's it is. On [txgisday.org's Admin > Broadcasts](https://txgisday.org/admin/broadcasts) every organization's broadcast is listed, with no switch |
---

### GIS Day: a broadcast belongs to an organization, so each site lists only its own Zooms

gisday.tamu.edu shares txgisday.org's database, and its Admin > Broadcasts and every event's Broadcast drop-down listed
every organization's Zooms in the season: TTU 1-3, Main UT, Main Texas DSHS, SWIGGIS and ATX GIS Day beside Texas A&M's
four, so another university's Zoom could be picked for a Texas A&M session by mistake. A broadcast now has an
organization (a place), set first on its admin page as a venue's is, and required when it is saved.

- **Admin > Broadcasts** on gisday.tamu.edu lists its own organization's broadcasts, and any with no organization yet so
  an admin can find and set it, with an **Organization** column and a **Show every organization's broadcasts** switch,
  as Admin > Events does for sessions.
- **An event's Broadcast drop-down** lists the same, plus the broadcast the event already has, whoever's it is, so
  opening an event never drops its broadcast.
- txgisday.org and gisday.ucgis.org, which list every organization's sessions, still list every broadcast.

([#3048](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3048))

| gisday.tamu.edu, 1280 pixels wide | Before | After |
| --- | --- | --- |
| Admin > Broadcasts | ![Every organization's broadcasts: TTU 1-3, Main UT, Main Texas DSHS, SWIGGIS and ATX beside Texas A&M's](../screenshots/3048-broadcast-organization/before-broadcasts-list.png) | ![Texas A&M's Zooms and those with no organization yet, with an Organization column and a switch; TTU 1 and Main UT, given their organizations, are gone](../screenshots/3048-broadcast-organization/after-broadcasts-list.png) |
| The switch ticked | | ![Every organization's broadcasts again, each with its organization](../screenshots/3048-broadcast-organization/after-broadcasts-list-every-organization.png) |
| A broadcast's admin page (TTU 1) | ![No organization field](../screenshots/3048-broadcast-organization/before-broadcast-page.png) | ![Select organization first, set to Texas Tech University GIS Day](../screenshots/3048-broadcast-organization/after-broadcast-page.png) |
| An event's Broadcast drop-down | ![Every organization's broadcasts](../screenshots/3048-broadcast-organization/before-event-broadcast-dropdown.png) | ![Texas A&M's Zooms and those with no organization yet; TTU 1 and Main UT are not offered](../screenshots/3048-broadcast-organization/after-event-broadcast-dropdown.png) |

**In this order, on both sites:** the production migration `migrate-prod-3048.ps1` (kubernetes-config, `6. GIS Day/migrations`)
adds the empty, nullable column `event_broadcast.placeGuid` (`AddBroadcastPlace1794772810966`); then the API and the site;
**then** `set-broadcast-places.ps1` (`6. GIS Day/data`), dry run first, which gives each existing broadcast the
organization of the sessions that use it. It lists, and leaves alone, a broadcast whose sessions are at more than one
organization and one no session uses, for the maintainer to set on its admin page. Until a broadcast has an organization
it is listed on every site, as now. The data script needs the migration, and stops without it.
