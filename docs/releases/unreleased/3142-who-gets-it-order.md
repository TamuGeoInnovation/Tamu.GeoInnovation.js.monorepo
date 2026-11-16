---
issue: 3142
title: "GIS Day admin: Who gets it lists speakers alphabetically, with Select all to tick or untick everyone"
testOnDev: |
  | GIS Day: Who gets it in alphabetical order, with Select all ([#3142](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3142)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). After release, as an admin on [gisday.tamu.edu](https://gisday.tamu.edu/admin/events), open a session with several speakers, then Email these speakers, Session details (and Ask for slides) | Who gets it lists the speakers alphabetically by last name, with Select all above them, ticked. Select all unticks every speaker and itself; with one speaker ticked, Select all ticks everyone again. Close the window with Cancel: nothing is sent |
---

### GIS Day admin: Who gets it lists speakers alphabetically, with Select all to tick or untick everyone

The **Who gets it** list in a session's Email these speakers window
([#3104](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3104)), for Session details and Ask
for slides, now lists the session's speakers alphabetically by last name, rather than in the order the API returned
them, and has a **Select all** box above them
([#3142](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3142)):

- with every speaker ticked, Select all is ticked, and choosing it unticks everyone;
- with any speaker unticked, choosing it ticks everyone.

On a session with a dozen or more speakers, sending to all but a few, or to only a few, no longer means clicking each box.

| Who gets it in Session details, 1280 pixels, on the local site as gisday.tamu.edu, with a made-up session and five made-up speakers | Image |
| --- | --- |
| Before: in the API's order (Zulu, Mike, Alpha, Romeo, Delta), no Select all | ![Five made-up speakers, all ticked, in the order Zulu, Mike, Alpha, Romeo, Delta, with no Select all](../screenshots/3142-who-gets-it-order/before-who-gets-it.png) |
| After, as the window opens: alphabetical, Select all ticked | ![Select all ticked above the five made-up speakers, all ticked, in the order Alpha, Delta, Mike, Romeo, Zulu](../screenshots/3142-who-gets-it-order/after-who-gets-it.png) |
| After, Select all chosen: everyone unticked | ![Select all and all five speakers unticked, with Tick at least one speaker to send it](../screenshots/3142-who-gets-it-order/after-select-none.png) |
| After, one speaker ticked, then Select all chosen: everyone ticked again | ![Select all and all five speakers ticked again](../screenshots/3142-who-gets-it-order/after-select-all.png) |

GIS Day has no dev site, so this cannot be checked on dev; it was checked on the local site, and nothing was sent.
