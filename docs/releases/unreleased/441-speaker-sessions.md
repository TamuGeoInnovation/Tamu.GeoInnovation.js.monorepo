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

| | Before | After |
| --- | --- | --- |
| Admin, Speakers, at 1280 | ![The Speakers list: name, email, affiliation and when updated, with nothing saying who speaks](../screenshots/441-speaker-sessions/before-speakers.png) | ![The same list with a Sessions column: two sessions for the first speaker, one for the second, None for the third](../screenshots/441-speaker-sessions/after-speakers.png) |
| Only speakers in no session | | ![With the box ticked, only the speaker whose Sessions is None](../screenshots/441-speaker-sessions/after-speakers-no-session.png) |
| At 390 | ![The list on a phone, wider than the screen](../screenshots/441-speaker-sessions/before-speakers-phone.png) | ![The list on a phone, wider than the screen as before](../screenshots/441-speaker-sessions/after-speakers-phone.png) |

GIS Day has no dev site, so this was checked on the local site, signed in as the txgisday-dev test admin, with three
made-up speakers: one in two sessions, one in a session hidden from the public schedule, and one in none. On a phone the
list was already wider than the screen before this change, and the Sessions column widens it further
([#3370](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3370)).
