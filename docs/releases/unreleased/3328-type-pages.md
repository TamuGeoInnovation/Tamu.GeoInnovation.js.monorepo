---
issue: 3328
app: gisday
title: "GIS Day admin: the RSVP-type and submission-type pages look like the other admin pages"
testOnDev: |
  | GIS Day admin: RSVP and submission types ([#3328](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3328)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). After release, check on production as an admin: Admin, RSVP Types and Admin, Submission Types, then Add and one type's edit page | Each list has its title and an **Add** link in the toolbar, as the other admin lists do, in place of the bare View, Add and Edit links. Add says **Create**, and edit has **Update** with a **Delete** button beside it |
---

### GIS Day admin: the RSVP-type and submission-type pages look like the other admin pages

The admin pages for RSVP types and submission types were the last built on the old admin bases, with bare View, Add and
Edit links above them, no title, and an "Update entity" button. They are now one set of pages on the same bases as the
rest of the admin: each list has its title and an Add link in its toolbar, the add page says Create, and the edit page
has Update with Delete beside it
([#3328](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3328)).

| | Before | After |
| --- | --- | --- |
| RSVP types, list | ![Before: RSVP types, list](../screenshots/3328-type-pages/before-rsvp-types-list.png) | ![After: RSVP types, list](../screenshots/3328-type-pages/after-rsvp-types-list.png) |
| RSVP types, add | ![Before: RSVP types, add](../screenshots/3328-type-pages/before-rsvp-types-add.png) | ![After: RSVP types, add](../screenshots/3328-type-pages/after-rsvp-types-add.png) |
| RSVP types, edit | ![Before: RSVP types, edit](../screenshots/3328-type-pages/before-rsvp-types-edit.png) | ![After: RSVP types, edit](../screenshots/3328-type-pages/after-rsvp-types-edit.png) |
| Submission types, list | ![Before: Submission types, list](../screenshots/3328-type-pages/before-submission-types-list.png) | ![After: Submission types, list](../screenshots/3328-type-pages/after-submission-types-list.png) |
| Submission types, add | ![Before: Submission types, add](../screenshots/3328-type-pages/before-submission-types-add.png) | ![After: Submission types, add](../screenshots/3328-type-pages/after-submission-types-add.png) |
| Submission types, edit | ![Before: Submission types, edit](../screenshots/3328-type-pages/before-submission-types-edit.png) | ![After: Submission types, edit](../screenshots/3328-type-pages/after-submission-types-edit.png) |
| RSVP types, list, at 390 | | ![After: the RSVP types list on a phone](../screenshots/3328-type-pages/after-rsvp-types-list-390.png) |

GIS Day has no dev site, so this was checked on the local site, signed in as the txgisday-dev test admin, with two
made-up RSVP types and two made-up submission types. No form was saved.
