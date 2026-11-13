---
issue: 2908
title: "GIS Day admin: Speaker badges records which badges are printed, and shows only the ones still to print"
testOnDev: |
  | GIS Day admin: printed badges ([#2908](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2908)) | Not on dev: GIS Day has no dev site. After release, and after the migration, sign in as an admin and open [Dashboards > Speaker badges on gisday.tamu.edu](https://gisday.tamu.edu/admin/dashboards/speaker-badges) | It opens on Not printed yet; Mark these N as printed asks first, then they leave the list; Show > Printed lists them with the date; a speaker changed since is flagged; Not printed puts one back |
---

### GIS Day admin: Speaker badges records which badges are printed, and shows only the ones still to print

The **Speaker badges** page now remembers which badges have been printed, so that as presenters are added only the
new ones are shown and exported.

- **It opens on Not printed yet.** A **Show** choice switches to Printed or All.
- **Mark these N as printed** marks exactly the rows shown, after asking on the page. Export and print first; the
  mark is only made when you say the badges have printed.
- **A Printed column** gives the date each badge was marked. A speaker whose badge would now say something else (their
  name, organization or class year has changed) is flagged **Changed since printed**, to be reprinted.
- **Not printed** on a row puts that badge back on the list, to undo a mistake or to reprint it.

A badge printed one year starts unprinted the next. Whether a badge is printed is seen only by admins who can edit
speakers. ([#2908](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2908))

| Before | After |
| --- | --- |
| ![Speaker badges, with no record of printing](../screenshots/badges-printed/badges-before.png) | ![Speaker badges opening on Not printed yet](../screenshots/badges-printed/not-printed-after.png) |

![Mark these as printed asks first](../screenshots/badges-printed/confirm-after.png)

![The printed badges, with their dates and one flagged as changed since printed](../screenshots/badges-printed/printed-after.png)
