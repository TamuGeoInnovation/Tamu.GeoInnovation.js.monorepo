---
issue: 3148
title: "GIS Day: the FAQ page's sign-up, login and classes links lead where they say"
testOnDev: |
  | GIS Day: the FAQ page's links ([#3148](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3148)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). After release, signed out, on [gisday.tamu.edu/faq](https://gisday.tamu.edu/faq): open a question and click a "Create an account" link, then a "logged into your account" link, then "Open the My Classes menu item" | Each sign-up and log-in link goes to the sign-in page, not to "We couldn't find that page" or an empty page, and after signing in comes back to the FAQ page. The My Classes link goes to sign in, then to Account, Classes |
---

### GIS Day: the FAQ page's sign-up, login and classes links lead where they say

On the public **FAQ** page, the four "create an account" links went to `/signup`, which the site had no page for, so
visitors got "We couldn't find that page"; the three "logged into your account" links went to `/login`, an empty page
that signed nobody in; and the classes link went to `/account/my-classes`, which does not exist
([#3148](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3148)). `/signup` and `/login` now
start signing in, as the header's Login/Signup does, and bring the visitor back to the page they were on; the classes
link goes to `/account/classes`, which asks a signed-out visitor to sign in first
([#3151](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/3151)).

| The FAQ page's links, clicked while signed out, 1280 pixels, on the local site as gisday.tamu.edu | Before | After |
| --- | --- | --- |
| "create an account." (`/signup`) | ![The site's "Sorry, we couldn't find that page", at /signup](../screenshots/3148-faq-links/before-signup.png) | ![The sign-in page, Log in to continue to GIS Day, with Sign up below it](../screenshots/3148-faq-links/after-signup.png) |
| "logged into your account" (`/login`) | ![The header and footer with nothing between them, at /login](../screenshots/3148-faq-links/before-login.png) | Not captured: `/login` starts the same sign-in as `/signup` |
| "Open the My Classes menu item" (`/account/my-classes` before, `/account/classes` after) | | ![The sign-in page, which a signed-out visitor is sent to before Account, Classes](../screenshots/3148-faq-links/after-classes.png) |

GIS Day has no dev site, so this cannot be checked on dev; it was checked on the local site, signed out, with nothing
typed on the sign-in page. Locally the sign-in page is the development Auth0
tenant's, which names "GIS Day (local development)".
