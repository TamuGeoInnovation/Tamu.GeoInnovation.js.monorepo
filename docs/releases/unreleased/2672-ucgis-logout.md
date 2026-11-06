---
issue: 2672
title: Logout on UCGIS GIS Day signs the visitor out of Tradewing as well
testOnDev: |
  | GIS Day: Logout on UCGIS GIS Day ends the Tradewing session too ([#2672](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2672)) | Not on dev, and not locally: Tradewing accepts sign-ins only from production's Auth0, so it can be checked only on [gisday.ucgis.org](https://gisday.ucgis.org) after release | Sign in through Login/Signup, Continue and Tradewing. Then Logout, then Login/Signup and Continue again: Tradewing asks for the email and password again rather than signing you straight back in. txgisday.org's Logout is unchanged |
---

### GIS Day: Logout on UCGIS GIS Day signs you out of Tradewing too

Logout on gisday.ucgis.org ended the GIS Day session but not the Tradewing one. The next Login/Signup then signed the
visitor straight back in without asking for a password, and on a shared computer it signed in the previous person.
Logout now ends the Tradewing session as well, so the next sign-in asks for the email and password again. txgisday.org
and gisday.tamu.edu are unchanged
([#2672](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2672)).
