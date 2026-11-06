---
issue: 2625
title: The VGI map shows your own submissions, where you are, and one ring per thing found last year
testOnDev: |
  | GIS Day: the VGI competition map on a phone ([#2625](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2625)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). On production after release, signed in, on a phone: [txgisday.org/app/map](https://txgisday.org/app/map) | Your own submissions are solid maroon with a white edge, everyone else's grey, and a key at the bottom left says which is which. Where the site already has your location, a blue dot with a pale circle shows where you are and moves with you; the round button at the bottom right centres the map on it. Where it has not been allowed, nothing asks until you tap that button, and then only once. A ring from last year opens "Already found in 2025", its type, and how many times it was found ("Found 10 times in 2025."); one memorial no longer shows as a stack of rings |
---

### The VGI map shows your own submissions, where you are, and one ring per thing found last year

Three things that made the competition map hard to play from a phone
([#2625](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2625)):

- **Your own submissions stand out.** Every 2026 submission used to be the same grey dot. Yours are now solid
  maroon, above everyone else's, with a key. They come from your own submissions; the map of everyone's still
  says nothing about whose each one is
  ([#1792](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1792)).
- **A "you are here" dot.** Blue, inside a circle as wide as the phone says its location may be off, following
  you as you walk, with a button that centres the map on it. It uses the location only where the site is
  already allowed it, or once you tap the button, so it never asks on its own
  ([#2559](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2559)). It is a shared map
  feature, `maps-feature-location`, for any other map that wants one.
- **One ring per thing found last year.** A memorial submitted several times in 2025 showed as several rings a few
  metres apart. Finds of one type close enough to count as the same thing for scoring are now one ring, which
  says how many times it was found. The distance is the one scoring uses to call a 2026 find already found (15 m
  for monuments, 3 m for tree and bench plaques), so a ring still means "a find here scores as already found".
  On the local copy of the database, 504 rings became 316.

| | Before | After |
| --- | --- | --- |
| The map | ![Every submission a grey dot, and rings stacked on one memorial](../screenshots/2625-vgi-map/before-phone.jpg) | ![Your submissions in maroon, a key, one ring per memorial, and the location button](../screenshots/2625-vgi-map/after-phone.jpg) |
| A ring from last year | ![One of five rings for the same monument, saying only Monument](../screenshots/2625-vgi-map/before-popup.jpg) | ![One ring, saying Monument. Found 10 times in 2025.](../screenshots/2625-vgi-map/after-popup.jpg) |
| Where you are | | ![A blue dot inside its accuracy circle](../screenshots/2625-vgi-map/after-location.jpg) |

