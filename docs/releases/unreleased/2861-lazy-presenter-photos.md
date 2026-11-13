---
issue: 2861
title: GIS Day presenter photos load as they come into view
testOnDev: |
  | GIS Day: presenter photos load as they come into view ([#2861](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2861)) | Not on dev: GIS Day has no dev site. After release, open [Presenters on gisday.tamu.edu](https://gisday.tamu.edu/presenters) with the browser's network panel open | The first cards' photos load at once; the rest load as you scroll down to them. Every photo still appears |
---

### GIS Day: presenter photos load as they come into view

The Presenters page asked for every presenter's photo the moment it opened, 76 of them and 8.6 MB on
11 November 2026, before any could be seen. A photo is now loaded as its card nears the screen, so the page draws
without waiting for photos further down. The same photo component is used wherever a presenter appears, so their
own pages and session pages gain it too. The largest stored photos are resized separately, on production.
([#2861](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2861))
