---
issue: 2843
title: A trip between two searched buildings finds a route again
testOnDev: |
  | A trip between two searched buildings finds a route ([#2843](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2843)) | [dev.aggiemap.tamu.edu/map/d/trip](https://dev.aggiemap.tamu.edu/map/d/trip) | Set both ends from the search box - Eller Oceanography & Meteorology Building to Memorial Student Center - and a walking route appears, where it said "No reasonable route was found!" |
---

### A trip between two searched buildings finds a route again

Choosing both ends of a trip from the search box returned **"No reasonable route was found! Please try again
with different points"**, in every travel mode. Setting either end by clicking the map worked, which is what made
it look like a search fault rather than a routing one.

A trip to a building is moved to that building's nearest door before it is routed, and that only happens when
*both* ends came from search. From the north, the Memorial Student Center's nearest door is one that locates onto
a disconnected piece of the routing network, so the trip failed - while five other doors on the same building
would have worked, and a route plainly existed. Every nearby start chose the same door, so "try different
points" could not help.

The nearest door is now a preference rather than a requirement: doors are tried nearest first, and the first one
the network can route from is used. If none can, the trip keeps the building's own point, which routes.

The door itself is a data fault and is being fixed at source
([#2845](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2845)). This is what makes
the next one survivable, because the application cannot tell a dead piece of network from a live one.
([#2843](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2843))

| Before |
| --- |
| ![No reasonable route was found, between two searched buildings](../screenshots/2843-route-destination/omb-to-msc-both-from-dropdown-no-route.jpg) |

An "after" capture needs a dev server built from the branch; it is added to the pull request before merging.
