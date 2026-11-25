---
issue: 1001
title: Keyboard focus is visible on the Copy action and on search results
testOnDev: |
  | Keyboard focus on Copy and on search results ([#1001](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1001)) | [dev.aggiemap.tamu.edu/all-maps](https://dev.aggiemap.tamu.edu/all-maps) | Tab to a map's **Copy**: a maroon box is drawn around it. Type `park` in the search and press the down arrow: the highlighted result has a maroon box. Clicking either with the mouse draws no box |
---

### Keyboard focus is visible on the Copy action and on search results

Someone using the keyboard could not see where they were on two controls: a map's **Copy** showed nothing at all
when it had focus, and a search result reached with the arrow keys looked exactly like one under the mouse
pointer. Both now show a maroon outline when reached from the keyboard, and nothing extra after a click. The same
outline comes back to the sidebar menu of the geoservices site.
([#1001](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1001))

| Before                                                                                                                                     | After                                                                                                  |
| ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| ![The All Maps page with a Copy action focused from the keyboard and no outline](../screenshots/1001-focus-visible/before-copy-button.png) | ![The same Copy action with a maroon outline](../screenshots/1001-focus-visible/after-copy-button.png) |
| ![A search result reached with the arrow keys, shaded only as if hovered](../screenshots/1001-focus-visible/before-autocomplete.png)       | ![The same result with a maroon outline](../screenshots/1001-focus-visible/after-autocomplete.png)     |
