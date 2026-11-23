---
issue: 2914
title: "GIS Day admin: a search box and a count on each admin list page"
testOnDev: |
  | GIS Day admin: search on the list pages ([#2914](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2914)) | Not on dev: GIS Day has no dev site. After release, sign in as an admin on gisday.tamu.edu and open Classes, Events, Venues, Affiliations, Organizations, Speakers, Sponsors, Users and Universities | Each opens with a search box and how many it lists; typing narrows the table to rows whose shown columns match, ignoring case and accents, and says "Showing N of M"; a search that matches nothing says so; selecting rows after searching selects only those shown |
---

### GIS Day admin: a search box and a count on each admin list page

**Classes, Events, Venues, Affiliations, Organizations, Speakers, Sponsors, Users and Universities** now open with a
search box and how many the page lists. Typing narrows the table to the rows whose shown columns match, ignoring case
and accents, as the Presenters page's search does, and the count becomes **Showing N of M**.

Each page searches what it shows:

| Page | Searches |
| --- | --- |
| Classes | Code and number, section, name and professor |
| Events | Name, building and room |
| Venues | Building, room and affiliation |
| Affiliations | Name, city, state and ZIP |
| Organizations, Sponsors | Name; a sponsor's level too |
| Speakers | Name, email and organization |
| Users | Name, email and connection id |
| Universities | Name and abbreviation |

Changing the search clears any selected rows, so an action on the selected rows never touches one the search hides.
The Affiliations and Organizations pages' "there are none" messages had been swapped, and are corrected.
([#2914](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2914))

| Before | After |
| --- | --- |
| ![Speakers with no search](../screenshots/admin-search/speakers-before.png) | ![Speakers searched for "texas": 358 of 773](../screenshots/admin-search/speakers-after.png) |
| ![Events with no search](../screenshots/admin-search/events-before.png) | ![Events searched for "workshop": 7 of 46](../screenshots/admin-search/events-after.png) |
| ![Users with no search](../screenshots/admin-search/users-before.png) | ![Users searched: 1 of 3](../screenshots/admin-search/users-after.png) |
