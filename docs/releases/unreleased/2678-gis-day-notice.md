---
issue: 2678
title: AggieMap tells visitors about GIS Day, and points them at its map
testOnDev: |
  | GIS Day notice ([#2678](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2678)) | [The main map on dev](https://dev.aggiemap.tamu.edu/map/d), from 9 November | A notice appears once per browser session: **GIS Day Map Available**, with a parking icon and a "don't show again" option. Clicking it opens [the GIS Day map](https://dev.aggiemap.tamu.edu/events/gis-day). It should appear from 9 November (a week before the event) through Friday 20 November, and not before or after. Before 9 November there is nothing to see, which is also what the fault looked like |
---

### AggieMap tells visitors about GIS Day

Texas A&M GIS Day is **Monday 16 to Friday 20 November 2026**, and AggieMap would have said nothing about
it. The main map raises a notice for an event that is on now or within a week - Ring Day, Big Event, football
and the rest all have one - and GIS Day's never appeared.

Its dates were right all along. What it did not have was a notice to raise: the service skips an event with
no notice configured before it ever looks at a date, so GIS Day's could not have appeared in any year,
whatever the dates said. **The absence of a notice looks exactly like a quiet week**, which is why it went
unnoticed for several of them.

From a week before the event, a visitor to the main map now gets a notice that opens the GIS Day map, where
the building and parking locations around the MSC and Rudder Tower are. It can be dismissed for good, and it
comes back next year on its own: the service stamps the season onto the notice from the event's own earliest
date, so giving the map next year's dates is all anybody has to do.

#### Behind the scenes

Twenty-seven other event maps carry dates and no notice, and that is correct - a notice is for an event the
public is invited to, not for every permit map. So the new check asserts GIS Day's notice specifically, and
then asserts what must be true of *every* notice, which is where a copied definition goes wrong: no season
typed into an id, each notice opening its own map, and no two events sharing an id and so silencing each
other. All three already held across the existing twelve.
