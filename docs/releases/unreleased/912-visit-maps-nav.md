---
issue: 912
title: Every Maps page offers the Visit Maps row, so you can move between map types without going back
testOnDev: |
  | All Maps: moving between map types ([#912](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/912)) | [Parking Maps](https://dev.aggiemap.tamu.edu/all-maps/parking), then any other map type from the row | The Visit Maps row of icon tiles appears under the title on every map-type page, not only on All Maps, and each tile goes where it says. On a phone the row is two columns of icon-beside-label rows, as it already is on All Maps. On dev there is an extra **Code Maroon** tile; it must not appear on production |
---

### Every Maps page offers the Visit Maps row

The Visit Maps row — the icon tiles for Parking, Athletics Events, Campus Events, Operations, Campus Maps and
the Anniversary map — existed only on the All Maps page. Once you had opened one of those pages, there was no
way to reach another map type without going back to All Maps first. The row is now rendered on every Maps page
([#912](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/912)).

Nothing moved on the All Maps page itself, and no tile changed where it goes. The phone layout is the one All
Maps already used: two columns of icon-beside-label rows rather than a wrapping grid of squares.

| | Before | After |
| --- | --- | --- |
| Parking Maps | ![Parking Maps with no way to reach another map type](../screenshots/912-visit-maps-nav/before-parking-maps-desktop.jpg) | ![Parking Maps with the Visit Maps row under the title](../screenshots/912-visit-maps-nav/after-parking-maps-desktop.jpg) |
| Parking Maps, phone | ![The same page on a phone, with no row](../screenshots/912-visit-maps-nav/before-parking-maps-mobile.jpg) | ![The row as two columns of icon-beside-label rows](../screenshots/912-visit-maps-nav/after-parking-maps-mobile.jpg) |
| All Maps, phone | ![The row on All Maps today](../screenshots/912-visit-maps-nav/before-all-maps-mobile.jpg) | ![Unchanged after the move](../screenshots/912-visit-maps-nav/after-all-maps-mobile.jpg) |

The row carries one development-only tile, Code Maroon, which is a proof of concept rather than a
finished feature ([#1289](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1289)).
It must never appear on production, and now that six pages render the row instead of one, there are six
places it could leak. On a development host it is there; on a production one it is not:

![Parking Maps on a development host, with the Code Maroon tile as the seventh](../screenshots/912-visit-maps-nav/after-parking-maps-dev-code-maroon.jpg)

The design came from [PR 928](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/928) by
`sloneearly`, which proposed the component and the content projection that keeps the featured Main Campus
Parking button ahead of the tiles rather than among them. That branch had drifted too far from `development` to
rebase, so it was rebuilt on top of its structure, with the tiles that it predated, the development-only gate
for Code Maroon, and a check that proves the gate holds on every page the row now reaches.
