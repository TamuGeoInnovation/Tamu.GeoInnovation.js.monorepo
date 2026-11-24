---
issue: 2574
app: gisday
title: Admin, Users opens again, with a search for anyone past the first 1,000
testOnDev: |
  | GIS Day: Admin, Users ([#2574](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2574)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)), and only production's Auth0 tenant has more than 1,000 users. On production after release, signed in as an admin: [Admin, Users](https://gisday.tamu.edu/admin/users) | The list appears instead of spinning, with "Showing the first 1,000 users. Search by name or email to find anyone else." above it. Typing part of a name or email in the search box lists the people who match, including someone whose name sorts late in the alphabet |
---

### GIS Day: Admin, Users opens again, with a search

Admin, Users spun for ever, because the list behind it failed: it asked Auth0 for every user, and Auth0 lists no
more than the first 1,000, which the site has passed. The list now stops at 1,000 and says so, and a search box
above it asks Auth0 for anyone by name or email, however far down the list they are
([#2574](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2574)).

| Admin, Users, 1280 pixels | After |
| --- | --- |
| The list (the local test tenant has 3 users, so the 1,000 note does not show; check it on production) | ![3 users, with the search box](../screenshots/2574-admin-users/after-list.png) |
| A search for "tamu" | ![Showing 2 of 2 users](../screenshots/2574-admin-users/after-search.png) |
