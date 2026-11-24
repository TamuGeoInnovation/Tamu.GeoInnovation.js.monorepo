---
issue: 3208
app: gisday
title: A session's page fits a 360 px phone
testOnDev: |
  | GIS Day: presenter cards on a phone ([#3208](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3208)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). After release, on a 360 px wide phone (or the browser's device view at 360 px): open a session with presenters; then, as an admin, edit a session's presenters | The session's page doesn't scroll sideways, and each presenter card fits the screen with its name beside the picture. On a wider screen the cards are a little narrower than before, as their padding is now inside their width. The session form's presenter cards fit too |
---

### GIS Day: A session's page fits a 360 px phone

On a 360 px wide phone, a session's page was a little wider than the screen and scrolled sideways
([#3208](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3208)). Its presenter cards were a
fixed width. They now take the width they are given, up to 25rem with their padding inside, so the page fits the screen. A
long name or organization wraps instead of widening the card. The same cards in the session form fit the same way. A
smoke check now opens a session with presenters at 360 px and checks that the page is no wider than the screen.

| Before | After |
| --- | --- |
| ![A made-up session's Presenters on a 360 pixel phone: three made-up presenter cards 364 pixels wide, so the page is 371 pixels wide and scrolls sideways](../screenshots/3208-presenter-card-width/before-session-360.png) | ![The same at 360: each card 332.5 pixels wide inside the screen, the long organization wrapping beside the picture, the page 360 pixels wide](../screenshots/3208-presenter-card-width/after-session-360.png) |
| ![The same at 390 pixels: the cards 364 pixels wide, the page fitting](../screenshots/3208-presenter-card-width/before-session-390.png) | ![The same at 390: the cards 350 pixels wide, the page fitting](../screenshots/3208-presenter-card-width/after-session-390.png) |
| ![The session form's speakers at 360: the cards 364 pixels wide, the form 387 pixels wide](../screenshots/3208-presenter-card-width/before-edit-form-360.png) | ![The session form's speakers at 360 after: the cards 314 pixels wide, the form 360 pixels wide](../screenshots/3208-presenter-card-width/after-edit-form-360.png) |
| ![The session's Presenters at 1280 pixels: two columns of cards 390 pixels wide, the long organization's picture squeezed narrower so its name sits further left](../screenshots/3208-presenter-card-width/before-session-1280.png) | ![The same at 1280 after: the cards 375 pixels wide, a little narrower, and every name lined up beside its picture](../screenshots/3208-presenter-card-width/after-session-1280.png) |
