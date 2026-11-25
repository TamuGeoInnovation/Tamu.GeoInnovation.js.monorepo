---
issue: 1001
app: gisday
title: The presenter and session searches' Copy link shows keyboard focus
testOnDev: |
  | Keyboard focus on Copy link ([#1001](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1001)) | GIS Day dev site: Presenters, or Sessions | Type in the search, then Tab: **Copy link** has a maroon box around it. Clicking it with the mouse draws no box |
---

### The presenter and session searches' Copy link shows keyboard focus

**Copy link** in the presenter and session searches showed nothing when reached with Tab, so a keyboard user could
not tell it held focus. It now shows a maroon outline from the keyboard, and nothing extra after a click.
([#1001](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1001))

| Before                                                                                                                                         | After                                                                                                     |
| ---------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| ![The presenter search with Copy link focused from the keyboard and no outline](../screenshots/1001-focus-visible/before-gisday-copy-link.png) | ![The same Copy link with a maroon outline](../screenshots/1001-focus-visible/after-gisday-copy-link.png) |
