---
issue: 3055
app: gisday
title: "GIS Day: a session's Online Broadcast panel shows its dial-in number, not its password"
testOnDev: |
  | GIS Day: the dial-in number on a session's Online Broadcast panel ([#3055](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3055)) | Not on dev: GIS Day has no dev site. After release, signed in, open a hybrid or virtual session on [Sessions](https://txgisday.org/sessions) whose broadcast has a phone number | Open Online Broadcast: "Dial-in number" shows the broadcast's phone number, not the same value as "Password". A broadcast with no phone number says None |
---

### GIS Day: a session's Online Broadcast panel shows its dial-in number, not its password

On a hybrid or virtual session's page, signed in, the **Online Broadcast** panel's "Dial-in number" line showed the
meeting's password whenever the broadcast had a phone number, so someone dialling in had no number to call. It now
shows the phone number. ([#3055](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3055))

| Before | After |
| --- | --- |
| ![The Online Broadcast panel before, at 1280 px, on the local copy's placeholder broadcast: Dial-in number reads 000000, the same as the Password](../screenshots/3055-dial-in-number/before-broadcast-panel-1280.png) | ![The panel after: Dial-in number reads 000-000-0000, the broadcast's phone number](../screenshots/3055-dial-in-number/after-broadcast-panel-1280.png) |
