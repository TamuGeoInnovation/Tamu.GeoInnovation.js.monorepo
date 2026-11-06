---
issue: 2575
title: UCGIS's Sign in goes straight to Tradewing
testOnDev: |
  | GIS Day: UCGIS signs in with Tradewing only ([#2575](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2575)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). On production after release: [gisday.ucgis.org](https://gisday.ucgis.org), then **Login/Signup** | It opens "Log in with Tradewing" on www.ucgis.org, with no email, Google or sign-up choices; signing in with a UCGIS Tradewing account comes back signed in. On [txgisday.org](https://txgisday.org) and [gisday.tamu.edu](https://gisday.tamu.edu), Login/Signup still shows the page with email, Google and sign-up |
---

### GIS Day: UCGIS's Sign in goes straight to Tradewing

UCGIS's members, and its organizers, sign in to gisday.ucgis.org only with their UCGIS Tradewing accounts. Its **Login/Signup** used to open a Texas A&M Geoservices page offering an email address, Google and Tradewing; it now goes straight to Tradewing's own sign-in page. Organizers who are not UCGIS members get a UCGIS Tradewing account with the admin role on it. txgisday.org and gisday.tamu.edu are unchanged ([#2575](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2575)).

| Before | After |
| --- | --- |
| ![UCGIS's sign-in: a Texas A&M Geoservices page with email, Google and Tradewing](../screenshots/2575-ucgis-tradewing-sign-in/before-ucgis-sign-in.png) | ![UCGIS's sign-in: "Log in with Tradewing" on www.ucgis.org](../screenshots/2575-ucgis-tradewing-sign-in/after-ucgis-sign-in.png) |
