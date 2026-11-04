---
issue: 2641
title: Directions To Here opens the trip on a phone
testOnDev: |
  | Directions on a phone ([#2641](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2641)) | [The Evans Library on dev](https://dev.aggiemap.tamu.edu/map?bldg=0468), on a phone | Tap **Directions To Here** in the popup. The trip screen opens with Sterling C. Evans Library as the destination. Before, the popup closed and nothing else happened. Desktop is unchanged. On production directions stay hidden |
---

### Directions To Here works on a phone

On a phone, tapping **Directions To Here** in a popup closed the popup and stayed on the map, on every map. A phone shows its
popup in a second router outlet, and the button looked for the trip screen inside that outlet, where there is none. It now
opens the trip from the main outlet, as it does on a desktop. Directions are still development-only
([#2641](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2641)).

| Before | After |
| --- | --- |
| ![The popup closed and the map stayed](../screenshots/2641-phone-directions/before.png) | ![The trip screen with the library as destination](../screenshots/2641-phone-directions/after.png) |
