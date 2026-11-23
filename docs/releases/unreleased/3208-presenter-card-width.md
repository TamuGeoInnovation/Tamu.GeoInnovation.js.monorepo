---
issue: 3208
title: A session's page fits a 360 px phone
testOnDev: |
  | GIS Day: presenter cards on a phone ([#3208](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3208)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). After release, on a 360 px wide phone (or the browser's device view at 360 px): open a session with presenters; then, as an admin, edit a session's presenters | The session's page doesn't scroll sideways, and each presenter card fits the screen with its name beside the picture. On a wider screen the cards are as wide as before. The session form's presenter cards fit too |
---

### GIS Day: A session's page fits a 360 px phone

On a 360 px wide phone, a session's page was a little wider than the screen and scrolled sideways
([#3208](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3208)). Its presenter cards were a
fixed width. They now take the width they are given, up to the width they had before, so the page fits the screen. A
long name or organization wraps instead of widening the card. The same cards in the session form fit the same way. A
smoke check now opens a session with presenters at 360 px and checks that the page is no wider than the screen.
