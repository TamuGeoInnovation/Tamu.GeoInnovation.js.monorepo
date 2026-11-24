---
issue: 2024
app: gisday
title: "GIS Day: the footer's My Account links go to the account's own pages"
testOnDev: |
  | GIS Day: footer My Account links ([#2024](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2024)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). After release, sign in on [gisday.tamu.edu](https://gisday.tamu.edu), scroll to the footer and follow each link under **My Account** | The column lists My Check-ins, My Classes and Profile Details. My Check-ins opens `/account/checkins`, My Classes `/account/classes` and Profile Details `/account/details`, each the account's own page; none says "We couldn't find that page", and Registered Sessions is gone |
---

### GIS Day: the footer's My Account links go to the account's own pages

The footer's **My Account** links led nowhere useful: Profile Details went to `/me` and My Classes to `/me/classes`,
which were never addresses on the site, so both said "We couldn't find that page", and Registered Sessions went to the
public list of every session. Profile Details and My Classes now open the account's own pages, `/account/details` and
`/account/classes`, and Registered Sessions is replaced by **My Check-ins**, `/account/checkins`, the sessions the
visitor has checked in to, on the sites with check-ins
([#2024](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2024)).

| Signed in, at 1280 pixels on the local site as gisday.tamu.edu | Before | After |
| --- | --- | --- |
| The footer | ![The footer's My Account column: Registered Sessions, My Classes, Profile Details](../screenshots/2024-footer-links/before-footer.png) | ![The footer's My Account column: My Check-ins, My Classes, Profile Details](../screenshots/2024-footer-links/after-footer.png) |
| Profile Details followed | ![We couldn't find that page, at /me](../screenshots/2024-footer-links/before-profile-details.png) | ![The account's details, at /account/details](../screenshots/2024-footer-links/after-profile-details.png) |
| My Classes followed | | ![The account's classes, at /account/classes](../screenshots/2024-footer-links/after-classes.png) |
| My Check-ins followed | | ![The account's check-ins, at /account/checkins](../screenshots/2024-footer-links/after-checkins.png) |

GIS Day has no dev site, so this cannot be checked on dev; it was checked on the local site. The account's name and
email are blanked in the images.
