# maps-feature-location

A "you are here" dot for an Esri map (#2625): `<tamu-gisc-map-location>` draws the phone's location as a blue
dot inside a circle as wide as its accuracy, follows it, and is a button that centres the map on it. It asks
for the location only from a tap, and follows it at once where the site is already allowed it.

Place it over the map (it has no position of its own) in a component that shares the map's `EsriMapService`.

## Running unit tests

Run `nx test maps-feature-location` to execute the unit tests.
