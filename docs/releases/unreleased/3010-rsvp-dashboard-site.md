---
issue: 3010
app: gisday
title: "GIS Day admin: the RSVPs dashboard on gisday.tamu.edu counts only Texas A&M's sessions"
testOnDev: |
  | GIS Day admin: the RSVPs dashboard lists the site's own sessions ([#3010](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3010)) | Not on dev: GIS Day has no dev site. After release, as an admin open [Dashboards > RSVPs on gisday.tamu.edu](https://gisday.tamu.edu/admin/dashboards/rsvps), then the same on [txgisday.org](https://txgisday.org/admin/dashboards/rsvps) | gisday.tamu.edu lists only Texas A&M's sessions (and any with no place yet), and its totals and chart count only those; txgisday.org still lists every organization's |
---

### GIS Day admin: the RSVPs dashboard on gisday.tamu.edu counts only Texas A&M's sessions

gisday.tamu.edu shares txgisday.org's database. Since [#2986](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2986) its admin lists start with Texas A&M's sessions, but the
RSVPs dashboard listed and counted every organization's. It now lists, totals and charts only the site's own, as the
new Check-ins dashboard does. txgisday.org is unchanged.
([#3010](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3010))

Captured on a local copy of the site served as gisday.tamu.edu, for the 2025 season.

| Before | After |
| --- | --- |
| ![RSVPs for 114 events: every organization's](../screenshots/3006-check-in-dashboard/before-rsvps-tamu-site.png) | ![RSVPs for 60 events: Texas A&M's, and those with no place yet](../screenshots/3006-check-in-dashboard/after-rsvps-tamu-site.png) |
| ![ATX GIS Day's Map Gallery listed among Texas A&M's sessions](../screenshots/3006-check-in-dashboard/before-rsvps-tamu-site-table.png) | ![Only Texas A&M's sessions listed](../screenshots/3006-check-in-dashboard/after-rsvps-tamu-site-table.png) |
