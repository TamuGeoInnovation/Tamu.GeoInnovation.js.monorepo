# Geocode Correction Lite

`apps/correction-lite-angular` was removed on 2 October 2026
([#1339](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1339)). This is
what it was, recorded before deleting it, as the dead-project survey
([#1226](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1226)) asks.

| | |
| --- | --- |
| **Application** | `apps/correction-lite-angular`, "Geocode Correction Lite \| Texas A&M Geoservices" |
| **Added** | February 2024, [#353](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/353) |
| **Library** | `libs/correction/ngx`: a map, a data table of records to correct, miscellaneous controls, modals, and services for the corrections and their database |
| **Map layers** | US census tracts, block groups and blocks, from public ArcGIS Online feature services |
| **Where it ran** | Part of the Geoservices site in the C# repository, which no longer makes it available. This repository's Azure pipeline already excluded it, and it had no Dockerfile |

## Why it was safe to remove

Checked on 2 October 2026:

- **No other code used it.** No project imported `@tamu-gisc/correction/ngx`.
- **Nothing here deployed it.**
- **Its stylesheet budget was the strictest in the repository.** That was the only reason it still mattered: its 4 kB component-stylesheet error budget failed
  [#1334](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/1334), a change to a
  shared component it shipped.

`libs/ui-kits/ngx/layout/tables` went with it, since `libs/correction` was its only importer, and so did the
`dexie` package, which only `libs/correction` used.

The Geoservices site's own address-correction form, in `libs/geoservices/ngx`, is a different thing and
stays.

To recover it, check out the commit before #1339's merge; the application and both libraries are
intact there.
