---
issue: 2421
title: UES Operations' legend lists only the layers on the map
testOnDev: |
  | UES Operations legend ([#2421](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2421)) | Not on dev.aggiemap.tamu.edu: on UES's own dev deployment, `maps.apogee.tamu.edu:8443`, signed in. Open the map and read the legend; then, under Layers, open Domestic Cold Water and switch Fire Hydrants on, then off | On load the legend lists only what the map draws (Aggiemap's Construction Zone and Buildings), not every UES layer. Fire Hydrants joins the legend when switched on and leaves it when switched off |
---

### UES Operations' legend lists only the layers on the map

The legend in **UES Operations** listed every layer it knew of, drawn or not, so it could not be read as a key to the
map, and it showed symbols for layers switched off
([#2421](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2421)). It now lists what the map
draws: a layer joins the legend when it is switched on and leaves it when it is switched off.

The same was true of any legend without on-and-off controls of its own that shows a group of layers, so the **Move-In**
map's legend no longer lists Accessible Parking until the accessible-parking choice turns it on.

| Before: the start of a legend of 137 entries, every layer listed                                                                     | After: the two layers the map draws                                                                            |
| ------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| ![The legend listing every UES utility layer although none is switched on](../screenshots/2421-ues-legend/before-legend-on-load.png) | ![The legend listing Construction Zone and Buildings](../screenshots/2421-ues-legend/after-legend-on-load.png) |
