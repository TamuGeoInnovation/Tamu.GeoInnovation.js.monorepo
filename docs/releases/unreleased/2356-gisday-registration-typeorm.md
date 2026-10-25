---
issue: 2356
title: Registering for a GIS Day session works again on the new database library
testOnDev: |
  | GIS Day: registering for a session ([#2356](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2356)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). On production after release: signed in on [txgisday.org Sessions](https://txgisday.org/sessions) | Tick a session's box: it registers, with the success notice; untick it: it unregisters. A session's page shows its number of registrations. Neither shows an error |
---

### GIS Day: registering for a session works again

The API release of 25 October (`sha-eab737d`, with the typeorm 1 upgrade) answered every session registration, and every session's
registration count, with an error: typeorm 1 refuses a lookup that passes a whole session record when one of its fields is empty, and
every session's capacity is. Production's API was rolled back within the hour. Both lookups now use the session's key, as do six
lookups by season that would have failed the same way the day a season gained an empty field. New tests run these queries through
typeorm itself, so CI catches this kind of mistake
([#2356](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2356)).
