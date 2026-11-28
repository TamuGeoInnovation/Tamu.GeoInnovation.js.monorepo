---
issue: 1439
app: aggiemap
title: On a phone, a building's details can be closed
testOnDev: |
  | Closing a building's details on a phone ([#1439](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1439)) | [dev.aggiemap.tamu.edu/map/m?bldg=0468](https://dev.aggiemap.tamu.edu/map/m?bldg=0468) on a phone | The building's sheet has a close control (×) at its top right, and closes when tapped. Pull the grey handle down and let go: the sheet follows the finger and closes. A small nudge leaves it open. Once it is closed, the GPS button can be tapped |
---

### On a phone, a building's details can be closed

On a phone, a building's details open in a sheet along the bottom of the screen, and there was no way to close it: no
close control, and pulling down its grey handle did nothing. Since the sheet lies over the map's buttons, GPS among
them, a visitor who chose a building first could not turn on GPS without reloading. The sheet now has a close control,
and pulling its handle down closes it, as a sheet on a phone is expected to.
([#1439](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1439))

| Before                                                                                                    | After                                                                                                              |
| --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| ![The sheet, with a handle and no close control](../screenshots/1439-phone-sheet-dismiss/before-open.png) | ![The sheet, with a close control beside its handle](../screenshots/1439-phone-sheet-dismiss/after-open.png)       |
| ![After pulling the handle down: still open](../screenshots/1439-phone-sheet-dismiss/before-dragged.png)  | ![After pulling the handle down: closed, the map clear](../screenshots/1439-phone-sheet-dismiss/after-dragged.png) |
