---
issue: 2653
title: Dev reads Transportation's development services
testOnDev: |
  | Dev reads Transportation's development services ([#2653](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2653)) | [Business Parking](https://dev.aggiemap.tamu.edu/parking/business-parking), [Visitor Parking](https://dev.aggiemap.tamu.edu/parking/visitor-parking), [Aggieland Saturday](https://dev.aggiemap.tamu.edu/events/aggieland-saturday) and [Big Event](https://dev.aggiemap.tamu.edu/events/big-event) | The browser's Network tab shows the layers read from `gis.dev.tamu.edu/arcgis/rest/services/TS/...` (or `Hosted/...` for the events), not `arc.ts.tamu.edu`. The lots draw with their legend symbols, and a lot's popup opens with its fields filled. Production is unchanged |
---

### Dev reads Transportation's development services

A development build of AggieMap read Transportation Services' **production** services for its permit and event maps,
because the host they come from was pinned to production while the development copies were being published. So a map
that broke when its service was republished could not be caught on dev first, which is how the Graduation maps lost
their parking on production in October
([#2593](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2593)).

Dev now reads the development GIS server for every one of those services it can serve with the same layers and fields:
the permit parking maps, Aggieland Saturday, Big Event, 4-H Roundup, the family parade, Muster and the athletics maps
([#2653](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2653)). Eighteen still read
production's on dev, each named with its reason: twelve whose development copy lacks the fields the maps use, 4-H
Roundup, whose development view answers "Token Required" so a development build cannot read it at all
([#2695](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2695)), the main
parking service, and four retired 150th-anniversary events. Production reads exactly what it read before.
