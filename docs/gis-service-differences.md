# Where the development GIS services differ from production

**This page exists so the GIS team can be told.** Every difference between the two servers is already
recorded in code - but only ever as a *workaround*, written so a map draws or a check passes. Once the
workaround is in, nothing remains that would make anybody report the difference, and roughly fifty of them
accumulated that way. This is the list someone can hand over.

Where the differences live in code:

| Where | What it holds |
| --- | --- |
| `READ_FROM_PRODUCTION_ON_DEVELOPMENT` in [`libs/aggiemap/ngx/common/src/lib/connections.ts`](../libs/aggiemap/ngx/common/src/lib/connections.ts) | Services a development build reads from production instead. Every row below. |
| `allowed*Failures` in [`test/smoke/aggiemap/environments.json`](../test/smoke/aggiemap/environments.json) | Known failures the smoke suite tolerates per environment. **Not yet swept into this page** - see [What is still missing](#what-is-still-missing). |
| [`athletics-dev-views.md`](athletics-dev-views.md) | The eleven athletics views, measured against production and **already taken to the GIS team**, with their answer. The model for this page. |

`scripts/check-gis-differences.mjs` fails when a key is in `connections.ts` and missing here, so a
workaround cannot be added without its row. A row whose key has gone from the code is kept deliberately:
that is the history of a difference that was fixed.

## Not every difference is the GIS team's

Of the 27 entries, **11 are theirs and 16 are not.** Handing over the raw list would report four retired
2026 events as data faults and bury three real ones among a dozen "please publish this on development"
requests.

| Kind | Count | For the GIS team? |
| --- | --- | --- |
| [Schema divergence](#schema-divergence) | 4 | **Yes - a fault** |
| [Broken or empty data](#broken-or-empty-data) | 3 | **Yes - a fault** |
| [Permissions](#permissions) | 4 | **Yes - a request to publish or unsecure** |
| [Not published on development](#not-published-on-development) | 12 | A request, not a fault |
| [Retired](#retired) | 4 | **No - not theirs at all** |

**Reported?** says whether the GIS team has been told. It starts at **unknown** for everything except the
athletics views, because this page was written from the repository and the repository cannot see what was
said in a meeting. Correct a row to **yes** with a date when you know; do not read **unknown** as "nobody
has mentioned it".

## Schema divergence

The service exists on both and its schema differs, so a build reading development gets wrong or empty
results rather than an error. These are the ones most worth reporting: they are invisible until a map is
looked at.

| Key | What differs | Measured | Issue | Reported? |
| --- | --- | --- | --- | --- |
| `tsParkingLotsUrl` | Layer 6 has the space counts as `GIS.TS.SpacePnt_Count.*`, where the parking search and drive directions read `GIS.TS.SPC_PNT_CNT.*`. The other seven layers match production field for field. | 8 Nov 2026 | [#2756](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2756) | unknown |
| `businessParkingUrl` | Published split by category - BusinessParking 1 and 2 - where production has one layer that the definitions filter into two map layers. So on development one lot layer of the map selected nothing. | 23 Nov 2026 | [#3358](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3358) | unknown |
| `contractorParkingUrl` | The same, as ContractorParking 0 and 1. | 23 Nov 2026 | [#3358](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3358) | unknown |
| `freshmanParkingUrl` | The same, as FreshmanSelectableParking 0 and 1. Also the cause of the empty freshman legend ([#3271](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3271)). | 23 Nov 2026 | [#3358](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3358) | unknown |

## Broken or empty data

The service answers, and what it returns cannot be drawn.

| Key | What differs | Measured | Issue | Reported? |
| --- | --- | --- | --- | --- |
| `constructionUrl` | No hosted view; its `TS/TSConstruction` MapServer answers queries **without geometry**, so a map reading it would draw nothing. The same fault retired production's copy. | 8 Nov 2026 | [#2756](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2756) | unknown |
| `inforUrl` | `FCOR/MapInfo_20190529` has **no layers**, so every layer of it answers 404. | - | [#2744](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2744) | unknown |
| `accessibleUrl` | `FCOR/ADA_120717` likewise: layer 0 answers 404 "Layer not found". | - | [#2744](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2744) | unknown |

## Permissions

The service is there and a development build cannot read it.

| Key | What differs | Issue | Reported? |
| --- | --- | --- | --- |
| `fourHRoundupUrl` | Answers 499 "Token Required". Being on the development server is not enough - its view was, and still answered 499. | [#2695](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2695) | unknown |
| `bikeMapUrl` | Answers 499 "Token Required". | [#2744](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2744) | unknown |
| `bikeRacksUrl` | Answers 499 "Token Required". | [#2744](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2744) | unknown |
| `natureRxUrl` | Answers 499 "Token Required". | [#2630](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2630) | unknown |

## Not published on development

A request rather than a fault: the service exists on production and has no counterpart on development, so
a development build reads production. Nothing is broken; those maps simply cannot be tested on development
against development's own data.

| Key | Issue | Reported? |
| --- | --- | --- |
| `accessibleParkingUrl` | - | unknown |
| `beefCattleUrl` | - | unknown |
| `familyWeekendUrl` | - | unknown |
| `fireSchoolUrl` | - | unknown |
| `gamesOfTexasUrl` | - | unknown |
| `maroonWhiteGameUrl` | - | unknown |
| `moveInParkingUrl` | - | unknown |
| `ms150Url` | - | unknown |
| `ringDayUrl` | - | unknown |
| `summerCommencementUrl` | - | unknown |
| `tCampUrl` | - | unknown |
| `lactationRoomsUrl` | [#1963](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1963) | unknown |

## Retired

**Not the GIS team's, and must never be sent to them.** These are retired 150th-anniversary events with no
counterpart on development because there is no longer anything to publish. They are listed only so that
reading the code does not make them look like faults - which, in the source, they do.

| Key | Reported? |
| --- | --- |
| `kickoff150thUrl` | not applicable |
| `kickoffAtKyleUrl` | not applicable |
| `liveAtTheStationUrl` | not applicable |
| `spiritOf150WeekUrl` | not applicable |

## Already answered by the GIS team

The eleven athletics views, measured 23 October 2026 and taken to the GIS team, who confirmed the views
are the intended final form and that production will be republished to match. The measurement and their
answer are in [`athletics-dev-views.md`](athletics-dev-views.md)
([#2143](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2143),
[#2209](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2209)).

**That is the shape every row above should reach**: measured, reported, answered, recorded.

## What is still missing

`environments.json` holds about **23** GIS-related `allowed*Failures` on development - `MapLayer` 7,
`BusRoute` 6, `Click` 5, `SearchSource` 2, `Popup` 2, `EmptyFilters` 1 - besides 92 build-banner
placeholders, which are not service differences. Each is a known failure the suite tolerates, which is the
same kind of silence this page exists to break, and none has been classified yet. The check does not read
them, so nothing forces that work; it is the remaining half of
[#3402](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3402).
