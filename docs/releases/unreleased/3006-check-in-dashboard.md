---
issue: 3006
title: "GIS Day admin: a Check-ins dashboard, each event's check-ins by person type beside its RSVPs"
testOnDev: |
  | GIS Day admin: the check-in dashboard ([#3006](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3006)) | Not on dev: GIS Day has no dev site. After release, sign in as an admin and open [Dashboards > Check-ins on txgisday.org](https://txgisday.org/admin/dashboards/check-ins), then open an event and export its CSV | Each event's check-ins counted by person type, with an **RSVPs** column beside them and a total row that matches the summary line; a chart of check-ins by day; an opened event lists who checked in and when, and its CSV has one row per person. On [gisday.tamu.edu](https://gisday.tamu.edu/admin/dashboards/check-ins) only Texas A&M's sessions are listed. If it says the check-ins could not be read, the admin role is missing the `read:checkins` permission |
---

### GIS Day admin: a Check-ins dashboard

Admins had no page showing who checked in at an event. **Dashboards > Check-ins** now shows, for the selected season:

- **Check-ins over time**: the running total at the end of each day, in Central time, with each day's check-ins
  beneath. Opening an event adds its own line.
- **By event**: each event, in the order they happen, with its number of check-ins split by person type, and **how
  many RSVP'd beside them**, so turnout can be compared. A total row sums both.
- **An event, opened**: who checked in, under their type's heading, with the time each checked in, and an **Export as
  CSV** of the same.

It is the RSVPs dashboard's page over check-ins: the same table, people list, chart and export. Names and emails are
read only when an event is opened, and only by an admin with the `read:checkins` permission. On gisday.tamu.edu it
lists only Texas A&M's sessions, as the other admin lists do.
([#3006](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3006))
