---
issue: 3154
app: gisday
title: "GIS Day: a visitor already signed in who follows a sign-up or log-in link is told so, with Continue to the site and Log out"
testOnDev: |
  | GIS Day: already signed in at /signup or /login ([#3154](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3154)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). After release, sign in on [gisday.tamu.edu](https://gisday.tamu.edu/faq), open the FAQ's first question and follow "create an account" | A page saying **You're already signed in** and **You are signed in as** your name (or, without one, your email), with the tab saying **Already signed in** beside the site's name, and with **Continue to the site** (to the home page) and **Log out**, instead of the FAQ coming back. Signed out, the same link still goes to the sign-in page |
---

### GIS Day: a visitor already signed in who follows a sign-up or log-in link is told so, with Continue to the site and Log out

Since [#3148](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3148), the FAQ's "create an
account" and "log in" links (`/signup` and `/login`) start signing in. For a visitor who is already signed in, Auth0
sent them straight back, so the page they were on simply came back and the link seemed to do nothing. They now see a
page that says they are already signed in, and as whom, with **Continue to the site** and **Log out**, the header's
own Logout ([#3154](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3154)). Signed-out
visitors are unchanged: they go to sign in, as before. `/logout` now logs out too, instead of drawing an empty page.

| Signed in, the FAQ's first question opened and "create an account" followed, 1280 pixels, on the local site as gisday.tamu.edu | Before | After |
| --- | --- | --- |
| What comes back | ![The FAQ page again, reloaded, with its first question closed: nothing says what happened](../screenshots/3154-already-signed-in/before-signed-in.png) | ![A page headed You're already signed in, saying You are signed in as, then the account's name (blanked here), and There is nothing more to sign in or sign up for. To use another account, log out first, with Continue to the site and Log out](../screenshots/3154-already-signed-in/after-signed-in.png) |

GIS Day has no dev site, so this cannot be checked on dev; it was checked on the local site, served as gisday.tamu.edu
at `http://gisday.local.test:4201` rather than `localhost`, because the development Auth0 tenant always asks for consent
from a `localhost` address and skips it for that one. The after page names the signed-in account; in the image that
name is blanked in place, leaving the words around it, and neither image shows the account's name or email, which were
checked for before each was captured.
