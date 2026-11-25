---
issue: 3635
app: gisday
title: RSVP types and submission types can be added and updated
testOnDev: |
  | Saving RSVP and submission types ([#3635](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3635)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). On production after release, signed in as an administrator: Admin, RSVP Types, then Admin, Submission Types | Add saves a new type and lists it; opening one and pressing Update saves it, with no "501" error. An organizer without the events (or competitions) permission is refused |
---

### RSVP types and submission types can be added and updated

**Admin > RSVP Types** and **Admin > Submission Types** offered Add and Update, but every save failed with "could not be
updated: 501", because the API had never implemented either. Both now save. Changing an RSVP type needs the same
permission as changing events, and a submission type the same as changing competitions.
([#3635](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3635))
