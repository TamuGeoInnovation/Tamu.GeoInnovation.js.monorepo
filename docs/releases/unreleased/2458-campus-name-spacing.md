---
issue: 2458
title: On a phone, each campus map's name is clearly grouped with its own picture
testOnDev: |
  | All Maps: Campus Maps on a phone ([#2458](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2458)) | [dev.aggiemap.tamu.edu/all-maps](https://dev.aggiemap.tamu.edu/all-maps) at phone width (375 px, or any window under 769 px wide), scroll to Campus Maps | Each campus name sits close under its own picture, with visibly more space between the name and the description below it, so it is clear which name goes with which picture. At desktop width the cards look exactly as before |
---

### All Maps: campus map names are clearly grouped with their pictures on a phone

On a phone the Campus Maps cards stack in one column, and a map's name sat almost as close to the
description under it as to its own picture, so it was not obvious which name belonged to which
picture. The space under the picture-and-name link is now larger on a phone, so each name reads with
its own picture. The wider layouts are unchanged
([#2458](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2458)).

| Before | After |
| --- | --- |
| ![Three stacked Campus Maps cards on a phone; each name is 8 px below its picture and 12 px above its description](../screenshots/2458-campus-name-spacing/before-phone.png) | ![The same three cards; each name is still 8 px below its picture and now 16 px above its description](../screenshots/2458-campus-name-spacing/after-phone.png) |
