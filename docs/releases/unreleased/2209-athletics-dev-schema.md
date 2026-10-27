---
issue: 2209
title: The athletics maps read the development services as the schema they actually are
testOnDev: |
  | Athletics maps on dev ([#2209](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2209)) | On dev: [soccer](https://dev.aggiemap.tamu.edu/events/soccer-parking), [softball](https://dev.aggiemap.tamu.edu/events/softball-parking), [swimming](https://dev.aggiemap.tamu.edu/events/swimming-parking), [volleyball](https://dev.aggiemap.tamu.edu/events/volleyball-parking), [indoor track](https://dev.aggiemap.tamu.edu/events/indoor-track-parking), [outdoor track](https://dev.aggiemap.tamu.edu/events/outdoor-track-parking), [tennis](https://dev.aggiemap.tamu.edu/events/tennis-parking), [cross country](https://dev.aggiemap.tamu.edu/events/cross-country-parking) | Every layer the map lists draws something - in particular **Accessible Parking Spaces**, which was listed but empty on eight of these maps. **Click a parking lot**: the popup should show the lot name and its description, not an empty panel. Nothing changes on production, which still reads its own services |
---

### The athletics maps read the development services as the schema they actually are

The GIS team republished the eleven athletics services on the development server with a new schema,
and confirmed on 26 October that it is the intended final form — production's services will be
republished to match. The maps' development definitions still described the old one, so on dev
**eight of the eleven listed a layer that drew nothing**, and on three more the layers drew but their
popups came up empty.

Both are fixed for development. **Nothing changes on production**, which still reads its own services
with its own definitions; that side changes when the production services are republished, and this
change has to be in production before that happens.

| | |
| --- | --- |
| **Layers that drew nothing** | Each view now holds one sport, so the per-sport filters (`event = 'Soccer'`, `baseball IN (…)`, `trackxc = 'EventParking'`, `wbasketball IS NOT NULL`) named columns that no longer exist. They are gone. Where production splits one service layer into two map layers, `type` carries the distinction instead |
| **Popups that came up empty** | They asked for `lotname` and `<sport>n`, which the new services do not carry. They read `name` and `description` now |
| **Baseball and cross country** | Had no development definitions at all and were using production's layer indexes and filters. They have their own now |

Measured against the live development services: **all 24 layers across the ten maps return features**,
including the eight that returned none. Baseball's lots split correctly into 8 event and 2 reserved.

The behaviour the maps show is unchanged — the same layers, the same split between event and reserved
parking, the same popups. They are read from the columns that exist.
