---
issue: 2093
title: Every speaker card on Presenters is the same size
testOnDev: |
  | GIS Day: Presenters' cards ([#2093](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2093)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). On production after release: [txgisday.org/presenters](https://txgisday.org/presenters) | Every card is the same height, whether its affiliation takes one line or two. A longer name or affiliation ends in "…", and hovering shows it in full |
---

### GIS Day: every speaker card on Presenters is the same size

A card whose affiliation wrapped onto a second line, such as "Texas A&M Department of Geography", was
taller than its neighbours, so the rows of presenters looked ragged: 58 cards came in three heights. Every
card now has room for the name on one line and the affiliation on two; anything longer ends in an
ellipsis, and the card shows it in full on hover
([#2093](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2093)).

| Before | After |
| --- | --- |
| ![Presenters on production: cards of three heights](../screenshots/2093-speaker-card-size/before-presenters.png) | ![Presenters: every card the same height (photos are only on production)](../screenshots/2093-speaker-card-size/after-presenters.png) |
