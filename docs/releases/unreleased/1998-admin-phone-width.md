---
issue: 1998
title: GIS Day's admin pages work on a phone
testOnDev: |
  | GIS Day: the admin pages at phone width ([#1998](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1998)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). On production after release, signed in as an organizer, on a phone: [Admin](https://txgisday.org/admin) | Only an "Admin menu" button above each admin page, opening the menu and closing it once a section is chosen. Speakers and Users scroll sideways inside their table, not the whole page. Adding an event, the day tiles wrap. On Seasons, each card's days sit on their own line. On a desktop, the admin pages look as before |
---

### GIS Day: the admin pages work on a phone

The admin pages had never been checked at phone width, because they sit behind the sign-in. A
signed-in capture at 390 px found four problems, now fixed with the site's shared styles:

- **Tables wider than the screen** (Speakers was 1,005 px, Users 470 px) made the whole page scroll
  sideways. They now scroll inside the admin column, with one rule covering every admin list.
- **The admin menu** sat above every page on a phone. It now opens from an "Admin menu" button and
  closes when a section is chosen. On a desktop it is unchanged.
- **The event form's day tiles** made the form 585 px wide. They now wrap.
- **A season card's days** now take their own line.

No signed-in page is wider than the screen any more
([#1998](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1998)).

| Before | After |
| --- | --- |
| ![Speakers at 390 px: the admin menu above the list and a table 592 px wide](../screenshots/1998-admin-phone-width/before-speakers.png) | ![Speakers at 390 px: an Admin menu button, and the table scrolls inside the page](../screenshots/1998-admin-phone-width/after-speakers.png) |
| ![Users at 390 px: the page is 470 px wide](../screenshots/1998-admin-phone-width/before-users.png) | ![Users at 390 px: the page fits](../screenshots/1998-admin-phone-width/after-users.png) |
| ![Add event at 390 px: the day tiles run off the page, 585 px wide](../screenshots/1998-admin-phone-width/before-add-event.png) | ![Add event at 390 px: the day tiles wrap](../screenshots/1998-admin-phone-width/after-add-event.png) |
| ![Seasons at 390 px: the admin menu above the cards](../screenshots/1998-admin-phone-width/before-seasons.png) | ![Seasons at 390 px: each card's days on their own line](../screenshots/1998-admin-phone-width/after-seasons.png) |
