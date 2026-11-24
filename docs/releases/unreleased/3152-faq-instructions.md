---
issue: 3152
app: gisday
title: "GIS Day: the FAQ page's instructions match the site: its name, check-in, Classes, Online Broadcast, competitions"
testOnDev: |
  | GIS Day: the FAQ's instructions match the site ([#3152](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3152)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). After release, open [gisday.tamu.edu/faq](https://gisday.tamu.edu/faq) signed out and open each question | No answer says "TxGIS Day": they name Texas A&M GIS Day. Check-in asks for a complete Profile, then location in person or the session's QR code online, open until 15 minutes after the session ends. Certifying attendance points to the Classes page, the Zoom answer to Online Broadcast, and the competitions are open only to current Texas A&M students. On [txgisday.org/faq](https://txgisday.org/faq) the answers say TxGIS Day |
---

### GIS Day: the FAQ page's instructions match the site: its name, check-in, Classes, Online Broadcast, competitions

The FAQ page's answers had fallen behind the site
([#3152](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3152)). Every answer said
"TxGIS Day", so on gisday.tamu.edu the page named the wrong site; it now uses the site's own name, as the other pages
do. Checking in now says what the session page asks for: a complete **Profile** first, then the visitor's location for
an in-person session (or the session's QR code if the phone will not share it), and the QR code on the presenter's
slides for a hybrid or online session, until 15 minutes after the session ends. Certifying attendance points to the
**Classes** page rather than "My Classes", the Zoom answer to the **Online Broadcast** section rather than "Online Zoom
Meeting Info", and the garbled competitions answer now says they are open only to current Texas A&M students. The
answer that the site's account is separate from Howdy is kept.

| The FAQ page, 1280 pixels, signed out, on the local site as gisday.tamu.edu, with the question open | Before | After |
| --- | --- | --- |
| How do I check in | ![Click Check-in during the event, on the TxGIS Day Website](../screenshots/3152-faq-instructions/before-checkin.png) | ![A complete Profile, then location in person or the QR code online, until 15 minutes after the end, on the Texas A&M GIS Day website](../screenshots/3152-faq-instructions/after-checkin.png) |
| Who may enter the competitions | ![Two garbled bullets about the public and TAMU students](../screenshots/3152-faq-instructions/before-competitions.png) | ![Open only to current Texas A&M students, graduate and undergraduate](../screenshots/3152-faq-instructions/after-competitions.png) |
| Certifying attendance and the Zoom link | | ![The Classes page under Account, Profile, and the Online Broadcast section, shown when logged in](../screenshots/3152-faq-instructions/after-certify-zoom.png) |

GIS Day has no dev site, so this cannot be checked on dev; it was checked on the local site, signed out.
