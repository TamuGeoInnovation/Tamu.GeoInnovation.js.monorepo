---
issue: 3398
app: gisday
title: "GIS Day admin: the organization form's messages say Organization, as the form does"
testOnDev: |
  | GIS Day admin: the organization form's messages ([#3398](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3398)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). After release, as an admin on production: open an organization (Admin, then Organizations) and choose Update | The message's title reads "Update Organization" and says the organization was updated, not "Update Place"; Delete Organization's message reads "Delete Organization" the same way |
---

### GIS Day admin: the organization form's messages say Organization, as the form does

The admin calls these records organizations: the menu, the form's Create Organization and Update Organization titles,
and its Delete Organization button. Its messages were the one place that said Place, for example "Delete Place" over
"Error deleting place: 500"
([#3398](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3398)). They now say Organization:
"Delete Organization", "Organization was successfully deleted." The button is unchanged.

| Before | After |
| --- | --- |
| ![The organization form after a refused Delete Organization: the message titled "Delete Place", "Error deleting place: 500"](../screenshots/3398-place-delete-label/before-delete-toast.png) | ![The same: the message titled "Delete Organization", "Error deleting organization: 500"](../screenshots/3398-place-delete-label/after-delete-toast.png) |
| ![The same on a phone, 390 pixels wide: "Delete Place"](../screenshots/3398-place-delete-label/before-delete-toast-phone.png) | ![The same on a phone: "Delete Organization"](../screenshots/3398-place-delete-label/after-delete-toast-phone.png) |

The images were taken locally on made-up records, with a delete the database refused, so nothing was deleted.
