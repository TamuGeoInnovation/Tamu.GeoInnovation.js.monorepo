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

| Step | Angular 16 ([#1343](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1343)) | Angular 17 ([#1365](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1365)) | Angular 18 ([#1371](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1371)) | Angular 19 ([#1378](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1378)) | Angular 20 ([#1447](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1447)) | Angular 21 ([#1456](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1456)) |
| --- | --- | --- | --- | --- | --- | --- |
| Versions | Angular 16.2, Nx 16.10, TypeScript 5.1 | Angular 17.1, Nx 17.3, TypeScript 5.3 | Angular 18.2, Nx 19.8, TypeScript 5.5 | Angular 19.2, Nx 20.8, TypeScript 5.7 | Angular 20.3, Nx 21.6, TypeScript 5.9 | Angular 21.2, Nx 22.7, TypeScript 5.9, Jest 30 |
| 1. Fresh install | 5 min 44 s | 3 min 48 s | 3 min 35 s | 7 min 29 s | **62 s** (volume) | **54 s** |
| 2. `nx migrate` | 2 min 22 s | 3 min 21 s | 2 min 15 s | 2 min 30 s | **39 s** | **40 s** |
| 3. Fix the install | ~25 min | ~10 min | ~20 min | ~25 min (one retry) | ~2 min of fixes, plus Prettier 3 as its own pull request first (~20 min) | ~6 min (four tries: stale lock entries, Cypress 6 to 15, an `ng2-dragula` override) |
| 4. Install new versions | ~8 min | 6 min 23 s | 9 min 51 s | 23 min 35 s, contended | **58 s** | **60 s** |
| 5. Clean `npm ci` | skipped (cost a CI round trip) | 43 s | 2 min | failed once (`brace-expansion`); resync and pass, 2 min 37 s | **55 s** | **47 s** |
| 6. Code migrations | 70 min (25 listed, 10 changed files) | 91 min (24 listed, 12 changed files) | 98 min (22 listed, 18 files) | ~5 h 10 min running (6 h 18 min wall, 66 min paused), contended | **8 min 55 s** (28 listed, 371 files) | **39 min 45 s** (25 listed, 447 files), sharing the machine with a full dev smoke run |
| 7. Commit, rebase, lock resync | ~10 min | ~15 min | ~15 min | ~30 min (formatting restored, lock resynced twice) | ~3 min (formatting 3 s; lock resync 68 s) | ~2 min (formatting 6 s; lock unchanged; clean `npm ci` 95 s) |
| 8. Full lint, test and build | 95 min | 77 min | 109 min | **9 min in a volume** (old setup: 87 of 301 tasks in about an hour, stopped) | **6 min 22 s** cold; 4 min 9 s after the fixes | **7 min 7 s** cold (41 of 246 failed); **3 min 5 s** after the fixes, 246 passed |
| 9. Fix newly broken | ~30 min | ~90 min | ~25 min | ~45 min | ~20 min | ~45 min, three more check runs |
| 10. Pull request and CI-only fixes | ~40 min | ~60 min | recorded after merge | recorded after merge | recorded after merge | recorded after merge |
| **Total, steps 1-10** | **~4 h 50 min** | **~6 h** | **~5 h before CI** | **not comparable**: see below | **~1 h** of wall clock, Prettier included | **~1 h 30 min** of wall clock, 40 min of it the migrations under load |
| 11. Dev build, deploy and full suite | ~1 h | ~1 h | to record | to record | to record | to record |

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

**Angular 19**
- `@angular/cli` pin left behind; unused `chokidar` removed; two lock resyncs (`brace-expansion`, then
  `@inquirer/prompts` after the migrations' own install). The second was invisible to a check reusing
  `npm install`'s `node_modules` and found at once by a fresh clone's `npm ci`.
- **Step 6 is not a fair number.** The migrations ran on the old bind-mounted setup while two other full
  checks and three agents shared the machine. `explicit-standalone-flag`, which marks every
  non-standalone component, directive and pipe, ran for about 40 minutes on its own.
- **Two breaks, 60 tasks:** `@angular-eslint/prefer-standalone`, new in 19, flagged all 507 components
  the migrations marked `standalone: false` (57 projects). Nx's migration meant to switch it off ran and
  changed no file, so it is off in each Angular project's `.eslintrc.json`. Four test-only host components
  declared in spec files needed `standalone: false` too.
- **Steps 8 and later ran in a Docker volume** ([#1402](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1402)): the full check took 9 minutes
  cold and 6 with the cache, against 77 to 109 minutes for 16 to 18.

**The esbuild `application` builder** ([#1403](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1403)), between 19 and 20. Not a version step, but
it changes the steps after it: from Angular 20 on, the Angular apps build with esbuild and serve with
Vite, so Angular's migrations for the `application` builder apply to them.
- `nx g @nx/angular:convert-to-application-executor` converts all 11 apps; committed unedited, then fixed.
- **Keep `outputPath.browser` at `""`.** The builder otherwise writes to `dist/apps/<app>/browser/`,
  and the Azure DevOps releases copy `dist/apps/<app>` and run
  `dist/apps/<app>/assets/powershell/iis_site_rewrite.ps1` from it.
- **Do not take the converter's `esModuleInterop`.** It fails the browser builds on namespace imports
  in NestJS libraries they type-check, and those imports are right for the NestJS apps. The one browser
  import it exposed, `clipboard`, now reads the class from `default` or from the module itself.
- **Root-relative Sass imports** (`@import 'libs/sass/mixins'`, 157 files) need
  `stylePreprocessorOptions.includePaths: ["."]` in each app.
- **A clean build is not proof.** Every check passed while AggieMap threw "Class extends value
  undefined" on every page: an import cycle (the event popups' base class, the settings service, the
  event definitions, the popups) that webpack evaluated in a working order and esbuild did not. Load
  the app.

**Angular 20**
- **The whole step ran in a Docker volume** ([#1402](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1402)), migrations included: about an hour
  of wall clock from fresh install to a passing full check, against 5 to 6 hours for 16 to 18.
- `@angular/cli` pin left behind, as always. `ng2-dragula` 6.0.0 supports Angular below 20 only; 7.0.0
  (npm tag `next`) supports 20.
- **Nx 21 brings `@nestjs/schematics` 11, which needs Prettier 3.** Prettier 2.8.8 to 3.9.9 went first
  as its own pull request ([#1448](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1448)), reformatting the 160 files Prettier 3 formats
  differently.
- The migrations' own install left the lock out of step again; `scripts/check-in-volume.sh` refused it
  before any task ran, and it was resynced.
- **`control-flow-migration`** rewrote templates from `*ngIf`/`*ngFor` to `@if`/`@for`. It skipped one
  template with a duplicate `ng-template` name (GIS Day's event detail), and turned GIS Day's
  initial survey's `*ngIf=""` (never rendered) into `@if ()`, which does not compile; now `@if (false)`.
- **Four breaks, 71 tasks:** `@angular-eslint/prefer-inject` (1,152 errors in 65 projects, now off, as
  `prefer-standalone` was for 19); `TestBed.get` removed, four specs missed by its migration; two
  template-scanning tests (#1003, #1251) that could not see gates inside `@if` blocks, now read through
  a shared `templateGates()`; and the GIS Day survey above.

**Angular 21**
- **`nx migrate` set the `@angular/cli` pin itself**, for the first time. The install still needed 441
  stale lock entries cleared, **Cypress 6.9.1 to 15.21.1** (`@nx/cypress` 22 needs 13 to 15; only the
  excluded `*-e2e` projects use it), and an npm `overrides` entry letting **`ng2-dragula` 7.0.0**, whose
  newest release stops at Angular 20, take Angular 21. It goes with CPA ([#1458](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1458)).
- **Nx 22 moved its CLI** from `node_modules/nx/bin/nx.js` to `node_modules/nx/dist/bin/nx.js`. The setup
  docs name the new path; `scripts/check-in-volume.sh` falls back to the old one for older branches.
- **Jest 30 and jest-preset-angular 16 (33 projects):** the setup migration added `setupZoneTestEnv()`
  ahead of each project's own `initTestEnvironment`, and a second platform fails with `NG0400`. All 82
  `test-setup.ts` files are now the one call, with the same teardown option.
- **Jest 30 cannot resolve `lightgallery/angular/13`**, a package nested inside `lightgallery`, and Nx's
  resolver falls back to TypeScript's, which returns the `.d.ts`. The module was `undefined` and every
  NgModule importing it failed with "reading 'ngModule'". A `moduleNameMapper` in `jest.preset.js` points
  at the real file. Found by having Angular name the module with an undefined import.
- **Host bindings are type-checked:** seven `@HostListener('...', ['$event'])` on handlers with no
  parameter, and ten `private` handlers the binding could not call (now `protected`).
- **The Angular apps' tsconfigs moved to `module: preserve`**, under which a namespace import of a
  CommonJS package is not callable. Angular apps type-check four Nest files through barrels they import
  for types, so those now use default imports (which Nest's webpack builds also accept); the clipboard
  directive uses `import X = require()`, and its default-or-namespace workaround is gone.
- **`@angular-eslint/template/prefer-control-flow`** came on with angular-eslint 21, flagging the 54
  `*ngIf`/`*ngFor` the control-flow migration left. Off in each project, as `prefer-inject` was for 20.

## Forecast for the rest

**Fixed cost per version, from 16 to 18:** steps 1, 2, 4, 5 and 7 together about 30 minutes; code
migrations about 1.5 hours; the full check about 1.5 hours. **About 3.5 hours before anything breaks.**

**Variable cost:** install fixes 10 to 25 minutes; new failures 30 to 90 minutes; CI-only fixes 40 to
60 minutes. **About 1.5 to 3 hours.**

**So each version is about 5 to 6.5 hours of machine time**, plus about an hour for the dev build and
suite.

**Revised after Angular 19 (4 October 2026).** Those figures were measured on the bind-mounted setup,
which read every file through Docker's mount of the Windows checkout and inflated steps 1, 4, 6 and 8.
In a Docker volume ([#1402](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1402)) the full check took 9 minutes instead of 77 to 109, and
`npm ci` about 2 minutes. Running the migrations there too, **expect about 2 to 3 hours per version**,
most of it step 9. Angular 20 is the first step run entirely in the new setup; check this against it.

**Checked against Angular 20 (5 October 2026): about 1 hour**, Prettier included, against the 2 to 3
hours forecast. The machine time was under 20 minutes - installs about a minute each, migrations 9
minutes, the full check 4 to 6 - and most of the hour was reading failures and writing fixes. **Expect
about 1 to 1.5 hours per remaining version**, plus the dev build and suite.

**Checked against Angular 21 (5 October 2026): about 1.5 hours**, inside that range. The machine time
was the migrations, 40 minutes because a full smoke run shared the machine (Angular 20's took 9), and
the full check, 3 to 7 minutes a run. Most of the rest was diagnosing two Jest 30 changes.

| Next step | Forecast | Known before starting |
| --- | --- | --- | --- | --- | --- |
| Angular 19 | 5 to 6.5 h | Node 20.18.1 is enough |
| **Node 20.18.1 to 22** | to estimate | **Required before Angular 20:** Angular 20 and 21 need Node 20.19 or later, Angular 22 needs Node 22.22 or later. Node 22 covers all three. It changes the Docker images, CI, the Azure pipeline and the setup docs, and needs every project built and tested under it |
| Angular 20 | 5 to 6.5 h | after Node 22 |
| Angular 21 | done, ~1.5 h | see above |
| Angular 22 | 1 to 2 h, plus the dev build and suite | needs Node 22.22 or later (we run 22.23.3), Nx 23 and **TypeScript 6**, where `moduleResolution: node` is an error, so every tsconfig still on it moves to `bundler`. Components become **OnPush by default**; the migration should mark existing ones Eager, and any it misses would stop updating. `ComponentFactoryResolver` is removed (3 files use it). The router's `paramsInheritanceStrategy` becomes `'always'`, and `HttpClient` uses `fetch` by default |
| `esri-loader` to `@arcgis/core` | not comparable | 134 files of code, not a version step; estimate it separately |

**Angular 19 to 22: about 20 to 26 hours of machine time, plus the Node upgrade**, if the variable cost
stays in the range seen so far. Recheck after each step: if a version's actual time falls outside the
range, say why here.
