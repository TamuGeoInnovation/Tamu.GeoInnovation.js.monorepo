---
issue: 3396
app: gisday
title: "GIS Day: a session hidden from the public says it was not found, instead of a blank page"
testOnDev: |
  | GIS Day: a hidden session's link, signed out ([#3396](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3396)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). After release, on production: an admin copies the link to a session hidden from the schedule, then opens it in a private window, signed out | The page says "Sorry. We couldn't find that page." with links to the Home page and Sessions, as any address the site does not know does, and the address stays as it was; nothing of the session is shown. Signed in as an admin, the same link shows the session |
---

### GIS Day: a session hidden from the public says it was not found, instead of a blank page

Since sessions hidden from the schedule stopped being shown to the public by their link
([#3354](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3354)), opening one signed out drew a
blank page ([#3396](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3396)). It now shows the
site's own not-found page, "We couldn't find that page.", with links to the Home page and Sessions, as any address the
site does not know does. The address in the browser stays as it was, and nothing of the session is shown.

| Before | After |
| --- | --- |
| ![A made-up hidden session's link, signed out: the site's header and footer with nothing between them](../screenshots/3396-hidden-session-not-found/before-hidden-session.png) | ![The same link: "Sorry. We couldn't find that page." with links to the Home page and Sessions](../screenshots/3396-hidden-session-not-found/after-hidden-session.png) |
| ![The same on a phone, 390 pixels wide: a blank page under the header](../screenshots/3396-hidden-session-not-found/before-hidden-session-phone.png) | ![The same on a phone: "We couldn't find that page."](../screenshots/3396-hidden-session-not-found/after-hidden-session-phone.png) |

The images were taken locally, signed out, on a made-up session hidden from the public.
