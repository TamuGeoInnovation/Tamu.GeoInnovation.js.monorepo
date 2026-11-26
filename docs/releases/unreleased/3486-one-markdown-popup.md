---
issue: 3486
title: AggieMap and the event maps share one markdown popup
testOnDev: |
  | One markdown popup ([#3486](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3486)) | AggieMap dev, `/map/d`: turn on AggiePrint Locations and click a printer; then Dismount Zones, and click one. Then the New Student Conference parking map on dev, and click a lot. Then the UES Operations map, Bus, Campus Stops | AggiePrint's popup shows the printer's details, then **Directions To Here** below a dividing line. A dismount zone shows its name, unchanged. An NSC lot shows its name and a copy link, as the other event parking maps' lots do. Pasting the link does not yet reopen the lot, on NSC or on those maps ([#3673](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3673)). A campus stop is titled with the stop's name, not "Campus Stops" |
---

### AggieMap and the event maps share one markdown popup

AggieMap and the event maps each had their own copy of the two simplest popups: a title and a description, with or
without **Directions To Here**. The copies had drifted apart, so the same kind of feature looked different depending on
which map it was opened from
([#3486](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3486)). There is now one pair,
used by both.

Almost nothing a visitor sees changes, by design:

- On an event map, these popups keep their copy link, which carries the map's builder choices.
  The NSC parking map, which used AggieMap's copy, now has the link too. On the event parking maps that link does not
  yet reopen the lot ([#3673](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3673)).
- On AggieMap, the popup with **Directions To Here** puts the button below a dividing line, as a building's popup does.
- A feature with a blank description no longer leaves an empty space where it would have been.
- The UES Operations map's campus stops are still titled with the stop's name.

| Before                                                                                                                                      | After                                                                                                                  |
| ------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| ![An AggiePrint printer's popup, Directions directly under the details](../screenshots/3486-one-markdown-popup/before-aggieprint-popup.png) | ![The same popup, Directions below a dividing line](../screenshots/3486-one-markdown-popup/after-aggieprint-popup.png) |
| ![An NSC parking lot's popup with no copy link](../screenshots/3486-one-markdown-popup/before-nsc-popup.png)                                | ![The same popup with a copy link](../screenshots/3486-one-markdown-popup/after-nsc-popup.png)                         |
