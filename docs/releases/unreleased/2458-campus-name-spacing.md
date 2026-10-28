---
issue: 2458
title: On a phone, each campus map's name is shown above its own picture, with more space between maps
testOnDev: |
  | Campus Maps on a phone ([#2458](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2458)) | [dev.aggiemap.tamu.edu/all-maps/campus](https://dev.aggiemap.tamu.edu/all-maps/campus) at phone width (375 px, or any window under 769 px wide), scroll down the list. Also [/all-maps](https://dev.aggiemap.tamu.edu/all-maps), the Campus Maps section | Each campus name is above its own picture, close to it, with clearly more space between one map and the next, so it is clear which name goes with which picture. On /all-maps each card is a clear step apart from the next. At desktop width both pages look exactly as before, with the name under the picture |
---
### Campus Maps: on a phone, each name is above its own picture
On a phone the Campus Maps page (`/all-maps/campus`) stacks its maps in one column with no card
around them, and a map's name sat below its own picture and almost as close to the next map's
picture, so it read as belonging to the next one. On a phone the name is now shown **above** its own
picture, and the space between one map and the next is more than four times the space between a name
and its picture. The Campus Maps cards on `/all-maps` get the same treatment, with more space between
the cards. On a wider screen nothing moves: the name is still under the picture.

The name now comes first in the page's markup as well, so a screen reader announces the name before the
picture it belongs to on every screen size; only the layout differs by width
([#2458](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2458)).

| Before | After |
| --- | --- |
| ![Campus Maps page on a phone; each name is 8 px below its picture and 21 px above the next picture](../screenshots/2458-campus-name-spacing/labels-above-campus-page-before-phone.png) | ![The same page; each name is 8 px above its picture, and 37 px separates a picture from the next name](../screenshots/2458-campus-name-spacing/labels-above-campus-page-after-phone.png) |
| ![Campus Maps cards on a phone; each name is below its picture, 16 px between cards](../screenshots/2458-campus-name-spacing/labels-above-all-maps-before-phone.png) | ![The same cards; each name is above its picture, 32 px between cards](../screenshots/2458-campus-name-spacing/labels-above-all-maps-after-phone.png) |
