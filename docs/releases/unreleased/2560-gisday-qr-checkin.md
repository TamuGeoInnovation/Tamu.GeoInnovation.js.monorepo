---
issue: 2560
title: GIS Day hybrid and virtual sessions check in with a QR code on the presenter's slides
testOnDev: |
  | GIS Day: a hybrid or virtual session's page ([#2560](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2560)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). On production after release and the `AddEventCheckInCode` migration, signed in as an organizer with `create:checkins`, on a hybrid or virtual session at [txgisday.org/sessions](https://txgisday.org/sessions) | Under Check-in QR Code, "Show check-in QR code" shows a code with Full screen, Download PNG and its link; Full screen fills the screen with the code and "Scan to check in to <session>", and Escape or "Exit full screen" leaves it. While the session's check-in is open, scanning it as another account opens the session with a Check In button that checks in, with no location prompt. The same session opened without the code says to scan the QR code and has no button. An in-person session still checks in by location |
---

### GIS Day: hybrid and virtual sessions check in with a QR code on the slides

Attendees of a hybrid or virtual session could check in from anywhere just by pressing the session page's
button, since the check-in zone ([#1766](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1766))
only applies in person. Now they check in by scanning a QR code the presenter shows. An organizer opens the
session's page, chooses **Show check-in QR code**, and downloads it as a PNG to put on the slides, or shows it **Full screen** on the shared screen. Scanning
it opens the session page signed in, with a **Check In** button and no location prompt. Without the code,
the page says to scan it, and the API refuses the check-in
([#2560](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2560)).

The code is drawn in Texas A&M maroon with the university's logo in the middle, made with the highest
error correction so phones still read it around the logo. Full screen fills the screen with the code and
"Scan to check in to" the session's name, with **Exit full screen** in the corner; Escape also leaves it.

The code is the same for the whole session, so a slide can be made ahead of time. It checks people in
only while the session's check-in is open, from its start until 15 minutes after its end
([#1795](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1795)), so a photo
of the slide sent to a friend works only during the session. Organizers can still add a check-in by hand
from Admin, Check-ins. **Until an organizer shows a session's code, nobody can check themselves in to
it**, so each hybrid and virtual session needs its code on the slides.

The page's old "Checkin QR" icon, which had done nothing since 2020, is gone, as is the unused "QR code"
box on the admin event form. Production needs the `AddEventCheckInCode` migration before this release.

| Before | After |
| --- | --- |
| ![A hybrid session's check-in: a Check In button anyone signed in can press](../screenshots/2560-gisday-qr-checkin/before-hybrid-checkin.jpg) | ![The same session opened without the code: "Check in to this session by scanning the QR code on the presenter's slides."](../screenshots/2560-gisday-qr-checkin/after-hybrid-no-code.jpg) |
| ![The admin event form's unused QR code box](../screenshots/2560-gisday-qr-checkin/before-admin-qr-box.jpg) | ![An organizer's Check-in QR Code section: the maroon code with the Texas A&M logo, Full screen and Download PNG](../screenshots/2560-gisday-qr-checkin/after-organizer-qr.jpg) |
| | ![Full screen: the maroon code with the logo, centred, "Scan to check in to Session 79800bbb" under it, and Exit full screen](../screenshots/2560-gisday-qr-checkin/after-fullscreen-maroon-logo.jpg) |
| | ![Opened from the QR code: a Check In button, then "Your attendance has been registered"](../screenshots/2560-gisday-qr-checkin/after-scanned-checked-in.jpg) |
