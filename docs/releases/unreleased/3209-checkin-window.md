---
issue: 3209
title: "GIS Day: Check-in opens 5 minutes before a session and closes 10 minutes after, and each session can change it"
testOnDev: |
  | GIS Day: each session's check-in window ([#3209](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3209)) | Not on dev: GIS Day has no dev site. After the migration `AddCheckInMinutes` and the new API, open a session in Admin → Events, then its public page on [txgisday.org](https://txgisday.org/sessions) | The edit form has **Check-in opens, minutes before the start** (5) and **Check-in closes, minutes after the end** (10) beside the times; the session's Check In button appears 5 minutes before it starts and goes 10 minutes after it ends; change either, save, and the button follows; the FAQ's check-in answer says 5 minutes before and 10 minutes after |
---

### GIS Day: Check-in opens 5 minutes before a session and closes 10 minutes after, and each session can change it

Check-in to every session opened at its start and closed 15 minutes after its end, so attendees who arrived early had
to wait for the start to check in. It now opens 5 minutes before a session starts and closes 10 minutes after it ends,
and organizers can change either for one session on its edit page in Admin → Events: **Check-in opens, minutes before
the start** and **Check-in closes, minutes after the end**, from 0 to 1440. The Check In button on the session's page
and the API keep to the same window, an attendee checking in too early is told when it opens, and the FAQ says the
new times. Sessions open for check-in at any time are unchanged. Production needs the migration `AddCheckInMinutes`
run on both GIS Day databases before the new API starts; it gives every existing session 5 and 10.
([#3209](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3209))

| Before | After |
| --- | --- |
| ![The session edit form, with no check-in settings](../screenshots/3209-checkin-window/before-admin-form.png) | ![The session edit form, with check-in minutes before the start and after the end beside the times](../screenshots/3209-checkin-window/after-admin-form.png) |
