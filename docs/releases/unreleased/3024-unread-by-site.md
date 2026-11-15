---
issue: 3024
title: "GIS Day admin: the RSVPs and Check-ins dashboards count unreadable accounts only for the site's own sessions"
testOnDev: |
  | GIS Day admin: the dashboards' unread count by site ([#3024](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3024)) | Not on dev: GIS Day has no dev site. After release, as an admin open [Dashboards > RSVPs on gisday.tamu.edu](https://gisday.tamu.edu/admin/dashboards/rsvps), then Check-ins | The note under each table ("N accounts could not be read") is no larger than the RSVPs or check-ins shown, and covers only Texas A&M's sessions; on txgisday.org every organization's |
---

### GIS Day admin: the dashboards count unreadable accounts only for the site's own sessions

On gisday.tamu.edu the RSVPs and Check-ins dashboards listed only Texas A&M's sessions, but the note under each table
counted the accounts that could not be read across every organization's sessions, so it came out larger than the
records shown ("3197 RSVPs for 60 events. 3924 accounts could not be read"). The site's sessions are now chosen by the
API, so the events, the chart and that count all cover the same records, and another organization's counts no longer
leave the server.
([#3024](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3024))
