---
issue: 2707
title: Every building on the map opens its popup when clicked
testOnDev: |
  | Clicking buildings opens their popups, on every map ([#2707](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2707)) | [the main map](https://dev.aggiemap.tamu.edu/map/d), [AVP Parking](https://dev.aggiemap.tamu.edu/parking/avp-parking/map/d) and [NSC Parking](https://dev.aggiemap.tamu.edu/events/nsc-parking) | Click a dozen buildings across the map, quickly: each opens its own popup, with its name, number, address and photo. Reload and try again; before this, some buildings never answered in a visit and which ones changed from visit to visit. Searching for a building and opening a `?bldg=` link still find it, and no building is tinted |
---

### AggieMap: every building on the map opens its popup when clicked

Some buildings did nothing when clicked, while the buildings around them worked. Which ones changed from one visit to the
next. The buildings were read from a service that answers about one request in twenty with an error, at random, and
the map does not ask again: every building in the part of the map that request covered could not be clicked for the
rest of the visit. Measured on 9 November 2026, every building that did not answer lay inside the area of a request
that had failed, and every visit with no failed request answered every click.

The buildings, and the building search, now come from the feature service the campus vector basemap is published
from, which returned no errors in any of the same measurements. The buildings, their names and numbers, and every
`?bldg=` link are the same as before.

([#2707](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2707))

| Before: the buildings request for Reed Arena's part of the map failed, so clicking it (circled) only closes the popup | After: clicking Reed Arena opens its popup |
| --- | --- |
| ![Before](../screenshots/2707-buildings-from-vector-service/before-avp-dead-tile.png) | ![After](../screenshots/2707-buildings-from-vector-service/after-avp.png) |

The "before" was made by answering that one request with the error the old service returns at random, so the picture
shows the fault every time rather than one visit in several. The same fault was observed without forcing it in three
of four runs of the new check on dev's AVP Parking map.
