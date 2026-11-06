---
issue: 2672
title: After Logout on UCGIS GIS Day, the next sign-in asks for the Tradewing password again
testOnDev: |
  | GIS Day: every sign-in on UCGIS GIS Day asks for the Tradewing password ([#2672](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2672)) | Not on dev, and not locally: Tradewing accepts sign-ins only from production's Auth0, so it can be checked only on [gisday.ucgis.org](https://gisday.ucgis.org) after release | Sign in through Login/Signup, Continue and Tradewing. Then Logout, then Login/Signup and Continue again: Tradewing asks for the email and password again rather than signing you straight back in. txgisday.org's sign-in is unchanged |
---

### GIS Day: after Logout on UCGIS GIS Day, signing in asks for the password again

Logout on gisday.ucgis.org ended the GIS Day session but not the Tradewing one. The next Login/Signup then signed the
visitor straight back in without asking for a password, and on a shared computer it signed in the previous person.

Logout cannot end the Tradewing session from here. Auth0 does not pass the sign-out on to Tradewing, and Tradewing
does not send a visitor back after signing them out. So every sign-in on gisday.ucgis.org now asks Tradewing for the
email and password, even when Tradewing still has a session. Someone already signed in on ucgis.org types their
password once more for GIS Day. txgisday.org and gisday.tamu.edu are unchanged
([#2672](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2672)).
