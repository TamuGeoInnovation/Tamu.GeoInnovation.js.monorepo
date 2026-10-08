# VeoRide

The three VeoRide applications, their library and AggieMap's **VeoRide Bikes** layer were removed on
4 October 2026 ([#1398](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1398)).
This is what they were, recorded before deleting them, as the dead-project survey
([#1226](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1226)) asks.

| | |
| --- | --- |
| **Applications** | `apps/veoride-scraper-node`, `apps/veoride-data-compiler-node` and `apps/veoride-data-api-nest` |
| **Library** | `libs/veoride`: `common/entities`, `scraper`, `data-compiler` and `data-api` |
| **Added** | November 2021, as one suite ([#165](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/165)) |
| **What it was** | An experiment collecting VeoRide's campus bike-share data. The scraper polled VeoRide's Mobility Data Specification (MDS) feeds for trips, status changes and vehicle locations into a SQL Server database through TypeORM. The compiler turned stored trips and status changes into downloadable exports and pruned old ones every 12 hours. The NestJS API served the data, most of it behind bearer tokens |
| **Where it ran** | The API at `veoride.geoservices.tamu.edu`. None of the three was deployed by this repository's pipelines: the Azure pipeline and the GitHub build and test workflows all excluded them |
| **Status** | No longer needed; the maintainer, 4 October 2026 |

## The map layer

The API's one public route, `api/vehicles/basic/geojson`, fed the **VeoRide Bikes** layer: a GeoJSON
layer of green dots, one per bike, off by default.

| Where | What was removed |
| --- | --- |
| The main map, through `libs/aggiemap/ngx/common` | The `BIKE_LOCATIONS` definition and `bike-locations-layer` source in `main.definitions.ts`, and `bikeLocationsUrl` in `connections.ts`. The layer was listed on its own, next to the **Sustainable Transportation** group, not inside it, so the group is unchanged |
| The Ring Day app, `apps/ts-ring-day-angular` | Its own copy of the definition and URL in `src/environments/definitions.ts`, which nothing used |
| The UES Operations map, `apps/ues-operations-angular` | `bikeLocationsUrl` in `src/environments/definitions.ts`, an older address on `nodes.geoservices.tamu.edu`, which nothing used |

The production environment files of AggieMap, the event maps and the Ring Day app passed
`exclude: ['BIKE_LOCATIONS']` to the shared factory. That was all they set, so they now call it with
only the environment. The exclusion was in effect: production's main map, the dining kiosk and an event
map, checked on 5 October before this release reached production, did not load the layer. (An earlier note
on #1398 said production showed it; that came from a misread check and was wrong.)

## Why it was safe to remove

Checked on 4 October 2026:

- **No other code used the library.** Only the three VeoRide applications imported `@tamu-gisc/veoride/*`.
- **Nothing here deployed it.**
- **The layer was the only consumer of the API in this repository.**

Five npm packages went with it, each imported only by VeoRide code:

| Package | Used for |
| --- | --- |
| `luxon`, `@types/luxon` | Dates in the scraper's collectors and the entities' time helpers |
| `jsonwebtoken` | Signing the API's bearer tokens |
| `passport-http-bearer` | The API's bearer strategy |
| `uuid` | Ids for the stored trips, status changes, tasks, tokens and logs |

`uuid` and `jsonwebtoken` stay installed as dependencies of other packages; nothing in the repository
imports them directly. The CPA API's deployment manifest (`apps/cpa-nest/src/package.json`) listed both
but its code imported neither; CPA has since been retired ([#1458](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1458)).

**Out of scope:** the deployed API at `veoride.geoservices.tamu.edu` and its database. Removing the
code does not stop them; shutting them down is a separate decision.

To recover any of it, check out the commit before #1398's merge.
