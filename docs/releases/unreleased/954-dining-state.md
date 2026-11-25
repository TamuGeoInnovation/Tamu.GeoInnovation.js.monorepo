---
issue: 954
title: Every dining location's address reads the same way
testOnDev: |
  | Dining addresses ([#954](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/954)) | [dev.aggiemap.tamu.edu/map/d](https://dev.aggiemap.tamu.edu/map/d), with **Dining Locations** turned on | Open several locations - Salata, Reynolds and Reynolds Cafe, Sbisa - and the address ends **College Station, TX** on every one, not "College Station, texas" or "College Station, Texas". **Food Truck Row**, which has no state, ends at the city with no trailing comma |
---

### Every dining location's address reads the same way

The dining popup showed whatever the dining service published for the state. Counted over all 54
locations on 25 November 2026:

| Published value | Locations |
| --------------- | --------: |
| `TX`            |        35 |
| `Texas`         |        15 |
| `texas`         |         3 |
| _(empty)_       |         1 |

So the same line read **College Station, TX** on two thirds of the locations and **College Station,
texas** on the rest, and Food Truck Row ended in a bare comma with nothing after it. The issue recorded
three different values in September; there are four now, so this is drifting rather than settling.

| Before                                                                               | After                                                                            |
| ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------- |
| ![Salata: College Station, texas](../screenshots/954-dining-state/before-salata.png) | ![Salata: College Station, TX](../screenshots/954-dining-state/after-salata.png) |

Any spelling of Texas is now shown as **TX**. Anything else is shown exactly as published, because the
application cannot know what is right for a state it has not seen, and a part that is missing takes its
separator with it.

**The service still publishes four values**; this only stops them reaching the page. Correcting the
records is for whoever maintains the dining data.

| Issue                                                                                  | What                                                                      |
| -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| [#954](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/954) | The dining popup's address shows the state the same way on every location |
