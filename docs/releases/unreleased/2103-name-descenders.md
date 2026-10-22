---
issue: 2103
title: Speaker names keep the bottoms of g, j, p and y
testOnDev: |
  | GIS Day: names on Presenters ([#2103](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2103)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). On production after release: [txgisday.org/presenters](https://txgisday.org/presenters) | Names such as "Xiaojing Tang", "Zhe Zhang" and "Alanna Jajeh" show their g's and j's whole; every card is still the same size |
---

### GIS Day: speaker names keep the bottoms of g, j, p and y

The change that made every speaker card the same size
([#2093](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2093)) cut off the bottoms of
letters that hang below the line in speakers' names, such as the g in "Zhang". The name now has room below the
line, and the cards are still all the same size
([#2103](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2103)).

| Before | After |
| --- | --- |
| ![Names on production: the j's in "Jajeh" cut off at the line](../screenshots/2103-name-descenders/before-names.png) | ![Names with the fix: the g's and y's in "Goldberg" and "Breyer" whole](../screenshots/2103-name-descenders/after-names.png) |
