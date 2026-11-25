---
issue: 2588
app: gisday
title: The phone menu's tiles can be reached and opened with the keyboard
testOnDev: |
  | The phone menu's tiles work by keyboard ([#2588](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2588)) | GIS Day dev site at phone width (390 px in the browser's device toolbar), menu open | Tab moves from tile to tile (Sessions, Presenters, Competitions, FAQs, About) with a maroon outline on the one in focus; Enter opens a linked tile's page, and Enter or Space opens About's submenu. A tap anywhere on a tile still opens it. Login works as before |
---

### The phone menu's tiles can be reached and opened with the keyboard

On a phone-width screen, GIS Day's menu is a grid of tiles. A tap anywhere on a tile already opened it (#3198), but
the keyboard skipped the tiles altogether: Tab went past the menu to the page behind it, and nothing showed where
focus was. Each tile is now one link (or, for About, one button) that Tab reaches, Enter opens, and a maroon
outline marks. A screen reader names it by its title alone, without the icon's name. The same tiles serve
Geoservices' phone menu, which gets the same change.
([#2588](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2588))

| Before | After |
| --- | --- |
| ![GIS Day's phone menu after Tab is pressed: no tile shows focus, and the menu has shifted because focus went to the page behind it](../screenshots/2588-tile-tap-target/menu-390-before.png) | ![The same menu after Tab is pressed three times: the Competitions tile has a maroon outline](../screenshots/2588-tile-tap-target/menu-390-after.png) |
