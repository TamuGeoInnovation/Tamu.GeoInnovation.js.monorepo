---
issue: 3089
title: "The QR check-in page says it once, names the day check-in opens, and spaces its buttons"
testOnDev: |
  | The QR check-in page says it once, names the day, spaces its buttons ([#3089](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3089)) | Not on dev: GIS Day has no dev site. After release, scan a session's QR code: signed in; the day before a session; and signed out after cancelling sign-in once | Checked in: only the page says so, with no pop-up in the corner; the day before: "opens when it starts, on <weekday>, <month> <day> at <time>"; signed out: SIGN IN above Go to the session, with space between |
---

### The QR check-in page says it once, names the day check-in opens, and spaces its buttons

Three things the lab found on the new check-in page (#3081). A successful check-in also raised the site's older pop-up,
"Successfully checked-in for this event.", over the page that already said so; it no longer does, there or on the session
page, which says the outcome in its Checkin section. A code scanned before the session's day was refused with "opens when
it starts, at 9:00 AM", which read as if it opened that day; the reason now names the day when it is not today, in
Central time, as the session page's own message does. Signed out, SIGN IN and "Go to the session" sat side by side with
no space; they are now one per row.
([#3089](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3089))

| On a phone, 390 pixels wide | After |
| --- | --- |
| Checked in: no pop-up over the page | ![You're checked in, with nothing in the corner](../screenshots/3089-checkin-polish/after-checked-in.png) |
| The day before the session | ![Opens when it starts, on a named day](../screenshots/3089-checkin-polish/after-day-before.png) |
| Signed out, after cancelling sign-in | ![SIGN IN above Go to the session](../screenshots/3089-checkin-polish/after-signed-out.png) |
