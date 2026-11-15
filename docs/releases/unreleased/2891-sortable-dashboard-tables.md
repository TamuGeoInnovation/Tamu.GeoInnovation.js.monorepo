---
issue: 2891
title: "GIS Day admin: sort the RSVP dashboard's table by any column"
testOnDev: |
  | GIS Day admin: sort the RSVP table ([#2891](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2891)) | Not on dev: GIS Day has no dev site. After release, sign in as an admin and open [Dashboards > RSVPs on gisday.tamu.edu](https://gisday.tamu.edu/admin/dashboards/rsvps) | Clicking a heading sorts the table by it and again reverses it, with an arrow on that heading; a count sorts highest first, Event A to Z, When earliest first; the All events row stays at the bottom; an opened event's people stay under its row |
---

### GIS Day admin: sort the RSVP dashboard's table by any column

On the RSVP dashboard, a click on any heading of the **By event** table sorts the table by it, and a second click
reverses it; an arrow on the heading shows which. Counts sort highest first, **Event** A to Z, and the event's start,
now in its own **When** column, earliest first, which brings back the date order. The **All events** row stays at the
bottom, and an opened event's people stay under its row.
([#2891](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2891))

The table and its list of people are now shared pieces, which the coming dashboards for user accounts, check-ins and
VGI submissions will use.

| Before | After, sorted by Industry |
| --- | --- |
| ![The RSVP table, in date order, with no way to sort it](../screenshots/dashboard-table-sort/table-before.png) | ![The RSVP table sorted by Industry, highest first, with the arrow on that heading](../screenshots/dashboard-table-sort/table-sorted-industry-after.png) |

![An event opened under its row, sorted, with names, emails and employers masked here](../screenshots/dashboard-table-sort/table-opened-after.png)
