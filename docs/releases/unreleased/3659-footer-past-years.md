---
issue: 3659
app: gisday
title: The footer keeps its Past Years when no season is active
testOnDev: |
  | The footer's Past Years with no active season ([#3659](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3659)) | GIS Day dev site, any page, while no season is active (between seasons) | The footer lists **Past Years** (the seasons before this year, newest first), and the browser console has no "Cannot read properties of null (reading 'year')". With a season active, the list is the seasons before it, as before |
---

### The footer keeps its Past Years when no season is active

Between seasons, when no GIS Day season is active, the footer's **Past Years** list disappeared and every page logged an error. The list is
now the seasons before this year, newest first, until a season is active again; with one active it is the seasons before that one, as
it always was.
([#3659](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3659))

| Before                                                                                          | After                                                                                                             |
| ----------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| ![The footer with no Past Years](../screenshots/3659-footer-no-active-season/before-footer.png) | ![The footer listing TxGIS Day 2025, 2024 and 2023](../screenshots/3659-footer-no-active-season/after-footer.png) |
