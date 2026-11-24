---
issue: 3205
app: gisday
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

A made-up session's page, signed in as the local test admin, with its check-in QR code shown:

| Width | Before | After |
| --- | --- | --- |
| Phone, 390 pixels | ![The page laid out 683 px wide and cut off on the left: the title, the text and the code are missing their left side](../screenshots/3205-copy-field-width/before-phone.png) | ![The page fits the phone: title, text and the whole code, with the check-in link ending in "…" beside Copy](../screenshots/3205-copy-field-width/after-phone.png) |
| Desktop, 1280 pixels | ![The check-in link cut off mid-character at the edge of its box](../screenshots/3205-copy-field-width/before-desktop.png) | ![The same field, the same width, its link ending in "…"](../screenshots/3205-copy-field-width/after-desktop.png) |
| Phone, 360 pixels | Cut off on the left, as at 390 | ![The page at 360 px, with the code and its link ending in "…"](../screenshots/3205-copy-field-width/after-phone-360.png) |

AggieMap's building popup (Sterling C. Evans Library), on a local dev server, at 390 pixels as a phone and at 1280:

| Before | After |
| --- | --- |
| ![The popup's share link and Copy, at 390 and at 1280](../screenshots/3205-copy-field-width/aggiemap-before.png) | ![The same popup, its copy field looking the same at both widths](../screenshots/3205-copy-field-width/aggiemap-after.png) |
