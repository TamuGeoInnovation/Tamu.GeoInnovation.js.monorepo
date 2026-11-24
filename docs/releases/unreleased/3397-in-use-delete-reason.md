---
issue: 3397
app: gisday
title: "GIS Day admin: deleting an organization a broadcast still uses says why it can't"
testOnDev: |
  | GIS Day admin: an organization in use ([#3397](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3397)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). After release, as an admin on production: open an organization (Admin, then Organizations) that a broadcast names, and choose Delete Organization | The message says the organization is used by the broadcast, names it, and says to give it another organization first; the organization is not deleted. An organization no broadcast uses deletes as before |
---

### GIS Day admin: deleting an organization a broadcast still uses says why it can't

Deleting an organization (a place) that a broadcast still names was refused by the database, and the admin form could
only say "Error deleting place: 500"
([#3397](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3397)). The site now refuses it
first and says why, naming the broadcasts, for example "Made-up North Campus is used by 1 broadcast (Made-up stream).
Give it another place first." Nothing is deleted. An organization no broadcast uses is deleted as before, its venues
left without an organization, as they were.

Deleting a speaker who is on a session is not refused: the site removes them from their sessions and deletes them, as it
did before.

| Before | After |
| --- | --- |
| ![The organization form after Delete Organization: the message "Delete Place, Error deleting place: 500"](../screenshots/3397-in-use-delete-reason/before-place-delete-refused.png) | ![The same form after Delete Organization: the message "Delete Place, Made-up North Campus is used by 1 broadcast (Made-up stream). Give it another place first."](../screenshots/3397-in-use-delete-reason/after-place-delete-refused.png) |
| ![The same on a phone, 390 pixels wide: "Error deleting place: 500"](../screenshots/3397-in-use-delete-reason/before-place-delete-refused-phone.png) | ![The same on a phone: the message naming the broadcast](../screenshots/3397-in-use-delete-reason/after-place-delete-refused-phone.png) |

The images were taken locally on made-up records: a made-up organization that a made-up broadcast names.
