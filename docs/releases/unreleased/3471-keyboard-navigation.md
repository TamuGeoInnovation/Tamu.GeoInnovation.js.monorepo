---
issue: 3471
title: The map search's results list is named to screen readers, and its arrow keys are unchanged
testOnDev: |
  | The map search's arrow keys ([#3471](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3471)) | [dev.aggiemap.tamu.edu/map/d](https://dev.aggiemap.tamu.edu/map/d), then [the phone map](https://dev.aggiemap.tamu.edu/map/m) | Type `Evans` in the search. **Down** goes from the box to the first result and stays on the last; **Up** walks back to the box; **Enter** or **Space** chooses one; **Escape** closes the list. The same as before; in the trip planner the arrows stay in the box being typed in |
---

### The map search's results list is named to screen readers, and its arrow keys are unchanged

The map search, on the desktop and on a phone, now moves through its results with the same shared keyboard code as the All Maps
search box, instead of a copy of its own, so a keyboard fix is made once. What the keys do is unchanged: down from the box to the first
result, no wrapping at the last, up from the first back to the box, Enter or Space to choose, Escape to close.

One thing a screen reader user gains: the box now tells assistive technology which list it controls. It used to name a list id that
did not exist.
([#3471](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3471))

|                                            | Before                                                                                                                              | After                                                                                          |
| ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Desktop, a result chosen with the keyboard | ![The desktop map search after choosing Evans Library with Enter](../screenshots/3471-keyboard-navigation/before-desktop-enter.png) | ![The same, after the change](../screenshots/3471-keyboard-navigation/after-desktop-enter.png) |
| Phone, a result chosen with the keyboard   | ![The phone map search after choosing Evans Library with Enter](../screenshots/3471-keyboard-navigation/before-phone-enter.png)     | ![The same, after the change](../screenshots/3471-keyboard-navigation/after-phone-enter.png)   |
