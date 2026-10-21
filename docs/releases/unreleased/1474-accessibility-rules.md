---
issue: 1474
title: Map controls work from the keyboard, and the template accessibility rules are back on for AggieMap
testOnDev: |
  | Keyboard access to the map's controls ([#1474](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1474)) | [dev.aggiemap.tamu.edu/map/d](https://dev.aggiemap.tamu.edu/map/d) and [/map/d/settings](https://dev.aggiemap.tamu.edu/map/d/settings) | Click the "Layers" heading, press Tab: the first layer gets a focus ring, and Space turns it on and off. On the settings page, Tab from the "Basemap" heading reaches the basemaps, and Enter chooses one. Mouse use looks and works as before |
---

### Map controls work from the keyboard

Layers, basemaps, the sidebar's back arrows, close buttons on popups, modals and notifications, the
draw tools, bus routes, tabs, radio groups and toggles could be clicked but not reached with Tab or
pressed with Enter or Space, so someone using only a keyboard could not use them at all. They can now,
and screen readers announce each as what it is (a button, a switch, a radio option) with a name rather
than an icon's ligature such as "arrow_back". The popups' photos have text alternatives, and the
feedback forms no longer move focus on their own when they open.

Seven of angular-eslint's template accessibility rules, turned off in the Angular 22 upgrade so it
could land, are back on for AggieMap, UES Operations and every library they use, so a new control that
only works with a mouse fails lint.
([#1474](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1474))

| Before | After |
| --- | --- |
| ![Tab from the Layers heading skips every layer](../screenshots/1474-accessibility-rules/before-local-build-layer-list-tab-skips-layers.png) | ![Tab from the Layers heading reaches the first layer](../screenshots/1474-accessibility-rules/after-local-build-layer-list-tab-reaches-layer.png) |
| ![Tab from the Basemap heading reaches nothing](../screenshots/1474-accessibility-rules/before-local-build-basemap-tab-reaches-nothing.png) | ![Tab from the Basemap heading reaches the first basemap](../screenshots/1474-accessibility-rules/after-local-build-basemap-tab-reaches-basemap.png) |
