---
issue: 2700
title: Signing in on UCGIS GIS Day comes back to GIS Day again
testOnDev: |
  | GIS Day: signing in on UCGIS GIS Day comes back to GIS Day ([#2700](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2700)) | Not on dev, and not locally: Tradewing accepts sign-ins only from production's Auth0, so it can be checked only on [gisday.ucgis.org](https://gisday.ucgis.org) after release | In a private window: Login/Signup, Continue, then the Tradewing email and password. You land back on GIS Day, signed in. txgisday.org's sign-in is unchanged |
---

### GIS Day: signing in on UCGIS GIS Day comes back to GIS Day again

For a few hours on 6 November, signing in on gisday.ucgis.org stopped at Tradewing. The email and password were
accepted and the visitor was signed in to ucgis.org, but never sent back to GIS Day. The cause was the change for
[#2672](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2672) in
[PR 2683](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2683), which asked Tradewing for the
password at every sign-in, which opened Tradewing's own sign-in form:

![Before: Tradewing's "Log in with Tradewing" form, which signed visitors in to ucgis.org and stopped there](../screenshots/2700-ucgis-signin/before-tradewing-form.jpg)

The UCGIS site was rolled back the same day, and this takes that one change out
([#2700](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2700)).

The rest of PR 2683 stays: Logout ends only the site's own session, on every site, and clears the API answers the
browser kept. What PR 2683 was for is open again: after Logout, the next sign-in on UCGIS GIS Day signs straight back
in while ucgis.org still has a session, and only Tradewing can end that session.
