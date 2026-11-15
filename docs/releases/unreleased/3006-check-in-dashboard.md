---
issue: 3006
title: "GIS Day admin: a Check-ins dashboard, each event's check-ins by person type beside its RSVPs"
testOnDev: |
  | GIS Day admin: the check-in dashboard ([#3006](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3006)) | Not on dev: GIS Day has no dev site. After release, sign in as an admin and open [Dashboards > Check-ins on txgisday.org](https://txgisday.org/admin/dashboards/check-ins), then open an event and export its CSV | Each event's check-ins counted by person type, with an **RSVPs** column beside them and a total row that matches the summary line; a chart of check-ins by day; an opened event lists who checked in and when, and its CSV has one row per person. In a window 1280 px wide, every column, Export as CSV and the times are in view, on this page and on RSVPs; in a narrower one the table scrolls sideways in its own box, never the page. On [gisday.tamu.edu](https://gisday.tamu.edu/admin/dashboards/check-ins) only Texas A&M's sessions are listed. If it says the check-ins could not be read, the admin role is missing the `read:checkins` permission |
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

The two dashboards' shared table now fits beside the admin menu on a 1280 px screen: before, its last columns were cut
off with no way to scroll to them, which on RSVPs hid most of **Not given**. On a narrower screen the table scrolls
sideways in its own box.
([#3006](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3006))

Captured on a local copy of the site with made-up people, served as gisday.tamu.edu, for the 2025 season. Names and
emails are masked.

| Before | After |
| --- | --- |
| ![The Dashboards menu: RSVPs, User accounts and Speaker badges](../screenshots/3006-check-in-dashboard/before-dashboards-menu.png) | ![The Dashboards menu with Check-ins under RSVPs](../screenshots/3006-check-in-dashboard/after-dashboards-menu.png) |

| After |
| --- |
| ![The Check-ins dashboard: 1591 check-ins at 60 events, and check-ins over GIS Day week as a running total by day](../screenshots/3006-check-in-dashboard/after-check-ins.png) |
| ![By event: each event's check-ins, with its RSVPs beside them, counted by person type](../screenshots/3006-check-in-dashboard/after-check-ins-table.png) |
| ![One event opened: who checked in, under their type's heading, with an Export as CSV link](../screenshots/3006-check-in-dashboard/after-check-ins-event-opened.png) |
