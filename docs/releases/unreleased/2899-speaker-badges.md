---
issue: 2899
title: "GIS Day admin: a Speaker badges dashboard, to print name badges from"
testOnDev: |
  | GIS Day admin: Speaker badges ([#2899](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2899)) | Not on dev: GIS Day has no dev site. After release, sign in as an admin and open [Dashboards > Speaker badges on gisday.tamu.edu](https://gisday.tamu.edu/admin/dashboards/speaker-badges) | Every presenter the Presenters page lists, with First name, Last name, Company / organization, Email and Former student year; a search narrows it on all but the year; any heading sorts it; Export as CSV downloads what is shown, in that order |
---

### GIS Day admin: a Speaker badges dashboard, to print name badges from

The admin's **Dashboards** section has a **Speaker badges** page: the season's presenters, as the Presenters page lists
them, in a table to copy into the software that prints name badges.

- **Columns:** First name, Last name, Company / organization, Email, Former student year.
  - **Company / organization** is the speaker's organization or affiliation, as the site shows it, else their
    university.
  - **Former student year** is a Texas A&M former student's class year, written as the site writes it after their name
    ('14). It is blank for anyone else.
- **A search** above the table narrows it by name, company or organization, or email, ignoring case and accents, as
  the Presenters page's search does.
- **Every heading sorts** the table, and **Export as CSV** downloads what the table shows, in its order.

([#2899](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2899))

| Before | After |
| --- | --- |
| ![The Dashboards menu with RSVPs only](../screenshots/speaker-badges/menu-before.png) | ![The Dashboards menu with Speaker badges under RSVPs](../screenshots/speaker-badges/menu-after.png) |

![The Speaker badges table, with emails masked here](../screenshots/speaker-badges/badges-after.png)

![Searching for "texas", sorted by company](../screenshots/speaker-badges/badges-search-after.png)
