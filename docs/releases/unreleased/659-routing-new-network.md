---
issue: 659
title: Directions on dev route on Transportation's new network
testOnDev: |
  | Directions: a whole trip with written steps ([#659](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/659)) | [A walking trip on dev](https://dev.aggiemap.tamu.edu/map/d/trip?mode=1&stops=30.6150,-96.3500@30.6150,-96.3300) | The panel lists the Walk, Bike, Drive and Bus times (about 35, 35, 7 and 30 minutes) and, under them, the steps of the walk, starting "Start at 30.6150,-96.3500" and ending at the second point, with the route drawn on the map. Before, it said "No reasonable route was found!". Change `mode=1` to `5` (bus) or `7` (bike) and the steps follow that mode. On [production](https://aggiemap.tamu.edu/map/d/trip) nothing changes: directions are still hidden there |
---

### Directions on dev use the new routing network

The trip planner on dev now routes on the network Transportation published as `RoutingProPublish`, not the
old `Routing/20220119` network that no longer finds a route. The planner finds each of its travel modes on the
network by name, so Walk is Walk and Bike is Bike even though the new network numbers them differently. It offers
Walk, Walk (accessible), Drive, Bus and Bike; accessible driving and accessible bus are not offered, because the
network has no mode for them. Production is unchanged: directions stay hidden there and nothing asks the new
network for anything
([#659](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/659)).

| | Before | After |
| --- | --- | --- |
| Walking trip on dev | ![No route was found](../screenshots/659-routing-new-network/before-walk-trip.png) | ![A walking trip with directions](../screenshots/659-routing-new-network/after-walk-trip.png) |
| Driving trip on dev | | ![A driving trip with directions](../screenshots/659-routing-new-network/after-drive-trip.png) |
| Bus trip on dev | | ![A bus trip with directions](../screenshots/659-routing-new-network/after-bus-trip.png) |
