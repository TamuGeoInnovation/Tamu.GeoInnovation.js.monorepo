---
issue: 3162
title: "GIS Day: the phone menu's Account tile has Admin, for admins, managers and organizers, as on desktop"
testOnDev: |
  | GIS Day: Admin in the phone menu's Account tile ([#3162](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3162)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). After release, on a phone (or a window under 768 pixels wide), sign in on [gisday.tamu.edu](https://gisday.tamu.edu) with an admin, manager or organizer account, open the menu and tap Account | **Admin** is listed between Checkins and Logout, and tapping it opens the admin pages (Seasons). Signed in with an account that has none of those roles, Account lists Profile, Classes, Checkins and Logout, with no Admin |
---

### GIS Day: the phone menu's Account tile has Admin, for admins, managers and organizers, as on desktop

On a phone, the GIS Day site's menu had no way to the admin pages. Its **Account** tile listed Profile, Classes, Checkins
and Logout, while the desktop header's Account menu also lists **Admin** for admins, managers and organizers, so an admin
on a phone had to type `/admin`. The phone menu's Account tile now lists **Admin** for the same three roles, and it opens
the admin pages, as the desktop link does
([#3162](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3162)). Everyone else sees the tile as
before.

| The phone menu, 390 by 844 pixels, on the local site as gisday.tamu.edu, signed in as an admin | Before | After |
| --- | --- | --- |
| Menu open, Account tapped | ![Account lists Profile, Classes, Checkins and Logout, with no Admin](../screenshots/3162-phone-menu-admin/before-account-menu.png) | ![Account lists Profile, Classes, Checkins, Admin and Logout](../screenshots/3162-phone-menu-admin/after-account-menu.png) |
| Admin tapped | | ![The admin pages' Seasons list, at /admin/seasons, with the Admin Menu button above it](../screenshots/3162-phone-menu-admin/after-admin-page.png) |

GIS Day has no dev site, so this cannot be checked on dev; it was checked on the local site. The signed-in account's
name and email do not appear in these views; the captures checked for them and would have blanked them.
