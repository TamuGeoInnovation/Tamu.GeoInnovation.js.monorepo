---
issue: 3605
title: Asking drive directions for an accessible visitor space now narrows the lots
testOnDev: |
  | Accessible visitor parking ([#3605](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3605)) | [Aggie Map dev](https://dev.aggiemap.tamu.edu/map/d/trip), Directions, driving | Choose **no parking permit**, then ask for an accessible visitor space, and plan a drive. The lots offered are only ones that have one - 18 of the 244 on campus, among them Central Campus Garage, University Center Garage and Lot 072a. Before this, every lot was offered |
---

### Asking drive directions for an accessible visitor space now narrows the lots

When someone without a parking permit asked drive directions for an **accessible visitor space**, the filter that was
meant to narrow the lots matched every one of them, so the request had no effect: the driver was offered lots with no
accessible visitor spaces at all. The option read one setting and filtered on another, which made the query
"accessible visitor spaces of nought or more" - true everywhere.

It now asks for lots that actually have one. Measured against the parking service on 25 November 2026, that is **18
lots of 244**, so 226 lots that could not help are no longer offered.
([#3605](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3605))

No before-and-after images: the difference is in which lots a drive is planned to, not in anything that changes on
screen by itself, and it is checked by the row above and by a test that fails against the unfixed code.
