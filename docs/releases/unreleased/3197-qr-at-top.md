---
issue: 3197
app: gisday
title: "GIS Day: a session's Check-in QR code is at the top of its page, for organizers"
testOnDev: |
  | GIS Day: the Check-in QR code at the top of a session's page ([#3197](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3197)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). After release, signed in as an organizer on [gisday.tamu.edu](https://gisday.tamu.edu), open any session's page; then open it signed out | As an organizer, **Check-in QR Code** and its code (or, before the code has loaded, a **Show check-in QR code** button) are the first thing under the session's title, above its time and place. Signed out, or as an attendee, the page is as before, with no QR code |
---

### GIS Day: a session's Check-in QR code is at the top of its page, for organizers

An organizer showing a session's check-in code to a room had to scroll past the session's time, description, presenters,
attendance and check-ins to reach it. **Check-in QR Code**, with the code and its **Full screen**
and **Download PNG** buttons, is now the first thing under the session's title
([#3197](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3197)). It is still shown only to
admins, managers and organizers, and the code itself is unchanged. The attendees' **Checkin** section stays where it was.

| | |
| --- | --- |
| Before: the top of a made-up session's page, signed in as an admin: time and place, description, registration, check-in and presenters, and no QR code | ![A made-up hybrid session's page from its title down to its presenters, with no Check-in QR Code section in view](../screenshots/3197-qr-at-top/before-top.png) |
| After: the same, with Check-in QR Code the first thing under the title, above the time and place | ![The session's title, then Check-in QR Code with its text, the code, Full screen, Download PNG and the link, then the time and place](../screenshots/3197-qr-at-top/after-top.png) |
| After: the same at 390 px, a phone's width. The session's page is laid out wider than a phone (927 px), before this change as after, so its left side is cut off | ![The session's page at phone width, cut off on the left, with the Check-in QR Code text under the title](../screenshots/3197-qr-at-top/after-top-phone.png) |
| After: the page signed out, with no Check-in QR Code section | ![The same session's page signed out: title, time and place, description, registration, check-in and presenters, with no QR code](../screenshots/3197-qr-at-top/after-signed-out.png) |
