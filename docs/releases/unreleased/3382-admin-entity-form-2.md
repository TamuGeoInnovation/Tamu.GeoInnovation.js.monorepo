---
issue: 3382
app: gisday
title: "GIS Day admin: the season, session, place, speaker and sponsor forms say the same thing as the others"
testOnDev: |
  | GIS Day admin: the other forms' messages ([#3382](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3382)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). After release, check on production as an admin: save a season without changing it | The message's title reads "Update Season", where it read "Update season". Deleting a session says "Delete Event" |
---

### GIS Day admin: the season, session, place, speaker and sponsor forms say the same thing as the others

The last five admin forms (seasons, sessions, places, speakers and sponsors) now save and delete through the same shared
code as the six changed in #3340, so their messages match: the season's "Update season" and the session's "Delete event"
are now "Update Season" and "Delete Event". When the site refuses to delete a place or a speaker and says why, the
message now gives that reason
([#3382](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3382)).

| | Before | After |
| --- | --- | --- |
| Saving a season | ![Before: Update season](../screenshots/3382-admin-entity-form-2/before-season-update.png) | ![After: Update Season](../screenshots/3382-admin-entity-form-2/after-season-update.png) |
| Deleting a session | ![Before: Delete event](../screenshots/3382-admin-entity-form-2/before-event-delete.png) | ![After: Delete Event](../screenshots/3382-admin-entity-form-2/after-event-delete.png) |
| A place the site could not delete | ![Before: Error deleting place: 500](../screenshots/3382-admin-entity-form-2/before-place-delete-refused.png) | ![After: the same, as the site gave no reason](../screenshots/3382-admin-entity-form-2/after-place-delete-refused.png) |

The message is at the bottom right of each image. The site gives no reason when a place or speaker cannot be deleted
today: it answers with a server error, which is not a reason anyone can act on, so both say "Error deleting place: 500"
as before. A refusal that gives a reason is shown as it is said. GIS Day has no dev site, so this was checked on the local
site, signed in as the txgisday-dev test admin, by saving a made-up season, deleting two made-up sessions, and trying to
delete a made-up place that a made-up broadcast uses, in a scratch database.
