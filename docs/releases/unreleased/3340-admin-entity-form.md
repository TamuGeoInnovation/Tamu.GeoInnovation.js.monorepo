---
issue: 3340
app: gisday
title: "GIS Day admin: the admin forms say the same thing when they save or delete"
testOnDev: |
  | GIS Day admin: the forms' messages ([#3340](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3340)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). After release, check on production as an admin: save a university or an organization without changing it | The message reads "University was successfully updated." or "Organization was successfully updated.", under the title "Update University" or "Update Organization". Deleting a tag says "Tag was successfully deleted." |
---

### GIS Day admin: the admin forms say the same thing when they save or delete

Six admin forms (broadcasts, classes, venues, organizations, tags and universities) each wrote their own save and delete,
and their messages had drifted apart: "Tag deleted successfully." on one, "University updated successfully" with no full
stop on another, a lower-case "Update organization" on a third. They now share one, and each says "<Thing> was
successfully created, updated or deleted." under a title in the same case
([#3340](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3340)).

| | Before | After |
| --- | --- | --- |
| Deleting a tag | ![Before: Tag deleted successfully.](../screenshots/3340-admin-entity-form/before-tag-delete.png) | ![After: Tag was successfully deleted.](../screenshots/3340-admin-entity-form/after-tag-delete.png) |
| Saving a university | ![Before: University updated successfully](../screenshots/3340-admin-entity-form/before-university-update.png) | ![After: University was successfully updated.](../screenshots/3340-admin-entity-form/after-university-update.png) |
| Saving an organization | ![Before: the title Update organization](../screenshots/3340-admin-entity-form/before-organization-update.png) | ![After: the title Update Organization](../screenshots/3340-admin-entity-form/after-organization-update.png) |

The message is at the bottom right of each image. GIS Day has no dev site, so this was checked on the local site, signed in
as the txgisday-dev test admin, by saving a made-up university and organization and deleting two made-up tags in a
scratch database.
