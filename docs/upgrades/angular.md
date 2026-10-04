# Angular upgrades: how long each step takes

The record behind [#1218](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1218):
one Angular major version per pull request, each run the same way, timed step by step, so the rest of
the way to the latest release can be forecast from evidence instead of guessed
([#1374](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1374)).

**Each upgrade's pull request adds its own column** to the tables below. Times are machine time on the
maintainer's 20-core workstation, in Docker, with other work sometimes sharing it; most of it runs
unattended.

## The steps

1. **Fresh install** of `development`, as the baseline.
2. **`nx migrate`** to the Nx release that carries the next Angular, committed unedited.
3. **Fix the install** without forcing it: version pins `nx migrate` leaves behind, stale lock entries,
   packages whose release does not support the new Angular.
4. **Install** the new versions.
5. **Clean `npm ci`** from only `package.json` and `package-lock.json` - CI installs this way, and
   `npm install` hides gaps (CLAUDE.md).
6. **Code migrations** (`nx migrate --run-migrations`), committed unedited.
7. **Commit**, rebase onto `development`, and resync the lock if the rebase touched it.
8. **Full `nx affected -t lint,test,build`**, every project, compared against the known failures in
   [`docs/releases/unreleased.md`](../releases/unreleased.md).
9. **Fix what the upgrade newly broke**, and lint every project a fix adds files to.
10. **Push, open the pull request, and fix anything only CI finds.**
11. **Merge, build dev, full smoke suite.**

## Time per step

| Step | Angular 16 ([#1343](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1343)) | Angular 17 ([#1365](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1365)) | Angular 18 ([#1371](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1371)) |
| --- | --- | --- | --- |
| Versions | Angular 16.2, Nx 16.10, TypeScript 5.1 | Angular 17.1, Nx 17.3, TypeScript 5.3 | Angular 18.2, Nx 19.8, TypeScript 5.5 |
| 1. Fresh install | 5 min 44 s | 3 min 48 s | 3 min 35 s |
| 2. `nx migrate` | 2 min 22 s | 3 min 21 s | 2 min 15 s |
| 3. Fix the install | ~25 min | ~10 min | ~20 min |
| 4. Install new versions | ~8 min | 6 min 23 s | 9 min 51 s |
| 5. Clean `npm ci` | skipped (cost a CI round trip) | 43 s | 2 min |
| 6. Code migrations | 70 min (25 listed, 10 changed files) | 91 min (24 listed, 12 changed files) | 98 min (22 listed, 18 files) |
| 7. Commit, rebase, lock resync | ~10 min | ~15 min | ~15 min |
| 8. Full lint, test and build | 95 min | 77 min | 109 min |
| 9. Fix newly broken | ~30 min | ~90 min | ~25 min |
| 10. Pull request and CI-only fixes | ~40 min | ~60 min | recorded after merge |
| **Total, steps 1-10** | **~4 h 50 min** | **~6 h** | **~5 h before CI** |
| 11. Dev build, deploy and full suite | ~1 h | ~1 h | to record |

## What each one hit

The variable cost is steps 3, 9 and 10. Recording what caused it is what makes the next forecast better.

**Angular 16**
- `nx migrate` also moved **NestJS 9 to 10**, a second major version; held back and done separately
  ([#1350](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1350)).
- **Stale lock entries** tied the old `@nx/angular` to Angular 15; cleared for the upgraded packages only.
- Jest 29.4 to 29.7, `@angular/cli` left behind, `ng2-dragula` 4 to 5.1.
- **One break:** the router's `Event` type widened, fixed in the shared history service.
- **CI only:** the lock lacked `ng2-dragula` 5's peers - `npm install` had filled them in locally.

**Angular 17**
- `@angular/cli` left behind; `@typescript-eslint` 6 and `eslint-config-prettier` 9 kept (required).
- Rebasing onto NestJS 10 left the lock out of step; resynced.
- **Seven breaks:** Nx 17 requires a `webpack.config.js` per Node app (twelve apps); two lint configs;
  Mailroom's bundle budget, caused by its production build never being optimized
  ([#1368](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1368)).
- **CI only:** GitHub push protection flagged GIS Day's public Mapbox token (allowed); eight Node apps'
  lint configs rejected the new webpack configs.

**Angular 18**
- `zone.js` and `@angular/cli` pins left behind; stale `@typescript-eslint` lock entries; `ng2-dragula`
  5.1 to 6.0.
- **Nx 19.8.15 cannot be installed** - its `@nrwl/*` twins were never published - so 19.8.14.
- The migrations edited `package.json`, leaving the lock out of step; resynced.
- `HttpClientModule` becomes `provideHttpClient(withInterceptorsFromDi())` in every app module.
- **16 libraries' test suites broke:** Angular 18 removes the `async` test helper, deprecated since
  Angular 10. 33 spec files moved to `waitForAsync`, a one-for-one replacement.
- Nx 19 warns that the workspace is not connected to Nx Cloud. It fails nothing; `NX_NO_CLOUD=true`
  silences it locally.

## Forecast for the rest

**Fixed cost per version, from 16 to 18:** steps 1, 2, 4, 5 and 7 together about 30 minutes; code
migrations about 1.5 hours; the full check about 1.5 hours. **About 3.5 hours before anything breaks.**

**Variable cost:** install fixes 10 to 25 minutes; new failures 30 to 90 minutes; CI-only fixes 40 to
60 minutes. **About 1.5 to 3 hours.**

**So each version is about 5 to 6.5 hours of machine time**, plus about an hour for the dev build and
suite.

| Next step | Forecast | Known before starting |
| --- | --- | --- |
| Angular 19 | 5 to 6.5 h | Node 20.18.1 is enough |
| **Node 20.18.1 to 22** | to estimate | **Required before Angular 20:** Angular 20 and 21 need Node 20.19 or later, Angular 22 needs Node 22.22 or later. Node 22 covers all three. It changes the Docker images, CI, the Azure pipeline and the setup docs, and needs every project built and tested under it |
| Angular 20 | 5 to 6.5 h | after Node 22 |
| Angular 21 | 5 to 6.5 h | after Node 22 |
| Angular 22 | 5 to 6.5 h | needs Node 22.22 or later |
| `esri-loader` to `@arcgis/core` | not comparable | 134 files of code, not a version step; estimate it separately |

**Angular 19 to 22: about 20 to 26 hours of machine time, plus the Node upgrade**, if the variable cost
stays in the range seen so far. Recheck after each step: if a version's actual time falls outside the
range, say why here.
