---
issue: 2420
title: UES Operations' search answers in about two seconds, not minutes
testOnDev: |
  | UES Operations search ([#2420](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2420)) | Not on dev.aggiemap.tamu.edu: on UES's own dev deployment, `maps.apogee.tamu.edu:8443`, signed in. In the search box, type a building (`Evans`), then a generator (`EGEN1027`), then an electrical manhole (`MH34`) | Each lists its results within a few seconds: three buildings for Evans, two generators for EGEN1027, the MH34 manholes. Before, a search showed nothing for about five minutes. The console shows no `ues-arc.tamu.edu` request |
---

### UES Operations' search answers in about two seconds, not minutes

A search in **UES Operations** showed nothing for about five minutes, then its results
([#2420](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2420)). Seven of its searches, for
fire hydrants, generators, transformers, electrical manholes, domestic cold water, natural gas meters and well sites,
still asked an old server that no longer accepts connections, and the search waits for every source before it shows
anything. Those searches now ask the service the map itself draws, so a search lists its results in about two seconds.

Generator and fire hydrant searches now find their features: each asked for a field the service does not have,
which made the whole search for that kind fail. **Transformers are not searched for now**: the service's transformers
have neither field the search asked for, and which field to use instead is a question for UES.

Measured from the lab, typing a generator's id and waiting for its results:

| Before: nothing after five seconds (and, after 43 seconds, no results)                                                        | After: its results within two seconds                                                                  |
| ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| ![The search box with the generator's id typed and no results yet](../screenshots/2420-ues-search/before-generator-at-5s.png) | ![The search box listing the two generators](../screenshots/2420-ues-search/after-generator-at-5s.png) |
