---
issue: 3189
title: The email window says why an email could not be loaded
testOnDev: |
  | GIS Day: the email window's reason ([#3189](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3189)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). After release, as an admin: tick a session's judges without saving, then choose Ask to judge | The window says "The email could not be loaded, so nothing was sent. This session has no judges. Tick its judges and save it first.", not "Please try again" |
---

### GIS Day: The email window says why an email could not be loaded

When the site refuses to make an email, the email window now says why, in the site's own words, rather than only
"Please try again"
([#3189](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3189)). Choosing **Ask to judge**
for a session whose judges are ticked but not saved now says to save them first; trying again could never have
worked. It is one window for every email (presenter profiles, session details, Ask for slides, Ask to judge and the
competition's emails), so each says why in the same way. When the site itself fails, or cannot be reached, the window
still says to try again.
