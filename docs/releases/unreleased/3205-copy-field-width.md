---
issue: 3205
title: "GIS Day: a session's page fits a phone again for organizers, with its check-in link shortened to fit"
testOnDev: |
  | A long value in a copy field fits its box ([#3205](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3205)) | GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)): after release, signed in as an organizer on [gisday.tamu.edu](https://gisday.tamu.edu) on a phone, open a session's page and show its check-in QR code. On dev, open any [AggieMap](https://dev.aggiemap.tamu.edu) building popup and look at its copy fields | On GIS Day, the page fits the phone, nothing cut off on the left, and the check-in link under the code ends in "…", with Copy copying the whole link. On AggieMap, the copy fields look as before; a value too long for its box ends in "…" |
---

### GIS Day: a session's page fits a phone again for organizers, with its check-in link shortened to fit

Signed in as an organizer, a session's page on a phone was laid out about 930 px wide and cut off on the left, title, Check-in
QR Code text and the code itself included
([#3205](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3205)). The cause was the check-in
link under the code: a single 124-character line, which the shared copy field sized itself to. The copy field now takes
only the room it is given, and a value too long for it ends in "…"; **Copy** still copies all of it.

The copy field is shared, so AggieMap's and the event maps' popups get the same: their values look as before, and one too
long for its box now ends in "…" instead of being cut off mid-letter.
