---
issue: 2642
title: On a phone, the locate button sits above Legend and Layers
testOnDev: |
  | Locate button on a phone ([#2642](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2642)) | [The Football Tailgating map on dev](https://dev.aggiemap.tamu.edu/events/tailgating/map), on a phone | The round locate button is at the top of the stack on the right, above Legend and Layers, not alone at the bottom corner. Tapping it shows your location. Desktop is unchanged, with locate under the zoom buttons. Applies to every event and parking map |
---

### On a phone, the locate button sits above Legend and Layers

On an event or parking map on a phone, the locate button sat alone at the very bottom right of the screen. On the Football
Tailgating map that corner is over tents and zones, so a tap that missed the button opened a feature's popup, which is hard
to close on a phone. Locate now heads the stack of round buttons on the right, above Legend and Layers, and looks like them.
Desktop is unchanged ([#2642](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2642)).

| Before | After |
| --- | --- |
| ![Locate alone at the bottom right](../screenshots/2642-locate-above/before.png) | ![Locate above Legend and Layers](../screenshots/2642-locate-above/after.png) |
