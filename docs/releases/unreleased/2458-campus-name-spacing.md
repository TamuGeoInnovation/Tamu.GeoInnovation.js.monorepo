---
issue: 2458
title: On a phone, each campus map's name is clearly grouped with its own picture
testOnDev: |
  | Campus Maps on a phone ([#2458](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2458)) | [dev.aggiemap.tamu.edu/all-maps/campus](https://dev.aggiemap.tamu.edu/all-maps/campus) at phone width (375 px, or any window under 769 px wide), scroll down the list. Also [/all-maps](https://dev.aggiemap.tamu.edu/all-maps), the Campus Maps section | Each campus name sits close under its own picture, with clearly more space between the name and the next map's picture, so it is clear which name goes with which picture. On /all-maps the name has visibly more space above the description under it. At desktop width both pages look exactly as before |
---
### Campus Maps: each name is clearly grouped with its own picture on a phone
On a phone the Campus Maps page (`/all-maps/campus`) stacks its maps in one column with no card
around them, and a map's name sat 8 px below its own picture but only about 5 px above the next
map's picture, so it read as belonging to the next one. The space under each picture-and-name entry is
now larger on a phone, so each name reads with the picture above it. The Campus Maps cards on
`/all-maps`, where the name sat almost as close to the description under it as to its picture, get the
same treatment. The wider layouts are unchanged
([#2458](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2458)).

| Before | After |
| --- | --- |
| ![Campus Maps page on a phone; each name is 8 px below its picture and 5 px above the next picture](../screenshots/2458-campus-name-spacing/campus-page-before-phone.png) | ![The same page; each name is still 8 px below its picture and now 21 px above the next picture](../screenshots/2458-campus-name-spacing/campus-page-after-phone.png) |
| ![Three stacked Campus Maps cards on a phone; each name is 8 px below its picture and 12 px above its description](../screenshots/2458-campus-name-spacing/before-phone.png) | ![The same three cards; each name is still 8 px below its picture and now 16 px above its description](../screenshots/2458-campus-name-spacing/after-phone.png) |
