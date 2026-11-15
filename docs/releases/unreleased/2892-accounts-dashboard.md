---
issue: 2892
title: "GIS Day admin: a User accounts dashboard, by university or employer and person type"
testOnDev: |
  | GIS Day admin: the User accounts dashboard ([#2892](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2892)) | Not on dev: GIS Day has no dev site. After release, sign in as an admin and open [Dashboards > User accounts on gisday.tamu.edu](https://gisday.tamu.edu/admin/dashboards/accounts) | The summary gives the accounts with a GIS Day profile made from the day after last year's GIS Day to the end of this one, and every account the sign-in service made then; the chart shows them over time; the table counts them by university or employer and person type, sorts by any heading, and a row opens to its people with a CSV. Needs the `read:users` permission |
---

### GIS Day admin: a User accounts dashboard, by university or employer and person type

The admin's **Dashboards** section has a second dashboard, **User accounts**. For the selected season it counts the
accounts with a GIS Day profile made between the previous GIS Day and the end of this one, and shows:

- **A summary**: how many, and how many accounts the sign-in service made in the same time, with or without a profile.
  The sign-in service is shared with other sites, so the difference is at most the GIS Day sign-ups that never
  finished a profile.
- **Accounts over time**: the running total by day, with each day's new accounts beneath.
- **By university or employer**: a row each, counted by person type, with a total row, sortable by any heading. A row
  opens to its people, with an **Export as CSV**.

Accounts are read from Auth0 by when they were made, in slices small enough that none is cut off at the 1,000 a search
returns. ([#2892](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2892))

The charts on both dashboards now end at the end of their last day, which they had cut off.

| Before | After |
| --- | --- |
| ![The Dashboards menu with RSVPs only](../screenshots/accounts-dashboard/menu-before.png) | ![The Dashboards menu with User accounts under RSVPs](../screenshots/accounts-dashboard/menu-after.png) |

![The User accounts dashboard](../screenshots/accounts-dashboard/dashboard-after.png)

![A university opened to its people, with names, emails and employers masked here](../screenshots/accounts-dashboard/dashboard-opened-after.png)
