---
issue: 441
app: gisday
title: The admin Speakers list shows each speaker's sessions, and the speakers in none
testOnDev: |
  | GIS Day: each speaker's sessions on the admin Speakers list ([#441](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/441), [#439](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/439)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). After release, on production, as an admin: Admin, Speakers | A Sessions column lists each speaker's sessions in the selected season, or "None"; ticking "Only speakers in no session" leaves only the "None" rows, and unticking it shows every speaker again |
---

### GIS Day: The admin Speakers list shows each speaker's sessions, and the speakers in none

The admin Speakers list did not say which sessions a speaker was in, so an admin could not see who was speaking in
the selected season. Speakers copied into a season are listed in it whether or not they have a session there, which
made the season filter look broken: a speaker who did not speak that year still appeared in its list
([#439](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/439)). The list now has a
**Sessions** column naming each speaker's sessions that season, or "None", and an **Only speakers in no session** box,
built as the Events list's "Only sessions with no tags" is, which lists the speakers with none so they can be given one
or removed. The box is kept with the list's other filters when going back to it from a speaker's page.
([#441](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/441))

No images yet: the page needs an admin sign-in, and the before and after images are taken on another machine.
