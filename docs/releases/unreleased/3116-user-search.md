---
issue: 3116
app: gisday
title: "Admin, Users' search finds people instead of spinning"
testOnDev: |
  | Admin, Users' search ([#3116](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3116)) | Not on dev: GIS Day has no dev site. After release, signed in as an admin, [Admin, Users](https://gisday.tamu.edu/admin/users) | Typing "zh" asks for 3 letters; "zhe" or "zhang" lists Zhe Zhang; the start of an email address finds its owner; a search never spins for ever |
---

### Admin, Users' search finds people instead of spinning

The search added to Admin, Users the same evening asked Auth0 for any name or email containing the words, which Auth0's
user search refuses, so every search spun for ever. It now finds names, first names, last names and email addresses that
start with each word typed, asks for at least 3 letters (Auth0 needs them), and says why when a search is refused.
([#3116](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3116))

| Admin, Users, 1280 pixels (no before: locally the old search answered rather than spinning) | After |
| --- | --- |
| "zh", 2 letters | ![Type at least 3 letters of a name or email to search](../screenshots/3116-user-search/after-hint.png) |
| A first name from the local test tenant (the name, the row and the search box masked) | ![Showing 1 of 1 user](../screenshots/3116-user-search/after-search.png) |
