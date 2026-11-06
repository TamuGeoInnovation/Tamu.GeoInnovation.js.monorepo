---
issue: 2662
title: UCGIS's Login/Signup says to use a UCGIS account before going to Tradewing
testOnDev: |
  | GIS Day: UCGIS's Login/Signup says first to use a UCGIS account ([#2662](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2662)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). On production after release: [gisday.ucgis.org](https://gisday.ucgis.org) and [txgisday.org](https://txgisday.org) | On gisday.ucgis.org, Login/Signup opens a window with the UCGIS logo, "Sign in with your UCGIS account", and Cancel and Continue. Cancel stays on the page; Continue goes to "Log in with Tradewing". On txgisday.org, Login/Signup goes straight to its usual sign-in page with no window |
---

### GIS Day: UCGIS's Login/Signup says to use a UCGIS account first

Since [#2575](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2575), Login/Signup on
gisday.ucgis.org goes straight to UCGIS's own Tradewing sign-in page. That page says only "Log in with Tradewing", with
no UCGIS logo and nothing to say it wants a UCGIS member account, and it is UCGIS's page, which this site cannot change.

Login/Signup now first opens a short window with the UCGIS logo:
- **Sign in with your UCGIS account**: the next page is the UCGIS sign-in titled "Log in with Tradewing", and visitors use the email and password they use on ucgis.org.
- **Continue** goes on to that page.
- **Cancel** stays on the site.

txgisday.org and gisday.tamu.edu are unchanged
([#2662](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2662)).

| Before: Login/Signup went straight here | After: Login/Signup says first whose account to use |
| --- | --- |
| ![UCGIS's Tradewing sign-in, saying only Log in with Tradewing](../screenshots/2662-ucgis-sign-in-note/before-ucgis-sign-in.png) | ![A window with the UCGIS logo saying Sign in with your UCGIS account, with Cancel and Continue](../screenshots/2662-ucgis-sign-in-note/after-ucgis-sign-in-note.png) |
