# Tree Inventory

`apps/trees-angular` was removed on 3 October 2026
([#1352](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1352)). This is
what it was, recorded before deleting it, as the dead-project survey
([#1226](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1226)) asks.

| | |
| --- | --- |
| **Application** | `apps/trees-angular`, "Tree Inventory - Texas A&M University" |
| **Added** | December 2019, among the repository's earliest applications ([#41](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/41)) |
| **What it was** | An experiment: a campus map for a tree inventory, built from the shared map, search, chart and sidebar libraries |
| **Map services** | The `FCOR` campus base map and map info services on `gis.tamu.edu`, and two `FCOR` layers on `fc-gis.tamu.edu` |
| **Status** | Unused; confirmed by the maintainer on 3 October 2026. Never deployed by this repository's pipelines, which all excluded it |

## Why it was safe to remove

- **No library of its own.** Every shared library it used is used elsewhere.
- **No npm package of its own.**
- **Not deployed.** The Azure pipeline and the GitHub build, lint and test workflows all excluded it.

To recover it, check out the commit before #1352's merge.
