---
issue: 2878
title: "GIS Day admin: a Dashboards section, starting with RSVPs per event by person type, over time"
testOnDev: |
  | GIS Day admin: the RSVP dashboard ([#2878](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2878)) | Not on dev: GIS Day has no dev site. After release, sign in as an admin and open [Dashboards > RSVPs on gisday.tamu.edu](https://gisday.tamu.edu/admin/dashboards/rsvps), then open an event and export its CSV | Each event's RSVPs, counted by person type, with a total row that matches the summary line; a chart of the running total by day; an opened event lists its people under their types, adds its own line to the chart, and its CSV has one row per person. If it says the RSVPs could not be read, the admin role is missing the `read:rsvps` permission |
---

### GIS Day admin: a Dashboards section, starting with RSVPs per event by person type, over time

The admin menu opens with a new **Dashboards** section. Its first dashboard, **RSVPs**, shows for the selected season:

- **RSVPs over time**: the running total at the end of each day, in Central time. Opening an event adds that event's
  own line.
- **By event**: each event, in the order they happen, with its number of RSVPs split by person type, and a total row.
  The types come from what each person chose on My Details: **Undergraduate** and **Graduate** students (read from
  the classification they typed; a student whose classification reads as neither is counted as *Student,
  classification not given*), **Faculty & academia**, **Industry**, and **Not given** for an account that never
  completed its profile.
- **An event, opened**: who RSVP'd, under their type's heading, with their email, classification or position,
  department or field of study, and university or employer, and an **Export as CSV** of the same.

Names and emails are read only when an event is opened, and only by an admin with the `read:rsvps` permission.
([#2878](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2878))

| Before | After |
| --- | --- |
| ![The admin menu, with no dashboards](../screenshots/rsvp-dashboard/menu-before.png) | ![Dashboards first in the admin menu, with RSVPs under it](../screenshots/rsvp-dashboard/menu-after.png) |

![The RSVP dashboard: the chart of RSVPs over time and each event's RSVPs by person type](../screenshots/rsvp-dashboard/dashboard-after.png)

![The chart with an event opened: its own line beside every event's](../screenshots/rsvp-dashboard/chart-expanded-after.png)

![An event opened: its people under their types, with names, emails and employers masked here](../screenshots/rsvp-dashboard/dashboard-expanded-after.png)
