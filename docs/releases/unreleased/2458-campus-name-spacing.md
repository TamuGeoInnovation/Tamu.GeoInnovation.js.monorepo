---
issue: 2458
title: Each campus map's name is shown above its own picture, with more space between maps
testOnDev: |
  | Campus Maps names above their pictures ([#2458](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2458)) | [dev.aggiemap.tamu.edu/all-maps/campus](https://dev.aggiemap.tamu.edu/all-maps/campus), on a phone (375 px, or any window under 769 px wide) and on a desktop, scrolling down the list. Also [/all-maps](https://dev.aggiemap.tamu.edu/all-maps), the Campus Maps section | At every width each campus name is above its own picture, close to it, with clearly more space between one map and the next, so it is clear which name goes with which picture. On /all-maps the name is at the top of each card, above its picture. On the desktop grid the rows are a little taller than before |
---
### Campus Maps: each name is above its own picture
On the Campus Maps page (`/all-maps/campus`) a map's name sat below its own picture and almost as close
to the next map's picture, so it read as belonging to the next one, on a phone and on a desktop grid
alike. The name is now shown **above** its own picture on every screen size, and the space between one
map and the next is more than four times the space between a name and its picture. The Campus Maps cards
on `/all-maps` get the same treatment, with the name at the top of the card and, on a phone, more space
between the cards.

The name now comes first in the page's markup too, so a screen reader announces the name before the
picture and the order heard is the order seen
([#2458](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2458)).

| Before | After |
| --- | --- |
| ![Campus Maps page on a phone; each name is 8 px below its picture and 21 px above the next picture](../screenshots/2458-campus-name-spacing/labels-above-campus-page-before-phone.png) | ![The same page; each name is 8 px above its picture, and 37 px separates a picture from the next name](../screenshots/2458-campus-name-spacing/labels-above-campus-page-after-phone.png) |
| ![Campus Maps page on a desktop; each name is below its picture, only 5 px above the next row's picture](../screenshots/2458-campus-name-spacing/labels-above-campus-page-before-desktop.png) | ![The same page; each name is above its picture, 37 px below the row above](../screenshots/2458-campus-name-spacing/labels-above-campus-page-after-desktop.png) |
| ![Campus Maps cards on a phone; each name is below its picture, 16 px between cards](../screenshots/2458-campus-name-spacing/labels-above-all-maps-before-phone.png) | ![The same cards; each name is above its picture, 32 px between cards](../screenshots/2458-campus-name-spacing/labels-above-all-maps-after-phone.png) |
| ![Campus Maps cards on a desktop; each name is below its picture](../screenshots/2458-campus-name-spacing/labels-above-all-maps-before-desktop.png) | ![The same cards; each name is at the top of its card, above its picture](../screenshots/2458-campus-name-spacing/labels-above-all-maps-after-desktop.png) |