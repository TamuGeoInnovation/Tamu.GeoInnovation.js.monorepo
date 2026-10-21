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
