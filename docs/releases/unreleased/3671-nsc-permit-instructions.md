---
issue: 3671
app: aggiemap
title: The New Student Conference parking map's lot popups carry their permit instructions
testOnDev: |
  | NSC lot permit instructions ([#3671](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3671)) | Cannot be checked on dev yet | The NSC parking service answers no geometry ([#2520](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2520)), so no lot's popup can be opened on any environment. Once #2520 is fixed: Events, New Student Conference Parking, click a lot; the popup shows "Register for a permit…" under the lot's name |
---

### The New Student Conference parking map's lot popups carry their permit instructions

Each lot's permit instructions on the **New Student Conference Parking** map were read from Transportation's service and
then dropped, so a lot's popup would have shown only its name. They are now the popup's text, as on every other event
parking map. **Nobody can see this yet:** the service answers no geometry, so no lot's popup opens at all
([#2520](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2520)). When that is fixed, the
permit instructions are already waiting behind it.
([#3671](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3671))
