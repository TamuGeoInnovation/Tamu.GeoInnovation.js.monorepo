---
issue: 2586
title: A greyed-out travel mode in the trip planner can no longer be reached or chosen
testOnDev: |
  | Directions: a greyed travel mode is skipped ([#2586](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2586)) | [A walking trip on dev](https://dev.aggiemap.tamu.edu/map/d/trip?mode=1&stops=30.6150,-96.3500@30.6150,-96.3300), then Options, Accessible Friendly Directions, and back | Biking and the bus are grey. Press Tab from Walking: the outline goes to Driving, skipping Biking. Clicking Biking or the bus does nothing. Walking and Driving can still be chosen by click, Enter or Space. On a trip where a mode finds no route, that mode shows "--" and can still be chosen, to see why |
---

### A greyed-out travel mode can no longer be reached or chosen

In the trip planner, a travel mode that the trip options rule out (with Accessible Friendly Directions on, Biking and
the bus) is drawn grey, with a "not allowed" cursor. It was still a working button: the keyboard's Tab stopped on it
with nothing on screen to show where the focus was, a screen reader announced it as an ordinary button, and a click,
Enter or Space still asked the planner for that mode. A greyed mode is now disabled in fact: Tab skips it, a screen
reader announces it as unavailable, and a click or key does nothing. The modes that can be chosen are unchanged, and a
mode that found no route still shows "--" and can be chosen, to see why
([#2586](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2586)).

| | Before | After |
| --- | --- | --- |
| Accessible directions on, one Tab from Walking | ![The focus is on the grey bike, with nothing to show it](../screenshots/2586-disabled-travel-mode/before-tab-from-walking.png) | ![The focus is on Driving, outlined](../screenshots/2586-disabled-travel-mode/after-tab-from-walking.png) |
| The trip | | ![A walking trip with accessible directions](../screenshots/2586-disabled-travel-mode/after-trip-accessible.png) |
