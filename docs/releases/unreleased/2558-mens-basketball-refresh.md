---
issue: 2558
title: The Men's Basketball map shows game-day changes without a reload
testOnDev: |
  | Men's Basketball refreshes every minute ([#2558](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2558)) | [The Men's Basketball map](https://dev.aggiemap.tamu.edu/events/mens-basketball/map/d), with the browser's developer tools open on the Network tab, filtered to `MensBasketballParking_view` | Leave the map open for two or three minutes without touching it. Each of the three layers (`/0` icons, `/1` closures, `/2` parking) asks its service again about once a minute. To see a real change, have someone with the editor set a lot to *Lot Closed* or move an icon on dev: within a minute the open map shows it, with no reload |
---

### The Men's Basketball map shows game-day changes without a reload

Staff edit the Men's Basketball parking map on game day: a lot set to *Lot Closed*, a closure drawn, an alert
placed. The map now asks for its basketball icons, closures and parking every minute, so a visitor who already has
it open sees the change without reloading, as the football parking map has done since
[#1587](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1587). The first game is on 3
November ([#2558](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2558)).

Nothing about how the map looks changes, so there are no pictures: the difference is that a change made in the
editor appears on its own.
