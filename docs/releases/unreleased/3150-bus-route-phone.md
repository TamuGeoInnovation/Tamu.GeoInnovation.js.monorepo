---
issue: 3150
title: Tapping a bus route on a phone opens it
testOnDev: |
  | Bus routes on a phone ([#3150](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3150)) | [dev.aggiemap.tamu.edu/map/m/bus](https://dev.aggiemap.tamu.edu/map/m/bus), **on a phone or a phone-sized window** | Tapping a route opens its panel - its name, stops and times - and draws it on the map, with the address becoming `/map/m/bus/<route>`. On a desktop, the bus list works as before |
---

### Tapping a bus route on a phone opens it

On a phone, tapping a route in the Bus Routes list did nothing at all: the list stayed as it was, with no route drawn and
no stops or times. The tap looked for the route's page in the wrong part of the phone layout, where it was not, and
said nothing. It now opens the route's own panel and draws it on the map, as Directions To Here was fixed for the same
cause (#2641). The desktop list was not affected.
([#3150](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3150))

| Phone, 390 pixels | Before | After |
| --- | --- | --- |
| Route NW0104 tapped | ![The list unchanged after the tap](../screenshots/3150-bus-route-phone/before-phone-tapped.png) | ![The route's panel, with its stops, and the route on the map](../screenshots/3150-bus-route-phone/after-phone-tapped.png) |
| Desktop, the control | ![The desktop list opens the route in place](../screenshots/3150-bus-route-phone/before-desktop-tapped.png) | ![The same, unchanged](../screenshots/3150-bus-route-phone/after-desktop-tapped.png) |
