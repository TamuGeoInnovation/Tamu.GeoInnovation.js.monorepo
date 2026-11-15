---
issue: 3081
title: "A session's QR code opens a check-in page that says whether you are checked in"
testOnDev: |
  | A session's QR code opens a check-in page ([#3081](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3081)) | Not on dev: GIS Day has no dev site. After release, as an admin tick "Check-in open at any time?" on one session, press "Show check-in QR code" on its page, and scan the code with a phone, signed in and then signed out | Signed in: a page saying "You're checked in", and "You're already checked in" on a second scan, each with "Go to the session"; signed out: straight to sign-in, then back to the page, checked in; a session not yet open: "You are not checked in" with when it opens. Untick the box afterwards |
---

### A session's QR code opens a check-in page that says whether you are checked in

Scanning a session's check-in QR code opened the session's own page, which checked the attendee in with nothing on the
first screen to say so; signed out, its sign-in button was below the fold. Testing it the day before GIS Day, there was
no telling whether the code had done anything.

The code now opens a page of its own. It says "Checking you in…", then the outcome in words: "You're checked in",
"You're already checked in", or "You are not checked in" with the reason (check-in has not opened yet, has closed, the
code is another session's, the profile is not complete). A "Go to the session" button leads on, and nothing moves on by
itself, so the status stays on screen. An attendee who is signed out is sent to sign in, or create an account, and comes
back to the page to be checked in. The session's own page no longer checks anyone in by itself.
([#3081](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3081))

| On a phone, 390 pixels wide | Before | After |
| --- | --- | --- |
| Scanning the code, signed in | ![The session page, with nothing on the first screen about check-in](../screenshots/3081-checkin-page/before-scan.png) | ![You're checked in, with Go to the session](../screenshots/3081-checkin-page/after-checked-in.png) |
| Scanning it again | | ![You're already checked in](../screenshots/3081-checkin-page/after-already.png) |
| Before check-in opens | | ![You are not checked in, with when it opens](../screenshots/3081-checkin-page/after-not-open.png) |
| Signed out, after cancelling sign-in | | ![You are not checked in yet, with SIGN IN](../screenshots/3081-checkin-page/after-signed-out.png) |
| The organizer's QR code, 1280 pixels | | ![The QR panel, its link to the check-in page](../screenshots/3081-checkin-page/after-organizer-link.png) |
