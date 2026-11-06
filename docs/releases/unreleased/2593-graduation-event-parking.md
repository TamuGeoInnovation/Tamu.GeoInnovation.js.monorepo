---
issue: 2593
title: The Graduation maps draw their event parking again
testOnDev: |
  | Graduation draws its event parking ([#2593](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2593)) | [Fall Commencement](https://dev.aggiemap.tamu.edu/events/graduation-fall/map/d?date=2025-12-17T05%3A00%3A00.000Z) and [Spring Commencement](https://dev.aggiemap.tamu.edu/events/graduation-spring/map/d?date=2026-05-06T05%3A00%3A00.000Z) | Thirteen blue lots, labelled (Lot 74, WCG, Lot 100b and the rest), with Lot 102 as accessible. Olsen Blvd and Reed Arena Loop are hatched red as Road Closures and **not** blue as parking. The browser's Network tab shows the layers read from `gis.dev.tamu.edu/.../Hosted/GraduationParking_view` on dev |
---

### The Graduation maps draw their event parking again

The Graduation parking service was republished on 28 October with the road closures split into a layer of their own,
which moved the event lots from layer 2 to layer 3. The Fall and Spring Commencement maps still read layer 2 for
their lots, so they showed traffic arrows, accessible parking and road closures, and **no parking at all**, on both
dev and production. They read the new layers now, and dev reads the new copy of the service that Transportation
Services published for it
([#2593](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2593),
[#2530](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2530)).

The nightly map check now asks the service behind every filtered layer how many features it holds and how many the
filter selects, and fails a map whose filter selects none of them. From outside, this fault was a layer that loaded and
answered every question with nothing in it, which the check used to allow, because most layers can be empty by design.
A filter that is empty on purpose (a day not chosen, a date window) is told apart by its form, and the one other found,
Move-In's Northside bike registration, is listed with why.

| | Before | After |
| --- | --- | --- |
| Fall, production | ![Fall Commencement on production before: arrows and closures, no lots](../screenshots/2593-graduation-event-parking/before-prod-fall.png) | ![Fall Commencement after: thirteen blue lots, labelled](../screenshots/2593-graduation-event-parking/after-local-fall.png) |
| Fall, dev | ![Fall Commencement on dev before: no lots](../screenshots/2593-graduation-event-parking/before-dev-fall.png) | ![Fall Commencement after, reading dev's new service: thirteen lots](../screenshots/2593-graduation-event-parking/after-local-dev-fall.png) |
| Spring, production | ![Spring Commencement on production before: no lots](../screenshots/2593-graduation-event-parking/before-prod-spring.png) | ![Spring Commencement after: thirteen lots](../screenshots/2593-graduation-event-parking/after-local-spring.png) |
| Spring, dev | ![Spring Commencement on dev before: no lots](../screenshots/2593-graduation-event-parking/before-dev-spring.png) | ![Spring Commencement after, reading dev's new service](../screenshots/2593-graduation-event-parking/after-local-dev-spring.png) |

The "after" pictures are this change built and served locally: at `localhost`, which reads production's service, and at
`dev.localhost`, which reads dev's.
