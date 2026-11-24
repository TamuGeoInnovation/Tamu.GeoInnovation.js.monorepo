---
issue: 3370
app: gisday
title: "GIS Day admin: the Speakers list fits a phone's screen"
testOnDev: |
  | GIS Day admin: the Speakers list on a phone ([#3370](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3370)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). After release, as an admin on a phone: Admin, Speakers | The page no longer scrolls sideways: the table scrolls in its own box. The season select, Edits to review and Add speaker sit on one line under the heading, and the season can be read and changed. On a desktop the list looks as it did |
---

### GIS Day admin: the Speakers list fits a phone's screen

On a phone the admin Speakers list was wider than the screen, so the whole page scrolled sideways, and the season select
beside the heading was squeezed to a sliver too narrow to read or use. The table now scrolls sideways in its own box, as
the admin dashboards' tables do, so the page stays the width of the screen. The season select and the two links move
under the heading, where the select has room
([#3370](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3370)). On a desktop nothing moves.

| | Before | After |
| --- | --- | --- |
| At 390 | ![The list wider than the screen, the season select a sliver beside the heading](../screenshots/3370-speakers-list-phone/before-speakers-390.png) | ![The list the width of the screen, the season select and links on one line under the heading](../screenshots/3370-speakers-list-phone/after-speakers-390.png) |
| At 1280 | ![The Speakers list on a desktop](../screenshots/3370-speakers-list-phone/before-speakers-1280.png) | ![The same, unchanged](../screenshots/3370-speakers-list-phone/after-speakers-1280.png) |

GIS Day has no dev site, so this was checked on the local site, signed in as the txgisday-dev test admin, with three
made-up speakers.
