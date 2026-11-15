---
issue: 2963
title: "GIS Day: one clear button for every search box, and one on the Sessions search"
testOnDev: |
  | GIS Day: clear a search with the box's x ([#2963](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2963)) | Not on dev: GIS Day has no dev site. After release, type in the search on [gisday.tamu.edu/sessions](https://gisday.tamu.edu/sessions), [gisday.tamu.edu/presenters](https://gisday.tamu.edu/presenters) and a presenter's own page; press Tab from the box to reach the x, then Enter. The shared textbox is also on [dev.aggiemap.tamu.edu/directory](https://dev.aggiemap.tamu.edu/directory) | An x appears in each box once it holds text and empties it, listing everything again, with the cursor back in the box; the Presenters page still has Copy link beside it. AggieMap's directory filter has no x and looks as it did |
---

### GIS Day: one clear button for every search box, and one on the Sessions search

The search box on the Sessions page has an x that empties it, as the Presenters page and a presenter's own page
already had. All three now use one x, part of the shared text box rather than a copy kept by each page: a real button,
reached with Tab, read out as "Clear the search", and it puts the cursor back in the box. Text boxes that do not ask
for it, on GIS Day's forms and in AggieMap and GeoServices, are unchanged.
([#2963](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2963))

| Before | After |
| --- | --- |
| ![The Sessions search holding "ballroom", with no way to empty it but deleting the text](../screenshots/2963-textbox-clear/sessions-before.png) | ![The Sessions search holding "ballroom", with an x at its right](../screenshots/2963-textbox-clear/sessions-after.png) |
| | ![The x reached with Tab, showing the browser's focus ring](../screenshots/2963-textbox-clear/sessions-after-keyboard-focus.png) |
| | ![After Enter on the x: the box is empty and every session is listed again](../screenshots/2963-textbox-clear/sessions-after-cleared.png) |
| ![The Presenters search holding "texas", with Copy link and the page's own x](../screenshots/2963-textbox-clear/presenters-before.png) | ![The same, with the shared x, pixel for pixel as before](../screenshots/2963-textbox-clear/presenters-after.png) |
| ![A presenter's page searching "texas", with the page's own x](../screenshots/2963-textbox-clear/presenter-details-before.png) | ![The same, with the shared x](../screenshots/2963-textbox-clear/presenter-details-after.png) |
| ![AggieMap's directory filter holding "evans"](../screenshots/2963-textbox-clear/aggiemap-directory-before.png) | ![The same filter, unchanged pixel for pixel: no x](../screenshots/2963-textbox-clear/aggiemap-directory-after.png) |
