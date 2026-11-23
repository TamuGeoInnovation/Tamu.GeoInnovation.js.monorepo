---
issue: 3077
title: "Scanning a session's QR code checks the attendee in, at every session"
testOnDev: |
  | Scanning a session's QR code checks the attendee in ([#3077](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3077)) | Not on dev: GIS Day has no dev site. After release, as an admin tick "Check-in open at any time?" on one hybrid and one in-person session, press "Show check-in QR code" on each, and scan it with a phone; once signed out (a private window) | Signed in, the page says "Your attendance has been registered" with no button to press; signed out, it offers SIGN IN and comes back checked in; the in-person session's code checks in without asking for the phone's location. Untick the box afterwards |
---

### Scanning a session's QR code checks the attendee in, at every session

A session's check-in QR code only opened the session's page with its code. The attendee then had to find and press
CHECKIN, which shows only while check-in is open and only to someone signed in with a complete profile; signed out, the
page said only "You must be logged in", with no way to sign in from there. Tested before GIS Day, the codes seemed to
take people back to the same page and do nothing.

- **Scanning is the check-in.** Arriving from the code, signed in with a complete profile while check-in is open, checks
  the attendee in with no button press. A refusal shows beside the button, which stays for a second try.
- **Sign-in first.** Signed out, the page offers sign-in, or a new account, and comes back to the same link, code
  included, which then checks in.
- **Too early, it says when.** "Check-in opens at 2:00 PM.", with the day when it is not today, in Central time.
- **Every session has a code.** At an in-person session it is the backup for a phone that will not give its location:
  the code checks the attendee in without it. The location button is unchanged for everyone else.
([#3077](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3077))

| The session's Checkin section, on the local site served as gisday.tamu.edu | Before | After |
| --- | --- | --- |
| Signed out, with the code | ![You must be logged in to checkin](../screenshots/3077-qr-checkin/before-signed-out.png) | ![Sign in, or create an account, with a SIGN IN button](../screenshots/3077-qr-checkin/after-signed-out.png) |
| Signed in, with the code | ![A CHECKIN button to press](../screenshots/3077-qr-checkin/before-signed-in.png) | ![Your attendance has been registered, with no press](../screenshots/3077-qr-checkin/after-signed-in.png) |
| Before check-in opens | ![Checkin will be available at the start of the session](../screenshots/3077-qr-checkin/before-not-open.png) | ![Check-in opens at a named time](../screenshots/3077-qr-checkin/after-not-open.png) |
| An organizer, an in-person session | ![No check-in QR code panel](../screenshots/3077-qr-checkin/before-organizer-in-person.png) | ![The check-in QR code panel, with its in-person wording](../screenshots/3077-qr-checkin/after-organizer-in-person.png) |
